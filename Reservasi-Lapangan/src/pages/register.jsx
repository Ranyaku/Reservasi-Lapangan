import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ nama_lengkap: '', email: '', no_hp: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Daftar Akun Pelanggan</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
            <input name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500" required />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">No. HP</label>
            <input name="no_hp" value={form.no_hp} onChange={handleChange}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500" required />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500" required />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500" required />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="h-11 rounded-xl bg-gray-900 text-white font-bold hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-gray-900 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}