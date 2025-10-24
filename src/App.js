import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ProtectedRoute } from './AuthContext'; // Assume AuthContext exists
import ProductList from './ProductList';
import Dashboard from './Dashboard';
import AdminLogin from './AdminLogin';
import AdminOrders from './AdminOrders'; 
import './App.css';

const API_BASE = 'http://localhost:5000';


const checkAdminSession = () => sessionStorage.getItem('isAdminLoggedIn') === 'true';

function AuthStatus({ isAdmin, onAdminLogout }) {
  const { currentUser, logout } = useAuth();

  return (
    <div className="auth-status flex space-x-2 items-center">
      
      {currentUser ? (
        <>
          <span className="user-info">User: {currentUser.displayName || currentUser.email}</span>
          <Link to="/dashboard" className="btn-link">Dashboard</Link>
          <button onClick={logout} className="btn-danger-link">Log Out (User)</button>
        </>
      ) : isAdmin ? (
       
        <>
          <span className="user-info text-red-600 font-bold">Admin Session Active</span>
          <Link to="/admin-orders" className="btn-link bg-red-100 text-red-700">Admin Dashboard</Link>
          <button onClick={onAdminLogout} className="btn-danger-link">Log Out (Admin)</button>
        </>
      ) : (
       
        <Link to="/admin-login" className="btn-primary">Admin Login</Link>
      )}
      {!currentUser && !isAdmin && <AuthButton />}
    </div>
  );
}

function AuthButton() {
  // This uses the Firebase context for Google sign-in
  const { loginWithGoogle } = useAuth();
  return (
    <button onClick={loginWithGoogle} className="btn-primary">
      Sign In with Google
    </button>
  );
}

function AppContent() {
  const [products, setProducts] = useState([]);
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(checkAdminSession()); 
  
  // Function to fetch products 
  const fetchProducts = () => {
    axios.get(`${API_BASE}/products`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => console.error("Error fetching products:", error));
  };

  useEffect(() => {
    
    fetchProducts();
  }, []);
  
  // Handlers for Admin Login/Logout
  const handleAdminLogin = () => {
    sessionStorage.setItem('isAdminLoggedIn', 'true');
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    setIsAdminLoggedIn(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>E-Commerce Demo</h2>
        <nav>
          <Link to="/" className="btn-link">Products</Link>
         
          <AuthStatus isAdmin={isAdminLoggedIn} onAdminLogout={handleAdminLogout} />
        </nav>
      </header>
      
      <main className="app-main">
        <Routes>
        
          <Route path="/" element={<ProductList products={products} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard products={products} refreshProducts={fetchProducts} />
              </ProtectedRoute>
            } 
          />
          
     
          <Route 
            path="/admin-login" 
            element={
              isAdminLoggedIn 
                ? <Navigate to="/admin-orders" replace /> 
                : <AdminLogin onLoginSuccess={handleAdminLogin} />
            } 
          />
          
   
          <Route 
            path="/admin-orders" 
            element={
              isAdminLoggedIn 
                ? <AdminOrders apiBase={API_BASE} /> 
                : <Navigate to="/admin-login" replace />
            } 
          />

          <Route path="*" element={<h1>404 - Not Found</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
     
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
