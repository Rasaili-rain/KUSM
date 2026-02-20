import {
  LayoutDashboard,
  BarChart3,
  Map,
  Gauge,
  Receipt,
  TrendingUp,
  LogIn,
  LogOut,
  User,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMeterStore } from "@/stores/meterStore";
import { useAuthStore, UserRole } from "@/stores/authStore";
import LoginModal from "@/components/auth/LoginModal";

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const meters = useMeterStore((state) => state.meters);
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const mainMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Analysis", icon: BarChart3, path: "/analysis" },
    { name: "Prediction", icon: TrendingUp, path: "/prediction" },
    { name: "Billing", icon: Receipt, path: "/billing" },
    { name: "Map", icon: Map, path: "/map" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getRoleIcon = () => {
    if (!user) return null;
    return user.role === UserRole.SUPER_ADMIN ? (
      <ShieldCheck className="w-4 h-4" />
    ) : (
      <Shield className="w-4 h-4" />
    );
  };

  const getRoleBadgeColor = () => {
    if (!user) return "";
    return user.role === UserRole.SUPER_ADMIN
      ? "bg-purple-100 text-purple-700"
      : "bg-blue-100 text-blue-700";
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    if (!user) return;
    navigate('/profile');
  };

  return (
    <>
      <div className="w-64 h-[91vh] text-gray-700 flex flex-col bg-gray-100/70 m-2 rounded-2xl">
        {/* Main Navigation */}
        <div className="px-4 py-4">
          <nav className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition ${active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-100"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Available Meters */}
        <div className="px-4 py-2 flex-1 overflow-y-auto">
          <h2 className="text-xs font-medium text-gray-500 px-3 py-2">
            Available Meters
          </h2>

          <div className="space-y-1">
            {meters.map((meter) => {
              const path = `/meter/${meter.meter_id}`;
              const active = isActive(path);

              return (
                <Link
                  key={meter.meter_id}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition ${active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-100"
                    }`}
                  state={{ title: meter.name }}
                >
                  <Gauge className="w-4 h-4" />
                  <span className="truncate">{meter.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Navigation Buttons - Only for authenticated users */}
        {isAuthenticated && user && (
          <div className="px-4 pb-2">
            <div className="space-y-1">
              {/* Admin Dashboard - Show for both Admin and Super Admin */}
              {(user.role === UserRole.ADMIN ||
                user.role === UserRole.SUPER_ADMIN) && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition ${isActive("/admin/dashboard")
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Admin Dashboard</span>
                  </Link>
                )}

              {/* Super Admin Dashboard - Only for Super Admin */}
              {user.role === UserRole.SUPER_ADMIN && (
                <Link
                  to="/admin/super-admin-dashboard"
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition ${isActive("/admin/super-admin-dashboard")
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium">Super Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Auth Section */}
        <div className="px-4 py-4 border-t border-gray-200">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              {/* User Info - Clickable */}
              <button
                onClick={handleProfileClick}
                className={`w-full bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition text-left ${location.pathname === '/profile' ? 'border-blue-300 shadow-sm' : ''
                  }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleIcon()}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${getRoleBadgeColor()}`}
                  >
                    {user.role === UserRole.SUPER_ADMIN
                      ? "Super Admin"
                      : "Admin"}
                  </span>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition
             text-gray-700 hover:bg-gray-100"
            >
              <LogIn className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Admin Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}