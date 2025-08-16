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
import requests
from datetime import datetime, timedelta
from mutagen import File as MutagenFile
import mimetypes

# Import user routes
from user import router as user_router

app = FastAPI(title="Self-Music API", version="1.0.0")
security = HTTPBearer()

SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 12

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
    artistId: str  # Keep for backward compatibility - primary artist
    artistIds: List[str] = []  # New field for multiple artists
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
    artistId: str  # Keep for backward compatibility - primary artist
    artistIds: List[str] = []  # New field for multiple artists
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

# Import related models
class ImportSongInfo(BaseModel):
    songId: int
    name: str
    arName: List[str]
    albumName: str
    albumId: int
    interval: str
    img: str
    duration: int

class ImportAlbumInfo(BaseModel):
    id: int
    title: str
    artist: str
    coverUrl: str
    releaseDate: str
    company: Optional[str] = None
    description: Optional[str] = None

class ImportArtistInfo(BaseModel):
    id: str
    name: str
    avatarUrl: Optional[str] = None
    intro: Optional[str] = None
    fanCount: Optional[str] = None

class ImportBatchItem(BaseModel):
    songInfo: ImportSongInfo
    albumInfo: ImportAlbumInfo
    artistsInfo: List[ImportArtistInfo]
    lyrics: str
    audioUrl: str  # 添加音频URL字段
    skipIfExists: bool = True

class ImportBatchRequest(BaseModel):
    items: List[ImportBatchItem]

class CheckExistsRequest(BaseModel):
    songName: str
    artistName: str
    albumName: Optional[str] = None

