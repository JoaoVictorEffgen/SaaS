const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { canViewProfilePhoto, toPublicProfilePhoto } = require('./profilePhotoAccess');

describe('canViewProfilePhoto', () => {
  const cliente = { id: 10, tipo: 'cliente', ativo: true, nome: 'Maria Cliente' };
  const outroCliente = { id: 11, tipo: 'cliente', ativo: true, nome: 'João Cliente' };
  const empresa = { id: 1, tipo: 'empresa', ativo: true, nome: 'Salão Demo' };
  const funcionario = { id: 2, tipo: 'funcionario', ativo: true, nome: 'Ana Martins' };
  const funcionarioInativo = { id: 3, tipo: 'funcionario', ativo: false, nome: 'Ex Colaborador' };

  it('recusa consulta sem autenticacao', () => {
    assert.equal(canViewProfilePhoto(null, funcionario), false);
    assert.equal(canViewProfilePhoto(undefined, cliente), false);
  });

  it('permite o proprio usuario ver sua foto', () => {
    assert.equal(canViewProfilePhoto(cliente, cliente), true);
    assert.equal(canViewProfilePhoto(empresa, empresa), true);
  });

  it('bloqueia enumeracao de clientes e empresas por terceiros', () => {
    assert.equal(canViewProfilePhoto(cliente, outroCliente), false);
    assert.equal(canViewProfilePhoto(cliente, empresa), false);
    assert.equal(canViewProfilePhoto(funcionario, cliente), false);
  });

  it('permite ver foto de profissional ativo na vitrine', () => {
    assert.equal(canViewProfilePhoto(cliente, funcionario), true);
    assert.equal(canViewProfilePhoto(empresa, funcionario), true);
  });

  it('nao expoe profissional inativo', () => {
    assert.equal(canViewProfilePhoto(cliente, funcionarioInativo), false);
    assert.equal(canViewProfilePhoto(funcionarioInativo, funcionarioInativo), false);
  });
});

describe('toPublicProfilePhoto', () => {
  it('nao inclui tipo, email ou outros campos internos', () => {
    assert.deepEqual(
      toPublicProfilePhoto({
        id: 10,
        nome: 'Maria Cliente',
        url_foto_perfil: 'https://cdn.example/foto.jpg',
        email: 'maria@example.com',
        tipo: 'cliente',
        senha: 'hash'
      }),
      {
        id: 10,
        nome: 'Maria Cliente',
        url_foto_perfil: 'https://cdn.example/foto.jpg'
      }
    );
  });
});
