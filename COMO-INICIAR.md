# 🚀 Como Iniciar o Projeto Quiz Online

## ⚡ Início Rápido (3 Passos)

### 1️⃣ **Preparar o Ambiente**
```bash
# Verificar versões necessárias
node --version  # Deve ser 18+
npm --version   # Deve ser 9+
```

### 2️⃣ **Instalar Dependências**
```bash
# Instalar dependências do shared
cd packages/shared
npm install

# Compilar o shared (necessário para outros pacotes)
npm run build

# Voltar para raiz
cd ../..

# Instalar dependências do servidor
cd packages/server
npm install

# Voltar para raiz
cd ../..

# Instalar dependências do admin-ui
cd packages/admin-ui
npm install

# Voltar para raiz
cd ../..
```

### 3️⃣ **Executar o Projeto**

**Opção A: Executar tudo separadamente (Recomendado)**
```bash
# Terminal 1 - Servidor (porta 3001)
cd packages/server
npm run dev

# Terminal 2 - Admin UI (porta 3000)
cd packages/admin-ui
npm run dev

# Terminal 3 - QRCode Hunter Original (porta 5173)
npm run dev
```

**Opção B: Script automatizado**
```bash
# Na raiz do projeto
npm run dev
```

## 🌐 **URLs de Acesso**

Após iniciar os serviços:

- **🎯 Quiz Admin**: http://localhost:3000
- **📡 API Server**: http://localhost:3001/api
- **❤️ Health Check**: http://localhost:3001/health
- **📱 QRCode Hunter**: http://localhost:5173

## 🔧 **Configuração Inicial**

### Criar Arquivos de Ambiente

**1. Servidor (.env)**
```bash
# packages/server/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=sqlite:./quiz.db
CORS_ORIGIN=http://localhost:3000
```

**2. Admin UI (.env)**
```bash
# packages/admin-ui/.env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## 🎮 **Testando o Sistema**

### 1. Verificar Servidor
```bash
curl http://localhost:3001/health
# Deve retornar: {"status":"OK","timestamp":"..."}
```

### 2. Testar Admin UI
1. Acesse http://localhost:3000
2. Você deve ver o Dashboard
3. Clique em "Novo Quiz" para criar um quiz

### 3. Testar API
```bash
# Listar quizzes
curl http://localhost:3001/api/quiz

# Criar quiz de teste
curl -X POST http://localhost:3001/api/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quiz de Teste",
    "description": "Meu primeiro quiz",
    "questions": [
      {
        "title": "Qual é a capital do Brasil?",
        "options": [
          {"text": "São Paulo", "color": "#dc2626", "shape": "circle"},
          {"text": "Rio de Janeiro", "color": "#2563eb", "shape": "square"},
          {"text": "Brasília", "color": "#16a34a", "shape": "triangle"},
          {"text": "Salvador", "color": "#ca8a04", "shape": "diamond"}
        ],
        "correctAnswer": 2,
        "timeLimit": 30,
        "points": 1000
      }
    ],
    "isActive": true
  }'
```

## 🧪 **Executar Testes**

```bash
# Testes do servidor
cd packages/server
npm test

# Testes do admin-ui
cd packages/admin-ui
npm test

# Todos os testes
npm test
```

## 🐛 **Solução de Problemas**

### Erro: "Cannot find module '@qrcode-hunter/shared'"
```bash
cd packages/shared
npm run build
```

### Erro: "Port already in use"
```bash
# Matar processo na porta
npx kill-port 3001
npx kill-port 3000
```

### Erro: "CORS policy"
Verifique se o arquivo `.env` do servidor tem:
```
CORS_ORIGIN=http://localhost:3000
```

### Erro de dependências
```bash
# Limpar e reinstalar
rm -rf node_modules packages/*/node_modules
npm install --legacy-peer-deps
```

## 📋 **Comandos Úteis**

```bash
# Desenvolvimento
npm run dev              # Todos os serviços
npm run dev:server       # Apenas servidor
npm run dev:admin        # Apenas admin UI

# Build
npm run build            # Build completo
npm run build:shared     # Build apenas shared
npm run build:server     # Build apenas servidor
npm run build:admin      # Build apenas admin UI

# Testes
npm test                 # Todos os testes
npm run test:server      # Testes do servidor
npm run test:admin       # Testes do admin UI

# Linting
npm run lint             # Lint em todos os pacotes
```

## 🎯 **Próximos Passos**

Após iniciar o projeto:

1. **Criar seu primeiro quiz**:
   - Acesse http://localhost:3000
   - Clique em "Novo Quiz"
   - Adicione perguntas com opções coloridas

2. **Explorar a API**:
   - Acesse http://localhost:3001/health
   - Teste endpoints com curl ou Postman

3. **Desenvolver funcionalidades**:
   - Adicionar Player UI
   - Implementar persistência real
   - Integrar com QRCode Hunter

## 📚 **Documentação**

- `README-QUIZ.md` - Documentação completa
- `RESUMO-IMPLEMENTACAO.md` - Detalhes técnicos
- `INSTRUCOES-EXECUCAO.md` - Guia detalhado

---

**🎉 Pronto! Seu sistema Quiz Online está funcionando!**