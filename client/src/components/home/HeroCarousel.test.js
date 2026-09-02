import { HERO_SLIDES } from './HeroCarousel';

describe('HeroCarousel', () => {
  it('representa os quatro segmentos da página inicial', () => {
    expect(HERO_SLIDES).toHaveLength(4);
    expect(HERO_SLIDES.map((slide) => slide.id)).toEqual([
      'beauty',
      'dentist',
      'fitness',
      'barber'
    ]);
  });

  it('usa imagens e descrições acessíveis únicas', () => {
    expect(new Set(HERO_SLIDES.map((slide) => slide.image)).size).toBe(HERO_SLIDES.length);
    HERO_SLIDES.forEach((slide) => {
      expect(slide.alt).toBeTruthy();
      expect(slide.title).toBeTruthy();
    });
  });
});
