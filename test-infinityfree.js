#!/usr/bin/env node

/**
 * Script de teste específico para InfinityFree
 * Diagnostica problemas comuns incluindo erro 403 Forbidden
 */

const https = require('https');
const http = require('http');

// Verificar se é chamada de ajuda antes de configurar
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log('🔍 Teste de Diagnóstico InfinityFree - QRCode Hunter');
  console.log('=' .repeat(60));
  console.log('');
  console.log('📋 Uso: node test-infinityfree.js [dominio]');
  console.log('');
  console.log('📝 Exemplos:');
  console.log('   node test-infinityfree.js meusite.infinityfreeapp.com');
  console.log('   node test-infinityfree.js exemplo.rf.gd');
  console.log('');
  console.log('💡 Se não especificar domínio, usará: seudominio.infinityfreeapp.com');
  console.log('');
  console.log('🎯 O que este script faz:');
  console.log('   • Testa conectividade com o servidor');
  console.log('   • Verifica se os arquivos estão acessíveis');
  console.log('   • Diagnostica erros 403 Forbidden');
  console.log('   • Analisa configurações específicas do InfinityFree');
  console.log('   • Fornece soluções para problemas encontrados');
  process.exit(0);
}

// Configuração do seu domínio InfinityFree
const DOMAIN = process.argv[2] || 'seudominio.infinityfreeapp.com';
const BASE_PATH = '/qrcodehunter';
const BASE_URL = `http://${DOMAIN}${BASE_PATH}`;

// URLs críticas para testar
const criticalUrls = [
  {
    url: `${BASE_URL}/`,
    name: 'Página Principal',
    critical: true,
    expectedStatus: 200,
    expectedContent: ['QRCode Hunter', 'root']
  },
  {
    url: `${BASE_URL}/index.html`,
    name: 'Index HTML',
    critical: true,
    expectedStatus: 200,
    expectedContent: ['<!DOCTYPE html>', 'div id="root"']
  },
  {
    url: `${BASE_URL}/assets/index-HYUbUEd6.js`,
    name: 'JavaScript Principal',
    critical: true,
    expectedStatus: 200,
    expectedContent: ['React', 'function']
  },
  {
    url: `${BASE_URL}/vite.svg`,
    name: 'Ícone SVG',
    critical: false,
    expectedStatus: 200,
    expectedContent: ['<svg', '</svg>']
  },
  {
    url: `${BASE_URL}/.htaccess`,
    name: 'Arquivo .htaccess',
    critical: false,
    expectedStatus: [403, 200], // 403 é aceitável para .htaccess
    expectedContent: ['RewriteEngine']
  }
];

// Função para fazer requisição HTTP
function makeRequest(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });
    
    req.on('error', (err) => {
      reject(new Error(`Erro de conexão: ${err.message}`));
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Timeout após ${timeout}ms`));
    });
    
    req.end();
  });
}

// Função para analisar problemas específicos do InfinityFree
function analyzeInfinityFreeIssues(response, testConfig) {
  const issues = [];
  const solutions = [];
  
  // Análise do status code
  if (response.statusCode === 403) {
    issues.push('🚨 ERRO 403 FORBIDDEN');
    solutions.push('1. Verificar permissões de arquivo (chmod 644)');
    solutions.push('2. Verificar permissões de pasta (chmod 755)');
    solutions.push('3. Verificar se o arquivo .htaccess está correto');
    solutions.push('4. Verificar se mod_security está bloqueando');
  }
  
  if (response.statusCode === 404) {
    issues.push('🚨 ARQUIVO NÃO ENCONTRADO (404)');
    solutions.push('1. Verificar se o arquivo foi enviado corretamente');
    solutions.push('2. Verificar estrutura de pastas no servidor');
    solutions.push('3. Verificar se o nome do arquivo está correto');
  }
  
  if (response.statusCode >= 500) {
    issues.push('🚨 ERRO INTERNO DO SERVIDOR (5xx)');
    solutions.push('1. Verificar logs de erro no painel InfinityFree');
    solutions.push('2. Verificar configuração do .htaccess');
    solutions.push('3. Verificar se há problemas de sintaxe no código');
  }
  
  // Análise de redirecionamentos suspeitos
  if (response.headers.location && response.headers.location.includes('errors.infinityfree.net')) {
    issues.push('🚨 REDIRECIONAMENTO PARA PÁGINA DE ERRO');
    solutions.push('1. Verificar estrutura de diretórios');
    solutions.push('2. Verificar se os arquivos estão na pasta correta');
    solutions.push('3. Verificar configuração de domínio');
  }
  
  // Análise de Content-Type
  const contentType = response.headers['content-type'] || '';
  if (testConfig.url.includes('.js') && !contentType.includes('javascript')) {
    issues.push('⚠️ CONTENT-TYPE INCORRETO PARA JAVASCRIPT');
    solutions.push('1. Adicionar configuração MIME no .htaccess');
    solutions.push('2. Verificar se o servidor reconhece arquivos .js');
  }
  
  // Análise de conteúdo
  if (response.data.includes('InfinityFree') && response.data.includes('Error')) {
    issues.push('🚨 PÁGINA DE ERRO DO INFINITYFREE DETECTADA');
    solutions.push('1. Verificar se o arquivo existe no servidor');
    solutions.push('2. Verificar permissões e configurações');
    solutions.push('3. Verificar logs de erro detalhados');
  }
  
  return { issues, solutions };
}

// Função para verificar conectividade básica
async function checkConnectivity() {
  console.log('🔌 Verificando conectividade básica...');
  
  try {
    const response = await makeRequest(`http://${DOMAIN}`, 5000);
    console.log(`✅ Conectividade OK - Status: ${response.statusCode}`);
    return true;
  } catch (error) {
    console.log(`❌ Falha na conectividade: ${error.message}`);
    console.log('💡 Soluções:');
    console.log('   • Verificar se o domínio está ativo');
    console.log('   • Verificar configuração DNS');
    console.log('   • Tentar novamente em alguns minutos');
    return false;
  }
}

