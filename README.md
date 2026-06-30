# SolarSyncX — AI-Powered Solar Monitoring & Optimization Dashboard

SolarSyncX is a premium, real-time solar energy analytics platform that monitors, analyzes, and optimizes solar panel performance. Powered by Google Gemini AI, it delivers predictive maintenance alerts, historical trends, dynamic efficiency forecasting, and an interactive digital twin representation of solar assets.

---

## 🌟 Core Features

- **📊 Real-Time Analytics Dashboard**: Monitor energy production, grid export/import, active power generation, and overall system efficiency with high-fidelity, interactive charts.
- **🤖 Gemini AI Insights**:
  - **Power Output & Efficiency Forecasting**: AI-driven models predicting power output and generation efficiency based on weather forecasts and historical patterns.
  - **Performance Anomaly Summaries**: Automated detection and human-readable analysis of performance anomalies.
  - **Interactive CSV Analyzer**: Upload system log CSVs to get immediate debugging suggestions and operational feedback.
  - **Maintenance Scheduler**: Smart generation of preventative maintenance tasks based on real-time hardware status.
- **🌐 Dynamic 3D Digital Twin**: Interactive 3D visualization of the solar infrastructure showcasing simulated energy flows and physical component health.
- **🔔 Proactive Alerting & Notifications**: Real-time notifications and simulated SMS alerts for critical threshold updates, device faults, or efficiency drops.
- **📱 Fully Responsive Design**: High-performance UI built using a glassmorphic dashboard design, supporting mobile, tablet, and desktop views.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Database / Backend**: [Firebase](https://firebase.google.com/) (Firestore database, Firebase Auth, FCM Cloud Messaging)
- **AI Engine**: [Google Gemini Pro API](https://ai.google.dev/) via direct integration & custom flows
- **3D Graphics**: [Three.js](https://threejs.org/) (React Three Fiber / Drei) for the Digital Twin
- **Data Visualization**: [Recharts](https://recharts.org/) for beautiful, responsive line, bar, and area charts

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later)
- npm or yarn

### 🔧 Environment Setup

Create a `.env.local` file in the root directory and configure the following variables:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin Configuration (for Server Actions & Routes)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

### 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MACRO72/solar_sync.git
   cd solar_sync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗️ Project Structure

```
├── .idx/                  # IDX Cloud Workspace configuration
├── src/
│   ├── ai/                # Gemini handler, tools, and GenKit-inspired flows
│   ├── app/               # Next.js App Router (Layouts, pages, API routes)
│   ├── components/        # Shared UI, Auth components, and Dashboard panels
│   ├── context/           # AppStateProvider for global simulated metrics
│   ├── firebase/          # Client & Firestore setup, real-time data hooks
│   ├── hooks/             # Utility hooks (Toast, FCM, Simulation status)
│   └── lib/               # Shared logic, helpers, mock data schemas
├── public/                # Static assets, manifest, and service workers
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript compilation configuration
```

---

## 📈 Production Build & Deploy

To build the application for production:

```bash
npm run build
```

This compiles optimized client bundles and prepares serverless functions. To run the production build locally:

```bash
npm run start
```
