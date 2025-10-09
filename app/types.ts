// src/app/types.ts

// Primero, define los tipos base si los necesitas
export type OrderType = "PRE_AUTORIZACION" | "RECLAMO" | "SERVICIO";
export type OrderStatus = "PENDIENTE" | "AUTORIZADO" | "RECHAZADO" | "COMPLETADO";
export type InternalStatus =
  | ""
  | "PENDIENTE DE RECLAMO"
  | "RECLAMADO EN ORIGEN"
  | "APROBADO EN ORIGEN"
  | "RECHAZADO EN ORIGEN"
  | "COBRADO"
  | "NO RECLAMABLE A ORIGEN";

// Interfaces para los modelos relacionados
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Company {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string; // O name, según lo que uses en tu modelo
}

export interface Warranty {
  activationDate: string | Date;
}

export interface Vehicle {
  vin: string;
  brand: string;
  model: string;
  engineNumber: string | null;
  warranty: Warranty | null; // Nullable porque puede no tener garantía
}

export interface OrderPhoto {
  id: number;
  type: string;
  url: string;
}

export interface Part {
  code: string;
  description: string;
}

export interface OrderTaskPart {
  id: number;
  quantity: number;
  description: string | null;
  part: Part; // La parte del repuesto
}

export interface OrderTask {
  id: number;
  description: string;
  hoursCount: number;
  parts: OrderTaskPart[];
}

export interface OrderStatusHistory {
  id: number;
  status: OrderStatus;
  changedAt: string | Date;
}

// Interfaz principal de la Orden, reflejando la consulta de Prisma
export interface Order {
  preAuthorizationNumber: string;
  id: number;
  creationDate: string | Date;
  orderNumber: number;
  type: OrderType;
  status: OrderStatus;
  internalStatus: InternalStatus | null;
  actualMileage: number;
  diagnosis: string | null;
  additionalObservations: string | null;

  // Relaciones incluidas
  customer: Customer;
  company: Company;
  user: User;
  vehicle: Vehicle;
  statusHistory: OrderStatusHistory[];
  tasks: OrderTask[];
  photos: OrderPhoto[];
}


export interface CreateOrderData {
  orderNumber: string;
  customerName: string;
  vin: string;
  actualMileage: string;
  diagnosis: string;
  additionalObservations: string;
  tasks: {
    description: string;
    hoursCount: string;
    parts: {
      part: {
        code: string;
        description: string;
      }
    }[];
  }[];
  // Fotos vendrían después
}

export interface CreateOrderResult {
  success: boolean;
  order?: any;
  message?: string;
  errors?: Record<string, string>;
}

export type Certificate = {
  id: number;
  warranty: boolean;
  importDate: string;
  saleDate: string;
  vehicle: {
    vin: string;
    model: string;
    brand: string;
    year: string;
    engineNumber: string;
    certificateNumber: string;
    licensePlate: string;
    blocked: boolean;
    importDate?: string;
    type: string;
    warranty?: boolean;
  };
  company: {
    name: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    city: string;
  };
  user: {
    username: string;
  };
};

