
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

export interface AppState {
  currentUser: User | null;
  records: TraceRecord[];
  users: User[];
  categories: string[];
  statuses: string[];
  isAuthenticated: boolean;
}
