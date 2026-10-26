import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'No. 42, Mount Road, T. Nagar, Chennai');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setPlacing(true);
      const res = await orderAPI.place({
        delivery_address: deliveryAddress,
        payment_method: paymentMethod
      });
      setToast({ message: 'Order placed successfully!', type: 'success' });
      await fetchCart();
      setTimeout(() => {
        navigate(`/user/orders/${res.data.order.id}`);
      }, 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to place order.', type: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Medicine Order Checkout</h3>
        <p className="text-muted small">Confirm delivery details and payment mode.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            {/* Payment Method Notice */}
            <div className="alert alert-light border rounded-3 small mb-4 text-secondary">
              <i className="bi bi-cash-stack me-2 text-primary"></i>
              <strong>Payment Method:</strong> Orders are placed with Cash on Delivery (COD). Digital payment gateway integration is pending merchant banking approval.
            </div>

            <form onSubmit={handlePlaceOrder}>
              <h5 className="fw-bold text-dark mb-3">1. Delivery Address</h5>
              <div className="mb-4">
                <textarea 
                  className="form-control rounded-3 p-3" 
                  rows="3"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <h5 className="fw-bold text-dark mb-3">2. Payment Method</h5>
              <div className="form-check p-3 border rounded-3 bg-light mb-4">
                <input 
                  className="form-check-input ms-1 me-2" 
                  type="radio" 
                  name="payment" 
                  id="cod" 
                  checked={paymentMethod === 'Cash on Delivery'} 
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                />
                <label className="form-check-label fw-bold text-dark" htmlFor="cod">
                  Cash on Delivery (COD)
                </label>
                <div className="text-muted small ms-4">Pay upon physical doorstep delivery.</div>
              </div>

              <h5 className="fw-bold text-dark mb-3">3. Order Summary</h5>
              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Pharmacy:</span>
                  <strong className="text-dark">{cart.pharmacy_name || 'Selected Pharmacy'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Payable:</span>
                  <strong className="text-success fs-5">₹{cart.total_amount}</strong>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/user/cart')}>
                  Back to Cart
                </button>
                <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" disabled={placing}>
                  {placing ? 'Placing Order...' : 'Confirm & Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
