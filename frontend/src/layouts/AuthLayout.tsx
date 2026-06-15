import { Outlet } from 'react-router';
import Footer from '../components/Footer';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
