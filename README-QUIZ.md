# Quiz Online - Sistema de Quiz em Tempo Real

Sistema de quiz online inspirado no Kahoot.it, integrado ao projeto QRCode Hunter. Implementa Clean Code, SOLID, TDD e arquitetura modular.

## 🎯 Funcionalidades

### Admin UI
- ✅ Criar e editar quizzes
- ✅ Gerenciar perguntas com múltiplas opções
- ✅ Configurar cores e formas para acessibilidade
- ✅ Iniciar sessões de jogo em tempo real
- ✅ Acompanhar progresso dos jogadores
- ✅ Visualizar resultados e estatísticas

### Player UI (Em desenvolvimento)
- 🔄 Entrar em sessões via PIN
- 🔄 Responder perguntas em tempo real
- 🔄 Ver ranking e pontuação
- 🔄 Interface otimizada para mobile

### Servidor
- ✅ API REST para gerenciamento de quizzes
- ✅ WebSocket para comunicação em tempo real
- ✅ Persistência de dados com repositórios
- ✅ Validação de dados com Zod
- ✅ Testes unitários e de integração

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUIZ ONLINE REAL-TIME                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Admin UI    │    │ Player UI   │    │ QRCode      │         │
│  │ (Solid.js)  │    │ (Solid.js)  │    │ Hunter      │         │
│  │             │    │             │    │ Integration │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              WebSocket Server (Socket.IO)                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Express/Fastify API                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │Controllers  │ │ Services    │ │Repositories │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Database Layer                          │ │
│  │              (SQLite/MongoDB + Prisma)                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm 9+

### Setup Inicial
```bash
# Instalar dependências
npm run setup

# Ou manualmente:
npm install
npm run build:shared
```

### Desenvolvimento
```bash
# Executar todos os serviços
npm run dev

# Ou individualmente:
npm run dev:server    # Servidor na porta 3001
npm run dev:admin     # Admin UI na porta 3000
npm run dev:original  # QRCode Hunter original
```

### Produção
```bash
# Build completo
npm run build

# Iniciar servidor
npm run start:server
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes específicos
npm run test:server
npm run test:admin

# Testes com watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📁 Estrutura do Projeto

```
qrcode-hunter-quiz/
├── packages/
│   ├── shared/                 # Tipos e utilitários compartilhados
│   │   ├── src/
│   │   │   └── types/
│   │   │       └── index.ts    # Interfaces e tipos
│   │   └── package.json
│   │
│   ├── server/                 # Servidor Node.js
│   │   ├── src/
│   │   │   ├── controllers/    # Controllers REST
│   │   │   ├── services/       # Lógica de negócio
│   │   │   ├── repositories/   # Acesso a dados
│   │   │   ├── websocket/      # Handlers WebSocket
│   │   │   ├── database/       # Conexão e modelos
│   │   │   └── __tests__/      # Testes unitários
│   │   └── package.json
│   │
│   └── admin-ui/               # Interface administrativa
│       ├── src/
│       │   ├── components/     # Componentes reutilizáveis
│       │   ├── pages/          # Páginas da aplicação
│       │   ├── context/        # Contextos Solid.js
│       │   ├── services/       # Serviços de API
│       │   └── styles/         # Estilos globais
│       └── package.json
│
├── src/                        # QRCode Hunter original
├── package.json                # Configuração workspace
└── README-QUIZ.md             # Esta documentação
```

## 🎮 Como Usar

### 1. Criar um Quiz (Admin)
1. Acesse `http://localhost:3000/admin`
2. Clique em "Novo Quiz"
3. Adicione título, descrição e perguntas
4. Configure opções com cores e formas
5. Ative o quiz

### 2. Iniciar Sessão de Jogo
1. No dashboard, clique em "Iniciar Sessão"
2. Compartilhe o PIN gerado
3. Aguarde jogadores entrarem
4. Inicie o jogo

### 3. Jogadores Participarem
1. Acesse `http://localhost:3000/play`
2. Digite o PIN da sessão
3. Insira seu nome
4. Responda as perguntas em tempo real

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Server (.env)
NODE_ENV=development
PORT=3001
DATABASE_URL=sqlite:./quiz.db
CORS_ORIGIN=http://localhost:3000
```

### Banco de Dados
O projeto usa SQLite por padrão com mocks para desenvolvimento. Para produção:

1. Configure Prisma ou MongoDB
2. Atualize `DatabaseConnection.ts`
3. Execute migrações

## 🎨 Temas e Acessibilidade

### Cores para Opções (WCAG Compliant)
- 🔴 Vermelho: `#dc2626` (Círculo)
- 🔵 Azul: `#2563eb` (Quadrado)  
- 🟢 Verde: `#16a34a` (Triângulo)
- 🟡 Amarelo: `#ca8a04` (Diamante)

### Formas Geométricas
- Círculo, Quadrado, Triângulo, Diamante
- Suporte para usuários com daltonismo
- Alto contraste disponível

## 🧪 Testes TDD

### Cobertura Atual
- ✅ QuizService: Criação, validação, CRUD
- ✅ GameService: Sessões, jogadores, pontuação
- ✅ Repositories: Persistência de dados
- ✅ Controllers: Endpoints REST
- 🔄 WebSocket: Eventos em tempo real
- 🔄 Components: Interface do usuário

### Executar Testes
```bash
# Servidor
cd packages/server
npm test

# Específicos
npm test -- QuizService.test.ts
npm test -- --watch
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm run start:server
```

### Docker (Futuro)
```dockerfile
# Dockerfile exemplo
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:server"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### Padrões de Código
- Clean Code e SOLID
- TDD (Test-Driven Development)
- TypeScript strict mode
- ESLint + Prettier
- Commits convencionais

## 📝 Roadmap

### Fase 1 - MVP ✅
- [x] Estrutura base do projeto
- [x] Servidor com WebSocket
- [x] Admin UI básica
- [x] Testes unitários

### Fase 2 - Player UI 🔄
- [ ] Interface do jogador
- [ ] Responsividade mobile
- [ ] PWA support

### Fase 3 - Recursos Avançados 📋
- [ ] Relatórios e analytics
- [ ] Integração com QRCode Hunter
- [ ] Multiplayer avançado
- [ ] Temas personalizados

### Fase 4 - Produção 📋
- [ ] Deploy automatizado
- [ ] Monitoramento
- [ ] Backup e recovery
- [ ] Documentação API

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Inspirado no [Kahoot.it](https://kahoot.it)
- Solid.js community
- Socket.IO team
- Contributors do projeto

---

**Desenvolvido com ❤️ usando Clean Code, SOLID e TDD**