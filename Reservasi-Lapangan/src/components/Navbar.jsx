import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <nav className="w-full h-16 bg-gray-900 flex items-center justify-between px-6">
      <h1 className="text-white font-bold text-lg">SM Sport Center</h1>
      <div className="flex items-center gap-4">
        <span className="text-white text-sm">Halo, {user.nama_lengkap}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded-md text-red-400 text-sm font-bold hover:bg-white hover:text-black transition cursor-pointer"
        >
          Keluar
        </button>
      </div>
    </nav>
  );
}

