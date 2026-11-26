const assert = require('assert');
const { getPrimaryEmpresaId, isPrimaryEmpresa } = require('./networkCompanies');

assert.strictEqual(getPrimaryEmpresaId([{ id: 5 }, { id: 2 }, { id: 9 }]), 2);
assert.strictEqual(getPrimaryEmpresaId([{ id: '3' }, { id: '10' }]), 3);
assert.strictEqual(getPrimaryEmpresaId([]), null);
assert.strictEqual(getPrimaryEmpresaId(null), null);
assert.strictEqual(isPrimaryEmpresa({ id: 2 }, [{ id: 5 }, { id: 2 }]), true);
assert.strictEqual(isPrimaryEmpresa({ id: 5 }, [{ id: 5 }, { id: 2 }]), false);
assert.strictEqual(isPrimaryEmpresa({ id: 1, user_id: 7 }, [{ id: 1, user_id: 7 }, { id: 8, user_id: 7 }]), true);
assert.strictEqual(isPrimaryEmpresa({ id: 8, user_id: 7 }, [{ id: 1, user_id: 7 }, { id: 8, user_id: 7 }]), false);

console.log('networkCompanies tests passed');