class PlaylistReorder(BaseModel):
    songIds: List[str]

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
    
    # Song-Artists association table (for multiple artists per song)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS song_artists (
            id TEXT PRIMARY KEY,
            songId TEXT NOT NULL,
            artistId TEXT NOT NULL,
            isPrimary BOOLEAN DEFAULT FALSE,
            createdAt TEXT,
            FOREIGN KEY (songId) REFERENCES songs (id) ON DELETE CASCADE,
            FOREIGN KEY (artistId) REFERENCES artists (id) ON DELETE CASCADE,
            UNIQUE(songId, artistId)
        )
    ''')
    
    # Album-Artists association table (for multiple artists per album)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS album_artists (
            id TEXT PRIMARY KEY,
            albumId TEXT NOT NULL,
            artistId TEXT NOT NULL,
            isPrimary BOOLEAN DEFAULT FALSE,
            createdAt TEXT,
            FOREIGN KEY (albumId) REFERENCES albums (id) ON DELETE CASCADE,
            FOREIGN KEY (artistId) REFERENCES artists (id) ON DELETE CASCADE,
            UNIQUE(albumId, artistId)
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
    
    # Migrate existing song-artist relationships
    try:
        # Check if migration has already been done
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM song_artists')
        song_artists_count = cursor.fetchone()[0]
        
        if song_artists_count == 0:
            # Migrate existing songs
            cursor.execute('SELECT id, artistId, createdAt FROM songs WHERE artistId IS NOT NULL')
            songs = cursor.fetchall()
            
            for song_id, artist_id, created_at in songs:
                association_id = str(uuid.uuid4())
                cursor.execute('''
                    INSERT OR IGNORE INTO song_artists (id, songId, artistId, isPrimary, createdAt)
                    VALUES (?, ?, ?, ?, ?)
                ''', (association_id, song_id, artist_id, True, created_at))
    except Exception as e:
        print(f"Song-Artist migration warning: {e}")
    
    # Migrate existing album-artist relationships
    try:
        # Check if migration has already been done
        cursor.execute('SELECT COUNT(*) FROM album_artists')
        album_artists_count = cursor.fetchone()[0]
        
        if album_artists_count == 0:
            # Migrate existing albums
            cursor.execute('SELECT id, artistId, createdAt FROM albums WHERE artistId IS NOT NULL')
            albums = cursor.fetchall()
            
            for album_id, artist_id, created_at in albums:
                association_id = str(uuid.uuid4())
                cursor.execute('''
                    INSERT OR IGNORE INTO album_artists (id, albumId, artistId, isPrimary, createdAt)
                    VALUES (?, ?, ?, ?, ?)
                ''', (association_id, album_id, artist_id, True, created_at))
    except Exception as e:
        print(f"Album-Artist migration warning: {e}")
    
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

# Multi-artist helper functions
def get_song_artists(cursor, song_id: str) -> List[Dict]:
    """Get all artists for a song with primary artist info"""
    cursor.execute('''
        SELECT a.*, sa.isPrimary FROM artists a
        JOIN song_artists sa ON a.id = sa.artistId
        WHERE sa.songId = ?
        ORDER BY sa.isPrimary DESC, a.name ASC
    ''', (song_id,))
    rows = cursor.fetchall()
    
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
            "updatedAt": row[11],
            "isPrimary": bool(row[12])
        }
        artists.append(artist)
    
    return artists

def get_album_artists(cursor, album_id: str) -> List[Dict]:
    """Get all artists for an album with primary artist info"""
    cursor.execute('''
        SELECT a.*, aa.isPrimary FROM artists a
        JOIN album_artists aa ON a.id = aa.artistId
        WHERE aa.albumId = ?
        ORDER BY aa.isPrimary DESC, a.name ASC
    ''', (album_id,))
    rows = cursor.fetchall()
    
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
            "updatedAt": row[11],
            "isPrimary": bool(row[12])
        }
        artists.append(artist)
    
    return artists

def manage_song_artists(cursor, song_id: str, artist_ids: List[str], primary_artist_id: str = None):
    """Manage artist associations for a song"""
    if not artist_ids:
        return
    
    # Remove existing associations
    cursor.execute('DELETE FROM song_artists WHERE songId = ?', (song_id,))
    
    # Add new associations
    now = get_current_time()
    for i, artist_id in enumerate(artist_ids):
        association_id = str(uuid.uuid4())
        is_primary = (artist_id == primary_artist_id) or (i == 0 and not primary_artist_id)
        cursor.execute('''
            INSERT INTO song_artists (id, songId, artistId, isPrimary, createdAt)
            VALUES (?, ?, ?, ?, ?)
        ''', (association_id, song_id, artist_id, is_primary, now))

def manage_album_artists(cursor, album_id: str, artist_ids: List[str], primary_artist_id: str = None):
    """Manage artist associations for an album"""
    if not artist_ids:
        return
    
    # Remove existing associations
    cursor.execute('DELETE FROM album_artists WHERE albumId = ?', (album_id,))
    
    # Add new associations
    now = get_current_time()
    for i, artist_id in enumerate(artist_ids):
        association_id = str(uuid.uuid4())
        is_primary = (artist_id == primary_artist_id) or (i == 0 and not primary_artist_id)
        cursor.execute('''
            INSERT INTO album_artists (id, albumId, artistId, isPrimary, createdAt)
            VALUES (?, ?, ?, ?, ?)
        ''', (association_id, album_id, artist_id, is_primary, now))

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
    
    albums = []
    for row in rows:
        # Get all artists for this album
        album_artists = get_album_artists(cursor, row[0])
        primary_artist = next((a for a in album_artists if a.get('isPrimary')), album_artists[0] if album_artists else None)
        
        album = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artistName": primary_artist['name'] if primary_artist else row[11],
            "artists": album_artists,  # All artists
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
    
    conn.close()
    return {"success": True, "data": albums}

@app.post("/api/admin/albums")
async def create_album(album: Album, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify primary artist exists
    cursor.execute('SELECT id FROM artists WHERE id=?', (album.artistId,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Primary artist not found")
    
    # Verify all artists exist if artistIds provided
    if album.artistIds:
        for artist_id in album.artistIds:
            cursor.execute('SELECT id FROM artists WHERE id=?', (artist_id,))
            if not cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=400, detail=f"Artist {artist_id} not found")
    
    album_id = str(uuid.uuid4())
    now = get_current_time()
    
    cursor.execute('''
        INSERT INTO albums (id, title, artistId, coverUrl, releaseDate, songCount, duration, genre, description, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        album_id, album.title, album.artistId, album.coverUrl, album.releaseDate,
        album.songCount, album.duration, album.genre, album.description, now, now
    ))
    
    # Handle multiple artists
    artist_ids = album.artistIds if album.artistIds else [album.artistId]
    manage_album_artists(cursor, album_id, artist_ids, album.artistId)
    
    # Update artist album counts
    for artist_id in set(artist_ids):  # Use set to avoid duplicate updates
        cursor.execute('UPDATE artists SET albumCount = albumCount + 1 WHERE id=?', (artist_id,))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": album_id, **album.dict()}}

