import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

/**
 * Edge-safe auth config - NO MongoDB/Node.js modules.
 * Used by middleware which runs in Edge Runtime.
 */
export const { auth } = NextAuth({
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
        session.user.subscription = { tier: 'free' as const };
      }
      return session;
    },
  },
});
