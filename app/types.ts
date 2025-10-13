// src/app/types.ts

// Primero, define los tipos base si los necesitas
export type OrderType = "PRE_AUTORIZACION" | "RECLAMO" | "SERVICIO";
export type OrderStatus = "PENDIENTE" | "AUTORIZADO" | "RECHAZADO" | "COMPLETADO" | "BORRADOR";
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
  preAuthorizationNumber: string | null; // Nuevo campo agregado
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

// Base común para todos los drafts
export interface BaseDraft {
  id?: number;
  creationDate: string | Date;
  orderNumber: string | number;
  type: OrderType;
  status?: OrderStatus;
  draft: true;
  
  // Campos comunes que pueden existir en todos los drafts
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
  
  // Archivos (pueden ser comunes)
  badgePhoto?: File | null | string;
  vinPhoto?: File | null | string;
  milagePhoto?: File | null | string;
  aditionalPartsPhoto?: File | null | string;
  orPhoto?: File | null | string;
  
  // Relaciones que pueden venir del backend
  customer?: Customer;
  vehicle?: Vehicle;
  user?: User;
  statusHistory?: OrderStatusHistory[];
  tasks?: OrderTask[];
  photos?: OrderPhoto[];
}

// Draft específico para Pre-Autorización
export interface PreAuthorizationDraft extends BaseDraft {
  type: "PRE_AUTORIZACION";
  preAuthorizationNumber: string | null;
}

// Draft específico para Reclamo
export interface ClaimDraft extends BaseDraft {
  type: "RECLAMO";
  claimNumber?: string;
  // ... otros campos específicos de reclamo que necesites
}

// Draft específico para Servicio
export interface ServiceDraft extends BaseDraft {
  type: "SERVICIO";
  service: string | null;
}

// Tipo unión para todos los drafts
export type Draft = PreAuthorizationDraft | ClaimDraft | ServiceDraft;

// Tipo para el formulario de creación (puede ser usado tanto para orders como drafts)
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
  // Campos para archivos
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

// Tipo para los filtros de búsqueda de drafts
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
