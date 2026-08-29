# SilaiCraft Couture — Full-Stack Women's Tailoring & Boutique Management Platform

A **mobile-first, production-grade web application** designed specifically for bespoke women's tailoring, designer boutiques, and master sewing ateliers. Built with a **FastAPI (Python 3.11)** backend and **React 18 + TypeScript + Tailwind CSS** frontend.

---

## 🌟 Key Capabilities & Architecture

### 1. Mobile-First Customer Experience
- **Touch-Optimized Steppers**: Multi-step booking wizards with $\ge 44\text{px}$ touch targets, horizontal calendar day selectors, and available slot tiles.
- **Sticky Mobile Bottom Navigation**: 1-tap thumb navigation (Home, Designs, Book Slot, Orders, Account).
- **Custom Sizing Matrices**: Tailored measurement profiles for Blouses (10 body points), Kurtis, Salwar Suits, Lehengas, and Gowns.
- **Vertical Live Production Tracker**: Real-time progress timeline from *Order Received* $\rightarrow$ *Measurements Confirmed* $\rightarrow$ *Cutting* $\rightarrow$ *Stitching* $\rightarrow$ *Quality Check* $\rightarrow$ *Ready* $\rightarrow$ *Delivered*.
- **Inspiration Custom Requests**: Upload reference images from Pinterest/Instagram and receive itemized quotations with breakdown and advance requirements.
- **AI Boutique Stylist & Assistant**: Instant virtual consultation for fabric matching, blouse necklines, and pricing estimates.

### 2. Tailor Atelier & Admin Operations Studio
- **Anti-Double-Booking Slot Engine**: Dynamic slot calculation based on configurable working hours, holiday schedules, buffer intervals, and max fitting room limits.
- **Interactive Quotation Builder**: Itemized formula breakdown (Base Price + Extra Embroidery/Latkans - Promotional Discounts = Final Invoiced Total).
- **Order Production Pipeline**: State machine management with production notes and automatic customer notifications.
- **Payment & Receipt Tracking**: Record multiple installments (Cash, UPI, Card, Net Banking) with real-time balance calculations.
- **Customer CRM & Sizing Vault**: Comprehensive customer profiles, lifetime spend metrics, and measurement histories.
- **Review Moderation**: Approve or hide client testimonials with 1-to-5 star ratings.
- **Business Intelligence**: 6-month revenue graphs, service category volume analytics, and exportable financial reports.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- *(Optional for containers)* **Docker** & **Docker Compose**

---

### Option A: Running with Docker Compose (Recommended)

To start PostgreSQL database, FastAPI backend, and Nginx-powered React frontend in one command:

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost` (or `http://localhost:3000`)
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **Database**: PostgreSQL on `localhost:5432`

---

### Option B: Running Locally (Development Mode)

#### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial boutique data, services, designs, and accounts
python -m app.seed.seed_data

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

Backend will be running at `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`).

#### 2. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will be running at `http://localhost:5173`.

---

## 🔑 Pre-Configured Demo Credentials

The database seeder automatically initializes the following verified accounts:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Boutique Admin** | `admin@silaicraft.com` | `Admin@123456` | Full Atelier Management (`/admin`) |
| **Customer** | `priya@example.com` | `Customer@123456` | Customer Portal (`/dashboard`, `/orders`) |

*(Quick demo buttons are also provided directly on the Login page for one-click access).*

---

## 🛠️ Tech Stack & Directory Structure

```
fashion/
├── docker-compose.yml              # Multi-container orchestration
├── README.md
├── backend/
│   ├── app/
│   │   ├── api/v1/                 # 18 Modular REST API Routers
│   │   │   ├── auth.py
│   │   │   ├── services.py
│   │   │   ├── designs.py
│   │   │   ├── measurements.py
│   │   │   ├── appointments.py
│   │   │   ├── custom_requests.py
│   │   │   ├── quotations.py
│   │   │   ├── orders.py
│   │   │   ├── payments.py
│   │   │   ├── reviews.py
│   │   │   ├── notifications.py
│   │   │   ├── contact.py
│   │   │   ├── business_settings.py
│   │   │   ├── dashboard.py
│   │   │   ├── uploads.py
│   │   │   └── ai.py
│   │   ├── core/                   # Security, JWT tokens, config, exceptions
│   │   ├── db/                     # SQLAlchemy 2.0 base & async/sync sessions
│   │   ├── models/                 # 15 Complete ORM Domain Models
│   │   ├── schemas/                # Pydantic v2 validation schemas
│   │   ├── seed/                   # Realistic database seeder
│   │   ├── services/               # Core business services (Slot engine, Orders, Storage)
│   │   └── main.py                 # FastAPI Application with CORS & Lifespan
│   ├── alembic/                    # Database schema migration versions
│   ├── tests/                      # Automated test suite (pytest)
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/                    # Axios API service clients
    │   ├── components/
    │   │   ├── common/             # Button, Badge, Modal, Input, ImageUpload, Skeleton
    │   │   ├── layout/             # Header, Footer, BottomNav (Mobile), Layouts
    │   │   └── customer/           # ServiceCard, DesignCard, MeasurementForm, OrderTimeline
    │   ├── context/                # Auth, Settings, Toast Context providers
    │   ├── pages/
    │   │   ├── public/             # Home, About, Services, Gallery, Contact, Auth
    │   │   ├── customer/           # Dashboard, Measurements, Booking, Orders, Requests
    │   │   └── admin/              # Dashboard, Orders, Schedule, Quotations, Reports
    │   ├── types/                  # Full TypeScript Domain Definitions
    │   ├── App.tsx                 # Client routing & role guards
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    ├── nginx.conf
    └── Dockerfile
```

---

## 🧪 Running Automated Backend Tests

```bash
cd backend
pytest -v
```

All 10 automated test cases (Authentication, Role Guards, Service Catalog, Slot Engine anti-double-booking, Order lifecycle, and Quotation conversion) pass with **100% success rate**.

---

## 📄 License
MIT License. Built for tailoring boutiques and bespoke ateliers.
