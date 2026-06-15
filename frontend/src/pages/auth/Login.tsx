import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useUser } from '../../context/user/UseUser';

const Login = () => {
  const { setUser } = useUser();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
        credentials: 'include',
      }); //FALTA EL PORT

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || 'Login failed!');
        return;
      }

      const data = await res.json();
      setUser({ id: data.user.id, username: data.user.username, email: data.user.email });
      navigate('/lobby');
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong with the Network.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-[#F9F9F9]">
      {/* Decorative tiles */}
      <div className="absolute top-14 left-[30%] w-16 h-19 bg-white border border-[#E0E0E0] rounded-2xl flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] opacity-50 pointer-events-none select-none -rotate-12">
        <span className="text-xl font-bold text-[#2563EB]">9</span>
        <span className="w-1.5 h-1.5 rounded-full mt-1" />
      </div>

      <div className="absolute top-14 right-[30%] w-16 h-19 bg-white border border-[#E0E0E0] rounded-2xl flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] opacity-50 pointer-events-none select-none rotate-12">
        <span className="text-xl font-bold text-[#ea4d1c]">5</span>
        <span className="w-1.5 h-1.5 rounded-full mt-1" />
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#1a1c1c]">
          RUMMY
        </h1>
        <p className="text-base text-[#747878] mt-1">
          The physical joy of mental stimulation.
        </p>
      </div>

      {/* Card */}
      <div className="w-[50%] max-w-420 bg-white rounded-3xl p-9 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        {/* Card header */}
        <div className="flex justify-between items-start mb-7">
          <div>
            <h2 className="text-2xl font-semibold text-[#1a1c1c]">
              Welcome Back
            </h2>
            <p className="text-sm text-[#747878] mt-1">
              Arrange your thoughts, win the game.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#F3F3F4] rounded-full p-1 mb-7">
          <span className="flex-1 text-center py-2.5 rounded-full bg-[#1a1c1c] text-white text-sm font-bold">
            Login
          </span>
          <Link
            to="/auth/signup"
            className="flex-1 text-center py-2.5 rounded-full text-sm font-bold text-[#747878] hover:text-[#1a1c1c] transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#444748] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="janedoe@mail.com"
              className="w-full px-4 py-3.5 bg-[#F3F3F4] rounded-xl text-base text-[#1a1c1c] placeholder:text-[#ADADAD] border border-transparent focus:border-[#1a1c1c] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-[#444748] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-3.5 bg-[#F3F3F4] rounded-xl text-base text-[#1a1c1c] placeholder:text-[#ADADAD] border border-transparent focus:border-[#1a1c1c] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#1a1c1c] text-white text-sm font-bold tracking-widest rounded-full hover:opacity-85 active:scale-[0.98] transition-all mt-2"
          >
            Play Now!
          </button>
        </form>

        <div className="flex justify-between mt-5">
          <button className="text-sm text-[#444748] hover:underline">
            Forgot Password?
          </button>
          <Link
            to="/auth/signup"
            className="text-sm font-bold text-[#1a1c1c] hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
