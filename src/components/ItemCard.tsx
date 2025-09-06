import React, { useState } from 'react';
import { StoreItem } from '../lib/supabase';
import { Download, Star, ExternalLink, Play, Globe, Smartphone } from 'lucide-react';

interface ItemCardProps extends StoreItem {
  onStatsUpdate?: () => void;
  onItemClick?: (item: StoreItem) => void;
  viewMode?: 'grid' | 'list';
}

const ItemCard: React.FC<ItemCardProps> = (item) => {
  const {
    title,
    developer,
    image,
    category,
    price = 'Free',
    description,
    downloads,
    rating,
    onItemClick,
    viewMode = 'grid'
  } = item;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const formatDownloads = (downloads: string | number | undefined) => {
    if (!downloads) return '0';
    const num = typeof downloads === 'string' ? parseInt(downloads) || 0 : downloads;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'games':
        return <Play className="w-3 h-3" />;
      case 'websites':
        return <Globe className="w-3 h-3" />;
      case 'apps':
        return <Smartphone className="w-3 h-3" />;
      default:
        return <Smartphone className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'games':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'websites':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'apps':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white mobile-card shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group cursor-pointer overflow-hidden">
        <div className="card-responsive" onClick={handleCardClick}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center card-spacing sm:space-y-0 sm:space-x-6">
            {/* App Icon */}
            <div className="flex-shrink-0 relative self-start sm:self-center">
              {imageLoading && !imageError && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 mobile-card animate-pulse"></div>
              )}
              <img
                src={imageError ? 'https://via.placeholder.com/80x80/e5e7eb/6b7280?text=App' : image}
                alt={title}
                className={`w-16 h-16 sm:w-20 sm:h-20 mobile-card object-cover shadow-md group-hover:shadow-lg transition-all duration-300 ring-2 ring-gray-100 group-hover:ring-blue-200 ${
                  imageLoading ? 'opacity-0 absolute' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </div>

            {/* App Info */}
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-responsive-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 flex-1 pr-2">
                      {title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0 ml-2 mt-1" />
                  </div>
                  
                  <p className="text-responsive-sm font-medium text-gray-600 mb-3 truncate">{developer}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full border ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                      <span className="capitalize">{category}</span>
                    </span>
                    
                    <span className={`text-responsive-sm font-bold ${price === 'Free' ? 'text-green-600' : 'text-gray-900'}`}>
                      {price}
                    </span>
                  </div>
                  
                  <p className="text-responsive-sm text-gray-600 leading-relaxed line-clamp-2 mb-3 sm:mb-0">
                    {description}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 text-responsive-sm">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Download className="w-4 h-4" />
                    <span className="font-medium">{formatDownloads(downloads)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-700">{rating ? rating.toFixed(1) : '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200 hover:-translate-y-1 group cursor-pointer overflow-hidden card-height-auto">
      <div className="p-3 sm:p-4 lg:p-5 h-full" onClick={handleCardClick}>
        {/* Vertical Grid Layout */}
        <div className="flex flex-col h-full">
          {/* App Icon */}
          <div className="relative mb-3 sm:mb-4">
            {imageLoading && !imageError && (
              <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            )}
            <img
              src={imageError ? 'https://via.placeholder.com/200x200/e5e7eb/6b7280?text=App' : image}
              alt={title}
              className={`w-full aspect-square rounded-lg object-cover shadow-sm group-hover:shadow-md transition-all duration-300 ${
                imageLoading ? 'opacity-0 absolute' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            
            {/* Price Badge */}
            {price !== 'Free' && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                {price}
              </div>
            )}
          </div>

          {/* App Info */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 flex-1 pr-1 leading-tight">
                {title}
              </h3>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0 ml-1 mt-0.5" />
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-3 truncate font-medium">{developer}</p>

            {/* Category and Price */}
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
                <span className="capitalize hidden sm:inline">{category}</span>
                <span className="capitalize sm:hidden">{category.slice(0, 3)}</span>
              </span>
              
              {price === 'Free' && (
                <span className="text-xs font-bold text-green-600">Free</span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2 flex-1">
              {description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1 text-gray-500">
                  <Download className="w-3 h-3" />
                  <span className="font-medium">{formatDownloads(downloads)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700">{rating ? rating.toFixed(1) : '0.0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
