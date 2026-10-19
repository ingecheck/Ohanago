/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RunnerRegistration } from './types/race';
import { getStoredRegistrations } from './data/initialRegistrations';
import { isAdminAuthenticated } from './data/auth';
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
import { HelpCircle, ChevronDown, ChevronUp, Bell, Sparkles } from 'lucide-react';

export default function App() {
  const [registrations, setRegistrations] = useState<RunnerRegistration[]>([]);
  const [recentlyRegistered, setRecentlyRegistered] = useState<RunnerRegistration | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'admin' | 'competitor'>('admin');
  
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

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // 1. Carga los registros almacenados en local
    const data = getStoredRegistrations();
    setRegistrations(data);

    // 2. Sincroniza con el servidor para ver los inscritos desde cualquier dispositivo
    fetch('/api/registrations')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((serverData) => {
        if (Array.isArray(serverData) && serverData.length > 0) {
          setRegistrations(serverData);
          localStorage.setItem('ohana_go_5k_tarapoto_registrations_v4', JSON.stringify(serverData));

          // If active competitor is saved, sync their latest state
          if (activeCompetitor) {
            const found = serverData.find((r) => r.id === activeCompetitor.id);
            if (found) {
              setActiveCompetitor(found);
              localStorage.setItem('ohana_active_competitor', JSON.stringify(found));
            }
          }
        } else if (data && data.length > 0) {
          fetch('/api/registrations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrations: data }),
          }).catch(() => {});
        }
      })
      .catch((err) => console.warn('Conexión con /api/registrations:', err));

    // Atajo de teclado discreto para el organizador (Alt + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleAdminAccess();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRegistrationSuccess = (newReg: RunnerRegistration) => {
    // Actualiza el estado para que el contador y la nómina se sincronicen
    setRegistrations((prev) => [newReg, ...prev]);
    // Abre el dorsal oficial digital
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
      q: '¿Qué incluye exactamente mi inscripción?',
      a: 'Tu pase incluye la Medalla Finisher 5K oficial (para los que completen el recorrido en Entre Jarras), hidratación con agua mineral Nativa en ruta y meta, un artículo luminoso Neón para la noche, derecho a participar en sorteos y en el minijuego post-carrera del Caldero de Pociones.',
    },
    {
      q: '¿Es obligatorio ir con disfraz de Halloween?',
      a: 'No es obligatorio, puedes correr con tu indumentaria deportiva. Sin embargo, te invitamos a traer un disfraz o accesorio si deseas competir por premios sorpresa al mejor atuendo runner de la noche.',
    },
    {
      q: '¿Puedo caminar o trotar si soy principiante?',
      a: '¡Por supuesto! El circuito de 5 kilómetros está diseñado para que todos los amantes del deporte, amigos y familias de Tarapoto puedan completarlo a su propio ritmo.',
    },
    {
      q: '¿Dónde y cuándo se entrega la medalla y el artículo neón?',
      a: 'El artículo neón se entrega en la Plaza de Armas de Tarapoto antes de la largada mostrando tu DNI o tu Pase Digital. La Medalla Finisher 5K se entrega en la meta en Entre Jarras a todos los corredores al completar los 5 kilómetros.',
    },
    {
      q: '¿Cómo funciona el minijuego Caldero de Pociones?',
      a: 'Al cruzar la meta en Entre Jarras, ingresas a la zona de recuperación. Allí encontrarás 5 códigos QR distribuidos en puntos clave (Hidratación, Fotos, Guardarropa, Aliados Estratégicos y Meta). Escanéalos desde tu celular para acumular dulces de azar y competir por un premio especial de OHANA GO.',
    },
    {
      q: '¿Cómo valido mi pago por Yape, Plin o Transferencia?',
      a: 'Ingresa tu número de operación y sube la captura de pantalla en el formulario de inscripción. El sistema confirmará tu pase y los organizadores verificarán el pago en el panel.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-lime-500 text-black py-2 px-4 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
        <Bell className="w-3.5 h-3.5 shrink-0" />
        <span>
          ¡Inscripciones Abiertas! Carrera 5K Tarapoto • 31 Octubre • Medalla Finisher 5K Oficial
        </span>
      </div>

      {/* Main Navbar */}
      <Navbar
        onOpenAdmin={handleAdminAccess}
        onOpenCompetitorLogin={handleCompetitorAccess}
        onGoToSection={scrollToSection}
        loggedInCompetitorName={activeCompetitor ? activeCompetitor.firstName : null}
      />

      {/* Hero Section */}
      <div id="inicio">
        <EventHero
          onRegisterClick={() => scrollToSection('formulario-registro')}
          onExploreKitClick={() => scrollToSection('kit-evento')}
          registeredCount={registrations.length}
        />
      </div>

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
      <section className="pt-4 pb-12 px-4 max-w-3xl mx-auto w-full">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            Preguntas Frecuentes
          </div>
          <h3 className="font-bebas text-4xl text-white uppercase tracking-wider">
            Todo lo que necesitas saber
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden transition"
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
                <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3">
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

      {/* Competitor Portal Modal (Caldero de Pociones, Start QR, Dorsal) */}
      {isCompetitorPortalOpen && activeCompetitor && (
        <CompetitorPortalModal
          runner={activeCompetitor}
          onUpdateRunner={(updated) => {
            setActiveCompetitor(updated);
            localStorage.setItem('ohana_active_competitor', JSON.stringify(updated));
            setRegistrations((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          }}
          onClose={() => setIsCompetitorPortalOpen(false)}
          onLogout={() => {
            setActiveCompetitor(null);
            localStorage.removeItem('ohana_active_competitor');
            setIsCompetitorPortalOpen(false);
          }}
        />
      )}

      {/* Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboard
          registrations={registrations}
          onUpdateRegistrations={setRegistrations}
          onClose={() => setIsAdminOpen(false)}
          onLogout={() => {
            setIsAdminOpen(false);
          }}
        />
      )}
    </div>
  );
}
