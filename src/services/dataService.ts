import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Ship, 
  Route, 
  Voyage, 
  Passenger, 
  Cargo, 
  TrackingLog, 
  AppNotification, 
  UserProfile 
} from '../types';

// =================== REAL-TIME SUBSCRIBERS ===================

export function subscribeShips(callback: (ships: Ship[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, 'ships');
  return onSnapshot(colRef, (snapshot) => {
    const list: Ship[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Ship);
    });
    // Sort by name
    list.sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  }, (error) => {
    onError?.(error as Error);
    handleFirestoreError(error, OperationType.GET, 'ships');
  });
}

export function subscribeRoutes(callback: (routes: Route[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, 'routes');
  return onSnapshot(colRef, (snapshot) => {
    const list: Route[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Route);
    });
    list.sort((a, b) => a.code.localeCompare(b.code));
    callback(list);
  }, (error) => {
    onError?.(error as Error);
    handleFirestoreError(error, OperationType.GET, 'routes');
  });
}

export function subscribeVoyages(callback: (voyages: Voyage[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, 'voyages');
  return onSnapshot(colRef, (snapshot) => {
    const list: Voyage[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Voyage);
    });
    list.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
    callback(list);
  }, (error) => {
    onError?.(error as Error);
    handleFirestoreError(error, OperationType.GET, 'voyages');
  });
}

