# NutriScientia (FoodInsightAI & FOOD LAB™) — Local Setup, Backend & Deployment Guide

This guide explains how to:
1. Run the **full-stack NutriScientia web & API server** locally.
2. Connect **both Food Analysis and FoodLab** to your own external Python/Node backend.
3. Build, **deploy**, and **publish** the app.
4. Run the **native mobile builds** in Android Studio or Flutter.

---

## 1. Run Full-Stack App on Your Local Machine

### Prerequisites
- **Node.js v22+** (supports running `server.ts` natively via `npm start` and dev mode via `tsx`)
- A Gemini API key (only needed on the server in `.env`)

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Configure local environment variables
cp .env.example .env
# Open .env and set GEMINI_API_KEY="your_real_key"

# 3. Start development server (Vite + Express API on http://localhost:3000)
npm run dev
```
Open `http://localhost:3000` in your browser. Both **Food Analysis** (`/api/food/analyze`, `/api/food/analyze-text`) and **FoodLab** (`/api/foodlab/experiment`) run live on port `3000`.

---

## 2. Connect Your Own External Backend (Food Analysis + FoodLab)

Both **Food Analysis** and **FoodLab** use the unified `apiService` client (`src/services/apiService.ts`).

To connect your own Python (FastAPI/Flask) or Node backend:
1. Click **Show Dev Tools** (bottom-right) &rarr; **Backend API**.
2. Set **Backend Base URL** (e.g., `http://localhost:8000/v1/` locally, or `https://your-api.run.app/v1/` in production).
3. Enable **Route to Custom External Backend** and click **Ping /health Endpoint**, then **Save Configuration**.

### Required Endpoints on Your External Backend
- `GET /v1/health` &rarr; `{ "ok": true }`
- `POST /v1/food/analyze` &rarr; Multipart `image` upload returning `FoodAnalysisResponse` (including `combinations`)
- `POST /v1/food/analyze-text` &rarr; `{ "foodName": "...", "userProfile": ... }` returning `FoodAnalysisResponse`
- `POST /v1/foodlab/experiment` &rarr; `{ "experimentName", "selectedFoods", "researchObjective", "nutritionalFocus", "nutritionTotals" }` returning:
  ```json
  {
    "verdict": "UNEATABLE | CAUTION | SAFE | BENEFICIAL",
    "verdictTitle": "...",
    "verdictSubtitle": "...",
    "riskWeight": 85,
    "safetyRiskWeight": 85,
    "healthRiskWeight": 78,
    "keyReason": "...",
    "nutritionNote": "...",
    "safetyRisks": [{ "type": "Chemical Interaction", "title": "...", "description": "...", "severity": "High" }],
    "healthImpacts": [{ "text": "...", "status": "critical" }],
    "finalConclusion": "..."
  }
  ```
- `POST /v1/intelligence/ask` &rarr; `{ "foodName", "question", "analysisContext" }` returning `{ "answer", "sources", "relatedQuestions" }`

Make sure CORS is enabled on your local Python backend:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3. Deploy on AWS (Single HTTPS URL for Web App + Downloadable NutriScientia PWA)

Your **NutriScientia** server (`server.ts` + built `dist/`) runs on **Node.js 22+** and serves:
- The **Web App + Branded PWA** (`manifest.webmanifest`, `sw.js`, `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`)
- All backend APIs (`/api/health`, `/api/food/*`, `/api/foodlab/experiment`, `/api/intelligence/ask`) on one unified URL (`process.env.PORT || 3000`).

> **Important for PWA Installation:** Browsers require **HTTPS** (`https://...`) to show the native one-tap **Install NutriScientia** prompt and activate the Service Worker.

### Option A: Direct ZIP Upload to AWS Elastic Beanstalk (No Git Required)
1. Build the production bundle & PWA locally:
   ```bash
   npm install
   npm run build
   ```
   Make sure `dist/`, `server.ts`, `package.json`, `package-lock.json`, `Procfile`, and `.ebignore` are present.
2. Zip the project folder (excluding `node_modules/`, `android/`, `flutter/`, `.env`, `dev-dist/`):
   ```bash
   zip -r nutriscientia-aws.zip dist server.ts package.json package-lock.json Procfile .env.example .ebignore
   ```
