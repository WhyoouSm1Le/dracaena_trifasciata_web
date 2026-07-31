import { useEffect, useState } from "react";

import apiService from "../services/apiService"; 
import { fetchWeather } from "../services/weather";

import Header from "../components/Header";
import SensorCard from "../components/SensorCard";
import WeatherCard from "../components/WeatherCard";
import SensorChart from "../components/SensorChart";

import dracanea from "../assets/dracanea.jpg";

export default function Dashboard() {
  const [suhu, setSuhu] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [soil, setSoil] = useState(0);
  const [weather, setWeather] = useState(null);

  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [soilData, setSoilData] = useState([]);

  // STATE KONTROL & LOCK SYSTEM
  const [pompaNyala, setPompaNyala] = useState(false);
  const [kipasNyala, setKipasNyala] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  // Fungsi untuk hitung & mapping data dari ThingSpeak ke format Chart lu
  const fetchThingSpeakData = async () => {
    // JIKA LAGI NYALAIN/MATIIN TOMBOL, JANGAN AMBIL DATA DULU BIAR GAK TABRAKAN
    if (isWriting) return; 

    try {
      const data = await apiService.getFeeds(20);
      
      if (data && data.feeds && data.feeds.length > 0) {
        const latestFeed = data.feeds[data.feeds.length - 1];
        
        // 1. Sinkronisasi data sensor numerik (Field 1 - 3)
        setSuhu(Number(latestFeed.field1) || 0);
        setHumidity(Number(latestFeed.field2) || 0);
        setSoil(Number(latestFeed.field3) || 0);

        // 2. FIX SINKRONISASI AWAL: Konversi ke Number dulu biar ga sensitif string/spasi
        // Berdasarkan hardware lu: field4 = KIPAS, field5 = POMPA
        const isKipasActive = Number(latestFeed.field4) === 1;
        const isPompaActive = Number(latestFeed.field5) === 1;

        setKipasNyala(isKipasActive);
        setPompaNyala(isPompaActive);

        // 3. Mapping semua 20 data feed ke format array chart lu ({ time, value })
        const mappedTemp = data.feeds.map(feed => ({
          time: new Date(feed.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: Number(feed.field1) || 0
        }));

        const mappedHum = data.feeds.map(feed => ({
          time: new Date(feed.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: Number(feed.field2) || 0
        }));

        const mappedSoil = data.feeds.map(feed => ({
          time: new Date(feed.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: Number(feed.field3) || 0
        }));

        setTempData(mappedTemp);
        setHumData(mappedHum);
        setSoilData(mappedSoil);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data ThingSpeak:", error);
    }
  };

  // FUNGSI AKSI: Kontrol Saklar Pompa (Optimistic Update) -> Menembak Field 5
  const handleTogglePompa = async () => {
    if (loadingAction) return;
    try {
      setLoadingAction(true);
      setIsWriting(true); // Kunci auto-fetch!
      
      const statusBaru = !pompaNyala;
      setPompaNyala(statusBaru); // UI langsung diubah instan biar responsif

      // Sesuai real hardware: Pompa di-handle oleh updateField5
      const response = await apiService.updateField4(statusBaru ? 1 : 0);
      
      if (response === 0) {
        setPompaNyala(!statusBaru); // Rollback jika respon ThingSpeak gagal
        alert("Gagal memperbarui status pompa. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Gagal mengubah status pompa:", error);
      setPompaNyala(pompaNyala); // Rollback jika error network
    } finally {
      // Kasih jeda 15 detik (15000ms) biar aman dari rate-limit ThingSpeak gratisan
      setTimeout(() => {
        setIsWriting(false);
        setLoadingAction(false);
      }, 15000);
    }
  };

  // FUNGSI AKSI: Kontrol Saklar Kipas (Optimistic Update) -> Menembak Field 4
  const handleToggleKipas = async () => {
    if (loadingAction) return;
    try {
      setLoadingAction(true);
      setIsWriting(true); // Kunci auto-fetch!
      
      const statusBaru = !kipasNyala;
      setKipasNyala(statusBaru); // UI langsung diubah instan

      // Sesuai real hardware: Kipas di-handle oleh updateField4
      const response = await apiService.updateField5(statusBaru ? 1 : 0);
      
      if (response === 0) {
        setKipasNyala(!statusBaru); // Rollback jika gagal
        alert("Gagal memperbarui status kipas. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Gagal mengubah status kipas:", error);
      setKipasNyala(kipasNyala); // Rollback jika error network
    } finally {
      setTimeout(() => {
        setIsWriting(false);
        setLoadingAction(false);
      }, 15000);
    }
  };

  // EFFECT UNTUK THINGSPEAK POLLING
  useEffect(() => {
    let isMounted = true;

    const startPolling = async () => {
      if (isMounted) {
        await fetchThingSpeakData();
      }
    };

    startPolling();

    const interval = setInterval(() => {
      startPolling();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isWriting, pompaNyala, kipasNyala]); 

  // EFFECT UNTUK WEATHER
  useEffect(() => {
    fetchWeather(-6.2, 106.8).then(setWeather);
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative font-sans"
      style={{ backgroundImage: `url(${dracanea})` }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative max-w-7xl mx-auto px-10 py-16">

        {/* HEADER */}
        <Header />

        {/* SENSOR CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <SensorCard title="Temperature" value={suhu} unit="°C" icon="🌡" />
          <SensorCard title="Humidity" value={humidity} unit="%" icon="💧" />
          <SensorCard title="Soil Moisture" value={soil} unit="%" icon="🌱" />
        </div>

        {/* WEATHER */}
        <WeatherCard weather={weather} />

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <SensorChart
            title="Temperature Trend"
            data={tempData}
            color="#4ade80"
          />
          <SensorChart
            title="Humidity Trend"
            data={humData}
            color="#60a5fa"
          />
          <SensorChart
            title="Soil Moisture Trend"
            data={soilData}
            color="#facc15"
          />
        </div>

        {/* CONTROLLER SECTION */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
          <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
            ⚙️ Device Controller
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget Tombol Pompa */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-lg">Water Pump Control</p>
                <p className="text-gray-400 text-sm mt-1">
                  Status: {pompaNyala ? <span className="text-green-400 font-semibold">Active</span> : <span className="text-gray-400">Inactive</span>}
                </p>
              </div>
              <button
                onClick={handleTogglePompa}
                disabled={loadingAction}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md ${
                  pompaNyala 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
                    : "bg-zinc-800 hover:bg-zinc-700 text-gray-300"
                } ${loadingAction ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loadingAction && isWriting ? "WAIT..." : pompaNyala ? "TURN OFF" : "TURN ON"}
              </button>
            </div>

            {/* Widget Tombol Kipas */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-lg">Exhaust Fan Control</p>
                <p className="text-gray-400 text-sm mt-1">
                  Status: {kipasNyala ? <span className="text-green-400 font-semibold">Active</span> : <span className="text-gray-400">Inactive</span>}
                </p>
              </div>
              <button
                onClick={handleToggleKipas}
                disabled={loadingAction}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md ${
                  kipasNyala 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
                    : "bg-zinc-800 hover:bg-zinc-700 text-gray-300"
                } ${loadingAction ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loadingAction && isWriting ? "WAIT..." : kipasNyala ? "TURN OFF" : "TURN ON"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}