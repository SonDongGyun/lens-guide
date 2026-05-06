"use client";

import { motion } from "framer-motion";

export function HeroLens() {
  return (
    <div aria-hidden="true" className="relative w-full h-full">
      {/* Soft animated gradient backdrop */}
      <motion.div
        aria-hidden
        className="absolute inset-0 gradient-mesh blur-2xl opacity-90"
        animate={{
          rotate: [0, 6, -3, 0],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating "lens disc" stack */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* outermost ring */}
          <motion.div
            className="absolute -inset-32 rounded-full border border-brand/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -inset-20 rounded-full border border-accent-purple/15"
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />

          {/* lens disc */}
          <div className="relative w-[420px] h-[420px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(219,232,254,0.85) 35%, rgba(123,97,255,0.45) 75%, rgba(49,130,246,0.55) 100%)",
                boxShadow:
                  "0 40px 80px rgba(49,130,246,0.35), inset 0 0 80px rgba(255,255,255,0.6)",
              }}
            />
            {/* shimmering highlight */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.6) 8%, transparent 18%, transparent 70%, rgba(255,255,255,0.3) 80%, transparent 90%)",
                mixBlendMode: "screen",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
            {/* inner reflective cap */}
            <div
              className="absolute top-8 left-12 w-32 h-20 rounded-full opacity-80 blur-md"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.95), transparent 70%)",
              }}
            />
            {/* small bottom highlight */}
            <div
              className="absolute bottom-14 right-16 w-20 h-10 rounded-full opacity-50 blur-sm"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)",
              }}
            />
          </div>

          {/* floating chips */}
          <motion.div
            className="absolute -top-2 -left-12 px-4 py-2 rounded-full bg-white shadow-elevated text-sm font-semibold text-ink-900 flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{ delay: 0.4, duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="w-2 h-2 rounded-full bg-accent-mint" />
            얇아진 1.67
          </motion.div>
          <motion.div
            className="absolute top-20 -right-16 px-4 py-2 rounded-full bg-white shadow-elevated text-sm font-semibold text-ink-900 flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, 8, 0] }}
            transition={{ delay: 0.8, duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="w-2 h-2 rounded-full bg-brand" />
            비반사 코팅
          </motion.div>
          <motion.div
            className="absolute -bottom-4 left-2 px-4 py-2 rounded-full bg-white shadow-elevated text-sm font-semibold text-ink-900 flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{ delay: 1.2, duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="w-2 h-2 rounded-full bg-accent-purple" />
            누진다초점
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
