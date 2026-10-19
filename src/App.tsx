import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EventHero } from './components/EventHero';
import { EventKitSection } from './components/EventKitSection';
import { RaceRouteSection } from './components/RaceRouteSection';
import { RegistrationForm } from './components/RegistrationForm';
import { ConsultDorsalSection } from './components/ConsultDorsalSection';
import { RegistrationSuccessModal } from './components/RegistrationSuccessModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CompetitorPortalModal } from './components/CompetitorPortalModal';
import { Footer } from './components/Footer';
import { RunnerRegistration } from './types/race';
import { getStoredRegistrations } from './data/initialRegistrations';
import { isAdminAuthenticated } from './data/auth';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const App: React.FC = () => {
  const [registrations, setRegistrations] = useState<RunnerRegistration[]>([]);
  const [recentlyRegistered, setRecentlyRegistered] = useState<RunnerRegistration | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'admin' | 'competitor'>('admin');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Active competitor session
  const [activeCompetitor, setActiveCompetitor] = useState<RunnerRegistration | null>(() => {
    try {
      const saved = localStorage.getItem('ohana_active_competitor');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isCompetitorPortalOpen, setIsCompetitorPortalOpen] = useState(false);

  useEffect(() => {
    // 1. Carga inmediata desde local para no bloquear la vista inicial
    const initialLocal = getStoredRegistrations();
    setRegistrations(initialLocal);

    // 2. Sincronización en tiempo real con el servidor para todos los navegadores
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
            if (activeCompetitor) {
              const found = serverData.find((r: RunnerRegistration) => r.id === activeCompetitor.id);
              if (found) {
                setActiveCompetitor(found);
                localStorage.setItem('ohana_active_competitor', JSON.stringify(found));
              }
            }
          }
        })
        .catch(() => {});
    };

    syncRegistrations();
    const intervalId = setInterval(syncRegistrations, 4000);
    window.addEventListener('focus', syncRegistrations);

    // Atajo de teclado discreto para el organizador (Alt + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleAdminAccess();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', syncRegistrations);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
      setLoginModalTab('admin');
      setIsAdminLoginOpen(true);
    }
  };

  const handleCompetitorAccess = () => {
    if (activeCompetitor) {
      setIsCompetitorPortalOpen(true);
    } else {
      setLoginModalTab('competitor');
      setIsAdminLoginOpen(true);
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
      q: '¿Cuál es la diferencia entre la Modalidad Presencial y la Modalidad Virtual?',
      a: 'En la modalidad Presencial, corres en vivo el sábado 31 de Octubre a las 7:00 PM desde la Plaza de Armas de Tarapoto hasta Entre Jarras, con hidratación en ruta, pulseras neón y entrega de tu Medalla Finisher física al cruzar la meta. En la modalidad Virtual, puedes correr o caminar tus 5K desde cualquier ciudad del Perú o del mundo entre el 28 de Octubre y el 2 de Noviembre con tu app favorita (Strava, Nike, Garmin), subes tu captura en tu Portal de Competidor y te enviamos tu Medalla Finisher física y kit oficial a domicilio o agencia.',
    },
    {
      q: '¿Qué incluye exactamente el valor de mi inscripción (S/ 50.00)?',
      a: 'Ambas modalidades reciben la Medalla Finisher 5K Oficial en relieve metálico de colección. Los corredores presenciales cuentan con artículo luminoso neón para la noche, hidratación con Agua Nativa y participación en sorteos en Entre Jarras. Los corredores virtuales reciben el envío de su medalla física y kit a su localidad. Ambos obtienen su Pase Digital Oficial con número de registro y acceso a su cuenta.',
    },
    {
      q: 'Si elijo la modalidad Virtual, ¿cómo y cuándo registro mi tiempo?',
      a: 'Podrás completar tus 5 kilómetros en cualquier momento entre el 28 de Octubre y el 2 de Noviembre. Al finalizar, ingresa a la web en el botón "Portal Competidor" con tu DNI, haz clic en "Subir Evidencia 5K", registra tu tiempo y sube una captura de pantalla de Strava, Nike Run Club, Garmin, Apple Watch o foto de la pantalla de tu trotadora.',
    },
    {
      q: '¿Es obligatorio correr con disfraz de Halloween?',
      a: 'No es obligatorio. Puedes participar con tu ropa deportiva favorita. Sin embargo, si deseas sumarte al concurso de disfraces en la llegada de Entre Jarras, habrá premios en efectivo y regalos sorpresa de aliados estratégicos para los mejores atuendos runner.',
    },
    {
      q: '¿Puedo caminar o trotar a mi propio ritmo si soy principiante?',
      a: '¡Por supuesto! El circuito de 5K está pensado para que deportistas experimentados, aficionados, familias y principiantes puedan disfrutar de una noche de deporte y diversión a su propio ritmo.',
    },
    {
      q: '¿Cómo se entregan las medallas y kits en cada modalidad?',
      a: 'En la modalidad Presencial, las pulseras neón se entregan antes de la largada en la Plaza de Armas (a partir de las 6:00 PM) y la medalla se entrega en el arco de meta en Entre Jarras. En la modalidad Virtual, la medalla física y kit se despachan por agencia o courier (Olva / Shalom) a la dirección indicada en tu ficha de registro.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-lime-500 py-1.5 px-4 text-center text-black font-bebas text-sm sm:text-base tracking-wider uppercase shadow-md relative z-40">
        Carrera 5K Tarapoto • 31 Octubre • Modalidad Presencial & Virtual
      </div>

      {/* Main Navbar */}
      <Navbar
        onOpenAdmin={handleAdminAccess}
        onOpenCompetitorLogin={handleCompetitorAccess}
        onGoToSection={scrollToSection}
      />

      {/* Hero Section */}
      <EventHero
        registeredCount={registrations.length}
        onRegisterClick={() => scrollToSection('formulario-registro')}
        onExploreKitClick={() => scrollToSection('kit-evento')}
      />

      {/* Kit & Medal Section */}
      <EventKitSection
        onGoToRegister={() => scrollToSection('formulario-registro')}
      />

      {/* Route & Map Section */}
      <RaceRouteSection />

      {/* Registration Form */}
      <RegistrationForm
        onRegistrationSuccess={handleRegistrationSuccess}
      />

      {/* Consult Dorsal Section */}
      <ConsultDorsalSection
        registrations={registrations}
      />

      {/* Frequently Asked Questions */}
      <section id="preguntas-frecuentes" className="pt-6 pb-12 px-4 max-w-4xl mx-auto w-full scroll-mt-20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            Preguntas Frecuentes
          </div>
          <h3 className="font-bebas text-4xl sm:text-5xl text-white uppercase tracking-wider">
            Todo lo que necesitas saber
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Información oficial sobre las modalidades Presencial y Virtual de la OHANA GO 5K.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden transition hover:border-neutral-700"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-sm text-neutral-200 flex items-center justify-between gap-4 hover:text-lime-400 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-lime-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
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

      {/* Login Modal with Clean Admin and Competitor Tabs */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          initialTab={loginModalTab}
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setIsAdminOpen(true);
          }}
          onCompetitorSuccess={(runner) => {
            setActiveCompetitor(runner);
            localStorage.setItem('ohana_active_competitor', JSON.stringify(runner));
            setIsAdminLoginOpen(false);
            setIsCompetitorPortalOpen(true);
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
    </div>
  );
};

export default App;
