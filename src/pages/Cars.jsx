import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTruck, FiSearch } from 'react-icons/fi';
import { carAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const Cars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [formData, setFormData] = useState({
        plateNumber: '',
        carType: '',
        carSize: 'Medium',
        driverName: '',
        phoneNumber: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            setLoading(true);
            const response = await carAPI.getAll();
            setCars(response.data.data || []);
        } catch (error) {
            console.error('Fetch cars error:', error);
            toast.error('Failed to load cars');
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
            plateNumber: '',
            carType: '',
            carSize: 'Medium',
            driverName: '',
            phoneNumber: ''
        });
        setEditingCar(null);
    };

    const openModal = (car = null) => {
        if (car) {
            setEditingCar(car);
            setFormData({
                plateNumber: car.plateNumber,
                carType: car.carType,
                carSize: car.carSize,
                driverName: car.driverName,
                phoneNumber: car.phoneNumber
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
            if (editingCar) {
                await carAPI.update(editingCar._id, formData);
                toast.success('Car updated successfully');
            } else {
                await carAPI.create(formData);
                toast.success('Car registered successfully');
            }
            fetchCars();
            closeModal();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                await carAPI.delete(id);
                toast.success('Car deleted successfully');
                fetchCars();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete car');
            }
        }
    };

    const filteredCars = cars.filter(car =>
        car.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.carType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const carSizes = ['Small', 'Medium', 'Large', 'SUV', 'Truck'];

    if (loading) {
        return <LoadingSpinner text="Loading cars..." />;
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Cars Management</h1>
                    <p className="text-gray-500 mt-1">Manage registered cars in the system</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    <FiPlus className="mr-2 h-5 w-5" />
                    Register New Car
                </button>
            </div>

            {/* Search */}
            <div className="card card-body">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by plate number, driver name, or car type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Cars Table */}
            <div className="card">
                <div className="table-container">
                    {filteredCars.length === 0 ? (
                        <div className="p-12 text-center">
                            <FiTruck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No cars found</h3>
                            <p className="text-gray-500 mt-1">
                                {searchTerm ? 'Try adjusting your search' : 'Get started by registering a new car'}
                            </p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell">Plate Number</th>
                                    <th className="table-header-cell">Car Type</th>
                                    <th className="table-header-cell">Size</th>
                                    <th className="table-header-cell">Driver Name</th>
                                    <th className="table-header-cell">Phone Number</th>
                                    <th className="table-header-cell text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredCars.map((car) => (
                                    <tr key={car._id} className="table-row">
                                        <td className="table-cell font-semibold text-primary-600">
                                            {car.plateNumber}
                                        </td>
                                        <td className="table-cell">{car.carType}</td>
                                        <td className="table-cell">
                                            <span className="badge badge-gray">{car.carSize}</span>
                                        </td>
                                        <td className="table-cell">{car.driverName}</td>
                                        <td className="table-cell">{car.phoneNumber}</td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => openModal(car)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(car._id)}
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
                Showing {filteredCars.length} of {cars.length} cars
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCar ? 'Edit Car' : 'Register New Car'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Plate Number *</label>
                        <input
                            type="text"
                            name="plateNumber"
                            value={formData.plateNumber}
                            onChange={handleChange}
                            className="input-field uppercase"
                            placeholder="e.g., RAB 123A"
                            required
                            disabled={editingCar}
                        />
                    </div>

                    <div>
                        <label className="input-label">Car Type *</label>
                        <input
                            type="text"
                            name="carType"
                            value={formData.carType}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Toyota Corolla"
                            required
                        />
                    </div>

                    <div>
                        <label className="input-label">Car Size *</label>
                        <select
                            name="carSize"
                            value={formData.carSize}
                            onChange={handleChange}
                            className="select-field"
                            required
                        >
                            {carSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Driver Name *</label>
                        <input
                            type="text"
                            name="driverName"
                            value={formData.driverName}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter driver's full name"
                            required
                        />
                    </div>

                    <div>
                        <label className="input-label">Phone Number *</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., 0788123456"
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
                                    {editingCar ? 'Updating...' : 'Registering...'}
                                </div>
                            ) : (
                                editingCar ? 'Update Car' : 'Register Car'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Cars;