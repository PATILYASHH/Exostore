import React, { useState, useEffect } from 'react';
import { Download, Star, ThumbsUp } from 'lucide-react';
import { supabase, StoreItem, UserRating } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ItemInteractionsProps {
  item: StoreItem;
  onStatsUpdate?: () => void;
}

const ItemInteractions: React.FC<ItemInteractionsProps> = ({ item, onStatsUpdate }) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserInteractions();
    }
  }, [user, item.id]);

  const fetchUserInteractions = async () => {
    if (!user) return;

    try {
      // Check if user has downloaded this item
      const { data: downloadData } = await supabase
        .from('user_downloads')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .single();

      setHasDownloaded(!!downloadData);

      // Get user's rating for this item
      const { data: ratingData } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .single();

      setUserRating(ratingData);
      if (ratingData) {
        setNewRating(ratingData.rating);
        setReview(ratingData.review || '');
      }
    } catch (error) {
      console.error('Error fetching user interactions:', error);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Record the download only if user is authenticated
      if (user && !hasDownloaded) {
        const downloadType = item.isUploadedFile ? 'uploaded_file' : 'store_item';
        const { error } = await supabase
          .from('user_downloads')
          .insert([{
            user_id: user.id,
            item_id: item.id,
            download_type: downloadType,
            ip_address: null, // You can add IP tracking if needed
            user_agent: navigator.userAgent
          }]);

        if (error) {
          console.error('Error recording download:', error);
          // Don't prevent download if recording fails
        } else {
          setHasDownloaded(true);
          if (onStatsUpdate) onStatsUpdate();
        }
      }
      
      // Trigger download regardless of authentication
      if (item.isUploadedFile && item.downloadUrl) {
        // Handle uploaded file download
        window.open(item.downloadUrl, '_blank');
      } else if (item.download_link) {
        window.open(item.download_link, '_blank');
      } else if (item.file_path) {
        // Handle Supabase storage download
        const { data } = supabase.storage
          .from('store-files')
          .getPublicUrl(item.file_path);
        
        if (data.publicUrl) {
          window.open(data.publicUrl, '_blank');
        }
      } else {
        alert('No download link available for this item.');
      }
    } catch (error) {
      console.error('Error handling download:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async () => {
    if (!user || newRating === 0) return;

    setLoading(true);
    try {
      const ratingType = item.isUploadedFile ? 'uploaded_file' : 'store_item';
      const ratingData = {
        user_id: user.id,
        item_id: item.id,
        rating: newRating,
        comment: review.trim() || null,
        rating_type: ratingType
      };

      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('user_ratings')
          .update(ratingData)
          .eq('id', userRating.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('user_ratings')
          .insert([ratingData]);

        if (error) throw error;
      }

      setShowRatingModal(false);
      await fetchUserInteractions();
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDownloadCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => setNewRating(index + 1) : undefined}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {/* Stats Display */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{formatDownloadCount(item.download_count || 0)} downloads</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex">{renderStars(Math.round(item.average_rating || 0))}</div>
            <span>
              {item.average_rating ? item.average_rating.toFixed(1) : '0.0'} 
              ({item.rating_count || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleDownload}
          disabled={loading || (!item.download_link && !item.file_path)}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            hasDownloaded && user
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
          }`}
        >
          {hasDownloaded && user ? <ThumbsUp className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>
            {hasDownloaded && user ? 'Downloaded' : loading ? 'Downloading...' : 'Download'}
          </span>
        </button>

        {user && (
          <button
            onClick={() => setShowRatingModal(true)}
            className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            <Star className="w-4 h-4" />
            <span>{userRating ? 'Edit Rating' : 'Rate'}</span>
          </button>
        )}

        {!user && (
          <div className="text-xs text-gray-500 text-center pt-2">
            Sign in to rate items and track downloads
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {userRating ? 'Edit Your Rating' : 'Rate This Item'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {renderStars(newRating, true)}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Share your thoughts about this item..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setNewRating(userRating?.rating || 0);
                  setReview(userRating?.review || '');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRating}
                disabled={loading || newRating === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-300"
              >
                {loading ? 'Saving...' : userRating ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemInteractions;
