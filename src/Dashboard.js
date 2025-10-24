import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE = 'http://localhost:5000';

//Order Status Update (Admin Only)
const OrderStatusUpdater = ({ order, onUpdate }) => {
  const [status, setStatus] = useState(order.status);

  const handleChange = (e) => {
    setStatus(e.target.value);
    onUpdate(order.id, e.target.value);
  };

  return (
    <select value={status} onChange={handleChange} className="order-status-select">
      <option value="On Process">On Process</option>
      <option value="Shipped">Shipped</option>
      <option value="Delivered">Delivered</option>
    </select>
  );
};

const Cart = ({ userId, products, fetchOrders, refreshProducts }) => {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({ street: '', city: '' });

  const fetchCartAndAddresses = useCallback(() => {
    if (!userId) return;
    axios.get(`${API_BASE}/cart?userId=${userId}`).then((res) => {
      const itemsWithDetails = res.data.map((item) => ({
        ...item,
        details: products.find((p) => p.id === item.productId),
      }));
      setCartItems(itemsWithDetails.filter((item) => item.details));
    });

    axios.get(`${API_BASE}/addresses?userId=${userId}`).then((res) => {
      setAddresses(res.data);
      if (res.data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(res.data[0].id.toString());
      }
    });
  }, [userId, products, selectedAddressId]);

  useEffect(() => {
    fetchCartAndAddresses();
  }, [fetchCartAndAddresses]);

 
  const handleQuantityChange = (itemId, newQty) => {
    const quantity = parseInt(newQty, 10);
    if (isNaN(quantity) || quantity <= 0) return;

    
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );

    
    axios
      .patch(`${API_BASE}/cart/${itemId}`, { quantity })
      .then(() => fetchCartAndAddresses())
      .catch((err) => console.error("Error updating quantity:", err));
  };

  const handleRemoveFromCart = (itemId) => {
    axios.delete(`${API_BASE}/cart/${itemId}`).then(fetchCartAndAddresses);
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddAddress = () => {
    if (newAddress.street && newAddress.city) {
      axios
        .post(`${API_BASE}/addresses`, { ...newAddress, userId })
        .then(() => {
          setNewAddress({ street: '', city: '' });
          fetchCartAndAddresses();
        });
    }
  };

  
  const handleConfirmOrder = () => {
    if (cartItems.length === 0) return alert('Your cart is empty.');
    if (!selectedAddressId) return alert('Please select or add a shipping address.');

    const total = cartItems.reduce(
      (sum, item) => sum + item.details.price * item.quantity,
      0
    );

    const orderData = {
      userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.details.price,
      })),
      total,
      shippingAddressId: parseInt(selectedAddressId),
      status: 'On Process',
      createdAt: new Date().toISOString(), 
    };

    axios
      .post(`${API_BASE}/orders`, orderData)
      .then(() => {
        const stockUpdatePromises = cartItems.map((item) => {
          const productDetail = item.details;
          const newStock = productDetail.stock - item.quantity;
          return axios.patch(`${API_BASE}/products/${productDetail.id}`, {
            stock: newStock,
          });
        });

        const deletePromises = cartItems.map((item) =>
          axios.delete(`${API_BASE}/cart/${item.id}`)
        );

        return Promise.all([...stockUpdatePromises, ...deletePromises]);
      })
      .then(() => {
        alert('Order Confirmed! Stock updated and Cart cleared.');
        setCartItems([]);
        fetchOrders();
        if (refreshProducts) refreshProducts();
      })
      .catch((error) => {
        console.error('Error during order confirmation/stock update:', error);
        alert('Order placed, but there was an error updating stock.');
      });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.details.price * item.quantity,
    0
  );

  return (
    <div className="cart-section">
      <h3>Your Cart (Checkout)</h3>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <p>
                  {item.details.name} - Rs.
                  {(item.details.price * item.quantity).toLocaleString('en-IN')}
                </p>

               
                <label>
                  Quantity:&nbsp;
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    style={{
                      width: '60px',
                      padding: '4px',
                      borderRadius: '5px',
                      border: '1px solid #ccc',
                    }}
                  />
                </label>

                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="btn-danger"
                  style={{
                    marginLeft: '10px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="checkout-summary">
            <h4>Subtotal: Rs.{subtotal.toLocaleString('en-IN')}</h4>

            <h4>Shipping Address</h4>
            <div className="address-select">
              {addresses.map((addr) => (
                <label key={addr.id}>
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId.toString() === addr.id.toString()}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  />
                  {addr.street}, {addr.city}
                </label>
              ))}
            </div>

            <div className="add-address-form">
              <input
                type="text"
                name="street"
                placeholder="Street"
                value={newAddress.street}
                onChange={handleNewAddressChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={newAddress.city}
                onChange={handleNewAddressChange}
              />
              <button onClick={handleAddAddress} className="btn-secondary">
                Add New Address
              </button>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="btn-primary"
              style={{
                backgroundColor: '#3123e9ff',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Confirm Order (Ignored Payment)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Wishlist = ({ userId, products }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = useCallback(() => {
    if (!userId) return;
    axios.get(`${API_BASE}/wishlist?userId=${userId}`).then((res) => {
      const itemsWithDetails = res.data.map((item) => ({
        ...item,
        details: products.find((p) => p.id === item.productId),
      }));
      setWishlistItems(itemsWithDetails.filter((item) => item.details));
    });
  }, [userId, products]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = (itemId) => {
    axios.delete(`${API_BASE}/wishlist/${itemId}`).then(fetchWishlist);
  };

  return (
    <div className="wishlist-section">
      <h3>Your Wishlist</h3>
      {wishlistItems.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-items">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-item">
              <p>
                {item.details.name} - Rs.
                {item.details.price.toLocaleString('en-IN')}
              </p>
              <button
                onClick={() => handleRemoveFromWishlist(item.id)}
                className="btn-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrderHistory = ({ userId, products, isAdmin, orders, fetchOrders }) => {
  const updateOrderStatus = (orderId, newStatus) => {
    if (!isAdmin) return alert('You do not have permission to update this.');

    axios
      .patch(`${API_BASE}/orders/${orderId}`, { status: newStatus })
      .then(() => fetchOrders())
      .catch((error) => console.error('Error updating status:', error));
  };

  const filteredOrders = isAdmin
    ? orders
    : orders.filter((o) => o.userId === userId);

  return (
    <div className="order-history-section">
      <h3>{isAdmin ? 'All Orders (Admin View)' : 'Your Order History'}</h3>
      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-item">
              <h4>Order #{order.id}</h4>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Total: Rs.{order.total.toLocaleString('en-IN')}</p>
              <p>
                Items:{' '}
                {order.items
                  .map((item) => {
                    const productDetail = products.find(
                      (p) => p.id === item.productId
                    );
                    return productDetail
                      ? `${productDetail.name} (x${item.quantity})`
                      : 'Product not found';
                  })
                  .join(', ')}
              </p>

              <p>
                Status:{' '}
                {isAdmin ? (
                  <OrderStatusUpdater order={order} onUpdate={updateOrderStatus} />
                ) : (
                  <span
                    className={`status-${order.status
                      .toLowerCase()
                      .replace(' ', '-')}`}
                  >
                    {order.status}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

//Main Dashboard Export
export default function Dashboard({ products, refreshProducts }) {
  const { currentUser, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(() => {
    if (!currentUser) return;
    const url = isAdmin
      ? `${API_BASE}/orders`
      : `${API_BASE}/orders?userId=${currentUser.uid}`;
    axios
      .get(url)
      .then((res) => setOrders(res.data))
      .catch((error) => console.error('Error fetching orders:', error));
  }, [currentUser, isAdmin]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!currentUser) return <h2>Loading...</h2>;

  return (
    <div className="dashboard-container">
      <h1>Welcome, {currentUser.displayName || currentUser.email}</h1>

      <div className="dashboard-sections">
        <Wishlist userId={currentUser.uid} products={products} />
        <Cart
          userId={currentUser.uid}
          products={products}
          fetchOrders={fetchOrders}
          refreshProducts={refreshProducts}
        />
        <OrderHistory
          userId={currentUser.uid}
          products={products}
          isAdmin={isAdmin}
          orders={orders}
          fetchOrders={fetchOrders}
        />
      </div>
    </div>
  );
}
