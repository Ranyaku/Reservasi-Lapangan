export default function ReservasiCard({ reservasi, onDelete }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
      <div>
        <p className="font-bold">{reservasi.nama_lapangan} ({reservasi.jenis})</p>
        <p className="text-sm text-gray-500">
          {new Date(reservasi.tanggal_main).toLocaleDateString('id-ID')} • {reservasi.jam_mulai.slice(0,5)} - {reservasi.jam_selesai.slice(0,5)}
        </p>
        <p className="text-sm font-semibold text-gray-700">Rp {reservasi.total_biaya.toLocaleString()}</p>
      </div>
      <button
        onClick={() => onDelete(reservasi.id)}
        className="text-red-500 text-sm font-bold hover:underline cursor-pointer"
      >
        Batalkan
      </button>
    </div>
  );
}