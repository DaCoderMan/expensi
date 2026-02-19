import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';
import { verifyPassword } from '@/lib/password';

const isDev = process.env.NODE_ENV === 'development' || process.env.AUTH_DEV_CREDENTIALS === 'true';

const adapter = process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined;

const providers = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID || '',
    clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
  }),
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID || '',
    clientSecret: process.env.AUTH_GITHUB_SECRET || '',
  }),
  // Real email+password login backed by MongoDB
  Credentials({
    id: 'email-login',
    name: 'Email login',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      await connectDB();
      const email = String(credentials.email).toLowerCase().trim();

      const user = await User.findOne({ email }).lean<{ _id: unknown; email?: string; name?: string; passwordHash?: string | null }>();
      if (!user || !user.passwordHash) {
        return null;
      }

      const ok = verifyPassword(String(credentials.password), user.passwordHash);
      if (!ok) return null;

      return {
        id: String(user._id),
        email: user.email ?? email,
        name: user.name ?? email,
      };
    },
  }),
];

if (isDev) {
  const devEmail = process.env.DEV_EMAIL || 'dev@localhost';
  const devPassword = process.env.DEV_PASSWORD || '';

  providers.push(
    Credentials({
      id: 'credentials',
      name: 'Dev login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !devPassword) return null;
        if (credentials.password !== devPassword) return null;
        const email = String(credentials.email).toLowerCase();
        if (email !== devEmail.toLowerCase()) return null;

        await connectDB();
        let user = await User.findOne({ email }).lean<{ _id: unknown; email?: string; name?: string }>();
        if (!user) {
          const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
          const created = await User.create({
            email,
            name: 'Dev User',
            subscription: { tier: 'free', trialEndsAt },
          });
          user = created.toObject() as { _id: unknown; email?: string; name?: string };
        }
        return {
          id: String(user._id),
          email: user.email ?? email,
          name: user.name ?? 'Dev User',
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers,
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || 'dev-secret-change-in-production',
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;

        // Fetch subscription info from DB
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).lean();
          if (dbUser && typeof dbUser === 'object' && 'subscription' in dbUser) {
            const sub = dbUser.subscription as {
              tier?: string;
              paypalSubscriptionId?: string;
              paypalPayerId?: string;
              currentPeriodStart?: Date;
              currentPeriodEnd?: Date;
              cancelledAt?: Date;
              trialEndsAt?: Date;
            };
            session.user.subscription = {
              tier: (sub?.tier as 'free' | 'premium') || 'free',
              paypalSubscriptionId: sub?.paypalSubscriptionId,
              paypalPayerId: sub?.paypalPayerId,
              currentPeriodStart: sub?.currentPeriodStart?.toISOString(),
              currentPeriodEnd: sub?.currentPeriodEnd?.toISOString(),
              cancelledAt: sub?.cancelledAt?.toISOString(),
              trialEndsAt: sub?.trialEndsAt?.toISOString(),
            };
          } else {
            session.user.subscription = { tier: 'free' };
          }
        } catch {
          session.user.subscription = { tier: 'free' };
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        await connectDB();
        const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        await User.findByIdAndUpdate(user.id, {
          $set: {
            subscription: {
              tier: 'free',
              trialEndsAt,
            },
          },
        });

        // Fire-and-forget welcome email via Resend
        if (user.email) {
          // Do not await; email failures should not block user creation
          void sendWelcomeEmail(user.email, user.name ?? undefined);
        }
      } catch (error) {
        console.error('Error setting default subscription:', error);
      }
    },
  },
});
