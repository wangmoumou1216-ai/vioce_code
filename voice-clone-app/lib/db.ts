import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS voices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      audio_path TEXT,
      transcript TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      voice_id TEXT,
      voice_name TEXT,
      text TEXT NOT NULL,
      audio_path TEXT,
      model TEXT DEFAULT 's1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export interface Voice {
  id: string;
  name: string;
  audio_path: string | null;
  transcript: string | null;
  created_at: string;
}

export interface Generation {
  id: string;
  voice_id: string | null;
  voice_name: string | null;
  text: string;
  audio_path: string | null;
  model: string;
  created_at: string;
}

// Voices CRUD
export function listVoices(): Voice[] {
  const db = getDb();
  return db.prepare('SELECT * FROM voices ORDER BY created_at DESC').all() as Voice[];
}

export function getVoice(id: string): Voice | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM voices WHERE id = ?').get(id) as Voice | undefined;
}

export function createVoice(data: { name: string; audio_path: string; transcript?: string }): Voice {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO voices (id, name, audio_path, transcript) VALUES (?, ?, ?, ?)').run(
    id, data.name, data.audio_path, data.transcript ?? null
  );
  return getVoice(id)!;
}

export function deleteVoice(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM voices WHERE id = ?').run(id);
}

// Generations CRUD
export function listGenerations(): Generation[] {
  const db = getDb();
  return db.prepare('SELECT * FROM generations ORDER BY created_at DESC LIMIT 50').all() as Generation[];
}

export function createGeneration(data: {
  voice_id?: string;
  voice_name?: string;
  text: string;
  audio_path: string;
  model: string;
}): Generation {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO generations (id, voice_id, voice_name, text, audio_path, model) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, data.voice_id ?? null, data.voice_name ?? null, data.text, data.audio_path, data.model);
  return db.prepare('SELECT * FROM generations WHERE id = ?').get(id) as Generation;
}

// Settings
export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}
