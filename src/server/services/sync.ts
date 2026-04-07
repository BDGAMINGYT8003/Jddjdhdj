import fs from 'fs/promises';
import path from 'path';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getDb } from './db.js';
import { IMAGES_DIR } from '../utils/fileHandler.js';

export async function syncImages() {
  console.log('Starting image synchronization...');
  const db = getDb();
  const imagesRef = collection(db, 'cosplay_images');
  
  try {
    // 1. Scan local directory
    const files = await fs.readdir(IMAGES_DIR);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const localImages = files.filter(file => validExtensions.includes(path.extname(file).toLowerCase()));
    
    console.log(`Found ${localImages.length} images locally.`);

    // 2. Fetch existing entries from Firebase
    const snapshot = await getDocs(imagesRef);
    const dbImages = new Map<string, any>();
    
    snapshot.forEach(docSnap => {
      dbImages.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    });

    console.log(`Found ${dbImages.size} images in database.`);

    // 3. Compare and Sync
    const localImageSet = new Set(localImages);

    // Add or update missing/changed files
    for (const filename of localImages) {
      // Create a predictable ID based on filename (removing extension and special chars)
      const imageId = filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const url = `/Images/cosplay/${filename}`;
      
      const existingEntry = dbImages.get(imageId);
      
      if (!existingEntry || existingEntry.filename !== filename || existingEntry.url !== url) {
        console.log(`Registering new/updated image: ${filename}`);
        const docRef = doc(db, 'cosplay_images', imageId);
        await setDoc(docRef, {
          url,
          filename,
          uploadedAt: new Date().toISOString(),
          tags: ['cosplay', 'auto-synced']
        });
      }
    }

    // 4. Remove DB entries for deleted files
    for (const [id, dbImage] of dbImages.entries()) {
      if (!localImageSet.has(dbImage.filename)) {
        console.log(`Removing database entry for deleted file: ${dbImage.filename}`);
        const docRef = doc(db, 'cosplay_images', id);
        await deleteDoc(docRef);
      }
    }

    console.log('Image synchronization completed.');
  } catch (error) {
    console.error('Error during image synchronization:', error);
  }
}
