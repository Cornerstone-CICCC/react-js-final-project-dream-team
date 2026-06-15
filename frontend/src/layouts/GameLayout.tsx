import { Outlet } from 'react-router';
import NavBar from '../components/NavBar';

const GameLayout = () => {
  return (
    <div className="h-screen bg-[#F9F9F9] flex flex-col overflow-hidden">
      <NavBar />
      <main className="flex-1 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default GameLayout;
