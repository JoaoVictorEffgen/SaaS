const PROMOCAO_UPDATABLE_FIELDS = Object.freeze([
  'nome',
  'descricao',
  'tipo_desconto',
  'valor_desconto',
  'meses_gratis',
  'funcionalidade_extra',
  'codigo_promocional',
  'data_inicio',
  'data_fim',
  'pacotes_aplicaveis',
  'condicoes',
  'limite_uso',
  'destaque',
  'cor_destaque',
  'imagem_promocao_url',
  'observacoes',
  'ativo'
]);

const PROMOCAO_LOCKED_FIELDS = Object.freeze([
  'id',
  'empresa_id',
  'uso_atual',
  'created_at',
  'updated_at'
]);

const sanitizePromocaoUpdate = (body) =>
  Object.fromEntries(
    Object.entries(body || {}).filter(([key]) =>
      PROMOCAO_UPDATABLE_FIELDS.includes(key) && !PROMOCAO_LOCKED_FIELDS.includes(key)
    )
  );

module.exports = {
  PROMOCAO_UPDATABLE_FIELDS,
  PROMOCAO_LOCKED_FIELDS,
  sanitizePromocaoUpdate
};
