
import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PdfModal: React.FC<PdfModalProps> = ({ isOpen, onClose, pdfUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center">
              <Download size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Documento Técnico PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink size={20} />
            </a>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-100 p-2 overflow-hidden">
          {/* Using object or iframe to embed PDF */}
          <iframe 
            src={`${pdfUrl}#toolbar=0`} 
            className="w-full h-full rounded-lg border border-slate-200 shadow-inner"
            title="PDF Viewer"
          />
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Cerrar Visor
          </button>
          <a 
            href={pdfUrl}
            download
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Descargar Copia
          </a>
        </div>
      </div>
    </div>
  );
};

export default PdfModal;
