# Quick Start

Get up and running in 5 minutes.

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp env.example .env
```

Edit `.env`:
```env
DATABASE_URL=sqlite:///./santa.db
SECRET_KEY=your-random-secret-key-here
```

**Gmail API:**
1. [Google Cloud Console](https://console.cloud.google.com/) → Create project
2. Enable Gmail API
3. Create OAuth 2.0 credentials (Desktop app)
4. Download as `credentials.json` in `backend/`
5. Run backend → Complete OAuth flow in browser

```bash
python run.py
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` → Register → Create groups → Add participants → Assign!

## Troubleshooting

**Gmail API:** Ensure `credentials.json` is in `backend/` folder. First run opens browser for OAuth.

**Database:** Delete `santa.db` to reset.

**Connection:** Backend runs on port 8000, frontend on 5173.
