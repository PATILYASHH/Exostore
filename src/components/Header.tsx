import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings, LogOut, Home, Grid3X3, Gamepad2, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import navicon from '../icons/navicon.png';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  user: any;
  isAdmin: boolean;
  onShowAdmin: () => void;
  onShowAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearchChange, 
  activeCategory, 
  onCategoryChange, 
  user, 
  isAdmin, 
  onShowAdmin, 
  onShowAuth 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', name: 'For You', icon: Home },
    { id: 'games', name: 'Games', icon: Gamepad2 },
    { id: 'apps', name: 'Apps', icon: Grid3X3 },
    { id: 'websites', name: 'Websites', icon: Monitor },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Header - Hidden on mobile, visible on desktop */}
      <header className="hidden lg:block bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src={navicon} 
                  alt="Exostore Logo" 
                  className="w-10 h-10 object-contain rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Exostore</h1>
                <p className="text-xs text-gray-500">Digital Marketplace</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search games, apps, websites..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">Signed in</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            console.log('Desktop Admin panel button clicked!', { isAdmin, user: user?.email });
                            onShowAdmin();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      {!isAdmin && user && (
                        <button
                          onClick={() => {
                            console.log('Debug: Force opening admin panel for non-admin user');
                            // Set the window flag for force-open
                            (window as any).showAdminPanelForceOpen = true;
                            onShowAdmin();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 flex items-center space-x-2 border-t border-gray-100"
                        >
                          <Settings className="w-4 h-4" />
                          <span>🔧 Debug Admin Panel</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Visible on mobile, hidden on desktop */}
      <header className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                <img 
                  src={navicon} 
                  alt="Exostore Logo" 
                  className="w-8 h-8 object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Exostore</h1>
              </div>
            </div>

            {/* User Menu for Mobile */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500">Signed in</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            console.log('Mobile Admin panel button clicked!', { isAdmin, user: user?.email });
                            onShowAdmin();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      {!isAdmin && user && (
                        <button
                          onClick={() => {
                            console.log('Debug: Force opening admin panel for non-admin user (mobile)');
                            // Set the window flag for force-open
                            (window as any).showAdminPanelForceOpen = true;
                            onShowAdmin();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 flex items-center space-x-2 border-t border-gray-100"
                        >
                          <Settings className="w-4 h-4" />
                          <span>🔧 Debug Admin Panel</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search apps, games, websites..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-full border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="grid grid-cols-4 h-16">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 active:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Header;
