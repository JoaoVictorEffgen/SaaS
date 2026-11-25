const moedaFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const moeda = (valor: number) => moedaFormatter.format(valor);

export const dataIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const hojeIso = () => dataIso(new Date());

export function proximosDias(quantidade: number, diasSemana: number[]) {
  const dias: string[] = [];
  const d = new Date();
  for (let i = 0; i < quantidade; i++) {
    if (diasSemana.includes(d.getDay())) dias.push(dataIso(d));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

const paraDate = (iso: string) => new Date(`${iso}T12:00:00`);

export const diaCurto = (iso: string) =>
  paraDate(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });

export const dataLonga = (iso: string) =>
  paraDate(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

export function telefone(digitos: string) {
  const d = digitos.replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}
