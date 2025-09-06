import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AppDetailRoute from './AppDetailRoute';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import FeaturedSection from './components/FeaturedSection';
import CategoryGrid from './components/CategoryGrid';
import PWAStatus from './components/PWAStatus';
import InstallAppSection from './components/InstallAppSection';
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
  const { user, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<StoreItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      // Fetch store items (only admin-added items)
      const { data: storeItems, error: storeError } = await supabase
        .from('store_items')
        .select('*')
        .not('developer', 'eq', 'Community Upload') // Exclude fake community uploads
        .not('download_link', 'eq', '#') // Exclude demo items with fake links
        .not('title', 'ilike', '%test%') // Exclude test items
        .not('title', 'ilike', '%sample%') // Exclude sample items
        .not('title', 'ilike', '%demo%') // Exclude demo items
        .order('created_at', { ascending: false });
      
      if (storeError) {
        console.error('Error fetching store items:', storeError);
      }

      // Fetch uploaded files (only real user uploads)
      const { data: uploadedFileData, error: uploadedError } = await supabase
        .from('uploaded_files')
        .select('*')
        .not('filename', 'ilike', '%demo%') // Exclude demo files
        .not('filename', 'ilike', '%test%') // Exclude test files
        .not('file_url', 'ilike', '%example.com%') // Exclude fake URLs
        .order('uploaded_at', { ascending: false });
      
      if (uploadedError) {
        console.error('Error fetching uploaded files:', uploadedError);
      }

      // Convert uploaded files to StoreItem format (only real uploads)
      const convertedUploadedFiles: StoreItem[] = (uploadedFileData || [])
        .filter(file => {
          // Only include real uploaded files
          return file && 
                 file.id && 
                 file.original_filename &&
                 file.file_size > 0 && // Must have actual file size
                 file.uploaded_by && // Must have uploader
                 !file.file_url?.includes('example.com') && // No fake URLs
                 !file.filename?.toLowerCase().includes('demo') && // No demo files
                 !file.filename?.toLowerCase().includes('test'); // No test files
        })
        .map(file => {
          const category = determineCategory(file.file_type);
          const fileSize = file.file_size || 0;
          const fileName = file.original_filename || file.filename || 'Unknown File';
          const fileType = file.file_type || 'unknown';
          
          return {
            id: file.id,
            title: fileName,
            developer: 'Community Upload',
            rating: file.average_rating || 0,
            downloads: (file.download_count || 0).toString(),
            image: file.file_url || 'https://images.pexels.com/photos/374559/pexels-photo-374559.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
            category: category,
            price: 'Free',
            description: `Community uploaded ${fileType} file. Size: ${formatFileSize(fileSize)}`,
            type: category as 'games' | 'apps' | 'websites',
            download_link: file.file_url,
            file_path: file.storage_path,
            created_at: file.uploaded_at,
            download_count: file.download_count || 0,
            average_rating: file.average_rating || 0,
            rating_count: file.rating_count || 0,
            isUploadedFile: true,
            uploadedFileData: file,
            downloadUrl: file.file_url,
            // Cross-platform support from uploaded files
            has_web_version: file.has_web_version || false,
            has_app_version: file.has_app_version || false,
            web_version_url: file.web_version_url,
            app_version_url: file.app_version_url
          };
        });

      // Combine store items and uploaded files
      const allItems = [...(storeItems || []), ...convertedUploadedFiles];
      setUploadedFiles(allItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const determineCategory = (fileType: string | null | undefined): string => {
    if (!fileType) return 'apps'; // Default fallback for null/undefined
    
    const type = fileType.toLowerCase();
    if (type.includes('application') || type.includes('exe') || type.includes('msi') || type.includes('apk')) {
      return 'apps';
    } else if (type.includes('html') || type.includes('web') || type.includes('text/html')) {
      return 'websites';
    } else if (type.includes('zip') || type.includes('rar') || type.includes('game') || type.includes('unity')) {
      return 'games';
    } else {
      return 'apps'; // Default for unknown file types
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStatsUpdate = () => {
    fetchAllItems();
  };

  const navigate = useNavigate();
  const handleItemClick = (item: StoreItem) => {
    navigate(`/app/${item.id}`);
  };

  const handleBackToStore = () => {
    navigate('/');
  };

  // Function to generate cross-platform cards
  const generateCrossPlatformCards = (items: StoreItem[]): StoreItem[] => {
    const crossPlatformCards: StoreItem[] = [];
    
    items.forEach(item => {
      // If item has web version and we're viewing websites section
      if (item.has_web_version && item.web_version_url && activeCategory === 'websites') {
        const originalCategoryName = item.category === 'games' ? 'Game' : item.category === 'apps' ? 'App' : 'Website';
        crossPlatformCards.push({
          ...item,
          id: `${item.id}_web`,
          title: `${item.title} (Web Version)`,
          description: `Web version of this ${originalCategoryName.toLowerCase()}. ${item.cross_platform_notes || 'Experience the same great features directly in your browser.'}`.trim(),
          category: 'websites',
          // Keep original downloadUrl but add web version URL for the view button
          web_platform_url: item.web_version_url,
          is_cross_platform_card: true,
          original_category: item.category,
          cross_platform_type: 'web'
        });
      }
      
      // If item has app version and we're viewing apps section  
      if (item.has_app_version && item.app_version_url && activeCategory === 'apps') {
        const originalCategoryName = item.category === 'games' ? 'Game' : item.category === 'websites' ? 'Website' : 'App';
        crossPlatformCards.push({
          ...item,
          id: `${item.id}_app`,
          title: `${item.title} (App Version)`,
          description: `App version of this ${originalCategoryName.toLowerCase()}. ${item.cross_platform_notes || 'Download the dedicated app for the best mobile experience.'}`.trim(),
          category: 'apps',
          // Keep original downloadUrl but add app version URL for the view button
          app_platform_url: item.app_version_url,
          is_cross_platform_card: true,
          original_category: item.category,
          cross_platform_type: 'app'
        });
      }
    });
    
    return crossPlatformCards;
  };

  const baseFilteredItems = uploadedFiles.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Add cross-platform cards for other categories
  const crossPlatformCards = generateCrossPlatformCards(uploadedFiles);
  const filteredCrossPlatformCards = crossPlatformCards.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredItems = [...baseFilteredItems, ...filteredCrossPlatformCards];

  function getCategoryTitle() {
    switch (activeCategory) {
      case 'games': return 'Games';
      case 'apps': return 'Apps';
      case 'websites': return 'Websites';
      default: return 'All Content';
    }
  }

  function getCategoryDescription() {
    switch (activeCategory) {
      case 'games': return 'Browse all games uploaded to Exostore.';
      case 'apps': return 'Browse all apps uploaded to Exostore.';
      case 'websites': return 'Browse all websites uploaded to Exostore.';
      default: return 'Discover all content uploaded to Exostore.';
    }
  }

  const allItems = uploadedFiles;

  return (
    <div className="min-h-screen bg-gray-50">
      <PWAStatus />
      <Header
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        user={user}
        isAdmin={isAdmin}
        onShowAdmin={() => {
          console.log('onShowAdmin called!', { isAdmin, user: user?.email, currentShowAdminPanel: showAdminPanel });
          setShowAdminPanel(true);
        }}
        onShowAuth={() => setShowAuthModal(true)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 bg-white">
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
          />
        </div>
      )}

      <main className="min-h-screen bg-gray-50 mobile-content">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Featured Section - Only show when not searching and on 'all' category */}
                {!searchQuery && activeCategory === 'all' && (
                  <div className="bg-white">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
                      <FeaturedSection title="Featured" items={featuredItems} />
                    </div>
                  </div>
                )}

                {/* Install App Section */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                  <InstallAppSection />
                </div>

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

                  {/* Debug Section - Show to all signed-in users */}
                  {user && (
                    <div className="mt-8">
                      {/* Debug Admin Panel Access */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">🔧</span>
                          <strong className="text-blue-800">Debug Panel</strong>
                        </div>
                        <p className="text-blue-700 text-sm mb-3">
                          Admin Status: {isAdmin ? '✅ Admin Access Granted' : '❌ No Admin Access'}
                        </p>
                        <p className="text-blue-700 text-sm mb-3">
                          Current User: {user?.email || 'Not signed in'}
                        </p>
                        <p className="text-blue-700 text-sm mb-3">
                          Admin Panel State: {showAdminPanel ? '🟢 Open' : '🔴 Closed'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => {
                                  console.log('Debug: Opening admin panel (admin user)');
                                  setShowAdminPanel(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                              >
                                🚀 Open Admin Panel
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Debug: Closing admin panel');
                                  setShowAdminPanel(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                              >
                                ❌ Close Admin Panel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  console.log('Debug: Force opening admin panel for non-admin user');
                                  (window as any).showAdminPanelForceOpen = true;
                                  setShowAdminPanel(true);
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                              >
                                � Force Open Admin Panel
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Debug: Disabling force-open and closing admin panel');
                                  (window as any).showAdminPanelForceOpen = false;
                                  setShowAdminPanel(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                              >
                                ❌ Close & Disable Force Open
                              </button>
                            </>
                          )}
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                          <strong>Note:</strong> {isAdmin ? 'You have admin privileges.' : 'You can force-open the admin panel for testing. Some features may be restricted.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            }
          />
          <Route
            path="/app/:id"
            element={
              <AppDetailRoute
                allItems={allItems}
                onBack={handleBackToStore}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                  <img 
                    src="/favicon.png" 
                    alt="Exostore Logo" 
                    className="w-8 h-8 object-contain rounded-lg"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Exostore</h2>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Discover amazing games, apps, and websites. Your gateway to digital innovation and creativity.
              </p>
              <div className="flex space-x-4">
                {/* Social links ... */}
              </div>
            </div>
            {/* Categories and Support ... */}
          </div>
          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-500">
            <p>&copy; 2025 Exostore. Built with ❤️ for the community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;