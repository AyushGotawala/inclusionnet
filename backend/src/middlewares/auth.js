import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  // 1️⃣ Get Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  // 2️⃣ Extract token
  const token = authHeader.split(' ')[1];

  try {
    // 3️⃣ Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not set in environment');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const decoded = jwt.verify(token, secret);

    // 4️⃣ Attach user info
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    // 5️⃣ Pass to next middleware
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
