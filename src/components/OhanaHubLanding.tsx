import React from 'react';
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  User,
  Instagram,
  Shield,
  Heart,
  Gift,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface OhanaHubLandingProps {
  onSelectTarapoto: () => void;
  onSelectRioja: () => void;
  onOpenCompetitorLogin: () => void;
  onOpenAdmin: () => void;
  loggedInCompetitorName?: string | null;
}

export const OhanaHubLanding: React.FC<OhanaHubLandingProps> = ({
  onSelectTarapoto,
  onSelectRioja,
  onOpenCompetitorLogin,
  onOpenAdmin,
  loggedInCompetitorName,
}) => {
  return (
    <div className="min-h-screen bg-[#060606] text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white relative z-30">
      {/* Subtle atmospheric top glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] opacity-35"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(220, 38, 38, 0.35), transparent 70%)',
        }}
      />

      {/* Clean 3-Zone Top Header */}
      <header className="sticky top-0 z-40 bg-[#060606]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <BrandLogo size="sm" variant="crimson" />
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-widest text-neutral-300">
            <a
              href="/santaruntarapoto"
              onClick={(e) => {
                e.preventDefault();
                onSelectTarapoto();
              }}
              className="hover:text-white transition"
            >
              Santa Run Tarapoto
            </a>
            <a
              href="/santarunrioja"
              onClick={(e) => {
                e.preventDefault();
                onSelectRioja();
              }}
              className="hover:text-white transition"
            >
              Santa Run Rioja
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
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
              href="https://www.instagram.com/ohanago.peru/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram oficial @ohanago.peru"
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-red-500/40 text-neutral-200 hover:text-white transition flex items-center gap-2 text-xs font-mono font-bold"
            >
              <Instagram className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">@ohanago.peru</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Hub Selector */}
      <main className="flex-1 relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 sm:pb-24">
          {/* Editorial Heading */}
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.28em] text-amber-400 mb-3">
              OHANA GO · MUÉVETE. CONECTA. VIVE.
            </p>
            <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white uppercase leading-[0.92]">
              ELIGE TU SEDE <span className="text-red-500">SANTA RUN 2026</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Dos ciudades de San Martín, un mismo propósito navideño: correr, compartir en comunidad y regalar sonrisas. Selecciona tu evento oficial para ver toda la información e inscribirte.
            </p>
          </div>

          {/* Two Massive Side-by-Side Event Selector Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* CARD 1: SANTA RUN TARAPOTO 2026 */}
            <article
              onClick={onSelectTarapoto}
              className="group relative bg-neutral-950 border-2 border-red-600/50 hover:border-red-500 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(220,38,38,0.16)] hover:shadow-[0_24px_75px_rgba(220,38,38,0.28)] transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Event Poster Showcase */}
              <div className="relative bg-black aspect-[4/3] sm:aspect-[16/11] overflow-hidden border-b border-white/10">
                <img
                  src="/assets/aistudio/santa_run_poster_edition.jpeg"
                  alt="Afiche oficial Santa Run Tarapoto 2026 por OHANA GO"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-black group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-sm border border-red-500/50 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
                    Sede Tarapoto · 6K Nocturna
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-mono font-bold text-amber-400 tabular-nums">
                    S/ 70.00
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                      ohanago.pro/santaruntarapoto
                    </p>
                    <h2 className="font-bebas text-4xl sm:text-5xl text-white uppercase tracking-wide mt-1 leading-none">
                      SANTA RUN <span className="text-red-500">TARAPOTO</span> 2026
                    </h2>
                    <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                      Carrera navideña nocturna de 6K con polo oficial Dry-Fit, gorra de Santa, mochila, medalla finisher, hidratación y gran sorteo de un pavo navideño.
                    </p>
                  </div>

                  {/* Key Logistics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
                    <div className="bg-black/70 border border-white/10 rounded-xl p-3">
                      <span className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                        <Calendar className="w-3.5 h-3.5 text-red-400" /> Fecha
                      </span>
                      <span className="block text-white font-bold mt-1">Sábado 19 Dic</span>
                    </div>
                    <div className="bg-black/70 border border-white/10 rounded-xl p-3">
                      <span className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Partida
                      </span>
                      <span className="block text-white font-bold mt-1 tabular-nums">7:00 p. m.</span>
                    </div>
                    <div className="bg-black/70 border border-white/10 rounded-xl p-3">
                      <span className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Ruta
                      </span>
                      <span className="block text-white font-bold mt-1">Aviación → Concha</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>15% de descuento automático (S/ 59.50) para atletas de ediciones anteriores.</span>
                  </div>
                </div>

                {/* Primary CTA */}
                <a
                  href="/santaruntarapoto"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectTarapoto();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bebas text-2xl sm:text-3xl tracking-wider uppercase transition flex items-center justify-center gap-3 shadow-lg shadow-red-600/30"
                >
                  <span>Entrar a Santa Run Tarapoto</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </article>

            {/* CARD 2: SANTA RUN RIOJA 2026 */}
            <article
              onClick={onSelectRioja}
              className="group relative bg-neutral-950 border-2 border-amber-500/50 hover:border-amber-400 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(245,158,11,0.14)] hover:shadow-[0_24px_75px_rgba(245,158,11,0.24)] transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Event Poster Showcase */}
              <div className="relative bg-black aspect-[4/3] sm:aspect-[16/11] overflow-hidden border-b border-white/10">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.00.04_AM__1__922813aa.jpeg"
                  alt="Afiche oficial Santa Run Rioja 2026 por OHANA GO en alianza con Sacha Runners"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-black group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-sm border border-amber-400/50 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                    Sede Rioja · Alianza Sacha Runners
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-mono font-bold text-white tabular-nums">
                    S/ 25 · S/ 35
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                      ohanago.pro/santarunrioja
                    </p>
                    <h2 className="font-bebas text-4xl sm:text-5xl text-white uppercase tracking-wide mt-1 leading-none">
                      SANTA RUN <span className="text-amber-400">RIOJA</span> 2026
                    </h2>
                    <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                      En alianza estratégica con <strong className="text-white">Sacha Runners</strong>. Categorías <strong className="text-amber-300">Kids 2K (S/ 25)</strong> y <strong className="text-white">Libre 5K (S/ 35)</strong> con medalla finisher, gorra navideña, panetón, chocolate, pulsera y show infantil.
                    </p>
                  </div>

                  {/* Key Logistics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
                    <div className="bg-black/70 border border-white/10 rounded-xl p-3">
                      <span className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Fecha
                      </span>
                      <span className="block text-white font-bold mt-1">Domingo 20 Dic</span>
                    </div>
                    <div className="bg-black/70 border border-white/10 rounded-xl p-3">
                      <span className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                        <Clock className="w-3.5 h-3.5 text-red-400" /> Hora
                      </span>
                      <span className="block text-white font-bold mt-1 tabular-nums">7:30 a. m.</span>
                    </div>
                    <div className="bg-black/70 border border-white/10 rounded-xl p-3">
                      <span className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-bold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Llegada
                      </span>
                      <span className="block text-white font-bold mt-1">Don Diogo</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-rose-300 font-medium">
                    <Heart className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Cada inscripción invita a niños y niñas en situación de vulnerabilidad.</span>
                  </div>
                </div>

                {/* Primary CTA */}
                <a
                  href="/santarunrioja"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectRioja();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bebas text-2xl sm:text-3xl tracking-wider uppercase transition flex items-center justify-center gap-3 shadow-lg shadow-amber-500/25 font-black"
                >
                  <span>Entrar a Santa Run Rioja</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </article>
          </div>

          {/* Direct Mi Espacio Banner for Already Registered Athletes */}
          <div className="mt-10 sm:mt-12 bg-neutral-950 border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl sm:text-3xl text-white uppercase tracking-wide leading-none">
                  ¿Ya te inscribiste en Tarapoto o Rioja?
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Consulta tu estado de verificación, tu código QR oficial y tu ficha de participante con tu DNI en Mi Espacio.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenCompetitorLogin}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-red-500/40 hover:border-red-400 font-bebas text-xl tracking-wider uppercase transition cursor-pointer shrink-0"
            >
              Ingresar a Mi Espacio
            </button>
          </div>
        </section>
      </main>

      {/* Clean Hub Footer */}
      <footer className="border-t border-white/10 bg-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="font-bebas text-xl text-white tracking-wider">
              OHANA <span className="text-red-500">GO</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span>Santa Run 2026 · Tarapoto & Rioja</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              href="/santaruntarapoto"
              onClick={(e) => {
                e.preventDefault();
                onSelectTarapoto();
              }}
              className="hover:text-white transition font-mono"
            >
              /santaruntarapoto
            </a>
            <a
              href="/santarunrioja"
              onClick={(e) => {
                e.preventDefault();
                onSelectRioja();
              }}
              className="hover:text-white transition font-mono"
            >
              /santarunrioja
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-200 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Organizador</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
