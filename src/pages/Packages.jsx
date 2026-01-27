import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import { packageAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        packageNumber: '',
        packageName: '',
        packageDescription: '',
        packagePrice: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await packageAPI.getAll();
            setPackages(response.data.data || []);
        } catch (error) {
            console.error('Fetch packages error:', error);
            toast.error('Failed to load packages');
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
            packageNumber: '',
            packageName: '',
            packageDescription: '',
            packagePrice: ''
        });
        setEditingPackage(null);
    };

    const openModal = (pkg = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({
                packageNumber: pkg.packageNumber,
                packageName: pkg.packageName,
                packageDescription: pkg.packageDescription,
                packagePrice: pkg.packagePrice.toString()
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
            const data = {
                ...formData,
                packagePrice: parseFloat(formData.packagePrice)
            };

            if (editingPackage) {
                await packageAPI.update(editingPackage._id, data);
                toast.success('Package updated successfully');
            } else {
                await packageAPI.create(data);
                toast.success('Package created successfully');
            }
            fetchPackages();
            closeModal();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await packageAPI.delete(id);
                toast.success('Package deleted successfully');
                fetchPackages();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete package');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(amount) + ' RWF';
    };

    if (loading) {
        return <LoadingSpinner text="Loading packages..." />;
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Service Packages</h1>
                    <p className="text-gray-500 mt-1">Manage car washing service packages</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    <FiPlus className="mr-2 h-5 w-5" />
                    Add New Package
                </button>
            </div>

            {/* Packages Grid */}
            {packages.length === 0 ? (
                <div className="card card-body text-center py-12">
                    <FiPackage className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No packages found</h3>
                    <p className="text-gray-500 mt-1">Get started by creating a new package</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg._id} className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 rounded-xl bg-purple-100">
                                            <FiPackage className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500">{pkg.packageNumber}</span>
                                            <h3 className="font-semibold text-gray-900">{pkg.packageName}</h3>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-4 text-gray-600 text-sm">{pkg.packageDescription}</p>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Price</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {formatCurrency(pkg.packagePrice)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openModal(pkg)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pkg._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingPackage ? 'Edit Package' : 'Add New Package'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Package Number *</label>
                        <input
                            type="text"
                            name="packageNumber"
                            value={formData.packageNumber}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., PKG001"
                            required
                            disabled={editingPackage}
                        />
                    </div>

                    <div>
                        <label className="input-label">Package Name *</label>
                        <input
                            type="text"
                            name="packageName"
                            value={formData.packageName}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Premium Wash"
                            required
                        />
                    </div>

                    <div>
                        <label className="input-label">Description *</label>
                        <textarea
                            name="packageDescription"
                            value={formData.packageDescription}
                            onChange={handleChange}
                            className="input-field"
                            rows="3"
                            placeholder="Describe the package services..."
                            required
                        />
                    </div>

                    <div>
                        <label className="input-label">Price (RWF) *</label>
                        <input
                            type="number"
                            name="packagePrice"
                            value={formData.packagePrice}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., 10000"
                            min="0"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={closeModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={formLoading} className="btn-primary">
                            {formLoading ? (
                                <div className="flex items-center">
                                    <div className="spinner w-4 h-4 mr-2"></div>
                                    {editingPackage ? 'Updating...' : 'Creating...'}
                                </div>
                            ) : (
                                editingPackage ? 'Update Package' : 'Create Package'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;