export function subscribePassengers(callback: (passengers: Passenger[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, 'passengers');
  return onSnapshot(colRef, (snapshot) => {
    const list: Passenger[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Passenger);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    onError?.(error as Error);
    handleFirestoreError(error, OperationType.GET, 'passengers');
  });
}

export function subscribeCargo(callback: (cargoList: Cargo[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, 'cargo');
  return onSnapshot(colRef, (snapshot) => {
    const list: Cargo[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Cargo);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    onError?.(error as Error);
    handleFirestoreError(error, OperationType.GET, 'cargo');
  });
}

export function subscribeTrackingLogs(callback: (logs: TrackingLog[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, 'trackingLogs');
  return onSnapshot(colRef, (snapshot) => {
    const list: TrackingLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as TrackingLog);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    onError?.(error as Error);
    handleFirestoreError(error, OperationType.GET, 'trackingLogs');
  });
}

export function subscribeNotifications(callback: (notifications: AppNotification[]) => void, onError?: (err: Error) => void) {
  const colRef = collection(db, 'notifications');
  return onSnapshot(colRef, (snapshot) => {
    const list: AppNotification[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    onError?.(error as Error);
    handleFirestoreError(error, OperationType.GET, 'notifications');
  });
}

// =================== CRUD: SHIPS ===================

export async function createShip(shipData: Omit<Ship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = 'ships';
  try {
    const newDocRef = doc(collection(db, path));
    const now = new Date().toISOString();
    const payload: Ship = {
      ...shipData,
      id: newDocRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, payload);
    
    // Add audit log
    await addNotification({
      title: 'Armada Kapal Baru Terdaftar',
      message: `Kapal ${payload.name} (${payload.code}) berhasil ditambahkan ke armada operasional.`,
      type: 'info',
    });

    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateShip(id: string, updates: Partial<Ship>): Promise<void> {
  const path = `ships/${id}`;
  try {
    const docRef = doc(db, 'ships', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteShip(id: string): Promise<void> {
  const path = `ships/${id}`;
  try {
    await deleteDoc(doc(db, 'ships', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// =================== CRUD: ROUTES ===================

export async function createRoute(routeData: Omit<Route, 'id' | 'createdAt'>): Promise<string> {
  const path = 'routes';
  try {
    const newDocRef = doc(collection(db, path));
    const payload: Route = {
      ...routeData,
      id: newDocRef.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateRoute(id: string, updates: Partial<Route>): Promise<void> {
  const path = `routes/${id}`;
  try {
    await updateDoc(doc(db, 'routes', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteRoute(id: string): Promise<void> {
  const path = `routes/${id}`;
  try {
    await deleteDoc(doc(db, 'routes', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// =================== CRUD: VOYAGES ===================

export async function createVoyage(voyageData: Omit<Voyage, 'id' | 'currentPassengers' | 'currentCargoTons' | 'currentVehicles' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = 'voyages';
  try {
    const newDocRef = doc(collection(db, path));
    const now = new Date().toISOString();
    const payload: Voyage = {
      ...voyageData,
      id: newDocRef.id,
      currentPassengers: 0,
      currentCargoTons: 0,
      currentVehicles: 0,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, payload);

    await addNotification({
      title: 'Jadwal Pelayaran Diterbitkan',
      message: `Voyage ${payload.voyageNumber} (${payload.shipName}) rute ${payload.originPort} → ${payload.destinationPort} siap dibuka untuk boarding & muat kargo.`,
      type: 'info',
      voyageId: newDocRef.id,
    });

    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateVoyage(id: string, updates: Partial<Voyage>): Promise<void> {
  const path = `voyages/${id}`;
  try {
    await updateDoc(doc(db, 'voyages', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteVoyage(id: string): Promise<void> {
  const path = `voyages/${id}`;
  try {
    await deleteDoc(doc(db, 'voyages', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// =================== CRUD: PASSENGERS ===================

export async function createPassenger(passengerData: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>, allVoyages: Voyage[], allShips: Ship[]): Promise<string> {
  const path = 'passengers';
  try {
    const newDocRef = doc(collection(db, path));
    const now = new Date().toISOString();
    const payload: Passenger = {
      ...passengerData,
      id: newDocRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, payload);

    // Update voyage stats
    const voyage = allVoyages.find(v => v.id === passengerData.voyageId);
    if (voyage) {
      const newPaxCount = (voyage.currentPassengers || 0) + 1;
      await updateDoc(doc(db, 'voyages', voyage.id), {
        currentPassengers: newPaxCount,
        updatedAt: now,
      });

      // Capacity Alert
      const ship = allShips.find(s => s.id === voyage.shipId);
      if (ship && ship.maxPassengers > 0) {
        const ratio = newPaxCount / ship.maxPassengers;
        if (ratio >= 0.95) {
          await addNotification({
            title: 'PERINGATAN KAPASITAS PENUMPANG KRITIS',
            message: `Voyage ${voyage.voyageNumber} (${ship.name}) telah mencapai ${newPaxCount}/${ship.maxPassengers} penumpang (${Math.round(ratio * 100)}%). Segera tutup boarding!`,
            type: 'danger',
            voyageId: voyage.id,
          });
        } else if (ratio >= 0.85) {
          await addNotification({
            title: 'Kapasitas Penumpang Mendekati Penuh',
            message: `Voyage ${voyage.voyageNumber} (${ship.name}) telah terisi ${Math.round(ratio * 100)}% (${newPaxCount}/${ship.maxPassengers} pax).`,
            type: 'warning',
            voyageId: voyage.id,
          });
        }
      }
    }

    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updatePassenger(id: string, updates: Partial<Passenger>): Promise<void> {
  const path = `passengers/${id}`;
  try {
    await updateDoc(doc(db, 'passengers', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deletePassenger(id: string, voyageId: string, currentVoyages: Voyage[]): Promise<void> {
  const path = `passengers/${id}`;
  try {
    await deleteDoc(doc(db, 'passengers', id));
    
    // Decrement count
    const voyage = currentVoyages.find(v => v.id === voyageId);
    if (voyage && voyage.currentPassengers > 0) {
      await updateDoc(doc(db, 'voyages', voyage.id), {
        currentPassengers: Math.max(0, voyage.currentPassengers - 1),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// =================== CRUD: CARGO ===================

export async function createCargo(cargoData: Omit<Cargo, 'id' | 'createdAt' | 'updatedAt'>, allVoyages: Voyage[], allShips: Ship[]): Promise<string> {
  const path = 'cargo';
  try {
    const newDocRef = doc(collection(db, path));
    const now = new Date().toISOString();
    const payload: Cargo = {
      ...cargoData,
      id: newDocRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, payload);

    // Update voyage stats
    const voyage = allVoyages.find(v => v.id === cargoData.voyageId);
    if (voyage) {
      const addedWeight = Number(cargoData.weightTons) || 0;
      const isVehicle = cargoData.cargoType === 'vehicle';
      const newCargoWeight = Number(((voyage.currentCargoTons || 0) + addedWeight).toFixed(2));
      const newVehicleCount = (voyage.currentVehicles || 0) + (isVehicle ? 1 : 0);

      await updateDoc(doc(db, 'voyages', voyage.id), {
        currentCargoTons: newCargoWeight,
        currentVehicles: newVehicleCount,
        updatedAt: now,
      });

      const ship = allShips.find(s => s.id === voyage.shipId);
      if (ship && ship.maxCargoTons > 0) {
        const ratio = newCargoWeight / ship.maxCargoTons;
        if (ratio >= 0.95) {
          await addNotification({
            title: 'PERINGATAN TONASE MUATAN OVERLOAD',
            message: `Muatan kapal ${ship.name} (Voyage ${voyage.voyageNumber}) telah mencapai ${newCargoWeight} Ton / Maks ${ship.maxCargoTons} Ton (${Math.round(ratio * 100)}%). Evaluasi batas sarat air (draught limit)!`,
            type: 'danger',
            voyageId: voyage.id,
          });
        }
      }

      // Check dangerous goods
      if (cargoData.isDangerousGoods) {
        await addNotification({
          title: 'PERHATIAN: Muatan Kargo Berbahaya Terdaftar (DG)',
          message: `Kargo DG (${cargoData.dangerousGoodsClass || 'Hazardous'}) No Manifest ${cargoData.manifestNumber} ditempatkan pada ${cargoData.deckPlacement}. Pastikan pemadam & ventilasi palka aktif.`,
          type: 'warning',
          voyageId: voyage.id,
        });
      }
    }

    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateCargo(id: string, updates: Partial<Cargo>): Promise<void> {
  const path = `cargo/${id}`;
  try {
    await updateDoc(doc(db, 'cargo', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCargo(id: string, cargoItem: Cargo, currentVoyages: Voyage[]): Promise<void> {
  const path = `cargo/${id}`;
  try {
    await deleteDoc(doc(db, 'cargo', id));
    
    // Decrement weight
    const voyage = currentVoyages.find(v => v.id === cargoItem.voyageId);
    if (voyage) {
      const removedWeight = Number(cargoItem.weightTons) || 0;
      const wasVehicle = cargoItem.cargoType === 'vehicle';
      await updateDoc(doc(db, 'voyages', voyage.id), {
        currentCargoTons: Math.max(0, Number(((voyage.currentCargoTons || 0) - removedWeight).toFixed(2))),
        currentVehicles: Math.max(0, (voyage.currentVehicles || 0) - (wasVehicle ? 1 : 0)),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// =================== TRACKING LOGS ===================

export async function addTrackingLog(logData: Omit<TrackingLog, 'id' | 'createdAt'>): Promise<string> {
  const path = 'trackingLogs';
  try {
    const newDocRef = doc(collection(db, path));
    const payload: TrackingLog = {
      ...logData,
      id: newDocRef.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDocRef, payload);

    // If event is departure or arrival, push a system notification
    if (logData.eventType.toLowerCase().includes('berangkat')) {
      await addNotification({
        title: 'Kapal Telah Lepas Tali (Departed)',
        message: `${logData.locationName}: Kapal dinyatakan berangkat. Kecepatan ${logData.speedKnots || 14} knots.`,
        type: 'info',
        voyageId: logData.voyageId,
      });
    } else if (logData.eventType.toLowerCase().includes('tiba') || logData.eventType.toLowerCase().includes('sandar')) {
      await addNotification({
        title: 'Kapal Telah Bersandar di Dermaga',
        message: `${logData.locationName}: Kapal bersandar dengan aman. Proses penurunan penumpang & pembongkaran kargo dimulai.`,
        type: 'success',
        voyageId: logData.voyageId,
      });
    }

    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// =================== NOTIFICATIONS ===================

export async function addNotification(notification: {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  voyageId?: string;
}): Promise<string> {
  const path = 'notifications';
  try {
    const newDocRef = doc(collection(db, path));
    const payload: AppNotification = {
      ...notification,
      id: newDocRef.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function markAllNotificationsAsRead(notifications: AppNotification[]): Promise<void> {
  for (const n of notifications) {
    if (!n.isRead) {
      await markNotificationAsRead(n.id);
    }
  }
}

// =================== DATABASE SEEDER ===================

export async function seedInitialMaritimeData(): Promise<void> {
  const shipsSnap = await getDocs(collection(db, 'ships'));
  if (!shipsSnap.empty) {
    console.log('Database already initialized. Skipping seed.');
    return;
  }

  console.log('Seeding initial maritime database...');

  // 1. Ships
  const initialShips: Omit<Ship, 'id'>[] = [
    {
      code: 'KMP-DR7',
      name: 'KMP Dharma Rucitra VII',
      type: 'ferry_roro',
      grossTonnage: 12500,
      maxPassengers: 850,
      maxCargoTons: 1500,
      maxVehicles: 180,
      yearBuilt: 2019,
      captainName: 'Capt. Hendra Wicaksono, M.Mar',
      status: 'sailing',
      currentRoute: 'Merak - Bakauheni',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'KM-KLM',
      name: 'KM Kelimutu Express',
      type: 'passenger_express',
      grossTonnage: 6800,
      maxPassengers: 920,
      maxCargoTons: 400,
      maxVehicles: 0,
      yearBuilt: 2017,
      captainName: 'Capt. Bambang Suryono',
      status: 'active',
      currentRoute: 'Tanjung Perak - Makassar',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'KM-MRT08',
      name: 'KM Meratus Sumbawa',
      type: 'cargo_container',
      grossTonnage: 15400,
      maxPassengers: 12,
      maxCargoTons: 8500,
      maxVehicles: 0,
      yearBuilt: 2021,
      captainName: 'Capt. Richard Tan',
      status: 'docked',
      currentRoute: 'Tanjung Priok - Belawan',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'KMP-BTM02',
      name: 'KMP Batumandi',
      type: 'ferry_roro',
      grossTonnage: 5400,
      maxPassengers: 550,
      maxCargoTons: 850,
      maxVehicles: 95,
      yearBuilt: 2018,
      captainName: 'Capt. Agus Supriyanto',
      status: 'active',
      currentRoute: 'Ketapang - Gilimanuk',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'KMP-PL3',
      name: 'KMP Portlink III Executive',
      type: 'ferry_roro',
      grossTonnage: 15800,
      maxPassengers: 1100,
      maxCargoTons: 2200,
      maxVehicles: 240,
      yearBuilt: 2022,
      captainName: 'Capt. Muhammad Iqbal, S.ST.Pel',
      status: 'active',
      currentRoute: 'Merak - Bakauheni',
      createdAt: new Date().toISOString(),
    }
  ];

  const createdShips: Ship[] = [];
  for (const s of initialShips) {
    const ref = doc(collection(db, 'ships'));
    const item: Ship = { ...s, id: ref.id };
    await setDoc(ref, item);
    createdShips.push(item);
  }

  // 2. Routes
  const initialRoutes: Omit<Route, 'id'>[] = [
    {
      code: 'RT-MRK-BKH',
      originPort: 'Pelabuhan Merak (Banten)',
      destinationPort: 'Pelabuhan Bakauheni (Lampung)',
      distanceNauticalMiles: 16.5,
      estTravelHours: 1.8,
      basePassengerPrice: 48000,
      baseCargoPricePerTon: 220000,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'RT-KTP-GLM',
      originPort: 'Pelabuhan Ketapang (Banyuwangi)',
      destinationPort: 'Pelabuhan Gilimanuk (Bali)',
      distanceNauticalMiles: 3.2,
      estTravelHours: 0.8,
      basePassengerPrice: 22000,
      baseCargoPricePerTon: 180000,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'RT-SUB-UPG',
      originPort: 'Tanjung Perak (Surabaya)',
      destinationPort: 'Soekarno-Hatta (Makassar)',
      distanceNauticalMiles: 480,
      estTravelHours: 32,
      basePassengerPrice: 310000,
      baseCargoPricePerTon: 750000,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'RT-TJP-BLW',
      originPort: 'Tanjung Priok (Jakarta)',
      destinationPort: 'Pelabuhan Belawan (Medan)',
      distanceNauticalMiles: 790,
      estTravelHours: 48,
      basePassengerPrice: 420000,
      baseCargoPricePerTon: 890000,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      code: 'RT-PDB-LMB',
      originPort: 'Padangbai (Bali)',
      destinationPort: 'Lembar (Lombok)',
      distanceNauticalMiles: 38,
      estTravelHours: 4.5,
      basePassengerPrice: 65000,
      baseCargoPricePerTon: 280000,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
  ];

  const createdRoutes: Route[] = [];
  for (const r of initialRoutes) {
    const ref = doc(collection(db, 'routes'));
    const item: Route = { ...r, id: ref.id };
    await setDoc(ref, item);
    createdRoutes.push(item);
  }

  // 3. Voyages
  const ship1 = createdShips[0]; // KMP Dharma Rucitra VII
  const route1 = createdRoutes[0]; // Merak - Bakauheni

  const ship2 = createdShips[1]; // KM Kelimutu
  const route2 = createdRoutes[2]; // Surabaya - Makassar

  const now = new Date();
  const dep1 = new Date(now.getTime() - 45 * 60 * 1000).toISOString();
  const arr1 = new Date(now.getTime() + 65 * 60 * 1000).toISOString();

  const dep2 = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
  const arr2 = new Date(now.getTime() + 34 * 3600 * 1000).toISOString();

  const initialVoyages: Omit<Voyage, 'id'>[] = [
    {
      voyageNumber: 'VY-2026-MRK-084',
      shipId: ship1.id,
      shipName: ship1.name,
      routeId: route1.id,
      originPort: route1.originPort,
      destinationPort: route1.destinationPort,
      departureTime: dep1,
      arrivalTime: arr1,
      status: 'sailing',
      currentPassengers: 428,
      currentCargoTons: 890.5,
      currentVehicles: 84,
      notes: 'Pelayaran reguler Selat Sunda. Kondisi mesin prima, gelombang laut 0.8 meter.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      voyageNumber: 'VY-2026-SUB-019',
      shipId: ship2.id,
      shipName: ship2.name,
      routeId: route2.id,
      originPort: route2.originPort,
      destinationPort: route2.destinationPort,
      departureTime: dep2,
      arrivalTime: arr2,
      status: 'boarding',
      currentPassengers: 615,
      currentCargoTons: 285.0,
      currentVehicles: 0,
      notes: 'Pintu palka bagasi terbuka, pemeriksaan identitas dan tiket sedang berlangsung di gate 2.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const createdVoyages: Voyage[] = [];
  for (const v of initialVoyages) {
    const ref = doc(collection(db, 'voyages'));
    const item: Voyage = { ...v, id: ref.id };
    await setDoc(ref, item);
    createdVoyages.push(item);
  }

  // 4. Passengers
  const v1 = createdVoyages[0];
  const initialPassengers: Omit<Passenger, 'id'>[] = [
    {
      voyageId: v1.id,
      ticketNumber: 'TKT-2026-00918',
      passengerName: 'Ahmad Faisal Pratama',
      idCardNumber: '3201124508920003',
      gender: 'L',
      ageCategory: 'dewasa',
      seatNumber: 'DEK-A-14',
      fareClass: 'bisnis',
      ticketPrice: 75000,
      bookingStatus: 'boarded',
      contactPhone: '081288921004',
      emergencyContact: '081299881122 (Istri)',
      createdAt: new Date().toISOString(),
    },
    {
      voyageId: v1.id,
      ticketNumber: 'TKT-2026-00919',
      passengerName: 'Siti Nurhaliza',
      idCardNumber: '3201127810940001',
      gender: 'P',
      ageCategory: 'dewasa',
      seatNumber: 'DEK-A-15',
      fareClass: 'bisnis',
      ticketPrice: 75000,
      bookingStatus: 'boarded',
      contactPhone: '081377889900',
      emergencyContact: '081288921004 (Suami)',
      createdAt: new Date().toISOString(),
    },
    {
      voyageId: v1.id,
      ticketNumber: 'TKT-2026-00920',
      passengerName: 'Dwi Kurniawan',
      idCardNumber: '1802091402880005',
      gender: 'L',
      ageCategory: 'dewasa',
      seatNumber: 'DEK-B-42',
      fareClass: 'ekonomi',
      ticketPrice: 48000,
      bookingStatus: 'boarded',
      contactPhone: '085712345678',
      createdAt: new Date().toISOString(),
    },
    {
      voyageId: v1.id,
      ticketNumber: 'TKT-2026-00921',
      passengerName: 'Rina Kusuma Dewi',
      idCardNumber: '3174095504950002',
      gender: 'P',
      ageCategory: 'dewasa',
      seatNumber: 'VIP-03',
      fareClass: 'vip',
      ticketPrice: 120000,
      bookingStatus: 'boarded',
      contactPhone: '08119876543',
      createdAt: new Date().toISOString(),
    }
  ];

  for (const p of initialPassengers) {
    const ref = doc(collection(db, 'passengers'));
    await setDoc(ref, { ...p, id: ref.id });
  }

  // 5. Cargo
  const initialCargo: Omit<Cargo, 'id'>[] = [
    {
      voyageId: v1.id,
      manifestNumber: 'CRG-2026-MRK-001',
      cargoType: 'vehicle',
      description: 'Truk Tronton Logistik Sembako & Minyak Goreng',
      senderName: 'PT Indofood Sukses Makmur',
      receiverName: 'Gudang Distribusi Lampung Tengah',
      weightTons: 28.5,
      vehiclePlateNumber: 'B 9482 UEN',
      deckPlacement: 'Main Deck - Bay C1',
      isDangerousGoods: false,
      handlingNotes: 'Muatan berat, ganjal roda dan ikat lashing rantai standar KSOP.',
      fee: 2850000,
      status: 'loaded',
      createdAt: new Date().toISOString(),
    },
    {
      voyageId: v1.id,
      manifestNumber: 'CRG-2026-MRK-002',
      cargoType: 'vehicle',
      description: 'Bus Antar Kota Antar Provinsi (AKAP) ALS',
      senderName: 'PT Antar Lintas Sumatera',
      receiverName: 'Terminal Rajabasa Lampung',
      weightTons: 14.2,
      vehiclePlateNumber: 'BK 7119 DJ',
      deckPlacement: 'Main Deck - Bay A2',
      isDangerousGoods: false,
      handlingNotes: 'Penumpang bus turun dan menempati ruang tunggu kapal.',
      fee: 1750000,
      status: 'loaded',
      createdAt: new Date().toISOString(),
    },
    {
      voyageId: v1.id,
      manifestNumber: 'CRG-2026-MRK-003',
      cargoType: 'container',
      description: 'Kontainer Reefer 40ft (Daging Sapi Segar Dingin)',
      senderName: 'PT Sumber Pangan Nusantara',
      receiverName: 'Cold Storage Panjang Bandar Lampung',
      weightTons: 24.0,
      deckPlacement: 'Weather Deck - Reefer Point 04',
      isDangerousGoods: false,
      handlingNotes: 'Colokkan kabel power reefer 380V selama pelayaran (suhu -18°C).',
      fee: 4500000,
      status: 'loaded',
      createdAt: new Date().toISOString(),
    },
    {
      voyageId: v1.id,
      manifestNumber: 'CRG-2026-MRK-004',
      cargoType: 'dangerous_goods',
      description: 'Tabung Gas Oksigen Industri & Nitrogen Medis',
      senderName: 'PT Aneka Gas Industri Tbk',
      receiverName: 'RSUD Abdul Moeloek Lampung',
      weightTons: 8.4,
      vehiclePlateNumber: 'BE 8892 YK',
      deckPlacement: 'Open Deck - Hazardous Area H-1',
      isDangerousGoods: true,
      dangerousGoodsClass: 'IMDG Class 2.2 (Non-Flammable Gas)',
      handlingNotes: 'Wajib ventilasi terbuka, jauhkan dari sumber api dan knalpot mesin.',
      fee: 2100000,
      status: 'loaded',
      createdAt: new Date().toISOString(),
    }
  ];

  for (const c of initialCargo) {
    const ref = doc(collection(db, 'cargo'));
    await setDoc(ref, { ...c, id: ref.id });
  }

  // 6. Tracking Logs
  const initialLogs: Omit<TrackingLog, 'id'>[] = [
    {
      voyageId: v1.id,
      shipId: ship1.id,
      eventType: 'Lepas Tali (Cast Off)',
      locationName: 'Dermaga Eksekutif 6 Pelabuhan Merak',
      latitude: -5.9324,
      longitude: 105.9982,
      speedKnots: 4.2,
      weatherCondition: 'Cerah Berawan, Angin 8 knot, Gelombang 0.6m',
      notes: 'Pintu rampa (ramp door) tertutup rapat, lashing kendaraan aman terkunci.',
      reporterName: 'Mualim I Bagus Santoso',
      createdAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
    },
    {
      voyageId: v1.id,
      shipId: ship1.id,
      eventType: 'Pelayaran Tengah Selat Sunda',
      locationName: 'Alur Laut Kepulauan Tempur - Selat Sunda TSS',
      latitude: -5.8712,
      longitude: 105.8521,
      speedKnots: 14.8,
      weatherCondition: 'Laut Tenang, Jarak Pandang >10 Mil Laut',
      notes: 'Berlayar di dalam koridor TSS (Traffic Separation Scheme) menuju Bakauheni.',
      reporterName: 'Mualim II Aditya Wardana',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    }
  ];

  for (const l of initialLogs) {
    const ref = doc(collection(db, 'trackingLogs'));
    await setDoc(ref, { ...l, id: ref.id });
  }

  // 7. Notifications
  const initialNotifications = [
    {
      title: 'Sistem Operasional Aktif',
      message: 'Koneksi real-time database maritim NusaVessel terhubung secara instan.',
      type: 'success' as const,
      isRead: false,
      createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Kargo Berbahaya Terdaftar (IMDG Class 2.2)',
      message: 'Tabung Gas Medis pada Voyage VY-2026-MRK-084 telah diverifikasi petugas safety.',
      type: 'warning' as const,
      voyageId: v1.id,
      isRead: false,
      createdAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
    },
    {
      title: 'Voyage VY-2026-MRK-084 Sedang Berlayar',
      message: 'KMP Dharma Rucitra VII melintas di Selat Sunda, estimasi sandar di Bakauheni 45 menit.',
      type: 'info' as const,
      voyageId: v1.id,
      isRead: false,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    }
  ];

  for (const n of initialNotifications) {
    const ref = doc(collection(db, 'notifications'));
    await setDoc(ref, { ...n, id: ref.id });
  }

  console.log('Maritime database successfully populated!');
}
