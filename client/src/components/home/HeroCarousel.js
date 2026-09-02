import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TimeFlowBrand from './TimeFlowBrand';

export const HERO_SLIDES = [
  {
    id: 'beauty',
    image: '/images/timeflow-hero-beauty-v2.jpg',
    alt: 'Profissional de beleza organizando atendimentos em um tablet',
    eyebrow: 'Beleza e estética',
    title: 'Organize seu tempo. Potencialize seus resultados.',
    description: 'Agendas, equipe e clientes conectados para uma rotina mais leve.',
    tags: ['Salões', 'Estética', 'Bem-estar'],
    objectPosition: 'center'
  },
  {
    id: 'dentist',
    image: '/images/timeflow-hero-dentist-v1.jpg',
    alt: 'Dentista organizando a agenda do consultório em um tablet',
    eyebrow: 'Clínicas e consultórios',
    title: 'Mais tempo para cuidar. Menos tempo organizando.',
    description: 'Consultas, profissionais e pacientes no mesmo fluxo de trabalho.',
    tags: ['Odontologia', 'Saúde', 'Consultórios'],
    objectPosition: 'center'
  },
  {
    id: 'fitness',
    image: '/images/timeflow-hero-fitness-v1.jpg',
    alt: 'Personal trainer organizando sessões de treino em um tablet',
    eyebrow: 'Esporte e performance',
    title: 'Treinos em dia. Agenda no seu ritmo.',
    description: 'Acompanhe sessões e horários sem perder o foco nos seus alunos.',
    tags: ['Personal', 'Academias', 'Estúdios'],
    objectPosition: 'center'
  },
  {
    id: 'barber',
    image: '/images/timeflow-hero-barber-v1.jpg',
    alt: 'Barbeiro organizando os horários da barbearia em um tablet',
    eyebrow: 'Barbearias e grooming',
    title: 'Cada cliente no horário certo.',
    description: 'Uma agenda profissional para atender melhor e fazer o negócio crescer.',
    tags: ['Barbearias', 'Grooming', 'Salões masculinos'],
    objectPosition: 'center'
  }
];

const HeroCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const nextSlide = HERO_SLIDES[(activeSlide + 1) % HERO_SLIDES.length];
    const preloadedImage = new Image();
    preloadedImage.src = nextSlide.image;
  }, [activeSlide]);

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [activeSlide, isPaused]);

  const showPrevious = () => {
    setActiveSlide((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const showNext = () => {
    setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false);
    }
  };

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Segmentos atendidos pelo TimeFlow"
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlur}
    >
      <img
        key={currentSlide.id}
        src={currentSlide.image}
        alt={currentSlide.alt}
        className="absolute inset-0 h-full w-full animate-fade-in object-cover"
        style={{ objectPosition: currentSlide.objectPosition }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/5 to-slate-950/90 lg:bg-gradient-to-r lg:from-slate-950/55 lg:via-slate-950/5 lg:to-slate-950/30" />

      <div className="absolute inset-x-0 top-0 hidden p-6 sm:p-8 lg:block">
        <TimeFlowBrand inverted />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 pr-24 text-white sm:p-8 sm:pr-36 lg:p-10 lg:pr-36" aria-live="off">
        <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] backdrop-blur-md">
          {currentSlide.eyebrow}
        </div>
        <h2 className="max-w-xl text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {currentSlide.title}
        </h2>
        <p className="mt-3 hidden max-w-md text-sm leading-6 text-white/75 sm:block">
          {currentSlide.description}
        </p>
        <div className="mt-5 hidden gap-2 text-xs font-bold text-white/80 sm:flex">
          {currentSlide.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/15 bg-slate-950/25 px-3 py-1.5 backdrop-blur-md">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={showPrevious}
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-slate-950/35 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 sm:flex"
          aria-label="Segmento anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/35 px-2.5 py-2 backdrop-blur-md">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${index === activeSlide ? 'w-5 bg-emerald-400' : 'w-2 bg-white/55 hover:bg-white'}`}
              aria-label={`Mostrar ${slide.eyebrow}`}
              aria-current={index === activeSlide ? 'true' : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={showNext}
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-slate-950/35 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 sm:flex"
          aria-label="Próximo segmento"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <span className="sr-only">Slide {activeSlide + 1} de {HERO_SLIDES.length}: {currentSlide.eyebrow}</span>
    </div>
  );
};

export default HeroCarousel;
