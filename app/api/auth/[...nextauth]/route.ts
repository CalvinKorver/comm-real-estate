// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/shared/auth';

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export the handler
export { handler as GET, handler as POST };