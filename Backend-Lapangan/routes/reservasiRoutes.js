const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Fungsi cek bentrok jadwal (inti dari algoritma-nya)
async function cekBentrokJadwal(lapangan_id, tanggal_main, jam_mulai, jam_selesai, excludeId = null) {
  let query = `
    SELECT * FROM reservasi
    WHERE lapangan_id = ? AND tanggal_main = ?
    AND (jam_mulai < ? AND jam_selesai > ?)
  `;
  const params = [lapangan_id, tanggal_main, jam_selesai, jam_mulai];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);
  return rows.length > 0;
}

// GET reservasi milik user yang login
router.get('/saya', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, l.nama_lapangan, l.jenis 
       FROM reservasi r 
       JOIN lapangan l ON r.lapangan_id = l.id 
       WHERE r.user_id = ? 
       ORDER BY r.tanggal_main DESC, r.jam_mulai DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { lapangan_id, tanggal_main, jam_mulai, jam_selesai, user_id } = req.body;
    const targetUserId = (req.user.role === 'admin' && user_id) ? user_id : req.user.id;

    if (!lapangan_id || !tanggal_main || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }
    if (jam_selesai <= jam_mulai) {
      return res.status(400).json({ error: 'Jam selesai harus lebih besar dari jam mulai' });
    }

    const bentrok = await cekBentrokJadwal(lapangan_id, tanggal_main, jam_mulai, jam_selesai);
    if (bentrok) {
      return res.status(409).json({ error: 'Jadwal bentrok, lapangan sudah dipesan di rentang waktu tersebut' });
    }

    const [lapangan] = await pool.query('SELECT harga_per_jam FROM lapangan WHERE id = ?', [lapangan_id]);
    const durasiJam = (new Date(`2000-01-01T${jam_selesai}`) - new Date(`2000-01-01T${jam_mulai}`)) / (1000 * 60 * 60);
    const total_biaya = lapangan[0].harga_per_jam * durasiJam;

    const [result] = await pool.query(
      'INSERT INTO reservasi (user_id, lapangan_id, tanggal_main, jam_mulai, jam_selesai, total_biaya) VALUES (?, ?, ?, ?, ?, ?)',
      [targetUserId, lapangan_id, tanggal_main, jam_mulai, jam_selesai, total_biaya]
    );

    res.status(201).json({ message: 'Reservasi berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST buat reservasi baru
router.post('/', verifyToken, async (req, res) => {
  try {
    const { lapangan_id, tanggal_main, jam_mulai, jam_selesai } = req.body;

    if (!lapangan_id || !tanggal_main || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    if (jam_selesai <= jam_mulai) {
      return res.status(400).json({ error: 'Jam selesai harus lebih besar dari jam mulai' });
    }

    const bentrok = await cekBentrokJadwal(lapangan_id, tanggal_main, jam_mulai, jam_selesai);
    if (bentrok) {
      return res.status(409).json({ error: 'Jadwal bentrok, lapangan sudah dipesan di rentang waktu tersebut' });
    }

    const [lapangan] = await pool.query('SELECT harga_per_jam FROM lapangan WHERE id = ?', [lapangan_id]);
    const durasiJam = (new Date(`2000-01-01T${jam_selesai}`) - new Date(`2000-01-01T${jam_mulai}`)) / (1000 * 60 * 60);
    const total_biaya = lapangan[0].harga_per_jam * durasiJam;

    const [result] = await pool.query(
      'INSERT INTO reservasi (user_id, lapangan_id, tanggal_main, jam_mulai, jam_selesai, total_biaya) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, lapangan_id, tanggal_main, jam_mulai, jam_selesai, total_biaya]
    );

    res.status(201).json({ message: 'Reservasi berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE reservasi
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM reservasi WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan' });
    }

    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Anda tidak punya akses ke reservasi ini' });
    }

    await pool.query('DELETE FROM reservasi WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reservasi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — GET semua reservasi
router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, l.nama_lapangan, l.jenis, u.nama_lengkap 
       FROM reservasi r 
       JOIN lapangan l ON r.lapangan_id = l.id 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.tanggal_main DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — GET laporan penggunaan lapangan
router.get('/laporan', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.nama_lapangan, l.jenis, 
              COUNT(r.id) AS jumlah_reservasi, 
              COALESCE(SUM(r.total_biaya), 0) AS total_pendapatan
       FROM lapangan l
       LEFT JOIN reservasi r ON l.id = r.lapangan_id
       GROUP BY l.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;