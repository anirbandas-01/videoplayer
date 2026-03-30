import { useState, useEffect, useRef } from 'react';
import { getVideoById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VideoPlayer = ({ videoId, onClose }) => {
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  const fetchVideoDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getVideoById(videoId);
      setVideo(response.data.video);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const getStreamUrl = () => {
    const token = localStorage.getItem('token');
    return `http://localhost:8000/api/v1/videos/stream/${videoId}?token=${token}`;
  };

  if (!videoId) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {video.title}
            </h2>
            <p className="text-gray-600">
              {video.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Video Player */}
        <div className="p-6">
          {video.status === 'processing' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <svg className="animate-spin mx-auto h-12 w-12 text-yellow-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Video is still processing
              </h3>
              <p className="text-yellow-700">
                Progress: {video.processingProgress || 0}%
              </p>
              <div className="w-full bg-yellow-200 rounded-full h-2 mt-4">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${video.processingProgress || 0}%` }}
                />
              </div>
            </div>
          ) : video.status === 'flagged' ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="text-red-600 text-5xl mb-4">⚠</div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Content Flagged
              </h3>
              <p className="text-red-700 mb-4">
                {video.flagReason || 'This video has been flagged for potential sensitive content.'}
              </p>
              {(user?.role === 'admin' || user?.role === 'editor') && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-4">
                    As an {user.role}, you can still view this content:
                  </p>
                  <video
                    ref={videoRef}
                    controls
                    className="w-full rounded-lg shadow-lg"
                    style={{ maxHeight: '60vh' }}
                  >
                    <source src={getStreamUrl()} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          ) : (
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full rounded-lg shadow-lg"
              style={{ maxHeight: '60vh' }}
            >
              <source src={getStreamUrl()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Info */}
        <div className="px-6 pb-6 border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Status:</span>
              <div className="mt-1">
                {video.status === 'safe' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Safe
                  </span>
                )}
                {video.status === 'flagged' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    ⚠ Flagged
                  </span>
                )}
                {video.status === 'processing' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Processing
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Uploaded by:</span>
              <p className="mt-1 text-gray-900">{video.owner?.name || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Upload date:</span>
              <p className="mt-1 text-gray-900">
                {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </div>
            {video.fileSize && (
              <div>
                <span className="text-gray-600 font-medium">File size:</span>
                <p className="mt-1 text-gray-900">
                  {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;