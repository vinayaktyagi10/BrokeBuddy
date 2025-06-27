from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from app.db.database import cursor, conn  # ✅ fixed
from pydantic import BaseModel

load_dotenv()
router = APIRouter()

# Secret and settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("Secret_KEY is not set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# JWT + Password helpers
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(username: str):
    cursor.execute("SELECT username, password_hash FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    if row:
        return {"username": row[0], "hashed_password": row[1]}
    return None


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return False
    return user


# Routes

class SignupRequest(BaseModel):
    username: str
    password: str

@router.post("/signup")
def signup(data: SignupRequest):
    username = data.username
    password = data.password

    cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Username already exists.")

    hashed = get_password_hash(password)
    cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, hashed))
    conn.commit()

    return {"msg": "User created successfully."}


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token.")
        user = get_user(username)
        if not user:
            raise HTTPException(status_code=401, detail="User not found.")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")
