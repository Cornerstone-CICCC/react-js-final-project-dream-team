import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

const Signup = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    const strength = zxcvbn(password).score;
    if (strength < 2) {
      toast.error('Please choose a stronger password!');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      }); //FALTA EL PORT

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || 'Signup failed!');
        return;
      }
      toast.success('Account created! Welcome to the table.');
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
        <span className="text-xl font-bold text-[#888780]">1</span>
        <span className="w-1.5 h-1.5 rounded-full mt-1" />
      </div>

      <div className="absolute top-14 right-[30%] w-16 h-19 bg-white border border-[#E0E0E0] rounded-2xl flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] opacity-50 pointer-events-none select-none rotate-12">
        <span className="text-xl font-bold text-[#1D9E75]">4</span>
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
              Create Account
            </h2>
            <p className="text-sm text-[#747878] mt-1">
              Join the table. Play your first game.
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#F3F3F4] rounded-full p-1 mb-7">
          <Link
            to="/auth/login"
            className="flex-1 text-center py-2.5 rounded-full text-sm font-bold text-[#747878] hover:text-[#1a1c1c] transition-colors"
          >
            Login
          </Link>
          <span className="flex-1 text-center py-2.5 rounded-full bg-[#1a1c1c] text-white text-sm font-bold">
            Sign Up
          </span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#444748] mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jane_doe"
              className="w-full px-4 py-3.5 bg-[#F3F3F4] rounded-xl text-base text-[#1a1c1c] placeholder:text-[#ADADAD] border border-transparent focus:border-[#1a1c1c] focus:outline-none transition-colors"
            />
          </div>

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

          <div>
            <label className="block text-xs font-bold tracking-widest text-[#444748] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-3.5 bg-[#F3F3F4] rounded-xl text-base text-[#1a1c1c] placeholder:text-[#ADADAD] border border-transparent focus:border-[#1a1c1c] focus:outline-none transition-colors"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-[#E24B4A] mt-1">
                Passwords don't match
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#1a1c1c] text-white text-sm font-bold tracking-widest rounded-full hover:opacity-85 active:scale-[0.98] transition-all mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-5">
          <p className="text-sm text-[#747878]">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-bold text-[#1a1c1c] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Signup;
