import { formatDateOnly } from './dateOnly';

describe('formatDateOnly', () => {
  it('preserva o dia civil local em vez de converter para UTC', () => {
    const localMidnight = new Date(2026, 8, 17, 0, 0, 0);

    expect(formatDateOnly(localMidnight)).toBe('2026-09-17');
  });

  it('não antecipa o dia quando o fuso local está atrás de UTC', () => {
    const lateEvening = new Date(2026, 8, 17, 21, 30, 0);

    expect(formatDateOnly(lateEvening)).toBe('2026-09-17');

    if (lateEvening.getTimezoneOffset() > 0) {
      expect(lateEvening.toISOString().split('T')[0]).not.toBe('2026-09-17');
    }
  });

  it('mantém strings YYYY-MM-DD sem reinterpretá-las', () => {
    expect(formatDateOnly('2026-09-17')).toBe('2026-09-17');
  });
});
