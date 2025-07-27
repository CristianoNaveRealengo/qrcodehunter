// Teste simples do servidor
const express = require('express');
const app = express();
const port = 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Quiz Online funcionando!' });
});

app.listen(port, () => {
  console.log(`🚀 Servidor teste rodando na porta ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});