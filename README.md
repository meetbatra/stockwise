# Stockwise — Premium Stock Analytics Dashboard

A modern, real-time stock analytics and tracking dashboard built with Next.js 16 (App Router). Stockwise offers a highly optimized, responsive, and visually stunning data-dense UI designed to give users a comprehensive view of the top 50 US equities, interactive price charts, key company statistics, and the latest financial news.

## Key Features

- **Real-Time Market Data**: Live tracking of the top 50 market movers and day gainers.
- **Interactive Stock Charts**: Seamless, cache-optimized area charts for tracking stock performance across multiple time ranges (1W, 1M, 6M, 1Y).
- **Search & Filter Ecosystem**: Debounced global search across names and tickers, coupled with URL-synchronized category filters for highly shareable states.
- **Premium Design System**: Built with Tailwind CSS v4 and Shadcn UI, featuring micro-animations, glassmorphic elements, and a cohesive dark-mode aesthetic.
- **Detailed Asset View**: Dedicated dynamic routing (`/[ticker]`) for deep-dives into individual stock statistics and related financial news.
- **Resilient UX**: Custom loading skeletons, zero-layout-shift design, and robust error boundaries.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Shadcn UI
- **Data Visualization**: Recharts
- **State Management**: React Hooks + `nuqs` (URL State Sync)
- **HTTP Client**: `ky` and native `fetch`
- **Data Providers**: Yahoo Finance (Market Data), Finnhub (News)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- A free [Finnhub API key](https://finnhub.io/register) *(optional — only needed for the news panel. App degrades gracefully if missing)*

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/meetbatra/stockwise.git
   cd stockwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your FINNHUB_API_KEY if available
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t stockwise .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -e FINNHUB_API_KEY=your_key_here stockwise
   ```

## Technical Decisions

Building a robust financial dashboard requires careful performance tuning. Here are the major architectural decisions made during development:

| Decision | Why It Makes Sense |
|---|---|
| **Server-First Data Fetching** | Heavy fetches (`fetchQuote`, `fetchCandles`, `fetchNews`) are executed in Server Components via `Promise.all` to reduce client-side JavaScript payloads and improve initial load times. |
| **Client-Side Pagination for Top 50 Stocks** | By fetching 50 stocks at once from our custom API route and handling pagination on the client side, we ensure buttery-smooth table navigation and instant search filtering without continuous, latency-prone server roundtrips. |
| **Debounced Search** | Implemented a custom `useDebounce` hook to delay search filtering until 300ms after the user stops typing, drastically reducing unnecessary re-renders and potential API spam. |
| **In-Memory Chart Caching** | A module-level `Map` acts as a cache for chart data. This avoids refetching the same historical data when users switch between different time ranges (1W/1M/6M), making the interaction instant. |
| **URL-Synchronized State (`nuqs`)** | Selected screeners (like "Day Gainers") sync directly to the URL (`?filter=day_gainers`). This means the exact dashboard state can be shared via a simple link, eliminating the need for complex global state management (like Redux) just for UI routing. |
| **Recharts + Shadcn Chart Container** | Allowed us to build highly responsive SVG charts while injecting dynamic CSS variables (like `var(--color-close)`) for trend-based coloring (green for up, red for down). |

## What I Would Do With More Time

While the core functionality is robust, there is always room to evolve the generic dashboard into a deeply personalized financial tool:

1. **Authentication & User Accounts**: Integrate Clerk or NextAuth to allow users to create accounts and securely log in.
2. **Personalized Watchlists**: Enable users to add specific stocks to their personal portfolio or watchlist, persisting this data securely via a database (e.g., Neon Postgres + Prisma).
3. **Smart Notification System**: Develop a personalized alert engine that notifies users (via email or push notifications) whenever a tracked stock hits a specific price target or experiences significant volatility.
4. **Portfolio Performance Tracking**: Expand the asset view so users can input their holdings and track personal Profit & Loss (P&L) over time.
5. **Persistent URL State for Charts**: Sync the selected chart range (e.g., 1W, 1M) and pagination page into the URL for even deeper shareability.

## Time Taken

Approximately **2 days** from initial scaffolding to final production polish.
