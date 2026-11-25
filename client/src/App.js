import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import AssistenteApp from './assistente/AssistenteApp';

function App() {
  return (
    <ThemeProvider>
      <AssistenteApp />
    </ThemeProvider>
  );
}

export default App;
