
import React, { useState, useMemo } from 'react';
import { TraceRecord } from '../types';
import { Search, Filter, Calendar, FileText, ChevronRight, Sparkles, Youtube, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { generateTechnicalSummary } from '../services/geminiService';

interface TraceabilityListProps {
  records: TraceRecord[];
  categories: string[];
  statuses: string[];
  onViewPdf: (url: string, title: string) => void;
}

const TraceabilityList: React.FC<TraceabilityListProps> = ({ records, categories, statuses, onViewPdf }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});

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

  const handleGetSummary = async (record: TraceRecord) => {
    if (summaries[record.id]) return;
    setLoadingSummaries(prev => ({ ...prev, [record.id]: true }));
    const summary = await generateTechnicalSummary(record.description, record.category);
    setSummaries(prev => ({ ...prev, [record.id]: summary }));
    setLoadingSummaries(prev => ({ ...prev, [record.id]: false }));
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filtros */}
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
          <div key={record.id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col lg:flex-row">
            
            {/* Contenido Técnico */}
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
                {summaries[record.id] ? (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles size={14} className="text-blue-500" />
                       <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Insights de Inteligencia Artificial</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{summaries[record.id]}"</p>
                  </div>
                ) : (
                  <button onClick={() => handleGetSummary(record)} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-all">
                    <Sparkles size={14} /> Generar resumen técnico con IA
                  </button>
                )}
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-black bg-slate-100 px-3 py-1 rounded-lg border">{record.status}</span>
                  {record.pdfUrl && (
                    <button onClick={() => onViewPdf(record.pdfUrl!, record.code)} className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 hover:underline">
                      <FileText size={16} /> Ver Informe
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Multimedia Sidebar/Preview */}
            <div className="w-full lg:w-80 bg-slate-50 border-l border-slate-100 p-6 flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                Respaldo Multimedia
              </h4>

              {/* Imagen Visualización */}
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

              {/* Video Visualización */}
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
        ))}
      </div>
    </div>
  );
};

export default TraceabilityList;
