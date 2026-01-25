
import React, { useState } from 'react';
import { TraceRecord, User, UserRole, SystemEntity } from '../types';
import { 
  Plus, Trash2, Edit2, Save, X, 
  Users as UsersIcon, Settings, ClipboardList, 
  Check, FileText, AlertCircle, Image as ImageIcon, Video, Youtube,
  Database, Zap, Loader2, UserPlus, Shield, Building2, UploadCloud, Tag, Activity, ToggleLeft, ToggleRight,
  // Iconos para Categorías (Semánticos)
  Wrench, Hammer, HardHat, Truck, Box, ClipboardCheck, AlertTriangle, 
  Archive, BarChart3, Briefcase, Calendar, CheckCircle2, Clock, 
  Cog, Compass, Construction, Factory, FileSearch, Flame, Gauge, 
  Layers, LayoutDashboard, Lightbulb, MapPin, Microscope, Package, 
  PenTool, Ruler, Scale, Search, Siren, Thermometer, 
  Unlock, Warehouse, Wifi
} from 'lucide-react';
import { checkFirebaseConfig, uploadFile, seedSystemData } from '../services/firebaseService';
import { suggestCategoryIcon } from '../services/geminiService';

// Mapa de iconos disponibles para el sistema
const ICON_MAP: Record<string, React.ElementType> = {
  'Tag': Tag,
  'Activity': Activity,
  'Wrench': Wrench,
  'Hammer': Hammer,
  'HardHat': HardHat,
  'Truck': Truck,
  'Box': Box,
  'ClipboardCheck': ClipboardCheck,
  'AlertTriangle': AlertTriangle,
  'Archive': Archive,
  'BarChart3': BarChart3,
  'Briefcase': Briefcase,
  'Calendar': Calendar,
  'CheckCircle2': CheckCircle2,
  'Clock': Clock,
  'Cog': Cog,
  'Compass': Compass,
  'Construction': Construction,
  'Factory': Factory,
  'FileSearch': FileSearch,
  'Flame': Flame,
  'Gauge': Gauge,
  'Layers': Layers,
  'LayoutDashboard': LayoutDashboard,
  'Lightbulb': Lightbulb,
  'MapPin': MapPin,
  'Microscope': Microscope,
  'Package': Package,
  'PenTool': PenTool,
  'Ruler': Ruler,
  'Scale': Scale,
  'Search': Search,
  'Siren': Siren,
  'Thermometer': Thermometer,
  'Unlock': Unlock,
  'Warehouse': Warehouse,
  'Wifi': Wifi
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface AdminPanelProps {
  records: TraceRecord[];
  users: User[];
  categories: string[];
  statuses: string[];
  systemCategories?: SystemEntity[];
  systemStatuses?: SystemEntity[];
  onAdd: (record: Omit<TraceRecord, 'id'>) => void;
  onUpdate: (id: string, updatedData: Partial<TraceRecord>) => void;
  onDelete: (id: string) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, updatedData: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onAddCategory: (data: any) => void;
  onUpdateCategory?: (id: string, data: any) => void;
  onDeleteCategory: (id: string) => void;
  onAddStatus: (data: any) => void;
  onUpdateStatus?: (id: string, data: any) => void;
  onDeleteStatus: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  records, users, categories, statuses,
  systemCategories = [], systemStatuses = [],
  onAdd, onUpdate, onDelete, 
  onAddUser, onUpdateUser, onDeleteUser,
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddStatus, onUpdateStatus, onDeleteStatus
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'users' | 'config'>('records');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  
  // Config States
  const [configType, setConfigType] = useState<'CATEGORY' | 'STATUS'>('CATEGORY');
  const [configForm, setConfigForm] = useState({ name: '', description: '', isActive: true });
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  
  // File states
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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

  const initialUserState: Omit<User, 'id'> = {
    username: '',
    name: '',
    password: '',
    role: UserRole.CLIENT,
    company: ''
  };

  const [formData, setFormData] = useState<Partial<TraceRecord>>(initialRecordState);
  const [userFormData, setUserFormData] = useState<Omit<User, 'id'>>(initialUserState);

  const isConfigured = checkFirebaseConfig();

  const handleSeedData = async () => {
    if (!isConfigured) {
      alert("Primero debes configurar tu Firebase Config.");
      return;
    }
    setIsSeeding(true);
    const result = await seedSystemData(records, users); 
    setSeedMsg(result.message);
    setIsSeeding(false);
    setTimeout(() => setSeedMsg(''), 5000);
  };

  const handleEditRecord = (r: TraceRecord) => {
    setEditingRecordId(r.id);
    setSelectedPdf(null);
    setSelectedImage(null);
    setFormData({
      code: r.code,
      date: r.date,
      category: r.category,
      description: r.description,
      status: r.status,
      assignedUserId: r.assignedUserId,
      pdfUrl: r.pdfUrl || '',
      imageUrl: r.imageUrl || '',
      videoUrl: r.videoUrl || '',
      technicalDetails: r.technicalDetails || ''
    });
    setIsAdding(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'pdf') setSelectedPdf(e.target.files[0]);
      if (type === 'image') setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.code && formData.description) {
      setIsUploading(true);
      
      try {
        let finalPdfUrl = formData.pdfUrl;
        let finalImageUrl = formData.imageUrl;

        if (selectedPdf) {
          const path = `documents/${Date.now()}_${selectedPdf.name}`;
          finalPdfUrl = await uploadFile(selectedPdf, path);
        }

        if (selectedImage) {
          const path = `images/${Date.now()}_${selectedImage.name}`;
          finalImageUrl = await uploadFile(selectedImage, path);
        }

        const finalData = {
          ...formData,
          pdfUrl: finalPdfUrl,
          imageUrl: finalImageUrl
        };

        if (editingRecordId) {
          onUpdate(editingRecordId, finalData);
        } else {
          onAdd(finalData as Omit<TraceRecord, 'id'>);
        }
        
        setIsAdding(false);
        setEditingRecordId(null);
        setFormData(initialRecordState);
        setSelectedPdf(null);
        setSelectedImage(null);

      } catch (error) {
        console.error("Error uploading files:", error);
        alert("Error al subir archivos.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userFormData.username && userFormData.password && userFormData.name) {
      setIsSubmittingUser(true);
      try {
        await onAddUser(userFormData);
        setIsAddingUser(false);
        setUserFormData(initialUserState);
      } catch (err) {
        console.error("Error al crear usuario:", err);
      } finally {
        setIsSubmittingUser(false);
      }
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm.name) return;

    let finalData: any = { ...configForm, type: configType };

    if (configType === 'CATEGORY') {
      setIsGeneratingIcon(true);
      try {
        // AI Icon Generation
        const suggestedIcon = await suggestCategoryIcon(configForm.name, configForm.description, AVAILABLE_ICONS);
        finalData.icon = suggestedIcon;
        onAddCategory(finalData);
      } catch (error) {
        // Fallback
        finalData.icon = 'Tag';
        onAddCategory(finalData);
      } finally {
        setIsGeneratingIcon(false);
      }
    } else {
      onAddStatus(finalData);
    }
    setConfigForm({ name: '', description: '', isActive: true });
  };

  const renderIcon = (iconName: string | undefined, defaultIcon: React.ElementType) => {
    const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : defaultIcon;
    return <IconComponent size={20} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-500">Gestión de trazabilidad técnica y activos multimedia.</p>
        </div>
        
        <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
          <button onClick={() => setActiveTab('records')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'records' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><ClipboardList size={18} />Registros</button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><UsersIcon size={18} />Usuarios</button>
          <button onClick={() => setActiveTab('config')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Settings size={18} />Configuración</button>
        </div>
      </div>

      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isConfigured ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {isConfigured ? <Zap size={20} /> : <AlertCircle size={20} />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{isConfigured ? 'Firebase Conectado' : 'Firebase No Configurado'}</p>
                <p className="text-xs text-slate-500">Cloud Firestore & Storage Activos.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSeedData}
                disabled={isSeeding}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-sm"
              >
                {isSeeding ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
                Cargar Datos de Prueba
              </button>
              
              <button onClick={() => { setIsAdding(true); setEditingRecordId(null); setFormData(initialRecordState); setSelectedPdf(null); setSelectedImage(null); }} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md">
                <Plus size={16} /> Nuevo Registro
              </button>
            </div>
          </div>

          {isAdding && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-4">
              <div className="p-5 bg-slate-50 border-b flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">{editingRecordId ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />} {editingRecordId ? 'Editar Registro' : 'Crear Registro Técnico'}</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitRecord} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Código</label><input type="text" required className="w-full px-4 py-2 border rounded-xl" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}/></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Fecha</label><input type="date" required className="w-full px-4 py-2 border rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Categoría</label><select className="w-full px-4 py-2 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Estado</label><select className="w-full px-4 py-2 border rounded-xl font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>{statuses.map(st => <option key={st} value={st}>{st}</option>)}</select></div>
                   <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Usuario Asignado</label><select className="w-full px-4 py-2 border rounded-xl" value={formData.assignedUserId} onChange={e => setFormData({...formData, assignedUserId: e.target.value})}>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                </div>

                <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Descripción</label><textarea required className="w-full px-4 py-3 border rounded-xl h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/></div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2"><UploadCloud size={20} /> Archivos y Multimedia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><FileText size={14} /> Informe PDF</label>
                      <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'pdf')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                      {formData.pdfUrl && !selectedPdf && <p className="text-[10px] text-emerald-600 truncate flex items-center gap-1"><Check size={10} /> Archivo actual vinculado</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><ImageIcon size={14} /> Imagen Técnica</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                      {formData.imageUrl && !selectedImage && <p className="text-[10px] text-emerald-600 truncate flex items-center gap-1"><Check size={10} /> Imagen actual vinculada</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Youtube size={14} /> Video YouTube (URL)</label>
                      <div className="relative"><Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="https://youtube.com/..." className="w-full pl-10 pr-4 py-2 border rounded-xl" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} /></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 border rounded-xl font-medium hover:bg-slate-50 text-sm">Cancelar</button>
                  <button type="submit" disabled={isUploading} className="px-10 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2 text-sm disabled:opacity-50">
                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isUploading ? 'Subiendo Archivos...' : (editingRecordId ? 'Actualizar' : 'Guardar en Firebase')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Shield size={20} /></div>
              <div>
                <h3 className="font-bold text-slate-900">Gestión de Accesos</h3>
                <p className="text-xs text-slate-500">Control de clientes y personal técnico.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAddingUser(!isAddingUser)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all"
            >
              {isAddingUser ? <X size={16} /> : <UserPlus size={16} />}
              {isAddingUser ? 'Cerrar Formulario' : 'Nuevo Acceso'}
            </button>
          </div>

          {isAddingUser && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-4">
              <form onSubmit={handleSubmitUser} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Nombre Real</label><input type="text" required className="w-full px-4 py-2 border rounded-xl" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})}/></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Nombre de Usuario</label><input type="text" required className="w-full px-4 py-2 border rounded-xl" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})}/></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Contraseña</label><input type="password" required className="w-full px-4 py-2 border rounded-xl" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})}/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Rol del Usuario</label><select className="w-full px-4 py-2 border rounded-xl" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})}>
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select></div>
                  <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Empresa (Opcional)</label><div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" className="w-full pl-10 pr-4 py-2 border rounded-xl" value={userFormData.company} onChange={e => setUserFormData({...userFormData, company: e.target.value})}/></div></div>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={isSubmittingUser} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                    {isSubmittingUser ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSubmittingUser ? 'Creando...' : 'Crear Usuario en Cloud'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500">
                <tr><th className="px-6 py-4">Nombre Completo</th><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Rol</th><th className="px-6 py-4">Empresa</th><th className="px-6 py-4 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-bold">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{u.username}</td>
                    <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-md ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'OPERATOR' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.company || 'Personal Interno'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { if(window.confirm('¿Eliminar acceso?')) onDeleteUser(u.id); }} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Formulario */}
            <div className="w-full lg:w-1/3 space-y-4">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-2 bg-slate-100 rounded-lg"><Settings size={18} className="text-slate-700"/></div>
                   <h3 className="font-bold text-slate-800">Nueva Configuración</h3>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                  <button onClick={() => setConfigType('CATEGORY')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${configType === 'CATEGORY' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Categoría</button>
                  <button onClick={() => setConfigType('STATUS')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${configType === 'STATUS' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>Estado</button>
                </div>

                <form onSubmit={handleConfigSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                    <input type="text" required className="w-full px-3 py-2 border rounded-xl text-sm" placeholder={configType === 'CATEGORY' ? 'Ej: Inspección' : 'Ej: Activo'} value={configForm.name} onChange={e => setConfigForm({...configForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Breve descripción..." value={configForm.description} onChange={e => setConfigForm({...configForm, description: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button type="button" onClick={() => setConfigForm({...configForm, isActive: !configForm.isActive})} className={`${configForm.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                      {configForm.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                    <span className="text-xs font-bold text-slate-600">{configForm.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  
                  {configType === 'CATEGORY' && (
                    <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Zap size={12} className="text-blue-500"/>
                      Icono generado por IA automáticamente
                    </div>
                  )}

                  <button type="submit" disabled={isGeneratingIcon} className={`w-full py-2.5 rounded-xl text-white font-bold text-sm shadow-md mt-2 flex items-center justify-center gap-2 ${configType === 'CATEGORY' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    {isGeneratingIcon && <Loader2 className="animate-spin" size={16} />}
                    {isGeneratingIcon ? 'Analizando...' : `Guardar ${configType === 'CATEGORY' ? 'Categoría' : 'Estado'}`}
                  </button>
                </form>
              </div>
            </div>

            {/* Listas */}
            <div className="flex-1 space-y-6">
              
              {/* Categorías */}
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                  <Tag size={16} className="text-blue-500" />
                  <h4 className="font-bold text-slate-700 text-sm">Categorías del Sistema</h4>
                </div>
                <div className="divide-y max-h-64 overflow-y-auto">
                  {systemCategories?.map(cat => (
                    <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                           {renderIcon(cat.icon, Tag)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{cat.name}</p>
                          <p className="text-xs text-slate-500">{cat.description || 'Sin descripción'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded border ${cat.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500'}`}>{cat.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                         {onUpdateCategory && (
                           <button onClick={() => onUpdateCategory(cat.id, { isActive: !cat.isActive })} className="text-slate-400 hover:text-slate-600"><Edit2 size={14} /></button>
                         )}
                         <button onClick={() => { if(window.confirm('¿Eliminar?')) onDeleteCategory(cat.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {systemCategories?.length === 0 && <p className="p-4 text-center text-xs text-slate-400">No hay categorías configuradas.</p>}
                </div>
              </div>

              {/* Estados */}
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  <h4 className="font-bold text-slate-700 text-sm">Estados del Sistema</h4>
                </div>
                <div className="divide-y max-h-64 overflow-y-auto">
                  {systemStatuses?.map(st => (
                    <div key={st.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{st.name}</p>
                        <p className="text-xs text-slate-500">{st.description || 'Sin descripción'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded border ${st.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500'}`}>{st.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                         {onUpdateStatus && (
                           <button onClick={() => onUpdateStatus(st.id, { isActive: !st.isActive })} className="text-slate-400 hover:text-slate-600"><Edit2 size={14} /></button>
                         )}
                         <button onClick={() => { if(window.confirm('¿Eliminar?')) onDeleteStatus(st.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {systemStatuses?.length === 0 && <p className="p-4 text-center text-xs text-slate-400">No hay estados configurados.</p>}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
