# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import shutil
import os
import uuid
from typing import Dict

from database import SessionLocal, engine
from models import Base, User, Message
from schemas import (
    UserCreate, UserUpdate, User as UserSchema,
    Token, Message as MessageSchema
)
from auth import (
    authenticate_user, create_access_token, get_password_hash,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

# Создаём таблицы (если их нет)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаём папку для аватаров
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Монтируем статику для доступа к загруженным файлам
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- REST эндпоинты ---

@app.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
async def login_for_access_token(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=UserSchema)
async def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.bio is not None:
        current_user.bio = user_update.bio

    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверяем, что файл - изображение
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Генерируем уникальное имя файла
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Сохраняем файл
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Формируем URL
    avatar_url = f"/static/avatars/{filename}"

    # Обновляем пользователя
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    return {"avatar_url": avatar_url}

@app.get("/users", response_model=list[UserSchema])
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.id != current_user.id).all()
    return users

@app.get("/users/search", response_model=list[UserSchema])
async def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search_term = f"%{q}%"
    users = db.query(User).filter(
        (User.username.ilike(search_term)) | (User.full_name.ilike(search_term))
    ).filter(User.id != current_user.id).limit(20).all()
    return users

@app.get("/messages/{user_id}", response_model=list[MessageSchema])
async def get_messages(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(Message).filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp).all()
    return messages

# --- WebSocket менеджер ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        # Обновляем last_seen
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_seen = datetime.utcnow()
            db.commit()
        db.close()

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        # Обновляем last_seen при отключении
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_seen = datetime.utcnow()
            db.commit()
        db.close()

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        user = await get_current_user(token)
    except HTTPException:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user.id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            receiver_id = message_data.get("receiver_id")
            content = message_data.get("content")

            if not receiver_id or not content:
                continue

            # Сохраняем сообщение в БД
            db = SessionLocal()
            db_message = Message(sender_id=user.id, receiver_id=receiver_id, content=content)
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            db.close()

            response = {
                "id": db_message.id,
                "sender_id": user.id,
                "receiver_id": receiver_id,
                "content": content,
                "timestamp": db_message.timestamp.isoformat()
            }

            await manager.send_personal_message(response, receiver_id)
            await manager.send_personal_message(response, user.id)
    except WebSocketDisconnect:
        manager.disconnect(user.id)