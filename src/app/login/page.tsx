'use client';

import { useState, useMemo, useEffect } from 'react';
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
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#060f1f]">
      {/* Background Gradient Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060f1f] via-[#0b1d3a] to-[#081a33]" />

      {/* Interactive Particles */}
      <ParticleBackground />

      <main className="relative z-10 grid w-full lg:grid-cols-2">
        {/* LEFT SIDE: Visual Section */}
        <section className="hidden lg:flex flex-col items-center justify-center p-12 border-r border-white/5 relative bg-black/10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Faint grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-full max-w-lg aspect-square flex items-center justify-center"
          >
            {/* Sun Graphic */}
            <motion.div
              className="absolute top-0 right-0 z-20"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <div className="relative">
                <Sun className="h-32 w-32 text-yellow-500 blur-[2px]" />
                <motion.div
                  className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Solar Panel Grid Animation */}
            <div className="w-full h-full relative p-8">
              <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Sunlight Sweep Effect */}
                  <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="45%" stopColor="transparent" />
                    <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                    <stop offset="55%" stopColor="transparent" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>

                  <clipPath id="panelClip">
                    <rect x="50" y="50" width="300" height="200" rx="8" />
                  </clipPath>
                </defs>

                {/* Main Panel Frame */}
                <rect x="45" y="45" width="310" height="210" rx="12" fill="#334155" />
                <rect x="50" y="50" width="300" height="200" rx="8" fill="url(#panelGrad)" />

                {/* Grid Lines */}
                {[...Array(6)].map((_, i) => (
                  <line key={`v-${i}`} x1={50 + (i + 1) * (300 / 7)} y1="50" x2={50 + (i + 1) * (300 / 7)} y2="250" stroke="#475569" strokeWidth="1" />
                ))}
                {[...Array(4)].map((_, i) => (
                  <line key={`h-${i}`} x1="50" y1={50 + (i + 1) * (200 / 5)} x2="350" y2={50 + (i + 1) * (200 / 5)} stroke="#475569" strokeWidth="1" />
                ))}

                {/* Sunlight Sweep Animation */}
                <motion.rect
                  x="-200" y="50" width="600" height="200"
                  fill="url(#sweepGrad)"
                  clipPath="url(#panelClip)"
                  animate={{ x: [-200, 400] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Energy Flowing Dot */}
                <motion.circle r="3" fill="#fbbf24"
                  animate={{
                    cx: [100, 150, 200, 250, 300],
                    cy: [80, 120, 160, 200, 160],
                    opacity: [0, 1, 1, 1, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              {/* Float-up Efficiency stats */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                <motion.div
                  animate={{ y: [20, -20], opacity: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-sm text-[10px] text-yellow-400 font-bold tracking-widest flex items-center gap-1"
                >
                  <Zap className="h-2 w-2" /> ENERGY GAIN +4.2kW
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence at the Edge</h2>
            <p className="text-slate-400 mt-2 max-w-sm text-balance">
              Our AI models analyze atmospheric conditions and panel orientation to extract maximum power from every photon.
            </p>
          </div>
        </section>

        {/* RIGHT SIDE: Login Card Section */}
        <section className="flex flex-col items-center justify-center p-6 relative">
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
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl relative group overflow-hidden">
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
                              className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:ring-primary/50 focus:border-primary/50 placeholder:font-light"
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
                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:ring-primary/50 focus:border-primary/50"
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
                                className="bg-black/20 border-white/10 text-white focus:ring-primary/50 focus:border-primary/50 pr-10"
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
                        className="w-full h-11 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-sm rounded-lg shadow-lg shadow-orange-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 group"
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
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    setStep('identify');
    setEmail('');
    setOtp('');
    setNewPassword('');
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
      if (res.verified) {
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
      await updateUserPassword(email, newPassword);
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
