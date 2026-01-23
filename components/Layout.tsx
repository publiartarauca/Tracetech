
import React from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Menu, 
  X,
  FileText
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeView, setActiveView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'traceability', label: 'Trazabilidad', icon: History },
    ...(user.role === UserRole.ADMIN ? [{ id: 'admin', label: 'Administración', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight select-none">
            {/* Logo Simplificado para Sidebar */}
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center overflow-hidden">
              <span className="text-white text-xs font-black italic transform -skew-x-12">X</span>
            </div>
            <div className="flex flex-col leading-none">
               <span className="text-white font-black italic text-sm tracking-tighter">X-OVER</span>
               <span className="text-orange-500 font-bold text-[10px] tracking-widest">ENERGY</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate uppercase tracking-widest font-bold">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-2 font-bold text-lg">
           <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
             <span className="text-white text-[10px] font-black italic">X</span>
           </div>
           <span className="font-black italic">X-OVER</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/90 z-40 pt-16 flex flex-col p-4 animate-in fade-in duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg ${
                activeView === item.id ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              <item.icon size={24} />
              {item.label}
            </button>
          ))}
          <div className="mt-auto border-t border-slate-800 pt-4 flex flex-col gap-4">
             <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-slate-400 uppercase">{user.role}</p>
                </div>
             </div>
             <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-400"
              >
                <LogOut size={24} />
                Cerrar Sesión
              </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
