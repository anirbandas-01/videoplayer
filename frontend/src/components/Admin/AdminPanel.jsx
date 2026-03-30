import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser, getSystemStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'stats'

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [usersRes, statsRes] = await Promise.all([
        getAllUsers(),
        getSystemStats()
      ]);
      
      setUsers(usersRes.data.users);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      alert('Role updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user and all their videos.')) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully');
      fetchData(); // Refresh stats
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
        <p className="text-red-700">Only administrators can access this panel.</p>
      </div>
    );
  }

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
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            System Statistics
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={u._id === user.id}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {u._id !== user.id ? (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-gray-400">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found in your organization.
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Stats */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Users</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Users:</span>
                    <span className="font-bold text-blue-900">{stats.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Admins:</span>
                    <span className="font-bold text-blue-900">{stats.users.admin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Editors:</span>
                    <span className="font-bold text-blue-900">{stats.users.editor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Viewers:</span>
                    <span className="font-bold text-blue-900">{stats.users.viewer}</span>
                  </div>
                </div>
              </div>

              {/* Video Stats */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Videos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Videos:</span>
                    <span className="font-bold text-green-900">{stats.videos.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Processing:</span>
                    <span className="font-bold text-yellow-600">{stats.videos.processing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Safe:</span>
                    <span className="font-bold text-green-600">{stats.videos.safe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Flagged:</span>
                    <span className="font-bold text-red-600">{stats.videos.flagged}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual representation */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Status Distribution</h3>
              <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
                {stats.videos.total > 0 ? (
                  <>
                    <div
                      className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(stats.videos.processing / stats.videos.total) * 100}%` }}
                    >
                      {stats.videos.processing > 0 && `${stats.videos.processing}`}
                    </div>
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(stats.videos.safe / stats.videos.total) * 100}%` }}
                    >
                      {stats.videos.safe > 0 && `${stats.videos.safe}`}
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(stats.videos.flagged / stats.videos.total) * 100}%` }}
                    >
                      {stats.videos.flagged > 0 && `${stats.videos.flagged}`}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-300 w-full flex items-center justify-center text-gray-600 text-xs">
                    No videos yet
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>🟡 Processing</span>
                <span>🟢 Safe</span>
                <span>🔴 Flagged</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;