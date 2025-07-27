#!/usr/bin/env node

/**
 * Script para verificar se todos os testes TDD estão funcionando
 * Executa testes em cada pacote e reporta o status
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'pipe', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

async function verifyTests() {
  log('🧪 Verificando Testes TDD do Quiz Online', 'bright');
  log('=' .repeat(50), 'cyan');

  const packages = [
    {
      name: 'Shared Package',
      path: 'packages/shared',
      description: 'Tipos e utilitários compartilhados'
    },
    {
      name: 'Server Package', 
      path: 'packages/server',
      description: 'API REST e WebSocket'
    },
    {
      name: 'Admin UI Package',
      path: 'packages/admin-ui', 
      description: 'Interface administrativa'
    }
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const pkg of packages) {
    log(`\n📦 ${pkg.name}`, 'yellow');
    log(`   ${pkg.description}`, 'cyan');
    log(`   Caminho: ${pkg.path}`, 'blue');

    // Verificar se o diretório existe
    if (!existsSync(pkg.path)) {
      log(`   ❌ Diretório não encontrado`, 'red');
      continue;
    }

    // Verificar se package.json existe
    if (!existsSync(`${pkg.path}/package.json`)) {
      log(`   ❌ package.json não encontrado`, 'red');
      continue;
    }

    // Verificar se node_modules existe
    if (!existsSync(`${pkg.path}/node_modules`)) {
      log(`   📦 Instalando dependências...`, 'blue');
      if (exec('npm install', { cwd: pkg.path })) {
        log(`   ✅ Dependências instaladas`, 'green');
      } else {
        log(`   ❌ Falha ao instalar dependências`, 'red');
        continue;
      }
    }

    // Para shared, compilar primeiro
    if (pkg.name === 'Shared Package') {
      log(`   🔧 Compilando TypeScript...`, 'blue');
      if (exec('npm run build', { cwd: pkg.path })) {
        log(`   ✅ Compilação bem-sucedida`, 'green');
      } else {
        log(`   ❌ Falha na compilação`, 'red');
        continue;
      }
    }

    // Verificar se há testes
    const testDirs = [
      `${pkg.path}/src/__tests__`,
      `${pkg.path}/__tests__`,
      `${pkg.path}/test`
    ];

    const hasTests = testDirs.some(dir => existsSync(dir));
    if (!hasTests) {
      log(`   ⚠️ Nenhum diretório de testes encontrado`, 'yellow');
      continue;
    }

    // Executar testes
    log(`   🧪 Executando testes...`, 'blue');
    totalTests++;
    
    if (exec('npm test', { cwd: pkg.path })) {
      log(`   ✅ Testes passaram!`, 'green');
      passedTests++;
    } else {
      log(`   ❌ Alguns testes falharam`, 'red');
    }
  }

  // Resumo final
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 Resumo dos Testes TDD', 'bright');
  log(`✅ Pacotes testados com sucesso: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests && totalTests > 0) {
    log('\n🎉 Todos os testes TDD estão funcionando!', 'green');
    log('✨ Sistema pronto para desenvolvimento com confiança', 'green');
  } else if (passedTests > 0) {
    log('\n⚠️ Alguns testes estão funcionando, mas há problemas', 'yellow');
    log('🔧 Verifique os erros acima e corrija os problemas', 'yellow');
  } else {
    log('\n❌ Nenhum teste está funcionando', 'red');
    log('🚨 Sistema precisa de correções antes de usar', 'red');
  }

  // Instruções de uso
  log('\n📋 Próximos Passos:', 'bright');
  log('1. Para executar testes manualmente:', 'cyan');
  log('   cd packages/shared && npm test', 'blue');
  log('   cd packages/server && npm test', 'blue');
  log('   cd packages/admin-ui && npm test', 'blue');
  
  log('\n2. Para desenvolvimento:', 'cyan');
  log('   npm run dev (executar todos os serviços)', 'blue');
  
  log('\n3. Para testes em watch mode:', 'cyan');
  log('   cd packages/server && npm test -- --watch', 'blue');

  return passedTests === totalTests;
}

// Executar verificação
verifyTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`❌ Erro durante verificação: ${error.message}`, 'red');
  process.exit(1);
});