# models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TrainRecord(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_no = Column(String, index=True)
    last_station = Column(String)
    section = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Emergency(Base):
    __tablename__ = "emergencies"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(String, index=True, nullable=True)
    type = Column(String)
    severity = Column(Integer)
    description = Column(Text, nullable=True)
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)


class Disaster(Base):
    __tablename__ = "disasters"
    id = Column(Integer, primary_key=True, index=True)
    section = Column(String)
    severity = Column(Integer)
    description = Column(Text, nullable=True)
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)


class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    train_no = Column(String)
    suggested_delay = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Query(Base):
    """
    Pilot/higher-ups messages stored persistently.
    Fields:
      - sender_role: 'pilot' or 'controller' or 'admin'
      - sender_identifier: optional pilot/training id (e.g. train no)
      - subject, message
      - response: text reply from higher-ups
      - responded: boolean
    """
    __tablename__ = "queries"
    id = Column(Integer, primary_key=True, index=True)
    sender_role = Column(String, default="pilot")
    sender_identifier = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    responded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
