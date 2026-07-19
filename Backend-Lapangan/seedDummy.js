// Cara pakai: taro file ini di folder backend/, lalu jalankan:
//   node seedDummy.js 3000
// Angka 3000 itu jumlah baris dummy yang mau dibikin (boleh diganti).

const pool = require('./config/db');

const JUMLAH = Number(process.argv[2]) || 3000;

function randomTanggal() {
  // sebar dari 180 hari lalu sampai 180 hari ke depan, biar gak numpuk di 1 tanggal
  const offsetHari = Math.floor(Math.random() * 360) - 180;
  const d = new Date();
  d.setDate(d.getDate() + offsetHari);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function randomJam() {
  const jamMulai = 6 + Math.floor(Math.random() * 15); // jam 06:00 - 20:00
  const durasi = 1 + Math.floor(Math.random() * 2); // durasi 1-2 jam
  const jamSelesai = Math.min(jamMulai + durasi, 22);
  return {
    mulai: `${String(jamMulai).padStart(2, '0')}:00:00`,
    selesai: `${String(jamSelesai).padStart(2, '0')}:00:00`,
    durasi: jamSelesai - jamMulai,
  };
}

async function main() {
  // 1. Pastikan ada 1 user dummy khusus buat load test (biar gak nyampur sama data akun asli)
  const [existingDummy] = await pool.query(
    "SELECT id FROM users WHERE email = 'dummy.loadtest@sportcenter.com'"
  );

  let dummyUserId;
  if (existingDummy.length > 0) {
    dummyUserId = existingDummy[0].id;
    console.log(`Pakai user dummy yang sudah ada, id=${dummyUserId}`);
  } else {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('dummy12345', 10);
    const [result] = await pool.query(
      "INSERT INTO users (nama_lengkap, email, no_hp, password, role) VALUES (?, ?, ?, ?, ?)",
      ['Dummy LoadTest', 'dummy.loadtest@sportcenter.com', '000', hashed, 'pelanggan']
    );
    dummyUserId = result.insertId;
    console.log(`User dummy baru dibuat, id=${dummyUserId}`);
  }

  // 2. Ambil daftar id lapangan yang ada
  const [lapanganRows] = await pool.query('SELECT id, harga_per_jam FROM lapangan');
  if (lapanganRows.length === 0) {
    console.error('Tabel lapangan kosong, isi dulu data lapangan sebelum generate dummy reservasi.');
    process.exit(1);
  }

  // 3. Generate & insert secara batch (500 baris per batch, biar query gak kepanjangan)
  const BATCH_SIZE = 500;
  let totalInserted = 0;

  for (let start = 0; start < JUMLAH; start += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, JUMLAH - start);
    const values = [];
    const placeholders = [];

    for (let i = 0; i < batchCount; i++) {
      const lapangan = lapanganRows[Math.floor(Math.random() * lapanganRows.length)];
      const tanggal = randomTanggal();
      const { mulai, selesai, durasi } = randomJam();
      const total_biaya = lapangan.harga_per_jam * durasi;

      placeholders.push('(?, ?, ?, ?, ?, ?)');
      values.push(dummyUserId, lapangan.id, tanggal, mulai, selesai, total_biaya);
    }

    const sql = `INSERT INTO reservasi (user_id, lapangan_id, tanggal_main, jam_mulai, jam_selesai, total_biaya) VALUES ${placeholders.join(', ')}`;
    await pool.query(sql, values);

    totalInserted += batchCount;
    console.log(`Progress: ${totalInserted}/${JUMLAH}`);
  }

  console.log(`Selesai. ${totalInserted} baris data dummy berhasil dibuat.`);
  console.log('Catatan: data ini SENGAJA tidak dicek bentrok jadwal (insert langsung ke DB),');
  console.log('karena tujuannya cuma buat ngetes volume data untuk profiling, bukan simulasi transaksi asli.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Gagal generate dummy data:', err);
  process.exit(1);
});