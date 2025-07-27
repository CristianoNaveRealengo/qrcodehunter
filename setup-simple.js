#!/usr/bin/env node

/**
 * Script de setup simplificado para o projeto Quiz Online
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';

function log(message, color = 'reset') {
  console.log(message);
}

function exec(command, options = {}) {
  try {
    log(`Executando: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log(`Erro ao executar: ${command}`);
    return false;
  }
}

function main() {
  log('🚀 Configurando projeto Quiz Online...');
  
  // Instalar dependências do shared primeiro
  log('\n📦 Instalando dependências do shared...');
  if (!exec('npm install', { cwd: 'packages/shared' })) {
    log('❌ Falha ao instalar dependências do shared');
    return;
  }
  
  // Build do shared
  log('\n🔧 Compilando pacote shared...');
  if (!exec('npm run build', { cwd: 'packages/shared' })) {
    log('❌ Falha ao compilar shared');
    return;
  }
  
  // Instalar dependências do servidor
  log('\n📦 Instalando dependências do servidor...');
  if (!exec('npm install', { cwd: 'packages/server' })) {
    log('❌ Falha ao instalar dependências do servidor');
    return;
  }
  
  // Instalar dependências do admin-ui
  log('\n📦 Instalando dependências do admin-ui...');
  if (!exec('npm install', { cwd: 'packages/admin-ui' })) {
    log('❌ Falha ao instalar dependências do admin-ui');
    return;
  }
  
  // Criar arquivos de configuração
  log('\n⚙️ Criando arquivos de configuração...');
  
  // .env para servidor
  const serverEnv = `NODE_ENV=development
PORT=3001
DATABASE_URL=sqlite:./quiz.db
CORS_ORIGIN=http://localhost:3000
`;
  
  if (!existsSync('packages/server/.env')) {
    writeFileSync('packages/server/.env', serverEnv);
    log('Arquivo criado: packages/server/.env');
  }
  
  // .env para admin-ui
  const adminEnv = `VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
`;
  
  if (!existsSync('packages/admin-ui/.env')) {
    writeFileSync('packages/admin-ui/.env', adminEnv);
    log('Arquivo criado: packages/admin-ui/.env');
  }
  
  log('\n🎉 Setup concluído!');
  log('\n📋 Para executar:');
  log('1. Servidor: cd packages/server && npm run dev');
  log('2. Admin UI: cd packages/admin-ui && npm run dev');
  log('3. Original: npm run dev (na raiz)');
}

main();