
import React, { useState, useEffect, useMemo } from 'react';
import { User, TraceRecord, AppState, UserRole, Category, RecordStatus } from './types';
import { MOCK_USERS, MOCK_RECORDS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TraceabilityList from './components/TraceabilityList';
import AdminPanel from './components/AdminPanel';
import PdfModal from './components/PdfModal';
import ProfileSettings from './components/ProfileSettings';
import { LogIn, ShieldAlert, Loader2, User as UserIcon, ExternalLink, WifiOff, Cloud, Database, UserPlus, CheckCircle2, KeyRound } from 'lucide-react';
import { 
  db, 
  subscribeToCollection, 
  fbAddRecord, 
  fbUpdateRecord, 
  fbDeleteRecord,
  fbUpdateUser,
  fbAddUser,
  fbDeleteUser,
  seedSystemData
} from './services/firebaseService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    records: [],
    users: [],
    categories: Object.values(Category),
    statuses: Object.values(RecordStatus),
    isAuthenticated: false
  });

  const [activeView, setActiveView] = useState('dashboard');
  
  // Login States
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Register Admin States
  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', username: '', password: '', masterKey: '' });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // App States
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [useLocalMode, setUseLocalMode] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [pdfModal, setPdfModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const recordsToDisplay = useLocalMode ? MOCK_RECORDS : appState.records;
  const usersToDisplay = useLocalMode ? MOCK_USERS : appState.users;

  const visibleRecords = useMemo(() => {
    if (!appState.currentUser) return [];
    if (appState.currentUser.role === UserRole.ADMIN) return recordsToDisplay;
    return recordsToDisplay.filter(r => r.assignedUserId === appState.currentUser?.id);
  }, [appState.currentUser, recordsToDisplay]);

  useEffect(() => {
    if (useLocalMode) {
      setIsLoadingData(false);
      return;
    }

    const handleError = (error: any) => {
      console.error("Error Firestore:", error);
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setFirebaseError("Firestore ha rechazado la conexión (Permission Denied).");
      } else {
        setFirebaseError(`Error de conexión: ${error.message}`);
      }
      setIsLoadingData(false);
    };

    const unsubRecords = subscribeToCollection('records', 
      (records) => {
        setAppState(prev => ({ ...prev, records }));
        setIsLoadingData(false);
        setFirebaseError(null);
      }, 
      handleError
    );

    const unsubUsers = subscribeToCollection('users', 
      (users) => {
        setAppState(prev => ({ ...prev, users }));
        setFirebaseError(null);
      }, 
      handleError,
      'name'
    );

    return () => {
      unsubRecords();
      unsubUsers();
    };
  }, [useLocalMode]);

  useEffect(() => {
    const savedUser = localStorage.getItem('trace_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAppState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
      } catch (e) {
        localStorage.removeItem('trace_user');
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    setTimeout(() => {
      const usersToSearch = (appState.users.length > 0) ? appState.users : MOCK_USERS;
      const user = usersToSearch.find(u => 
        u.username === loginForm.username && u.password === loginForm.password
      );
      
      if (user) {
        setAppState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
        localStorage.setItem('trace_user', JSON.stringify(user));
      } else {
        setLoginError('Credenciales incorrectas o usuario no encontrado en la nube.');
      }
      setIsLoggingIn(false);
    }, 600);
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Validación básica
    if (!regForm.name || !regForm.username || !regForm.password) {
      setRegError('Todos los campos son obligatorios.');
      return;
    }

    // Validación de Clave Maestra (Simulación de seguridad)
    if (regForm.masterKey !== 'XOVER2024') {
      setRegError('Clave Maestra incorrecta. No tienes autorización.');
      return;
    }

    setIsLoggingIn(true); // Reutilizamos el estado de carga
    
    try {
      // Verificar si el usuario ya existe (simple check en frontend con la lista actual)
      const exists = appState.users.some(u => u.username === regForm.username);
      if (exists) {
        setRegError('El nombre de usuario ya está en uso.');
        setIsLoggingIn(false);
        return;
      }

      await fbAddUser({
        name: regForm.name,
        username: regForm.username,
        password: regForm.password,
        role: UserRole.ADMIN,
        company: 'X-OVER Administration'
      });

      setRegSuccess('¡Administrador creado con éxito!');
      setTimeout(() => {
        setIsRegistering(false);
        setLoginForm({ username: regForm.username, password: regForm.password });
        setRegForm({ name: '', username: '', password: '', masterKey: '' });
        setRegSuccess('');
      }, 1500);

    } catch (error: any) {
      setRegError('Error al crear usuario: ' + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInitialSeed = async () => {
    if(window.confirm("¿Restaurar usuarios? Se crearán: \n- admin / 1234 \n- sergio / 1234")) {
      setIsSeeding(true);
      try {
        const result = await seedSystemData(MOCK_RECORDS, MOCK_USERS);
        alert(result.message);
        window.location.reload();
      } catch (error) {
        alert("Error al inicializar.");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleLogout = () => {
    setAppState(prev => ({ ...prev, currentUser: null, isAuthenticated: false }));
    localStorage.removeItem('trace_user');
    setActiveView('dashboard');
  };

  const handleAddRecord = async (newRecord: Omit<TraceRecord, 'id'>) => {
    if (useLocalMode) return;
    try {
      await fbAddRecord(newRecord);
    } catch (e) { console.error(e); }
  };

  const handleUpdateRecord = async (id: string, updatedData: Partial<TraceRecord>) => {
    if (useLocalMode) return;
    try {
      await fbUpdateRecord(id, updatedData);
    } catch (e) { console.error(e); }
  };

  const handleDeleteRecord = async (id: string) => {
    if (useLocalMode) return;
    try {
      await fbDeleteRecord(id);
    } catch (e) { console.error(e); }
  };

  const handleAddUser = async (newUser: Omit<User, 'id'>) => {
    if (useLocalMode) return;
    try {
      await fbAddUser(newUser);
    } catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (id: string) => {
    if (useLocalMode) return;
    try {
      await fbDeleteUser(id);
    } catch (e) { console.error(e); }
  };

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    if (!appState.currentUser || useLocalMode) return;
    const updatedUser = { ...appState.currentUser, ...updatedData };
    try {
      await fbUpdateUser(updatedUser.id, updatedUser);
      setAppState(prev => ({ ...prev, currentUser: updatedUser }));
      localStorage.setItem('trace_user', JSON.stringify(updatedUser));
    } catch (e) { console.error(e); }
  };

  if (!appState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 z-0 pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl mb-8 inline-block border-4 border-white/10 ring-4 ring-blue-500/20">
               <div className="flex flex-col items-center leading-none select-none">
                  <div className="flex items-center">
                    <span className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter italic transform -skew-x-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                      X-OVER
                    </span>
                  </div>
                  <span className="text-3xl md:text-4xl font-bold text-orange-500 tracking-[0.2em] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    ENERGY
                  </span>
               </div>
            </div>
            
            <p className="text-blue-100 mt-2 text-xl font-medium italic tracking-wide">
              "Soluciones que aseguran el futuro"
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/50 backdrop-blur-sm transition-all duration-300">
            {isRegistering ? (
              <form onSubmit={handleRegisterAdmin} className="space-y-4 animate-in fade-in slide-in-from-right-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><UserPlus className="text-purple-600"/> Nuevo Admin</h2>
                  <button type="button" onClick={() => setIsRegistering(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                </div>
                
                <div className="space-y-1">
                  <input type="text" placeholder="Nombre Completo" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 outline-none" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})}/>
                </div>
                <div className="space-y-1">
                  <input type="text" placeholder="Usuario" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 outline-none" value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})}/>
                </div>
                <div className="space-y-1">
                  <input type="password" placeholder="Contraseña" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 outline-none" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})}/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Clave Maestra de Sistema</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="password" placeholder="Ingrese: XOVER2024" required className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 outline-none" value={regForm.masterKey} onChange={e => setRegForm({...regForm, masterKey: e.target.value})}/>
                  </div>
                </div>

                {regError && <div className="text-red-500 text-xs p-3 bg-red-50 rounded-xl border border-red-100 font-bold">{regError}</div>}
                {regSuccess && <div className="text-green-600 text-xs p-3 bg-green-50 rounded-xl border border-green-100 font-bold flex items-center gap-2"><CheckCircle2 size={16}/> {regSuccess}</div>}

                <button type="submit" disabled={isLoggingIn} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                  {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  {isLoggingIn ? 'Creando...' : 'Crear Administrador'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-left-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Usuario</label>
                  <input type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})}/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
                  <input type="password" required className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}/>
                </div>
                {loginError && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{loginError}</div>}
                
                <button type="submit" disabled={isLoggingIn} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
                  {isLoggingIn ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                  {isLoggingIn ? 'Verificando...' : 'Iniciar Sesión'}
                </button>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                   <button 
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
                  >
                    <UserPlus size={14} />
                    Crear Nuevo Admin
                  </button>

                  {!useLocalMode && (
                    <button 
                      type="button"
                      onClick={handleInitialSeed}
                      disabled={isSeeding}
                      className="text-xs text-slate-400 hover:text-blue-500 underline flex items-center gap-1"
                    >
                      {isSeeding ? <Loader2 className="animate-spin" size={12}/> : <Database size={12} />}
                      Restaurar (Default)
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={appState.currentUser!} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
      
      {firebaseError && !useLocalMode && (
        <div className="mb-6 animate-in slide-in-from-top-4">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-5">
              <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl"><ShieldAlert size={32} /></div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 text-lg">Configuración de Firebase Requerida</h4>
                <p className="text-sm text-amber-800 mt-2">Para habilitar la gestión de usuarios en la nube, asegúrate de haber configurado las Rules en tu consola.</p>
                <div className="mt-5 flex gap-3">
                  <button onClick={() => setUseLocalMode(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md"><WifiOff size={16} /> Usar Modo Local</button>
                  <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-50">Abrir Consola <ExternalLink size={16} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {useLocalMode && (
        <div className="mb-6 bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <WifiOff size={20} />
            <div>
              <p className="text-sm font-bold">Modo Local (Backup)</p>
              <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest">Sin conexión a Firebase</p>
            </div>
          </div>
          <button onClick={() => setUseLocalMode(false)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"><Cloud size={16} /></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isLoadingData && <Loader2 className="animate-spin text-blue-500" size={16} />}
          {!isLoadingData && !useLocalMode && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isLoadingData ? 'Sincronizando...' : useLocalMode ? 'Datos Locales' : 'Firebase Cloud'}</span>
        </div>
        <button onClick={() => setActiveView(activeView === 'profile' ? 'dashboard' : 'profile')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${activeView === 'profile' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}><UserIcon size={18} />{activeView === 'profile' ? 'Atrás' : 'Mi Perfil'}</button>
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
      {activeView === 'profile' && <ProfileSettings user={appState.currentUser!} onUpdateProfile={handleUpdateProfile} />}
      {activeView === 'admin' && appState.currentUser?.role === UserRole.ADMIN && (
        <AdminPanel 
          records={recordsToDisplay} 
          users={usersToDisplay}
          categories={appState.categories}
          statuses={appState.statuses}
          onAdd={handleAddRecord} 
          onUpdate={handleUpdateRecord}
          onDelete={handleDeleteRecord}
          onAddUser={handleAddUser}
          onUpdateUser={() => {}}
          onDeleteUser={handleDeleteUser}
          onAddCategory={() => {}}
          onDeleteCategory={() => {}}
          onAddStatus={() => {}}
          onDeleteStatus={() => {}}
        />
      )}

      <PdfModal isOpen={pdfModal.isOpen} onClose={() => setPdfModal({ ...pdfModal, isOpen: false })} pdfUrl={pdfModal.url} title={pdfModal.title} />
    </Layout>
  );
};

export default App;
