import React, { useState } from 'react';
import { ChevronRight, Star, Download, ExternalLink } from 'lucide-react';
import HeroSection from './HeroSection';

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
  rating?: number;
  downloads?: number;
  category?: string;
}

interface FeaturedSectionProps {
  title: string;
  items: FeaturedItem[];
  onItemClick?: (item: FeaturedItem) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ title, items, onItemClick }) => {
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  const handleImageLoad = (itemId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
  };

  const handleImageError = (itemId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
  };

  const formatDownloads = (downloads?: number) => {
    if (!downloads) return '0';
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`;
    return downloads.toString();
  };

  return (
    <section className="mb-8 sm:mb-12 px-3 sm:px-0">
      {/* Hero Section - Big promotional banner */}
      <div className="mb-6 sm:mb-8 lg:mb-12">
        <HeroSection />
      </div>

      {/* Featured Content Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{title}</h2>
          <p className="text-gray-600 text-sm sm:text-base">Handpicked content just for you</p>
        </div>
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group self-start xs:self-auto touch-target">
          <span className="text-sm sm:text-base">View all featured</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>

      {/* Featured Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={`${item.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white cursor-pointer transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group touch-target`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    {/* Category Badge */}
                    {item.category && (
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 sm:px-3 rounded-full mb-2 sm:mb-3">
                        {item.category}
                      </span>
                    )}
                    
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-white/90 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                  
                  {/* App Icon */}
                  <div className="ml-3 sm:ml-4 flex-shrink-0">
                    <div className="relative">
                      {imageLoadingStates[item.id] !== false && (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-lg sm:rounded-xl animate-pulse"></div>
                      )}
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover shadow-lg ring-2 ring-white/20 transition-opacity duration-300 ${
                          imageLoadingStates[item.id] === false ? 'opacity-100' : 'opacity-0 absolute inset-0'
                        }`}
                        onLoad={() => handleImageLoad(item.id)}
                        onError={() => handleImageError(item.id)}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {item.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                        <span className="font-medium">{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {item.downloads && (
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">{formatDownloads(item.downloads)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 mx-3 sm:mx-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Featured Content</h3>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Featured content will appear here once apps and games are uploaded to the store.
          </p>
        </div>
      )}
    </section>
  );
};

export default FeaturedSection;