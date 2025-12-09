import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/authRoute.js';
import kycRouter from './routes/kycRoutes.js';
import userRouter from './routes/userRoutes.js';
import supportRouter from './routes/supportRoutes.js';
import path from 'path';
import fs from 'fs';
import { handleInvalidRoute } from './middlewares/invalidRoute.js';


const app = express();
app.use(express.json());
app.use(cors());
// Configure Helmet with CSP that allows document viewing
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:4000"],
      frameSrc: ["'self'", "blob:", "http://localhost:4000", "http://localhost:*"],
      frameAncestors: ["'self'", "http://localhost:*"], // Allow embedding from localhost
      objectSrc: ["'self'", "http://localhost:4000"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Allow iframe embedding for document viewing
  frameguard: { action: 'sameorigin' },
}));
app.use(morgan('dev'));

app.get('/',(req,res,next)=>{
    res.status(200).send('<h1>Server is Running....</h1>')
})

// Serve static files from uploads directory
const uploadsPath = path.join(process.cwd(), 'src/public/uploads');
console.log('📁 Static files serving from:', uploadsPath);
console.log('📁 KYC files should be at:', path.join(uploadsPath, 'kyc'));

// Dedicated endpoint to serve KYC documents with proper headers
app.get('/api/documents/kyc/:filename', (req, res) => {
  const filename = req.params.filename;
  // Use absolute path for sendFile
  const filePath = path.resolve(uploadsPath, 'kyc', filename);
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    return res.status(404).json({ 
      success: false,
      error: 'File not found', 
      path: filePath 
    });
  }

  // Set proper headers for document serving
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Allow iframe embedding for document viewing - override Helmet's X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Set permissive CSP for document endpoint to allow iframe embedding
  // frame-ancestors allows this document to be embedded in iframes from same origin
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:* http://127.0.0.1:*;");
  
  // Set Content-Type based on file extension
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  
  console.log('📄 Serving document:', { filename, filePath, contentType });
  
  // Use absolute path for sendFile
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('❌ File send error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          error: 'Error sending file', 
          message: err.message 
        });
      }
    }
  });
});

// Test endpoint to verify file serving
app.get('/test-upload/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, 'kyc', filename);
  console.log('🔍 Testing file access:', { filename, filePath });
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('❌ File send error:', err.message);
        res.status(500).json({ error: 'Error sending file', message: err.message });
      }
    });
  } else {
    console.error('❌ File not found:', filePath);
    res.status(404).json({ error: 'File not found', path: filePath });
  }
});

// Handle OPTIONS requests for CORS - must come before static file serving
app.use('/uploads', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.sendStatus(200);
  }
  next();
});

// Serve static files - mount before API routes to avoid conflicts
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Allow CORS for document access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Set proper Content-Type headers based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    
    // Log file access for debugging
    console.log('📄 Serving file:', filePath, 'Content-Type:', mimeTypes[ext] || 'application/octet-stream');
  }
}));

app.use('/api/auth', authRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/user', userRouter);
app.use('/api/support', supportRouter);

app.use(handleInvalidRoute);
export default app;