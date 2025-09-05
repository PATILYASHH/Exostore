import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';

interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link_url?: string;
  link_text: string;
  banner_type: 'app' | 'sponsor' | 'promotion';
  display_order: number;
}

const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroBanners();
  }, []);

  const fetchHeroBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching hero banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to YashStore</h2>
          <p className="text-xl text-gray-300 mb-6">Discover amazing apps and games from our community</p>
          <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg">
            No promotional banners at this time
          </div>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentSlide];

  const handleLinkClick = () => {
    if (currentBanner.link_url && currentBanner.link_url !== '#') {
      if (currentBanner.link_url.startsWith('http')) {
        window.open(currentBanner.link_url, '_blank');
      } else {
        window.location.href = currentBanner.link_url;
      }
    }
  };

  const getBannerTypeIcon = (type: string) => {
    switch (type) {
      case 'app':
        return <Play className="w-5 h-5" />;
      case 'sponsor':
        return <ExternalLink className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getBannerTypeColor = (type: string) => {
    switch (type) {
      case 'app':
        return 'bg-blue-600/80';
      case 'sponsor':
        return 'bg-purple-600/80';
      default:
        return 'bg-green-600/80';
    }
  };

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden group">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ 
          backgroundImage: `url(${currentBanner.image_url})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            {/* Banner Type Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium mb-4 ${getBannerTypeColor(currentBanner.banner_type)}`}>
              {getBannerTypeIcon(currentBanner.banner_type)}
              {currentBanner.banner_type.charAt(0).toUpperCase() + currentBanner.banner_type.slice(1)}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            {currentBanner.subtitle && (
              <h2 className="text-xl md:text-2xl text-blue-200 mb-4 font-medium">
                {currentBanner.subtitle}
              </h2>
            )}

            {/* Description */}
            {currentBanner.description && (
              <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                {currentBanner.description}
              </p>
            )}

            {/* CTA Button */}
            {currentBanner.link_url && currentBanner.link_url !== '#' && (
              <button
                onClick={handleLinkClick}
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {currentBanner.link_text}
                <ExternalLink className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows (only show if multiple banners) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator (only show if multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Banner Counter */}
      {banners.length > 1 && (
        <div className="absolute top-6 right-6 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {banners.length}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
