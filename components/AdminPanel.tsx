
import React, { useState, useRef } from 'react';
import { TraceRecord, User, UserRole } from '../types';
import { 
  Plus, Trash2, Edit2, Save, X, 
  Users as UsersIcon, Settings, ClipboardList, 
  Check, FileUp, FileText, AlertCircle, Image as ImageIcon, Video, Youtube
} from 'lucide-react';

interface AdminPanelProps {
  records: TraceRecord[];
  users: User[];
  categories: string[];
  statuses: string[];
  onAdd: (record: Omit<TraceRecord, 'id'>) => void;
  onUpdate: (id: string, updatedData: Partial<TraceRecord>) => void;
  onDelete: (id: string) => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (id: string, updatedData: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onAddCategory: (cat: string) => void;
  onDeleteCategory: (cat: string) => void;
  onAddStatus: (status: string) => void;
  onDeleteStatus: (status: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  records, users, categories, statuses,
  onAdd, onUpdate, onDelete, 
  onAddUser, onUpdateUser, onDeleteUser,
  onAddCategory, onDeleteCategory,
  onAddStatus, onDeleteStatus
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'users' | 'config'>('records');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [newCat, setNewCat] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const initialRecordState: Partial<TraceRecord> = {
    code: '',
    date: new Date().toISOString().split('T')[0],
    category: categories[0] || '',
    description: '',
    status: statuses[0] || '',
    assignedUserId: users[0]?.id || '',
    pdfUrl: '',
    imageUrl: '',
    videoUrl: '',
    technicalDetails: ''
  };
  const [formData, setFormData] = useState<Partial<TraceRecord>>(initialRecordState);

  const [userFormData, setUserFormData] = useState<Partial<User>>({
    username: '',
    name: '',
    role: UserRole.CLIENT,
    company: '',
    password: ''
  });

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData(p => ({ ...p, pdfUrl: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData(p => ({ ...p, imageUrl: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleEditRecord = (record: TraceRecord) => {
    setEditingRecordId(record.id);
    setFormData({ ...record });
    setIsAdding(true);
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.code && formData.description) {
      if (editingRecordId) {
        onUpdate(editingRecordId, formData);
      } else {
        onAdd(formData as Omit<TraceRecord, 'id'>);
      }
      setIsAdding(false);
      setEditingRecordId(null);
      setFormData(initialRecordState);
    }
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (userFormData.username && userFormData.name) {
      if (editingUserId) {
        onUpdateUser(editingUserId, userFormData);
      } else {
        onAddUser({ id: `u-${Date.now()}`, ...userFormData } as User);
      }
      setIsAdding(false);
      setEditingUserId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-500">Gestión de trazabilidad técnica y activos multimedia.</p>
        </div>
        
        <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'records' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <ClipboardList size={18} />
            Registros
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <UsersIcon size={18} />
            Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Settings size={18} />
            Configuración
          </button>
        </div>
      </div>

      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => { setIsAdding(true); setEditingRecordId(null); setFormData(initialRecordState); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md"
            >
              <Plus size={20} />
              Nuevo Registro
            </button>
          </div>

          {isAdding && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-4">
              <div className="p-5 bg-slate-50 border-b flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {editingRecordId ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
                  {editingRecordId ? 'Editar Registro Multimedia' : 'Crear Registro Técnico'}
                </h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitRecord} className="p-8 space-y-8">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Código Referencia</label>
                    <input type="text" required className="w-full px-4 py-2 border rounded-xl" placeholder="TRC-2024-00X" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Fecha de Evento</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Categoría Técnica</label>
                    <select className="w-full px-4 py-2 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Estado Operativo</label>
                    <select className="w-full px-4 py-2 border rounded-xl font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Usuario Responsable</label>
                    <select className="w-full px-4 py-2 border rounded-xl" value={formData.assignedUserId} onChange={e => setFormData({...formData, assignedUserId: e.target.value})}>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.company || 'Interno'})</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Descripción Técnica</label>
                  <textarea required className="w-full px-4 py-3 border rounded-xl h-24 resize-none" placeholder="Detalle la actividad técnica realizada..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/>
                </div>

                {/* Multimedia y Archivos */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileUp size={18} className="text-blue-500" />
                    Multimedia y Documentación
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upload PDF */}
                    <div 
                      onClick={() => pdfInputRef.current?.click()}
                      className={`group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${formData.pdfUrl ? 'bg-emerald-50 border-emerald-200' : 'hover:bg-slate-50 border-slate-200'}`}
                    >
                      <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePdfChange} />
                      {formData.pdfUrl ? (
                        <div className="flex flex-col items-center">
                          <FileText className="text-emerald-500 mb-2" size={28} />
                          <span className="text-xs font-bold text-emerald-700">PDF ADJUNTO</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(p => ({...p, pdfUrl: ''})); }} className="mt-2 text-[10px] text-red-500 hover:underline">Eliminar</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileUp className="text-slate-400 group-hover:text-blue-500 mb-2" size={28} />
                          <span className="text-xs font-medium text-slate-500">Subir Informe PDF</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Image */}
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className={`group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${formData.imageUrl ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-200'}`}
                    >
                      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                      {formData.imageUrl ? (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg bg-cover bg-center mb-2 shadow-sm" style={{ backgroundImage: `url(${formData.imageUrl})` }} />
                          <span className="text-xs font-bold text-blue-700">IMAGEN CARGADA</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(p => ({...p, imageUrl: ''})); }} className="mt-2 text-[10px] text-red-500 hover:underline">Eliminar</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="text-slate-400 group-hover:text-blue-500 mb-2" size={28} />
                          <span className="text-xs font-medium text-slate-500">Subir Imagen JPG</span>
                        </div>
                      )}
                    </div>

                    {/* YouTube Link */}
                    <div className="border-2 border-slate-100 rounded-2xl p-6 flex flex-col justify-center">
                       <div className="flex items-center gap-2 mb-3 text-slate-600">
                          <Youtube size={20} className="text-red-500" />
                          <span className="text-xs font-bold">Video YouTube</span>
                       </div>
                       <input 
                        type="url" 
                        placeholder="https://youtube.com/..." 
                        className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-red-100"
                        value={formData.videoUrl}
                        onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                       />
                       {formData.videoUrl && <span className="text-[10px] text-emerald-600 font-bold mt-1">✓ URL detectada</span>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                  <button type="submit" className="px-10 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2">
                    <Save size={18} />
                    {editingRecordId ? 'Actualizar Registro' : 'Guardar Registro Técnico'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Ref / Código</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-center">Contenido</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-600 mono text-sm">{r.code}</div>
                        <div className="text-[10px] text-slate-400">{r.date}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black">{r.category}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-md border text-black">{r.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          {r.pdfUrl && <FileText size={16} className="text-emerald-500" />}
                          {r.imageUrl && <ImageIcon size={16} className="text-blue-500" />}
                          {r.videoUrl && <Youtube size={16} className="text-red-500" />}
                          {!r.pdfUrl && !r.imageUrl && !r.videoUrl && <span>-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditRecord(r)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16}/></button>
                          <button onClick={() => onDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Secciones de Usuarios y Configuración simplificadas para este bloque */}
      {activeTab === 'users' && (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <UsersIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Módulo de Usuarios Activo</h3>
            <p className="text-slate-500">Gestione accesos para Clientes y Operadores de campo.</p>
            <button className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold" onClick={() => setIsAdding(true)}>Añadir Usuario</button>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h4 className="font-bold text-slate-800 mb-4">Parámetros de Sistema</h4>
             <p className="text-sm text-slate-500">Defina los estados de flujo de trabajo y categorías de inspección.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
