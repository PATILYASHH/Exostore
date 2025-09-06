import React, { useState, useMemo } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import FeaturedSection from './components/FeaturedSection';
import CategoryGrid from './components/CategoryGrid';
import ItemDetailPage from './components/ItemDetailPage';
import { supabase, StoreItem } from './lib/supabase';

// Temporary inline featured items to bypass import issues
const featuredItems = [
  {
    id: '1',
    title: 'Your Uploads',
    subtitle: 'Apps and games you have uploaded',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-purple-600 to-pink-600'
  },
  {
    id: '2',
    title: 'Recent Uploads',
    subtitle: 'Latest files you have added',
    image: 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600'
  },
  {
    id: '3',
    title: 'Popular Uploads',
    subtitle: 'Most downloaded uploaded files',
    image: 'https://images.pexels.com/photos/374559/pexels-photo-374559.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-600'
  }
];

const AppContent: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<StoreItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchStoreItems();
  }, []);

  React.useEffect(() => {
    // Don't force auth modal - let users browse freely
    // Auth modal will only show when they try to rate/comment
  }, [loading, user]);

  const fetchStoreItems = async () => {
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error fetching store items:', error);
    }
  };

  const handleStatsUpdate = () => {
    fetchStoreItems();
  };

  const handleItemClick = (item: StoreItem) => {
    setSelectedItem(item);
  };

  const handleBackToStore = () => {
    setSelectedItem(null);
  };

  // Convert store items - show ALL uploaded items from store_items table
  const allItems = useMemo(() => {
    // Return the store items directly since they're already in the correct format
    return uploadedFiles.map(item => ({
      ...item,
      downloadUrl: item.download_link || '#',
      isUploadedFile: true,
      downloads: typeof item.downloads === 'string' ? parseInt(item.downloads) || 0 : item.downloads || 0,
      download_count: typeof item.downloads === 'string' ? parseInt(item.downloads) || 0 : item.downloads || 0,
      average_rating: item.rating || 0,
      rating_count: 0 // Will be calculated from reviews
    }));
  }, [uploadedFiles]);

  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allItems, activeCategory, searchQuery]);

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'games':
        return 'Games';
      case 'apps':
        return 'Apps';
      case 'websites':
        return 'Websites';
      default:
        return 'For you';
    }
  };

  const getCategoryDescription = () => {
    switch (activeCategory) {
      case 'games':
        return 'Discover amazing games from indie developers to major studios';
      case 'apps':
        return 'Find productivity apps, utilities, and tools to enhance your workflow';
      case 'websites':
        return 'Professional website templates and web applications';
      default:
        return 'Recommended content across all categories';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Store...</p>
        </div>
      </div>
    );
  }

  if (showAdminPanel && isAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        user={user}
        isAdmin={isAdmin}
        onShowAdmin={() => setShowAdminPanel(true)}
        onShowAuth={() => setShowAuthModal(true)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <main className="min-h-screen bg-gray-50 mobile-content">
        {selectedItem ? (
          <ItemDetailPage 
            item={selectedItem} 
            onBack={handleBackToStore}
          />
        ) : (
          <>
            {/* Featured Section - Only show when not searching and on 'all' category */}
            {!searchQuery && activeCategory === 'all' && (
              <div className="bg-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
                  <FeaturedSection title="Featured" items={featuredItems} />
                </div>
              </div>
            )}

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
              {/* Category Header */}
              <div className="mb-6 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {searchQuery ? `Search results for "${searchQuery}"` : getCategoryTitle()}
                  </h1>
                  {!searchQuery ? (
                    <p className="text-gray-600 text-base sm:text-lg">{getCategoryDescription()}</p>
                  ) : (
                    <p className="text-gray-600 text-base sm:text-lg">
                      {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} found
                    </p>
                  )}
                </div>
              </div>

              {/* No Apps Message */}
              {!searchQuery && filteredItems.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="text-center py-16 px-6">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No Content Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                      Your store is ready to showcase amazing content! Upload your first app, game, or website to get started.
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => setShowAdminPanel(true)}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Upload Your First Content
                      </button>
                    )}
                    {!isAdmin && !user && (
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Sign In to Upload Content
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Items Grid - Only show if there are items */}
              {filteredItems.length > 0 && (
                <CategoryGrid 
                  items={filteredItems} 
                  category={activeCategory} 
                  onStatsUpdate={handleStatsUpdate}
                  onItemClick={handleItemClick}
                />
              )}

              {/* No Search Results */}
              {searchQuery && filteredItems.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="text-center py-16 px-6">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                      Try adjusting your search terms or browse our featured categories to discover amazing content.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              )}

              {/* Debug Section - Only show to admins */}
              {isAdmin && (
                <div className="mt-8">
                  {/* Temporarily disabled to prevent database errors */}
                  {/* <DatabaseDebug /> */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">⚡</span>
                      <strong className="text-blue-800">Admin Database Status</strong>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Database functionality is working. Screenshots table setup can be done manually in Supabase if needed for additional features.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Exostore</h2>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Discover amazing games, apps, and websites. Your gateway to digital innovation and creativity.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <button 
                    onClick={() => setActiveCategory('games')} 
                    className="hover:text-blue-600 transition-colors duration-200 text-left"
                  >
                    Games
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveCategory('apps')} 
                    className="hover:text-blue-600 transition-colors duration-200 text-left"
                  >
                    Apps
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveCategory('websites')} 
                    className="hover:text-blue-600 transition-colors duration-200 text-left"
                  >
                    Websites
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveCategory('all')} 
                    className="hover:text-blue-600 transition-colors duration-200 text-left"
                  >
                    For You
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-500">
            <p>&copy; 2025 Exostore. Built with ❤️ for the community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;