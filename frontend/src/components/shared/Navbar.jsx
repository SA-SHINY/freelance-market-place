import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const clientLinks = [
    { to: '/services', label: 'Browse Services' },
    { to: '/freelancers', label: 'Hire Freelancers' },
    { to: '/jobs/post', label: 'Post a Job' },
  ];

  const freelancerLinks = [
    { to: '/jobs', label: 'Find Work' },
    { to: '/services/new', label: 'Add Service' },
    { to: '/contracts', label: 'My Contracts' },
  ];

  const guestLinks = [
    { to: '/services', label: 'Browse Services' },
    { to: '/freelancers', label: 'Hire Freelancers' },
    { to: '/jobs', label: 'Find Work' },
  ];

  const navLinks = !user ? guestLinks : user.role === 'client' ? clientLinks : freelancerLinks;

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-peach-400 to-peach-600 flex items-center justify-center">
            <span className="text-white font-bold text-[10px] tracking-tight">SB</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="text-peach-600">Skill</span><span className="text-sand-900">Bridge</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-peach-100 text-peach-700'
                  : 'text-ink-500 hover:text-ink-900 hover:bg-ink-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  className="relative p-2 rounded-lg hover:bg-ink-50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="text-ink-500" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-peach-400 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-ink-100 rounded-xl shadow-lift overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
                      <span className="font-semibold text-sm text-ink-900">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-peach-400 font-medium hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-ink-300 px-4 py-6 text-center">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <button
                            key={n._id}
                            onClick={() => { markAsRead(n._id); if (n.link) navigate(n.link); setNotifOpen(false); }}
                            className={`w-full text-left px-4 py-3 border-b border-ink-50 hover:bg-ink-50 transition-colors ${!n.isRead ? 'bg-peach-50' : ''}`}
                          >
                            <p className="text-sm font-medium text-ink-900">{n.title}</p>
                            <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-ink-300 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-peach-500/50">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-peach-500 to-peach-700 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-ink-900 leading-none">{user.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-peach-400 capitalize mt-0.5">{user.role}</p>
                  </div>
                  <ChevronDown size={13} className="text-ink-300" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-ink-100 rounded-xl overflow-hidden py-1.5 z-50 shadow-lift">
                    <div className="px-4 py-2 border-b border-ink-100 mb-1">
                      <p className="text-xs font-semibold text-ink-900">{user.name}</p>
                      <p className="text-xs text-ink-400">{user.email}</p>
                    </div>
                    {[
                      { to: '/dashboard', label: 'Dashboard' },
                      { to: `/profile/${user._id}`, label: 'My Profile' },
                      { to: '/contracts', label: 'Contracts' },
                      { to: '/transactions', label: 'Transactions' },
                      { to: '/settings', label: 'Settings' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors">
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-ink-100 my-1.5" />
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-blush-600 hover:bg-blush-50 transition-colors">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="px-4 py-2 bg-peach-500 hover:bg-peach-400 text-white text-sm font-semibold rounded-lg transition-colors">
                Get started
              </Link>
            </div>
          )}

          <button className="md:hidden p-2 text-ink-600 hover:text-ink-900" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-paper border-t border-ink-100 px-5 py-4 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className="block px-4 py-2.5 text-sm font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg transition-colors">
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="border-t border-ink-100 my-2" />
              <Link to="/dashboard" className="block px-4 py-2.5 text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg">Dashboard</Link>
              <Link to={`/profile/${user._id}`} className="block px-4 py-2.5 text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg">My Profile</Link>
              <Link to="/settings" className="block px-4 py-2.5 text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg">Settings</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-blush-600 hover:bg-blush-50 rounded-lg">Sign out</button>
            </>
          ) : (
            <div className="flex gap-3 pt-3">
              <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-ink-600 border border-ink-200 rounded-lg hover:bg-ink-50">Log in</Link>
              <Link to="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-peach-500 text-white rounded-lg hover:bg-peach-400">Get started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
