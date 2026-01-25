
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  OPERATOR = 'OPERATOR'
}

export enum Category {
  INSPECTION = 'Inspección Técnica',
  MAINTENANCE = 'Mantenimiento',
  REPAIR = 'Reparación',
  AUDIT = 'Auditoría'
}

export enum RecordStatus {
  ACTIVE = 'ACTIVO',
  CLOSED = 'CERRADO',
  REVIEW = 'EN REVISIÓN',
  PENDING = 'PENDIENTE'
}

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: UserRole;
  company?: string;
}

export interface Comment {
  id: string;
  recordId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface TraceRecord {
  id: string;
  code: string;
  date: string;
  category: string;
  description: string;
  status: string;
  assignedUserId: string;
  pdfUrl?: string;
  imageUrl?: string; // Nueva propiedad para imágenes JPG/PNG
  videoUrl?: string; // Nueva propiedad para URL de YouTube
  technicalDetails?: string;
}

export interface SystemEntity {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  type: 'CATEGORY' | 'STATUS';
  icon?: string; // Icono sugerido por IA o asignado manualmente
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  currentUser: User | null;
  records: TraceRecord[];
  users: User[];
  categories: string[]; // Nombres para dropdowns
  statuses: string[]; // Nombres para dropdowns
  systemCategories: SystemEntity[]; // Objetos completos para admin
  systemStatuses: SystemEntity[]; // Objetos completos para admin
  isAuthenticated: boolean;
}
