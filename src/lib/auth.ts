import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

const adapter = process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || '',
      clientSecret: process.env.AUTH_GITHUB_SECRET || '',
    }),
  ],
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
            };
            session.user.subscription = {
              tier: (sub?.tier as 'free' | 'premium') || 'free',
              paypalSubscriptionId: sub?.paypalSubscriptionId,
              paypalPayerId: sub?.paypalPayerId,
              currentPeriodStart: sub?.currentPeriodStart?.toISOString(),
              currentPeriodEnd: sub?.currentPeriodEnd?.toISOString(),
              cancelledAt: sub?.cancelledAt?.toISOString(),
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
        await User.findByIdAndUpdate(user.id, {
          $setOnInsert: { subscription: { tier: 'free' } },
        });
      } catch (error) {
        console.error('Error setting default subscription:', error);
      }
    },
  },
});
