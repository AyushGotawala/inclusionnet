import path from 'path';
import multer from 'multer';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'src/public/uploads/profile-pictures');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadProfilePicture = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowed.test(file.mimetype);
    
    if (ext && mimeType) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, .png, or .webp image files are allowed'));
  },
});
