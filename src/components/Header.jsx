import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <h1 className="text-5xl font-bold text-white drop-shadow-lg leading-tight">
        Smart Irigation
      </h1>
      <p className="mt-4 text-lg text-green-100 drop-shadow">
        Real-time IoT plant health analystic dashboard</p>
    </motion.header>
  );
}
