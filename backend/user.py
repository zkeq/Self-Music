from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import asyncio
import sqlite3
import json
import os
import mimetypes
import uuid
import random
import string
from datetime import datetime, timezone

router = APIRouter()

# Helper functions
def parse_json_field(field_value: str) -> List[str]:
    if not field_value:
        return []
    try:
        return json.loads(field_value)
    except:
        return []

def ensure_https_url(url: str) -> str:
    """Convert HTTP URLs to HTTPS to prevent mixed content issues"""
    if url and url.startswith('http://'):
        return url.replace('http://', 'https://', 1)
    return url

def get_artist_by_id(cursor, artist_id: str) -> Optional[Dict]:
    cursor.execute('SELECT * FROM artists WHERE id=?', (artist_id,))
    row = cursor.fetchone()
    if not row:
        return None
    return {
        "id": row[0],
        "name": row[1],
        "bio": row[2],
        "avatar": ensure_https_url(row[3]),
        "coverUrl": ensure_https_url(row[4]),
        "followers": row[5],
        "songCount": row[6],
        "albumCount": row[7],
        "genres": parse_json_field(row[8]),
        "verified": bool(row[9]),
        "createdAt": row[10],
        "updatedAt": row[11]
    }

def get_album_by_id(cursor, album_id: str) -> Optional[Dict]:
    cursor.execute('''
        SELECT a.*, ar.name as artist_name FROM albums a 
        JOIN artists ar ON a.artistId = ar.id 
        WHERE a.id=?
    ''', (album_id,))
    row = cursor.fetchone()
    if not row:
        return None
    
    # Get all artists for this album
    album_artists = get_album_artists(cursor, album_id)
    primary_artist = next((a for a in album_artists if a.get('isPrimary')), album_artists[0] if album_artists else None)
    
    return {
        "id": row[0],
        "title": row[1],
        "artistId": row[2],
        "artist": primary_artist,  # Primary artist for backward compatibility
        "artists": album_artists,  # All artists
        "coverUrl": ensure_https_url(row[3]),
        "releaseDate": row[4],
        "songCount": row[5],
        "duration": row[6],
        "genre": row[7],
        "description": row[8],
        "createdAt": row[9],
        "updatedAt": row[10]
    }

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
            "avatar": ensure_https_url(row[3]),
            "coverUrl": ensure_https_url(row[4]),
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
            "avatar": ensure_https_url(row[3]),
            "coverUrl": ensure_https_url(row[4]),
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

def get_moods_for_song(cursor, mood_ids: List[str]) -> List[Dict]:
    if not mood_ids:
        return []
    
    placeholders = ','.join('?' * len(mood_ids))
    cursor.execute(f'SELECT * FROM moods WHERE id IN ({placeholders})', mood_ids)
    rows = cursor.fetchall()
    
    moods = []
    for row in rows:
        mood = {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "icon": row[3],
            "color": row[4],
            "coverUrl": ensure_https_url(row[5]),
            "songCount": row[6],
            "createdAt": row[7],
            "updatedAt": row[8]
        }
        moods.append(mood)
    
    return moods

