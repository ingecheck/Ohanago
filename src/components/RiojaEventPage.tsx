import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Award,
  Sparkles,
  Droplets,
  Coffee,
  Gift,
  Heart,
  User,
  Menu,
  X,
  Shield,
  CheckCircle2,
  Instagram,
  PartyPopper,
} from 'lucide-react';
import { RunnerRegistration } from '../types/race';
import { BrandLogo } from './BrandLogo';
import { RiojaRegistrationForm, RiojaCategory } from './RiojaRegistrationForm';

interface RiojaEventPageProps {
  onBackToHub: () => void;
  onSwitchToTarapoto: () => void;
  onRegistrationSuccess: (registration: RunnerRegistration) => void;
  onOpenCompetitorLogin: () => void;
  onOpenAdmin: () => void;
  loggedInCompetitorName?: string | null;
}

const RIOJA_KIT_ITEMS = [
  {
    icon: Award,
    title: 'Medalla Finisher',
    desc: 'Medalla conmemorativa oficial al cruzar la meta en Don Diogo.',
    accent: 'text-amber-400',
  },
  {
    icon: Sparkles,
    title: 'Gorra Navideña',
    desc: 'Gorra festiva oficial Santa Run Rioja para llenar la ruta de espíritu navideño.',
    accent: 'text-red-400',
  },
  {
    icon: Droplets,
    title: 'Hidratación',
    desc: 'Puntos de hidratación para correr seguro y con energía de principio a fin.',
    accent: 'text-cyan-400',
  },
  {
    icon: Gift,
    title: 'Panetón',
    desc: 'Porción navideña de panetón para compartir al culminar el recorrido.',
    accent: 'text-amber-300',
  },
  {
    icon: Coffee,
    title: 'Chocolate',
    desc: 'Tradicional chocolatada navideña para toda la familia corredora.',
    accent: 'text-orange-400',
  },
  {
    icon: CheckCircle2,
    title: 'Pulsera Oficial',
    desc: 'Pulsera oficial de acreditación y recuerdo de Santa Run Rioja 2026.',
    accent: 'text-emerald-400',
  },
];

