# 🚀 Instruções de Execução - Quiz Online

## ⚡ Início Rápido

```bash
# 1. Setup inicial (apenas primeira vez)
npm run setup

# 2. Executar todos os serviços
npm run dev
```

Acesse:
- **Admin UI**: http://localhost:3000
- **API**: http://localhost:3001/api
- **QRCode Hunter Original**: http://localhost:5173

## 📋 Comandos Disponíveis

### Setup e Instalação
```bash
npm run setup          # Configuração inicial completa
npm install            # Instalar dependências
npm run clean          # Limpar builds e node_modules
```

### Desenvolvimento
```bash
npm run dev            # Todos os serviços
npm run dev:server     # Apenas servidor (porta 3001)
npm run dev:admin      # Apenas admin UI (porta 3000)
npm run dev:original   # Apenas QRCode Hunter original
```

### Build e Produção
```bash
npm run build          # Build completo
npm run build:shared   # Build apenas shared
npm run build:server   # Build apenas servidor
npm run build:admin    # Build apenas admin UI
npm run start:server   # Iniciar servidor em produção
```

### Testes
```bash
npm test               # Todos os testes
npm run test:server    # Testes do servidor
npm run test:admin     # Testes do admin UI
npm run test:watch     # Testes em modo watch
npm run test:coverage  # Cobertura de testes
```

### Linting
```bash
npm run lint           # Lint em todos os pacotes
```

## 🔧 Configuração de Ambiente

### Servidor (.env)
```bash
# packages/server/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=sqlite:./quiz.db
CORS_ORIGIN=http://localhost:3000
```

### Admin UI (.env)
```bash
# packages/admin-ui/.env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## 🎯 Fluxo de Desenvolvimento

### 1. Criar um Quiz
1. Acesse http://localhost:3000
2. Clique em "Novo Quiz"
3. Adicione título e descrição
4. Crie perguntas com opções
5. Configure cores e formas
6. Ative o quiz

### 2. Testar API
```bash
# Health check
curl http://localhost:3001/health

# Listar quizzes
curl http://localhost:3001/api/quiz

# Criar quiz
curl -X POST http://localhost:3001/api/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quiz Teste",
    "description": "Teste via API",
    "questions": [],
    "isActive": true
  }'
```

### 3. Testar WebSocket
```javascript
// No console do navegador
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Conectado!');
  
  // Criar sessão
  socket.emit('admin:create-session', { quizId: 'quiz-id' });
});

socket.on('session:created', (data) => {
  console.log('Sessão criada:', data);
});
```

## 🧪 Executar Testes

### Testes Unitários
```bash
# Servidor
cd packages/server
npm test

# Específico
npm test -- QuizService.test.ts

# Watch mode
npm test -- --watch
```

### Testes de Integração
```bash
# Teste completo da API
cd packages/server
npm run test:integration

# Teste de WebSocket
npm test -- WebSocketHandler.test.ts
```

### Testes do Frontend
```bash
# Admin UI
cd packages/admin-ui
npm test

# Componente específico
npm test -- QuestionCard.test.tsx
```

## 🐛 Troubleshooting

### Erro: "Cannot find module '@qrcode-hunter/shared'"
```bash
npm run build:shared
```

### Erro: "Port 3001 already in use"
```bash
# Matar processo na porta
npx kill-port 3001

# Ou alterar porta no .env
echo "PORT=3002" >> packages/server/.env
```

### Erro: "WebSocket connection failed"
1. Verificar se servidor está rodando
2. Verificar CORS no servidor
3. Verificar URL do WebSocket no frontend

### Erro de Build
```bash
# Limpar e reinstalar
npm run clean
npm install
npm run setup
```

## 📊 Monitoramento

### Logs do Servidor
```bash
# Logs em tempo real
tail -f packages/server/logs/server.log

# Logs de erro
tail -f packages/server/logs/error.log
```

### Health Checks
```bash
# Servidor
curl http://localhost:3001/health

# Admin UI
curl http://localhost:3000

# WebSocket
wscat -c ws://localhost:3001/socket.io/?EIO=4&transport=websocket
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção Local
```bash
npm run build
npm run start:server
```

### Docker (Futuro)
```bash
docker build -t quiz-online .
docker run -p 3001:3001 quiz-online
```

## 📝 Estrutura de Arquivos

```
qrcode-hunter-quiz/
├── packages/
│   ├── shared/           # Tipos compartilhados
│   ├── server/           # API e WebSocket
│   └── admin-ui/         # Interface administrativa
├── src/                  # QRCode Hunter original
├── scripts/              # Scripts de setup
└── docs/                 # Documentação
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra Pull Request

### Padrões de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 📞 Suporte

- **Issues**: GitHub Issues
- **Documentação**: README-QUIZ.md
- **API**: http://localhost:3001/api/docs (futuro)

---

**Desenvolvido com ❤️ usando Clean Code, SOLID e TDD**