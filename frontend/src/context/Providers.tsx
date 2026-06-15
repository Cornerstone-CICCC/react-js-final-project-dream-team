import type { ReactNode } from 'react';
import GameContextProvider from './game/GameContextProvider';
import UserContextProvider from './user/UserContextProvider';
import { Toaster } from 'react-hot-toast';

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <UserContextProvider>
      <GameContextProvider>
        {children}
        <Toaster />
      </GameContextProvider>
    </UserContextProvider>
  );
};

export default Providers;
