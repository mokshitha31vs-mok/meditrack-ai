import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import EmptyState from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Shopping Cart</h3>
        <p className="text-muted small">Review selected medicines before placing your order.</p>
      </div>

      {items.length > 0 ? (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h6 className="fw-bold text-dark mb-0">Pharmacy: <span className="text-primary">{cart.pharmacy_name || 'Selected Pharmacy'}</span></h6>
                <button className="btn btn-sm btn-outline-danger border-0" onClick={clearCart}>
                  <i className="bi bi-trash me-1"></i> Clear Cart
                </button>
              </div>

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Medicine Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th className="text-end">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong className="text-dark d-block">{item.medicine_name}</strong>
                        </td>
                        <td>₹{item.price}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{ maxWidth: '110px' }}>
                            <button 
                              className="btn btn-sm btn-light border px-2 py-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >-</button>
                            <span className="fw-bold">{item.quantity}</span>
                            <button 
                              className="btn btn-sm btn-light border px-2 py-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >+</button>
                          </div>
                        </td>
                        <td className="text-end fw-bold text-success">₹{item.subtotal}</td>
                        <td className="text-end">
                          <button className="btn btn-sm text-danger border-0" onClick={() => removeFromCart(item.id)}>
                            <i className="bi bi-x-circle-fill fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold text-dark mb-3">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-bold text-dark">₹{cart.total_amount}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Delivery Fee:</span>
                <span className="text-success fw-bold">FREE</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="fs-5 fw-bold text-dark">Total:</span>
                <span className="fs-5 fw-bold text-success">₹{cart.total_amount}</span>
              </div>

              <button 
                className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold shadow-sm"
                onClick={() => navigate('/user/checkout')}
              >
                Proceed to Checkout <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState 
          icon="bi-cart-x"
          title="Your Cart is Empty"
          description="Browse nearby pharmacies or compare prices to add medicines."
          actionButton={
            <Link to="/user/pharmacy-comparison" className="btn btn-primary rounded-pill px-4">
              Browse Medicines
            </Link>
          }
        />
      )}
    </Layout>
  );
};

export default CartPage;
