from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sqlite3
import json
import jwt
import hashlib
import uuid
import os
import shutil
from datetime import datetime, timedelta
from mutagen import File as MutagenFile
import mimetypes

# Import user routes
from user import router as user_router

app = FastAPI(title="Self-Music API", version="1.0.0")
security = HTTPBearer()

SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include user routes (no authentication required)
app.include_router(user_router)

# Database Models
class Artist(BaseModel):
    id: Optional[str] = None
    name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    coverUrl: Optional[str] = None
    followers: int = 0
    songCount: int = 0
    albumCount: int = 0
    genres: List[str] = []
    verified: bool = False
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class Album(BaseModel):
    id: Optional[str] = None
    title: str
    artistId: str
    coverUrl: Optional[str] = None
    releaseDate: str
    songCount: int = 0
    duration: int = 0
    genre: Optional[str] = None
    description: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class Song(BaseModel):
    id: Optional[str] = None
    title: str
    artistId: str
    albumId: Optional[str] = None
    duration: int = 0
    audioUrl: Optional[str] = None
    coverUrl: Optional[str] = None
    lyrics: Optional[str] = None
    moodIds: List[str] = []
    playCount: int = 0
    liked: bool = False
    genre: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class Mood(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    icon: str
    color: str
    coverUrl: Optional[str] = None
    songCount: int = 0
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class Playlist(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    coverUrl: Optional[str] = None
    songIds: List[str] = []
    songCount: int = 0
    playCount: int = 0
    duration: int = 0
    creator: str = "admin"
    isPublic: bool = True
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class User(BaseModel):
    id: Optional[str] = None
    username: str
    password: str
    role: str = "admin"
    createdAt: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Database setup
def init_db():
    conn = sqlite3.connect('music.db')
    conn.execute('PRAGMA foreign_keys = ON')
    
    # Artists table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS artists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            bio TEXT,
            avatar TEXT,
            coverUrl TEXT,
            followers INTEGER DEFAULT 0,
            songCount INTEGER DEFAULT 0,
            albumCount INTEGER DEFAULT 0,
            genres TEXT,
            verified BOOLEAN DEFAULT FALSE,
            createdAt TEXT,
            updatedAt TEXT
        )
    ''')
    
    # Albums table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS albums (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artistId TEXT NOT NULL,
            coverUrl TEXT,
            releaseDate TEXT,
            songCount INTEGER DEFAULT 0,
            duration INTEGER DEFAULT 0,
            genre TEXT,
            description TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            FOREIGN KEY (artistId) REFERENCES artists (id) ON DELETE CASCADE
        )
    ''')
    
    # Songs table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artistId TEXT NOT NULL,
            albumId TEXT,
            duration INTEGER DEFAULT 0,
            audioUrl TEXT,
            coverUrl TEXT,
            lyrics TEXT,
            moodIds TEXT,
            playCount INTEGER DEFAULT 0,
            liked BOOLEAN DEFAULT FALSE,
            genre TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            FOREIGN KEY (artistId) REFERENCES artists (id) ON DELETE CASCADE,
            FOREIGN KEY (albumId) REFERENCES albums (id) ON DELETE SET NULL
        )
    ''')
    
    # Moods table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS moods (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            icon TEXT NOT NULL,
            color TEXT NOT NULL,
            coverUrl TEXT,
            songCount INTEGER DEFAULT 0,
            createdAt TEXT,
            updatedAt TEXT
        )
    ''')
    
    # Playlists table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS playlists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            coverUrl TEXT,
            songIds TEXT,
            songCount INTEGER DEFAULT 0,
            playCount INTEGER DEFAULT 0,
            duration INTEGER DEFAULT 0,
            creator TEXT DEFAULT 'admin',
            isPublic BOOLEAN DEFAULT TRUE,
            createdAt TEXT,
            updatedAt TEXT
        )
    ''')
    
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            createdAt TEXT
        )
    ''')
    
    # Insert default admin user
    admin_id = str(uuid.uuid4())
    admin_password = hashlib.sha256("admin123".encode()).hexdigest()
    try:
        conn.execute('''
            INSERT OR IGNORE INTO users (id, username, password, role, createdAt)
            VALUES (?, ?, ?, ?, ?)
        ''', (admin_id, "admin", admin_password, "admin", datetime.now().isoformat()))
    except:
        pass
    
    conn.commit()
    conn.close()

# Auth functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, password, role FROM users WHERE username = ?', (user_data.username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or user[2] != hash_password(user_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user[1], "role": user[3]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user[0],
            "username": user[1],
            "role": user[3]
        }
    }

# Helper functions
def get_current_time():
    return datetime.now().isoformat()

def parse_json_field(field_value: str) -> List[str]:
    if not field_value:
        return []
    try:
        return json.loads(field_value)
    except:
        return []

def serialize_json_field(field_value: List[str]) -> str:
    return json.dumps(field_value) if field_value else "[]"

