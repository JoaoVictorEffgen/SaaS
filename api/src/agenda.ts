import type { Agendamento, Horario, Servico } from './store.js';

export type Agora = { data: string; minutos: number };

export const paraMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

export const paraHora = (minutos: number) =>
  `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

export function agoraNoFuso(timezone: string, data = new Date()): Agora {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(data)
      .map((p) => [p.type, p.value])
  );
  return {
    data: `${partes.year}-${partes.month}-${partes.day}`,
    minutos: Number(partes.hour) * 60 + Number(partes.minute)
  };
}

export const diaDaSemana = (data: string) => new Date(`${data}T12:00:00Z`).getUTCDay();

const somarDias = (data: string, dias: number) => {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

export function horariosLivres(
  horario: Horario,
  agendamentos: Agendamento[],
  servico: Servico,
  data: string,
  agora: Agora
): string[] {
  if (data < agora.data || data > somarDias(agora.data, horario.diasAntecedencia)) return [];
  if (!horario.diasSemana.includes(diaDaSemana(data))) return [];

  const ocupados = agendamentos
    .filter((a) => a.data === data && a.status !== 'cancelado')
    .map((a) => [paraMinutos(a.hora), paraMinutos(a.hora) + a.duracaoMin]);

  const livres: string[] = [];
  const fim = paraMinutos(horario.fechamento);
  for (let inicio = paraMinutos(horario.abertura); inicio + servico.duracaoMin <= fim; inicio += horario.intervaloMin) {
    if (data === agora.data && inicio <= agora.minutos) continue;
    const termino = inicio + servico.duracaoMin;
    if (ocupados.some(([a, b]) => inicio < b && a < termino)) continue;
    livres.push(paraHora(inicio));
  }
  return livres;
}
