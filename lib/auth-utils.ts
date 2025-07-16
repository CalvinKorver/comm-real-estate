import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/shared/auth';

export async function isUserAuthorized(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return false;
    }
    
    const authorizedUsers = process.env.AUTHORIZED_USERS?.split(',').map(email => email.trim()) || [];
    return authorizedUsers.includes(session.user.email);
  } catch (error) {
    console.error('Error checking user authorization:', error);
    return false;
  }
}

export async function requireAuthorization() {
  const isAuthorized = await isUserAuthorized();
  
  if (!isAuthorized) {
    throw new Error('Unauthorized: User not in whitelist');
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized: User not in whitelist' }),
    { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}