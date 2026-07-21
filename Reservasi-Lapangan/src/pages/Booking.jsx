import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const JAM_OPERASIONAL = Array.from({ length: 17 }, (_, i) => {
  const jam = 6 + i; // mulai jam 06:00 sampai 22:00
  return `${String(jam).padStart(2, '0')}:00`;
});

export default function Booking() {
  const [lapanganList, setLapanganList] = useState([]);
  const [selectedLapangan, setSelectedLapangan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [reservasiHariItu, setReservasiHariItu] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [pelangganList, setPelangganList] = useState([]);
  const [selectedPelanggan, setSelectedPelanggan] = useState('');

useEffect(() => {
  if (user.role === 'admin') {
    api.get('/lapangan/pelanggan').then((res) => setPelangganList(res.data));
  }
}, []);

  // Ambil daftar lapangan sekali di awal
  useEffect(() => {
    api.get('/lapangan').then((res) => setLapanganList(res.data));
  }, []);

  // Ambil ulang ketersediaan tiap kali tanggal berubah
  useEffect(() => {
    if (!tanggal) return;
    api.get(`/lapangan/ketersediaan?tanggal=${tanggal}`).then((res) => {
      setReservasiHariItu(res.data.reservasi);
    });
  }, [tanggal]);

  // Cek apakah 1 jam tertentu udah kepakai di lapangan yang dipilih
  function isJamTerisi(jam) {
    if (!selectedLapangan) return false;

    return reservasiHariItu.some((r) => {
      if (r.lapangan_id !== Number(selectedLapangan)) return false;
      return jam >= r.jam_mulai.slice(0, 5) && jam < r.jam_selesai.slice(0, 5);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    

    try {
      await api.post('/reservasi', {
        lapangan_id: selectedLapangan,
        tanggal_main: tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        user_id: user.role === 'admin' ? selectedPelanggan : undefined
      });
      setSuccess('Reservasi berhasil disimpan!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan, coba lagi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Buat Reservasi</h1>



        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
          {/* PILIH LAPANGAN */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Lapangan</label>
            <select
              value={selectedLapangan}
              onChange={(e) => setSelectedLapangan(e.target.value)}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500"
              required
            >
              <option value="">-- Pilih Lapangan --</option>
              {lapanganList.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama_lapangan} - Rp{l.harga_per_jam.toLocaleString()}/jam
                </option>
              ))}
            </select>
          </div>

          {/* TANGGAL */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Tanggal Main</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500"
              required
            />
          </div>

          {/* GRID KETERSEDIAAN */}
          {selectedLapangan && tanggal && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Jam Tersedia (merah = sudah terisi)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {JAM_OPERASIONAL.map((jam) => (
                  <div
                    key={jam}
                    className={`text-xs text-center py-2 rounded-lg font-semibold ${
                      isJamTerisi(jam) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {jam}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JAM MULAI & SELESAI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Jam Mulai</label>
              <select
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500"
                required
              >
                <option value="">-- Pilih --</option>
                {JAM_OPERASIONAL.map((jam) => (
                  <option key={jam} value={jam}>{jam}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Jam Selesai</label>
              <select
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500"
                required
              >
                <option value="">-- Pilih --</option>
                {JAM_OPERASIONAL.map((jam) => (
                  <option key={jam} value={jam}>{jam}</option>
                ))}
              </select>
            </div>
          </div>

      {user.role === 'admin' && (
        <div>
          <label className="text-sm font-semibold text-gray-700">Pelanggan</label>
          <select value={selectedPelanggan} onChange={(e) => setSelectedPelanggan(e.target.value)}
            className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500" required>
          <option value="">-- Pilih Pelanggan --</option>
            {pelangganList.map((p) => <option key={p.id} value={p.id}>{p.nama_lengkap}</option>)}
          </select>
        </div>
)}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 h-11 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-11 rounded-xl bg-gray-900 text-white font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Reservasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}