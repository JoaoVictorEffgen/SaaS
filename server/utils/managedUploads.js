const fs = require('fs');
const path = require('path');

const MANAGED_LOGO_NAME = /^empresa_(\d+)_\d+\.(jpg|png|webp)$/i;
const MANAGED_PHOTO_NAME = /^usuario_(\d+)_\d+\.(jpg|png|webp)$/i;

function managedUploadFilename(fileUrl) {
  if (!fileUrl) return null;

  try {
    return path.basename(new URL(String(fileUrl), 'http://timeflow.local').pathname);
  } catch {
    return null;
  }
}

function resolveOwnedManagedFile(fileUrl, ownerId, directory, namePattern) {
  const filename = managedUploadFilename(fileUrl);
  if (!filename || ownerId == null || ownerId === '') return null;

  const match = filename.match(namePattern);
  if (!match || String(match[1]) !== String(ownerId)) return null;

  const resolvedDirectory = path.resolve(directory);
  const resolvedFile = path.resolve(directory, filename);
  if (!resolvedFile.startsWith(`${resolvedDirectory}${path.sep}`)) return null;

  return resolvedFile;
}

async function removeOwnedManagedFile(fileUrl, ownerId, directory, namePattern) {
  const resolvedFile = resolveOwnedManagedFile(fileUrl, ownerId, directory, namePattern);
  if (!resolvedFile) return;

  await fs.promises.unlink(resolvedFile).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

module.exports = {
  MANAGED_LOGO_NAME,
  MANAGED_PHOTO_NAME,
  managedUploadFilename,
  resolveOwnedManagedFile,
  removeOwnedManagedFile
};
