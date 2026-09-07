import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Heart, ListMusic, Compass, Home, Music, Search as SearchIcon, Download } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../utils/cn';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    setMobileSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-muted/50 animate-navbar-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo — pinned to the left */}
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-primary flex-shrink-0 transition-opacity duration-200 hover:opacity-80"
          >
            <Music className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:block">OBLIVION</span>
          </Link>

          {/* Centered Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className={cn(
                  "w-full bg-surface/80 border border-muted/60",
                  "pl-11 pr-4 py-2.5 text-sm rounded-full",
                  "placeholder:text-muted-foreground/70 outline-none",
                  "transition-all duration-200 ease-out",
                  "hover:bg-surface hover:border-muted",
                  "focus:bg-surface focus:border-muted-foreground/40 focus:ring-1 focus:ring-muted-foreground/20"
                )}
                aria-label="Search"
              />
            </form>
          </div>

          {/* Mobile Search Bar - Collapsed */}
          <div className="flex-1 md:hidden">
            {!mobileSearchOpen ? (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-muted/50 transition-colors duration-200 text-muted-foreground hover:text-primary"
                  aria-label="Open search"
                >
                  <SearchIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSearch} className="relative animate-fade-in">
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className={cn(
                    "w-full bg-surface/80 border border-muted/60",
                    "pl-11 pr-10 py-2.5 text-sm rounded-full",
                    "placeholder:text-muted-foreground/70 outline-none",
                    "transition-all duration-200 ease-out",
                    "focus:bg-surface focus:border-muted-foreground/40 focus:ring-1 focus:ring-muted-foreground/20"
                  )}
                  aria-label="Search"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50 transition-colors duration-200 text-muted-foreground hover:text-primary"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 mr-2">
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

            {/* Download button - Desktop only */}
            <button
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md",
                "text-muted-foreground hover:text-primary hover:bg-muted/30",
                "transition-all duration-200 ease-out"
              )}
              aria-label="Download"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xl:block">Download</span>
            </button>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium hidden md:block">{user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md hover:bg-muted/50 transition-colors duration-200 text-muted-foreground hover:text-primary"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-primary",
                    "transition-colors duration-200 px-3 py-1.5"
                  )}
                >
                  Log in
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
              className="lg:hidden p-1.5 rounded-md hover:bg-muted/50 transition-colors duration-200 text-muted-foreground hover:text-primary"
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
          <div className="lg:hidden py-4 border-t border-muted/50 animate-fade-in">
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
              <button
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium",
                  "text-muted-foreground hover:bg-muted/30 hover:text-primary transition-all duration-200"
                )}
                aria-label="Download"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
                <span>Download</span>
              </button>
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-muted/50">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors duration-200"
                  >
                    Log in
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
