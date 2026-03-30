import { useAuth } from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome, {user?.name}!
          </h1>
          
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">
              Role: <span className="font-semibold">{user?.role}</span>
            </p>
            <p className="text-gray-600">
              Organization: <span className="font-semibold">{user?.organizationId}</span>
            </p>
          </div>

          {/* Video components will be added next */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;