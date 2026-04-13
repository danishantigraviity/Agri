# 🌿 AgriMarket — Farm to Customer Marketplace

A full-stack agriculture e-commerce platform connecting farmers directly with customers. Built with React.js (Vite), Node.js/Express, and MongoDB.

---

## 🏗 Architecture

```
agrimarket/
├── backend/          # Node.js + Express + MongoDB
│   ├── config/       # DB, Cloudinary config
│   ├── controllers/  # MVC controllers
│   ├── middleware/   # Auth, rate limiting
│   ├── models/       # Mongoose schemas
│   ├── routes/       # REST API routes
│   └── utils/        # JWT helpers, seed script
│
└── frontend/         # React + Vite + Tailwind CSS
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Route-level pages
        │   ├── auth/     # Login, Register
        │   ├── customer/ # Storefront, Orders, Checkout
        │   ├── farmer/   # Dashboard, Products, Analytics
        │   └── admin/    # Admin panel pages
        ├── services/     # Axios API client
        └── store/        # Zustand state (auth, cart)
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for images)
- Razorpay account (for payments)
- Twilio account (for SMS/WhatsApp) — optional

---

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Seed demo data (optional)
npm run seed
```

The backend runs on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy env file
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api

# Start dev server
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## 🔐 Demo Credentials

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@demo.com       | Demo@1234   |
| Farmer   | farmer@demo.com      | Demo@1234   |
| Customer | customer@demo.com    | Demo@1234   |

---

## 🚀 Features

### 👤 Three Role System
- **Customer** — Browse, cart, checkout, order tracking, wishlist, subscriptions
- **Farmer** — Product management, order fulfillment, analytics dashboard
- **Admin** — Approve farmers & products, manage all orders, platform analytics

### 🛒 Customer Features
- Responsive storefront with category filters and search
- Cart drawer with real-time total calculation
- Free delivery threshold (₹500)
- Order tracking with step-by-step timeline
- Wishlist management
- Subscription-based recurring delivery
- Address book management

### 🌾 Farmer Features
- Awaits admin approval on registration
- Product listing with image upload (Cloudinary)
- Products submitted for admin review before going live
- Order management (Confirm → Pack → Ship)
- Revenue analytics with charts
- Farm profile with certifications

### 🛡 Admin Features
- Platform dashboard with KPIs and charts
- Farmer approval/rejection system
- Product approval queue
- Full order management with status updates
- User activation/deactivation

### 💳 Payment
- **Razorpay** online payment (UPI, Card, Net Banking)
- **Cash on Delivery** (COD)
- Secure webhook verification with HMAC-SHA256

### 📬 Notifications
- SMS/WhatsApp via Twilio (configurable)
- Order status updates

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt (cost factor 12) |
| Authentication | JWT access tokens (15m) + refresh tokens (7d, rotated) |
| Token storage | Access: memory/header; Refresh: HttpOnly signed cookie |
| Input sanitization | express-mongo-sanitize + xss-clean |
| NoSQL injection | Mongoose schema validation |
| Rate limiting | 200 req/15min global; 10/15min for auth |
| Secure headers | Helmet with CSP + HSTS |
| CORS | Strict origin whitelist |
| File uploads | Type + size validation before Cloudinary |
| Role-based access | Middleware-enforced on all routes |

---

## 🗄 Database Schema

### Users Collection
```
{ name, email, phone, password (hashed), role, avatar,
  farmerProfile: { farmName, isApproved, rating, ... },
  addresses: [...], wishlist: [...], refreshTokens: [...] }
```

### Products Collection
```
{ farmer, name, category, images, price: {mrp, selling, unit},
  stock: {quantity}, isOrganic, isApproved (pending|approved|rejected),
  reviews: [...], rating, soldCount }
```

### Orders Collection
```
{ customer, items: [...], shippingAddress, pricing,
  paymentMethod, paymentStatus, orderStatus,
  trackingEvents: [...], orderNumber }
```

### Payments Collection
```
{ order, customer, amount, method, status,
  razorpayOrderId, razorpayPaymentId, razorpaySignature }
```

### Subscriptions Collection
```
{ customer, items, frequency, deliverySlot,
  startDate, nextDeliveryDate, status }
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy `dist/` to Vercel
# Set VITE_API_URL=https://your-api.example.com/api
```

### Backend → AWS EC2
```bash
# On EC2 (Ubuntu 22.04)
sudo apt update && sudo apt install -y nodejs npm nginx
cd agrimarket/backend && npm install --production
npm install -g pm2
pm2 start server.js --name agrimarket-api
pm2 startup && pm2 save

# Nginx reverse proxy
# proxy_pass http://localhost:5000;
```

### Database → MongoDB Atlas
- Create free M0 cluster
- Whitelist EC2 IP
- Set `MONGODB_URI` in backend `.env`

### Media → Cloudinary
- Free tier: 25GB storage
- Upload preset for products and avatars

### WAF → Cloudflare
- Point domain to Cloudflare
- Enable WAF rules for OWASP Top 10
- Enable DDoS protection

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query |
| Backend | Node.js, Express.js, MVC pattern |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT + Refresh Tokens, bcrypt |
| Payments | Razorpay |
| Media | Cloudinary |
| Notifications | Twilio SMS/WhatsApp |
| Charts | Recharts |
| Deployment | Vercel (FE), AWS EC2 (BE), MongoDB Atlas |

---

## 📝 API Endpoints

```
POST   /api/auth/register        Register user
POST   /api/auth/login           Login
POST   /api/auth/refresh         Refresh access token
POST   /api/auth/logout          Logout

GET    /api/products             List products (public)
GET    /api/products/featured    Featured products
GET    /api/products/:id         Product details
POST   /api/products             Create (farmer)
PUT    /api/products/:id         Update (farmer)
DELETE /api/products/:id         Delete (farmer/admin)
POST   /api/products/:id/reviews Add review (customer)

POST   /api/orders               Place order (customer)
GET    /api/orders/my            My orders (customer)
GET    /api/orders/farmer-orders Farmer's orders
GET    /api/orders/:id           Order details
PATCH  /api/orders/:id/status    Update status (farmer/admin)
PATCH  /api/orders/:id/cancel    Cancel (customer)

POST   /api/payments/create-order  Init Razorpay
POST   /api/payments/verify         Verify payment
POST   /api/payments/webhook        Razorpay webhook

GET    /api/admin/dashboard         Admin overview
GET    /api/admin/users             All users
PATCH  /api/admin/farmers/:id/approval  Approve farmer
GET    /api/admin/products/pending  Pending products
PATCH  /api/admin/products/:id/approval Review product

POST   /api/subscriptions         Create subscription
GET    /api/subscriptions/my      My subscriptions
PATCH  /api/subscriptions/:id/pause  Pause
PATCH  /api/subscriptions/:id/cancel Cancel
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

*Built with 🌿 for farmers and food lovers everywhere.*
