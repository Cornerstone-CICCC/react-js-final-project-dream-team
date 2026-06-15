import { useContext } from 'react';
import { GameContext } from './GameContext';

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw Error('useGame must be used inside GameContextProvider.');
  return context;
};
