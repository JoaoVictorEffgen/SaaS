const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const {
  MANAGED_LOGO_NAME,
  MANAGED_PHOTO_NAME,
  resolveOwnedManagedFile,
  removeOwnedManagedFile
} = require('./managedUploads');

const logoDir = path.join(__dirname, '../uploads/logos-empresa');
const photoDir = path.join(__dirname, '../uploads/fotos-perfil');

describe('resolveOwnedManagedFile', () => {
  it('aceita logo gerenciado da própria empresa', () => {
    const resolved = resolveOwnedManagedFile(
      '/api/uploads/logos-empresa/empresa_12_1710000000000.webp',
      12,
      logoDir,
      MANAGED_LOGO_NAME
    );

    assert.equal(resolved, path.join(logoDir, 'empresa_12_1710000000000.webp'));
  });

  it('aceita URL absoluta da foto do próprio usuário', () => {
    const resolved = resolveOwnedManagedFile(
      'https://cdn.example/api/uploads/fotos-perfil/usuario_7_1710000000000.jpg',
      '7',
      photoDir,
      MANAGED_PHOTO_NAME
    );

    assert.equal(resolved, path.join(photoDir, 'usuario_7_1710000000000.jpg'));
  });

  it('recusa logo de outro tenant mesmo com nome gerenciado válido', () => {
    const resolved = resolveOwnedManagedFile(
      '/api/uploads/logos-empresa/empresa_99_1710000000000.png',
      12,
      logoDir,
      MANAGED_LOGO_NAME
    );

    assert.equal(resolved, null);
  });

  it('recusa foto de outro usuário', () => {
    const resolved = resolveOwnedManagedFile(
      '/api/uploads/fotos-perfil/usuario_3_1710000000000.jpg',
      8,
      photoDir,
      MANAGED_PHOTO_NAME
    );

    assert.equal(resolved, null);
  });

  it('recusa traversal e nomes fora do padrão gerenciado', () => {
    assert.equal(
      resolveOwnedManagedFile('/api/uploads/logos-empresa/../../etc/passwd', 12, logoDir, MANAGED_LOGO_NAME),
      null
    );
    assert.equal(
      resolveOwnedManagedFile('/api/uploads/logos-empresa/outro.png', 12, logoDir, MANAGED_LOGO_NAME),
      null
    );
    assert.equal(
      resolveOwnedManagedFile('', 12, logoDir, MANAGED_LOGO_NAME),
      null
    );
  });

  it('apaga só o arquivo gerenciado do dono', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'timeflow-uploads-'));
    const ownFile = path.join(tempDir, 'empresa_12_1710000000000.webp');
    const otherFile = path.join(tempDir, 'empresa_99_1710000000000.webp');
    fs.writeFileSync(ownFile, 'own');
    fs.writeFileSync(otherFile, 'other');

    await removeOwnedManagedFile(
      '/api/uploads/logos-empresa/empresa_99_1710000000000.webp',
      12,
      tempDir,
      MANAGED_LOGO_NAME
    );
    await removeOwnedManagedFile(
      '/api/uploads/logos-empresa/empresa_12_1710000000000.webp',
      12,
      tempDir,
      MANAGED_LOGO_NAME
    );

    assert.equal(fs.existsSync(otherFile), true);
    assert.equal(fs.existsSync(ownFile), false);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
