import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [reservasiList, setReservasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllReservasi();
  }, []);

  async function fetchAllReservasi() {
    try {
      const res = await api.get('/reservasi/all');
      setReservasiList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin mau hapus reservasi ini?')) return;

    try {
      await api.delete(`/reservasi/${id}`);
      setReservasiList(reservasiList.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus reservasi');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
          <button
            onClick={() => navigate('/admin/laporan')}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold hover:opacity-90 transition cursor-pointer"
          >
            Lihat Laporan
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Memuat...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Lapangan</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jam</th>
                  <th className="p-3">Biaya</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reservasiList.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.nama_lapangan} ({r.jenis})</td>
                    <td className="p-3">{r.nama_lengkap}</td>
                    <td className="p-3">{new Date(r.tanggal_main).toLocaleDateString('id-ID')}</td>
                    <td className="p-3">{r.jam_mulai.slice(0,5)} - {r.jam_selesai.slice(0,5)}</td>
                    <td className="p-3">Rp {r.total_biaya.toLocaleString()}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}