# 🔥 SmartHeat AI

Intelligent heatwave early warning and human thermal-stress platform, built on the MERN stack (MongoDB, Express, React, Node.js).

SmartHeat AI shifts the question from **"how hot is the weather?"** to **"what will this heat do to a human body, and what should someone do about it?"** It combines temperature, humidity, wind and (where available) solar radiation into a Heat Index, an estimated WBGT, and a composite Human Thermal Stress Score, then classifies risk, forecasts it 5 days out, plots it on a map, raises deduplicated alerts, and can notify people by SMS/WhatsApp.

---

## 1. Quick start

```bash
git clone <this-repo>
cd SmartHeat-AI
npm run install:all      # installs server + client dependencies

# Terminal 1
cd server
cp .env.example .env     # already defaults to DEMO_MODE=true
npm run dev               # http://localhost:5000

# Terminal 2
cd client
npm run dev               # http://localhost:5173
```

**Live data is on by default** (`DEMO_MODE=false`). Current weather and the 5-day forecast come from [Open-Meteo](https://open-meteo.com) — free, real, and needs no API key — for whatever city you search for in the dashboard's search box (backed by real geocoding, not a fixed list). The 6 quick-select chips (Lucknow, Delhi, Jaipur, Nagpur, Ahmedabad, Varanasi) are just shortcuts; the search box works for any place worldwide. If Open-Meteo is briefly unreachable, the app degrades gracefully to labeled demo data rather than crashing, then recovers automatically on the next request.

If you have access to an official IMD (India Meteorological Department) feed, fill in `IMD_API_BASE_URL` / `IMD_API_KEY` in `server/.env` and `imdService.js` is preferred automatically ahead of Open-Meteo.

Set `DEMO_MODE=true` in `server/.env` if you want to demo fully offline (e.g. no network access, or a hackathon venue with bad wifi) — every screen still works, clearly labeled "Demo data".

## 2. What's real vs. simulated — read this before a demo

| Feature | Status |
|---|---|
| Heat Index | Real, documented NWS Rothfusz regression |
| WBGT | An **estimated** outdoor WBGT (Australian Bureau of Meteorology simplified formula) from temperature/humidity/wind — not a lab-measured black-globe WBGT. Shown as "Data unavailable" if temperature/humidity are missing, never invented. |
| Thermal Stress Score | SmartHeat AI's own composite 0–100 score built from Heat Index + WBGT + a wind-relief factor. Documented, not a claimed clinical/peer-reviewed index. |
| Heatwave detection | SmartHeat AI's own signal-based classification (`source: "SMARTHEAT_AI"`), not an official IMD heatwave declaration |
| Live weather | Real, via Open-Meteo, when `DEMO_MODE=false` |
| Demo weather | Deterministic simulated values, always labeled "Demo data" in the UI |
| SMS / WhatsApp | Twilio-wired. Without Twilio credentials (or with `DEMO_MODE=true`), messages are marked `SIMULATED_SENT` and nothing is actually sent |
| AI advisory | Rule-based by default. If `ANTHROPIC_API_KEY` is set, calls the Anthropic API instead, constrained to only the structured numbers it's given — it's instructed never to invent weather/medical data or predict deaths |
| Mortality / health-impact module | Architecture only (see §7) — returns `"DATA NOT AVAILABLE"` since no validated health dataset is wired in |

## 3. Architecture

```
Weather Data (Open-Meteo / IMD / Demo)
        ↓
  Express Backend
        ↓
  Heatwave Engine ← Thermal Stress Engine (Heat Index + WBGT)
        ↓
     Risk Engine
   ┌─────┼─────┐
Forecast Alerts GIS Map
        ↓
Notification Service → SMS / WhatsApp (Twilio)
        ↓
  React Dashboard ← AI Advisory
```

## 4. Folder structure

```
SmartHeat-AI/
├── client/                 React + Vite + Tailwind frontend
│   └── src/
│       ├── components/     Navbar, WeatherCard, ThermalRiskCard, RiskGauge,
│       │                   ForecastChart, AlertCard, RecommendationCard,
│       │                   RiskMap, NotificationStatus
│       ├── pages/           Landing, Login, Register, Dashboard, Heatwave,
│       │                   Forecast, Alerts, RiskMapPage, Notifications,
│       │                   Profile, AdminDashboard
│       ├── services/        api.js + one thin wrapper per API domain
│       └── context/         AuthContext
├── server/                  Node/Express backend
│   ├── models/               User, HeatRisk, Alert, Location, Forecast, Notification
│   ├── services/             weatherService (Open-Meteo), imdService (stub),
│   │                        demoData, thermalStressService, heatwaveService,
│   │                        alertService, notificationService (Twilio), aiService
│   ├── utils/                heatIndex.js, wbgt.js, riskScore.js — the scientific core
│   ├── controllers/ routes/ middleware/
│   └── server.js             boot + 10-minute alert-sweep cron job
└── README.md
```

## 5. Environment variables (`server/.env`)

See `server/.env.example` for the full list with comments. Nothing beyond `PORT`, `DEMO_MODE`, `MONGODB_URI` and `JWT_SECRET` is required to run the app end to end in demo mode.

## 6. REST API

```
POST /api/auth/register            POST /api/auth/login          GET /api/auth/me

GET  /api/weather/current          GET  /api/weather/forecast
GET  /api/weather/search?q=        Live city search (geocoding), powers the dashboard search box

GET  /api/heat/current              GET /api/heat/risk
GET  /api/heat/forecast             GET /api/heat/map

GET  /api/alerts                    GET /api/alerts/location/:location

POST /api/ai/recommendation

GET  /api/notifications             POST /api/notifications/test

GET  /api/admin/dashboard  /risks  /alerts  /notifications
```

## 7. Extension points (intentionally left as architecture, not fake data)

- **Mortality / health-risk module**: `HeatRisk` and `Location` models already carry the fields (`vulnerablePopulationPct`, etc.) needed to plug in real historical health/hospitalization data later. Until a validated dataset and model are wired in, the API is expected to report `"DATA NOT AVAILABLE"` rather than invented figures — do not add estimated mortality numbers without a validated model behind them.
- **IMD live feed**: `server/services/imdService.js` is a ready integration point — add your endpoint/key and it activates automatically ahead of Open-Meteo.
- **Twilio**: add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_WHATSAPP_NUMBER` and set `DEMO_MODE=false` to send real messages.

## 8. Design notes

Frontend uses a light, warm palette (amber/sun accent for heat, a cool sky-blue for relief/contrast) with Fraunces (display) + Inter (body) typography, and a single orchestrated entrance animation on the thermal-risk gauge rather than animating every element — everything else stays calm and legible, matching a public-safety/disaster-dashboard tone rather than a generic SaaS template.
