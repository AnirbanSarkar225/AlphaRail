# database.py
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Use env var when available; fallback to sqlite for developer convenience.
# Example for Postgres:
# export DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/alpharail"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./alpharail_dev.db")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def init_db():
    """
    Create all tables. Call during FastAPI startup.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
