import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Bookmark, LogOut, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ProfileDropdown = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-2 bg-brand-primary text-white rounded-xl hover:bg-orange-600 shadow-glow transition-all focus:outline-none focus:ring-2 focus:ring-brand-secondary"
        title="Profile"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-white">
              {user?.name && user.name[0] ? user.name[0].toUpperCase() : '?'}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-white" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-brand-surface rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center overflow-hidden border border-brand-primary">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-brand-primary">
                    {user?.name && user.name[0] ? user.name[0].toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-brand-text truncate max-w-[120px]">{user?.name || 'User'}</p>
                <p className="text-sm text-brand-muted truncate max-w-[120px]">{user?.email || 'No email'}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => handleNavigation(`/user/${user._id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <User className="h-5 w-5 text-brand-primary" />
              <span className="text-brand-text">My Profile</span>
            </button>

            <button
              onClick={() => handleNavigation(`/user/${user._id}/saved`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <Bookmark className="h-5 w-5 text-brand-secondary" />
              <span className="text-brand-text">Saved Articles</span>
            </button>

            <button
              onClick={() => handleNavigation(`/user/${user._id}/liked`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <Heart className="h-5 w-5 text-brand-accent" />
              <span className="text-brand-text">Liked Articles</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate(`/user/${user._id}`);
                // Store in localStorage to indicate settings tab should be active
                localStorage.setItem('activeProfileTab', 'settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <Settings className="h-5 w-5 text-blue-400" />
              <span className="text-brand-text">Settings</span>
            </button>
          </div>

          <div className="border-t border-white/10 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5 text-red-400" />
              <span className="text-red-400 font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;