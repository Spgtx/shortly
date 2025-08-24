import { NextAuth, DefaultSession, User as DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      
    }
     & DefaultSession['user'];
  }

  interface User {
    id: string;
  }
}
