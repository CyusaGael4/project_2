import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FiTruck, 
    FiPackage, 
    FiFileText, 
    FiDollarSign,
    FiTrendingUp,
    FiCalendar,
    FiArrowRight
} from 'react-icons/fi';
import { carAPI, packageAPI, servicePackageAPI, paymentAPI, reportAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCars: 0,
        totalPackages: 0,
        totalServices: 0,
        totalPayments: 0,
        todayRevenue: 0,
        totalRevenue: 0
    });
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const [carsRes, packagesRes, servicesRes, paymentsRes, summaryRes] = await Promise.all([
                carAPI.getAll(),
                packageAPI.getAll(),
                servicePackageAPI.getAll(),
                paymentAPI.getAll(),
                reportAPI.getSummary()
            ]);

            setStats({
                totalCars: carsRes.data.count || 0,
                totalPackages: packagesRes.data.count || 0,
                totalServices: servicesRes.data.count || 0,
                totalPayments: paymentsRes.data.count || 0,
                totalRevenue: summaryRes.data.data?.totalRevenue || 0
            });

            // Get recent payments (last 5)
            const payments = paymentsRes.data.data || [];
            setRecentPayments(payments.slice(0, 5));

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(amount) + ' RWF';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    const statCards = [
        {
            title: 'Total Cars',
            value: stats.totalCars,
            icon: FiTruck,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            link: '/cars'
        },
        {
            title: 'Packages',
            value: stats.totalPackages,
            icon: FiPackage,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            link: '/packages'
        },
        {
            title: 'Service Records',
            value: stats.totalServices,
            icon: FiFileText,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            link: '/service-packages'
        },
        {
            title: 'Total Payments',
            value: stats.totalPayments,
            icon: FiDollarSign,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            link: '/payments'
        }
    ];

    return (
        <div className="space-y-6 fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome to SmartPark Car Washing Management System</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-500">
                    <FiCalendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Link 
                        key={index} 
                        to={stat.link}
                        className="stat-card group hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500 group-hover:text-primary-600 transition-colors">
                            <span>View details</span>
                            <FiArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Revenue Card */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50">
                            <FiTrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Payments */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <h2 className="section-title">Recent Payments</h2>
                    <Link to="/payments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all →
                    </Link>
                </div>
                <div className="card-body p-0">
                    {recentPayments.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <FiDollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p>No payments recorded yet</p>
                        </div>
                    ) : (
                        <div className="table-container border-0">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">Payment #</th>
                                        <th className="table-header-cell">Car</th>
                                        <th className="table-header-cell">Package</th>
                                        <th className="table-header-cell">Amount</th>
                                        <th className="table-header-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {recentPayments.map((payment) => (
                                        <tr key={payment._id} className="table-row">
                                            <td className="table-cell font-medium">{payment.paymentNumber}</td>
                                            <td className="table-cell">
                                                {payment.servicePackage?.car?.plateNumber || 'N/A'}
                                            </td>
                                            <td className="table-cell">
                                                <span className="badge badge-info">
                                                    {payment.servicePackage?.package?.packageName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="table-cell font-semibold text-green-600">
                                                {formatCurrency(payment.amountPaid)}
                                            </td>
                                            <td className="table-cell text-gray-500">
                                                {formatDate(payment.paymentDate)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link 
                    to="/cars" 
                    className="card card-body flex items-center space-x-4 hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <FiTruck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Register New Car</h3>
                        <p className="text-sm text-gray-500">Add a new car to the system</p>
                    </div>
                </Link>

                <Link 
                    to="/service-packages" 
                    className="card card-body flex items-center space-x-4 hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="p-3 rounded-xl bg-orange-100 group-hover:bg-orange-200 transition-colors">
                        <FiFileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">New Service Record</h3>
                        <p className="text-sm text-gray-500">Create a service for a car</p>
                    </div>
                </Link>

                <Link 
                    to="/reports" 
                    className="card card-body flex items-center space-x-4 hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                        <FiTrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">View Reports</h3>
                        <p className="text-sm text-gray-500">Generate daily reports</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;