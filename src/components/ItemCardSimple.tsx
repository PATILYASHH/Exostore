import React, { useState } from 'react';
import { StoreItem } from '../lib/supabase';
import { Star } from 'lucide-react';

interface ItemCardProps extends StoreItem {
  onStatsUpdate?: () => void;
  onItemClick?: (item: StoreItem) => void;
  viewMode?: 'grid' | 'list';
}

const ItemCard: React.FC<ItemCardProps> = (item) => {
  const {
    title,
    image,
    rating,
    average_rating,
    onItemClick
  } = item;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Use average_rating if available, fallback to rating
  const displayRating = average_rating || rating || 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3 h-3 sm:w-4 sm:h-4">
            <Star className="absolute inset-0 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star
            key={i}
            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300"
          />
        );
      }
    }
    return stars;
  };

  // Simplified card design - only image, name, and stars
  return (
    <div 
      className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-blue-200 overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={imageError ? 'https://via.placeholder.com/300x300/f3f4f6/6b7280?text=App' : image}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* App Name */}
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>

        {/* Stars Rating */}
        <div className="flex items-center justify-center space-x-1">
          {renderStars(displayRating)}
          {displayRating > 0 && (
            <span className="ml-2 text-xs sm:text-sm text-gray-600 font-medium">
              {displayRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect Indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
