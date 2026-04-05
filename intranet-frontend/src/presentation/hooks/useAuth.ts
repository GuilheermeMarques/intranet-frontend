import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as User | undefined;

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          router.push('/home');
        }

        return result;
      } catch (error) {
        console.error('Erro no login:', error);
        throw error;
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/login');
  }, [router]);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const hasRole = useCallback(
    (requiredRole: string | string[]) => {
      if (!user?.role) return false;

      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
      }

      return user.role === requiredRole;
    },
    [user?.role],
  );

  const isAdmin = hasRole('admin');
  const isUser = hasRole('user');

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    isAdmin,
    isUser,
  };
};
