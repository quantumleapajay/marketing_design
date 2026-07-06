
import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Chrome, Mail, ArrowLeft, AlertCircle, XCircle, Clock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export const Login: React.FC = () => {
  const { login, isDeactivated, sessionExpired, setSessionExpired } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot-password' | 'confirmation'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showDeactivatedToast, setShowDeactivatedToast] = useState(false);
  const [showExpiryToast, setShowExpiryToast] = useState(false);

  useEffect(() => {
    if (sessionExpired) {
      setShowExpiryToast(true);
      const timer = setTimeout(() => {
        setShowExpiryToast(false);
        setSessionExpired(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired, setSessionExpired]);

  const handleGoogleLogin = () => {
    // Simulate Google Login
    login('Marketing Head');
    toast.success('Logged in successfully as Marketing Head');
  };

  const handleUnregisteredGoogleSimulation = () => {
    toast.error('Your account is not registered. Please contact your Admin.', {
      duration: 5000,
    });
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Test Case: Deactivated Flow
    if (email === 'deactivated@ql.one') {
      setShowDeactivatedToast(true);
      setTimeout(() => setShowDeactivatedToast(false), 5000);
      return;
    }

    // Test Case: Error Password Flow
    if (email === 'error@ql.one' || (email === 'admin@qlone.com' && password !== 'admin123')) {
      setLoginError(true);
      return;
    }

    setLoginError(false);
    if (email === 'admin@qlone.com' && password === 'admin123') {
      login('Marketing Head');
      toast.success('Logged in as Marketing Head');
    } else {
      login('Marketing Team Member');
      toast.success('Logged in as Marketing Team Member');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setView('confirmation');
  };

  if (isDeactivated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Account Deactivated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account has been deactivated. Contact your admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'forgot-password') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
        <Card className="w-full max-w-md shadow-lg border-0 rounded-2xl p-2">
          <CardHeader className="space-y-4 pb-4">
            <button 
              onClick={() => setView('login')}
              className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </button>
            <div className="space-y-2">
              <CardTitle className="text-[20px] font-bold text-slate-900">Reset your password</CardTitle>
              <CardDescription className="text-[14px] text-slate-500 leading-relaxed">
                Enter your registered email address. We'll send you a link to reset your password.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium text-slate-700">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus:ring-primary/20"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all">
                Send reset link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'confirmation') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans text-center">
        <Card className="w-full max-w-md shadow-lg border-0 rounded-2xl p-6">
          <CardContent className="flex flex-col items-center pt-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-[20px] font-bold text-slate-900 mb-2">Check your email</h2>
            <p className="text-[14px] text-slate-500 leading-relaxed mb-8 max-w-[280px]">
              We've sent a reset link to <span className="text-slate-900 font-medium">{resetEmail || 'you@example.com'}</span>. The link expires in 24 hours.
            </p>
            
            <div className="text-[14px] mb-8">
              <span className="text-slate-500">Didn't receive it? </span>
              <button className="text-blue-600 font-bold hover:underline" onClick={() => toast.info('Reset link resent')}>Resend email</button>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
              onClick={() => setView('login')}
            >
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md shadow-lg border-0 rounded-2xl p-2">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-px h-6 bg-white absolute rotate-45" />
                <div className="w-6 h-px bg-white absolute rotate-45" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">QL One Marketing</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 font-medium text-slate-700 transition-all" onClick={handleGoogleLogin}>
            <Chrome className="mr-3 h-5 w-5 text-slate-600" />
            Continue with Google
          </Button>
          <button
            type="button"
            onClick={handleUnregisteredGoogleSimulation}
            className="mt-[-12px] text-left text-xs text-slate-500 hover:text-slate-700"
          >
            Simulate: unregistered account →
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold text-slate-400">
              <span className="bg-white px-3">
                Or continue with email
              </span>
            </div>
          </div>
          <form onSubmit={handleEmailLogin} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (loginError) setLoginError(false);
                }}
                className={cn(
                  "h-11 rounded-xl border-slate-200 focus:ring-primary/20",
                  loginError && "border-red-400 focus-visible:ring-red-100"
                )}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                <button 
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError(false);
                  }}
                  className={cn(
                    "h-11 rounded-xl border-slate-200 focus:ring-primary/20 pr-10",
                    loginError && "border-red-400 focus-visible:ring-red-100"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginError && (
                <div className="flex items-center gap-2 mt-1 text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-[13px]">Incorrect email or password. Please try again.</span>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 transition-all">
              Sign In
            </Button>
          </form>
          
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Test Scenarios</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Product Preview Flow</p>
                  <p className="text-[10px] text-slate-500">buyer@ql.one</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    setEmail('buyer@ql.one');
                    setPassword('anything');
                  }}
                >
                  Apply
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Deactivate Flow</p>
                  <p className="text-[10px] text-slate-500">deactivated@ql.one</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    setEmail('deactivated@ql.one');
                    setPassword('anything');
                  }}
                >
                  Apply
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Error Password Flow</p>
                  <p className="text-[10px] text-slate-500">error@ql.one</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    setEmail('error@ql.one');
                    setPassword('any');
                  }}
                >
                  Apply
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Success Flow (Adm)</p>
                  <p className="text-[10px] text-slate-500">admin@qlone.com / admin123</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    setEmail('admin@qlone.com');
                    setPassword('admin123');
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showDeactivatedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 overflow-hidden"
          >
            <div className="w-[400px] bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3">
              <XCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                Your account has been deactivated. Please contact your Admin.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExpiryToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 overflow-hidden"
          >
            <div className="w-[400px] bg-amber-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                Your session has expired. Please log in again.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
