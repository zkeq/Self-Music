from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import sqlite3
import json
import os
import mimetypes
import uuid
from datetime import datetime

router = APIRouter()

# Helper functions
def parse_json_field(field_value: str) -> List[str]:
    if not field_value:
        return []
    try:
        return json.loads(field_value)
    except:
        return []

def get_artist_by_id(cursor, artist_id: str) -> Optional[Dict]:
    cursor.execute('SELECT * FROM artists WHERE id=?', (artist_id,))
    row = cursor.fetchone()
    if not row:
        return None
    return {
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
        "coverUrl": row[3],
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
            "coverUrl": row[5],
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
    cursor.execute('SELECT * FROM artists ORDER BY createdAt DESC LIMIT ? OFFSET ?', (limit, offset))
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
            "coverUrl": row[6],
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
            "coverUrl": row[6],
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
async def get_songs(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM songs')
    total = cursor.fetchone()[0]
    
    # Get paginated results
    offset = (page - 1) * limit
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        ORDER BY s.createdAt DESC LIMIT ? OFFSET ?
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
            "coverUrl": row[6],
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
        "coverUrl": row[6],
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
            "coverUrl": row[6],
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
    
    # Get paginated results
    offset = (page - 1) * limit
    cursor.execute('SELECT * FROM playlists WHERE isPublic = 1 ORDER BY createdAt DESC LIMIT ? OFFSET ?', (limit, offset))
    rows = cursor.fetchall()
    
    playlists = []
    for row in rows:
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
                    "coverUrl": song_row[6],
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
            "coverUrl": row[3],
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
                "coverUrl": song_row[6],
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
        "coverUrl": row[3],
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

# Playlist request models
class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    coverUrl: Optional[str] = None
    isPublic: bool = True

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    coverUrl: Optional[str] = None
    isPublic: Optional[bool] = None

class SongToPlaylist(BaseModel):
    songId: str

@router.post("/api/playlists")
async def create_playlist(playlist: PlaylistCreate):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    playlist_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO playlists (id, name, description, coverUrl, songIds, songCount, playCount, duration, creator, isPublic, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        playlist_id, playlist.name, playlist.description, playlist.coverUrl,
        json.dumps([]), 0, 0, 0, "user", playlist.isPublic, now, now
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "data": {
            "id": playlist_id,
            "name": playlist.name,
            "description": playlist.description,
            "coverUrl": playlist.coverUrl,
            "songIds": [],
            "songs": [],
            "songCount": 0,
            "playCount": 0,
            "duration": 0,
            "creator": "user",
            "isPublic": playlist.isPublic,
            "createdAt": now,
            "updatedAt": now
        }
    }

@router.put("/api/playlists/{playlist_id}")
async def update_playlist(playlist_id: str, playlist: PlaylistUpdate):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Check if playlist exists
    cursor.execute('SELECT * FROM playlists WHERE id = ?', (playlist_id,))
    existing = cursor.fetchone()
    
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if playlist.name is not None:
        update_fields.append("name=?")
        update_values.append(playlist.name)
    if playlist.description is not None:
        update_fields.append("description=?")
        update_values.append(playlist.description)
    if playlist.coverUrl is not None:
        update_fields.append("coverUrl=?")
        update_values.append(playlist.coverUrl)
    if playlist.isPublic is not None:
        update_fields.append("isPublic=?")
        update_values.append(playlist.isPublic)
    
    update_fields.append("updatedAt=?")
    update_values.append(datetime.now().isoformat())
    update_values.append(playlist_id)
    
    query = f"UPDATE playlists SET {', '.join(update_fields)} WHERE id=?"
    cursor.execute(query, update_values)
    
    conn.commit()
    
    # Get updated playlist
    cursor.execute('SELECT * FROM playlists WHERE id = ?', (playlist_id,))
    row = cursor.fetchone()
    conn.close()
    
    playlist_data = {
        "id": row[0],
        "name": row[1],
        "description": row[2],
        "coverUrl": row[3],
        "songIds": parse_json_field(row[4]),
        "songs": [],  # Not loaded for update response
        "songCount": row[5],
        "playCount": row[6],
        "duration": row[7],
        "creator": row[8],
        "isPublic": bool(row[9]),
        "createdAt": row[10],
        "updatedAt": row[11]
    }
    
    return playlist_data

@router.delete("/api/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM playlists WHERE id=?', (playlist_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    conn.commit()
    conn.close()
    
    return {"success": True}

@router.post("/api/playlists/{playlist_id}/songs")
async def add_song_to_playlist(playlist_id: str, song_data: SongToPlaylist):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Check if playlist exists
    cursor.execute('SELECT songIds, songCount, duration FROM playlists WHERE id = ?', (playlist_id,))
    playlist_row = cursor.fetchone()
    
    if not playlist_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Check if song exists
    cursor.execute('SELECT duration FROM songs WHERE id = ?', (song_data.songId,))
    song_row = cursor.fetchone()
    
    if not song_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found")
    
    song_ids = parse_json_field(playlist_row[0])
    song_ids.append(song_data.songId)
    new_song_count = len(song_ids)
    new_duration = playlist_row[2] + song_row[0]
    
    cursor.execute('''
        UPDATE playlists SET songIds=?, songCount=?, duration=?, updatedAt=?
        WHERE id=?
    ''', (
        json.dumps(song_ids), new_song_count, new_duration,
        datetime.now().isoformat(), playlist_id
    ))
    
    conn.commit()
    conn.close()
    
    return {"success": True}

@router.delete("/api/playlists/{playlist_id}/songs/{song_id}")
async def remove_song_from_playlist(playlist_id: str, song_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Check if playlist exists
    cursor.execute('SELECT songIds, songCount, duration FROM playlists WHERE id = ?', (playlist_id,))
    playlist_row = cursor.fetchone()
    
    if not playlist_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Check if song exists
    cursor.execute('SELECT duration FROM songs WHERE id = ?', (song_id,))
    song_row = cursor.fetchone()
    
    song_ids = parse_json_field(playlist_row[0])
    
    if song_id not in song_ids:
        conn.close()
        raise HTTPException(status_code=404, detail="Song not found in playlist")
    
    song_ids.remove(song_id)
    new_song_count = len(song_ids)
    new_duration = max(0, playlist_row[2] - (song_row[0] if song_row else 0))
    
    cursor.execute('''
        UPDATE playlists SET songIds=?, songCount=?, duration=?, updatedAt=?
        WHERE id=?
    ''', (
        json.dumps(song_ids), new_song_count, new_duration,
        datetime.now().isoformat(), playlist_id
    ))
    
    conn.commit()
    conn.close()
    
    return {"success": True}

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
            "coverUrl": row[5],
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
async def get_mood_songs(mood_id: str):
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Verify mood exists
    cursor.execute('SELECT id FROM moods WHERE id=?', (mood_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Mood not found")
    
    cursor.execute('''
        SELECT s.*, ar.name as artist_name, al.title as album_title 
        FROM songs s 
        JOIN artists ar ON s.artistId = ar.id 
        LEFT JOIN albums al ON s.albumId = al.id 
        WHERE s.moodIds LIKE ?
        ORDER BY s.createdAt ASC
    ''', (f'%{mood_id}%',))
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
                "coverUrl": row[6],
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
            "coverUrl": row[6],
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
            "coverUrl": row[3],
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
            "coverUrl": row[6],
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
            "coverUrl": row[6],
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
            "coverUrl": row[6],
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
            "coverUrl": row[6],
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