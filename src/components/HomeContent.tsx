"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun, LayoutPanelTop, ShieldCheck, Smartphone, Globe, BarChart3, HeartPulse, ChevronRight, Zap, Brain } from 'lucide-react';
import Image from 'next/image';

export default function HomeContent() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#030712] text-white font-inter selection:bg-primary/30"
    >
      {/* Techy Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX: scrollYProgress, boxShadow: "0 0 20px rgba(34, 211, 238, 0.8)" }}
      />
      {/* Navigation Bar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#030712]/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white/5 group-hover:bg-white/10 transition-colors">
              <img src="/favicon.svg" alt="SolarSyncX Logo" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              SolarSyncX
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/login" className="relative group overflow-hidden text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 px-5 py-2.5 rounded-full transition-all border border-primary/20 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </Link>
        </div>
      </motion.nav>

      {/* Enhanced Ambient Background with efficient Parallax */}
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        {/* Soft radial glow top-center */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-50" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]" />
      </motion.div>

      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 overflow-hidden">
        
        {/* HERO SECTION */}
        <motion.section 
          className="w-full max-w-6xl mx-auto flex flex-col items-center text-center space-y-10 mb-32"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-slate-300">Introducing SolarSyncX AI 2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 max-w-4xl leading-tight"
          >
            The Operating System for your Solar Energy.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl"
          >
            Monitor in real-time, predict maintenance before it happens, and optimize your energy output using our proprietary AI engine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
          >
            <Link
              href="/login"
              className="group flex items-center space-x-2 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-slate-200 transition-colors"
            >
              <span>Start Optimizing Free</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="group flex items-center space-x-2 bg-white/5 border border-white/10 text-white font-medium px-8 py-4 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md"
            >
              <span>Explore Features</span>
            </Link>
          </motion.div>

          {/* DASHBOARD MOCKUP */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="w-full mt-16 relative perspective-1000"
          >
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 opacity-50" />
            
            <div className="relative rounded-2xl md:rounded-[32px] border border-white/10 bg-white/5 p-2 md:p-4 backdrop-blur-sm shadow-2xl shadow-primary/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <img
                src="/dashboard-mockup.png"
                alt="SolarSyncX Dashboard Interface"
                className="w-full h-auto rounded-xl md:rounded-[24px] border border-white/5 object-cover shadow-inner relative"
              />
              
              {/* Privacy Overlay for Personal Data (Profile Avatar in top right) */}
              <div className="absolute top-[3%] right-[2%] md:top-[4%] md:right-[3%] w-[6%] h-[8%] md:w-[4%] md:h-[6%] bg-[#030712]/90 backdrop-blur-md rounded-full border border-white/5 flex items-center justify-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 w-1/2 h-1/2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* BENTO BOX FEATURES SECTION */}
        <section className="w-full max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">maximize ROI.</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Powerful features designed to give you complete control and visibility over your solar infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Box 1: AI Insights (Large, spans 2 cols) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative col-span-1 md:col-span-2 row-span-1 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-primary/20 transition-colors duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">AI-Powered Insights</h3>
                  <p className="text-slate-400 max-w-md">Our neural networks analyze production patterns to predict maintenance needs weeks before a failure occurs.</p>
                </div>
              </div>
            </motion.div>

            {/* Box 2: Real-Time (Tall, spans 2 rows) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative col-span-1 md:col-span-1 md:row-span-2 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,184,0,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 mb-8">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Live Monitoring</h3>
                <p className="text-slate-400 mb-8">Sub-second latency telemetry streams data directly from your inverters to your dashboard.</p>
                
                {/* Decorative UI element inside the box */}
                <div className="mt-auto p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Current Output</span>
                    <span className="text-xs text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded">LIVE</span>
                  </div>
                  <div className="text-3xl font-bold font-mono">4.2 <span className="text-lg text-slate-500">kW</span></div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 w-[75%] rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Box 3: Weather (Medium) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative col-span-1 rounded-3xl bg-white/5 border border-white/10 p-8 overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-4">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Weather Forecasting</h3>
              <p className="text-sm text-slate-400">Integrates with global meteorological APIs to adjust production estimates based on cloud cover.</p>
            </motion.div>

            {/* Box 4: Security (Medium) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative col-span-1 rounded-3xl bg-white/5 border border-white/10 p-8 overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-sm text-slate-400">End-to-end encrypted data streams backed by Firebase authentication.</p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl mx-auto mt-32 text-center bg-gradient-to-b from-primary/10 to-transparent rounded-[40px] p-12 md:p-20 border border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to take control?</h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">Join hundreds of solar owners maximizing their ROI with SolarSyncX.</p>
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full bg-primary text-black font-semibold hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-6xl mx-auto mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/favicon.svg" alt="Logo" className="w-5 h-5 opacity-50" />
            <span>© {new Date().getFullYear()} SolarSyncX. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:solarsyncx@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>

      </main>
    </motion.div>
  );
}
