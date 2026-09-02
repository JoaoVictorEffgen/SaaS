const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

const getBusinessClock = (date = new Date(), timeZone = process.env.BUSINESS_TIMEZONE || DEFAULT_TIME_ZONE) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    timeZone
  };
};

const isValidDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [year, month, day] = String(value).split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
};

const isFutureBusinessSlot = (date, minutes, now = new Date()) => {
  const clock = getBusinessClock(now);
  return date > clock.date || (date === clock.date && minutes > clock.minutes);
};

module.exports = {
  DEFAULT_TIME_ZONE,
  getBusinessClock,
  isFutureBusinessSlot,
  isValidDateOnly
};
