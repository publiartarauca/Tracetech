
import { UserRole, RecordStatus, Category, TraceRecord, User } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Administrador', role: UserRole.ADMIN, password: '1234' },
  { id: '2', username: 'cliente01', name: 'Juan Pérez', role: UserRole.CLIENT, company: 'Construcciones S.A.', password: '123' },
  { id: '3', username: 'sergio', name: 'Sergio Operador', role: UserRole.OPERATOR, company: 'X-Over Ops', password: '1234' },
];

export const MOCK_RECORDS: TraceRecord[] = [
  {
    id: 'r1',
    code: 'TRC-2024-001',
    date: '2024-03-15',
    category: 'Inspección Técnica',
    description: 'Inspección estructural de soportes nivel 4.',
    status: 'CERRADO',
    assignedUserId: '2',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    technicalDetails: 'Se detectó corrosión leve en el ala norte.'
  },
  {
    id: 'r2',
    code: 'TRC-2024-002',
    date: '2024-03-18',
    category: 'Mantenimiento',
    description: 'Cambio de filtros y lubricación de motores primarios.',
    status: 'ACTIVO',
    assignedUserId: '2',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

export const STATUS_COLORS: Record<string, string> = {
  'ACTIVO': 'bg-blue-100 text-blue-800 border-blue-200',
  'CERRADO': 'bg-green-100 text-green-800 border-green-200',
  'EN REVISIÓN': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'PENDIENTE': 'bg-gray-100 text-gray-800 border-gray-200',
};
