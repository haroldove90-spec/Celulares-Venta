import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  variant?: 'header' | 'card' | 'badge';
  className?: string;
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          App Instalada
        </span>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Ambient guide for desktop or unsupported browsers
      alert('Para instalar la aplicación "Celulares Venta", abre el menú de tu navegador (los tres puntos o ícono de instalar en la barra de direcciones) y selecciona "Instalar Celulares Venta".');
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar Celulares Venta en tu dispositivo"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-sm active:scale-95 ${
          variant === 'card'
            ? 'w-full justify-center bg-cyan-600 hover:bg-cyan-700 text-white'
            : 'bg-white/90 hover:bg-white text-cyan-800 border border-cyan-200 hover:border-cyan-300'
        } ${className}`}
      >
        <Download className="w-4 h-4 text-cyan-600 animate-bounce" />
        <span>Instalar App</span>
      </button>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Instalar en iOS (iPhone / iPad)</h3>
                  <p className="text-xs text-slate-500">Agrega "Celulares Venta" a tu pantalla de inicio</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <p>
                  Toca el botón <strong>Compartir</strong> (ícono con flecha hacia arriba) en la barra inferior de Safari.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <p>
                  Desliza hacia abajo en las opciones y selecciona <strong>"Agregar al inicio"</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <p>
                  Toca <strong>"Agregar"</strong> en la esquina superior derecha. ¡Listo para usar como app nativa!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {installSuccess && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5" />
          ¡Instalación iniciada con éxito!
        </div>
      )}
    </>
  );
};