# Artist CRUD
@app.get("/api/admin/artists")
async def get_artists(username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM artists ORDER BY createdAt DESC')
    rows = cursor.fetchall()
    conn.close()
    
    artists = []
    for row in rows:
        artist = {
            "id": row[0],
            "name": row[1],
            "bio": row[2],
            "avatar": row[3],
            "coverUrl": row[4],
            "followers": row[5],
            "songCount": row[6],
            "albumCount": row[7],
            "genres": parse_json_field(row[8]),
            "verified": bool(row[9]),
            "createdAt": row[10],
            "updatedAt": row[11]
        }
        artists.append(artist)
    
    return {"success": True, "data": artists}

@app.post("/api/admin/artists")
async def create_artist(artist: Artist, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    artist_id = str(uuid.uuid4())
    now = get_current_time()
    
    try:
        cursor.execute('''
            INSERT INTO artists (id, name, bio, avatar, coverUrl, followers, songCount, albumCount, genres, verified, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            artist_id, artist.name, artist.bio, artist.avatar, artist.coverUrl,
            artist.followers, artist.songCount, artist.albumCount,
            serialize_json_field(artist.genres), artist.verified, now, now
        ))
        conn.commit()
        conn.close()
        
        return {"success": True, "data": {"id": artist_id, **artist.dict()}}
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Artist name already exists")

@app.put("/api/admin/artists/{artist_id}")
async def update_artist(artist_id: str, artist: Artist, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    now = get_current_time()
    
    cursor.execute('''
        UPDATE artists SET name=?, bio=?, avatar=?, coverUrl=?, followers=?, songCount=?, albumCount=?, genres=?, verified=?, updatedAt=?
        WHERE id=?
    ''', (
        artist.name, artist.bio, artist.avatar, artist.coverUrl,
        artist.followers, artist.songCount, artist.albumCount,
        serialize_json_field(artist.genres), artist.verified, now, artist_id
    ))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Artist not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": artist_id, **artist.dict()}}

@app.delete("/api/admin/artists/{artist_id}")
async def delete_artist(artist_id: str, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM artists WHERE id=?', (artist_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Artist not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Artist deleted successfully"}

# Album CRUD
@app.get("/api/admin/albums")
async def get_albums(username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT a.*, ar.name as artist_name FROM albums a 
        JOIN artists ar ON a.artistId = ar.id 
        ORDER BY a.createdAt DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    albums = []
    for row in rows:
        album = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artistName": row[11],
            "coverUrl": row[3],
            "releaseDate": row[4],
            "songCount": row[5],
            "duration": row[6],
            "genre": row[7],
            "description": row[8],
            "createdAt": row[9],
            "updatedAt": row[10]
        }
        albums.append(album)
    
    return {"success": True, "data": albums}

@app.post("/api/admin/albums")
async def create_album(album: Album, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify artist exists
    cursor.execute('SELECT id FROM artists WHERE id=?', (album.artistId,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Artist not found")
    
    album_id = str(uuid.uuid4())
    now = get_current_time()
    
    cursor.execute('''
        INSERT INTO albums (id, title, artistId, coverUrl, releaseDate, songCount, duration, genre, description, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        album_id, album.title, album.artistId, album.coverUrl, album.releaseDate,
        album.songCount, album.duration, album.genre, album.description, now, now
    ))
    
    # Update artist album count
    cursor.execute('UPDATE artists SET albumCount = albumCount + 1 WHERE id=?', (album.artistId,))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": album_id, **album.dict()}}

@app.put("/api/admin/albums/{album_id}")
async def update_album(album_id: str, album: Album, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    now = get_current_time()
    
    cursor.execute('''
        UPDATE albums SET title=?, artistId=?, coverUrl=?, releaseDate=?, songCount=?, duration=?, genre=?, description=?, updatedAt=?
        WHERE id=?
    ''', (
        album.title, album.artistId, album.coverUrl, album.releaseDate,
        album.songCount, album.duration, album.genre, album.description, now, album_id
    ))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Album not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": album_id, **album.dict()}}

@app.delete("/api/admin/albums/{album_id}")
async def delete_album(album_id: str, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM albums WHERE id=?', (album_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Album not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Album deleted successfully"}

# Song CRUD
@app.get("/api/admin/songs")
async def get_songs(username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        ORDER BY s.createdAt DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    songs = []
    for row in rows:
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artistName": row[14],
            "albumId": row[3],
            "albumTitle": row[15],
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": row[6],
            "lyrics": row[7],
            "moodIds": parse_json_field(row[8]),
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    return {"success": True, "data": songs}

@app.post("/api/admin/songs")
async def create_song(song: Song, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify artist exists
    cursor.execute('SELECT id FROM artists WHERE id=?', (song.artistId,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Artist not found")
    
    song_id = str(uuid.uuid4())
    now = get_current_time()
    
    cursor.execute('''
        INSERT INTO songs (id, title, artistId, albumId, duration, audioUrl, coverUrl, lyrics, moodIds, playCount, liked, genre, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        song_id, song.title, song.artistId, song.albumId, song.duration,
        song.audioUrl, song.coverUrl, song.lyrics, serialize_json_field(song.moodIds),
        song.playCount, song.liked, song.genre, now, now
    ))
    
    # Update artist song count
    cursor.execute('UPDATE artists SET songCount = songCount + 1 WHERE id=?', (song.artistId,))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": song_id, **song.dict()}}

@app.put("/api/admin/songs/{song_id}")
async def update_song(song_id: str, song: Song, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    now = get_current_time()
    
    cursor.execute('''
        UPDATE songs SET title=?, artistId=?, albumId=?, duration=?, audioUrl=?, coverUrl=?, lyrics=?, moodIds=?, playCount=?, liked=?, genre=?, updatedAt=?
        WHERE id=?
    ''', (
        song.title, song.artistId, song.albumId, song.duration, song.audioUrl,
        song.coverUrl, song.lyrics, serialize_json_field(song.moodIds),
        song.playCount, song.liked, song.genre, now, song_id
    ))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": song_id, **song.dict()}}

@app.delete("/api/admin/songs/{song_id}")
async def delete_song(song_id: str, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM songs WHERE id=?', (song_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Song deleted successfully"}

# Mood CRUD
@app.get("/api/admin/moods")
async def get_moods(username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM moods ORDER BY createdAt DESC')
    rows = cursor.fetchall()
    conn.close()
    
    moods = []
    for row in rows:
        mood = {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "icon": row[3],
            "color": row[4],
            "coverUrl": row[5],
            "songCount": row[6],
            "createdAt": row[7],
            "updatedAt": row[8]
        }
        moods.append(mood)
    
    return {"success": True, "data": moods}

@app.post("/api/admin/moods")
async def create_mood(mood: Mood, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    mood_id = str(uuid.uuid4())
    now = get_current_time()
    
    try:
        cursor.execute('''
            INSERT INTO moods (id, name, description, icon, color, coverUrl, songCount, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            mood_id, mood.name, mood.description, mood.icon, mood.color,
            mood.coverUrl, mood.songCount, now, now
        ))
        conn.commit()
        conn.close()
        
        return {"success": True, "data": {"id": mood_id, **mood.dict()}}
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Mood name already exists")

@app.put("/api/admin/moods/{mood_id}")
async def update_mood(mood_id: str, mood: Mood, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    now = get_current_time()
    
    cursor.execute('''
        UPDATE moods SET name=?, description=?, icon=?, color=?, coverUrl=?, songCount=?, updatedAt=?
        WHERE id=?
    ''', (
        mood.name, mood.description, mood.icon, mood.color,
        mood.coverUrl, mood.songCount, now, mood_id
    ))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Mood not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": mood_id, **mood.dict()}}

@app.delete("/api/admin/moods/{mood_id}")
async def delete_mood(mood_id: str, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM moods WHERE id=?', (mood_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Mood not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Mood deleted successfully"}

# Playlist CRUD
@app.get("/api/admin/playlists")
async def get_playlists(username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM playlists ORDER BY createdAt DESC')
    rows = cursor.fetchall()
    conn.close()
    
    playlists = []
    for row in rows:
        playlist = {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "coverUrl": row[3],
            "songIds": parse_json_field(row[4]),
            "songCount": row[5],
            "playCount": row[6],
            "duration": row[7],
            "creator": row[8],
            "isPublic": bool(row[9]),
            "createdAt": row[10],
            "updatedAt": row[11]
        }
        playlists.append(playlist)
    
    return {"success": True, "data": playlists}

@app.post("/api/admin/playlists")
async def create_playlist(playlist: Playlist, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    playlist_id = str(uuid.uuid4())
    now = get_current_time()
    
    cursor.execute('''
        INSERT INTO playlists (id, name, description, coverUrl, songIds, songCount, playCount, duration, creator, isPublic, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        playlist_id, playlist.name, playlist.description, playlist.coverUrl,
        serialize_json_field(playlist.songIds), playlist.songCount, playlist.playCount,
        playlist.duration, playlist.creator, playlist.isPublic, now, now
    ))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": playlist_id, **playlist.dict()}}

@app.put("/api/admin/playlists/{playlist_id}")
async def update_playlist(playlist_id: str, playlist: Playlist, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    now = get_current_time()
    
    cursor.execute('''
        UPDATE playlists SET name=?, description=?, coverUrl=?, songIds=?, songCount=?, playCount=?, duration=?, creator=?, isPublic=?, updatedAt=?
        WHERE id=?
    ''', (
        playlist.name, playlist.description, playlist.coverUrl,
        serialize_json_field(playlist.songIds), playlist.songCount, playlist.playCount,
        playlist.duration, playlist.creator, playlist.isPublic, now, playlist_id
    ))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": playlist_id, **playlist.dict()}}

@app.delete("/api/admin/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM playlists WHERE id=?', (playlist_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Playlist deleted successfully"}

# File upload endpoint
@app.post("/api/admin/upload")
async def upload_file(file: UploadFile = File(...), username: str = Depends(verify_token)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{file_id}{file_extension}"
    file_path = f"uploads/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"success": True, "data": {"filename": filename, "url": f"/uploads/{filename}"}}

if __name__ == "__main__":
    init_db()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)