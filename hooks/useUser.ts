// hooks/useUser.ts
import { useState, useEffect } from 'react';

interface User {
  username: string;
  userId: number;
  companyId: number;
  email: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me');
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          setError('No autenticado');
          setUser(null);
        } else {
          setError('Error al obtener usuario');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Error de conexión');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}