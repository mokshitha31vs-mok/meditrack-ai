import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { deliveryAPI } from '../../services/api';

const DeliveryHistoryPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await deliveryAPI.getAll();
        setDeliveries(res.data.filter(d => d.status === 'DELIVERED'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Layout><Loading text="Loading delivery logs..." /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Completed Delivery History</h3>
        <p className="text-muted small">Historical logs of fulfilled medicine shipments.</p>
      </div>

      {deliveries.length > 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Pickup Pharmacy</th>
                  <th>Customer Address</th>
                  <th>Delivered Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id}>
                    <td><strong className="text-primary">#{d.order_id}</strong></td>
                    <td>{d.order?.pharmacy_name}</td>
                    <td className="small text-muted">{d.order?.delivery_address}</td>
                    <td className="text-muted small">
                      {d.delivered_time ? new Date(d.delivered_time).toLocaleString() : 'Delivered'}
                    </td>
                    <td><span className="badge bg-success rounded-pill px-3">DELIVERED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon="bi-clock-history" title="No Completed Deliveries Yet" description="Completed doorstep dropoffs will be archived here." />
      )}
    </Layout>
  );
};

export default DeliveryHistoryPage;