// Função principal de teste
async function runDiagnostics() {
  console.log('🔍 Teste de Diagnóstico InfinityFree - QRCode Hunter');
  console.log('=' .repeat(60));
  console.log(`🌐 Domínio: ${DOMAIN}`);
  console.log(`📁 Caminho base: ${BASE_PATH}`);
  console.log(`🔗 URL completa: ${BASE_URL}`);
  console.log('');
  console.log('🚀 Iniciando diagnóstico...');
  console.log('');
  
  // Verificar conectividade básica
  const isConnected = await checkConnectivity();
  if (!isConnected) {
    console.log('\n❌ Não foi possível conectar ao servidor. Verifique a conectividade.');
    process.exit(1);
  }
  
  console.log('');
  
  let criticalFailures = 0;
  let totalIssues = [];
  let totalSolutions = [];
  
  // Testar cada URL
  for (const testConfig of criticalUrls) {
    console.log(`📋 Testando: ${testConfig.name}`);
    console.log(`🔗 URL: ${testConfig.url}`);
    
    try {
      const response = await makeRequest(testConfig.url);
      
      // Verificar status
      const expectedStatuses = Array.isArray(testConfig.expectedStatus) 
        ? testConfig.expectedStatus 
        : [testConfig.expectedStatus];
      
      if (expectedStatuses.includes(response.statusCode)) {
        console.log(`✅ Status: ${response.statusCode} ${response.statusMessage}`);
      } else {
        console.log(`❌ Status: ${response.statusCode} ${response.statusMessage}`);
        if (testConfig.critical) criticalFailures++;
      }
      
      // Verificar Content-Type
      const contentType = response.headers['content-type'] || 'não especificado';
      console.log(`📄 Content-Type: ${contentType}`);
      
      // Verificar conteúdo esperado
      if (testConfig.expectedContent && response.statusCode === 200) {
        const hasExpectedContent = testConfig.expectedContent.some(content => 
          response.data.includes(content)
        );
        
        if (hasExpectedContent) {
          console.log('✅ Conteúdo: Válido');
        } else {
          console.log('❌ Conteúdo: Não contém elementos esperados');
          if (testConfig.critical) criticalFailures++;
        }
      }
      
      // Analisar problemas específicos
      const analysis = analyzeInfinityFreeIssues(response, testConfig);
      if (analysis.issues.length > 0) {
        console.log('🚨 Problemas detectados:');
        analysis.issues.forEach(issue => {
          console.log(`   ${issue}`);
          totalIssues.push(issue);
        });
        
        totalSolutions.push(...analysis.solutions);
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      if (testConfig.critical) criticalFailures++;
    }
    
    console.log('');
  }
  
  // Relatório final
  console.log('=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('=' .repeat(60));
  
  if (criticalFailures === 0) {
    console.log('🎉 SUCESSO! Todos os testes críticos passaram.');
    console.log('✅ Sua aplicação está funcionando corretamente no InfinityFree.');
  } else {
    console.log(`❌ FALHAS CRÍTICAS: ${criticalFailures}`);
    console.log('🚨 Sua aplicação tem problemas que precisam ser resolvidos.');
    
    if (totalSolutions.length > 0) {
      console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
      const uniqueSolutions = [...new Set(totalSolutions)];
      uniqueSolutions.forEach((solution, index) => {
        console.log(`${index + 1}. ${solution}`);
      });
    }
    
    console.log('\n📋 CHECKLIST INFINITYFREE:');
    console.log('□ Arquivos enviados para htdocs/qrcodehunter/');
    console.log('□ Permissões: 755 para pastas, 644 para arquivos');
    console.log('□ Arquivo .htaccess presente na pasta raiz');
    console.log('□ Cache do navegador limpo (Ctrl+F5)');
    console.log('□ Aguardou alguns minutos após upload');
    console.log('□ Verificou logs de erro no painel InfinityFree');
  }
  
  console.log(`\n🌐 Domínio testado: ${DOMAIN}`);
  console.log(`📁 Caminho: ${BASE_PATH}`);
  console.log(`⏰ Teste realizado em: ${new Date().toLocaleString('pt-BR')}`);
  
  process.exit(criticalFailures > 0 ? 1 : 0);
}

// Executar diagnóstico
if (require.main === module) {
  runDiagnostics().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { runDiagnostics, makeRequest, analyzeInfinityFreeIssues };