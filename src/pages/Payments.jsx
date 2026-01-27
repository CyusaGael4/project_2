import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiDollarSign, FiSearch, FiPrinter, FiCheckCircle } from 'react-icons/fi';
import { paymentAPI, servicePackageAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [unpaidServices, setUnpaidServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        servicePackageId: '',
        amountPaid: '',
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0]
    });
    const [formLoading, setFormLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [paymentsRes, servicesRes] = await Promise.all([
                paymentAPI.getAll(),
                servicePackageAPI.getAll()
            ]);
            
            setPayments(paymentsRes.data.data || []);
            
            // Filter unpaid services
            const services = servicesRes.data.data || [];
            const paidServiceIds = (paymentsRes.data.data || []).map(p => p.servicePackage?._id);
            const unpaid = services.filter(s => !paidServiceIds.includes(s._id) && s.status !== 'paid');
            setUnpaidServices(unpaid);
        } catch (error) {
            console.error('Fetch data error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-fill amount when service is selected
        if (name === 'servicePackageId' && value) {
            const service = unpaidServices.find(s => s._id === value);
            if (service?.package?.packagePrice) {
                setFormData(prev => ({
                    ...prev,
                    servicePackageId: value,
                    amountPaid: service.package.packagePrice.toString()
                }));
                setSelectedService(service);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            servicePackageId: '',
            amountPaid: '',
            paymentMethod: 'cash',
            paymentDate: new Date().toISOString().split('T')[0]
        });
        setSelectedService(null);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const data = {
                ...formData,
                amountPaid: parseFloat(formData.amountPaid)
            };

            await paymentAPI.create(data);
            toast.success('Payment recorded successfully');
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setFormLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(amount) + ' RWF';
    };

    const filteredPayments = payments.filter(payment =>
        payment.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.servicePackage?.car?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.servicePackage?.package?.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

    if (loading) {
        return <LoadingSpinner text="Loading payments..." />;
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Payments</h1>
                    <p className="text-gray-500 mt-1">Manage payment records</p>
                </div>
                <button 
                    onClick={openModal} 
                    className="btn-primary"
                    disabled={unpaidServices.length === 0}
                >
                    <FiPlus className="mr-2 h-5 w-5" />
                    Record Payment
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <FiDollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-100">
                            <FiCheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Payments</p>
                            <p className="text-2xl font-bold text-orange-600">{unpaidServices.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-100">
                            <FiDollarSign className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card card-body">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by payment number, plate number, or package..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Payments Table */}
            <div className="card">
                <div className="table-container">
                    {filteredPayments.length === 0 ? (
                        <div className="p-12 text-center">
                            <FiDollarSign className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No payments found</h3>
                            <p className="text-gray-500 mt-1">
                                {searchTerm ? 'Try adjusting your search' : 'No payment records yet'}
                            </p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell">Payment #</th>
                                    <th className="table-header-cell">Car</th>
                                    <th className="table-header-cell">Package</th>
                                    <th className="table-header-cell">Amount</th>
                                    <th className="table-header-cell">Method</th>
                                    <th className="table-header-cell">Date</th>
                                    <th className="table-header-cell text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="table-row">
                                        <td className="table-cell font-semibold text-primary-600">
                                            {payment.paymentNumber}
                                        </td>
                                        <td className="table-cell">
                                            <div>
                                                <p className="font-medium">
                                                    {payment.servicePackage?.car?.plateNumber || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {payment.servicePackage?.car?.driverName || ''}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className="badge badge-info">
                                                {payment.servicePackage?.package?.packageName || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="table-cell font-bold text-green-600">
                                            {formatCurrency(payment.amountPaid)}
                                        </td>
                                        <td className="table-cell">
                                            <span className="badge badge-gray capitalize">
                                                {payment.paymentMethod?.replace('_', ' ') || 'cash'}
                                            </span>
                                        </td>
                                        <td className="table-cell text-gray-500">
                                            {formatDate(payment.paymentDate)}
                                        </td>
                                        <td className="table-cell text-right">
                                            <Link
                                                to={`/bill/${payment.servicePackage?._id}`}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex"
                                                title="Print Bill"
                                            >
                                                <FiPrinter className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Record New Payment"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Select Service Record *</label>
                        <select
                            name="servicePackageId"
                            value={formData.servicePackageId}
                            onChange={handleChange}
                            className="select-field"
                            required
                        >
                            <option value="">-- Select unpaid service --</option>
                            {unpaidServices.map(service => (
                                <option key={service._id} value={service._id}>
                                    {service.recordNumber} - {service.car?.plateNumber} - {service.package?.packageName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedService && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p className="text-gray-500">Car:</p>
                                <p>{selectedService.car?.plateNumber}</p>
                                <p className="text-gray-500">Driver:</p>
                                <p>{selectedService.car?.driverName}</p>
                                <p className="text-gray-500">Package:</p>
                                <p>{selectedService.package?.packageName}</p>
                                <p className="text-gray-500">Price:</p>
                                <p className="font-bold text-green-600">
                                    {formatCurrency(selectedService.package?.packagePrice)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="input-label">Amount Paid (RWF) *</label>
                        <input
                            type="number"
                            name="amountPaid"
                            value={formData.amountPaid}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter amount"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="input-label">Payment Method *</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="select-field"
                            required
                        >
                            <option value="cash">Cash</option>
                            <option value="mobile_money">Mobile Money</option>
                            <option value="card">Card</option>
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Payment Date *</label>
                        <input
                            type="date"
                            name="paymentDate"
                            value={formData.paymentDate}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={closeModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={formLoading} className="btn-success">
                            {formLoading ? (
                                <div className="flex items-center">
                                    <div className="spinner w-4 h-4 mr-2"></div>
                                    Recording...
                                </div>
                            ) : (
                                <>
                                    <FiCheckCircle className="mr-2 h-4 w-4" />
                                    Record Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Payments;