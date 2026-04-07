import fs from 'fs/promises';
import path from 'path';

export const IMAGES_DIR = path.resolve(process.cwd(), 'Images/cosplay');

export async function ensureImagesDirectory() {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log(`Ensured images directory exists at: ${IMAGES_DIR}`);
  } catch (e) {
    console.error('Error creating images directory', e);
  }
}
