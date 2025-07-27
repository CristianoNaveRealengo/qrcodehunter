import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🧪 Testando pacote shared...');

try {
  // Verificar se existe
  if (!existsSync('packages/shared')) {
    console.log('❌ Diretório packages/shared não encontrado');
    process.exit(1);
  }

  // Instalar dependências se necessário
  if (!existsSync('packages/shared/node_modules')) {
    console.log('📦 Instalando dependências...');
    execSync('npm install', { cwd: 'packages/shared', stdio: 'inherit' });
  }

  // Compilar
  console.log('🔧 Compilando...');
  execSync('npm run build', { cwd: 'packages/shared', stdio: 'inherit' });

  // Testar
  console.log('🧪 Executando testes...');
  execSync('npm test', { cwd: 'packages/shared', stdio: 'inherit' });

  console.log('✅ Shared package - Todos os testes passaram!');
} catch (error) {
  console.log('❌ Erro no shared package:', error.message);
  process.exit(1);
}