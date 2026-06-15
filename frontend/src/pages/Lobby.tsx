import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { HiUsers } from 'react-icons/hi2';
import { FaPlus } from 'react-icons/fa6';
import { IoClose, IoSearchOutline } from 'react-icons/io5';

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'in-progress';
}

const Lobby = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tableName, setTableName] = useState<string>('');

  const [rooms] = useState<Room[]>([
    {
      id: '14',
      name: 'Table #14',
      players: 3,
      maxPlayers: 4,
      status: 'waiting',
    },
    {
      id: '22',
      name: 'Table #22',
      players: 1,
      maxPlayers: 4,
      status: 'waiting',
    },
    {
      id: '31',
      name: 'Table #31',
      players: 2,
      maxPlayers: 4,
      status: 'waiting',
    },
    {
      id: '08',
      name: 'Table #08',
      players: 3,
      maxPlayers: 4,
      status: 'waiting',
    },
  ]);

  const filteredRooms = rooms.filter((room) =>
    room.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  const handleJoin = async (roomId: string) => {
    try {
      const res = await fetch('', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || 'Could not join table');
        return;
      }

      navigate(`/game/${roomId}`);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong with the Network');
    }
  };

  const handleCreate = async () => {
    if (!tableName.trim()) {
      toast.error('Please enter a table name.');
      return;
    }

    try {
      const res = await fetch('', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || 'Could not create table');
        return;
      }

      const data = await res.json();
      setShowModal(false);
      setTableName('');
      navigate(`/game/${data.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong with the Network');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTableName('');
  };

  return (
    <div className="max-w-300 mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1c1c]">Find Your Table</h1>
          <p className="text-base text-[#747878] mt-2">
            Join an active session or create a private room for friends.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1a1c1c] text-white text-sm font-bold rounded-full hover:opacity-85 active:scale-[0.98] transition-all shrink-0"
        >
          <FaPlus /> Create New Table
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <IoSearchOutline
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADADAD]"
          size={18}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by table name..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E2E2] rounded-full text-sm text-[#1a1c1c] placeholder:text-[#ADADAD] focus:border-[#1a1c1c] focus:outline-none transition-colors"
        />
      </div>

      {/* Room cards grid */}
      {filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-19 bg-white border border-[#E2E2E2] rounded-2xl flex flex-col items-center justify-center shadow-sm mb-6">
            <span className="text-2xl font-bold text-[#DADADA]">?</span>
          </div>
          <h3 className="text-xl font-semibold text-[#1a1c1c] mb-2">
            {search ? `No tables matching "${search}"` : 'No tables available.'}
          </h3>
          <p className="text-sm text-[#747878] mb-6">
            {search
              ? 'Try a different name.'
              : 'Be the first to create a table!'}
          </p>
          {!search && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-[#1a1c1c] text-white text-sm font-bold rounded-full hover:opacity-85 transition-all"
            >
              + Create New Table
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const isFull = room.players >= room.maxPlayers;

            return (
              <div
                key={room.id}
                className="bg-white border border-[#E2E2E2] rounded-2xl p-6 flex flex-col gap-5 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1a1c1c]">
                    {room.name}
                  </h3>

                  {/* Player count badge */}
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F3F3F4] rounded-full text-xs font-bold text-[#444748]">
                    <HiUsers size={14} />
                    {room.players}/{room.maxPlayers}
                  </span>
                </div>

                {/* Players avatars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: room.players }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-[#E2E2E2] border-2 border-white -ml-1 first:ml-0 flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-[#747878]">
                        {i + 1}
                      </span>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: room.maxPlayers - room.players }).map(
                    (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-8 h-8 rounded-full border-2 border-dashed border-[#E2E2E2] -ml-1 first:ml-0"
                      />
                    ),
                  )}
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoin(room.id)}
                  disabled={isFull}
                  className={`w-full py-3 rounded-full text-sm font-bold transition-all ${isFull ? 'bg-[#F3F3F4] text-[#ADADAD] cursor-not-allowed' : 'bg-[#1a1c1c] text-white hover:opacity-85 active:scale-[0.98]'}`}
                >
                  {isFull ? 'Table Full' : 'Join Table'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1a1c1c]">
                Create New Table
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-[#ADADAD] hover:text-[#1a1c1c] transition-colors"
              >
                <IoClose size={22} />
              </button>
            </div>

            {/* Table name input */}
            <div className="mb-6">
              <label className="block text-xs font-bold tracking-widest text-[#444748] mb-2">
                TABLE NAME
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. Dream Team Table"
                className="w-full px-4 py-3.5 bg-[#F3F3F4] rounded-xl text-base text-[#1a1c1c] placeholder:text-[#ADADAD] border border-transparent focus:border-[#1a1c1c] focus:outline-none transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 border-2 border-[#E2E2E2] text-[#444748] text-sm font-bold rounded-full hover:border-[#1a1c1c] transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="flex-1 py-3 bg-[#1a1c1c] text-white text-sm font-bold rounded-full hover:opacity-85 active:scale-[0.98] transition-all"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
