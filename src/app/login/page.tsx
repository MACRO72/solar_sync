'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { app } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons';
import { Loader2, Eye, EyeOff, Sun, Zap, LayoutPanelTop, ArrowRight, ShieldCheck, Mail, Smartphone, KeyRound, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { checkUserRegistered, generateAndSendOTP, verifyOTPCode, updateUserPassword } from './auth-actions';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';
import { SolarEnergyLoader } from '@/components/dashboard/solar-energy-loader';

const formSchema = z.object({
  email: z.string().email({ message: 'Valid email required.' }),
  password: z.string().min(6, { message: 'Min 6 chars.' }),
  phone: z.string().optional(),
});

// Animated background particles
const ParticleBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-yellow-400/30 blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            willChange: 'transform, opacity'
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    mousePosRef.current = { x: targetX, y: targetY };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      const dx = targetX - mousePosRef.current.x;
      const dy = targetY - mousePosRef.current.y;

      mousePosRef.current = {
        x: mousePosRef.current.x + dx * 0.05,
        y: mousePosRef.current.y + dy * 0.05
      };

      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${mousePosRef.current.x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${mousePosRef.current.y}px`);

        // Also update shifts for the grid
        const xShift = (mousePosRef.current.x / window.innerWidth - 0.5) * -15;
        const yShift = (mousePosRef.current.y / window.innerHeight - 0.5) * -15;
        containerRef.current.style.setProperty('--grid-x', `${xShift}px`);
        containerRef.current.style.setProperty('--grid-y', `${yShift}px`);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const [showReset, setShowReset] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const auth = getAuth(app);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', phone: '' },
  });

  const handleUserSetup = async (user: User, phone?: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email,
      phone: phone || '',
    }, { merge: true });
  };

  const handleAuth = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    try {
      if (mode === 'signup') {
        if (!values.phone || values.phone.length < 10) {
          toast({ variant: 'destructive', title: 'Phone Required', description: 'Please enter a valid phone number for alerts.' });
          setIsProcessing(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await handleUserSetup(cred.user, values.phone);
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }

      // Cinematic Success Transition
      setIsProcessing(false);
      setShowSuccessLoader(true);

      // Force sessionStorage to prevent dashboard's own loader from double-firing
      sessionStorage.setItem('hasSeenSolarLoader', 'true');

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setIsProcessing(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex overflow-hidden">
      <AnimatePresence>
        {showSuccessLoader && (
          <SolarEnergyLoader key="success-loader" />
        )}
      </AnimatePresence>

      {/* 1. Base Dark Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0a192f] to-[#050d1a]" />

      {/* 2. Ultra-small Smooth Soft Mouse "Energy Particle" Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none blur-[40px] opacity-60"
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
        } as any}
      />

      {/* 3. Grid Pattern Layer (Sharp) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-[-30px] transition-transform duration-[600ms] ease-out"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'moveGradient 15s ease infinite',
            transform: `translate(var(--grid-x, 0px), var(--grid-y, 0px))`,
            willChange: 'transform'
          } as any}
        />
      </div>

      {/* Glow behind login card */}
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0,180,255,0.2), transparent 70%)',
          filter: 'blur(80px)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      <main className="relative z-10 flex w-full flex-1 items-center justify-center">
        {/* RIGHT SIDE: Login Card Section */}
        <section className="flex flex-col items-center justify-center p-6 relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Logo and Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="cursor-pointer group relative"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                <Logo className="size-16 text-primary relative z-10 drop-shadow-glow" />
              </motion.div>
              <h1 className="mt-6 text-3xl font-extrabold text-white tracking-tight uppercase">SOLAR SYNC</h1>
              <p className="mt-2 text-slate-400 font-medium">AI-Powered Solar Panel Efficiency Monitoring</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/[0.05] backdrop-blur-[20px] border border-white/[0.08] rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] relative group overflow-hidden hover:-translate-y-1 transition-transform duration-500">
              {/* Card Micro-accent */}
              <div className="absolute top-0 right-0 p-2 opacity-50">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>

              {/* Efficiency Meter Visualization */}
              <div className="mb-8 space-y-2">
                <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                  <span className="flex items-center gap-1"><LayoutPanelTop className="h-3 w-3" /> System Efficiency</span>
                  <span className="text-yellow-500">98.4% Optimal</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "98.4%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-[length:200%_100%] animate-shimmer"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-600 font-semibold tracking-widest">
                  <span>PANEL_GRID_A12</span>
                  <span>REAL_TIME_OPTIMIZED</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-5">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-400">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name@solar-infra.com"
                              {...field}
                              disabled={isProcessing}
                              className="bg-black/30 border-white/[0.08] text-white placeholder:text-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 focus-visible:shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all duration-300 placeholder:font-light"
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage className="text-orange-400" />
                        </FormItem>
                      )} />

                      {mode === 'signup' && (
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-400">Security Contact (Phone)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 000-0000"
                                {...field}
                                disabled={isProcessing}
                                className="bg-black/30 border-white/[0.08] text-white placeholder:text-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 focus-visible:shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all duration-300"
                                autoComplete="tel"
                              />
                            </FormControl>
                            <FormMessage className="text-orange-400" />
                          </FormItem>
                        )} />
                      )}

                      <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-slate-400">Access Key</FormLabel>
                            {mode === 'signin' && (
                              <button
                                type="button"
                                onClick={() => setShowReset(true)}
                                className="text-[11px] font-semibold text-primary/80 hover:text-primary transition-colors"
                              >
                                Forgot Key?
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                {...field}
                                disabled={isProcessing}
                                className="bg-black/30 border-white/[0.08] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 focus-visible:shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all duration-300 pr-10"
                                autoComplete="current-password"
                              />
                            </FormControl>
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                          <FormMessage className="text-orange-400" />
                        </FormItem>
                      )} />

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-sm rounded-lg shadow-[0_4px_14px_rgba(249,115,22,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all duration-300 hover:-translate-y-[2px] active:scale-[0.98] mt-2 group border border-orange-400/20"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {mode === 'signin' ? 'Verify Credentials' : 'Request Access'}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs">
                      {mode === 'signin' ? "Not registered with optimizer?" : "System access already active?"}
                      {' '}
                      <button
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-primary font-bold hover:underline"
                      >
                        {mode === 'signin' ? 'Register Now' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Status Text */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                <span className="w-8 h-px bg-slate-800" />
                Optimizing Renewable Energy Intelligence
                <span className="w-8 h-px bg-slate-800" />
              </div>

              {/* Footer Icons */}
              <div className="flex items-center gap-6 opacity-20 grayscale">
                <Sun className="h-5 w-5" />
                <Zap className="h-5 w-5" />
                <LayoutPanelTop className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <ResetPasswordModal
        open={showReset}
        onOpenChange={setShowReset}
      />

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.3));
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 30s ease infinite;
        }
        @keyframes moveGradient {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

/**
 * Multi-step password reset modal using OTP verification.
 */
function ResetPasswordModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<'identify' | 'verify' | 'newpass' | 'success'>('identify');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    setStep('identify');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setResetToken('');
    onOpenChange(false);
  };

  const onIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await checkUserRegistered(email);
      if (res.exists) {
        await generateAndSendOTP(email);
        setStep('verify');
        toast({ title: 'OTP Sent', description: 'Check your email for the passkey.' });
      } else {
        toast({ variant: 'destructive', title: 'Not Found', description: 'This email is not registered in our system.' });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await verifyOTPCode(email, otp);
      if (res.verified && res.token) {
        setResetToken(res.token);
        setStep('newpass');
      } else {
        toast({ variant: 'destructive', title: 'Invalid OTP', description: res.message });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Too Short', description: 'Passkey must be at least 6 characters.' });
      return;
    }
    setIsProcessing(true);
    try {
      await updateUserPassword(email, newPassword, resetToken);
      setStep('success');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0b1d3a] border-white/10 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {step === 'identify' && 'Reset Access Key'}
            {step === 'verify' && 'Identity Verification'}
            {step === 'newpass' && 'New Access Key'}
            {step === 'success' && 'Reset Complete'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 'identify' && 'Enter your registered email to receive a secure passkey.'}
            {step === 'verify' && `We sent a 6-digit code to ${email}.`}
            {step === 'newpass' && 'Define a new secure access key for your account.'}
            {step === 'success' && 'Your access key has been successfully updated.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <AnimatePresence mode="wait">
            {step === 'identify' && (
              <motion.form
                key="id" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={onIdentify} className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@solar-infra.com"
                      className="bg-black/20 border-white/10 pl-10 h-11 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-11">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Passkey'}
                </Button>
              </motion.form>
            )}

            {step === 'verify' && (
              <motion.form
                key="ver" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={onVerify} className="space-y-4"
              >
                <div className="space-y-2 text-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Enter 6-Digit Code</label>
                  <Input
                    required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="0 0 0 0 0 0"
                    className="bg-black/20 border-white/10 h-14 text-center text-2xl tracking-[0.5em] font-mono focus:ring-primary/50"
                  />
                </div>
                <Button type="submit" disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-11">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authorize Reset'}
                </Button>
                <button
                  type="button" onClick={() => setStep('identify')}
                  className="w-full text-xs text-slate-500 hover:text-white transition-colors"
                >
                  Didn't get code? Back to start
                </button>
              </motion.form>
            )}

            {step === 'newpass' && (
              <motion.form
                key="pass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={onUpdatePassword} className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Access Key</label>
                  <Input
                    required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="bg-black/20 border-white/10 h-11 focus:ring-primary/50"
                  />
                </div>
                <Button type="submit" disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-11">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm New Key'}
                </Button>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div
                key="succ" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Inquiry Processed</h3>
                <p className="text-slate-400 text-sm">To ensure maximum security, a final authorization link has been sent to your email. Please click the link to finalize your new access key.</p>
                <Button onClick={handleReset} className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-11">
                  Return to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
