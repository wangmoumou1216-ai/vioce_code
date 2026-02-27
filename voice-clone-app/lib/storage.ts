import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Save uploaded reference audio file
 * Returns the file path (relative to public/) for DB storage
 */
export async function saveUploadedAudio(buffer: Buffer, originalName: string): Promise<string> {
  ensureDir(UPLOADS_DIR);
  const ext = path.extname(originalName) || '.mp3';
  const filename = `${uuidv4()}${ext}`;
  const fullPath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
  return path.join('uploads', filename);
}

/**
 * Save generated TTS audio
 * Returns the file path (relative to public/) for DB storage
 */
export async function saveGeneratedAudio(buffer: Buffer): Promise<string> {
  ensureDir(GENERATED_DIR);
  const filename = `${uuidv4()}.mp3`;
  const fullPath = path.join(GENERATED_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
  return path.join('generated', filename);
}

/**
 * Delete a stored file (path relative to public/)
 */
export function deleteStoredFile(relativePath: string): void {
  const fullPath = path.join(process.cwd(), 'public', relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/**
 * Read file as Buffer
 */
export function readFile(relativePath: string): Buffer {
  const fullPath = path.join(process.cwd(), 'public', relativePath);
  return fs.readFileSync(fullPath);
}
