/**
 * Escopo de visibilidade de agendamentos por tipo de usuário.
 * Sem filtro de cliente/empresa/funcionário, listagens do dia vazam PII
 * entre tenants.
 */
const getAppointmentOwnerFilter = (user, empresaId = null) => {
  const tipo = String(user?.tipo || '');

  if (tipo === 'empresa') {
    if (empresaId === undefined || empresaId === null || empresaId === '') {
      return { notFound: true };
    }
    return { where: { empresa_id: Number(empresaId) } };
  }

  if (tipo === 'funcionario') {
    return { where: { funcionario_id: Number(user.id) } };
  }

  if (tipo === 'cliente') {
    return { where: { cliente_id: Number(user.id) } };
  }

  return { denied: true };
};

const appointmentMatchesOwnerFilter = (appointment, filter, fieldAliases = {}) => {
  if (!filter?.where) return false;
  return Object.entries(filter.where).every(([key, value]) => {
    const sourceKey = fieldAliases[key] || key;
    return Number(appointment[sourceKey]) === Number(value);
  });
};

module.exports = {
  getAppointmentOwnerFilter,
  appointmentMatchesOwnerFilter
};
