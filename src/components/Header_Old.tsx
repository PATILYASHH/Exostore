import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, Settings, LogOut, X, Home, Grid3X3, Gamepad2, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const categories = [
    { id: 'all', name: 'For you', icon: Home },
    { id: 'games', name: 'Games', icon: Gamepad2 },
    { id: 'apps', name: 'Apps', icon: Grid3X3 },
    { id: 'websites', name: 'Websites', icon: Monitor }
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">YashStore</h1>
              <h1 className="text-lg font-bold text-gray-900 sm:hidden">Store</h1>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search games, apps, and websites"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-sm ${
                    isSearchFocused ? 'shadow-lg' : 'shadow-sm'
                  }`}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 mr-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Menu & Mobile Controls */}
            <div className="flex items-center space-x-2">
              {/* Mobile Search Button */}
              <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user.email?.split('@')[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        {isAdmin && (
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-xs text-green-600 font-medium">Administrator</p>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            onShowAdmin();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search games, apps, and websites"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-lg z-40 animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;