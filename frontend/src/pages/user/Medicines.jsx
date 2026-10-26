import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { medicineAPI } from '../../services/api';

const MedicinesSearch = () => {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMedicines = async (searchQuery = '') => {
    try {
      setLoading(true);
      const res = await medicineAPI.search(searchQuery);
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(query);
  };

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Medicine Search Catalog</h3>
        <p className="text-muted small">Search pharmaceutical drugs, strength variants & generic formulations.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <form onSubmit={handleSearch} className="row g-2">
          <div className="col">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input 
                type="text" 
                className="form-control bg-light border-start-0 py-2" 
                placeholder="Search medicine by name or generic formula (e.g. Amoxicillin, Paracetamol)..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary px-4 fw-semibold rounded-pill">Search</button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loading text="Searching medicine database..." />
      ) : medicines.length > 0 ? (
        <div className="row g-3">
          {medicines.map(m => (
            <div className="col-md-6 col-lg-4" key={m.id}>
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold text-dark mb-0">{m.name}</h6>
                  <span className="badge bg-primary-subtle text-primary">{m.strength}</span>
                </div>
                <p className="text-muted small mb-2">Generic: <strong className="text-dark">{m.generic_name || 'N/A'}</strong></p>
                <p className="text-muted extra-small mb-3">{m.description}</p>
                <Link to={`/user/pharmacy-comparison`} className="btn btn-outline-primary btn-sm rounded-pill mt-auto">
                  Compare Pharmacy Prices <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="bi-capsule" title="No Medicines Found" description="Try searching for a different drug name." />
      )}
    </Layout>
  );
};

export default MedicinesSearch;
