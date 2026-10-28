# 📦 StockPulse — Modern Inventory & Stock Management System

A minimalist, high-performance, responsive **Inventory & Stock Management System** built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL)**, and **Resend**.

Designed with clean typography, intuitive user experience, accurate stock calculation logic, and audit trails.

---

## ✨ Features

- 📊 **Real-time Inventory Dashboard**: Live KPI cards for Total Products, Cost & Retail Valuation, Potential Profit Margins, Stock Status (In Stock, Low Stock, Out of Stock), and Recent Activities.
- 📦 **Product Management**: Full CRUD capabilities with SKU, Barcode/UPC, Category, Unit (pcs, box, pack, ream, etc.), Cost Price, Selling Price, Current Stock, Alert Threshold, and Storage Location.
- 🔄 **Stock-In & Stock-Out Records**:
  - **Stock In**: Log supplier deliveries, customer returns, or initial intake.
  - **Stock Out**: Fulfil sales, log write-offs, damaged/expired items, with deficit safety checks.
  - **Adjustment**: Physical audit stock synchronization.
  - Real-time balance preview and transition history.
- 📜 **Audit Trail & Product History**: Inspect any product's complete movement chronology, reference numbers, dates, notes, and operators.
- ⚠️ **Low-Stock Alerts & Resend Email Integration**:
  - Automatic detection when inventory drops below safety thresholds.
  - One-click email dispatch to procurement/operations via official **Resend** SDK.
  - Interactive email HTML preview and test dispatch built-in.
- 🏷️ **Category Taxonomy**: Group items into categories with live asset valuation metrics.
- 🔍 **Search & Dynamic Filters**: Fast searching across Product Name, SKU, and Barcode, with category and stock status filters.
- 📑 **Comprehensive Reports & CSV Exports**:
  - One-click **Product Master Catalog CSV**
  - **Inventory Valuation Report CSV**
  - **Restock Procurement Recommendation Sheet CSV**
  - **Stock Movement Ledger CSV**
- ☁️ **Hybrid Data Engine**: Works out-of-the-box with seamless local/demo state, and connects instantly to live Supabase PostgreSQL when credentials are provided.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & shadcn/ui minimal styling
- **Database & Storage**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Email Notifications**: [Resend](https://resend.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/inventory-management.git
cd inventory-management
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Resend
RESEND_API_KEY=re_123456789_abcdefg
RESEND_FROM_EMAIL=inventory@yourdomain.com
ALERT_RECIPIENT_EMAIL=admin@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Even if you haven't set up Supabase or Resend yet, StockPulse runs immediately in **Demo & Local Mode** with pre-seeded sample inventory and email simulation!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a new database project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, paste the contents into the SQL Editor, and click **Run**.
4. The script sets up:
   - `categories` table
   - `products` table (with SKU uniqueness and foreign keys)
   - `stock_movements` ledger table
   - `settings` table
   - Performance indexes on SKU, category, and timestamps
   - Row Level Security (RLS) policies
   - Seed sample inventory data.
5. In **Project Settings** &rarr; **API**, copy your `Project URL` and `anon public key` into `.env.local`.

---

## 📧 Resend Email Setup

1. Sign up for free at [Resend](https://resend.com).
2. Create an API key in [resend.com/api-keys](https://resend.com/api-keys).
3. Put your key in `.env.local` as `RESEND_API_KEY`.
4. (Optional for production) Verify your custom sending domain in Resend to send from `inventory@yourdomain.com`. For testing, you can send from `onboarding@resend.dev` to your registered email.

---

## 🌐 Vercel Deployment & Custom Domain

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial stockpulse inventory system"
git branch -M main
git remote add origin https://github.com/your-username/inventory-system.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) &rarr; **Add New...** &rarr; **Project**.
2. Select your GitHub repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `ALERT_RECIPIENT_EMAIL`
   - `NEXT_PUBLIC_APP_URL`
4. Click **Deploy**.

### 3. Connect a Custom Domain
1. In your Vercel project dashboard, go to **Settings** &rarr; **Domains**.
2. Enter your custom domain (e.g. `inventory.yourcompany.com` or `yourdomain.com`).
3. Add the DNS records at your registrar:
   - **Apex domain (`yourdomain.com`)**: `A Record` pointing `@` to `76.76.21.21`
   - **Subdomain (`inventory.yourdomain.com`)**: `CNAME Record` pointing `inventory` to `cname.vercel-dns.com`
4. Vercel automatically issues an SSL certificate and handles HTTPS redirection.

---

## 🔒 Security & Data Integrity

- **Row Level Security (RLS)**: Enforced across all Supabase database tables.
- **Accurate Balance Protection**: Stock-out dispatches are verified against available balances to avoid negative stock.
- **Environment Isolation**: Private API keys (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly on the server-side Next.js route handlers.

---

## 📄 License
MIT

