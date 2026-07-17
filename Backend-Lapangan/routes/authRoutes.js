const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { nama_lengkap, email, no_hp, password } = req.body;

    if (!nama_lengkap || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (nama_lengkap, email, no_hp, password, role) VALUES (?, ?, ?, ?, ?)',
      [nama_lengkap, email, no_hp, hashedPassword, 'pelanggan']
    );

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nama_lengkap: user.nama_lengkap },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, nama_lengkap: user.nama_lengkap, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;