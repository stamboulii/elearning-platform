import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  BookOpen,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Heart,
  Bell,
  GraduationCap,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loadingFavoriteCount, setLoadingFavoriteCount] = useState(false);
  const [loadingCartCount, setLoadingCartCount] = useState(false);
  const userMenuRef = useRef(null);

  // Fetch favorite count when user is authenticated
  useEffect(() => {
    const fetchFavoriteCount = async () => {
      if (user?.role === 'STUDENT') {
        try {
          setLoadingFavoriteCount(true);
          const response = await api.get('/wishlist/count');
          if (response.data.success) {
            setFavoriteCount(response.data.data.count || 0);
          }
        } catch (error) {
          console.error('Error fetching favorite count:', error);
          setFavoriteCount(0);
        } finally {
          setLoadingFavoriteCount(false);
        }
      }
    };

    fetchFavoriteCount();
  }, [user]);

  // Fetch cart count when user is authenticated
  useEffect(() => {
    const fetchCartCount = async () => {
      if (user?.role === 'STUDENT') {
        try {
          setLoadingCartCount(true);
          const response = await api.get('/cart/count');
          if (response.data.success) {
            setCartCount(response.data.data.count || 0);
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
          setCartCount(0);
        } finally {
          setLoadingCartCount(false);
        }
      }
    };

    fetchCartCount();
  }, [user]);

  // Also listen for favorite updates from other components
  useEffect(() => {
    const handleFavoriteUpdate = () => {
      if (user?.role === 'STUDENT') {
        fetchFavoriteCount();
      }
    };

    // Custom event listener for favorite updates
    window.addEventListener('favorites-updated', handleFavoriteUpdate);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoriteUpdate);
    };
  }, [user]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user?.role === 'STUDENT') {
        fetchCartCount();
      }
    };

    // Custom event listener for cart updates
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [user]);

  // Function to refetch favorite count
  const fetchFavoriteCount = async () => {
    if (user?.role === 'STUDENT') {
      try {
        setLoadingFavoriteCount(true);
        const response = await api.get('/wishlist/count');
        if (response.data.success) {
          setFavoriteCount(response.data.data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching favorite count:', error);
        setFavoriteCount(0);
      } finally {
        setLoadingFavoriteCount(false);
      }
    }
  };

  // Function to refetch cart count
  const fetchCartCount = async () => {
    if (user?.role === 'STUDENT') {
      try {
        setLoadingCartCount(true);
        const response = await api.get('/cart/count');
        if (response.data.success) {
          setCartCount(response.data.data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      } finally {
        setLoadingCartCount(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'INSTRUCTOR') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  // Function to refresh favorite count from other components
  const refreshFavoriteCount = () => {
    fetchFavoriteCount();
  };

  // Function to refresh cart count from other components
  const refreshCartCount = () => {
    fetchCartCount();
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-xl group-hover:scale-105 transition-all">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight hidden sm:block">
              E-Learning
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link 
              to="/courses" 
              className="text-slate-700 hover:text-indigo-600 transition-colors font-semibold flex items-center gap-2 group"
            >
              <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Courses
            </Link>
            
            {user && (
              <Link
                to={getDashboardLink()}
                className="text-slate-700 hover:text-indigo-600 transition-colors font-semibold flex items-center gap-2 group"
              >
                <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Dashboard
              </Link>
            )}

            {user?.role === 'INSTRUCTOR' && (
              <Link 
                to="/instructor/courses" 
                className="text-slate-700 hover:text-indigo-600 transition-colors font-semibold flex items-center gap-2 group"
              >
                My Courses
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'STUDENT' && (
                  <>
                    {/* Cart Icon */}
                    <Link
                      to="/cart"
                      className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors group hidden sm:block"
                      title="Shopping Cart"
                      onClick={refreshCartCount}
                    >
                      <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                      {!loadingCartCount && cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                      {loadingCartCount && (
                        <span className="absolute -top-1 -right-1 bg-slate-200 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </span>
                      )}
                    </Link>

                    {/* Wishlist Icon */}
                    <Link
                      to="/wishlist"
                      className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors group hidden sm:block"
                      title="Favorites"
                      onClick={refreshFavoriteCount}
                    >
                      <Heart className="w-5 h-5 text-slate-600 group-hover:text-rose-600 transition-colors" />
                      {!loadingFavoriteCount && favoriteCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          {favoriteCount > 9 ? '9+' : favoriteCount}
                        </span>
                      )}
                      {loadingFavoriteCount && (
                        <span className="absolute -top-1 -right-1 bg-slate-200 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Notifications Icon */}
                <button
                  className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors group hidden sm:block"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all group"
                  >
                    <div className="relative">
                      <img
                        src={user.profilePicture || 'https://via.placeholder.com/40'}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 group-hover:border-indigo-300 transition-colors"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-slate-700 font-semibold hidden xl:block">{user.firstName}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform hidden xl:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info */}
                      <div className="px-4 pb-3 border-b border-slate-100">
                        <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                          {user.role === 'ADMIN' ? 'Admin' : user.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-semibold">Profile</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                            <Settings className="w-4 h-4 text-slate-600" />
                          </div>
                          <span className="font-semibold">Settings</span>
                        </Link>

                        {/* Cart in dropdown for mobile/small screens */}
                        {user.role === 'STUDENT' && (
                          <>
                            <Link
                              to="/cart"
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors group sm:hidden"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                refreshCartCount();
                              }}
                            >
                              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="font-semibold">Cart</span>
                              {!loadingCartCount && cartCount > 0 && (
                                <span className="ml-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black rounded-full px-2 py-0.5">
                                  {cartCount}
                                </span>
                              )}
                            </Link>

                            {/* Wishlist in dropdown for mobile/small screens */}
                            <Link
                              to="/wishlist"
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors group sm:hidden"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                refreshFavoriteCount();
                              }}
                            >
                              <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                                <Heart className="w-4 h-4 text-rose-600" />
                              </div>
                              <span className="font-semibold">Favorites</span>
                              {!loadingFavoriteCount && favoriteCount > 0 && (
                                <span className="ml-auto bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black rounded-full px-2 py-0.5">
                                  {favoriteCount}
                                </span>
                              )}
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors w-full group"
                        >
                          <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                            <LogOut className="w-4 h-4 text-rose-600" />
                          </div>
                          <span className="font-semibold">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hidden sm:block text-slate-700 hover:text-indigo-600 transition-colors font-semibold px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-slate-100 animate-in slide-in-from-top duration-200">
            <div className="space-y-2">
              <Link
                to="/courses"
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                Courses
              </Link>
              
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>

                  {user.role === 'INSTRUCTOR' && (
                    <Link
                      to="/instructor/courses"
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="w-5 h-5" />
                      My Courses
                    </Link>
                  )}

                  {user.role === 'STUDENT' && (
                    <>
                      <Link
                        to="/cart"
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                        onClick={() => {
                          setIsMenuOpen(false);
                          refreshCartCount();
                        }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Cart
                        {!loadingCartCount && cartCount > 0 && (
                          <span className="ml-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black rounded-full px-2 py-0.5">
                            {cartCount}
                          </span>
                        )}
                        {loadingCartCount && (
                          <span className="ml-auto bg-slate-200 text-white text-xs font-black rounded-full px-2 py-0.5 flex items-center justify-center w-6 h-6">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                        onClick={() => {
                          setIsMenuOpen(false);
                          refreshFavoriteCount();
                        }}
                      >
                        <Heart className="w-5 h-5" />
                        Favorites
                        {!loadingFavoriteCount && favoriteCount > 0 && (
                          <span className="ml-auto bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black rounded-full px-2 py-0.5">
                            {favoriteCount}
                          </span>
                        )}
                        {loadingFavoriteCount && (
                          <span className="ml-auto bg-slate-200 text-white text-xs font-black rounded-full px-2 py-0.5 flex items-center justify-center w-6 h-6">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </span>
                        )}
                      </Link>
                    </>
                  )}

                  <div className="my-3 border-t border-slate-100"></div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors w-full font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const refreshHeaderFavorites = () => {
  window.dispatchEvent(new Event('favorites-updated'));
};

// eslint-disable-next-line react-refresh/only-export-components
export const refreshHeaderCart = () => {
  window.dispatchEvent(new Event('cart-updated'));
};

export default Header;