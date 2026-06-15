import { useState, type ReactNode, useEffect } from 'react';
import { UserContext } from './UserContext';
import type { User } from './UserContext';

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
        });
      }
    };
    fetchSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
