from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    plaid_access_token = Column(String, nullable=True)  # Store encrypted in production
    plaid_item_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
