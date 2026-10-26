import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="d-flex align-items-center gap-2">
        <span className="fw-semibold text-muted d-none d-md-inline" style={{ fontSize: '0.9rem' }}>
          Role: <strong className="text-dark text-capitalize">{user?.role}</strong>
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {user?.role === 'patient' && (
          <Link to="/user/cart" className="btn btn-light border position-relative rounded-pill px-3 py-1">
            <i className="bi bi-cart3 me-1 text-primary"></i> Cart
            {itemCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {itemCount}
              </span>
            )}
          </Link>
        )}

        <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle rounded-pill px-3 py-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="bi bi-person-circle me-1"></i> {user?.name || 'Account'}
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            {user?.role === 'patient' && (
              <li><Link className="dropdown-item" to="/user/profile"><i className="bi bi-person me-2"></i> Patient Profile</Link></li>
            )}
            {user?.role === 'doctor' && (
              <li><Link className="dropdown-item" to="/doctor/profile"><i className="bi bi-person-badge me-2"></i> Clinical Profile</Link></li>
            )}
            {user?.role === 'pharmacy' && (
              <li><Link className="dropdown-item" to="/pharmacy/profile"><i className="bi bi-building me-2"></i> Pharmacy Profile</Link></li>
            )}
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
