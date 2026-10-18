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
import { Footer } from './components/Footer';
import { HelpCircle, ChevronDown, ChevronUp, Bell } from 'lucide-react';

export default function App() {
  const [registrations, setRegistrations] = useState<RunnerRegistration[]>([]);
  const [recentlyRegistered, setRecentlyRegistered] = useState<RunnerRegistration | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Carga los registros almacenados (0 iniciales hasta que alguien se registre)
    const data = getStoredRegistrations();
    setRegistrations(data);

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
  };

  const handleAdminAccess = () => {
    if (isAdminAuthenticated()) {
      setIsAdminOpen(true);
    } else {
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
      a: 'Tu pase incluye la Medalla Finisher oficial con relieve metálico (solo para los que crucen la meta), hidratación con agua mineral Nativa en ruta y meta, un artículo luminoso Neón para la noche, y derecho a participar en sorteos en la llegada en Entre Jarras.',
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
      a: 'El artículo neón se entrega en la Plaza de Armas de Tarapoto antes de la largada mostrando tu DNI o tu Pase Digital. La Medalla Finisher oficial metálica se entrega en la meta en Entre Jarras a todos los corredores al completar los 5 kilómetros.',
    },
    {
      q: '¿Cómo valido mi pago por Yape, Plin o Transferencia?',
      a: 'Ingresa tu número de operación y sube la captura de pantalla en el paso 3 del formulario. El sistema confirmará tu inscripción y los organizadores verificarán el pago en el panel de control.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-lime-500 text-black py-2 px-4 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
        <Bell className="w-3.5 h-3.5 shrink-0" />
        <span>
          ¡Inscripciones Abiertas para la 5K en Tarapoto! Asegura tu medalla finisher metálica y pase oficial
        </span>
      </div>

      {/* Main Navbar */}
      <Navbar
        onOpenAdmin={handleAdminAccess}
        onGoToSection={scrollToSection}
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
      <section className="py-16 px-4 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
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

      {/* Admin Login Modal with Username & Password */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setIsAdminOpen(true);
          }}
          onClose={() => setIsAdminLoginOpen(false)}
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
