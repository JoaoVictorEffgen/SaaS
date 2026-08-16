export const readJsonStorage = (key, fallback, storage = localStorage) => {
  const rawValue = storage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Valor inválido encontrado no armazenamento para "${key}".`);
    return fallback;
  }
};

