// src/app/types.ts

// Primero, define los tipos base si los necesitas
export type OrderType = "PRE_AUTORIZACION" | "RECLAMO" | "SERVICIO";
export type OrderStatus = "PENDIENTE" | "AUTORIZADO" | "RECHAZADO" | "COMPLETADO" | "OBSERVADO"  | "BORRADOR" | null;
export type InternalStatus =
  |  null
  | "PENDIENTE_RECLAMO"
  | "RECLAMO_EN_ORIGEN"
  | "APROBADO_EN_ORIGEN"
  | "RECHAZADO_EN_ORIGEN"
  | "CARGADO"
  | "NO_RECLAMABLE";

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
  username: string;
}

export interface Warranty {
  activationDate: string | Date;
}

export interface Vehicle {
  vin: string;
  brand: string;
  model: string;
  engineNumber: string | null;
  warranty: Warranty | null;
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
  part: Part;
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
  observation?: string;
}

// Interfaz principal de la Orden, reflejando la consulta de Prisma
export interface Order {
  preAuthorizationNumber: string | null;
  id: number;
  creationDate: string | Date;
  orderNumber: number;
  type: OrderType;
  status: OrderStatus;
  internalStatus: InternalStatus | null;
  actualMileage: number;
  diagnosis: string | null;
  additionalObservations: string | null;
  service: string | null;
  
  internalStatusObservation: string | null;
  originClaimNumber: string | undefined;
  laborRecovery: number | null;
  partsRecovery: number | null;

  // ✅ AGREGADO: Campo userId para identificar al creador
  userId?: number | null;
  companyId: number;

  // Relaciones incluidas
  customer: Customer;
  company: Company;
  user: User;
  vehicle: Vehicle;
  statusHistory: OrderStatusHistory[];
  tasks: OrderTask[];
  photos: OrderPhoto[];
}

// TIPOS PARA DRAFTS (BORRADORES)

export interface BaseDraft {
  id?: number;
  creationDate: string | Date;
  orderNumber: string | number;
  type: OrderType;
  status?: OrderStatus;
  draft: true;
  
  customerName?: string;
  vin?: string;
  warrantyActivation?: string;
  engineNumber?: string;
  model?: string;
  actualMileage?: string | number;
  diagnosis?: string;
  additionalObservations?: string;
  preAuthorizationNumber: string | null
  service?: string | null;
  
  badgePhoto?: File | null | string;
  vinPhoto?: File | null | string;
  milagePhoto?: File | null | string;
  aditionalPartsPhoto?: File | null | string;
  orPhoto?: File | null | string;
  
  customer?: Customer;
  vehicle?: Vehicle;
  user?: User;
  statusHistory?: OrderStatusHistory[];
  tasks?: OrderTask[];
  photos?: OrderPhoto[];
}

export interface PreAuthorizationDraft extends BaseDraft {
  type: "PRE_AUTORIZACION";
  preAuthorizationNumber: string | null;
}

export interface ClaimDraft extends BaseDraft {
  type: "RECLAMO";
  claimNumber?: string;
}

export interface ServiceDraft extends BaseDraft {
  type: "SERVICIO";
  service: string | null;
}

export type Draft = PreAuthorizationDraft | ClaimDraft | ServiceDraft;

export interface CreateOrderData {
  creationDate?: string;
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
  badgePhoto?: File | null;
  vinPhoto?: File | null;
  milagePhoto?: File | null;
  aditionalPartsPhoto?: File | null;
  orPhoto?: File | null;
}

export interface CreateOrderResult {
  success: boolean;
  order?: any;
  message?: string;
  errors?: Record<string, string>;
}

export interface CreateServiceResult {
  success: boolean;
  service?: any;
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

export interface DraftFilters {
  type?: OrderType;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface VehicleInfo {
  vin: string;
  warrantyActivation?: string;
  engineNumber?: string;
  model?: string;
}