import { motion } from 'framer-motion';
import logo from '../../Logo/Gemini_Generated_Image_swb8yswb8yswb8ys.png';

export const PageLoader = () => {
  const brandName = "TRAVELORA • EXPLORE • DISCOVER • ";
  const characters = brandName.split("");
  
  return (
    <div className="loader-overlay" style={{
      position: 'fixed', inset: 0, 
      background: 'rgba(5, 5, 10, 0.98)',
      backdropFilter: 'blur(30px)',
      display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Rotating Circular Text */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {characters.map((char, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                height: '120px', // Radius
                transform: `rotate(${i * (360 / characters.length)}deg)`,
                transformOrigin: '0 0',
                top: '50%',
                left: '50%',
                color: '#818cf8',
                fontSize: '0.8rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textShadow: '0 0 10px rgba(129, 140, 248, 0.5)'
              }}
            >
              {char}
            </span>
          ))}
        </motion.div>

        {/* Outer Glow Ring */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            width: 180, height: 180,
            borderRadius: '50%',
            border: '2px dashed rgba(129, 140, 248, 0.2)',
          }}
        />

        {/* Central Logo */}
        <motion.div
          animate={{ 
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            position: 'relative', zIndex: 10,
            width: 130, height: 130,
            borderRadius: 40,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(99,102,241,0.2)',
            background: '#0a0a10',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <img 
            src={logo} 
            alt="Travelora Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </motion.div>
      </div>

      {/* Progress Line */}
      <div style={{ marginTop: 60, width: 200, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute', inset: 0,
            width: '60%',
            background: 'linear-gradient(90deg, transparent, #818cf8, transparent)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ 
          marginTop: 20, fontSize: '0.7rem', 
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em',
          textTransform: 'uppercase', fontWeight: 700
        }}
      >
        Synchronizing Adventure
      </motion.div>
    </div>
  );
};

export const BtnLoader = () => (
  <motion.span 
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="btn-spinner" 
    style={{ 
      display: 'inline-block', width: 20, height: 20, 
      border: '3px solid rgba(255,255,255,0.3)', 
      borderTopColor: '#fff', borderRadius: '50%' 
    }}
  />
);