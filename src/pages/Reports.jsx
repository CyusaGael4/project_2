import React, { useState, useEffect } from 'react';
import { FiCalendar, FiDownload, FiBarChart2, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { reportAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
    const [dailyReport, setDailyReport] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        fetchSummary();
        fetchDailyReport(selectedDate);
    }, []);

    const fetchSummary = async () => {
        try {
            const response = await reportAPI.getSummary();
            setSummary(response.data.data);
        } catch (error) {
            console.error('Fetch summary error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyReport = async (date) => {
        try {
            setReportLoading(true);
            const response = await reportAPI.getDaily(date);
            setDailyReport(response.data.data || []);
        } catch (error) {
            console.error('Fetch daily report error:', error);
            toast.error('Failed to load daily report');
        } finally {
            setReportLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        fetchDailyReport(date);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(amount) + ' RWF';
    };

    const handlePrint = () => {
        window.print();
    };

    const totalDailyAmount = dailyReport.reduce((sum, item) => sum + (item.amountPaid || 0), 0);

    if (loading) {
        return <LoadingSpinner text="Loading reports..." />;
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Reports</h1>
                    <p className="text-gray-500 mt-1">View daily reports and statistics</p>
                </div>
                <button onClick={handlePrint} className="btn-primary print:hidden">
                    <FiDownload className="mr-2 h-5 w-5" />
                    Print Report
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900">{summary?.totalPayments || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <FiDollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Services</p>
                            <p className="text-2xl font-bold text-gray-900">{summary?.totalServices || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100">
                            <FiBarChart2 className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Cars</p>
                            <p className="text-2xl font-bold text-gray-900">{summary?.totalCars || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-100">
                            <FiTrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatCurrency(summary?.totalRevenue || 0)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-100">
                            <FiDollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue by Package */}
            {summary?.revenueByPackage && summary.revenueByPackage.length > 0 && (
                <div className="card print:hidden">
                    <div className="card-header">
                        <h2 className="section-title">Revenue by Package</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {summary.revenueByPackage.map((item, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <p className="font-medium text-gray-900">{item._id}</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {formatCurrency(item.totalRevenue)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">{item.count} services</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Report */}
            <div className="card" id="printable-report">
                <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="section-title flex items-center">
                        <FiCalendar className="mr-2 h-5 w-5 text-gray-400" />
                        Daily Report
                    </h2>
                    <div className="flex items-center space-x-2 print:hidden">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Print Header */}
                <div className="hidden print:block p-6 text-center border-b">
                    <h1 className="text-2xl font-bold">SmartPark CWSMS</h1>
                    <p className="text-gray-600">Rubavu District, Western Province, Rwanda</p>
                    <p className="text-lg font-semibold mt-2">Daily Report - {formatDate(selectedDate)}</p>
                </div>

                <div className="card-body p-0">
                    {reportLoading ? (
                        <div className="p-12">
                            <LoadingSpinner text="Loading report..." />
                        </div>
                    ) : dailyReport.length === 0 ? (
                        <div className="p-12 text-center">
                            <FiBarChart2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No data for this date</h3>
                            <p className="text-gray-500 mt-1">No payments were recorded on {formatDate(selectedDate)}</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-container border-0">
                                <table className="table">
                                    <thead className="table-header">
                                        <tr>
                                            <th className="table-header-cell">#</th>
                                            <th className="table-header-cell">Plate Number</th>
                                            <th className="table-header-cell">Package Name</th>
                                            <th className="table-header-cell">Package Description</th>
                                            <th className="table-header-cell">Amount Paid</th>
                                            <th className="table-header-cell">Payment Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-body">
                                        {dailyReport.map((item, index) => (
                                            <tr key={index} className="table-row">
                                                <td className="table-cell">{index + 1}</td>
                                                <td className="table-cell font-semibold">{item.plateNumber}</td>
                                                <td className="table-cell">
                                                    <span className="badge badge-info">{item.packageName}</span>
                                                </td>
                                                <td className="table-cell text-gray-600">{item.packageDescription}</td>
                                                <td className="table-cell font-bold text-green-600">
                                                    {formatCurrency(item.amountPaid)}
                                                </td>
                                                <td className="table-cell text-gray-500">
                                                    {formatDate(item.paymentDate)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-100">
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-right font-semibold text-gray-900">
                                                Total:
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-600 text-lg">
                                                {formatCurrency(totalDailyAmount)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Print Footer */}
                            <div className="hidden print:block p-6 border-t text-center">
                                <p className="text-sm text-gray-600">
                                    Generated on {new Date().toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Total Records: {dailyReport.length} | Total Revenue: {formatCurrency(totalDailyAmount)}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;