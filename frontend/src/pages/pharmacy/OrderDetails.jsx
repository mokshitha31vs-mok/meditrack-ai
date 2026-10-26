import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { orderAPI, adminAPI, deliveryAPI } from '../../services/api';

const PharmacyOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordRes, delRes] = await Promise.all([
          orderAPI.getById(id),
          adminAPI.getDeliveryPersonnel()
        ]);
        setOrder(ordRes.data);
        setDeliveryPersonnel(delRes.data);
        if (delRes.data.length > 0) setSelectedPersonnelId(delRes.data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAssignDelivery = async () => {
    try {
      await deliveryAPI.assign({
        order_id: order.id,
        delivery_person_id: parseInt(selectedPersonnelId)
      });
      setToast({ message: 'Delivery personnel assigned successfully!', type: 'success' });
      const res = await orderAPI.getById(id);
      setOrder(res.data);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to assign delivery', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading order fulfillment details..." /></Layout>;
  if (!order) return <Layout><div className="alert alert-danger">Order not found</div></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Fulfillment Details for Order #{order.id}</h3>
          <p className="text-muted small">Review customer prescription order items & assign delivery drivers.</p>
        </div>
        <Link to="/pharmacy/orders" className="btn btn-outline-secondary rounded-pill px-4">
          <i className="bi bi-arrow-left me-1"></i> Back to Orders
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Customer Information</h5>
            <div className="mb-2"><strong>Name:</strong> {order.customer_name}</div>
            <div className="mb-2"><strong>Phone:</strong> {order.customer_phone || 'N/A'}</div>
            <div className="mb-2"><strong>Delivery Address:</strong> {order.delivery_address}</div>
            <div className="mb-2"><strong>Payment Method:</strong> {order.payment_method}</div>
            <div><strong>Current Order Status:</strong> <span className="badge bg-primary ms-1">{order.status}</span></div>
          </div>

          {/* Delivery Assignment Module */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3">Assign Delivery Courier</h5>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Available Delivery Drivers</label>
              <select 
                className="form-select rounded-3"
                value={selectedPersonnelId}
                onChange={e => setSelectedPersonnelId(e.target.value)}
              >
                {deliveryPersonnel.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleAssignDelivery}>
              Assign Delivery Driver
            </button>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3">Order Medicine Manifest</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Medicine Item</th>
                    <th>Qty</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map(item => (
                    <tr key={item.id}>
                      <td><strong className="text-dark">{item.medicine_name}</strong></td>
                      <td>{item.quantity}</td>
                      <td className="text-end fw-bold text-success">₹{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between pt-3 border-top">
              <span className="fs-5 fw-bold text-dark">Order Total:</span>
              <span className="fs-5 fw-bold text-success">₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyOrderDetails;
