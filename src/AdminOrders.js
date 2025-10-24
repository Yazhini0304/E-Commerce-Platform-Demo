import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOrders = ({ apiBase }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/orders`);
      setOrders(
        response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Could not fetch orders. Check if JSON Server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [apiBase]);

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      await axios.patch(`${apiBase}/orders/${orderId}`, { status: newStatus });
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      fetchOrders();
      alert(`Failed to update order ${orderId}.`);
    }
  };

  
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '8px 10px',
      borderRadius: '6px',
      fontWeight: '600',
      border: '1px solid',
      cursor: 'pointer',
    };
    switch (status) {
      case 'Delivered':
        return { ...baseStyle, background: '#e6f4ea', color: '#15803d', borderColor: '#86efac' };
      case 'Shipped':
        return { ...baseStyle, background: '#e0f2fe', color: '#0369a1', borderColor: '#7dd3fc' };
      case 'Cancelled':
        return { ...baseStyle, background: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' };
      default:
        return { ...baseStyle, background: '#fef9c3', color: '#92400e', borderColor: '#fde68a' };
    }
  };

  
  const styles = {
    container: {
      padding: '40px',
      backgroundColor: '#ffffff',
      minHeight: '90vh',
      borderRadius: '15px',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
      fontFamily: 'Segoe UI, sans-serif',
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#3123e9ff',
      marginBottom: '15px',
      borderBottom: '4px solid #3123e9ff',
      paddingBottom: '10px',
    },
    subText: {
      color: '#555',
      fontSize: '14px',
      marginBottom: '25px',
      fontWeight: '500',
    },
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
      backgroundColor: '#fff',
      borderRadius: '10px',
      border: '1px solid #ddd',
      boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '15px',
    },
    th: {
      backgroundColor: '#3123e9ff',
      color: '#ffffff',
      textAlign: 'left',
      padding: '12px 15px',
      fontWeight: '700',
      textTransform: 'uppercase',
      fontSize: '13px',
      borderBottom: '2px solid #1e1ab8',
    },
    td: {
      padding: '12px 15px',
      borderBottom: '1px solid #eee',
      color: '#333',
    },
    rowHover: {
      backgroundColor: '#f3f4ff',
    },
    total: {
      color: '#3123e9ff',
      fontWeight: '800',
    },
    error: {
      color: '#b91c1c',
      textAlign: 'center',
      padding: '30px',
      fontWeight: '600',
      fontSize: '18px',
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '18px',
      color: '#555',
      fontWeight: '600',
    },
  };

  if (loading)
    return <div style={styles.loading}>Loading Admin Dashboard...</div>;
  if (error)
    return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Order Fulfillment Center</h3>
      <p style={styles.subText}>
        Total Orders: {orders.length}. Status updates auto-refresh every 5 seconds.
      </p>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>User ID</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                style={{ transition: '0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={styles.td}>{order.id}</td>
                <td style={styles.td}>{order.userId}</td>
                <td style={styles.td}>
  {order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not Available'}
</td>

                <td style={{ ...styles.td, ...styles.total }}>
                  Rs.{order.total.toFixed(2)}
                </td>
                <td style={styles.td}>
                  {order.items.map(item => `(x${item.quantity})`).join(', ')}
                </td>
                <td style={styles.td}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={getStatusStyle(order.status)}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
