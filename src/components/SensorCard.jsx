export default function SensorCard({ title, value, unit, icon }) {

  const colorMap = {
    Temperature: "text-red-300",
    Humidity: "text-blue-300",
    "Soil Moisture": "text-yellow-300"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        bg-white/5
        backdrop-blur-2xl
        border border-white/20
        rounded-2xl
        p-8
        shadow-lg
        hover:scale-105
        transition duration-300
        cursor-pointer
      "
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white/80 font-medium">{title}</h3>

        <span className={`text-2xl ${colorMap[title]}`}>
          {icon}
        </span>
      </div>

      <p className={`mt-4 text-3xl font-bold ${colorMap[title]}`}>
        {value} {unit}
      </p>
    </motion.div>
  );
}