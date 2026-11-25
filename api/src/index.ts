import { criarApp } from './app.js';
import { config } from './config.js';
import { criarStore } from './store.js';

const store = criarStore({
  nomeEstabelecimento: config.establishmentName,
  dono: { nome: config.donoNome, email: config.donoEmail, senha: config.donoSenha }
});

criarApp(store).listen(config.port, () => {
  console.log(`API em http://localhost:${config.port}`);
  console.log(`Login do dono: ${config.donoEmail}`);
});
