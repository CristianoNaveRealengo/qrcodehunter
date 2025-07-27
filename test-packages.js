import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🧪 Testando pacotes do Quiz Online...\n');

// Testar shared
console.log('📦 Testando shared...');
try {
  if (!existsSync('packages/shared/node_modules')) {
    console.log('Instalando dependências do shared...');
    execSync('npm install', { cwd: 'packages/shared', stdio: 'inherit' });
  }
  
  console.log('Compilando shared...');
  execSync('npm run build', { cwd: 'packages/shared', stdio: 'inherit' });
  
  console.log('Executando testes do shared...');
  execSync('npm test', { cwd: 'packages/shared', stdio: 'inherit' });
  console.log('✅ Shared - OK\n');
} catch (error) {
  console.log('❌ Shared - FALHOU\n');
}

// Testar server
console.log('📦 Testando server...');
try {
  if (!existsSync('packages/server/node_modules')) {
    console.log('Instalando dependências do server...');
    execSync('npm install', { cwd: 'packages/server', stdio: 'inherit' });
  }
  
  console.log('Executando testes do server...');
  execSync('npm test', { cwd: 'packages/server', stdio: 'inherit' });
  console.log('✅ Server - OK\n');
} catch (error) {
  console.log('❌ Server - FALHOU\n');
}

// Testar admin-ui
console.log('📦 Testando admin-ui...');
try {
  if (!existsSync('packages/admin-ui/node_modules')) {
    console.log('Instalando dependências do admin-ui...');
    execSync('npm install', { cwd: 'packages/admin-ui', stdio: 'inherit' });
  }
  
  console.log('Executando testes do admin-ui...');
  execSync('npm test', { cwd: 'packages/admin-ui', stdio: 'inherit' });
  console.log('✅ Admin UI - OK\n');
} catch (error) {
  console.log('❌ Admin UI - FALHOU\n');
}

console.log('🎉 Testes concluídos!');