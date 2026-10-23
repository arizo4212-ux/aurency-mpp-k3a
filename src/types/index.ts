export type ShipType = 'ferry_roro' | 'cargo_container' | 'passenger_express' | 'bulk_carrier' | 'tanker';
export type ShipStatus = 'active' | 'sailing' | 'docked' | 'maintenance' | 'standby';

export interface Ship {
  id: string;
  code: string;
  name: string;
  type: ShipType;
  grossTonnage: number; // GT
  maxPassengers: number;
  maxCargoTons: number;
  maxVehicles: number;
  yearBuilt: number;
  captainName: string;
  status: ShipStatus;
  currentRoute?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RouteStatus = 'active' | 'closed' | 'weather_warning';

export interface Route {
  id: string;
  code: string;
  originPort: string;
  destinationPort: string;
  distanceNauticalMiles: number;
  estTravelHours: number;
  basePassengerPrice: number;
  baseCargoPricePerTon: number;
  status: RouteStatus;
  createdAt: string;
}

export type VoyageStatus = 'scheduled' | 'boarding' | 'sailing' | 'docked' | 'completed' | 'cancelled';

export interface Voyage {
  id: string;
  voyageNumber: string;
  shipId: string;
  shipName: string;
  routeId: string;
  originPort: string;
  destinationPort: string;
  departureTime: string;
  arrivalTime: string;
  status: VoyageStatus;
  currentPassengers: number;
  currentCargoTons: number;
  currentVehicles: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Gender = 'L' | 'P';
export type AgeCategory = 'dewasa' | 'anak' | 'bayi';
export type FareClass = 'ekonomi' | 'bisnis' | 'vip';
export type PassengerBookingStatus = 'booked' | 'checked_in' | 'boarded' | 'cancelled';

export interface Passenger {
  id: string;
  voyageId: string;
  ticketNumber: string;
  passengerName: string;
  idCardNumber: string; // NIK
  gender: Gender;
  ageCategory: AgeCategory;
  seatNumber: string;
  fareClass: FareClass;
  ticketPrice: number;
  bookingStatus: PassengerBookingStatus;
  contactPhone: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CargoType = 'vehicle' | 'container' | 'breakbulk' | 'dangerous_goods' | 'general_cargo';
export type CargoStatus = 'queued' | 'loaded' | 'in_transit' | 'unloaded' | 'claimed';

export interface Cargo {
  id: string;
  voyageId: string;
  manifestNumber: string;
  cargoType: CargoType;
  description: string;
  senderName: string;
  receiverName: string;
  weightTons: number;
  vehiclePlateNumber?: string;
  deckPlacement: string; // e.g. "Main Deck - Bay A3", "Lower Deck - Slot 12"
  isDangerousGoods: boolean;
  dangerousGoodsClass?: string; // e.g. "Class 3 (Flammable Liquid)"
  handlingNotes?: string;
  fee: number;
  status: CargoStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TrackingLog {
  id: string;
  voyageId: string;
  shipId?: string;
  eventType: string; // "Berangkat", "Posisi Tengah Laut", "Cuaca Buruk", "Palka Ditutup", "Tiba di Pelabuhan", "Bongkar Selesai"
  locationName: string;
  latitude?: number;
  longitude?: number;
  speedKnots?: number;
  weatherCondition?: string; // "Cerah, Ombak 0.5m", "Hujan Sedang, Ombak 1.5m", dll
  notes?: string;
  reporterName: string;
  createdAt: string;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'danger';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  voyageId?: string;
  isRead: boolean;
  createdAt: string;
}

export type UserRole = 'admin' | 'cargo_officer' | 'ticket_officer' | 'harbor_master' | 'captain';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  portLocation: string;
  createdAt: string;
}
