import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(formData);
        
        if (result.success) {
            toast.success('Welcome back! Login successful.');
            navigate('/dashboard');
        } else {
            setError(result.error);
            toast.error(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full opacity-20"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full opacity-20"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-4xl">🚗</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        SmartPark CWSMS
                    </h2>
                    <p className="mt-2 text-sm text-primary-100">
                        Car Washing Sales Management System
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 fade-in">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Welcome Back</h3>
                        <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-3">
                            <FiAlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-700">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="input-label">
                                Username or Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="input-label">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base mt-6"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="spinner w-5 h-5 mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <FiLogIn className="mr-2 h-5 w-5" />
                                    Sign In
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-primary-100">
                        © 2025 SmartPark - Rubavu District, Rwanda
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;