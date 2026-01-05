# Quick Start Guide

## 1. Backend Setup (5 minutes)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:

```env
DATABASE_URL=sqlite:///./santa.db
SECRET_KEY=change-this-to-a-random-string
```

**For Gmail API setup:**

1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Desktop app)
5. Download as `credentials.json` - can be in `backend` folder or project root
6. On first run, the app will open a browser for OAuth authentication
7. After authentication, `token.json` will be created automatically
8. Your email address will be automatically detected from the authenticated Gmail account

Run backend:

```bash
python run.py
# or
uvicorn app.main:app --reload
```

## 2. Frontend Setup (2 minutes)

```bash
cd frontend
npm install
npm run dev
```

## 3. First Use

1. Open http://localhost:5173
2. Register an account
3. Create a group
4. Add participants
5. (Optional) Set restrictions
6. Create assignments!

## Troubleshooting

**Gmail API not working?**

- Make sure `credentials.json` is in the `backend` folder or project root
- First run will open a browser for OAuth - complete the flow
- After OAuth, `token.json` will be created automatically
- Your sender email will be auto-detected from your authenticated Gmail account
- Check that Gmail API is enabled in Google Cloud Console

**Database errors?**

- Delete `santa.db` and restart - it will recreate
- For PostgreSQL, make sure DATABASE_URL is correct

**Frontend can't connect to backend?**

- Check backend is running on port 8000
- Check CORS settings in backend `.env`
