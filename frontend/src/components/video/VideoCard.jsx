import { useState, useEffect } from 'react';
import { deleteVideo } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';

const VideoCard = ({ video, onDelete, onVideoUpdate }) => {
  const { user } = useAuth();
  const [localVideo, setLocalVideo] = useState(video);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLocalVideo(video);
  }, [video]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleProgress = (data) => {
      if (data.videoId === localVideo._id) {
        setLocalVideo(prev => ({
          ...prev,
          processingProgress: data.progress
        }));
        if (onVideoUpdate) {
          onVideoUpdate({ ...localVideo, processingProgress: data.progress });
        }
      }
    };

    const handleCompleted = (data) => {
      if (data.videoId === localVideo._id) {
        setLocalVideo(prev => ({
          ...prev,
          status: data.status,
          processingProgress: 100
        }));
        if (onVideoUpdate) {
          onVideoUpdate({ ...localVideo, status: data.status, processingProgress: 100 });
        }
      }
    };

    socket.on('videoProgress', handleProgress);
    socket.on('videoCompleted', handleCompleted);

    return () => {
      socket.off('videoProgress', handleProgress);
      socket.off('videoCompleted', handleCompleted);
    };
  }, [localVideo._id, onVideoUpdate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteVideo(localVideo._id);
      if (onDelete) {
        onDelete(localVideo._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete video');
      setDeleting(false);
    }
  };

  const getStatusBadge = () => {
    switch (localVideo.status) {
      case 'processing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing {localVideo.processingProgress}%
          </span>
        );
      case 'safe':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Safe
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            Flagged
          </span>
        );
      default:
        return null;
    }
  };


  const isOwner = localVideo.owner?._id === user?.id;
  const isAdmin = user?.role === 'admin';

  
  const canWatch = true;

  
  const canDelete = isOwner || isAdmin;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {localVideo.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {localVideo.description}
          </p>
        </div>
        <div className="ml-4">
          {getStatusBadge()}
        </div>
      </div>

      {localVideo.status === 'processing' && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${localVideo.processingProgress || 0}%` }}
            />
          </div>
        </div>
      )}

      {localVideo.status === 'flagged' && localVideo.flagReason && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <strong>Reason:</strong> {localVideo.flagReason}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>
          By: {localVideo.owner?.name || 'Unknown'}
        </span>
        <span>
          {new Date(localVideo.createdAt).toLocaleDateString()}
        </span>
      </div>

      {localVideo.fileSize && (
        <div className="text-sm text-gray-500 mb-3">
          Size: {(localVideo.fileSize / (1024 * 1024)).toFixed(2)} MB
        </div>
      )}

      <div className="flex gap-2">
        
        {canWatch && localVideo.status !== 'processing' && (
          <a
            href={`/dashboard?video=${localVideo._id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            Watch
          </a>
        )}

        
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium disabled:bg-gray-400 transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCard;