import React, { useState, useEffect } from 'react';
import { Download, Star, MessageSquare, Calendar, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UploadedFile {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  download_count?: number;
  rating_count?: number;
  average_rating?: number;
}

interface UserRating {
  id: string;
  rating: number;
  comment?: string;
  user_id: string;
  created_at: string;
}

const UploadedApps: React.FC = () => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [fileRatings, setFileRatings] = useState<UserRating[]>([]);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select(`
          *,
          download_count,
          rating_count,
          average_rating
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileRatings = async (fileId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('item_id', fileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFileRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      // Track download if user is authenticated
      if (user) {
        const { error: insertError } = await supabase
          .from('user_downloads')
          .insert({
            user_id: user.id,
            item_id: file.id,
            download_type: 'uploaded_file'
          });

        if (insertError) {
          console.error('Error tracking download:', insertError);
        }
      }

      // Download the file
      window.open(file.file_url, '_blank');
      
      // Refresh the files list to update download count
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const openRatingModal = async (file: UploadedFile) => {
    setSelectedFile(file);
    setShowRatingModal(true);
    setUserRating(5);
    setUserComment('');
    await fetchFileRatings(file.id);
  };

  const submitRating = async () => {
    if (!user || !selectedFile) return;

    setSubmittingRating(true);
    try {
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          user_id: user.id,
          item_id: selectedFile.id,
          rating: userRating,
          comment: userComment.trim() || null,
          rating_type: 'uploaded_file'
        });

      if (error) throw error;

      setShowRatingModal(false);
      fetchUploadedFiles();
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Applications</h2>
        <p className="text-gray-600">Discover and download applications shared by our community</p>
      </div>

      {uploadedFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications available</h3>
          <p className="text-gray-500">Check back later for new applications!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
              <div className="p-6">
                {/* File Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {file.original_filename}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {file.file_type.toUpperCase()} • {formatFileSize(file.file_size)}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {file.download_count || 0}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    {file.average_rating ? file.average_rating.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {file.rating_count || 0}
                  </div>
                </div>

                {/* Rating Display */}
                {file.average_rating && file.average_rating > 0 && (
                  <div className="flex items-center mb-4">
                    <div className="flex mr-2">
                      {renderStars(Math.round(file.average_rating))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({file.rating_count} review{(file.rating_count || 0) !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {/* Upload Date */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(file.uploaded_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => openRatingModal(file)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Rate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Rate {selectedFile.original_filename}
                </h3>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {user ? (
                <div className="space-y-6">
                  {/* Rating Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setUserRating(i + 1)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              i < userRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment (Optional)
                    </label>
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Share your experience with this application..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-3">
                    <button
                      onClick={submitRating}
                      disabled={submittingRating}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                      {submittingRating ? 'Submitting...' : 'Submit Rating'}
                    </button>
                    <button
                      onClick={() => setShowRatingModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please log in to rate this application</p>
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Existing Reviews */}
              {fileRatings.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Reviews ({fileRatings.length})
                  </h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {fileRatings.map((rating) => (
                      <div key={rating.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {renderStars(rating.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-gray-700">{rating.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedApps;
