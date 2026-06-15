import { useNavigate } from 'react-router';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-24 bg-white border-2 border-[#E0E0E0] rounded-2xl flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-8 -rotate-6">
        <span className="font-caslon text-3xl font-bold text-[#DADADA]">?</span>
        <span className="w-2 h-2 rounded-full bg-[#DADADA] mt-1" />
      </div>

      <h1 className="text-6xl font-bold text-[#1a1c1c] mb-2">404</h1>
      <p className="text-xl text-[#444748] mb-2">Table Not Found.</p>
      <p className="text-ms text-[#747878] mb-8">
        This page doesn't exist or was moved.
      </p>

      <button
        onClick={() => navigate('/lobby')}
        className="px-8 py-3 bg-[#1a1c1c] text-white text-sm font-bold rounded-full hover:opacity-85 active:scale-[0.98] transition-all"
      >
        Back to Lobby
      </button>
    </div>
  );
};

export default NotFound;