# Artists API
@router.get("/api/artists")
async def get_artists(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM artists')
    total = cursor.fetchone()[0]
    
    # Get paginated results
    offset = (page - 1) * limit
    cursor.execute('SELECT * FROM artists ORDER BY songCount DESC LIMIT ? OFFSET ?', (limit, offset))
    rows = cursor.fetchall()
    conn.close()
    
    artists = []
    for row in rows:
        artist = {
            "id": row[0],
            "name": row[1],
            "bio": row[2],
            "avatar": row[3],
            "coverUrl": ensure_https_url(row[4]),
            "followers": row[5],
            "songCount": row[6],
            "albumCount": row[7],
            "genres": parse_json_field(row[8]),
            "verified": bool(row[9]),
            "createdAt": row[10],
            "updatedAt": row[11]
        }
        artists.append(artist)
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": artists,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }

@router.get("/api/artists/{artist_id}")
async def get_artist(artist_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    artist = get_artist_by_id(cursor, artist_id)
    conn.close()
    
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    
    return artist

@router.get("/api/artists/{artist_id}/songs")
async def get_artist_songs(artist_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify artist exists
    artist = get_artist_by_id(cursor, artist_id)
    if not artist:
        conn.close()
        raise HTTPException(status_code=404, detail="Artist not found")
    
    # Get songs where this artist is involved (through song_artists table)
    cursor.execute('''
        SELECT DISTINCT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN song_artists sa ON s.id = sa.songId
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        WHERE sa.artistId = ?
        ORDER BY s.createdAt DESC
    ''', (artist_id,))
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    return songs

@router.get("/api/artists/{artist_id}/albums")
async def get_artist_albums(artist_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify artist exists
    artist = get_artist_by_id(cursor, artist_id)
    if not artist:
        conn.close()
        raise HTTPException(status_code=404, detail="Artist not found")
    
    # Get albums where this artist is involved (through album_artists table)
    cursor.execute('''
        SELECT DISTINCT a.*, ar.name as artist_name FROM albums a 
        JOIN album_artists aa ON a.id = aa.albumId
        JOIN artists ar ON a.artistId = ar.id 
        WHERE aa.artistId = ?
        ORDER BY a.createdAt DESC
    ''', (artist_id,))
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
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": album_artists,  # All artists
            "coverUrl": ensure_https_url(row[3]),
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
    return albums

# Albums API
@router.get("/api/albums")
async def get_albums(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM albums')
    total = cursor.fetchone()[0]
    
    # Get paginated results
    offset = (page - 1) * limit
    cursor.execute('''
        SELECT a.*, ar.name as artist_name FROM albums a 
        JOIN artists ar ON a.artistId = ar.id 
        ORDER BY a.createdAt DESC LIMIT ? OFFSET ?
    ''', (limit, offset))
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
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": album_artists,  # All artists
            "coverUrl": ensure_https_url(row[3]),
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
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": albums,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }

@router.get("/api/albums/{album_id}")
async def get_album(album_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    album = get_album_by_id(cursor, album_id)
    conn.close()
    
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    return album

@router.get("/api/albums/{album_id}/songs")
async def get_album_songs(album_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify album exists
    album = get_album_by_id(cursor, album_id)
    if not album:
        conn.close()
        raise HTTPException(status_code=404, detail="Album not found")
    
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        WHERE s.albumId = ?
        ORDER BY s.createdAt ASC
    ''', (album_id,))
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    return songs

# Songs API  
@router.get("/api/songs")
async def get_songs(
    page: int = Query(1, ge=1), 
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_desc", regex="^(created_desc|created_asc|title_asc|title_desc|play_count_desc|play_count_asc)$")
):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM songs')
    total = cursor.fetchone()[0]
    
    # Determine sort order
    if sort_by == "created_desc":
        order_clause = "ORDER BY s.createdAt DESC"
    elif sort_by == "created_asc":
        order_clause = "ORDER BY s.createdAt ASC"
    elif sort_by == "title_asc":
        order_clause = "ORDER BY s.title ASC"
    elif sort_by == "title_desc":
        order_clause = "ORDER BY s.title DESC"
    elif sort_by == "play_count_desc":
        order_clause = "ORDER BY s.playCount DESC"
    elif sort_by == "play_count_asc":
        order_clause = "ORDER BY s.playCount ASC"
    else:
        order_clause = "ORDER BY s.createdAt DESC"
    
    # Get paginated results
    offset = (page - 1) * limit
    cursor.execute(f'''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        {order_clause} LIMIT ? OFFSET ?
    ''', (limit, offset))
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": songs,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
        "sortBy": sort_by
    }

@router.get("/api/songs/{song_id}")
async def get_song(song_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        WHERE s.id = ?
    ''', (song_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found")
    
    mood_ids = parse_json_field(row[8])
    moods = get_moods_for_song(cursor, mood_ids)
    
    # Get all artists for this song
    song_artists = get_song_artists(cursor, row[0])
    primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
    
    album_data = get_album_by_id(cursor, row[3]) if row[3] else None
    
    song = {
        "id": row[0],
        "title": row[1],
        "artistId": row[2],
        "artist": primary_artist,  # Primary artist for backward compatibility
        "artists": song_artists,   # All artists
        "albumId": row[3],
        "album": album_data,
        "duration": row[4],
        "audioUrl": row[5],
        "coverUrl": ensure_https_url(row[6]),
        "lyrics": row[7],
        "moodIds": mood_ids,
        "moods": moods,
        "playCount": row[9],
        "liked": bool(row[10]),
        "genre": row[11],
        "createdAt": row[12],
        "updatedAt": row[13]
    }
    
    conn.close()
    return song

@router.post("/api/songs/{song_id}/play")
async def record_song_play(song_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Check if song exists
    cursor.execute('SELECT id, playCount FROM songs WHERE id = ?', (song_id,))
    song_row = cursor.fetchone()
    
    if not song_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Update play count
    cursor.execute('UPDATE songs SET playCount = playCount + 1 WHERE id = ?', (song_id,))
    
    # Get updated play count
    cursor.execute('SELECT playCount FROM songs WHERE id = ?', (song_id,))
    new_play_count = cursor.fetchone()[0]
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "data": {
            "songId": song_id,
            "playCount": new_play_count
        }
    }

@router.get("/api/songs/{song_id}/stream")
async def stream_song(song_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT audioUrl FROM songs WHERE id = ?', (song_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not row[0]:
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    audio_path = row[0]
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found on disk")
    
    def file_generator():
        with open(audio_path, "rb") as audio_file:
            while True:
                chunk = audio_file.read(8192)
                if not chunk:
                    break
                yield chunk
    
    media_type = mimetypes.guess_type(audio_path)[0] or "audio/mpeg"
    
    return StreamingResponse(
        file_generator(),
        media_type=media_type,
        headers={"Accept-Ranges": "bytes"}
    )

@router.get("/api/songs/{song_id}/similar")
async def get_similar_songs(song_id: str, limit: int = Query(10, ge=1, le=50)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get the target song's data
    cursor.execute('SELECT artistId, moodIds, genre FROM songs WHERE id = ?', (song_id,))
    song_row = cursor.fetchone()
    
    if not song_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found")
    
    artist_id, mood_ids_str, genre = song_row
    mood_ids = parse_json_field(mood_ids_str)
    
    # Find similar songs
    similar_songs = []
    
    # First, get songs by same artist
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        WHERE s.artistId = ? AND s.id != ?
        ORDER BY s.playCount DESC
    ''', (artist_id, song_id))
    artist_songs = cursor.fetchall()
    
    # Then, get songs with similar moods
    if mood_ids:
        placeholders = ','.join('?' * len(mood_ids))
        cursor.execute(f'''
            SELECT s.*, ar.name as artist_name, al.title as album_title 
            FROM songs s 
            JOIN artists ar ON s.artistId = ar.id 
            LEFT JOIN albums al ON s.albumId = al.id 
            WHERE s.id != ? AND s.moodIds LIKE ?
            ORDER BY s.playCount DESC
        ''', (song_id, f'%{mood_ids[0]}%'))
        mood_songs = cursor.fetchall()
    else:
        mood_songs = []
    
    # Combine and deduplicate results
    all_songs = artist_songs + mood_songs
    seen_ids = set()
    unique_songs = []
    
    for row in all_songs:
        if row[0] not in seen_ids:
            seen_ids.add(row[0])
            unique_songs.append(row)
            if len(unique_songs) >= limit:
                break
    
    # Build response
    songs = []
    for row in unique_songs:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    return songs

# Playlists API
@router.get("/api/playlists")
async def get_playlists(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get total count of public playlists
    cursor.execute('SELECT COUNT(*) FROM playlists WHERE isPublic = 1')
    total = cursor.fetchone()[0]
    
    # Get paginated results - only basic playlist info, no songs
    offset = (page - 1) * limit
    cursor.execute('SELECT * FROM playlists WHERE isPublic = 1 ORDER BY createdAt DESC LIMIT ? OFFSET ?', (limit, offset))
    rows = cursor.fetchall()
    
    playlists = []
    for row in rows:
        song_ids = parse_json_field(row[4])
        
        playlist = {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "coverUrl": ensure_https_url(row[3]),
            "songIds": song_ids,
            "songCount": row[5],
            "playCount": row[6],
            "duration": row[7],
            "creator": row[8],
            "isPublic": bool(row[9]),
            "createdAt": row[10],
            "updatedAt": row[11]
        }
        playlists.append(playlist)
    
    conn.close()
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": playlists,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }

@router.get("/api/playlists/{playlist_id}")
async def get_playlist(playlist_id: str):
    """Get detailed playlist information including all songs"""
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM playlists WHERE id = ?', (playlist_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    song_ids = parse_json_field(row[4])
    
    # Get songs for this playlist
    songs = []
    if song_ids:
        # Create ORDER BY clause based on song_ids order
        case_statements = [f"WHEN s.id = '{song_id}' THEN {i}" for i, song_id in enumerate(song_ids)]
        order_by_case = f"CASE {' '.join(case_statements)} ELSE {len(song_ids)} END"
        
        placeholders = ','.join('?' * len(song_ids))
        cursor.execute(f'''
            SELECT s.*, ar.name as artist_name, al.title as album_title 
            FROM songs s 
            JOIN artists ar ON s.artistId = ar.id 
            LEFT JOIN albums al ON s.albumId = al.id 
            WHERE s.id IN ({placeholders})
            ORDER BY {order_by_case}
        ''', song_ids)
        song_rows = cursor.fetchall()
        
        for song_row in song_rows:
            mood_ids = parse_json_field(song_row[8])
            moods = get_moods_for_song(cursor, mood_ids)
            
            # Get all artists for this song
            song_artists = get_song_artists(cursor, song_row[0])
            primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
            
            album_data = get_album_by_id(cursor, song_row[3]) if song_row[3] else None
            
            song = {
                "id": song_row[0],
                "title": song_row[1],
                "artistId": song_row[2],
                "artist": primary_artist,  # Primary artist for backward compatibility
                "artists": song_artists,   # All artists
                "albumId": song_row[3],
                "album": album_data,
                "duration": song_row[4],
                "audioUrl": song_row[5],
                "coverUrl": ensure_https_url(song_row[6]),
                "lyrics": song_row[7],
                "moodIds": mood_ids,
                "moods": moods,
                "playCount": song_row[9],
                "liked": bool(song_row[10]),
                "genre": song_row[11],
                "createdAt": song_row[12],
                "updatedAt": song_row[13]
            }
            songs.append(song)
    
    playlist = {
        "id": row[0],
        "name": row[1],
        "description": row[2],
        "coverUrl": ensure_https_url(row[3]),
        "songIds": song_ids,
        "songs": songs,
        "songCount": row[5],
        "playCount": row[6],
        "duration": row[7],
        "creator": row[8],
        "isPublic": bool(row[9]),
        "createdAt": row[10],
        "updatedAt": row[11]
    }
    
    conn.close()
    return playlist
# Moods API
@router.get("/api/moods")
async def get_moods():
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
            "coverUrl": ensure_https_url(row[5]),
            "songCount": row[6],
            "createdAt": row[7],
            "updatedAt": row[8]
        }
        moods.append(mood)
    
    return moods

@router.get("/api/moods/{mood_id}")
async def get_mood(mood_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM moods WHERE id=?', (mood_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Mood not found")
    
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
    
    return mood

@router.get("/api/moods/{mood_id}/songs")
async def get_mood_songs(mood_id: str, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify mood exists
    cursor.execute('SELECT id FROM moods WHERE id=?', (mood_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Mood not found")
    
    # Get total count
    cursor.execute('''
        SELECT COUNT(*) FROM songs s 
        WHERE s.moodIds LIKE ?
    ''', (f'%{mood_id}%',))
    total = cursor.fetchone()[0]
    
    # Get paginated results
    offset = (page - 1) * limit
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        WHERE s.moodIds LIKE ?
        ORDER BY s.playCount DESC
        LIMIT ? OFFSET ?
    ''', (f'%{mood_id}%', limit, offset))
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        if mood_id in mood_ids:  # Double check the mood is actually in the list
            moods = get_moods_for_song(cursor, mood_ids)
            
            # Get all artists for this song
            song_artists = get_song_artists(cursor, row[0])
            primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
            
            album_data = get_album_by_id(cursor, row[3]) if row[3] else None
            
            song = {
                "id": row[0],
                "title": row[1],
                "artistId": row[2],
                "artist": primary_artist,  # Primary artist for backward compatibility
                "artists": song_artists,   # All artists
                "albumId": row[3],
                "album": album_data,
                "duration": row[4],
                "audioUrl": row[5],
                "coverUrl": ensure_https_url(row[6]),
                "lyrics": row[7],
                "moodIds": mood_ids,
                "moods": moods,
                "playCount": row[9],
                "liked": bool(row[10]),
                "genre": row[11],
                "createdAt": row[12],
                "updatedAt": row[13]
            }
            songs.append(song)
    
    conn.close()
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": songs,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }

# Search API
@router.get("/api/search")
async def search_content(q: str = Query(..., min_length=1)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    query = f"%{q.lower()}%"
    
    # Search songs (include songs by all associated artists, not just primary artist)
    cursor.execute('''
        SELECT DISTINCT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        LEFT JOIN song_artists sa ON s.id = sa.songId
        LEFT JOIN artists sar ON sa.artistId = sar.id
        WHERE LOWER(s.title) LIKE ? OR LOWER(ar.name) LIKE ? OR LOWER(s.genre) LIKE ? OR LOWER(sar.name) LIKE ?
        ORDER BY s.playCount DESC
        LIMIT 20
    ''', (query, query, query, query))
    song_rows = cursor.fetchall()
    
    songs = []
    for row in song_rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    # Search artists
    cursor.execute('''
        SELECT * FROM artists 
        WHERE LOWER(name) LIKE ? OR LOWER(bio) LIKE ?
        ORDER BY followers DESC
        LIMIT 20
    ''', (query, query))
    artist_rows = cursor.fetchall()
    
    artists = []
    for row in artist_rows:
        artist = {
            "id": row[0],
            "name": row[1],
            "bio": row[2],
            "avatar": row[3],
            "coverUrl": ensure_https_url(row[4]),
            "followers": row[5],
            "songCount": row[6],
            "albumCount": row[7],
            "genres": parse_json_field(row[8]),
            "verified": bool(row[9]),
            "createdAt": row[10],
            "updatedAt": row[11]
        }
        artists.append(artist)
    
    # Search albums (include albums by all associated artists, not just primary artist)
    cursor.execute('''
        SELECT DISTINCT a.*, ar.name as artist_name FROM albums a 
        JOIN artists ar ON a.artistId = ar.id 
        LEFT JOIN album_artists aa ON a.id = aa.albumId
        LEFT JOIN artists aar ON aa.artistId = aar.id
        WHERE LOWER(a.title) LIKE ? OR LOWER(ar.name) LIKE ? OR LOWER(a.genre) LIKE ? OR LOWER(aar.name) LIKE ?
        ORDER BY a.songCount DESC
        LIMIT 20
    ''', (query, query, query, query))
    album_rows = cursor.fetchall()
    
    albums = []
    for row in album_rows:
        # Get all artists for this album
        album_artists = get_album_artists(cursor, row[0])
        primary_artist = next((a for a in album_artists if a.get('isPrimary')), album_artists[0] if album_artists else None)
        
        album = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": album_artists,  # All artists
            "coverUrl": ensure_https_url(row[3]),
            "releaseDate": row[4],
            "songCount": row[5],
            "duration": row[6],
            "genre": row[7],
            "description": row[8],
            "createdAt": row[9],
            "updatedAt": row[10]
        }
        albums.append(album)
    
    # Search playlists
    cursor.execute('''
        SELECT * FROM playlists 
        WHERE isPublic = 1 AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
        ORDER BY playCount DESC
        LIMIT 20
    ''', (query, query))
    playlist_rows = cursor.fetchall()
    
    playlists = []
    for row in playlist_rows:
        playlist = {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "coverUrl": ensure_https_url(row[3]),
            "songIds": parse_json_field(row[4]),
            "songs": [],  # Not populated for search results
            "songCount": row[5],
            "playCount": row[6],
            "duration": row[7],
            "creator": row[8],
            "isPublic": bool(row[9]),
            "createdAt": row[10],
            "updatedAt": row[11]
        }
        playlists.append(playlist)
    
    conn.close()
    
    return {
        "success": True,
        "songs": songs,
        "artists": artists,
        "albums": albums,
        "playlists": playlists
    }

# Recommendations API
@router.get("/api/recommendations")
async def get_recommendations(
    limit: int = Query(20, ge=1, le=50),
    type: Optional[str] = Query(None),
    moodId: Optional[str] = Query(None),
    artistId: Optional[str] = Query(None),
    genreId: Optional[str] = Query(None)
):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Base query
    base_query = '''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
    '''
    
    conditions = []
    params = []
    
    # Apply filters
    if moodId:
        conditions.append('s.moodIds LIKE ?')
        params.append(f'%{moodId}%')
    
    if artistId:
        conditions.append('s.artistId = ?')
        params.append(artistId)
    
    if genreId:
        conditions.append('s.genre = ?')
        params.append(genreId)
    
    # Build WHERE clause
    where_clause = ' WHERE ' + ' AND '.join(conditions) if conditions else ''
    
    # Apply sorting based on type
    if type == 'hot':
        order_clause = 'ORDER BY s.playCount DESC'
    elif type == 'new':
        order_clause = 'ORDER BY s.createdAt DESC'
    elif type == 'trending':
        order_clause = 'ORDER BY s.playCount DESC'
    elif type == 'random' or type == 'featured':
        order_clause = 'ORDER BY RANDOM()'
    else:
        order_clause = 'ORDER BY RANDOM()'
    
    # Combine query
    full_query = f"{base_query}{where_clause} {order_clause} LIMIT ?"
    params.append(limit)
    
    cursor.execute(full_query, params)
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    return songs

@router.get("/api/trending/songs")
async def get_trending_songs(limit: int = Query(20, ge=1, le=50)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        ORDER BY s.playCount DESC
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    return songs

@router.get("/api/hot/songs")
async def get_hot_songs(limit: int = Query(20, ge=1, le=50)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        ORDER BY s.playCount DESC
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    return songs

@router.get("/api/new/songs")
async def get_new_songs(limit: int = Query(20, ge=1, le=50)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        ORDER BY s.createdAt DESC
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    
    songs = []
    for row in rows:
        mood_ids = parse_json_field(row[8])
        moods = get_moods_for_song(cursor, mood_ids)
        
        # Get all artists for this song
        song_artists = get_song_artists(cursor, row[0])
        primary_artist = next((a for a in song_artists if a.get('isPrimary')), song_artists[0] if song_artists else None)
        
        album_data = get_album_by_id(cursor, row[3]) if row[3] else None
        
        song = {
            "id": row[0],
            "title": row[1],
            "artistId": row[2],
            "artist": primary_artist,  # Primary artist for backward compatibility
            "artists": song_artists,   # All artists
            "albumId": row[3],
            "album": album_data,
            "duration": row[4],
            "audioUrl": row[5],
            "coverUrl": ensure_https_url(row[6]),
            "lyrics": row[7],
            "moodIds": mood_ids,
            "moods": moods,
            "playCount": row[9],
            "liked": bool(row[10]),
            "genre": row[11],
            "createdAt": row[12],
            "updatedAt": row[13]
        }
        songs.append(song)
    
    conn.close()
    return songs
# Music Moments API (Public)
@router.get("/api/moments")
async def get_moments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    tags: Optional[str] = Query(None),
    energyLevel: Optional[int] = Query(None),
    year: Optional[str] = Query(None),
    period: Optional[str] = Query(None)
):
    """获取音乐朋友圈列表（每首歌只有一个朋友圈，后续分享为评论）"""
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    # Build WHERE clause based on filters (除了tags)
    conditions = []
    params = []

    # 解析标签过滤条件
    tag_list = []
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]

    # 解析年份过滤条件
    year_list = []
    if year:
        year_list = [int(y.strip()) for y in year.split(",") if y.strip()]

    # 解析时期过滤条件
    period_list = []
    if period:
        period_list = [p.strip() for p in period.split(",") if p.strip()]

    if energyLevel is not None:
        conditions.append("m.energyLevel = ?")
        params.append(energyLevel)

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    # Get all matching moments (without tag filtering in SQL)
    cursor.execute(f"""
        SELECT m.*, s.title, s.coverUrl, ar.name as artist_name
        FROM music_moments m
        JOIN songs s ON m.songId = s.id
        JOIN artists ar ON s.artistId = ar.id
        {where_clause}
        ORDER BY m.createdAt DESC
    """, params)
    all_rows = cursor.fetchall()

    # Filter by tags in Python
    filtered_rows = []
    for row in all_rows:
        moment_tags = parse_json_field(row[3])  # row[3] is tags field
        moment_year = row[5]  # row[5] is firstHeardYear
        moment_period = row[6]  # row[6] is firstHeardPeriod

        # Check tag filter
        if tag_list:
            tag_match = any(tag in moment_tags for tag in tag_list)
            if not tag_match:
                continue

        # Check year filter
        if year_list:
            if moment_year not in year_list:
                continue

        # Check period filter
        if period_list:
            if moment_period not in period_list:
                continue

        filtered_rows.append(row)

    # Calculate pagination
    total = len(filtered_rows)
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    offset = (page - 1) * limit

    # Apply pagination
    paginated_rows = filtered_rows[offset:offset + limit]

    moments = []
    for row in paginated_rows:
        moment = {
            "id": row[0],
            "songId": row[1],
            "content": row[2],
            "tags": parse_json_field(row[3]),
            "energyLevel": row[4],
            "firstHeardYear": row[5],
            "firstHeardPeriod": row[6],
            "likeCount": row[7],
            "createdAt": row[8],
            "updatedAt": row[9],
            "song": {
                "id": row[1],
                "title": row[10],
                "coverUrl": ensure_https_url(row[11]),
                "artistName": row[12]
            }
        }

        # Get comments for this moment
        cursor.execute("""
            SELECT * FROM moment_comments WHERE momentId = ? ORDER BY createdAt ASC
        """, (moment["id"],))
        comment_rows = cursor.fetchall()

        moment["comments"] = []
        for c_row in comment_rows:
            moment["comments"].append({
                "id": c_row[0],
                "momentId": c_row[1],
                "content": c_row[2],
                "listenDate": c_row[3],
                "location": c_row[4],
                "createdAt": c_row[5]
            })

        moments.append(moment)

    conn.close()

    return {
        "success": True,
        "data": moments,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages
    }

@router.get("/api/moments/{moment_id}")
async def get_moment(moment_id: str):
    """获取单个音乐朋友圈详情"""
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT m.*, s.title, s.coverUrl, ar.name as artist_name
        FROM music_moments m
        JOIN songs s ON m.songId = s.id
        JOIN artists ar ON s.artistId = ar.id
        WHERE m.id = ?
    """, (moment_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Moment not found")

    # Get comments for this moment
    cursor.execute("""
        SELECT * FROM moment_comments WHERE momentId = ? ORDER BY createdAt ASC
    """, (moment_id,))
    comment_rows = cursor.fetchall()

    comments = []
    for c_row in comment_rows:
        comments.append({
            "id": c_row[0],
            "momentId": c_row[1],
            "content": c_row[2],
            "listenDate": c_row[3],
            "location": c_row[4],
            "createdAt": c_row[5]
        })

    moment = {
        "id": row[0],
        "songId": row[1],
        "content": row[2],
        "tags": parse_json_field(row[3]),
        "energyLevel": row[4],
        "firstHeardYear": row[5],
        "firstHeardPeriod": row[6],
        "likeCount": row[7],
        "createdAt": row[8],
        "updatedAt": row[9],
        "song": {
            "id": row[1],
            "title": row[10],
            "coverUrl": ensure_https_url(row[11]),
            "artistName": row[12]
        },
        "comments": comments
    }

    conn.close()
    return moment

@router.get("/api/songs/{song_id}/moment")
async def get_song_moment(song_id: str):
    """获取歌曲的朋友圈（用于播放页显示）"""
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT m.*, s.title, s.coverUrl, ar.name as artist_name
        FROM music_moments m
        JOIN songs s ON m.songId = s.id
        JOIN artists ar ON s.artistId = ar.id
        WHERE m.songId = ?
        ORDER BY m.createdAt DESC
        LIMIT 1
    """, (song_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return {"success": True, "data": None}

    moment_id = row[0]

    # Get comments for this moment
    cursor.execute("""
        SELECT * FROM moment_comments WHERE momentId = ? ORDER BY createdAt ASC
    """, (moment_id,))
    comment_rows = cursor.fetchall()

    comments = []
    for c_row in comment_rows:
        comments.append({
            "id": c_row[0],
            "momentId": c_row[1],
            "content": c_row[2],
            "listenDate": c_row[3],
            "location": c_row[4],
            "createdAt": c_row[5]
        })

    moment = {
        "id": row[0],
        "songId": row[1],
        "content": row[2],
        "tags": parse_json_field(row[3]),
        "energyLevel": row[4],
        "firstHeardYear": row[5],
        "firstHeardPeriod": row[6],
        "likeCount": row[7],
        "createdAt": row[8],
        "updatedAt": row[9],
        "song": {
            "id": row[1],
            "title": row[10],
            "coverUrl": ensure_https_url(row[11]),
            "artistName": row[12]
        },
        "comments": comments
    }

    conn.close()
    return {"success": True, "data": moment}

@router.post("/api/moments/{moment_id}/like")
async def like_moment(moment_id: str):
    """点赞朋友圈（无需鉴权）"""
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    # Check if moment exists
    cursor.execute("SELECT id, likeCount FROM music_moments WHERE id = ?", (moment_id,))
    moment_row = cursor.fetchone()

    if not moment_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Moment not found")

    # Increment like count
    new_like_count = (moment_row[1] or 0) + 1
    cursor.execute("UPDATE music_moments SET likeCount = ? WHERE id = ?", (new_like_count, moment_id))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "data": {
            "momentId": moment_id,
            "likeCount": new_like_count
        }
    }

@router.get("/api/moments/filters/tags")
async def get_all_tags():
    """获取所有已使用的标签"""
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    cursor.execute("SELECT tags FROM music_moments WHERE tags IS NOT NULL AND tags != '[]'")
    rows = cursor.fetchall()

    # 收集所有标签并去重
    all_tags = set()
    for row in rows:
        tags = parse_json_field(row[0])
        if tags:
            all_tags.update(tags)

    conn.close()

    return {
        "success": True,
        "data": sorted(list(all_tags))  # 返回排序后的标签列表
    }

@router.get("/api/moments/filters/years")
async def get_all_years():
    """获取所有首次听到的年份"""
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT firstHeardYear
        FROM music_moments
        WHERE firstHeardYear IS NOT NULL
        ORDER BY firstHeardYear DESC
    """)
    rows = cursor.fetchall()

    years = [row[0] for row in rows]

    conn.close()

    return {
        "success": True,
        "data": years
    }

@router.get("/api/moments/filters/periods")
async def get_all_periods():
    """获取所有首次听到的时期"""
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT firstHeardPeriod
        FROM music_moments
        WHERE firstHeardPeriod IS NOT NULL AND firstHeardPeriod != ''
        ORDER BY firstHeardPeriod
    """)
    rows = cursor.fetchall()

    periods = [row[0] for row in rows]

    conn.close()

    return {
        "success": True,
        "data": periods
    }

# Room collaboration models
class RoomCreateRequest(BaseModel):
    name: Optional[str] = "听歌房间"
    nickname: Optional[str] = None
    memberId: Optional[str] = None
    playlist: List[Dict[str, Any]] = []
    currentIndex: int = 0
    currentTime: float = 0
    isPlaying: bool = False
    repeatMode: str = "none"
    shuffleMode: bool = False


class RoomJoinRequest(BaseModel):
    nickname: Optional[str] = None
    memberId: Optional[str] = None


class RoomActionRequest(BaseModel):
    type: str
    payload: Dict[str, Any] = {}
    memberId: Optional[str] = None
    nickname: Optional[str] = None


class RoomMessageCreateRequest(BaseModel):
    content: str
    memberId: Optional[str] = None
    nickname: Optional[str] = None


ROOM_COLORS = [
    "#60a5fa",
    "#34d399",
    "#f472b6",
    "#f59e0b",
    "#a78bfa",
    "#f87171",
]

room_connections: Dict[str, Dict[str, WebSocket]] = {}


def utc_now_iso() -> str:
    return datetime.utcnow().isoformat(timespec="milliseconds") + "Z"


def parse_room_datetime(value: Optional[str]) -> datetime:
    if not value:
        return datetime.utcnow()
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is not None:
        return parsed.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed


def generate_room_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choices(alphabet, k=6))


def pick_room_color(seed: str) -> str:
    if not seed:
        return ROOM_COLORS[0]
    return ROOM_COLORS[sum(ord(char) for char in seed) % len(ROOM_COLORS)]


def get_room_member(cursor, room_code: str, member_id: str) -> Optional[Dict[str, Any]]:
    cursor.execute(
        "SELECT * FROM room_members WHERE roomCode = ? AND id = ?",
        (room_code, member_id),
    )
    row = cursor.fetchone()
    if not row:
      return None
    return {
        "id": row[0],
        "roomCode": row[1],
        "nickname": row[2],
        "color": row[3],
        "isHost": bool(row[4]),
        "isActive": bool(row[5]),
        "joinedAt": row[6],
        "lastSeenAt": row[7],
    }


def upsert_room_member(
    cursor,
    room_code: str,
    member_id: Optional[str],
    nickname: str,
    is_host: bool = False,
    active: bool = True,
) -> Dict[str, Any]:
    now = utc_now_iso()
    member_id = member_id or str(uuid.uuid4())
    existing = get_room_member(cursor, room_code, member_id)
    color = pick_room_color(member_id + nickname)
    if existing:
        cursor.execute(
            """
            UPDATE room_members
            SET nickname = ?, color = ?, isHost = ?, isActive = ?, lastSeenAt = ?
            WHERE id = ? AND roomCode = ?
            """,
            (nickname, color, int(is_host or existing["isHost"]), int(active), now, member_id, room_code),
        )
    else:
        cursor.execute(
            """
            INSERT INTO room_members (id, roomCode, nickname, color, isHost, isActive, joinedAt, lastSeenAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (member_id, room_code, nickname, color, int(is_host), int(active), now, now),
        )

    return {
        "id": member_id,
        "roomCode": room_code,
        "nickname": nickname,
        "color": color,
        "isHost": bool(is_host or (existing["isHost"] if existing else False)),
        "isActive": active,
        "joinedAt": existing["joinedAt"] if existing else now,
        "lastSeenAt": now,
    }


def get_room_row(cursor, room_code: str):
    cursor.execute("SELECT * FROM rooms WHERE code = ?", (room_code,))
    return cursor.fetchone()


def get_room_members(cursor, room_code: str) -> List[Dict[str, Any]]:
    cursor.execute(
        """
        SELECT * FROM room_members
        WHERE roomCode = ?
        ORDER BY isHost DESC, isActive DESC, joinedAt ASC
        """,
        (room_code,),
    )
    rows = cursor.fetchall()
    return [
        {
            "id": row[0],
            "roomCode": row[1],
            "nickname": row[2],
            "color": row[3],
            "isHost": bool(row[4]),
            "isActive": bool(row[5]),
            "joinedAt": row[6],
            "lastSeenAt": row[7],
        }
        for row in rows
    ]


def get_room_messages(cursor, room_code: str, limit: int = 50) -> List[Dict[str, Any]]:
    cursor.execute(
        """
        SELECT * FROM room_messages
        WHERE roomCode = ?
        ORDER BY createdAt ASC
        LIMIT ?
        """,
        (room_code, limit),
    )
    rows = cursor.fetchall()
    return [
        {
            "id": row[0],
            "roomCode": row[1],
            "memberId": row[2],
            "nickname": row[3],
            "content": row[4],
            "createdAt": row[5],
        }
        for row in rows
    ]


def room_snapshot_from_row(cursor, row) -> Dict[str, Any]:
    playlist = parse_json_field(row[2]) if row[2] else []
    current_index = row[4] if row[4] is not None else -1
    if not playlist:
        current_index = -1
    else:
        current_index = max(0, min(current_index, len(playlist) - 1))

    current_song = playlist[current_index] if current_index >= 0 and current_index < len(playlist) else None
    base_time = float(row[5] or 0)
    updated_at = row[16] or row[15] or utc_now_iso()
    last_action_at = row[17] or updated_at

    duration = row[6] or (current_song.get("duration", 0) if current_song else 0)

    return {
        "code": row[0],
        "name": row[1],
        "playlist": playlist,
        "currentSongId": row[3],
        "currentIndex": current_index,
        "currentTime": round(max(0, base_time), 2),
        "duration": duration,
        "isPlaying": bool(row[7]),
        "repeatMode": row[8] or "none",
        "shuffleMode": bool(row[9]),
        "version": row[10] or 0,
        "createdAt": row[15],
        "updatedAt": row[16],
        "lastActionAt": row[17],
        "serverTime": utc_now_iso(),
        "members": get_room_members(cursor, row[0]),
        "messages": get_room_messages(cursor, row[0]),
    }


def create_room_payload_from_state(room: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "code": room["code"],
        "name": room["name"],
        "playlist": room["playlist"],
        "currentSongId": room["currentSongId"],
        "currentIndex": room["currentIndex"],
        "currentTime": room["currentTime"],
        "duration": room["duration"],
        "isPlaying": room["isPlaying"],
        "repeatMode": room["repeatMode"],
        "shuffleMode": room["shuffleMode"],
        "version": room["version"],
        "createdAt": room["createdAt"],
        "updatedAt": room["updatedAt"],
        "lastActionAt": room["lastActionAt"],
        "serverTime": room["serverTime"],
        "members": room["members"],
        "messages": room["messages"],
    }


def save_room_snapshot(cursor, room: Dict[str, Any], action: str, member_id: Optional[str], nickname: Optional[str]) -> Dict[str, Any]:
    now = utc_now_iso()
    next_version = int(room["version"] or 0) + 1
    playlist_json = json.dumps(room["playlist"] or [])
    cursor.execute(
        """
        UPDATE rooms
        SET playlist = ?, currentSongId = ?, currentIndex = ?, currentTime = ?, duration = ?,
            isPlaying = ?, repeatMode = ?, shuffleMode = ?, version = ?, lastAction = ?,
            lastActionBy = ?, updatedAt = ?, lastActionAt = ?
        WHERE code = ?
        """,
        (
            playlist_json,
            room["currentSongId"],
            room["currentIndex"],
            room["currentTime"],
            room["duration"],
            int(room["isPlaying"]),
            room["repeatMode"],
            int(room["shuffleMode"]),
            next_version,
            action,
            nickname,
            now,
            now,
            room["code"],
        ),
    )
    room["version"] = next_version
    room["updatedAt"] = now
    room["serverTime"] = now
    room["lastActionAt"] = now
    return room


async def broadcast_room_state(room_code: str, payload: Dict[str, Any]):
    connections = room_connections.get(room_code, {})
    dead_members: List[str] = []

    for member_id, websocket in list(connections.items()):
        try:
            await websocket.send_json(payload)
        except Exception:
            dead_members.append(member_id)

    for member_id in dead_members:
        connections.pop(member_id, None)

    if not connections and room_code in room_connections:
        room_connections.pop(room_code, None)


def choose_next_index(room: Dict[str, Any], shuffle: bool = False) -> Optional[int]:
    playlist = room["playlist"]
    if not playlist:
        return None

    current_index = room["currentIndex"] if room["currentIndex"] >= 0 else 0
    repeat_mode = room["repeatMode"]

    if repeat_mode == "one":
        return current_index

    if shuffle:
        if len(playlist) == 1:
            return 0 if repeat_mode == "all" else None

        candidate = current_index
        while candidate == current_index:
            candidate = random.randint(0, len(playlist) - 1)
        return candidate

    next_index = current_index + 1
    if next_index >= len(playlist):
        if repeat_mode == "all":
            return 0
        return None

    return next_index


def choose_previous_index(room: Dict[str, Any], shuffle: bool = False) -> Optional[int]:
    playlist = room["playlist"]
    if not playlist:
        return None

    current_index = room["currentIndex"] if room["currentIndex"] >= 0 else 0
    repeat_mode = room["repeatMode"]

    if repeat_mode == "one":
        return current_index

    if shuffle:
        if len(playlist) == 1:
            return 0

        candidate = current_index
        while candidate == current_index:
            candidate = random.randint(0, len(playlist) - 1)
        return candidate

    prev_index = current_index - 1
    if prev_index < 0:
        return len(playlist) - 1

    return prev_index


async def sync_room_cursor_state(
    room_code: str,
    action: str,
    action_payload: Dict[str, Any],
    member_id: Optional[str],
    nickname: Optional[str],
) -> Dict[str, Any]:
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        room_row = get_room_row(cursor, room_code)
        if not room_row:
            raise HTTPException(status_code=404, detail="Room not found")

        room = room_snapshot_from_row(cursor, room_row)
        room["code"] = room_row[0]
        room["name"] = room_row[1]
        room["playlist"] = parse_json_field(room_row[2]) if room_row[2] else []
        room["currentSongId"] = room_row[3]
        room["currentIndex"] = room_row[4] if room_row[4] is not None else -1
        room["currentTime"] = float(room_row[5] or 0)
        room["duration"] = float(room_row[6] or 0)
        room["isPlaying"] = bool(room_row[7])
        room["repeatMode"] = room_row[8] or "none"
        room["shuffleMode"] = bool(room_row[9])
        room["version"] = room_row[10] or 0
        room["createdAt"] = room_row[15]
        room["updatedAt"] = room_row[16]
        room["lastActionAt"] = room_row[17]

        now = utc_now_iso()
        playlist = room["playlist"]
        current_index = room["currentIndex"]
        current_song = playlist[current_index] if current_index >= 0 and current_index < len(playlist) else None

        if action == "play_pause":
            live_time = room["currentTime"]
            if room["isPlaying"]:
                live_time = room["currentTime"] + max(
                    0,
                    (datetime.utcnow() - parse_room_datetime(room["lastActionAt"] or room["updatedAt"])).total_seconds(),
                )
                room["isPlaying"] = False
                room["currentTime"] = round(live_time, 2)
            else:
                room["isPlaying"] = True
                room["currentTime"] = round(live_time, 2)
            room["duration"] = current_song.get("duration", 0) if current_song else 0
        elif action == "seek":
            room["currentTime"] = round(float(action_payload.get("time", room["currentTime"]) or 0), 2)
            room["isPlaying"] = bool(room_row[7])
        elif action == "toggle_shuffle":
            room["shuffleMode"] = not room["shuffleMode"]
        elif action == "toggle_repeat":
            modes = ["none", "all", "one"]
            current_mode = room["repeatMode"] if room["repeatMode"] in modes else "none"
            room["repeatMode"] = modes[(modes.index(current_mode) + 1) % len(modes)]
        elif action == "next_song":
            next_index = choose_next_index(room, room["shuffleMode"])
            if next_index is None:
                room["isPlaying"] = False
            else:
                room["currentIndex"] = next_index
                room["currentSongId"] = playlist[next_index]["id"]
                room["currentTime"] = 0
                room["duration"] = playlist[next_index].get("duration", 0)
                room["isPlaying"] = True
        elif action == "previous_song":
            prev_index = choose_previous_index(room, room["shuffleMode"])
            if prev_index is not None:
                room["currentIndex"] = prev_index
                room["currentSongId"] = playlist[prev_index]["id"]
                room["currentTime"] = 0
                room["duration"] = playlist[prev_index].get("duration", 0)
                room["isPlaying"] = True
        elif action == "play_song":
            target_index = int(action_payload.get("index", room["currentIndex"] if room["currentIndex"] >= 0 else 0))
            if playlist:
                target_index = max(0, min(target_index, len(playlist) - 1))
                room["currentIndex"] = target_index
                room["currentSongId"] = playlist[target_index]["id"]
                room["currentTime"] = 0
                room["duration"] = playlist[target_index].get("duration", 0)
                room["isPlaying"] = True
        elif action == "replace_playlist":
            new_playlist = action_payload.get("songs", [])
            current_index = int(action_payload.get("currentIndex", 0))
            if not new_playlist:
                room["playlist"] = []
                room["currentIndex"] = -1
                room["currentSongId"] = None
                room["currentTime"] = 0
                room["duration"] = 0
                room["isPlaying"] = False
            else:
                current_index = max(0, min(current_index, len(new_playlist) - 1))
                current_song = new_playlist[current_index]
                room["playlist"] = new_playlist
                room["currentIndex"] = current_index
                room["currentSongId"] = current_song.get("id")
                room["currentTime"] = float(action_payload.get("currentTime", 0) or 0)
                room["duration"] = current_song.get("duration", 0)
                room["isPlaying"] = bool(action_payload.get("isPlaying", room["isPlaying"]))
                room["repeatMode"] = action_payload.get("repeatMode", room["repeatMode"])
                room["shuffleMode"] = bool(action_payload.get("shuffleMode", room["shuffleMode"]))
        elif action == "add_song":
            song = action_payload.get("song")
            if song:
                room["playlist"] = [*playlist, song]
                if room["currentIndex"] < 0:
                    room["currentIndex"] = 0
                    room["currentSongId"] = song.get("id")
                    room["duration"] = song.get("duration", 0)
        elif action == "remove_song":
            song_id = action_payload.get("songId")
            if song_id:
                current_playlist = list(playlist)
                removed_index = next((idx for idx, item in enumerate(current_playlist) if item.get("id") == song_id), -1)
                current_playlist = [item for item in current_playlist if item.get("id") != song_id]
                room["playlist"] = current_playlist
                if not current_playlist:
                    room["currentIndex"] = -1
                    room["currentSongId"] = None
                    room["currentTime"] = 0
                    room["duration"] = 0
                    room["isPlaying"] = False
                elif removed_index >= 0:
                    next_index = min(max(0, removed_index), len(current_playlist) - 1)
                    room["currentIndex"] = next_index
                    room["currentSongId"] = current_playlist[next_index].get("id")
                    room["duration"] = current_playlist[next_index].get("duration", 0)
                    room["currentTime"] = 0
        elif action == "move_song":
            from_index = int(action_payload.get("fromIndex", -1))
            to_index = int(action_payload.get("toIndex", -1))
            if 0 <= from_index < len(playlist) and 0 <= to_index < len(playlist) and from_index != to_index:
                new_playlist = list(playlist)
                moved_song = new_playlist.pop(from_index)
                new_playlist.insert(to_index, moved_song)
                room["playlist"] = new_playlist
                if room["currentIndex"] == from_index:
                    room["currentIndex"] = to_index
                elif from_index < room["currentIndex"] <= to_index:
                    room["currentIndex"] -= 1
                elif to_index <= room["currentIndex"] < from_index:
                    room["currentIndex"] += 1
                if 0 <= room["currentIndex"] < len(new_playlist):
                    room["currentSongId"] = new_playlist[room["currentIndex"]].get("id")
        elif action == "clear_playlist":
            room["playlist"] = []
            room["currentIndex"] = -1
            room["currentSongId"] = None
            room["currentTime"] = 0
            room["duration"] = 0
            room["isPlaying"] = False
        else:
            raise HTTPException(status_code=400, detail="Unsupported room action")

        room["serverTime"] = now
        room["updatedAt"] = now
        save_room_snapshot(cursor, room, action, member_id, nickname)
        cursor.execute(
            "UPDATE room_members SET isActive = 1, lastSeenAt = ? WHERE roomCode = ? AND id = ?",
            (now, room_code, member_id),
        )
        conn.commit()
        snapshot = room_snapshot_from_row(cursor, get_room_row(cursor, room_code))
        return snapshot
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@router.post("/api/rooms")
async def create_room(room: RoomCreateRequest):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        member_id = room.memberId or str(uuid.uuid4())
        nickname = room.nickname or "Guest"
        code = generate_room_code()
        cursor.execute("SELECT code FROM rooms WHERE code = ?", (code,))
        while cursor.fetchone():
            code = generate_room_code()
            cursor.execute("SELECT code FROM rooms WHERE code = ?", (code,))

        playlist = room.playlist or []
        current_index = max(-1, min(room.currentIndex, len(playlist) - 1)) if playlist else -1
        current_song = playlist[current_index] if current_index >= 0 and current_index < len(playlist) else None
        now = utc_now_iso()

        cursor.execute(
            """
            INSERT INTO rooms (
                code, name, playlist, currentSongId, currentIndex, currentTime, duration,
                isPlaying, repeatMode, shuffleMode, version, hostMemberId, hostNickname,
                lastAction, lastActionBy, createdAt, updatedAt, lastActionAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                code,
                room.name or "听歌房间",
                json.dumps(playlist),
                current_song.get("id") if current_song else None,
                current_index,
                room.currentTime,
                current_song.get("duration", 0) if current_song else 0,
                int(room.isPlaying),
                room.repeatMode or "none",
                int(room.shuffleMode),
                0,
                member_id,
                nickname,
                "create_room",
                nickname,
                now,
                now,
                now,
            ),
        )
        upsert_room_member(cursor, code, member_id, nickname, is_host=True, active=True)
        conn.commit()
        snapshot = room_snapshot_from_row(cursor, get_room_row(cursor, code))
        return {"success": True, "data": {"room": snapshot, "memberId": member_id}}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.post("/api/rooms/{room_code}/join")
async def join_room(room_code: str, payload: RoomJoinRequest):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT code FROM rooms WHERE code = ?", (room_code,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Room not found")

        member_id = payload.memberId or str(uuid.uuid4())
        nickname = payload.nickname or "Guest"
        upsert_room_member(cursor, room_code, member_id, nickname, is_host=False, active=True)
        now = utc_now_iso()
        cursor.execute(
            "UPDATE room_members SET isActive = 1, lastSeenAt = ? WHERE roomCode = ? AND id = ?",
            (now, room_code, member_id),
        )
        conn.commit()
        snapshot = room_snapshot_from_row(cursor, get_room_row(cursor, room_code))
        await broadcast_room_state(room_code, {"type": "snapshot", "room": snapshot})
        return {"success": True, "data": {"room": snapshot, "memberId": member_id}}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.get("/api/rooms/{room_code}")
async def get_room(room_code: str):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        row = get_room_row(cursor, room_code)
        if not row:
            raise HTTPException(status_code=404, detail="Room not found")
        snapshot = room_snapshot_from_row(cursor, row)
        return {"success": True, "data": snapshot}
    finally:
        conn.close()


@router.get("/api/rooms/{room_code}/clock")
async def get_room_clock(room_code: str):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        row = get_room_row(cursor, room_code)
        if not row:
            raise HTTPException(status_code=404, detail="Room not found")

        snapshot = room_snapshot_from_row(cursor, row)
        return {
            "success": True,
            "data": {
                "roomCode": snapshot["code"],
                "serverTime": snapshot["serverTime"],
                "updatedAt": snapshot["updatedAt"],
                "lastActionAt": snapshot["lastActionAt"],
                "version": snapshot["version"],
                "currentTime": snapshot["currentTime"],
                "duration": snapshot["duration"],
                "isPlaying": snapshot["isPlaying"],
                "currentIndex": snapshot["currentIndex"],
                "currentSongId": snapshot["currentSongId"],
            },
        }
    finally:
        conn.close()


@router.get("/api/rooms/{room_code}/messages")
async def get_room_messages_endpoint(room_code: str):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT code FROM rooms WHERE code = ?", (room_code,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Room not found")
        messages = get_room_messages(cursor, room_code, 100)
        return {"success": True, "data": messages}
    finally:
        conn.close()


@router.post("/api/rooms/{room_code}/messages")
async def create_room_message(room_code: str, payload: RoomMessageCreateRequest):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        row = get_room_row(cursor, room_code)
        if not row:
            raise HTTPException(status_code=404, detail="Room not found")

        member = upsert_room_member(
            cursor,
            room_code,
            payload.memberId,
            payload.nickname or "Guest",
            is_host=False,
            active=True,
        )
        now = utc_now_iso()
        message_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO room_messages (id, roomCode, memberId, nickname, content, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (message_id, room_code, member["id"], member["nickname"], payload.content.strip(), now),
        )
        cursor.execute(
            "UPDATE room_members SET isActive = 1, lastSeenAt = ? WHERE roomCode = ? AND id = ?",
            (now, room_code, member["id"]),
        )
        conn.commit()

        message = {
            "id": message_id,
            "roomCode": room_code,
            "memberId": member["id"],
            "nickname": member["nickname"],
            "content": payload.content.strip(),
            "createdAt": now,
        }
        snapshot = room_snapshot_from_row(cursor, get_room_row(cursor, room_code))
        await broadcast_room_state(room_code, {"type": "message", "room": snapshot, "message": message})
        return {"success": True, "data": message}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.post("/api/rooms/{room_code}/action")
async def room_action(room_code: str, payload: RoomActionRequest):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        row = get_room_row(cursor, room_code)
        if not row:
            raise HTTPException(status_code=404, detail="Room not found")

        member = upsert_room_member(
            cursor,
            room_code,
            payload.memberId,
            payload.nickname or "Guest",
            is_host=False,
            active=True,
        )

        # Persist the latest member heartbeat
        now = utc_now_iso()
        cursor.execute(
            "UPDATE room_members SET isActive = 1, lastSeenAt = ? WHERE roomCode = ? AND id = ?",
            (now, room_code, member["id"]),
        )
        conn.commit()

        snapshot = await sync_room_cursor_state(
            room_code,
            payload.type,
            payload.payload,
            member["id"],
            member["nickname"],
        )

        await broadcast_room_state(room_code, {"type": "snapshot", "room": snapshot})
        return {"success": True, "data": snapshot}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.post("/api/rooms/{room_code}/leave")
async def leave_room(room_code: str, payload: RoomJoinRequest):
    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        row = get_room_row(cursor, room_code)
        if not row:
            raise HTTPException(status_code=404, detail="Room not found")

        member_id = payload.memberId
        if member_id:
            now = utc_now_iso()
            cursor.execute(
                "UPDATE room_members SET isActive = 0, lastSeenAt = ? WHERE roomCode = ? AND id = ?",
                (now, room_code, member_id),
            )
        conn.commit()
        snapshot = room_snapshot_from_row(cursor, get_room_row(cursor, room_code))
        await broadcast_room_state(room_code, {"type": "snapshot", "room": snapshot})
        return {"success": True, "message": "Left room successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.websocket("/api/rooms/{room_code}/ws")
async def room_websocket(websocket: WebSocket, room_code: str):
    await websocket.accept()
    member_id = websocket.query_params.get("memberId") or str(uuid.uuid4())
    nickname = websocket.query_params.get("nickname") or "Guest"

    conn = sqlite3.connect("music.db")
    cursor = conn.cursor()

    try:
        row = get_room_row(cursor, room_code)
        if not row:
            await websocket.send_json({"type": "error", "message": "Room not found"})
            await websocket.close(code=4404)
            return

        member = upsert_room_member(cursor, room_code, member_id, nickname, is_host=False, active=True)
        now = utc_now_iso()
        cursor.execute(
            "UPDATE room_members SET isActive = 1, lastSeenAt = ? WHERE roomCode = ? AND id = ?",
            (now, room_code, member["id"]),
        )
        conn.commit()

        room_connections.setdefault(room_code, {})[member["id"]] = websocket
        snapshot = room_snapshot_from_row(cursor, get_room_row(cursor, room_code))
        await websocket.send_json({"type": "snapshot", "room": snapshot, "memberId": member["id"]})

        while True:
            message = await websocket.receive_text()
            if message == "ping":
                await websocket.send_json({"type": "pong", "serverTime": utc_now_iso()})
    except WebSocketDisconnect:
        pass
    finally:
        try:
            if room_code in room_connections:
                for active_member_id, socket in list(room_connections[room_code].items()):
                    if socket is websocket:
                        room_connections[room_code].pop(active_member_id, None)
                        now = utc_now_iso()
                        cursor.execute(
                            "UPDATE room_members SET isActive = 0, lastSeenAt = ? WHERE roomCode = ? AND id = ?",
                            (now, room_code, active_member_id),
                        )
                        conn.commit()
                        break

                if not room_connections[room_code]:
                    room_connections.pop(room_code, None)

                snapshot = room_snapshot_from_row(cursor, get_room_row(cursor, room_code))
                await broadcast_room_state(room_code, {"type": "snapshot", "room": snapshot})
        except Exception:
            pass
        conn.close()
