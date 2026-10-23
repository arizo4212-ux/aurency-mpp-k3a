import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role: UserRole, port: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginQuickDemo: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, { email: string; name: string; role: UserRole; port: string; label: string; desc: string }> = {
  admin: {
    email: 'admin.pelabuhan@nusavessel.id',
    name: 'Ir. Raden Santoso (Kepala Operasional Pelabuhan)',
    role: 'admin',
    port: 'Pelabuhan Merak - Bakauheni',
    label: 'Super Admin Operasional',
    desc: 'Akses penuh seluruh Master Data, Transaksi, Laporan & Pengaturan Sistem',
  },
  ticket_officer: {
    email: 'petugas.tiket@nusavessel.id',
    name: 'Dewi Anggraeni, S.Kom',
    role: 'ticket_officer',
    port: 'Terminal Penumpang Gate 1',
    label: 'Petugas Tiket & Manifest',
    desc: 'Akses pendaftaran tiket penumpang, boarding pass & manifest pelayaran',
  },
  cargo_officer: {
    email: 'perwira.kargo@nusavessel.id',
    name: 'Kapten Dedi Kurniawan (Cargo Officer)',
    role: 'cargo_officer',
    port: 'Dermaga Muatan & Ro-Ro Bay',
    label: 'Perwira Muatan & Logistik',
    desc: 'Akses penimbangan truk, kargo kontainer, Dangerous Goods & palka kapal',
  },
  captain: {
    email: 'nahkoda.kapal@nusavessel.id',
    name: 'Capt. Hendra Wicaksono, M.Mar',
    role: 'captain',
    port: 'KMP Dharma Rucitra VII (Bridge)',
    label: 'Nahkoda / Kapten Kapal',
    desc: 'Akses status pelayaran, log posisi kapal, kecepatan & cuaca laut',
  },
  harbor_master: {
    email: 'syahbandar@nusavessel.id',
    name: 'Capt. Agus Budi Santoso (Syahbandar KSOP)',
    role: 'harbor_master',
    port: 'Kantor Otoritas Pelabuhan & KSOP',
    label: 'Syahbandar / Otoritas Pelabuhan',
    desc: 'Verifikasi kelaiklautan kapal, manifest resmi & persetujuan berlayar (SPB)',
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or state
  const syncUserProfile = async (user: User, fallbackRole?: UserRole, fallbackName?: string, fallbackPort?: string) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      } else {
        // Create new user profile in Firestore
        const profile: UserProfile = {
          id: user.uid,
          email: user.email || 'user@nusavessel.id',
          displayName: fallbackName || user.displayName || user.email?.split('@')[0] || 'Petugas Maritim',
          role: fallbackRole || 'admin',
          portLocation: fallbackPort || 'Pelabuhan Merak - Bakauheni',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, profile);
        setUserProfile(profile);
      }
    } catch (e) {
      console.warn('Unable to sync user profile directly from Firestore, using local session profile:', e);
      setUserProfile({
        id: user.uid,
        email: user.email || 'user@nusavessel.id',
        displayName: fallbackName || user.displayName || 'Petugas Maritim',
        role: fallbackRole || 'admin',
        portLocation: fallbackPort || 'Pelabuhan Utama',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      // If user doesn't exist yet, help auto-create for seamless developer/user experience
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, pass);
          await syncUserProfile(newCred.user, 'admin', email.split('@')[0]);
          return;
        } catch (innerErr) {
          throw err;
        }
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: UserRole, port: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    await syncUserProfile(cred.user, role, name, port);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(cred.user, 'admin', cred.user.displayName || 'Google Operator');
  };

  const loginQuickDemo = async (role: UserRole) => {
    const demo = DEMO_USERS[role];
    const password = 'PasswordNusa123!';
    try {
      // Try signing in
      const cred = await signInWithEmailAndPassword(auth, demo.email, password);
      await syncUserProfile(cred.user, demo.role, demo.name, demo.port);
    } catch (err: any) {
      // If not exists yet in this firebase project, create it automatically!
      try {
        const cred = await createUserWithEmailAndPassword(auth, demo.email, password);
        await updateProfile(cred.user, { displayName: demo.name });
        await syncUserProfile(cred.user, demo.role, demo.name, demo.port);
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Fallback to anonymous sign-in with the demo profile
          const anonCred = await signInAnonymously(auth);
          await syncUserProfile(anonCred.user, demo.role, demo.name, demo.port);
        } else {
          // If Firebase Auth has email restrictions, sign in anonymously and attach demo role
          const anonCred = await signInAnonymously(auth);
          await syncUserProfile(anonCred.user, demo.role, demo.name, demo.port);
        }
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginQuickDemo,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
