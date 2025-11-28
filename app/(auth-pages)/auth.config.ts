import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareHash, getUserByEmail } from "../lib/users";
import Google from "next-auth/providers/google";

export default {
  providers: [
    Credentials({
      name: "NeuroSync",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const User = await getUserByEmail(credentials.email as string);
          if (!User || !User.password) return null;

          const isValidUserCredentials = await compareHash(
            User.password,
            credentials.password as string
          );

          return isValidUserCredentials ? User : null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
} satisfies NextAuthConfig;
