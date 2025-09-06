import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Star, Share2, Flag, User, Globe, Shield, ExternalLink, ChevronLeft, ChevronRight, Github } from 'lucide-react';
import { supabase, StoreItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ItemDetailPageProps {
  item: StoreItem;
  onBack: () => void;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  rating_type: 'store_item' | 'uploaded_file';
  created_at: string;
  updated_at?: string;
  user_email?: string;
}

const ItemDetailPage: React.FC<ItemDetailPageProps> = ({ item, onBack }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchScreenshots();
    checkUserDownload();
    checkExistingReview();
  }, []);

  const checkExistingReview = async () => {
    if (!user) return;
    
    try {
      const ratingType = item.isUploadedFile ? 'uploaded_file' : 'store_item';
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .eq('rating_type', ratingType)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      
      if (data) {
        setExistingReview(data);
        setUserRating(data.rating);
        setUserReview(data.comment || '');
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const fetchScreenshots = async () => {
    // Screenshots feature disabled to prevent database errors
    console.log('Screenshots feature disabled - using main image only');
    setScreenshots([item.image].filter(Boolean));
    return;
  };

  const fetchReviews = async () => {
    try {
      const ratingType = item.isUploadedFile ? 'uploaded_file' : 'store_item';
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('item_id', item.id)
        .eq('rating_type', ratingType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserDownload = async () => {
    if (!user) return;
    
    try {
      const downloadType = item.isUploadedFile ? 'uploaded_file' : 'store_item';
      const { data, error } = await supabase
        .from('user_downloads')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .eq('download_type', downloadType)
        .limit(1);

      if (error) throw error;
      setHasDownloaded(data && data.length > 0);
    } catch (error) {
      console.error('Error checking download status:', error);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Record download if user is authenticated
      if (user && !hasDownloaded) {
        const downloadType = item.isUploadedFile ? 'uploaded_file' : 'store_item';
        const { error } = await supabase
          .from('user_downloads')
          .insert([{
            user_id: user.id,
            item_id: item.id,
            download_type: downloadType,
            ip_address: null,
            user_agent: navigator.userAgent
          }]);

        if (error) {
          console.error('Error recording download:', error);
        } else {
          setHasDownloaded(true);
        }
      }

      // Trigger download
      if (item.isUploadedFile && item.downloadUrl) {
        window.open(item.downloadUrl, '_blank');
      } else if (item.download_link) {
        window.open(item.download_link, '_blank');
      } else if (item.file_path) {
        const { data } = supabase.storage
          .from('store-files')
          .getPublicUrl(item.file_path);
        
        if (data.publicUrl) {
          window.open(data.publicUrl, '_blank');
        }
      } else {
        alert('No download link available');
      }
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Error downloading file');
    } finally {
      setDownloading(false);
    }
  };

  const handleViewCrossPlatform = () => {
    const platformUrl = item.cross_platform_type === 'web' 
      ? item.web_platform_url 
      : item.app_platform_url;
    
    if (platformUrl) {
      window.open(platformUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const submitRating = async () => {
    if (!user || userRating === 0) return;

    setSubmittingRating(true);
    try {
      const ratingType = item.isUploadedFile ? 'uploaded_file' : 'store_item';
      const reviewData = {
        user_id: user.id,
        item_id: item.id,
        rating: userRating,
        comment: userReview.trim() || null,
        rating_type: ratingType
      };

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('user_ratings')
          .update({
            rating: userRating,
            comment: userReview.trim() || null
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        setIsEditingReview(false);
      } else {
        // Insert new review
        const { error } = await supabase
          .from('user_ratings')
          .insert(reviewData);

        if (error) throw error;
      }

      setShowRatingModal(false);
      setUserRating(0);
      setUserReview('');
      setExistingReview(null);
      fetchReviews();
      checkExistingReview();
      alert(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      if (error?.code === '23505') {
        alert('You have already reviewed this item. You can edit your existing review.');
      } else {
        alert('Error submitting review');
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${item.title} - Exostore`,
      text: `Check out ${item.title} by ${item.developer} on Exostore!`,
      url: window.location.href
    };

    try {
      // Use Web Share API if available (mobile browsers)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Show custom share options for desktop
        showShareOptions(shareData);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. You can copy this URL manually: ' + window.location.href);
      }
    }
  };

  const showShareOptions = (shareData: { title: string; text: string; url: string }) => {
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(shareData.text);
    
    const shareOptions = [
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        color: 'bg-green-500',
        icon: '📱'
      },
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        color: 'bg-blue-400',
        icon: '🐦'
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        color: 'bg-blue-600',
        icon: '📘'
      },
      {
        name: 'Copy Link',
        url: '#',
        color: 'bg-gray-600',
        icon: '📋',
        action: async () => {
          try {
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
            alert('Link copied to clipboard!');
          } catch (error) {
            // Fallback copy method for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link copied to clipboard!');
          }
        }
      }
    ];

    // Create share modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 class="text-xl font-bold mb-2 text-gray-900">Share ${item.title}</h3>
        <p class="text-gray-600 mb-6 text-sm">Share this app with your friends!</p>
        <div class="grid grid-cols-2 gap-3 mb-4">
          ${shareOptions.map((option, index) => `
            <button 
              onclick="window.shareAction_${index}()" 
              class="${option.color} text-white px-4 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span class="text-lg">${option.icon}</span>
              <span>${option.name}</span>
            </button>
          `).join('')}
        </div>
        <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200">
          Cancel
        </button>
      </div>
    `;

    // Add action handlers
    shareOptions.forEach((option, index) => {
      (window as any)[`shareAction_${index}`] = () => {
        if (option.action) {
          option.action();
        } else if (option.url !== '#') {
          window.open(option.url, '_blank', 'noopener,noreferrer');
        }
        modal.remove();
        // Clean up global functions
        delete (window as any)[`shareAction_${index}`];
      };
    });

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        // Clean up global functions
        shareOptions.forEach((_, index) => {
          delete (window as any)[`shareAction_${index}`];
        });
      }
    });
  };

  const startEditReview = () => {
    if (existingReview) {
      setUserRating(existingReview.rating);
      setUserReview(existingReview.comment || '');
      setIsEditingReview(true);
      setShowRatingModal(true);
    }
  };

  const deleteReview = async () => {
    if (!existingReview || !user) return;
    
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      const { error } = await supabase
        .from('user_ratings')
        .delete()
        .eq('id', existingReview.id);

      if (error) throw error;

      setExistingReview(null);
      setUserRating(0);
      setUserReview('');
      fetchReviews();
      alert('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const cancelEdit = () => {
    setShowRatingModal(false);
    setIsEditingReview(false);
    setUserRating(existingReview ? existingReview.rating : 0);
    setUserReview(existingReview ? existingReview.comment || '' : '');
  };

  const formatFileSize = (bytes: number | string) => {
    if (typeof bytes === 'string') return bytes;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
    return (
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'games':
        return <span className="text-purple-600">🎮</span>;
      case 'websites':
        return <Globe className="w-4 h-4" />;
      case 'apps':
        return <span className="text-blue-600">📱</span>;
      default:
        return <span className="text-gray-600">📦</span>;
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-3 sm:mr-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">{item.title}</h1>
            
            {/* Mobile Share Button in Header */}
            <div className="ml-auto sm:hidden">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* Cross-Platform Indicator */}
            {item.is_cross_platform_card && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">
                      {item.cross_platform_type === 'web' ? 'Web Version' : 'App Version'}
                    </h3>
                    <p className="text-sm text-purple-700">
                      This is the {item.cross_platform_type === 'web' ? 'web' : 'app'} version of a {item.original_category} originally available in our {item.original_category} section.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* App Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {/* Mobile Layout */}
              <div className="block sm:hidden space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl shadow-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h1 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1 pr-2">{item.title}</h1>
                      {item.is_opensource && item.github_url && (
                        <button
                          onClick={() => window.open(item.github_url, '_blank', 'noopener,noreferrer')}
                          className="github-badge bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex-shrink-0"
                          title="View source code on GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.developer}</p>
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(Math.round(item.average_rating), 'sm')}
                      <span className="text-xs text-gray-600 ml-1">
                        {item.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      {item.category === 'websites' ? <ExternalLink className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      <span>{item.download_count || 0} {item.category === 'websites' ? 'visits' : 'downloads'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {item.is_cross_platform_card ? (
                    <button
                      onClick={handleViewCrossPlatform}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View {item.cross_platform_type === 'web' ? 'Website' : 'App'}</span>
                    </button>
                  ) : item.category === 'websites' ? (
                    <button
                      onClick={handleDownload}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Website</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloading ? 'Downloading...' : hasDownloaded ? 'Download Again' : 'Download'}</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={handleShare}
                    className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Mobile Rating Buttons */}
                {user && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (existingReview) {
                          startEditReview();
                        } else {
                          setShowRatingModal(true);
                        }
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                      <Star className="w-4 h-4" />
                      <span>{existingReview ? 'Edit Review' : 'Rate'}</span>
                    </button>
                    {existingReview && (
                      <button
                        onClick={deleteReview}
                        className="border border-red-300 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-start space-x-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 rounded-2xl shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                      {item.is_opensource && item.github_url && (
                        <button
                          onClick={() => window.open(item.github_url, '_blank', 'noopener,noreferrer')}
                          className="github-badge flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                          title="View source code on GitHub"
                        >
                          <Github className="w-5 h-5" />
                          <span className="font-medium">View Source</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-full border ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category}</span>
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 mb-3">{item.developer}</p>
                    
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center space-x-2">
                        {renderStars(Math.round(item.average_rating), 'md')}
                        <span className="text-sm text-gray-600">
                          {item.average_rating.toFixed(1)} ({item.rating_count} reviews)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        {item.category === 'websites' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        <span>{item.download_count || 0} {item.category === 'websites' ? 'visits' : 'downloads'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                      {item.is_cross_platform_card ? (
                        <button
                          onClick={handleViewCrossPlatform}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>View {item.cross_platform_type === 'web' ? 'Website' : 'App'}</span>
                        </button>
                      ) : item.category === 'websites' ? (
                        <button
                          onClick={handleDownload}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>Open Website</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Download className="w-5 h-5" />
                          <span>{downloading ? 'Downloading...' : hasDownloaded ? 'Download Again' : 'Download'}</span>
                        </button>
                      )}
                      
                      {user && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              if (existingReview) {
                                startEditReview();
                              } else {
                                setShowRatingModal(true);
                              }
                            }}
                            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <Star className="w-5 h-5" />
                            <span>{existingReview ? 'Edit Review' : 'Rate'}</span>
                          </button>
                          {existingReview && (
                            <button
                              onClick={deleteReview}
                              className="border border-red-300 text-red-700 px-4 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200"
                            >
                              Delete Review
                            </button>
                          )}
                        </div>
                      )}
                      
                      <button 
                        onClick={handleShare}
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Screenshots & Demo Images</h2>
                <span className="text-xs sm:text-sm text-gray-500">{screenshots.length} image{screenshots.length !== 1 ? 's' : ''}</span>
              </div>
              
              {screenshots.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Main Image Display */}
                  <div className="relative">
                    <img
                      src={screenshots[currentImageIndex]}
                      alt={`Screenshot ${currentImageIndex + 1} of ${item.title}`}
                      className="w-full h-48 sm:h-64 lg:h-96 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        console.log('Image load error for:', screenshots[currentImageIndex]);
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400/e5e7eb/6b7280?text=Image+Not+Found';
                      }}
                    />
                    
                    {/* Navigation arrows - only show if multiple images */}
                    {screenshots.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </>
                    )}
                    
                    {/* Image counter */}
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black bg-opacity-60 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      {currentImageIndex + 1} / {screenshots.length}
                    </div>
                    
                    {/* Dot indicators for multiple images */}
                    {screenshots.length > 1 && screenshots.length <= 10 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {screenshots.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Grid - only show if multiple images */}
                  {screenshots.length > 1 && (
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {screenshots.map((screenshot, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={screenshot}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100/e5e7eb/6b7280?text=' + (index + 1);
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>No screenshots available</p>
                  <p className="text-sm mt-1">Admin can upload demo images for this app</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this app</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.description || 'No description available for this application.'}
              </p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ratings and reviews</h2>
                {user && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Write a review
                  </button>
                )}
              </div>

              {/* Rating Summary */}
              <div className="flex items-center space-x-8 mb-8 p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {item.average_rating.toFixed(1)}
                  </div>
                  {renderStars(Math.round(item.average_rating), 'lg')}
                  <div className="text-sm text-gray-600 mt-1">
                    {item.rating_count} reviews
                  </div>
                </div>
                
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-gray-600 w-2">{star}</span>
                        <Star className="w-4 h-4 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-gray-900">Anonymous User</span>
                          {renderStars(review.rating, 'sm')}
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                            {review.updated_at && review.updated_at !== review.created_at && (
                              <span className="ml-2 text-xs text-blue-600">(edited)</span>
                            )}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No reviews yet. Be the first to review this app!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* App Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App info</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span className="text-gray-900">1.0.0</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Size</span>
                  <span className="text-gray-900">
                    {item.isUploadedFile && item.uploadedFileData 
                      ? formatFileSize(item.uploadedFileData.file_size)
                      : '50 MB'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-900 capitalize">{item.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="text-gray-900">{item.price}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Released</span>
                  <span className="text-gray-900">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads</span>
                  <span className="text-gray-900">{item.download_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Developer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Developer</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.developer}</div>
                    <div className="text-sm text-gray-600">Developer</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                    <Globe className="w-4 h-4" />
                    <span>Visit website</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">No known security issues</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Data encryption in transit</span>
                </div>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm mt-4">
                  <Flag className="w-4 h-4" />
                  <span>Flag as inappropriate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {isEditingReview ? 'Edit your review' : 'Rate this app'}
              </h3>
              
              <div className="mb-6">
                <div className="flex justify-center space-x-2 mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setUserRating(i + 1)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          i < userRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Share your experience with this app..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={submitRating}
                  disabled={submittingRating || userRating === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {submittingRating ? 'Submitting...' : (isEditingReview ? 'Update Review' : 'Submit Review')}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailPage;