3. Open **AWS Console → Elastic Beanstalk → Create Application → Create Environment**:
   - **Platform:** Node.js 22 (Amazon Linux 2023)
   - **Application code:** Choose **Upload your code** and upload `nutriscientia-aws.zip`.
4. Under **Configuration → Updates, monitoring, and logging → Environment properties**, set:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `your_gemini_api_key`
5. Attach an **HTTPS certificate** via your Load Balancer listener (`443`) or put **AWS CloudFront** in front of the Elastic Beanstalk URL so it is served over `https://`.
6. Open your AWS HTTPS URL — visitors will immediately see the **Download NutriScientia App** card with the NutriScientia logo and can install it onto Android, iOS, or Desktop.

### Option B: AWS App Runner (Automatic HTTPS URL Out of the Box)
1. Push your project repository to GitHub (make sure `.env` is **not** committed).
2. Open **AWS Console → AWS App Runner → Create service**.
3. Choose **Source code repository**, connect GitHub, and select **Node.js 22** runtime.
4. Set Build & Start commands:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Port:** `3000`
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `your_gemini_api_key`
6. Deploy and share the generated HTTPS domain, e.g. `https://xxxxxxxxxx.us-east-1.awsapprunner.com`.

### Option C: AWS EC2 Production Deployment (No Docker, Single HTTPS URL)
```bash
# 1. From your computer, build production frontend + PWA locally and copy files to EC2
npm install
npm run build
scp -i your-key.pem -r dist server.ts package.json package-lock.json .env.example ubuntu@YOUR_EC2_IP:~/nutriscientia/

# 2. SSH into EC2 and install Node 22 + Nginx + Certbot (No Docker)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx

cd ~/nutriscientia
npm install --omit=dev

# 3. Create server .env (never commit secrets or expose to client)
cat << 'EOF' > .env
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=varunvadlakonda1577@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="NutriScientia <varunvadlakonda1577@gmail.com>"
EOF

sudo npm i -g pm2
pm2 start "npm start" --name nutriscientia
pm2 startup && pm2 save
```
Configure Nginx reverse proxy (`proxy_pass http://127.0.0.1:3000;`) and run `sudo certbot --nginx -d your-domain.com` to serve the complete NutriScientia web app, backend APIs (`/api/*`), and installable PWA over a single public HTTPS URL.


---

## 4. Connect Android Studio to AWS & Export Shareable APK

1. *(Optional — only needed if you edit web UI files locally)* Sync the latest production UI into Android's local assets for instant native-speed startup:
   ```bash
   npm run android:sync
   ```
2. Open **Android Studio** &rarr; **File &rarr; Open...** &rarr; select the `/android` folder inside this project.
3. Wait for **Gradle Sync** to finish (uses Gradle 8.9, Android Gradle Plugin 8.7.2, JDK 17).
4. Open `android/app/src/main/java/com/foodinsightai/app/api/ApiConfig.kt` and set your backend URL:
   ```kotlin
   // Option B (Local Desktop Emulator): "http://10.0.2.2:3000"
   // Production AWS HTTPS: "https://your-aws-domain.awsapprunner.com"
   const val AWS_APP_URL: String = "https://your-aws-domain.awsapprunner.com"
   ```
5. Test first on an Emulator or USB phone by clicking **Run (`Shift + F10`)**.
6. **Generate APK for other users' phones:**
   - **Quick Test APK:** Click **Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)**.
     Find the file at: `android/app/build/outputs/apk/debug/app-debug.apk`.
   - **Signed Release APK (Recommended for sharing widely):**
     1. Click **Build &rarr; Generate Signed App Bundle / APK... &rarr; APK &rarr; Next**.
     2. Click **Create new...** to create a `.jks` keystore (keep the file and passwords safe).
     3. Select **release** build variant and click **Create**.
     4. Find your APK at: `android/app/release/app-release.apk`.
7. **Install on any Android device:** Send `app-release.apk` (or `app-debug.apk`) via Google Drive, WhatsApp, or USB. On the target phone, tap the `.apk` file and allow **Install unknown apps** if prompted.

---

## 5. Flutter Option
```powershell
cd flutter
flutter pub get
flutter run -d chrome   # or target Android emulator / USB phone
```


