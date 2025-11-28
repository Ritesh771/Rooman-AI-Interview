import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { createUser, getUserByEmail } from "@/lib/firebase-data";

// Custom adapter for Firebase
const FirebaseAdapter = {
  // In a full implementation, these would interact with Firestore
  // For now, we're using a simplified approach
  createUser: async (user: any) => {
    // This would create a user in Firestore
    return user;
  },
  getUser: async (id: string) => {
    // This would fetch a user from Firestore
    return null;
  },
  getUserByEmail: async (email: string) => {
    // This would fetch a user by email from Firestore
    return null;
  },
  getUserByAccount: async (account: any) => {
    // This would fetch a user by account from Firestore
    return null;
  },
  updateUser: async (user: any) => {
    // This would update a user in Firestore
    return user;
  },
  deleteUser: async (id: string) => {
    // This would delete a user from Firestore
  },
  linkAccount: async (account: any) => {
    // This would link an account in Firestore
  },
  unlinkAccount: async (account: any) => {
    // This would unlink an account in Firestore
  },
  createSession: async (session: any) => {
    // This would create a session in Firestore
    return session;
  },
  getSessionAndUser: async (sessionToken: string) => {
    // This would fetch a session and user from Firestore
    return null;
  },
  updateSession: async (session: any) => {
    // This would update a session in Firestore
    return session;
  },
  deleteSession: async (sessionToken: string) => {
    // This would delete a session from Firestore
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Handle OAuth sign-in (Google)
      if (account?.provider === "google" && profile) {
        try {
          // Check if user already exists
          const existingUser = await getUserByEmail(user.email!);
          
          if (!existingUser) {
            // Create new user in Firestore for OAuth
            const newUser = await createUser({
              email: user.email!,
              password: "", // OAuth users don't have passwords
              fullname: user.name || profile.name || "Anonymous User",
              image: user.image || profile.image,
            });
            // Update the user object with the correct ID
            user.id = newUser.id;
          } else {
            // Update the user object with the existing ID
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error creating OAuth user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      if (user?.email) {
        // Get the user from database to ensure we have the correct ID
        const dbUser = await getUserByEmail(user.email);
        if (dbUser) {
          token.sub = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session?.user?.email) {
        // For both OAuth and credentials, get the user by email to ensure we have the correct Firestore ID
        const dbUser = await getUserByEmail(session.user.email);
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
  },
});
