import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import OrderTimeline from '../../components/OrderTimeline';
import Loading from '../../components/Loading';
import { orderAPI } from '../../services/api';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getById(id);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Auto refresh order status every 10 seconds for real-time delivery state updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Layout><Loading text="Loading order tracking status..." /></Layout>;
  if (!order) return <Layout><div className="alert alert-danger text-center">Order not found.</div></Layout>;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Live Order Tracking #{order.id}</h3>
          <p className="text-muted small">Real-time status updates from pharmacy fulfillment to doorstep delivery.</p>
        </div>
        <Link to="/user/orders" className="btn btn-outline-secondary rounded-pill px-4">
          <i className="bi bi-arrow-left me-1"></i> Back to Orders
        </Link>
      </div>

      {/* Visual Timeline component */}
      <OrderTimeline status={order.status} />

      {/* Order Details Grid */}
      <div className="row g-4 mt-2">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-shop text-primary me-2"></i>Fulfillment Pharmacy</h5>
            <p className="fw-bold mb-1">{order.pharmacy_name}</p>
            <p className="text-muted small mb-2">{order.pharmacy_address}</p>

            <hr />

            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-person-badge text-secondary me-2"></i>Delivery Agent</h5>
            <p className="fw-bold mb-1">{order.delivery_person_name}</p>
            <span className="badge bg-light text-dark border">Assigned Courier</span>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-bag-check text-success me-2"></i>Ordered Medicine Items</h5>
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0">
                <tbody>
                  {order.items?.map(item => (
                    <tr key={item.id} className="border-bottom">
                      <td><strong className="text-dark">{item.medicine_name}</strong></td>
                      <td>x {item.quantity}</td>
                      <td className="text-end fw-bold text-success">₹{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-3 pt-2">
              <span className="fw-bold fs-5 text-dark">Total Payable:</span>
              <span className="fw-bold fs-5 text-success">₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTrackingPage;
