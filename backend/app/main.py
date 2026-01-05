from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from .database import engine, Base
from .routers import auth, groups, participants, assignments
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secret Santa API",
    description="A web application for managing Secret Santa gift exchanges",
    version="1.0.0",
)

# CORS middleware - configure allowed origins for production
origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware for production
if os.getenv("TRUSTED_HOSTS"):
    app.add_middleware(
        TrustedHostMiddleware, allowed_hosts=os.getenv("TRUSTED_HOSTS").split(",")
    )

# Include routers
app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(participants.router)
app.include_router(assignments.router)


@app.get("/")
def root():
    return {"message": "Secret Santa API", "docs": "/docs", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
