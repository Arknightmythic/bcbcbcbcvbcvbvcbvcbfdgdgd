import { useState } from "react";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const handleLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000); 
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className={`
          absolute inset-0 flex items-center justify-center bg-white z-10 
          transition-opacity duration-500 ease-in-out
          ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <p className="text-gray-400 text-center px-6 py-4">Loading...</p>
      </div>

      <iframe
        src={`${import.meta.env.VITE_IFRAME_GRAPHANA_URL}?&theme=light`}
        title="Dashboard"
        onLoad={handleLoad}
        className="w-full h-full border-0 zoomed-iframe"
      ></iframe>
    </div>
  );
}

export default Dashboard;