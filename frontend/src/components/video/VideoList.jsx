import { useState, useEffect } from 'react';
import { getAllVideos, getFilteredVideos } from '../../services/api';
import VideoCard from './VideoCard';
import { getSocket } from '../../services/socket';

const VideoList = ({ refreshTrigger }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'newest',
    search: ''
  });

  useEffect(() => {
    fetchVideos();
  }, [refreshTrigger, filters]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleProgress = (data) => {
      setVideos(prevVideos =>
        prevVideos.map(video =>
          video._id === data.videoId
            ? { ...video, processingProgress: data.progress }
            : video
        )
      );
    };

    const handleCompleted = (data) => {
      setVideos(prevVideos =>
        prevVideos.map(video =>
          video._id === data.videoId
            ? { ...video, status: data.status, processingProgress: 100 }
            : video
        )
      );
    };

    socket.on('videoProgress', handleProgress);
    socket.on('videoCompleted', handleCompleted);

    return () => {
      socket.off('videoProgress', handleProgress);
      socket.off('videoCompleted', handleCompleted);
    };
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.search) params.search = filters.search;

      const response = Object.keys(params).length > 0
        ? await getFilteredVideos(params)
        : await getAllVideos();
      
      setVideos(response.data.videos);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = (videoId) => {
    setVideos(prevVideos => prevVideos.filter(v => v._id !== videoId));
  };

  const handleVideoUpdate = (updatedVideo) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video._id === updatedVideo._id ? { ...video, ...updatedVideo } : video
      )
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Video Library</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="processing">Processing</option>
            <option value="safe">Safe</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status ? 'Try adjusting your filters' : 'Get started by uploading a video'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onDelete={handleDelete}
              onVideoUpdate={handleVideoUpdate}
            />
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {videos.length} video{videos.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default VideoList;