
import React, { useState, useEffect } from 'react';
import { User, TraceRecord, AppState, UserRole, Category, RecordStatus } from './types';
import { MOCK_USERS, MOCK_RECORDS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TraceabilityList from './components/TraceabilityList';
import AdminPanel from './components/AdminPanel';
import PdfModal from './components/PdfModal';
import ProfileSettings from './components/ProfileSettings';
import { LogIn, ShieldAlert, KeyRound, Loader2, User as UserIcon, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    // Intentar cargar estado completo de localStorage o usar mocks
    const saved = localStorage.getItem('trace_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, currentUser: null, isAuthenticated: false };
    }
    return {
      currentUser: null,
      records: MOCK_RECORDS,
      users: MOCK_USERS,
      categories: Object.values(Category),
      statuses: Object.values(RecordStatus),
      isAuthenticated: false
    };
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pdfModal, setPdfModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Guardar estado persistente (excepto sesión actual)
  useEffect(() => {
    const { currentUser, isAuthenticated, ...persistentData } = appState;
    localStorage.setItem('trace_state', JSON.stringify(persistentData));
  }, [appState]);

  // Recuperar sesión
  useEffect(() => {
    const savedUser = localStorage.getItem('trace_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAppState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    setTimeout(() => {
      const user = appState.users.find(u => u.username === loginForm.username && u.password === loginForm.password);
      if (user) {
        setAppState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
        localStorage.setItem('trace_user', JSON.stringify(user));
      } else {
        setLoginError('Credenciales incorrectas o usuario no encontrado.');
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  const handleLogout = () => {
    setAppState(prev => ({ ...prev, currentUser: null, isAuthenticated: false }));
    localStorage.removeItem('trace_user');
    setActiveView('dashboard');
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!appState.currentUser) return;
    const updatedUser = { ...appState.currentUser, ...updatedData };
    
    setAppState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
    localStorage.setItem('trace_user', JSON.stringify(updatedUser));
  };

  const handleUpdateUser = (id: string, updatedData: Partial<User>) => {
    setAppState(prev => {
      const newUsers = prev.users.map(u => u.id === id ? { ...u, ...updatedData } : u);
      if (prev.currentUser?.id === id) {
        const updatedCurrent = { ...prev.currentUser, ...updatedData };
        localStorage.setItem('trace_user', JSON.stringify(updatedCurrent));
        return { ...prev, users: newUsers, currentUser: updatedCurrent };
      }
      return { ...prev, users: newUsers };
    });
  };

  const handleAddRecord = (newRecord: Omit<TraceRecord, 'id'>) => {
    const record: TraceRecord = { ...newRecord, id: `r-${Date.now()}` };
    setAppState(prev => ({ ...prev, records: [record, ...prev.records] }));
  };

  const handleUpdateRecord = (id: string, updatedData: Partial<TraceRecord>) => {
    setAppState(prev => ({
      ...prev,
      records: prev.records.map(r => r.id === id ? { ...r, ...updatedData } : r)
    }));
  };

  const handleDeleteRecord = (id: string) => {
    setAppState(prev => ({ ...prev, records: prev.records.filter(r => r.id !== id) }));
  };

  const handleAddUser = (user: User) => {
    setAppState(prev => ({ ...prev, users: [...prev.users, user] }));
  };

  const handleDeleteUser = (id: string) => {
    setAppState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const handleAddCategory = (cat: string) => {
    setAppState(prev => ({ ...prev, categories: [...prev.categories, cat] }));
  };

  const handleDeleteCategory = (cat: string) => {
    setAppState(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
  };

  const handleAddStatus = (status: string) => {
    setAppState(prev => ({ ...prev, statuses: [...prev.statuses, status] }));
  };

  const handleDeleteStatus = (status: string) => {
    setAppState(prev => ({ ...prev, statuses: prev.statuses.filter(s => s !== status) }));
  };

  const visibleRecords = appState.currentUser?.role === UserRole.ADMIN 
    ? appState.records 
    : appState.records.filter(r => r.assignedUserId === appState.currentUser?.id);

  if (!appState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 text-white mb-6 shadow-2xl shadow-blue-500/20">
              <KeyRound size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">TraceTech</h1>
            <p className="text-slate-400 mt-2">Acceso Seguro a Trazabilidad Técnica</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Usuario</label>
                <input type="text" required className="w-full px-4 py-3 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
                <input type="password" required className="w-full px-4 py-3 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}/>
              </div>
              {loginError && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl border border-red-100">{loginError}</div>}
              <button type="submit" disabled={isLoggingIn} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all">
                {isLoggingIn ? <Loader2 className="animate-spin mx-auto" /> : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={appState.currentUser!} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setActiveView(activeView === 'profile' ? 'dashboard' : 'profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
            activeView === 'profile' 
              ? 'bg-slate-800 text-white hover:bg-black' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {activeView === 'profile' ? <ArrowLeft size={18} /> : <UserIcon size={18} />}
          {activeView === 'profile' ? 'Atrás' : 'Editar Mi Perfil'}
        </button>
      </div>

      {activeView === 'dashboard' && <Dashboard records={visibleRecords} />}
      {activeView === 'traceability' && (
        <TraceabilityList 
          records={visibleRecords} 
          categories={appState.categories}
          statuses={appState.statuses}
          onViewPdf={(url, title) => setPdfModal({ isOpen: true, url, title })}
        />
      )}
      {activeView === 'profile' && (
        <ProfileSettings 
          user={appState.currentUser!} 
          onUpdateProfile={handleUpdateProfile} 
        />
      )}
      {activeView === 'admin' && appState.currentUser?.role === UserRole.ADMIN && (
        <AdminPanel 
          records={appState.records} 
          users={appState.users}
          categories={appState.categories}
          statuses={appState.statuses}
          onAdd={handleAddRecord} 
          onUpdate={handleUpdateRecord}
          onDelete={handleDeleteRecord}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddStatus={handleAddStatus}
          onDeleteStatus={handleDeleteStatus}
        />
      )}

      <PdfModal isOpen={pdfModal.isOpen} onClose={() => setPdfModal({ ...pdfModal, isOpen: false })} pdfUrl={pdfModal.url} title={pdfModal.title} />
    </Layout>
  );
};

export default App;
