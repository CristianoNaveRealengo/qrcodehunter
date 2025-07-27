#!/usr/bin/env node

/**
 * Script de configuração inicial do projeto Quiz Online
 * Configura workspaces, dependências e estrutura inicial
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    log(`Executando: ${command}`, 'cyan');
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log(`Erro ao executar: ${command}`, 'red');
    log(error.message, 'red');
    return false;
  }
}

function createDirectoryIfNotExists(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    log(`Diretório criado: ${dir}`, 'green');
  }
}

function createFileIfNotExists(filePath, content) {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, content);
    log(`Arquivo criado: ${filePath}`, 'green');
  }
}

async function main() {
  log('🚀 Configurando projeto Quiz Online...', 'bright');
  
  // Verificar Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log('❌ Node.js 18+ é necessário. Versão atual: ' + nodeVersion, 'red');
    process.exit(1);
  }
  
  log('✅ Node.js version: ' + nodeVersion, 'green');
  
  // Instalar dependências do workspace raiz
  log('\n📦 Instalando dependências do workspace...', 'yellow');
  if (!exec('npm install')) {
    log('❌ Falha ao instalar dependências', 'red');
    process.exit(1);
  }
  
  // Build do pacote shared primeiro
  log('\n🔧 Compilando pacote shared...', 'yellow');
  if (!exec('npm run build:shared')) {
    log('❌ Falha ao compilar pacote shared', 'red');
    process.exit(1);
  }
  
  // Criar diretórios necessários
  log('\n📁 Criando estrutura de diretórios...', 'yellow');
  const directories = [
    'packages/server/src/database/migrations',
    'packages/server/src/uploads',
    'packages/admin-ui/public',
    'packages/player-ui/src',
    'docs/api',
    'logs'
  ];
  
  directories.forEach(createDirectoryIfNotExists);
  
  // Criar arquivos de configuração se não existirem
  log('\n⚙️ Criando arquivos de configuração...', 'yellow');
  
  // .env para servidor
  const serverEnv = `# Configuração do Servidor Quiz Online
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL=sqlite:./quiz.db

# CORS
CORS_ORIGIN=http://localhost:3000

# WebSocket
WS_PORT=3001

# Logs
LOG_LEVEL=info
LOG_FILE=logs/server.log

# Segurança
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
  
  createFileIfNotExists('packages/server/.env', serverEnv);
  
  // .env para admin-ui
  const adminEnv = `# Configuração do Admin UI
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_APP_NAME=Quiz Admin
VITE_APP_VERSION=1.0.0
`;
  
  createFileIfNotExists('packages/admin-ui/.env', adminEnv);
  
  // Arquivo de favicon
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0ea5e9">
  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
</svg>`;
  
  createFileIfNotExists('packages/admin-ui/public/favicon.svg', faviconSvg);
  
  // Executar testes para verificar se tudo está funcionando
  log('\n🧪 Executando testes...', 'yellow');
  if (!exec('npm run test:server')) {
    log('⚠️ Alguns testes falharam, mas o setup continuará', 'yellow');
  }
  
  // Verificar se os serviços podem ser iniciados
  log('\n🔍 Verificando configuração...', 'yellow');
  
  const checks = [
    { name: 'Pacote shared compilado', path: 'packages/shared/dist' },
    { name: 'Configuração do servidor', path: 'packages/server/.env' },
    { name: 'Configuração do admin', path: 'packages/admin-ui/.env' }
  ];
  
  let allChecksPass = true;
  checks.forEach(check => {
    if (existsSync(check.path)) {
      log(`✅ ${check.name}`, 'green');
    } else {
      log(`❌ ${check.name}`, 'red');
      allChecksPass = false;
    }
  });
  
  if (allChecksPass) {
    log('\n🎉 Setup concluído com sucesso!', 'bright');
    log('\n📋 Próximos passos:', 'yellow');
    log('1. npm run dev          # Iniciar todos os serviços', 'cyan');
    log('2. npm run dev:server   # Apenas servidor (porta 3001)', 'cyan');
    log('3. npm run dev:admin    # Apenas admin UI (porta 3000)', 'cyan');
    log('4. npm test             # Executar todos os testes', 'cyan');
    log('\n🌐 URLs:', 'yellow');
    log('• Admin UI: http://localhost:3000', 'cyan');
    log('• API: http://localhost:3001/api', 'cyan');
    log('• Health Check: http://localhost:3001/health', 'cyan');
    log('\n📚 Documentação: README-QUIZ.md', 'yellow');
  } else {
    log('\n❌ Setup incompleto. Verifique os erros acima.', 'red');
    process.exit(1);
  }
}

// Executar setup
main().catch(error => {
  log('❌ Erro durante setup:', 'red');
  log(error.message, 'red');
  process.exit(1);
});