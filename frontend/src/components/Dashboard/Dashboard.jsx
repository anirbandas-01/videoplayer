import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import VideoUpload from '../video/VideoUpload';
import VideoList from '../video/VideoList';
import VideoPlayer from '../video/VideoPlayer';
import AdminPanel from '../Admin/AdminPanel';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [activeView, setActiveView] = useState('videos'); // 'videos' or 'admin'

  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId) {
      setSelectedVideoId(videoId);
    }
  }, [searchParams]);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClosePlayer = () => {
    setSelectedVideoId(null);
    searchParams.delete('video');
    setSearchParams(searchParams);
  };

  const canUpload = user?.role === 'editor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Role: <span className="font-semibold capitalize">{user?.role}</span> | 
              Organization: <span className="font-semibold">{user?.organizationId}</span>
            </p>
          </div>

          {/* Navigation Tabs */}
          {isAdmin && (
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex -mb-px space-x-8">
                <button
                  onClick={() => setActiveView('videos')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'videos'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setActiveView('admin')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === 'admin'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Admin Panel
                </button>
              </nav>
            </div>
          )}

          {/* Content based on active view */}
          {activeView === 'videos' ? (
            <>
              {/* Upload Section - Only for Editor and Admin */}
              {canUpload && (
                <VideoUpload onUploadSuccess={handleUploadSuccess} />
              )}

              {/* Video List */}
              <VideoList refreshTrigger={refreshTrigger} />
            </>
          ) : (
            <AdminPanel />
          )}

          {/* Video Player Modal */}
          {selectedVideoId && (
            <VideoPlayer
              videoId={selectedVideoId}
              onClose={handleClosePlayer}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;