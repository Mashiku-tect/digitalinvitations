import { Bars3Icon, BellIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = ({ onMenuToggle, isSidebarCollapsed, onToggleSidebar, isMobileMenuOpen }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side - Menu toggle and Breadcrumb */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:block p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bars3Icon className={`w-5 h-5 transform transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900">Welcome Allen!!</h1>
          </div>
        </div>

        {/* Right side - Search and User */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <BellIcon className="w-5 h-5" />
            <span className="sr-only">View notifications</span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">User Name</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;