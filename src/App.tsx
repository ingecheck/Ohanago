import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EventHero } from './components/EventHero';
import { UpcomingRaceTeaser } from './components/UpcomingRaceTeaser';
import { SocialRunSection } from './components/SocialRunSection';
import { PastEditionsArchive } from './components/PastEditionsArchive';
import { OhanaMerchSection } from './components/OhanaMerchSection';
import { EventKitSection } from './components/EventKitSection';
import { RaceRouteSection } from './components/RaceRouteSection';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationSuccessModal } from './components/RegistrationSuccessModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CompetitorLoginModal } from './components/CompetitorLoginModal';
import { CompetitorPortalModal } from './components/CompetitorPortalModal';
import { LiveRouletteSection } from './components/LiveRouletteSection';
import { Footer } from './components/Footer';
import { RunnerRegistration } from './types/race';
import { getStoredRegistrations } from './data/initialRegistrations';
import { isAdminAuthenticated } from './data/auth';
import { processStartCheckinSafe, subscribeToRegistrationsFirestore } from './utils/checkinManager';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, X, Sparkles, MapPin, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackPageView, trackMiEspacioClick, trackRunnerLogin } from './utils/analytics';

export const App: React.FC = () => {
  const [registrations, setRegistrations] = useState<RunnerRegistration[]>([]);
  const [recentlyRegistered, setRecentlyRegistered] = useState<RunnerRegistration | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isCompetitorLoginOpen, setIsCompetitorLoginOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Direct Start Line QR Check-in states (when runner scans start QR with camera)
  const [directCheckinOpen, setDirectCheckinOpen] = useState(false);
  const [directCheckinToken, setDirectCheckinToken] = useState('OHANA-START-LINE-TARAPOTO-2026');
  const [directCheckinQuery, setDirectCheckinQuery] = useState('');
  const [directCheckinLoading, setDirectCheckinLoading] = useState(false);
  const [directCheckinError, setDirectCheckinError] = useState<string | null>(null);
  const [directCheckinSuccess, setDirectCheckinSuccess] = useState<RunnerRegistration | null>(null);
  
  // Active competitor session
  const [activeCompetitor, setActiveCompetitor] = useState<RunnerRegistration | null>(() => {
    try {
      const saved = localStorage.getItem('ohana_active_competitor');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const activeCompetitorRef = React.useRef(activeCompetitor);
  activeCompetitorRef.current = activeCompetitor;

  const [isCompetitorPortalOpen, setIsCompetitorPortalOpen] = useState(false);

  useEffect(() => {
    // 0. Registrar visita en métricas de tráfico en vivo
    trackPageView();

    // 1. Carga inmediata desde local para no bloquear la vista inicial
    const initialLocal = getStoredRegistrations();
    setRegistrations(initialLocal);

    // 2. Sincronización en tiempo real con el servidor o local (Hostinger static fallback)
    const syncRegistrations = () => {
      fetch('/api/registrations')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((serverData) => {
          if (Array.isArray(serverData) && serverData.length > 0) {
            setRegistrations(serverData);

            // Sincroniza al competidor activo si está logueado
            const currentComp = activeCompetitorRef.current;
            if (currentComp) {
              const found = serverData.find((r: RunnerRegistration) => r.id === currentComp.id || r.documentNumber === currentComp.documentNumber);
              if (found) {
                setActiveCompetitor(found);
                localStorage.setItem('ohana_active_competitor', JSON.stringify(found));
              }
            }
          }
        })
        .catch(() => {
          // Fallback resiliente para Hostinger www.ohanago.pro sin backend Node activo
          const localData = getStoredRegistrations();
          if (Array.isArray(localData) && localData.length > 0) {
            setRegistrations(localData);
            const currentComp = activeCompetitorRef.current;
            if (currentComp) {
              const found = localData.find((r: RunnerRegistration) => r.id === currentComp.id || r.documentNumber === currentComp.documentNumber);
              if (found) {
                setActiveCompetitor(found);
                localStorage.setItem('ohana_active_competitor', JSON.stringify(found));
              }
            }
          }
        });
    };

    syncRegistrations();
    const intervalId = setInterval(syncRegistrations, 2500);
    window.addEventListener('focus', syncRegistrations);
    window.addEventListener('storage', syncRegistrations);
    window.addEventListener('ohana-checkin', syncRegistrations);

    // BroadcastChannel listener para sincronización instantánea entre pestañas en Hostinger
    let checkinChan: BroadcastChannel | null = null;
    try {
      checkinChan = new BroadcastChannel('ohana_checkin_channel');
      checkinChan.onmessage = () => {
        syncRegistrations();
      };
    } catch (e) {}

    // Cloud Firestore real-time listener para acreditación y entrega de kit entre todos los celulares
    let unsubCheckins: (() => void) | null = null;
    try {
      unsubCheckins = subscribeToRegistrationsFirestore((runner) => {
        setRegistrations((prev) => {
          const next = prev.map((r) => (r.id === runner.id ? { ...r, ...runner, confirmedAtStart: true } : r));
          return next;
        });

        // Actualizar sesión si el corredor activo es este participante
        const currentComp = activeCompetitorRef.current;
        if (currentComp && (currentComp.id === runner.id || currentComp.documentNumber === runner.documentNumber)) {
          const updatedComp = { ...currentComp, ...runner, confirmedAtStart: true };
          setActiveCompetitor(updatedComp);
          localStorage.setItem('ohana_active_competitor', JSON.stringify(updatedComp));
        }
      });
    } catch (e) {}

    // Atajo de teclado discreto para el organizador (Alt + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleAdminAccess();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Detectar si el usuario escaneó el QR con su cámara nativa (?checkin=start o ?runner=... o ?dni=...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const runnerParam = urlParams.get('runner') || urlParams.get('runnerId');
      const dniParam = urlParams.get('dni');

      if (runnerParam || dniParam) {
        // Limpiar URL sin recargar
        window.history.replaceState({}, document.title, window.location.pathname);
        processStartCheckinSafe({
          runnerId: runnerParam || undefined,
          dni: dniParam || undefined,
          code: runnerParam || dniParam || undefined,
        }).then((result) => {
          if (result.runner) {
            setActiveCompetitor(result.runner);
            localStorage.setItem('ohana_active_competitor', JSON.stringify(result.runner));
            setRegistrations((prev) =>
              prev.map((r) => (r.id === result.runner!.id ? result.runner! : r))
            );
            setDirectCheckinSuccess(result.runner);
            try {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            } catch (e) {}
          }
        });
      } else if (urlParams.get('checkin') === 'start') {
        const tokenFromUrl = urlParams.get('token') || 'OHANA-START-LINE-TARAPOTO-2026';
        setDirectCheckinToken(tokenFromUrl);

        // Limpiar URL sin recargar
        window.history.replaceState({}, document.title, window.location.pathname);

        // Si ya hay un competidor en sesión en este teléfono:
        const savedComp = localStorage.getItem('ohana_active_competitor');
        if (savedComp) {
          try {
            const runnerObj = JSON.parse(savedComp);
            if (runnerObj && runnerObj.id) {
              processStartCheckinSafe({
                runnerId: runnerObj.id,
                token: tokenFromUrl,
              }).then((result) => {
                if (result.runner) {
                  setActiveCompetitor(result.runner);
                  localStorage.setItem('ohana_active_competitor', JSON.stringify(result.runner));
                  setDirectCheckinSuccess(result.runner);
                  try {
                    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                  } catch (e) {}
                } else {
                  setDirectCheckinOpen(true);
                }
              }).catch(() => setDirectCheckinOpen(true));
              return;
            }
          } catch (e) {}
        }

        // Si no está logueado, abrir modal para que ingrese DNI
        setDirectCheckinOpen(true);
      }
    } catch (e) {}

    return () => {
      clearInterval(intervalId);
      if (unsubCheckins) unsubCheckins();
      window.removeEventListener('focus', syncRegistrations);
      window.removeEventListener('storage', syncRegistrations);
      window.removeEventListener('ohana-checkin', syncRegistrations);
      window.removeEventListener('keydown', handleKeyDown);
      if (checkinChan) checkinChan.close();
    };
  }, []);

  const handleExecuteDirectCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directCheckinQuery.trim()) {
      setDirectCheckinError('Ingresa tu número de DNI.');
      return;
    }

    setDirectCheckinLoading(true);
    setDirectCheckinError(null);

    try {
      const result = await processStartCheckinSafe({
        dni: directCheckinQuery.trim(),
        token: directCheckinToken,
      });

      if (!result.success || !result.runner) {
        setDirectCheckinError(result.error || 'No se encontró un competidor registrado con ese documento.');
        return;
      }

      // Éxito: actualiza estados y guarda sesión de competidor
      setActiveCompetitor(result.runner);
      localStorage.setItem('ohana_active_competitor', JSON.stringify(result.runner));
      setRegistrations((prev) =>
        prev.map((r) => (r.id === result.runner!.id ? result.runner! : r))
      );
      setDirectCheckinSuccess(result.runner);
      setDirectCheckinOpen(false);

      try {
        window.dispatchEvent(new CustomEvent('ohana-checkin'));
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
      } catch (err) {}
    } catch (err) {
      setDirectCheckinError('Error al procesar tu check-in.');
    } finally {
      setDirectCheckinLoading(false);
    }
  };

  const handleRegistrationSuccess = (newReg: RunnerRegistration) => {
    // Actualiza el estado para que la nómina se sincronice
    setRegistrations((prev) => [newReg, ...prev]);
    // Abre el pase oficial digital
    setRecentlyRegistered(newReg);
    // Establece como competidor activo para acceso instantáneo
    setActiveCompetitor(newReg);
    localStorage.setItem('ohana_active_competitor', JSON.stringify(newReg));
  };

  const handleAdminAccess = () => {
    if (isAdminAuthenticated()) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleCompetitorAccess = () => {
    trackMiEspacioClick(activeCompetitor ? 'Mi Espacio Activo' : 'Portal Competidor');
    if (activeCompetitor) {
      trackRunnerLogin(activeCompetitor);
      setIsCompetitorPortalOpen(true);
    } else {
      setIsCompetitorLoginOpen(true);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: '¿Qué es OHANA GO y cómo puedo sumarme a los Social Runs semanales?',
      a: 'OHANA GO es una comunidad atlética y productora de eventos deportivos con sede en Tarapoto. Nos reunimos todos los martes y jueves a las 6:30 PM en la Plaza Mayor de Tarapoto para trotar en grupo de manera 100% libre y gratuita. No necesitas experiencia previa, solo tus zapatillas y las ganas de moverte.',
    },
    {
      q: '¿Cuándo se anunciará la próxima carrera oficial de OHANA GO?',
      a: 'La siguiente gran edición se encuentra actualmente en fase confidencial de diseño y preparación. Los circuitos, distancias y preventa de inscripciones se revelarán primero a los inscritos en nuestra lista de espera VIP de WhatsApp.',
    },
    {
      q: '¿Cómo consulto mi medalla y credencial de ediciones pasadas (ej. Halloween 5K)?',
      a: 'En la barra superior presiona el botón "Mi Espacio 🎒" e ingresa tu número de DNI. El sistema cargará de inmediato tu credencial oficial, tu estado de acreditación y tu registro de participación en nuestras carreras.',
    },
    {
      q: '¿Qué ritmos de entrenamiento manejan en las salidas del club?',
      a: 'Contamos con tres grupos de ritmo guiados por capitanes: Grupo Iniciación (6:45 a 7:15 min/km), Grupo Intermedio (5:50 a 6:20 min/km) y Grupo Avanzado (5:00 a 5:30 min/km). La filosofía Ohana es que nadie corre solo ni se queda atrás.',
    },
    {
      q: '¿Cómo puedo adquirir los polos técnicos y merch oficial de Ohana Go?',
      a: 'En la sección Merch Oficial puedes ver nuestro catálogo de polos técnicos microperforados, viseras running y calcetines deportivos. Escríbenos directamente a nuestro WhatsApp oficial (+51 957 342 934) para coordinar tallas y entrega inmediata en Tarapoto o envíos a nivel nacional.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      {/* Top Brand Notification Banner */}
      <div className="bg-neutral-950 border-b border-lime-400/30 py-2 px-4 text-center text-xs sm:text-sm font-mono tracking-wider uppercase text-neutral-300 relative z-40 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping shrink-0" />
        <span className="text-white font-bold">OHANA GO • RUN CLUB & RACING</span>
        <span className="hidden sm:inline text-neutral-500">|</span>
        <span className="hidden sm:inline text-lime-400 font-bold">PRÓXIMA EDICIÓN EN PREPARACIÓN</span>
      </div>

      {/* Main Navbar */}
      <Navbar
        onOpenAdmin={handleAdminAccess}
        onGoToSection={scrollToSection}
      />

      {/* Hero Section */}
      <EventHero
        registeredCount={registrations.length}
        onExploreUpcoming={() => scrollToSection('ediciones')}
        onExploreCommunity={() => scrollToSection('comunidad-social-run')}
      />

      {/* Upcoming Race Teaser (Próxima carrera) */}
      <UpcomingRaceTeaser />

      {/* Social Run Club (Comunidad & Entrenamientos semanales) */}
      <SocialRunSection />

      {/* Ohana Merch Section (Indumentaria oficial) */}
      <OhanaMerchSection />

      {/* Past Editions Archive (Preserva Halloween 5K y nómina de 131 atletas) */}
      <PastEditionsArchive
        registrations={registrations}
      />

      {/* Frequently Asked Questions */}
      <section id="preguntas-frecuentes" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto w-full scroll-mt-20 border-t border-neutral-900">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-950/60 border border-lime-400/40 text-lime-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Preguntas Frecuentes</span>
          </div>
          <h3 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-wider">
            RESPUESTAS CLARAS PARA <span className="text-lime-400">CORREDORES</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Conoce cómo funciona nuestra comunidad de running, los entrenamientos y las carreras oficiales.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden transition hover:border-lime-400/40"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-sm text-neutral-200 flex items-center justify-between gap-4 hover:text-lime-400 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-lime-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer onOpenAdmin={handleAdminAccess} />

      {/* Registration Success Modal with Digital Bib */}
      <RegistrationSuccessModal
        registration={recentlyRegistered}
        onClose={() => setRecentlyRegistered(null)}
      />

      {/* Competitor Login Modal (Mi Espacio ONLY) */}
      {isCompetitorLoginOpen && (
        <CompetitorLoginModal
          onSuccess={(runner) => {
            setActiveCompetitor(runner);
            localStorage.setItem('ohana_active_competitor', JSON.stringify(runner));
            trackRunnerLogin(runner);
            setIsCompetitorLoginOpen(false);
            setIsCompetitorPortalOpen(true);
          }}
          onClose={() => setIsCompetitorLoginOpen(false)}
        />
      )}

      {/* Admin Login Modal (Gestión / Organizador ONLY) */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setIsAdminOpen(true);
          }}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}

      {/* Competitor Portal Modal (Presencial checkin & Virtual evidence) */}
      {isCompetitorPortalOpen && activeCompetitor && (
        <CompetitorPortalModal
          competitor={activeCompetitor}
          onClose={() => setIsCompetitorPortalOpen(false)}
          onLogout={() => {
            setActiveCompetitor(null);
            localStorage.removeItem('ohana_active_competitor');
          }}
          onUpdateCompetitor={(updated) => {
            setActiveCompetitor(updated);
            localStorage.setItem('ohana_active_competitor', JSON.stringify(updated));
            setRegistrations((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          }}
        />
      )}

      {/* Admin Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          registrations={registrations}
          onUpdateRegistrations={(updated) => setRegistrations(updated)}
          onClose={() => setIsAdminOpen(false)}
          onLogout={() => setIsAdminOpen(false)}
        />
      )}

      {/* Modal: Direct Start QR Check-in Prompt (When scanned with native mobile camera) */}
      {directCheckinOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-neutral-900 border-2 border-lime-400 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => {
                setDirectCheckinOpen(false);
                setDirectCheckinError(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-bebas text-3xl mx-auto mb-3 shadow-lg shadow-lime-400/30">
                🏁
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-lime-400 block mb-1">
                Punto de Largada Oficial • Plaza de Armas
              </span>
              <h3 className="font-bebas text-3xl text-white uppercase tracking-wide">
                Confirmar <span className="text-lime-400">Asistencia 5K</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                ¡Bienvenido a la OHANA GO 5K! Ingresa tu número de DNI para validar tu check-in en vivo en la Plaza de Armas.
              </p>
            </div>

            <form onSubmit={handleExecuteDirectCheckin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Número de DNI del Participante *</span>
                  <span className="text-[10px] text-lime-400">solo documento</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  autoFocus
                  maxLength={12}
                  value={directCheckinQuery}
                  onChange={(e) => setDirectCheckinQuery(e.target.value)}
                  placeholder="Ingresa tu DNI (Ej: 70930296)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-base font-bold font-mono focus:outline-none focus:border-lime-400 transition"
                />
              </div>

              {directCheckinError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{directCheckinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={directCheckinLoading}
                className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-bebas text-xl uppercase tracking-wider rounded-xl transition shadow-lg shadow-lime-400/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {directCheckinLoading ? 'Validando Entrega de Kit...' : '✓ Confirmar Entrega de Kit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Start QR Check-in Success Confirmation */}
      {directCheckinSuccess && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-neutral-900 border-2 border-emerald-400 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(52,211,153,0.3)]">
            <button
              onClick={() => setDirectCheckinSuccess(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
              Entrega de Kit Inicial Confirmada
            </span>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide">
              ¡Kit Inicial Entregado!
            </h3>
            
            <div className="my-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 uppercase font-bold">Corredor:</span>
                <span className="text-sm font-bold text-white">{directCheckinSuccess.firstName} {directCheckinSuccess.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 uppercase font-bold">DNI Verificado:</span>
                <span className="text-sm font-black text-lime-400 font-mono">{directCheckinSuccess.documentNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 uppercase font-bold">Hora de Entrega:</span>
                <span className="text-xs text-neutral-300 font-mono">
                  {directCheckinSuccess.startCheckinTime ? new Date(directCheckinSuccess.startCheckinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Registrado'}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-4">
              Tu kit inicial y asistencia ya se encuentran confirmados en tiempo real en la lista oficial del organizador. ¡Nos vemos en la largada a las 7:00 PM!
            </p>

            <button
              onClick={() => {
                setDirectCheckinSuccess(null);
                setIsCompetitorPortalOpen(true);
              }}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-bebas text-lg uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
            >
              Ir a Mi Espacio 🎒 (Ficha de Verificación)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
