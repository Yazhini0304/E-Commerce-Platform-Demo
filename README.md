E-Commerce Platform Demo (Interview Task)

📋 Project Overview

This repository contains a single-page, multi-view React application simulating a foundational e-commerce platform. It is designed to demonstrate proficiency in:

React State Management and Routing (using react-router-dom).

External API Interaction (axios for JSON Server REST API).

Database Integration Simulation (Firestore for user-specific data like cart/wishlist).

Authentication Flow (Mocked Google/Firebase Auth for Users & Static Credentials for Admin).

Role-Based Access Control (RBAC) for Admin functionality.

The application allows two primary user types: Customers (sign in via Google) and Administrators (static login).

✨ Core Features

Feature Area

User

Admin

Authentication

Google/Firebase Auth (Mocked)

Static Credentials (admin/password123)

Product Display


User Data

Cart and Wishlist management (data stored in simulated Firestore).

Order Placement

Checkout Cart, placing a new order into the shared database.

Order Management

View personal order history and current status.

View ALL placed orders.


Update order status to 'Shipped' or 'Delivered' (updates visible to the user instantly).

🚀 Step-by-Step Execution Guide

To ensure a smooth evaluation, please follow these two main setup stages.

Stage 1: Setting up the Mock Product API (JSON Server)

This project requires a mock backend to serve product data and handle order persistence via REST calls (http://localhost:5000).

Install JSON Server globally:

npm install -g json-server

Start the Server: Run the JSON Server from the directory containing db.json:

json-server --watch db.json --port 5000


Keep this terminal window open while running the application.

Stage 2: Running the React Frontend

Dependencies: Ensure you have necessary React dependencies (react, react-dom, react-router-dom, axios, and Tailwind CSS is assumed).

Run Application: Start the React development server.

npm start

Testing the Workflow

Persona

Action

Credentials

Customer

1. Sign in with Google (Mocked).
Any email/name
2. Add items to Cart.
3. Click "Checkout".
4. Navigate to "My Orders" to see the status "Processing".

Admin

1. Click "Admin Login".
U: admin / P: password123
2. Find the new order on the Admin Dashboard
3. Change the status from "Processing" to "Shipped".

Customer
5. Go back to "My Orders". The status should update dynamically to "Shipped".



