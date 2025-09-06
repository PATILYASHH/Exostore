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
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <g fill="white" fillOpacity="0.1">
                <circle cx="7" cy="7" r="7"/>
                <circle cx="53" cy="7" r="7"/>
                <circle cx="7" cy="53" r="7"/>
                <circle cx="53" cy="53" r="7"/>
              </g>
            </g>
          </svg>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Exostore
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover a curated collection of amazing apps, games, and websites crafted by talented developers from around the world.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => document.querySelector('.category-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 min-w-[200px]"
              >
                <span className="flex items-center justify-center">
                  Start Exploring
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button className="group bg-transparent hover:bg-white/10 text-white border-2 border-white/30 hover:border-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 min-w-[200px]">
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </span>
              </button>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Quality Apps</h3>
                <p className="text-blue-200 text-sm">Curated collection of high-quality applications</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Fun Games</h3>
                <p className="text-blue-200 text-sm">Engaging games for all skill levels</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Web Apps</h3>
                <p className="text-blue-200 text-sm">Modern web applications and tools</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>
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
    <div className="relative w-full h-80 sm:h-96 lg:h-[32rem] rounded-2xl overflow-hidden group shadow-2xl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ 
          backgroundImage: `url(${currentBanner.image_url})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Banner Type Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium mb-4 backdrop-blur-sm ${getBannerTypeColor(currentBanner.banner_type)}`}>
              {getBannerTypeIcon(currentBanner.banner_type)}
              <span className="capitalize">{currentBanner.banner_type}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            {currentBanner.subtitle && (
              <h2 className="text-lg sm:text-xl lg:text-2xl text-blue-200 mb-4 font-medium leading-relaxed">
                {currentBanner.subtitle}
              </h2>
            )}

            {/* Description */}
            {currentBanner.description && (
              <p className="text-base sm:text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl">
                {currentBanner.description}
              </p>
            )}

            {/* CTA Button */}
            {currentBanner.link_url && currentBanner.link_url !== '#' && (
              <button
                onClick={handleLinkClick}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>{currentBanner.link_text}</span>
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
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
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator (only show if multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Banner Counter */}
      {banners.length > 1 && (
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {currentSlide + 1} / {banners.length}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
