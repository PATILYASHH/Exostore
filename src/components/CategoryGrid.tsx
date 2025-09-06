import React, { useState } from 'react';
import ItemCard from './ItemCard';
import { StoreItem } from '../lib/supabase';
import { Grid3X3, List, Filter, ChevronDown } from 'lucide-react';

interface CategoryGridProps {
  items: StoreItem[];
  category: string;
  onStatsUpdate?: () => void;
  onItemClick?: (item: StoreItem) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ items, category, onStatsUpdate, onItemClick }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating' | 'name'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = category === 'all' ? items : items.filter(item => item.category === category);

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        const aDownloads = typeof a.downloads === 'number' ? a.downloads : parseInt(a.downloads || '0');
        const bDownloads = typeof b.downloads === 'number' ? b.downloads : parseInt(b.downloads || '0');
        return bDownloads - aDownloads;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.title.localeCompare(b.title);
      case 'newest':
      default:
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
  });

  const getCategoryTitle = () => {
    switch (category) {
      case 'all':
        return 'For You';
      case 'games':
        return 'Games';
      case 'apps':
        return 'Apps';
      case 'websites':
        return 'Websites';
      default:
        return 'All Items';
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case 'all':
        return 'Discover trending apps, games, and websites';
      case 'games':
        return 'Entertainment and gaming applications';
      case 'apps':
        return 'Productivity and utility applications';
      case 'websites':
        return 'Web applications and online tools';
      default:
        return 'Browse all available content';
    }
  };

  if (filteredItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 mobile-content">
        <div className="text-center py-12 sm:py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto px-4">
            No content available in the <strong>{getCategoryTitle()}</strong> category yet. 
            Check back later or explore other categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mobile-content">
      {/* Category Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{getCategoryTitle()}</h2>
        <p className="text-gray-600 text-base sm:text-lg">{getCategoryDescription()}</p>
        <div className="flex items-center justify-between mt-3 sm:mt-4">
          <p className="text-sm text-gray-500 hidden sm:block">
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'} available
          </p>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 sm:px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 touch-target"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden xs:inline">Sort by {sortBy}</span>
              <span className="xs:hidden">Sort</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'popular', label: 'Most popular' },
                  { value: 'rating', label: 'Highest rated' },
                  { value: 'name', label: 'Name (A-Z)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as any);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200 touch-target ${
                      sortBy === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile item count */}
          <p className="text-sm text-gray-500 sm:hidden">
            {sortedItems.length} items
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-center sm:justify-end">
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 touch-target ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 touch-target ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8' 
          : 'space-y-3 sm:space-y-4'
      } category-grid`}>
        {sortedItems.map((item) => (
          <ItemCard 
            key={item.id} 
            {...item} 
            viewMode={viewMode}
            onStatsUpdate={onStatsUpdate}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {/* Load More Button (for future pagination) */}
      {sortedItems.length > 20 && (
        <div className="text-center mt-8 sm:mt-12">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-medium transition-colors duration-200 touch-target">
            Load more items
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;