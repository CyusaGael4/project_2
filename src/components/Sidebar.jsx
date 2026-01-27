import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    FiHome, 
    FiTruck, 
    FiPackage, 
    FiFileText, 
    FiDollarSign, 
    FiBarChart2, 
    FiLogOut, 
    FiMenu, 
    FiX,
    FiUser
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: FiHome },
        { name: 'Cars', href: '/cars', icon: FiTruck },
        { name: 'Packages', href: '/packages', icon: FiPackage },
        { name: 'Service Records', href: '/service-packages', icon: FiFileText },
        { name: 'Payments', href: '/payments', icon: FiDollarSign },
        { name: 'Reports', href: '/reports', icon: FiBarChart2 },
    ];

    const handleLogout = async () => {
        await logout();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
                        >
                            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">🚗</span>
                            <h1 className="text-lg font-bold text-primary-600">SmartPark</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <FiUser className="text-primary-600" size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:inset-0 lg:shadow-md
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Section */}
                <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">🚗</span>
                        <div>
                            <h1 className="text-lg font-bold text-white">SmartPark</h1>
                            <p className="text-xs text-primary-100">CWSMS</p>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.username || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {user?.role || 'Receptionist'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Menu
                    </p>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                                ${isActive(item.href) 
                                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600 -ml-px' 
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }
                            `}
                        >
                            <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                isActive(item.href) ? 'text-primary-600' : 'text-gray-400'
                            }`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                    >
                        <FiLogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400 text-center">
                        © 2025 SmartPark CWSMS
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                        Rubavu District, Rwanda
                    </p>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;