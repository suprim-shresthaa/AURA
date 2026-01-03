import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/data/mockdata";
import { AppContent } from "./context/AppContext";
import useLogout from "../hooks/useLogout";
import { Menu, X, LogOut, User, ShoppingCart } from "lucide-react";

const Navbar = () => {
  const { isLoggedin, userData, cartItems } = useContext(AppContent);
  const logout = useLogout();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const cartCount = cartItems?.length || 0;

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-background sticky top-0 right-0 z-30 w-full shadow-sm border-b border-accent">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-auto w-auto max-h-16 object-contain"
              />
            </Link>
          </div>

          {/* Navigation Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                <Link
                  to={link.path}
                  className={`${
                    isActive(link.path) ? "text-primary" : ""
                  } hover:text-primary px-3 py-4 rounded-md text-sm font-medium transition-colors relative block group`}
                >
                  <span>{link.label}</span>
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-0.5 bg-primary transform ${
                      isActive(link.path) ? "scale-x-100" : "scale-x-0"
                    } group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedin ? (
              <>
                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {userData?.role === "vendor" && (
                  <Link
                    to="/vendor/vehicle-upload"
                    className="bg-primary hover:bg-primary/95 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors"
                  >
                    Add Vehicle
                  </Link>
                )}
                {/* {userData?.role !== "vendor" && (
                  <Link
                    to="/vendor/apply"
                    className="bg-primary hover:bg-primary/95 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors"
                  >
                    Become a Vendor
                  </Link>
                )} */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <img
                    src={userData?.image || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary"
                  />
                  <span className="hidden lg:inline">{userData?.name || "Profile"}</span>
                </Link>
                <Button
                  variant="ghost"
                  className="text-foreground hover:bg-muted"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                {/* <Link
                  to="/vendor/apply"
                  className="bg-primary hover:bg-primary/95 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Become a Vendor
                </Link> */}
                <Button
                  asChild
                  variant="ghost"
                  className="bg-muted text-foreground hover:bg-muted/80"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:text-primary focus:outline-none focus:text-primary transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-accent">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`block ${
                    isActive(link.path) ? "text-primary bg-muted" : ""
                  } hover:text-primary hover:bg-muted px-3 py-4 rounded-md text-base font-medium transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Cart Link */}
              {isLoggedin && (
                <Link
                  to="/cart"
                  className={`block ${
                    isActive("/cart") ? "text-primary bg-muted" : ""
                  } hover:text-primary hover:bg-muted px-3 py-4 rounded-md text-base font-medium transition-colors flex items-center gap-2`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Shopping Cart
                  {cartCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Mobile Action Buttons */}
              {isLoggedin ? (
                <>
                  {userData?.role === "vendor" && (
                    <Link
                      to="/vendor/vehicle-upload"
                      className="block hover:text-primary hover:bg-muted px-3 py-4 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Add Vehicle
                    </Link>
                  )}
                  {userData?.role !== "vendor" && (
                    <Link
                      to="/vendor/apply"
                      className="block hover:text-primary hover:bg-muted px-3 py-4 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Become a Vendor
                    </Link>
                  )}

                  {/* Mobile User Section */}
                  <div className="flex flex-col gap-2 mt-6 border-t border-accent pt-6">
                    <div className="flex items-center gap-2 px-3 py-3 rounded-lg bg-muted text-foreground font-medium">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Hi, {userData?.name || "User"}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm">Go to Profile</span>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      disabled={isLoggingOut}
                      className="w-full h-10 px-3 text-sm border-border hover:bg-muted disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                          Logging out...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-3 w-3 mr-2" />
                          Logout
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-6 border-t border-accent pt-6">
                  <Link
                    to="/vendor/apply"
                    className="block hover:text-primary hover:bg-muted px-3 py-4 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Become a Vendor
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 py-3 rounded-lg bg-primary text-primary-foreground font-semibold justify-center hover:bg-primary/90 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Login/Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
