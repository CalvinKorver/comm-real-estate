import NextAuth from 'next-auth';
import { SQLiteAdapter } from '@next-auth/sqlite-adapter';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '@/lib/db';

// Initialize the SQLite adapter with our database connection
const adapter = SQLiteAdapter(db);

// Configure authentication options
export const authOptions = {
  adapter: adapter,
  providers: [
    // GitHub authentication
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Google authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Email/Password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Here you would typically:
        // 1. Verify the credentials against your database
        // 2. Return the user object if valid, null if invalid

        // Example implementation (replace with actual database logic):
        if (credentials.email === "user@example.com" && credentials.password === "password") {
          return { id: "1", name: "Test User", email: "user@example.com" };
        }

        // If credentials are invalid, return null
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for session handling
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user data to the JWT token if available
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID to the session
      if (token) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    signOut: '/auth/signout', // Custom sign-out page
    error: '/auth/error', // Error page
  },
};

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export the handler
export { handler as GET, handler as POST };