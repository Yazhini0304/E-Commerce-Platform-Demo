import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE = 'http://localhost:5000';

const ProductCard = ({ product, onAction }) => {
  const { currentUser } = useAuth();
  const isOutOfStock = product.stock === 0;

  const handleAction = (type) => {
    if (!currentUser) return alert('Please log in to proceed.');
    if (isOutOfStock) return alert('Product is out of stock.');

    onAction(type, product);
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>Category: {product.category}</p>
      {}
      <p>Price: Rs.{product.price.toLocaleString('en-IN')}</p> 
      <p className={isOutOfStock ? 'out-of-stock' : 'in-stock'}>
        Stock: {product.stock}
      </p>
      
      <div className="product-actions">
        <button 
          onClick={() => handleAction('cart')} 
          disabled={isOutOfStock}
          className="btn-primary"
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button 
          onClick={() => handleAction('wishlist')} 
          disabled={isOutOfStock}
          className="btn-secondary"
        >
          Add to Wishlist
        </button>
      </div>
    </div>
  );
};


export default function ProductList({ products }) { 
  const [displayedProducts, setDisplayedProducts] = useState(products || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  const { currentUser } = useAuth();

  
  useEffect(() => {
   
    setDisplayedProducts(products);
  }, [products]); 

  
  useEffect(() => {
    let filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    setDisplayedProducts(filteredProducts);
  }, [searchTerm, sortBy, products]);


  const handleProductAction = (type, product) => {
   
    const payload = { userId: currentUser.uid, productId: product.id, quantity: 1 };
    
   
    axios.get(`${API_BASE}/${type}?userId=${currentUser.uid}&productId=${product.id}`)
      .then(res => {
        if (res.data.length > 0) {
          alert(`${product.name} is already in your ${type}.`);
        } else {
         
          axios.post(`${API_BASE}/${type}`, payload)
            .then(() => alert(`${product.name} added to ${type}!`))
            .catch(error => console.error(`Error adding to ${type}:`, error));
        }
      })
      .catch(error => console.error("Error checking existence:", error));
  };


  return (
    <div className="product-list-container">
      <h2>Products for Sale ({displayedProducts.length} items)</h2>
      
      <div className="controls">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="price-asc">Sort by Price (Low to High)</option>
          <option value="price-desc">Sort by Price (High to Low)</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div className="product-grid">
       
        {displayedProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAction={handleProductAction} 
          />
        ))}
      </div>
    </div>
  );
}
