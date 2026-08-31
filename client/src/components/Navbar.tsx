import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Heart, ListMusic, Compass, Home, Music } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../utils/cn';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/discover', label: 'Discover', icon: Compass },
    { path: '/search', label: 'Search', icon: Music },
    { path: '/library', label: 'Library', icon: ListMusic, auth: true },
    { path: '/playlists', label: 'Playlists', icon: Heart, auth: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.auth || isAuthenticated);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-muted/50 animate-navbar-fade-in">
      {/* Logo — pinned to the absolute top-left of the navbar */}
      <Link
        to="/"
        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm font-bold tracking-tight text-primary flex-shrink-0 transition-opacity duration-200 hover:opacity-80"
      >
        <Music className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:block">OBLIVION</span>
      </Link>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo placeholder — keeps spacing intact */}
          <div className="w-28 flex-shrink-0" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md",
                    "transition-all duration-200 ease-out",
                    isActive
                      ? 'text-primary bg-muted/50'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted/30'
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-primary"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 px-3 py-1.5"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={cn(
                    "bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    "hover:opacity-90 hover:scale-[1.02]",
                    "active:scale-[0.98]"
                  )}
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-muted/50 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200",
                      isActive
                        ? 'bg-muted/50 text-primary'
                        : 'text-muted-foreground hover:bg-muted/30 hover:text-primary'
                    )}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-muted/50">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
