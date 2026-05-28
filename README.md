# Faro by EIKR

AI-powered business intelligence and growth analytics platform built for modern companies.

## Overview

Faro connects business data sources into one unified dashboard for:

* Revenue tracking
* Funnel analysis
* Attribution
* Product analytics
* Goal tracking
* Marketing performance
* AI business insights

Built with:

* React + Vite frontend
* Node.js backend
* Supabase database/auth
* Multi-platform integrations

---

# Features

## Analytics Dashboard

* Revenue overview
* KPI monitoring
* Product performance
* Funnel visualization
* Attribution tracking
* Subscription analytics
* Cohort analysis

## AI Assistant

* Ask business questions in natural language
* AI-generated summaries
* Performance insights
* Alert recommendations
* Revenue analysis

## Integrations

### Shopify

* Orders
* Revenue
* Products
* Customers

### Meta Ads

* Campaign spend
* ROAS
* CPA
* Performance metrics

### Google Ads

* Campaign tracking
* Spend analytics
* Keyword insights

### Google Analytics 4

* Traffic analytics
* Session tracking
* Conversion monitoring

### Klaviyo

* Email performance
* SMS analytics
* Revenue attribution
* Campaign insights

### TikTok Ads

* Campaign analytics
* Spend tracking
* CTR / CPC / ROAS
* Advertiser performance

---

# Tech Stack

## Frontend

* React
* Vite
* Vanilla CSS
* Responsive UI system

## Backend

* Node.js
* Express
* Supabase
* REST APIs

## Infrastructure

* Vercel frontend deployment
* Ubuntu VPS backend
* PM2 process management

---

# Environment Variables

## Backend

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
```

---

# Installation

## Frontend

```bash
cd beacon-app/project
npm install
npm run dev
```

## Backend

```bash
cd sja-backend
npm install
pm2 start server.js --name sja-backend
```

---

# Deployment

## Frontend

```bash
npm run build
vercel --prod
```

## Backend

```bash
pm2 restart sja-backend
```

---

# API Routes

## Connections

```bash
POST /api/shopify/connect
POST /api/meta/connect
POST /api/googleads/connect
POST /api/ga4/connect
POST /api/klaviyo/connect
POST /api/tiktok/connect
```

## Workspace

```bash
POST /api/workspace/:id/goal
GET  /api/workspace/:id
```

---

# TikTok Integration

Required credentials:

* TikTok Access Token
* Advertiser ID

The platform automatically imports:

* Spend
* Impressions
* Clicks
* CTR
* CPC
* Conversions
* ROAS

---

# Roadmap

* Live alert engine
* Automated reporting
* AI forecasting
* Slack integration
* CRM sync
* White-label portals
* Multi-workspace support

---

# Status

Active development.

Built by EIKR.
