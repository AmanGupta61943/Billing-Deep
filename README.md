# Advanced Inventory Management System

A comprehensive inventory management system with features like barcode generation, stock management, billing, and more.

## Features

- Barcode Generation
- Stock Management
- New Bill Creation
- Bill History
- Printer Connection
- Bill Customization
- Contact Us

## Setup Instructions

1. Install dependencies:
```bash
npm install
cd client
npm install
```

2. Create a .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. Start the development server:
```bash
npm run dev:full
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000 