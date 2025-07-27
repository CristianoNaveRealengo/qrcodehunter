import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameController } from './controllers/GameController';
import { QuizController } from './controllers/QuizController';
import { DatabaseConnection } from './database/DatabaseConnection';
import { GameRepository } from './repositories/GameRepository';
import { QuizRepository } from './repositories/QuizRepository';
import { GameService } from './services/GameService';
import { QuizService } from './services/QuizService';
import { WebSocketHandler } from './websocket/WebSocketHandler';

/**
 * Servidor principal do Quiz Online
 * Implementa Clean Architecture com injeção de dependências
 */
class QuizServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private port: number;

  constructor(port: number = 3001) {
    this.port = port;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Injeção de dependências seguindo SOLID
    const database = new DatabaseConnection();
    const quizRepository = new QuizRepository(database);
    const gameRepository = new GameRepository(database);
    
    const quizService = new QuizService(quizRepository);
    const gameService = new GameService(gameRepository, quizRepository);
    
    const quizController = new QuizController(quizService);
    const gameController = new GameController(gameService);

    // Rotas da API REST
    this.app.use('/api/quiz', quizController.getRouter());
    this.app.use('/api/game', gameController.getRouter());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  private setupWebSocket(): void {
    const database = new DatabaseConnection();
    const gameRepository = new GameRepository(database);
    const quizRepository = new QuizRepository(database);
    const gameService = new GameService(gameRepository, quizRepository);
    
    const wsHandler = new WebSocketHandler(this.io, gameService);
    wsHandler.initialize();
  }

  public async start(): Promise<void> {
    try {
      // Inicializar conexão com banco
      const database = new DatabaseConnection();
      await database.connect();
      
      this.server.listen(this.port, () => {
        console.log(`🚀 Servidor Quiz Online rodando na porta ${this.port}`);
        console.log(`📊 Admin UI: http://localhost:3000/admin`);
        console.log(`🎮 Player UI: http://localhost:3000/play`);
      });
    } catch (error) {
      console.error('❌ Erro ao iniciar servidor:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('🛑 Servidor encerrado');
        resolve();
      });
    });
  }
}

// Inicialização do servidor
if (require.main === module) {
  const server = new QuizServer();
  server.start();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}

export { QuizServer };
