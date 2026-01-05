# Secret Santa 🎅

A web application for managing Secret Santa gift exchanges with automatic email notifications and assignment history tracking.

## Features

- 🔐 User authentication
- 👥 Group and participant management
- 🎯 Custom assignment restrictions
- 📜 Prevents repeats from previous years
- 📧 Automatic email notifications via Gmail API
- 🎨 Modern React UI

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your SECRET_KEY
python run.py
```

**Gmail API Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Gmail API
3. Create OAuth 2.0 credentials (Desktop app)
4. Download as `credentials.json` in `backend/` folder
5. First run will open browser for OAuth authentication

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and start creating Secret Santa groups!

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, PostgreSQL/SQLite, JWT, Gmail API  
**Frontend:** React, Vite, React Router, Axios

## Usage

1. Register/Login
2. Create a group
3. Add participants
4. (Optional) Set restrictions
5. Create assignments & send emails

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Production

- Use PostgreSQL instead of SQLite
- Set strong `SECRET_KEY` (generate with `openssl rand -hex 32`)
- Configure `CORS_ORIGINS` and `TRUSTED_HOSTS`
- Use HTTPS
- Never commit `.env` files

## License

MIT
