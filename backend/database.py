# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Путь к файлу БД можно задать через переменную окружения
DATABASE_PATH = os.getenv("DATABASE_PATH", "./messenger.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Синхронный движок (для создания таблиц и обычных сессий)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # обязательно для SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()