
import { Home, AlertTriangle } from "lucide-react"; 

export const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4 text-center">
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-yellow-100 rounded-full"> 
          <AlertTriangle className="w-12 h-12 text-yellow-600" />
        </div>
      </div>

      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan (404)</h1>
      <p className="text-gray-600 mb-6">
        Halaman yang Anda cari tidak ada atau Anda tidak memiliki izin akses.
      </p>

      <a
        href="/"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        Kembali ke Beranda
      </a>
    </div>
  </div>
);