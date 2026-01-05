# Secret Santa Web Application

A full-featured web application for managing Secret Santa gift exchanges with automatic email notifications, assignment history tracking, and participant restrictions.

## Features

- 🔐 **User Authentication**: Secure registration and login system
- 👥 **Group Management**: Create and manage multiple Secret Santa groups
- 📝 **Participant Management**: Add participants with name and email
- 🎯 **Restrictions**: Set who can be assigned to whom
- 📜 **History Tracking**: Automatically prevents repeats from previous years
- 📧 **Email Notifications**: Automatic email sending via Gmail API
- 🎨 **Modern UI**: Beautiful, responsive React frontend

## Tech Stack

### Backend

- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL/SQLite**: Database (SQLite for dev, PostgreSQL for production)
- **JWT**: Token-based authentication
- **Gmail API**: Email sending functionality

### Frontend

- **React**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (optional, SQLite works for development)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

5. Edit `.env` with your configuration:

```env
DATABASE_URL=sqlite:///./santa.db
SECRET_KEY=your-secret-key-change-this-in-production
GMAIL_TOKEN_FILE=token.json
GMAIL_CREDENTIALS_FILE=credentials.json
```

**Note:** The sender email address is automatically detected from your authenticated Gmail account. No configuration needed!

6. Set up Gmail API credentials:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Gmail API
   - Create OAuth 2.0 credentials (Desktop application)
   - Download the credentials JSON file and save it as `credentials.json` in the `backend` directory

7. Run the backend server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional, defaults work for local dev):

```env
VITE_API_URL=http://localhost:8000
```

4. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Register/Login**: Create an account or login
2. **Create a Group**: Give your Secret Santa group a name
3. **Add Participants**: Add all participants with their names and emails
4. **Set Restrictions** (Optional): Click "Edit Restrictions" to limit who can be assigned to whom
5. **Create Assignments**: Click "Create Assignments & Send Emails" to generate assignments and send emails

## Database Schema

- **Users**: User accounts for authentication
- **Groups**: Secret Santa groups owned by users
- **Participants**: People participating in groups
- **Participant Restrictions**: Who can be assigned to whom
- **Assignment History**: Past assignments to prevent repeats

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- SQL injection prevention via SQLAlchemy ORM
- Input validation with Pydantic
- CORS configuration
- Trusted host middleware (for production)

## Production Deployment

### Important Security Steps:

1. **Change SECRET_KEY**: Generate a strong random secret key
2. **Use PostgreSQL**: Switch from SQLite to PostgreSQL
3. **Set CORS_ORIGINS**: Configure allowed origins
4. **Set TRUSTED_HOSTS**: Configure trusted hosts
5. **Use HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Never commit `.env` files

### Recommended Deployment:

- **Backend**: Deploy to services like Heroku, Railway, or AWS
- **Frontend**: Deploy to Vercel, Netlify, or similar
- **Database**: Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create group
- `GET /api/groups/{id}` - Get group details
- `GET /api/groups/{id}/participants` - List participants
- `POST /api/groups/{id}/participants` - Add participant
- `PUT /api/groups/{id}/participants/{id}/restrictions` - Update restrictions
- `POST /api/groups/{id}/assignments` - Create assignments

See `/docs` endpoint for full interactive API documentation.

## License

MIT