@app.put("/api/admin/albums/{album_id}")
async def update_album(album_id: str, album: Album, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get existing album artists for count adjustment
    existing_artists = get_album_artists(cursor, album_id)
    existing_artist_ids = [a['id'] for a in existing_artists]
    
    # Verify primary artist exists
    cursor.execute('SELECT id FROM artists WHERE id=?', (album.artistId,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Primary artist not found")
    
    # Verify all artists exist if artistIds provided
    if album.artistIds:
        for artist_id in album.artistIds:
            cursor.execute('SELECT id FROM artists WHERE id=?', (artist_id,))
            if not cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=400, detail=f"Artist {artist_id} not found")
    
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
    
    # Handle multiple artists
    new_artist_ids = album.artistIds if album.artistIds else [album.artistId]
    manage_album_artists(cursor, album_id, new_artist_ids, album.artistId)
    
    # Update artist album counts
    # Decrease count for removed artists
    for artist_id in set(existing_artist_ids) - set(new_artist_ids):
        cursor.execute('UPDATE artists SET albumCount = albumCount - 1 WHERE id=? AND albumCount > 0', (artist_id,))
    
    # Increase count for new artists
    for artist_id in set(new_artist_ids) - set(existing_artist_ids):
        cursor.execute('UPDATE artists SET albumCount = albumCount + 1 WHERE id=?', (artist_id,))
    
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
    
    songs = []
    for row in rows:
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artistName": primary_artist['name'] if primary_artist else row[14],
            "artists": song_artists,  # All artists
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
    
    conn.close()
    return {"success": True, "data": songs}

@app.post("/api/admin/songs")
async def create_song(song: Song, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify primary artist exists
    cursor.execute('SELECT id FROM artists WHERE id=?', (song.artistId,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Primary artist not found")
    
    # Verify all artists exist if artistIds provided
    if song.artistIds:
        for artist_id in song.artistIds:
            cursor.execute('SELECT id FROM artists WHERE id=?', (artist_id,))
            if not cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=400, detail=f"Artist {artist_id} not found")
    
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
    
    # Handle multiple artists
    artist_ids = song.artistIds if song.artistIds else [song.artistId]
    manage_song_artists(cursor, song_id, artist_ids, song.artistId)
    
    # Update artist song counts
    for artist_id in set(artist_ids):  # Use set to avoid duplicate updates
        cursor.execute('UPDATE artists SET songCount = songCount + 1 WHERE id=?', (artist_id,))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": song_id, **song.dict()}}

@app.put("/api/admin/songs/{song_id}")
async def update_song(song_id: str, song: Song, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get existing song artists for count adjustment
    existing_artists = get_song_artists(cursor, song_id)
    existing_artist_ids = [a['id'] for a in existing_artists]
    
    # Verify primary artist exists
    cursor.execute('SELECT id FROM artists WHERE id=?', (song.artistId,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Primary artist not found")
    
    # Verify all artists exist if artistIds provided
    if song.artistIds:
        for artist_id in song.artistIds:
            cursor.execute('SELECT id FROM artists WHERE id=?', (artist_id,))
            if not cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=400, detail=f"Artist {artist_id} not found")
    
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
    
    # Handle multiple artists
    new_artist_ids = song.artistIds if song.artistIds else [song.artistId]
    manage_song_artists(cursor, song_id, new_artist_ids, song.artistId)
    
    # Update artist song counts
    # Decrease count for removed artists
    for artist_id in set(existing_artist_ids) - set(new_artist_ids):
        cursor.execute('UPDATE artists SET songCount = songCount - 1 WHERE id=? AND songCount > 0', (artist_id,))
    
    # Increase count for new artists
    for artist_id in set(new_artist_ids) - set(existing_artist_ids):
        cursor.execute('UPDATE artists SET songCount = songCount + 1 WHERE id=?', (artist_id,))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "data": {"id": song_id, **song.dict()}}

@app.delete("/api/admin/songs/{song_id}")
async def delete_song(song_id: str, username: str = Depends(verify_token)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get existing song artists for count adjustment
    existing_artists = get_song_artists(cursor, song_id)
    existing_artist_ids = [a['id'] for a in existing_artists]
    
    cursor.execute('DELETE FROM songs WHERE id=?', (song_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Update artist song counts (the song_artists associations will be deleted automatically due to CASCADE)
    for artist_id in existing_artist_ids:
        cursor.execute('UPDATE artists SET songCount = songCount - 1 WHERE id=? AND songCount > 0', (artist_id,))
    
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

@app.put("/api/admin/playlists/{playlist_id}/reorder")
async def reorder_playlist_songs(playlist_id: str, reorder_data: PlaylistReorder, username: str = Depends(verify_token)):
    """重新排序歌单中的歌曲"""
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Check if playlist exists
    cursor.execute('SELECT songIds, songCount FROM playlists WHERE id = ?', (playlist_id,))
    playlist_row = cursor.fetchone()
    
    if not playlist_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    current_song_ids = parse_json_field(playlist_row[0])
    new_song_ids = reorder_data.songIds
    
    # Validate that all songs in new order exist in current playlist
    if set(current_song_ids) != set(new_song_ids):
        conn.close()
        raise HTTPException(status_code=400, detail="Song IDs do not match current playlist")
    
    # Validate that all song IDs exist in the database
    if new_song_ids:
        placeholders = ','.join('?' * len(new_song_ids))
        cursor.execute(f'SELECT COUNT(*) FROM songs WHERE id IN ({placeholders})', new_song_ids)
        count = cursor.fetchone()[0]
        
        if count != len(new_song_ids):
            conn.close()
            raise HTTPException(status_code=400, detail="Some songs not found in database")
    
    # Update the playlist with new song order
    cursor.execute('''
        UPDATE playlists SET songIds=?, updatedAt=?
        WHERE id=?
    ''', (
        serialize_json_field(new_song_ids),
        get_current_time(),
        playlist_id
    ))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Playlist order updated successfully"}

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

# Import endpoints
@app.post("/api/admin/import/check-exists")
async def check_song_exists(request: CheckExistsRequest, username: str = Depends(verify_token)):
    """检查歌曲是否已存在于数据库中"""
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    try:
        # 检查歌曲是否存在（基于歌曲名和主要艺术家名）
        cursor.execute('''
            SELECT s.id, s.title, ar.name as artist_name 
            FROM songs s 
            JOIN artists ar ON s.artistId = ar.id 
            WHERE s.title = ? AND ar.name = ?
        ''', (request.songName, request.artistName))
        
        existing_song = cursor.fetchone()
        
        if existing_song:
            return {
                "success": True, 
                "exists": True, 
                "data": {
                    "id": existing_song[0],
                    "title": existing_song[1], 
                    "artistName": existing_song[2]
                }
            }
        else:
            return {"success": True, "exists": False}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"检查失败: {str(e)}")
    finally:
        conn.close()

@app.post("/api/admin/import/batch")
async def batch_import(request: ImportBatchRequest, username: str = Depends(verify_token)):
    """批量导入音乐数据"""
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    imported_count = 0
    skipped_count = 0
    errors = []
    results = []
    
    try:
        for item in request.items:
            try:
                song_info = item.songInfo
                album_info = item.albumInfo
                artists_info = item.artistsInfo
                lyrics = item.lyrics
                audio_url = item.audioUrl  # 使用传入的音频URL
                
                # 检查歌曲是否已存在
                if item.skipIfExists:
                    cursor.execute('''
                        SELECT s.id FROM songs s 
                        JOIN artists ar ON s.artistId = ar.id 
                        WHERE s.title = ? AND ar.name = ?
                    ''', (song_info.name, artists_info[0].name if artists_info else ''))
                    
                    existing = cursor.fetchone()
                    if existing:
                        skipped_count += 1
                        results.append({
                            "songId": song_info.songId,
                            "status": "skipped",
                            "reason": "歌曲已存在"
                        })
                        continue
                
                # 导入或获取艺术家
                created_artists = []
                primary_artist_id = None
                
                for i, artist_info in enumerate(artists_info):
                    # 检查艺术家是否已存在
                    cursor.execute('SELECT id FROM artists WHERE name = ?', (artist_info.name,))
                    existing_artist = cursor.fetchone()
                    
                    if existing_artist:
                        artist_id = existing_artist[0]
                    else:
                        # 创建新艺术家
                        artist_id = str(uuid.uuid4())
                        now = get_current_time()
                        cursor.execute('''
                            INSERT INTO artists (id, name, bio, avatar, coverUrl, followers, songCount, albumCount, genres, verified, createdAt, updatedAt)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            artist_id, artist_info.name, 
                            artist_info.intro[:500] if artist_info.intro else None,  # 限制简介长度
                            artist_info.avatarUrl, artist_info.avatarUrl, 
                            int(artist_info.fanCount.replace(',', '')) if artist_info.fanCount and artist_info.fanCount.replace(',', '').isdigit() else 0,
                            0, 0, "[]", False, now, now
                        ))
                    
                    created_artists.append(artist_id)
                    if i == 0:  # 第一个艺术家作为主艺术家
                        primary_artist_id = artist_id
                
                # 导入或获取专辑
                album_id = None
                if album_info:
                    # 检查专辑是否已存在（基于标题和主艺术家）
                    cursor.execute('''
                        SELECT id FROM albums WHERE title = ? AND artistId = ?
                    ''', (album_info.title, primary_artist_id))
                    existing_album = cursor.fetchone()
                    
                    if existing_album:
                        album_id = existing_album[0]
                    else:
                        # 创建新专辑
                        album_id = str(uuid.uuid4())
                        now = get_current_time()
                        cursor.execute('''
                            INSERT INTO albums (id, title, artistId, coverUrl, releaseDate, songCount, duration, genre, description, createdAt, updatedAt)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            album_id, album_info.title, primary_artist_id, album_info.coverUrl,
                            album_info.releaseDate, 0, 0, None, album_info.description, now, now
                        ))
                        
                        # 创建专辑-艺术家关联
                        manage_album_artists(cursor, album_id, created_artists, primary_artist_id)
                        
                        # 更新艺术家专辑计数
                        for artist_id in created_artists:
                            cursor.execute('UPDATE artists SET albumCount = albumCount + 1 WHERE id=?', (artist_id,))
                
                # 创建歌曲
                song_id = str(uuid.uuid4())
                now = get_current_time()
                
                cursor.execute('''
                    INSERT INTO songs (id, title, artistId, albumId, duration, audioUrl, coverUrl, lyrics, moodIds, playCount, liked, genre, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    song_id, song_info.name, primary_artist_id, album_id, song_info.duration,
                    audio_url, song_info.img, lyrics, "[]", 0, False, None, now, now
                ))
                
                # 创建歌曲-艺术家关联
                manage_song_artists(cursor, song_id, created_artists, primary_artist_id)
                
                # 更新艺术家歌曲计数
                for artist_id in created_artists:
                    cursor.execute('UPDATE artists SET songCount = songCount + 1 WHERE id=?', (artist_id,))
                
                # 更新专辑歌曲计数
                if album_id:
                    cursor.execute('UPDATE albums SET songCount = songCount + 1 WHERE id=?', (album_id,))
                
                imported_count += 1
                results.append({
                    "songId": song_info.songId,
                    "status": "imported",
                    "localId": song_id
                })
                
            except Exception as e:
                errors.append(f"导入歌曲 {song_info.name} 失败: {str(e)}")
                results.append({
                    "songId": song_info.songId,
                    "status": "error",
                    "reason": str(e)
                })
        
        conn.commit()
        
        return {
            "success": True,
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": errors,
            "details": results
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"批量导入失败: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)