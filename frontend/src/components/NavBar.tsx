import { Link, useNavigate } from 'react-router';
import { useUser } from '../context/user/UseUser';
import { GiExitDoor } from 'react-icons/gi';
import { FaCircleUser } from 'react-icons/fa6';

const NavBar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <header className="w-full border-b border-[#E2E2E2] bg-[#F9F9F9]">
      <div className="max-w-1200 mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to={'/lobby'}
          className="text-xl font-bold text-[#1a1c1c] tracking-tight"
        >
          RUMMY
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to={'/lobby'}
            className="text-sm font-medium text-[#444748] hover:text-[#1a1c1c] transition-colors underline underline-offset-4"
          >
            How To Play
          </Link>

          <button
            onClick={() => navigate('/profile')}
            title={user?.username}
            className="text-[#444748] hover:text-[#1a1c1c] transition-colors text-2xl"
          >
            <FaCircleUser />
          </button>

          <button
            onClick={handleLogout}
            className="text-[#444748] hover:text-[#1a1c1c] transition-colors text-2xl"
          >
            <GiExitDoor />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