export const RiojaEventPage: React.FC<RiojaEventPageProps> = ({
  onBackToHub,
  onSwitchToTarapoto,
  onRegistrationSuccess,
  onOpenCompetitorLogin,
  onOpenAdmin,
  loggedInCompetitorName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RiojaCategory>('Libre 5K');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryAndRegister = (category: RiojaCategory) => {
    setSelectedCategory(category);
    scrollToSection('inscripcion-rioja');
  };

  return (
    <div className="min-h-screen bg-[#060606] text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white relative z-30">
      {/* Clean Top Event Strip */}
      <div className="bg-black border-b border-red-950/70 py-2.5 px-4 text-center text-xs font-mono tracking-wider uppercase text-neutral-300 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="text-white font-bold">OHANA GO × SACHA RUNNERS · SANTA RUN RIOJA 2026</span>
        <span className="hidden sm:inline text-neutral-600">|</span>
        <span className="text-amber-400 font-bold">DOMINGO 20 DE DICIEMBRE · 7:30 A. M. · LLEGADA: DON DIOGO</span>
      </div>

      {/* Clean 3-Zone Sticky Navbar */}
      <nav className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Left: Brand + Back to Hub */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHub}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white text-xs font-bold transition cursor-pointer"
              title="Volver al selector de sedes OHANA GO"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sedes</span>
            </button>
            <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer">
              <BrandLogo size="sm" variant="crimson" />
            </div>
          </div>

          {/* Center: Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <button
              type="button"
              onClick={() => scrollToSection('inscripcion-rioja')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black transition cursor-pointer shadow-lg shadow-red-600/25"
            >
              Inscríbete Rioja
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('categorias-rioja')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Categorías & Precios
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('kit-rioja')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Kit & Show Infantil
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('causa-rioja')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Causa Solidaria
            </button>
          </div>

          {/* Right: Mi Espacio & Tarapoto Switch */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCompetitorLogin}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-red-500/40 hover:border-red-400 text-white hover:text-red-200 transition flex items-center gap-2 text-xs font-mono font-bold cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>
                {loggedInCompetitorName
                  ? `Mi Espacio (${loggedInCompetitorName.split(' ')[0]})`
                  : 'Mi Espacio'}
              </span>
            </button>
            <a
              href="/santaruntarapoto"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToTarapoto();
              }}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white transition text-xs font-bold"
            >
              Ver Tarapoto
            </a>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollToSection('inscripcion-rioja')}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-black uppercase cursor-pointer"
            >
              Inscríbete
            </button>
            <button
              type="button"
              onClick={onOpenCompetitorLogin}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-red-500/40 text-red-200 text-xs font-mono font-bold cursor-pointer"
            >
              Mi Espacio
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-b border-white/10 px-4 py-4 space-y-2.5 text-sm">
            <button
              type="button"
              onClick={() => scrollToSection('inscripcion-rioja')}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-200 font-bold uppercase"
            >
              Inscribirme en Rioja (S/ 25 · S/ 35)
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('categorias-rioja')}
              className="w-full text-left py-2 text-neutral-200 font-bold uppercase border-b border-white/5"
            >
              Categorías & Precios
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('kit-rioja')}
              className="w-full text-left py-2 text-neutral-200 font-bold uppercase border-b border-white/5"
            >
              Kit Oficial & Show Infantil
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('causa-rioja')}
              className="w-full text-left py-2 text-neutral-200 font-bold uppercase border-b border-white/5"
            >
              Causa Solidaria & Sacha Runners
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchToTarapoto();
              }}
              className="w-full text-left py-2 text-amber-400 font-bold uppercase border-b border-white/5"
            >
              Cambiar a Santa Run Tarapoto
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full text-left py-2 text-xs text-neutral-500 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" /> Acceso Organizador
            </button>
          </div>
        )}
      </nav>

      {/* HERO SECTION: Asymmetric 2-column split */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 70% 20%, rgba(220, 38, 38, 0.45), transparent 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          {/* Left Column: Event Identity & Primary Action */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.24em] text-amber-400">
                OHANA GO PRESENTA · EN ALIANZA CON SACHA RUNNERS
              </p>
              <h1 className="font-bebas text-6xl sm:text-7xl lg:text-8xl text-white uppercase leading-[0.9] tracking-tight mt-3">
                SANTA RUN <span className="text-red-500">RIOJA 2026</span>
              </h1>
              <p className="font-serif italic text-xl sm:text-2xl text-amber-300 mt-3">
                Corre y regala Sonrisas
              </p>
              <p className="text-sm sm:text-base text-neutral-300 mt-4 leading-relaxed max-w-xl">
                Una mañana navideña para correr en familia en Rioja. Elige entre{' '}
                <strong className="text-white">Categoría Kids 2K (S/ 25.00)</strong> o{' '}
                <strong className="text-white">Categoría Libre 5K (S/ 35.00)</strong> y sé parte de una carrera solidaria con show infantil y kit completo.
              </p>
            </div>

            {/* Schedule & Location Facts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4">
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-neutral-400 font-bold">
                  <Calendar className="w-4 h-4 text-red-500" /> Fecha
                </span>
                <span className="block text-base font-bold text-white mt-1">Dom 20 Dic 2026</span>
              </div>

              <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4">
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-neutral-400 font-bold">
                  <Clock className="w-4 h-4 text-amber-400" /> Horario
                </span>
                <span className="block text-base font-bold text-white mt-1 tabular-nums">7:30 a. m.</span>
              </div>

              <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4">
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-neutral-400 font-bold">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Llegada
                </span>
                <span className="block text-base font-bold text-white mt-1">Don Diogo</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('inscripcion-rioja')}
                className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bebas text-2xl sm:text-3xl tracking-wider uppercase transition shadow-xl shadow-red-600/30 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Inscribirme en Rioja</span>
                <ArrowRight className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('categorias-rioja')}
                className="px-6 py-4 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-white/15 text-neutral-100 font-bebas text-xl sm:text-2xl tracking-wider uppercase transition cursor-pointer"
              >
                Ver Categorías y Tarifas
              </button>
            </div>
          </div>

          {/* Right Column: Official Main Flyer */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-lg rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_24px_80px_rgba(220,38,38,0.22)]">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.00.04_AM__1__922813aa.jpeg"
                alt="Afiche principal Santa Run Rioja 2026 - OHANA GO y Sacha Runners - 20 de diciembre 7:30 am llegada Don Diogo"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CATEGORÍAS & TARIFAS */}
      <section
        id="categorias-rioja"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#090909]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.26em] text-amber-400">
              Inversión Oficial · Domingo 20 de Diciembre
            </p>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-wide mt-2 leading-none">
              CATEGORÍAS <span className="text-red-500">KIDS 2K & LIBRE 5K</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Official Pricing Poster */}
            <div className="lg:col-span-5 flex items-center justify-center bg-black border border-white/10 rounded-3xl overflow-hidden p-2">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.00.04_AM_15cabe8b.jpeg"
                alt="Tarifas oficiales Santa Run Rioja 2026: Categoría Kids 2K S/ 25.00 y Categoría Libre 5K S/ 35.00"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[540px] object-contain rounded-2xl"
              />
            </div>

            {/* Two Interactive Pricing Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              {/* KIDS 2K */}
              <div className="bg-neutral-950 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                      Infantil / Familiar
                    </span>
                    <span className="text-xs font-mono text-neutral-400">20 DIC</span>
                  </div>
                  <div>
                    <h3 className="font-bebas text-5xl text-white uppercase leading-none">
                      CATEGORÍA <span className="text-amber-400">KIDS 2K</span>
                    </h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-bebas text-6xl text-white tabular-nums leading-none">
                        S/ 25.00
                      </span>
                      <span className="text-xs text-neutral-400">inscripción completa</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-sm text-neutral-300 pt-3 border-t border-white/10">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Recorrido seguro de 2 kilómetros para niños y niñas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Kit completo: medalla, gorra, panetón, chocolate y pulsera</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Acceso al Show Infantil en Don Diogo</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectCategoryAndRegister('Kids 2K')}
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bebas text-2xl tracking-wider uppercase transition cursor-pointer font-black"
                >
                  Elegir Kids 2K (S/ 25)
                </button>
              </div>

              {/* LIBRE 5K */}
              <div className="bg-neutral-950 border-2 border-red-500/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                      Jóvenes & Adultos
                    </span>
                    <span className="text-xs font-mono text-neutral-400">20 DIC</span>
                  </div>
                  <div>
                    <h3 className="font-bebas text-5xl text-white uppercase leading-none">
                      CATEGORÍA <span className="text-red-500">LIBRE 5K</span>
                    </h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-bebas text-6xl text-white tabular-nums leading-none">
                        S/ 35.00
                      </span>
                      <span className="text-xs text-neutral-400">inscripción completa</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-sm text-neutral-300 pt-3 border-t border-white/10">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Circuito oficial de 5 kilómetros por Rioja</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Kit completo: medalla, gorra, hidratación, panetón y chocolate</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Meta festiva en Don Diogo con show infantil</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectCategoryAndRegister('Libre 5K')}
                  className="w-full py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bebas text-2xl tracking-wider uppercase transition cursor-pointer shadow-lg shadow-red-600/25"
                >
                  Elegir Libre 5K (S/ 35)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TU KIT INCLUYE + SHOW INFANTIL */}
      <section
        id="kit-rioja"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#060606]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Structured Kit Items + Show Infantil */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-[0.26em] text-amber-400">
                Beneficios Incluidos en Ambas Categorías
              </p>
              <h2 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-wide mt-2 leading-none">
                TU KIT <span className="text-red-500">INCLUYE</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              {RIOJA_KIT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-5 rounded-2xl bg-neutral-950 border border-white/10 flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${item.accent}`} />
                    </div>
                    <div>
                      <h3 className="font-bebas text-2xl text-white uppercase tracking-wide leading-none">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show Infantil Callout */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-neutral-950 to-red-600/15 border border-amber-400/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center shrink-0">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                  Experiencia Familiar en Don Diogo
                </p>
                <h3 className="font-bebas text-3xl text-white uppercase tracking-wide leading-tight">
                  Además, disfruta de un Show Infantil
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-0.5">
                  Al terminar la carrera celebraremos juntos con música, chocolatada navideña y un show especial para todos los niños.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Official Kit Flyer */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.00.04_AM__3__f1f05e5d.jpeg"
                alt="Tu kit Santa Run Rioja 2026 incluye medalla finisher, gorra navideña, hidratación, panetón, chocolate, pulsera y show infantil"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PROPÓSITO SOLIDARIO & ALIANZA SACHA RUNNERS */}
      <section
        id="causa-rioja"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#090909]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.26em] text-red-400">
              Propósito Social · En Alianza Estratégica con Sacha Runners
            </p>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white uppercase tracking-wide mt-2 leading-none">
              CORRE Y REGALA <span className="text-red-500">SONRISAS</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 mt-4 leading-relaxed">
              <strong className="text-white">
                Cada inscripción nos permitirá invitar a niños y niñas en situación de vulnerabilidad
              </strong>{' '}
              para que vivan una mañana navideña inolvidable junto a la comunidad de{' '}
              <strong className="text-amber-300">OHANA GO</strong> y{' '}
              <strong className="text-emerald-400">SACHA RUNNERS</strong> (Corremos · Conectamos · Crecemos).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
            <div className="rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl flex items-center justify-center">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.34.06_AM_0e58b6ac.jpeg"
                alt="Santa Run Rioja 2026 en alianza estratégica con Sacha Runners: cada inscripción invita a niños y niñas en situación de vulnerabilidad"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain block"
              />
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl flex items-center justify-center">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.00.04_AM__2__c3bec4be.jpeg"
                alt="Corre y regala Sonrisas - Santa Run Rioja 2026"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: REGISTRATION FORM */}
      <RiojaRegistrationForm
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRegistrationSuccess={onRegistrationSuccess}
        onOpenCompetitorLogin={onOpenCompetitorLogin}
      />

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-neutral-400">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-bebas text-2xl text-white tracking-wider">
              OHANA <span className="text-red-500">GO</span> ×{' '}
              <span className="text-emerald-400">SACHA RUNNERS</span>
            </span>
            <span className="hidden sm:inline text-neutral-600">·</span>
            <span>Santa Run Rioja 2026 · Domingo 20 Dic · Llegada Don Diogo</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <button
              type="button"
              onClick={onBackToHub}
              className="hover:text-white transition cursor-pointer"
            >
              Inicio OHANA GO
            </button>
            <a
              href="/santaruntarapoto"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToTarapoto();
              }}
              className="hover:text-white transition"
            >
              Santa Run Tarapoto
            </a>
            <a
              href="https://www.instagram.com/ohanago.peru/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition"
            >
              <Instagram className="w-3.5 h-3.5 text-rose-400" />
              <span>@ohanago.peru</span>
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Organizador</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
