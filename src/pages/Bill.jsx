import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiCheckCircle, FiClock } from 'react-icons/fi';
import { paymentAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Bill = () => {
    const { servicePackageId } = useParams();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBill();
    }, [servicePackageId]);

    const fetchBill = async () => {
        try {
            setLoading(true);
            const response = await paymentAPI.getBill(servicePackageId);
            setBill(response.data.data);
        } catch (error) {
            console.error('Fetch bill error:', error);
            toast.error('Failed to load bill');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    if (loading) {
        return <LoadingSpinner text="Loading bill..." />;
    }

    if (!bill) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">Bill not found</h2>
                <Link to="/service-packages" className="btn-primary mt-4">
                    <FiArrowLeft className="mr-2 h-5 w-5" />
                    Back to Services
                </Link>
            </div>
        );
    }

    const isPaid = bill.payment?.status === 'Paid';

    return (
        <div className="max-w-3xl mx-auto fade-in">
            {/* Actions */}
            <div className="flex items-center justify-between mb-6 print:hidden">
                <Link to="/service-packages" className="btn-secondary">
                    <FiArrowLeft className="mr-2 h-5 w-5" />
                    Back
                </Link>
                <button onClick={handlePrint} className="btn-primary">
                    <FiPrinter className="mr-2 h-5 w-5" />
                    Print Bill
                </button>
            </div>

            {/* Bill Card */}
            <div className="card" id="printable-bill">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <span className="text-5xl">🚗</span>
                    </div>
                    <h1 className="text-3xl font-bold">SmartPark</h1>
                    <p className="text-primary-100 mt-1">Car Washing Sales Management System</p>
                    <p className="text-primary-200 text-sm mt-2">{bill.companyLocation}</p>
                </div>

                {/* Bill Title */}
                <div className="p-6 border-b border-gray-200 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">SERVICE INVOICE</h2>
                    <p className="text-gray-500 mt-1">Record #: {bill.service?.recordNumber}</p>
                    <p className="text-gray-500 text-sm">Date: {formatDate(bill.billDate)}</p>
                </div>

                {/* Car & Driver Info */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Plate Number</p>
                            <p className="font-semibold text-lg text-primary-600">{bill.car?.plateNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Car Type</p>
                            <p className="font-medium">{bill.car?.carType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Driver Name</p>
                            <p className="font-medium">{bill.car?.driverName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium">{bill.car?.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Car Size</p>
                            <p className="font-medium">{bill.car?.carSize}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Service Date</p>
                            <p className="font-medium">{formatDate(bill.service?.serviceDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Service Details */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell">Package</th>
                                    <th className="table-header-cell">Description</th>
                                    <th className="table-header-cell text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                <tr>
                                    <td className="table-cell font-semibold">{bill.package?.name}</td>
                                    <td className="table-cell text-gray-600">{bill.package?.description}</td>
                                    <td className="table-cell text-right font-bold text-green-600">
                                        {formatCurrency(bill.package?.price)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                                        Total Amount:
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600 text-xl">
                                        {formatCurrency(bill.package?.price)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    
                    {isPaid ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <FiCheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <span className="text-lg font-semibold text-green-800">Payment Completed</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment Number</p>
                                    <p className="font-medium">{bill.payment?.paymentNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount Paid</p>
                                    <p className="font-bold text-green-600">{formatCurrency(bill.payment?.amountPaid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="font-medium capitalize">{bill.payment?.paymentMethod?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Date</p>
                                    <p className="font-medium">{formatDate(bill.payment?.paymentDate)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <FiClock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <span className="text-lg font-semibold text-yellow-800">Payment Pending</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-gray-700">Amount Due:</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {formatCurrency(bill.payment?.amountDue)}
                                </p>
                            </div>
                            <Link to="/payments" className="btn-warning w-full mt-4 print:hidden">
                                Record Payment
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
                    <p className="text-gray-600 text-sm">Thank you for choosing SmartPark!</p>
                    <p className="text-gray-500 text-xs mt-1">
                        For inquiries, please contact us at Rubavu District, Western Province, Rwanda
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400">
                            This is a computer-generated invoice. Generated on {formatDate(new Date())}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bill;