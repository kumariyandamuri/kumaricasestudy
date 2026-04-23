const { useState, useEffect } = React;

// Auto-detect: Dev (Live Server port 5500/5173) → call backend directly
//              Docker (port 80, nginx)           → use /api proxy
const DEV_PORTS = ['5500', '5173', '3000'];
const API_BASE = DEV_PORTS.includes(window.location.port)
    ? 'http://localhost:8080'   // Local Spring Boot (dev)
    : '/api';                    // nginx proxy (Docker)

// API Service
const api = {
    getCustomersByType: (type) => axios.get(`${API_BASE}/customer/controller/getCustomersByType/${type}`),
    updateCustomer: (customer) => axios.put(`${API_BASE}/customer/controller/updateCustomer`, customer),
    getOrdersByCustomerId: (id) => axios.get(`${API_BASE}/order/controller/getOrderDetailsByCustomerId/${id}`),
    getOrdersByFilter: (type, min, max) => axios.get(`${API_BASE}/order/controller/getOrderDetailsByCustomerTypeAndBillInRange/${type}--${min}--${max}`),
    updateProductStock: (product) => axios.put(`${API_BASE}/product/controller/updateProductStock`, product),
};

// Components
const Dashboard = () => (
    <div className="glass-panel">
        <h2><i className="fas fa-chart-line"></i> Dashboard</h2>
        <div className="dashboard-stats">
            <div className="stat-card">
                <div className="stat-value">5</div>
                <div className="stat-label">Total Customers</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">5</div>
                <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">3</div>
                <div className="stat-label">Customer Types</div>
            </div>
        </div>
        <div className="card">
            <h3 className="card-title">Welcome to Retail Management System</h3>
            <p className="card-content">Use the navigation bar to manage customers, orders, and products.</p>
        </div>
    </div>
);

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [type, setType] = useState('Platinum');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getCustomersByType(type);
            setCustomers(res.data || []);
        } catch (err) {
            if (err.response?.status === 404) {
                // No customers for this type — treat as empty, not an error
                setCustomers([]);
            } else {
                setError('Failed to fetch customers. Is the backend running on port 8080?');
                setCustomers([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateType = async (customerId, currentType) => {
        const newType = prompt(`Enter new type for customer ID ${customerId} (Silver, Gold, Platinum):`, currentType);
        if (newType && ['Silver', 'Gold', 'Platinum'].includes(newType)) {
            try {
                const res = await api.updateCustomer({ customerId, customerType: newType });
                setSuccess(res.data);
                fetchCustomers();
            } catch (err) {
                setError('Failed to update customer type.');
            }
        } else if (newType) {
            alert('Invalid type. Please enter Silver, Gold, or Platinum.');
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [type]);

    return (
        <div className="glass-panel">
            <h2><i className="fas fa-users"></i> Customer Management</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
                <label>Filter by Customer Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                </select>
            </div>

            {loading ? <p>Loading...</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.customerId}>
                                <td>{c.customerId}</td>
                                <td>{c.customerName}</td>
                                <td>{c.customerEmail}</td>
                                <td><span className="badge">{c.customerType}</span></td>
                                <td>
                                    <button className="btn" onClick={() => updateType(c.customerId, c.customerType)}>
                                        <i className="fas fa-edit"></i> Update Type
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>No customers found for type: <strong>{type}</strong></td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [searchType, setSearchType] = useState('customerId');

    // Form States
    const [customerId, setCustomerId] = useState('');
    const [custType, setCustType] = useState('Platinum');
    const [minBill, setMinBill] = useState('');
    const [maxBill, setMaxBill] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let res;
            if (searchType === 'customerId') {
                if (!customerId) { setLoading(false); return setError('Customer ID is required'); }
                res = await api.getOrdersByCustomerId(customerId);
            } else {
                if (!minBill || !maxBill) { setLoading(false); return setError('Min and Max bill amounts are required'); }
                res = await api.getOrdersByFilter(custType, minBill, maxBill);
            }
            setOrders(res.data || []);
        } catch (err) {
            if (err.response?.status === 404) {
                // No orders found — treat as empty, not an error
                setOrders([]);
            } else {
                setError('Failed to fetch orders. Is the backend running on port 8080?');
                setOrders([]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel">
            <h2><i className="fas fa-shopping-cart"></i> Order Management</h2>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
                <label>Search By</label>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="customerId">Customer ID</option>
                    <option value="filter">Customer Type & Bill Range</option>
                </select>
            </div>

            <form onSubmit={fetchOrders} className="grid">
                {searchType === 'customerId' ? (
                    <div className="form-group">
                        <label>Customer ID</label>
                        <input type="number" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="e.g. 1" />
                    </div>
                ) : (
                    <>
                        <div className="form-group">
                            <label>Customer Type</label>
                            <select value={custType} onChange={(e) => setCustType(e.target.value)}>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Platinum">Platinum</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Min Bill Amount</label>
                            <input type="number" step="0.01" value={minBill} onChange={(e) => setMinBill(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Max Bill Amount</label>
                            <input type="number" step="0.01" value={maxBill} onChange={(e) => setMaxBill(e.target.value)} />
                        </div>
                    </>
                )}
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn"><i className="fas fa-search"></i> Search Orders</button>
                </div>
            </form>

            {loading ? <p>Loading...</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer ID</th>
                            <th>Product ID</th>
                            <th>Quantity</th>
                            <th>Billing Amount</th>
                            <th>Order Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.orderId}>
                                <td>{o.orderId}</td>
                                <td>{o.customerId}</td>
                                <td>{o.productId}</td>
                                <td>{o.quantity}</td>
                                <td>${o.billingAmount}</td>
                                <td>{o.orderDate}</td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>No orders found. Use the form above to search.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const ProductManagement = () => {
    const [productId, setProductId] = useState('');
    const [stock, setStock] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const updateStock = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (!productId || !stock) return setError('Please fill all fields.');
        if (parseInt(stock) < 0) return setError('Stock value cannot be negative.');

        try {
            const res = await api.updateProductStock({ productId: parseInt(productId), stock: parseInt(stock) });
            setMessage(res.data || 'Stock updated successfully');
            setProductId('');
            setStock('');
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`Product ID ${productId} not found. Please check the ID.`);
            } else {
                setError('Failed to update product stock. Is the backend running on port 8080?');
            }
        }
    };

    return (
        <div className="glass-panel">
            <h2><i className="fas fa-box"></i> Product Management</h2>
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form onSubmit={updateStock}>
                <div className="grid">
                    <div className="form-group">
                        <label>Product ID</label>
                        <input type="number" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Enter Product ID" />
                    </div>
                    <div className="form-group">
                        <label>New Stock Value</label>
                        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Enter new stock count" />
                    </div>
                </div>
                <button type="submit" className="btn"><i className="fas fa-save"></i> Update Stock</button>
            </form>
        </div>
    );
};

const App = () => {
    const [currentView, setCurrentView] = useState('dashboard');

    return (
        <>
            <nav className="navbar">
                <h1 onClick={() => setCurrentView('dashboard')}><i className="fas fa-store"></i> Retail App</h1>
                <div className="nav-links">
                    <button className={currentView === 'dashboard' ? 'active' : ''} onClick={() => setCurrentView('dashboard')}>Dashboard</button>
                    <button className={currentView === 'customers' ? 'active' : ''} onClick={() => setCurrentView('customers')}>Customers</button>
                    <button className={currentView === 'orders' ? 'active' : ''} onClick={() => setCurrentView('orders')}>Orders</button>
                    <button className={currentView === 'products' ? 'active' : ''} onClick={() => setCurrentView('products')}>Products</button>
                </div>
            </nav>
            <main className="container">
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'customers' && <CustomerManagement />}
                {currentView === 'orders' && <OrderManagement />}
                {currentView === 'products' && <ProductManagement />}
            </main>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
