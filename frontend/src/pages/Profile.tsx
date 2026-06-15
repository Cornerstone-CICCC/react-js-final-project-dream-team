import { useState } from 'react';
import { useUser } from '../context/user/UseUser';
import toast from 'react-hot-toast';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, setUser } = useUser();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(user?.username ?? '');

  const handleSave = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || 'Could not update username');
        return;
      }

      setUser((prev) => (prev ? { ...prev, username: newUsername } : prev));
      toast.success('Username updated!');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong with the network.');
    }
  };

  const handleCancel = () => {
    setNewUsername(user?.username ?? '');
    setIsEditing(false);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full bg-[#E2E2E2] flex items-center justify-center mb-4">
          <span className="font-caslon text-4xl font-bold text-[#444748]">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-xs font-bold tracking-widest text-[#ADADAD]">
          YOUR PROFILE
        </p>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#E2E2E2] rounded-2xl divide-y divide-[#E2E2E2]">
        {/* Username */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex-1">
            <p className="text-xs font-bold tracking-widest text-[#ADADAD] mb-1">
              USERNAME
            </p>
            {isEditing ? (
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full px-3 py-1.5 bg-[#F3F3F4] rounded-lg text-sm text-[#1a1c1c] border border-transparent focus:border-[#1a1c1c] focus:outline-none transition-colors"
                autoFocus
              />
            ) : (
              <p className="text-base font-medium text-[#1a1c1c]">
                {user?.username}
              </p>
            )}
          </div>

          {/* Edit / Save / Cancel buttons */}
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="w-8 h-8 rounded-full bg-[#1a1c1c] text-white flex items-center justify-center hover:opacity-85 transition-all"
                >
                  <FiCheck size={14} />
                </button>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-full bg-[#F3F3F4] text-[#444748] flex items-center justify-center hover:bg-[#E2E2E2] transition-all"
                >
                  <FiX size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 rounded-full bg-[#F3F3F4] text-[#444748] flex items-center justify-center hover:bg-[#E2E2E2] transition-all"
              >
                <FiEdit2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="px-6 py-5">
          <p className="text-xs font-bold tracking-widest text-[#ADADAD] mb-1">
            EMAIL
          </p>
          <p className="text-base font-medium text-[#1a1c1c]">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
