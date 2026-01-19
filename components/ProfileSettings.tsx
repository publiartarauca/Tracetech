
import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Lock, Save, ShieldCheck } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdateProfile: (updatedData: Partial<User>) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    newPassword: '',
    confirmPassword: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    const updates: Partial<User> = {
      name: formData.name,
      username: formData.username
    };
    if (formData.newPassword) {
      updates.password = formData.newPassword;
    }

    onUpdateProfile(updates);
    setMsg({ type: 'success', text: 'Perfil actualizado con éxito.' });
    setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <UserIcon size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración de Perfil</h1>
          <p className="text-slate-500">Gestiona tu información personal y seguridad de cuenta.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nombre de Usuario</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock size={20} className="text-blue-500" />
              Seguridad y Contraseña
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Dejar en blanco para no cambiar"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Dejar en blanco para no cambiar"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          {msg.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in zoom-in-95 ${
              msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              <ShieldCheck size={18} />
              {msg.text}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end">
          <button 
            type="submit"
            className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Save size={20} />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
