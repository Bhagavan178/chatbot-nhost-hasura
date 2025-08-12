import React from 'react';
import { useAuth } from '@nhost/react-auth';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">ChatBot</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
