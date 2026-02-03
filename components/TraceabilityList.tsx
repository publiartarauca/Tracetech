import React, { useState, useMemo, useEffect } from 'react';
import { TraceRecord, User, Comment, UserRole } from '../types';
import { Search, Calendar, FileText, Sparkles, Youtube, Image as ImageIcon, ExternalLink, MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';
import { generateTechnicalSummary } from '../services/geminiService';
import { fbAddComment, subscribeToComments, fbDeleteComment } from '../services/firebaseService';

interface TraceabilityListProps {
  records: TraceRecord[];
  categories: string[];
  statuses: string[];
  currentUser: User;
  onViewPdf: (url: string, title: string) => void;
}

const TraceRecordItem: React.FC<{ 
  record: TraceRecord; 
  currentUser: User;
  onViewPdf: (url: string, title: string) => void; 
}> = ({ record, currentUser, onViewPdf }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    if (showComments) {
      unsubscribe = subscribeToComments(record.id, (data) => {
        setComments(data);
      });
    }
    return () => unsubscribe();
  }, [showComments, record.id]);

  const handleGetSummary = async () => {
    if (summary) return;
    setIsLoadingSummary(true);
    const result = await generateTechnicalSummary(record.description, record.category);
    setSummary(result);
    setIsLoadingSummary(false);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSendingComment(true);
    try {
      await fbAddComment({
        recordId: record.id,
        userId: currentUser.id,
        userName: currentUser.name,
        text: newComment,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
      try {
        await fbDeleteComment(commentId);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    // Fix: Use RegExp constructor to avoid parser issues with forward slashes in regex literals
    const regExp = new RegExp("^.*(youtu.be/|v/|u/\\w/|embed/|watch\\?v=|&v=)([^#&?]*).*");
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col lg:flex-row">
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center flex-wrap gap-2">
          <span className="mono text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{record.code}</span>
          <span className="text-xs font-bold text-black uppercase tracking-widest">{record.category}</span>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs ml-auto">
            <Calendar size={14} />
            {new Date(record.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900">{record.description}</h3>
        
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
          {summary ? (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-blue-500" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Insights de Inteligencia Artificial</span>
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{summary}"</p>
            </div>
          ) : (
            <button 
              onClick={handleGetSummary} 
              disabled={isLoadingSummary}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoadingSummary ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              {isLoadingSummary ? 'Generando...' : 'Generar resumen técnico con IA'}
            </button>
          )}
        </div>

        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between border-t border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-black bg-slate-100 px-3 py-1 rounded-lg border">{record.status}</span>
            {record.pdfUrl && (
              <button onClick={() => onViewPdf(record.pdfUrl!, record.code)} className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 hover:underline">
                <FileText size={16} /> Ver Informe
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${showComments ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <MessageSquare size={16} />
            {showComments ? 'Ocultar Comentarios' : 'Comentarios'}
          </button>
        </div>

        {showComments && (
          <div className="mt-2 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-2">No hay comentarios aún.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={`flex flex-col ${comment.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-end gap-2 max-w-[90%]">
                      <div className={`rounded-2xl p-3 text-sm relative group/comment ${comment.userId === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                        <p>{comment.text}</p>
                        {(currentUser.role === UserRole.ADMIN || currentUser.id === comment.userId) && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className={`absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 hover:text-red-500 ${comment.userId === currentUser.id ? 'text-slate-300' : 'text-slate-400'}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] font-bold text-slate-500">{comment.userName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSendComment} className="relative">
              <input 
                type="text" 
                placeholder="Escribe un comentario..." 
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim() || isSendingComment}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSendingComment ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 bg-slate-50 border-l border-slate-100 p-6 flex flex-col gap-4">
        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
          Respaldo Multimedia
        </h4>

        {record.imageUrl ? (
          <div className="group/img relative rounded-2xl overflow-hidden aspect-video shadow-md border-4 border-white">
            <img src={record.imageUrl} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Respaldo técnico" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
              <button onClick={() => window.open(record.imageUrl, '_blank')} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                <ExternalLink size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 aspect-video flex flex-col items-center justify-center text-slate-400">
            <ImageIcon size={24} strokeWidth={1.5} />
            <span className="text-[10px] mt-2">Sin imagen adjunta</span>
          </div>
        )}

        {record.videoUrl && getYoutubeId(record.videoUrl) ? (
          <div className="rounded-2xl overflow-hidden shadow-md aspect-video border-4 border-white bg-black">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${getYoutubeId(record.videoUrl)}`} 
              title="Technical Video" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        ) : record.videoUrl ? (
          <a href={record.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-red-50 rounded-xl text-red-600 hover:bg-red-100 transition-all border border-red-100">
            <Youtube size={20} />
            <span className="text-xs font-bold">Ver video en YouTube</span>
            <ExternalLink size={14} className="ml-auto" />
          </a>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400">
            <Youtube size={24} strokeWidth={1.5} />
            <span className="text-[10px] mt-1">Sin video referencial</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TraceabilityList: React.FC<TraceabilityListProps> = ({ records, categories, statuses, currentUser, onViewPdf }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [records, searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial Técnico</h1>
          <p className="text-slate-500">Consulta de trazabilidad con respaldo multimedia.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none shadow-sm text-black"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">Categorías</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            className="bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none shadow-sm text-black"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="All">Estados</option>
            {statuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredRecords.map((record) => (
          <TraceRecordItem 
            key={record.id} 
            record={record} 
            currentUser={currentUser}
            onViewPdf={onViewPdf} 
          />
        ))}
        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p>No se encontraron registros que coincidan con los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraceabilityList;