import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Masuk ke Sport Center</h1>
        <p className="text-gray-500 text-sm mb-6">Harap Login Terlebih Dahulu</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 mt-1 px-4 border border-gray-300 rounded-xl outline-none focus:border-gray-500"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-gray-900 text-white font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Belum punya akun?{' '}
          <Link to="/register" className="text-gray-900 font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}