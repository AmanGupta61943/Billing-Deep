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

Project layout: **`frontend/`** (React app) and **`backend/`** (Express API) are **siblings** under the IMSD repo root.

1. Install dependencies (from the **IMSD** folder, or use paths as shown):
```bash
npm install --prefix backend
npm install --prefix frontend
```
Or from repo root: `npm run install:all` (see root `package.json`).

2. Create a `.env` file inside **`backend/`** with the following variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. Start backend + frontend together (from **`backend/`**):
```bash
npm run dev:full
```
Or from repo root: `npm run dev:full`.

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000 