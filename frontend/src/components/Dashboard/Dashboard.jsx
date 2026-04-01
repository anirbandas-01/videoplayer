import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import VideoUpload from '../video/VideoUpload';
import VideoList from '../video/VideoList';
import VideoPlayer from '../video/VideoPlayer';
import AdminPanel from '../Admin/AdminPanel';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const canUpload = user?.role === 'editor' || user?.role === 'admin';
  const view = searchParams.get('view') || 'all';

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onMenuClick={handleSidebarToggle} />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Role: <span className="font-semibold capitalize">{user?.role}</span> | 
                Organization: <span className="font-semibold">{user?.organizationId}</span>
              </p>
            </div>

            {/* Content based on view */}
            {view === 'admin' || view === 'users' || view === 'stats' ? (
              <AdminPanel />
            ) : view === 'upload' && canUpload ? (
              <VideoUpload onUploadSuccess={handleUploadSuccess} />
            ) : (
              <>
                {canUpload && view === 'all' && (
                  <VideoUpload onUploadSuccess={handleUploadSuccess} />
                )}
                <VideoList refreshTrigger={refreshTrigger} />
              </>
            )}

            {/* Video Player Modal */}
            {selectedVideoId && (
              <VideoPlayer
                videoId={selectedVideoId}
                onClose={handleClosePlayer}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;