import React, { useState } from 'react';
import { 
  Anchor, 
  Ship, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building2, 
  Compass, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  Boxes,
  Ticket
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginQuickDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [portLocation, setPortLocation] = useState('Pelabuhan Merak - Bakauheni');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!displayName.trim()) {
          throw new Error('Nama lengkap wajib diisi');
        }
        await registerWithEmail(email, password, displayName, role, portLocation);
        setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke aplikasi...');
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Login berhasil! Mengakses dashboard...');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email atau password tidak cocok. Silakan periksa kembali atau gunakan Akses Cepat Demo.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email sudah terdaftar. Silakan login atau gunakan reset password.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password terlalu pendek (minimal 6 karakter).');
      } else {
        setErrorMsg(err.message || 'Terjadi kendala saat login. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (selectedRole: UserRole) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginQuickDemo(selectedRole);
    } catch (err: any) {
      console.error('Demo login error:', err);
      setErrorMsg('Gagal masuk dengan akun demo: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative maritime background glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-xl shadow-cyan-500/5 mb-4">
            <Ship className="w-10 h-10 animate-pulse text-cyan-400" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-700/50 rounded-full">
              Sistem Operasional Maritim Real-Time
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Online Cloud DB
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Nusa<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Vessel</span> Port & Cargo
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Sistem Manajemen Manifest Muatan Kargo & Penumpang Kapal Terintegrasi Database Cloud Real-Time tanpa Reload Page
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Akses Cepat 1-Klik (Siap Pakai untuk Semua Role)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Langsung Terhubung Online</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('admin')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 hover:border-cyan-500/60 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                      Super Admin Pelabuhan
                    </div>
                    <div className="text-[10px] text-slate-400">Master Data, Transaksi & Laporan</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('cargo_officer')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 hover:border-indigo-500/60 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-300">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
                      Perwira Muatan & Kargo
                    </div>
                    <div className="text-[10px] text-slate-400">Manifest Truk, Kontainer & DG</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('ticket_officer')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 hover:border-emerald-500/60 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-300">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300">
                      Petugas Tiket & Penumpang
                    </div>
                    <div className="text-[10px] text-slate-400">Tiket, Boarding & Manifest Pax</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('captain')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/40 hover:border-sky-500/60 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-sky-500/20 text-sky-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-sky-300">
                      Nahkoda Kapal (Captain)
                    </div>
                    <div className="text-[10px] text-slate-400">Status Pelayaran & Log Posisi Laut</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative inline-block px-3 text-xs uppercase tracking-wider text-slate-400 bg-slate-900">
              Atau Masuk dengan Akun Pribadi / Admin
            </div>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-700/60 text-red-200 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Tabs */}
          <div className="flex rounded-lg bg-slate-950 p-1 mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${!isRegister ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Masuk (Login Petugas / Admin)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${isRegister ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Daftar Petugas Baru (Register)
            </button>
          </div>

          {/* Login / Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap & Gelar</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="contoh: Ir. Bambang Sulistyo, M.M"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Peran / Jabatan (Role)</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="admin">Super Admin Pelabuhan</option>
                      <option value="cargo_officer">Perwira Muatan / Cargo Officer</option>
                      <option value="ticket_officer">Petugas Tiket & Manifest</option>
                      <option value="captain">Nahkoda Kapal (Captain)</option>
                      <option value="harbor_master">Syahbandar KSOP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Lokasi Pelabuhan / Satgas</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={portLocation}
                        onChange={(e) => setPortLocation(e.target.value)}
                        placeholder="Pelabuhan Merak"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email / Username Petugas</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.pelabuhan@nusavessel.id"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : isRegister ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  Daftarkan Akun & Masuk Sistem
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Masuk ke Aplikasi NusaVessel
                </>
              )}
            </button>
          </form>

          {/* Google Sign In option */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={loginWithGoogle}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk Cepat dengan Google Akun
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Anchor className="w-3.5 h-3.5 text-cyan-400" />
            Standar Keselamatan Laut KSOP & Ditjen Hubla
          </span>
          <span>•</span>
          <span>Firestore Real-Time Engine</span>
        </div>
      </div>
    </div>
  );
};
