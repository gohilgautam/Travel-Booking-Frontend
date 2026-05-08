import { motion } from "framer-motion";
import travelBg from "../assets/backgrounds/travel-bg.png";

export default function PageBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Base Image */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${travelBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.6) saturate(1.2)",
        }}
      />

      {/* Overlay for better readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 0%, rgba(5, 5, 10, 0.4) 100%)",
          backdropFilter: "blur(2px)",
        }}
      />
      
      {/* Animated subtle light effect */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
