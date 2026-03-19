import { motion } from "framer-motion";

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="
        bg-white/5
        backdrop-blur-2xl
        border border-white/20
        rounded-2xl
        p-8
        shadow-lg
        transition duration-300
        mb-16
      "
    >
      <h3 className="text-lg font-semibold text-white/80 mb-2">
        ☁️ Weather - {weather.name}
      </h3>

      <p className="text-3xl font-bold text-green-200">
        {weather.main.temp} °C
      </p>

      <p className="text-green-100 capitalize">
        {weather.weather[0].description}
      </p>
    </motion.div>
  );
}