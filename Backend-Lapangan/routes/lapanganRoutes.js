const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// GET semua lapangan
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM lapangan WHERE status = "Aktif"');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pelanggan', verifyToken, verifyAdmin, async (req, res) => {
  const [rows] = await pool.query("SELECT id, nama_lengkap FROM users WHERE role = 'pelanggan'");
  res.json(rows);
});

// GET ketersediaan lapangan per tanggal (buat grid jadwal)
router.get('/ketersediaan', verifyToken, async (req, res) => {
  try {
    const { tanggal } = req.query; 

    if (!tanggal) {
      return res.status(400).json({ error: 'Parameter tanggal wajib diisi' });
    }

    const [lapangan] = await pool.query('SELECT * FROM lapangan WHERE status = "Aktif"');
    const [reservasiHariItu] = await pool.query(
      'SELECT lapangan_id, jam_mulai, jam_selesai FROM reservasi WHERE tanggal_main = ?',
      [tanggal]
    );

    res.json({ lapangan, reservasi: reservasiHariItu });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;