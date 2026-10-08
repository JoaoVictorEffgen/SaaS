const isSameUser = (requester, target) =>
  Number(requester?.id) === Number(target?.id);

const canViewProfilePhoto = (requester, target) => {
  if (!requester || !target || target.ativo === false) return false;
  if (isSameUser(requester, target)) return true;
  // Profissionais aparecem na vitrine autenticada; clientes e donos de empresa não.
  return target.tipo === 'funcionario';
};

const toPublicProfilePhoto = (user) => ({
  id: user.id,
  nome: user.nome,
  url_foto_perfil: user.url_foto_perfil || null
});

module.exports = {
  canViewProfilePhoto,
  toPublicProfilePhoto
};
