import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

export default function LaporanPenggunaan() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/reservasi/laporan').then((res) => {
      setLaporan(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Laporan Penggunaan Lapangan</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 transition cursor-pointer"
          >
            Kembali
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
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Jumlah Reservasi</th>
                  <th className="p-3">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {laporan.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-semibold">{l.nama_lapangan}</td>
                    <td className="p-3">{l.jenis}</td>
                    <td className="p-3">{l.jumlah_reservasi}</td>
                    <td className="p-3">Rp {Number(l.total_pendapatan).toLocaleString()}</td>
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