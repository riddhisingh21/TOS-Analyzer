import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiFileText, FiLayers, FiEye, FiHome, FiLogIn, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/clerk-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useClerk();
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Analyze', href: '/analyze' },
    { name: 'Compare', href: '/compare' },
    { name: 'Accessibility', href: '/accessibility' },
    { name: 'History', href: '/history' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="h-8 w-8 mr-2"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-blue-600">
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">TOS Analyzer</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(link.href)
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <SignedIn>
              <div className="flex items-center space-x-4">
                <UserButton />
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiLogOut className="mr-1" />
                  Sign Out
                </button>
              </div>
            </SignedIn>
            <SignedOut>
              <Link
                to="/sign-in"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiLogIn className="mr-1" />
                Sign In
              </Link>
            </SignedOut>
            
            <div className="flex items-center sm:hidden ml-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <SignedOut>
              <Link
                to="/sign-in"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <FiLogIn />
                  <span className="ml-2">Sign In</span>
                </div>
              </Link>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <FiLogOut />
                  <span className="ml-2">Sign Out</span>
                </div>
              </button>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

