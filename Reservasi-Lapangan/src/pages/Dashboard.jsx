import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReservasiCard from '../components/ReservasiCard';
import api from '../api/axios';

export default function Dashboard() {
  const [reservasiList, setReservasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservasi();
  }, []);

  async function fetchReservasi() {
    try {
      const res = await api.get('/reservasi/saya');
      setReservasiList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin mau batalkan reservasi ini?')) return;

    try {
      await api.delete(`/reservasi/${id}`);
      setReservasiList(reservasiList.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal membatalkan reservasi');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Reservasi</h1>
          <button
            onClick={() => navigate('/booking')}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold hover:opacity-90 transition cursor-pointer"
          >
            + Buat Reservasi
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Memuat...</p>
        ) : reservasiList.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500">
            Belum ada reservasi. Yuk booking lapangan sekarang!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reservasiList.map((r) => (
              <ReservasiCard key={r.id} reservasi={r} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}