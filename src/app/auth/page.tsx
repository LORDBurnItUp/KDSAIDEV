'use client';

import { useState } from 'react';
import TeleportNav from '@/components/TeleportNav';
import ScrollReveal from '@/components/ScrollReveal';
import GlowButton from '@/components/GlowButton';

// Simplified auth page for static export
// Real auth connects when NEXT_PUBLIC_SUPABASE_URL is set
export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Auth logic connects when Supabase is configured
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <TeleportNav />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-lime rounded-full blur-[300px] opacity-[0.05]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-blue-accent rounded-full blur-[250px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <ScrollReveal>
          <div className="glass rounded-3xl p-8 border border-white/[0.06]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-lime/10 border border-lime/20 flex items-center justify-center text-3xl mx-auto mb-4">
                <span className="text-lime font-display font-bold">K</span>
              </div>
              <h1 className="font-display font-black text-2xl mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join 2130'}
              </h1>
              <p className="text-text-secondary text-sm">
                {mode === 'login'
                  ? 'Enter your credentials to access the portal'
                  : 'Create your account to enter the dimension'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white outline-none focus:border-lime/30 transition-all font-mono text-sm" placeholder="Your name" required />
                </div>
              )}
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white outline-none focus:border-lime/30 transition-all font-mono text-sm" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white outline-none focus:border-lime/30 transition-all font-mono text-sm" placeholder="••••••••" required />
              </div>
              <GlowButton variant="primary" size="lg" className="w-full" onClick={() => {}}>
                {loading ? 'Processing...' : mode === 'login' ? 'Enter Portal' : 'Create Account'}
              </GlowButton>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs font-mono text-text-muted">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <button className="w-full py-3 rounded-xl glass border border-white/[0.06] text-sm font-display font-semibold hover:border-white/10 transition-all flex items-center justify-center gap-3">
              <span className="text-lg">G</span>
              Continue with Google
            </button>

            <p className="text-center mt-6 text-sm text-text-secondary">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-lime hover:underline font-semibold">
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
