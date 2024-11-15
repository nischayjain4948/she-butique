// hooks/useAdminAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

export default function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const session = await getSession();
        if (!session?.user?.role || session?.user?.role !== 'admin') {
          setError('Access Denied: You do not have the required permissions.');
          router.replace('/'); // Redirect to homepage if not admin
        }
      } catch (err) {
        setError('An error occurred while verifying your role.');
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [router]);

  return { loading, error };
}
