import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, BookOpen, Plus, Droplets, Settings, Menu, X, Activity, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth/login");
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/cattle", label: "My Cattle", icon: Plus },
    { path: "/breeds", label: "Breeds", icon: BookOpen },
    { path: "/milk", label: "Milk", icon: Droplets },
    { path: "/data", label: "Data", icon: Settings },
    { path: "/activity", label: "Activity Log", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - always visible */}
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-green-600" />
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                Cattle<span className="text-green-600">Info</span>
              </span>
            </Link>

            {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>

            {/* Desktop Right Side - Add Cattle + User Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <>
                  <Link to="/cattle/add">
                    <Button className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Cattle</span>
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2 ml-2 pl-4 border-l border-gray-200">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.username}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Link to="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - visible when open */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive(item.path)
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <Link
                to="/cattle/add"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-600 text-white mt-4"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add Cattle</span>
              </Link>
              {user ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-600">
                    <User className="h-5 w-5" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white mt-4"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2026 CattleInfo - Comprehensive Cattle Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
