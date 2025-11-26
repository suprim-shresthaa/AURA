import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/data/mockdata";
import { AppContent } from "./context/AppContext";
import useLogout from "../hooks/useLogout";
import { Menu, Search, X, LogOut } from "lucide-react";

const Navbar = () => {
  const { isLoggedin, userData } = useContext(AppContent);
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const AuthButtons = () =>
    isLoggedin ? (
      <div className="flex items-center gap-3">
        <Link to="/profile" className="flex items-center gap-2 text-sm font-medium">
          <img
            src={userData?.image || "https://via.placeholder.com/40"}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover border border-[#1380ec]"
          />
          <span>{userData?.name || "Profile"}</span>
        </Link>
        <Button
          variant="ghost"
          className="text-[#0d141b] hover:bg-[#e7edf3]"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    ) : (
      <div className="flex gap-2">
        <Button
          asChild
          className="bg-[#1380ec] text-white hover:bg-[#0f64b8] min-w-[84px]"
        >
          <Link to="/login">Login</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="bg-[#e7edf3] text-[#0d141b] hover:bg-[#d5e0ed] min-w-[84px]"
        >
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    );

  return (
    <header className="bg-white border-b px-10 border-[#e7edf3] sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-3">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4 text-[#0d141b]">
            <div className="size-8 text-[#0d141b]">
              <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-[-0.015em]">AURA</h2>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="text-sm font-medium text-[#0d141b] hover:text-[#1380ec]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-end gap-6">
          <AuthButtons />
        </div>

        <button
          className="lg:hidden text-[#0d141b]"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-[#e7edf3] px-4 py-4 space-y-4 bg-white">
          <label className="flex min-w-0 flex-1 items-center rounded-lg bg-[#e7edf3] h-11 px-3 gap-2">
            <Search className="text-[#4c739a] size-5" />
            <input
              type="search"
              placeholder="Search"
              className="bg-transparent flex-1 text-sm text-[#0d141b] placeholder:text-[#4c739a] focus:outline-none"
            />
          </label>

          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-[#0d141b] text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[#e7edf3] pt-3">
            <AuthButtons />
            {isLoggedin && (
              <Button
                variant="ghost"
                className="w-full mt-3 text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
