import dotenv from 'dotenv';
import app from './src/app.js';
import pool from './src/config/db.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});