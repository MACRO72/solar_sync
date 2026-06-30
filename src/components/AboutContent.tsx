"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sun, Zap, ShieldCheck, LayoutPanelTop, Users, Brain, Shield, Zap as Lightning } from 'lucide-react';

export default function AboutContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-[#0a192f] to-[#050d1a] text-white font-inter"
    >
      {/* Navigation Bar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a192f]/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/favicon.svg" alt="SolarSyncX Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-white tracking-tight">SolarSyncX</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/login" className="text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg transition-colors">
            Sign Up
          </Link>
        </div>
      </motion.nav>

      {/* Mouse "Energy Particle" Glow */}
      <div
        className="fixed inset-0 z-0 pointer-events-none blur-[40px] opacity-60"
        style={{
          background: `
            radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgba(255,200,80,0.10) 0%,
              rgba(255,200,80,0.10) 2%,
              rgba(0,180,255,0.20) 2%,
              rgba(0,180,255,0.12) 4%,
              rgba(0,180,255,0.06) 8%,
              rgba(0,150,255,0.03) 20%,
              transparent 25%)
          `,
          willChange: 'background'
        }}
      />

      {/* Grid Pattern Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-[-30px] transition-transform duration-[600ms] ease-out"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'moveGradient 15s ease infinite',
            transform: `translate(var(--grid-x, 0px), var(--grid-y, 0px))`,
            willChange: 'transform'
          }}
        />
      </div>

      {/* Glow behind content */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,180,255,0.1), transparent 70%)',
          opacity: '0.3'
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-12">
        {/* Header / Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer group relative mb-12"
          aria-label="SolarSyncX Home"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-14 h-14 flex items-center justify-center" aria-hidden="true">
              <img src="/favicon.svg" alt="SolarSyncX Logo" className="w-14 h-14" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-white tracking-tight lg:text-5xl">
                SolarSyncX
              </h1>
              <p className="text-slate-300 font-medium">
                Revolutionizing Solar Energy with AI
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-4xl space-y-8 text-center">
          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            aria-labelledby="mission-heading"
          >
            <h2 id="mission-heading" className="text-3xl font-bold lg:text-4xl">
              Our Mission
            </h2>
            <p className="text-slate-200 lg:text-xl max-w-2xl mx-auto">
              At SolarSyncX, we believe that every ray of sunlight should be harnessed to its fullest potential. Our mission is to empower solar energy owners with cutting-edge AI technology that maximizes efficiency, reduces maintenance costs, and accelerates the transition to renewable energy.
            </p>
          </motion.section>

          {/* Technology */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            aria-labelledby="technology-heading"
          >
            <h2 id="technology-heading" className="text-2xl font-bold lg:text-3xl">
              Our Technology
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-left">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Analytics Engine</h3>
                    <p className="text-slate-300 text-sm">
                      Proprietary machine learning models that analyze patterns in energy production, weather data, and system performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Enterprise Security</h3>
                    <p className="text-slate-300 text-sm">
                      Firebase-powered authentication, end-to-end encryption, and regular security audits ensure your data remains protected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Real-Time Processing</h3>
                    <p className="text-slate-300 text-sm">
                      Stream data from your solar inverters and sensors with sub-second latency for immediate insights.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <LayoutPanelTop className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Panel-Level Intelligence</h3>
                    <p className="text-slate-300 text-sm">
                      Monitor and optimize performance at the individual panel level for maximum efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Values */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            aria-labelledby="values-heading"
          >
            <h2 id="values-heading" className="text-2xl font-bold lg:text-3xl">
              Our Values
            </h2>
            <div className="grid gap-4 md:grid-cols-3 text-left">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Sustainability</h3>
                    <p className="text-slate-300 text-sm">
                      We&apos;re committed to accelerating the adoption of clean energy and reducing carbon footprints worldwide.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Customer Success</h3>
                    <p className="text-slate-300 text-sm">
                      Your success is our success. We provide exceptional support based on your feedback.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <Lightning className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Innovation</h3>
                    <p className="text-slate-300 text-sm">
                      We continuously push the boundaries of what&apos;s possible with AI and solar technology.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold lg:text-3xl">
              Ready to join the solar revolution?
            </h2>
            <p className="text-slate-200 max-w-lg mx-auto">
              Experience the future of solar energy management with SolarSyncX&apos;s AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                id="about-cta-get-started"
                href="/login"
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-bold py-3 px-6 rounded-lg text-center text-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                id="about-cta-home"
                href="/"
                className="flex-1 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-lg text-center text-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Learn How It Works
              </Link>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-slate-400 text-sm border-t border-white/10 pt-8"
          >
            <div className="space-x-6 justify-center flex flex-wrap">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:solarsyncx@gmail.com" className="hover:text-white transition-colors">Contact Us</a>
            </div>
            <p className="mt-4">
              © {new Date().getFullYear()} SolarSyncX. All rights reserved.
            </p>
          </motion.footer>
        </div>
      </div>
    </motion.div>
  );
}
