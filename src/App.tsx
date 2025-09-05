import React, { useState, useMemo } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import FeaturedSection from './components/FeaturedSection';
import CategoryGrid from './components/CategoryGrid';
import ItemDetailPage from './components/ItemDetailPage';
import DatabaseDebug from './components/DatabaseDebug';
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedItem ? (
          <ItemDetailPage 
            item={selectedItem} 
            onBack={handleBackToStore}
          />
        ) : (
          <>
            {/* Debug Section - Only show to admins */}
            {isAdmin && <DatabaseDebug />}

            {/* Featured Section - Only show when not searching and on 'all' category */}
            {!searchQuery && activeCategory === 'all' && (
              <FeaturedSection title="Featured" items={featuredItems} />
            )}

            {/* Category Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Search results for "${searchQuery}"` : getCategoryTitle()}
              </h1>
              {!searchQuery && (
                <p className="text-gray-600">{getCategoryDescription()}</p>
              )}
            </div>

            {/* No Apps Message */}
            {!searchQuery && filteredItems.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Apps Uploaded Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Your store is ready! Upload your first app using the admin panel to get started.
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Upload Your First App
                  </button>
                )}
                {!isAdmin && !user && (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Sign In to Upload Apps
                  </button>
                )}
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

        {/* No Results */}
        {searchQuery && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your search terms or browse our featured categories to discover amazing content.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
            Clear search
          </button>
        </div>
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Store</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Discover amazing games, apps, and websites. Your gateway to digital innovation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-green-600 transition-colors duration-200">Games</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors duration-200">Apps</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors duration-200">Websites</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-green-600 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-600">
            <p>&copy; 2025 Store. All rights reserved.</p>
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