import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🧪 Verificando Deploy do Quiz Online...\n');

// Verificar estrutura de arquivos
const requiredFiles = [
  'packages/shared/package.json',
  'packages/shared/src/types/index.ts',
  'packages/server/package.json', 
  'packages/server/src/index.ts',
  'packages/admin-ui/package.json',
  'packages/admin-ui/src/App.tsx'
];

console.log('📁 Verificando estrutura de arquivos...');
let filesOk = true;
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANDO`);
    filesOk = false;
  }
}

if (!filesOk) {
  console.log('\n❌ Estrutura de arquivos incompleta');
  process.exit(1);
}

console.log('\n📦 Verificando dependências...');

// Verificar shared
try {
  if (!existsSync('packages/shared/node_modules')) {
    console.log('Instalando shared...');
    execSync('npm install', { cwd: 'packages/shared', stdio: 'inherit' });
  }
  console.log('✅ Shared - dependências OK');
} catch (error) {
  console.log('❌ Shared - erro nas dependências');
}

// Verificar server
try {
  if (!existsSync('packages/server/node_modules')) {
    console.log('Instalando server...');
    execSync('npm install', { cwd: 'packages/server', stdio: 'inherit' });
  }
  console.log('✅ Server - dependências OK');
} catch (error) {
  console.log('❌ Server - erro nas dependências');
}

// Verificar admin-ui
try {
  if (!existsSync('packages/admin-ui/node_modules')) {
    console.log('Instalando admin-ui...');
    execSync('npm install', { cwd: 'packages/admin-ui', stdio: 'inherit' });
  }
  console.log('✅ Admin UI - dependências OK');
} catch (error) {
  console.log('❌ Admin UI - erro nas dependências');
}

console.log('\n🔧 Compilando shared...');
try {
  execSync('npm run build', { cwd: 'packages/shared', stdio: 'inherit' });
  console.log('✅ Shared compilado com sucesso');
} catch (error) {
  console.log('❌ Erro ao compilar shared');
}

console.log('\n🎉 Verificação concluída!');
console.log('\n📋 Para executar o projeto:');
console.log('1. Terminal 1: cd packages/server && npm run dev');
console.log('2. Terminal 2: cd packages/admin-ui && npm run dev');
console.log('3. Terminal 3: npm run dev (QRCode Hunter original)');
console.log('\n🌐 URLs:');
console.log('- Admin UI: http://localhost:3000');
console.log('- API: http://localhost:3001/api');
console.log('- QRCode Hunter: http://localhost:5173');