'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useUserAuthorization() {
  const { data: session, status } = useSession();
  
  const isAuthorized = useMemo(() => {
    if (status === 'loading' || !session?.user?.email) {
      return false;
    }
    
    // Get authorized users from environment (if exposed as public env var)
    const authorizedUsersString = process.env.NEXT_PUBLIC_AUTHORIZED_USERS;
    if (!authorizedUsersString) {
      return false;
    }
    
    const authorizedUsers = authorizedUsersString.split(',').map(email => email.trim());
    return authorizedUsers.includes(session.user.email);
  }, [session?.user?.email, status]);

  return {
    isAuthorized,
    isLoading: status === 'loading',
    user: session?.user,
  };
}