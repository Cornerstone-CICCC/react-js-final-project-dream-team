import type { ReactNode } from 'react';
import UserContextProvider from './user/UserContextProvider';
import { Toaster } from 'react-hot-toast';

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <UserContextProvider>
      {children}
      <Toaster />
    </UserContextProvider>
  );
};

export default Providers;
