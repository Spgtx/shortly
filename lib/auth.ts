import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { env } from './env';
import { users } from './schema';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
  async jwt({ token, user }) {
    if (user?.id) {
      token.id = user.id;
    } else if (!token.id && token.email) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.email, token.email)
      });
      if (dbUser) token.id = dbUser.id;
    }
    return token;
  },

  async session({ session, token }) {
    const userId = token?.id;
    return {
      ...session,
      user: {
        ...session.user,
        id: token?.id ?? null,
      },
    };
  },
},
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
};