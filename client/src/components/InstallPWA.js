import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Aguardar 10 segundos antes de mostrar o banner
      setTimeout(() => {
        setShowBanner(true);
      }, 10000);
    };

    // Detectar quando foi instalado
    const handleAppInstalled = () => {
      console.log('✅ PWA: App instalado!');
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`📱 PWA: Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowBanner(false);
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Não mostrar se já está instalado ou se foi dispensado
  if (isInstalled || !showBanner || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-2xl p-4 border-2 border-blue-400">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Instalar AgendaPro</h3>
              <p className="text-sm text-blue-100">Acesso rápido na tela inicial</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <span>✓</span>
            <span>Funciona offline</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>✓</span>
            <span>Notificações em tempo real</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>✓</span>
            <span>Mais rápido que o site</span>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Instalar Agora</span>
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;

