/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MasterDataView } from './components/MasterDataView';
import { TransactionView } from './components/TransactionView';
import { TrackingView } from './components/TrackingView';
import { ReportsView } from './components/ReportsView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { 
  subscribeShips, 
  subscribeRoutes, 
  subscribeVoyages, 
  subscribePassengers, 
  subscribeCargo, 
  subscribeTrackingLogs, 
  subscribeNotifications,
  seedInitialMaritimeData 
} from './services/dataService';
import { testConnection } from './firebase';
import { 
  Ship as ShipModel, 
  Route as RouteModel, 
  Voyage, 
  Passenger, 
  Cargo, 
  TrackingLog, 
  AppNotification 
} from './types';
import { Ship, RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Direct modal trigger states from Dashboard
  const [openPassengerModalDirect, setOpenPassengerModalDirect] = useState(false);
  const [openCargoModalDirect, setOpenCargoModalDirect] = useState(false);
  const [openLogModalDirect, setOpenLogModalDirect] = useState(false);

  // Firestore Real-Time States
  const [ships, setShips] = useState<ShipModel[]>([]);
  const [routes, setRoutes] = useState<RouteModel[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [cargoList, setCargoList] = useState<Cargo[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Connection test on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Set up real-time listeners when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    let unmounted = false;

    // Real-time Firestore subscriptions
    const unsubShips = subscribeShips((data) => {
      if (unmounted) return;
      setShips(data);
      // If Firestore is completely empty on first launch, auto-seed with realistic Indonesian maritime data
      if (data.length === 0) {
        seedInitialMaritimeData();
      }
    });

    const unsubRoutes = subscribeRoutes((data) => {
      if (unmounted) return;
      setRoutes(data);
    });

    const unsubVoyages = subscribeVoyages((data) => {
      if (unmounted) return;
      setVoyages(data);
    });

    const unsubPassengers = subscribePassengers((data) => {
      if (unmounted) return;
      setPassengers(data);
    });

    const unsubCargo = subscribeCargo((data) => {
      if (unmounted) return;
      setCargoList(data);
    });

    const unsubLogs = subscribeTrackingLogs((data) => {
      if (unmounted) return;
      setTrackingLogs(data);
    });

    const unsubNotifs = subscribeNotifications((data) => {
      if (unmounted) return;
      setNotifications(data);
      setDataLoaded(true);
    });

    return () => {
      unmounted = true;
      unsubShips();
      unsubRoutes();
      unsubVoyages();
      unsubPassengers();
      unsubCargo();
      unsubLogs();
      unsubNotifs();
    };
  }, [currentUser]);

  const handleManualSeed = async () => {
    setSeeding(true);
    try {
      await seedInitialMaritimeData();
    } catch (err: any) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400">
        <Ship className="w-12 h-12 animate-bounce mb-3" />
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Menghubungkan ke Real-Time Database NusaVessel...</span>
        </div>
      </div>
    );
  }

  // Strict Login Gate: If not authenticated, always show LoginScreen
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
        onSeedData={handleManualSeed}
        seeding={seeding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            ships={ships}
            routes={routes}
            voyages={voyages}
            passengers={passengers}
            cargoList={cargoList}
            trackingLogs={trackingLogs}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewPassengerModal={() => {
              setActiveTab('transactions');
              setOpenPassengerModalDirect(true);
            }}
            onOpenNewCargoModal={() => {
              setActiveTab('transactions');
              setOpenCargoModalDirect(true);
            }}
            onOpenNewLogModal={() => {
              setActiveTab('tracking');
              setOpenLogModalDirect(true);
            }}
          />
        )}

        {activeTab === 'master' && (
          <MasterDataView
            ships={ships}
            routes={routes}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionView
            voyages={voyages}
            passengers={passengers}
            cargoList={cargoList}
            ships={ships}
            routes={routes}
            isPassengerModalOpenDirect={openPassengerModalDirect}
            onClosePassengerModalDirect={() => setOpenPassengerModalDirect(false)}
            isCargoModalOpenDirect={openCargoModalDirect}
            onCloseCargoModalDirect={() => setOpenCargoModalDirect(false)}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingView
            trackingLogs={trackingLogs}
            voyages={voyages}
            ships={ships}
            isNewLogModalOpenDirect={openLogModalDirect}
            onCloseNewLogModalDirect={() => setOpenLogModalDirect(false)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            voyages={voyages}
            passengers={passengers}
            cargoList={cargoList}
            ships={ships}
            routes={routes}
          />
        )}
      </main>

      {/* Real-time Operational Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
