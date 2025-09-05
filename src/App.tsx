import React, { useState, useMemo } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import FeaturedSection from './components/FeaturedSection';
import CategoryGrid from './components/CategoryGrid';
import { featuredItems } from './data/storeData';
import { supabase, StoreItem } from './lib/supabase';

const AppContent: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchStoreItems();
  }, []);

  React.useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [loading, user]);

  const fetchStoreItems = async () => {
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStoreItems(data || []);
    } catch (error) {
      console.error('Error fetching store items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = storeItems;

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
  }, [searchQuery]);

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

  if (loading || itemsLoading) {
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

        {/* Items Grid */}
        <CategoryGrid items={filteredItems} category={activeCategory} />

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