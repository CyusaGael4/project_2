import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiSearch, FiDollarSign, FiPrinter } from 'react-icons/fi';
import { servicePackageAPI, carAPI, packageAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const ServicePackages = () => {
    const [servicePackages, setServicePackages] = useState([]);
    const [cars, setCars] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        carId: '',
        packageId: '',
        serviceDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesRes, carsRes, packagesRes] = await Promise.all([
                servicePackageAPI.getAll(),
                carAPI.getAll(),
                packageAPI.getAll()
            ]);
            setServicePackages(servicesRes.data.data || []);
            setCars(carsRes.data.data || []);
            setPackages(packagesRes.data.data || []);
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
    };

    const resetForm = () => {
        setFormData({
            carId: '',
            packageId: '',
            serviceDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        });
        setEditingService(null);
    };

    const openModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                carId: service.car?._id || '',
                packageId: service.package?._id || '',
                serviceDate: new Date(service.serviceDate).toISOString().split('T')[0],
                status: service.status
            });
        } else {
            resetForm();
        }
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
            if (editingService) {
                await servicePackageAPI.update(editingService._id, formData);
                toast.success('Service record updated successfully');
            } else {
                await servicePackageAPI.create(formData);
                toast.success('Service record created successfully');
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service record?')) {
            try {
                await servicePackageAPI.delete(id);
                toast.success('Service record deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete service record');
            }
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: 'badge-warning',
            'in-progress': 'badge-info',
            completed: 'badge-success',
            paid: 'badge-success'
        };
        return statusConfig[status] || 'badge-gray';
    };

    const filteredServices = servicePackages.filter(service =>
        service.recordNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.car?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.package?.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner text="Loading service records..." />;
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Service Records</h1>
                    <p className="text-gray-500 mt-1">Manage car washing service records</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    <FiPlus className="mr-2 h-5 w-5" />
                    New Service Record
                </button>
            </div>

            {/* Search */}
            <div className="card card-body">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by record number, plate number, or package..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Service Records Table */}
            <div className="card">
                <div className="table-container">
                    {filteredServices.length === 0 ? (
                        <div className="p-12 text-center">
                            <FiFileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No service records found</h3>
                            <p className="text-gray-500 mt-1">
                                {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new service record'}
                            </p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell">Record #</th>
                                    <th className="table-header-cell">Car</th>
                                    <th className="table-header-cell">Package</th>
                                    <th className="table-header-cell">Price</th>
                                    <th className="table-header-cell">Date</th>
                                    <th className="table-header-cell">Status</th>
                                    <th className="table-header-cell text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredServices.map((service) => (
                                    <tr key={service._id} className="table-row">
                                        <td className="table-cell font-semibold text-primary-600">
                                            {service.recordNumber}
                                        </td>
                                        <td className="table-cell">
                                            <div>
                                                <p className="font-medium">{service.car?.plateNumber || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{service.car?.driverName || ''}</p>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className="badge badge-info">
                                                {service.package?.packageName || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="table-cell font-semibold text-green-600">
                                            {service.package ? formatCurrency(service.package.packagePrice) : 'N/A'}
                                        </td>
                                        <td className="table-cell text-gray-500">
                                            {formatDate(service.serviceDate)}
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge ${getStatusBadge(service.status)}`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    to={`/bill/${service._id}`}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="View Bill"
                                                >
                                                    <FiPrinter className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => openModal(service)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Total Count */}
            <div className="text-sm text-gray-500">
                Showing {filteredServices.length} of {servicePackages.length} service records
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingService ? 'Edit Service Record' : 'New Service Record'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Select Car *</label>
                        <select
                            name="carId"
                            value={formData.carId}
                            onChange={handleChange}
                            className="select-field"
                            required
                        >
                            <option value="">-- Select a car --</option>
                            {cars.map(car => (
                                <option key={car._id} value={car._id}>
                                    {car.plateNumber} - {car.driverName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Select Package *</label>
                        <select
                            name="packageId"
                            value={formData.packageId}
                            onChange={handleChange}
                            className="select-field"
                            required
                        >
                            <option value="">-- Select a package --</option>
                            {packages.map(pkg => (
                                <option key={pkg._id} value={pkg._id}>
                                    {pkg.packageName} - {formatCurrency(pkg.packagePrice)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Service Date *</label>
                        <input
                            type="date"
                            name="serviceDate"
                            value={formData.serviceDate}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>

                    {editingService && (
                        <div>
                            <label className="input-label">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="select-field"
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={closeModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={formLoading} className="btn-primary">
                            {formLoading ? (
                                <div className="flex items-center">
                                    <div className="spinner w-4 h-4 mr-2"></div>
                                    {editingService ? 'Updating...' : 'Creating...'}
                                </div>
                            ) : (
                                editingService ? 'Update Record' : 'Create Record'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ServicePackages;