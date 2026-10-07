const PUBLIC_PROMOCAO_ATTRIBUTES = Object.freeze([
  'id',
  'nome',
  'descricao',
  'tipo_desconto',
  'valor_desconto',
  'meses_gratis',
  'destaque',
  'cor_destaque',
  'imagem_promocao_url',
  'data_inicio',
  'data_fim'
]);

const SECRET_PROMOCAO_FIELDS = Object.freeze([
  'codigo_promocional',
  'limite_uso',
  'uso_atual',
  'observacoes',
  'condicoes',
  'pacotes_aplicaveis',
  'funcionalidade_extra'
]);

const toPublicPromocao = (promocao) => {
  if (!promocao) return null;
  const raw = typeof promocao.toJSON === 'function' ? promocao.toJSON() : { ...promocao };
  const publicPromo = {};
  for (const field of PUBLIC_PROMOCAO_ATTRIBUTES) {
    if (raw[field] !== undefined) publicPromo[field] = raw[field];
  }
  return publicPromo;
};

module.exports = {
  PUBLIC_PROMOCAO_ATTRIBUTES,
  SECRET_PROMOCAO_FIELDS,
  toPublicPromocao
};
