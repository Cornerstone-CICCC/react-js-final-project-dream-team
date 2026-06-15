const Sidebar = () => {
  return (
    <aside className="w-60 border-r border-[#E2E2E2] bg-[#F9F9F9] flex flex-col p-4 gap-4 shrink-0">
      <div>
        <p className="text-base font-semibold text-[#1a1c1c]">Game Session</p>
        <p className="text-xs text-[#747878]">Active Table</p>
      </div>

      <button className="w-full py-2.5 bg-[#1a1c1c] text-white font-bold text-sm rounded-full hover:opacity-85 transition-all">
        View Rules
      </button>
      <hr className="border-[#E2E2E2]" />

      <nav className="flex flex-col gap-1">
        {['Table', 'Game Log', 'Settings'].map((item) => (
          <button
            key={item}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#444748] hover:bg-[#EEEEEE] transition-colors text-left"
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
