const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan, silakan login' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa' });
    }
    req.user = decoded; // { id, role, nama_lengkap } nempel di req, bisa dipake endpoint berikutnya
    next();
  });
}

function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak, hanya untuk admin' });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin };