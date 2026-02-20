import { useAuthStore, UserRole } from "@/stores/authStore";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Shield,
  AlertCircle,
  X,
} from "lucide-react";
import { axiosInstance } from "@/lib/api_provider";
import SuperAdminUserRow from "@/components/SuperAdminDashboardComps/SuperAdmiUsersRow";
import CreateUserModal from "@/components/SuperAdminDashboardComps/CreateUserModal";
import EditUserModal from "@/components/SuperAdminDashboardComps/EditUserModal";
import EditUserProfileModal from "@/components/SuperAdminDashboardComps/EditUserProfileModal";
import ResetPasswordModal from "@/components/SuperAdminDashboardComps/ResetPasswordModal";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  created_by: number | null;
}

export default function SuperAdminDashboard() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/users");
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.is_active).length,
    inactiveUsers: users.filter((u) => !u.is_active).length,
    superAdmins: users.filter((u) => u.role === UserRole.SUPER_ADMIN).length,
    admins: users.filter((u) => u.role === UserRole.ADMIN).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Full system control and management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Super Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active"
          value={stats.activeUsers}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Inactive"
          value={stats.inactiveUsers}
          icon={XCircle}
          color="gray"
        />
        <StatCard
          title="Super Admins"
          value={stats.superAdmins}
          icon={ShieldCheck}
          color="purple"
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={Shield}
          color="cyan"
        />
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                User Management
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Create User Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add User</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchQuery ? "No users found" : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <SuperAdminUserRow
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  onRefresh={fetchUsers}
                  onEdit={(u) => {
                    setSelectedUser(u);
                    setShowEditModal(true);
                  }}
                  onEditProfile={(u) => {
                    setSelectedUser(u);
                    setShowEditProfileModal(true);
                  }}
                  onResetPassword={(u) => {
                    setSelectedUser(u);
                    setShowResetPasswordModal(true);
                  }}
                  setError={setError}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
          setError={setError}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
          setError={setError}
        />
      )}

      {showEditProfileModal && selectedUser && (
        <EditUserProfileModal
          user={selectedUser}
          onClose={() => {
            setShowEditProfileModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditProfileModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
          setError={setError}
        />
      )}

      {showResetPasswordModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => {
            setShowResetPasswordModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowResetPasswordModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
          setError={setError}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "gray" | "cyan";
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 text-blue-600",
    green: "from-green-50 to-green-100 text-green-600",
    purple: "from-purple-50 to-purple-100 text-purple-600",
    gray: "from-gray-50 to-gray-100 text-gray-600",
    cyan: "from-cyan-50 to-cyan-100 text-cyan-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} inline-flex mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}