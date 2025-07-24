const https = require('https');
const http = require('http');

// Configurações para diferentes ambientes
const environments = {
  local: {
    baseUrl: 'http://localhost:3000/qrcodehunter',
    jsFile: 'index-HYUbUEd6.js'
  },
  infinityfree: {
    baseUrl: 'http://seudominio.infinityfreeapp.com/qrcodehunter',
    jsFile: 'index-HYUbUEd6.js'
  },
  production: {
    baseUrl: 'https://auladrop.rf.gd/qrcodehunter',
    jsFile: 'index-BDWgTPoc.js'
  }
};

// Detectar ambiente ou usar parâmetro
const env = process.argv[2] || 'production';
const config = environments[env] || environments.production;

console.log(`🔍 Verificando deploy no ambiente: ${env}`);
console.log(`📍 URL base: ${config.baseUrl}`);

// URLs para verificar
const urls = [
  {
    url: `${config.baseUrl}/`,
    description: 'Página principal',
    expectedType: 'html',
    shouldContain: ['<div id="root"></div>', 'QRCode Hunter']
  },
  {
    url: `${config.baseUrl}/index.html`,
    description: 'Arquivo index.html',
    expectedType: 'html',
    shouldContain: ['<div id="root"></div>', config.jsFile]
  },
  {
    url: `${config.baseUrl}/assets/${config.jsFile}`,
    description: 'Arquivo JavaScript principal',
    expectedType: 'javascript',
    shouldContain: ['React', 'function', 'export']
  },
  {
    url: `${config.baseUrl}/vite.svg`,
    description: 'Ícone SVG',
    expectedType: 'svg',
    shouldContain: ['<svg', '</svg>']
  },
  {
    url: `${config.baseUrl}/.htaccess`,
    description: 'Arquivo .htaccess',
    expectedType: 'text',
    shouldContain: ['RewriteEngine']
  }
];

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
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
          headers: res.headers,
          data: data,
          url: url,
          redirected: res.statusCode >= 300 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Função para verificar configurações específicas do InfinityFree
function checkInfinityFreeConfig(response, url) {
  const issues = [];
  const recommendations = [];
  
  // Verificar se é erro 403
  if (response.statusCode === 403) {
    issues.push('❌ Erro 403 Forbidden detectado');
    recommendations.push('• Verificar permissões de arquivo (644 para arquivos, 755 para pastas)');
    recommendations.push('• Verificar configuração do .htaccess');
    recommendations.push('• Verificar se mod_security está bloqueando');
  }
  
  // Verificar redirecionamentos suspeitos
  if (response.statusCode === 301 || response.statusCode === 302) {
    const location = response.headers.location;
    if (location && location.includes('errors.infinityfree.net')) {
      issues.push('❌ Redirecionamento para página de erro do InfinityFree');
      recommendations.push('• Verificar estrutura de diretórios');
      recommendations.push('• Verificar se os arquivos foram enviados corretamente');
    }
  }
  
  // Verificar Content-Type para JavaScript
  if (url.includes('.js')) {
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('javascript')) {
      issues.push(`❌ Content-Type incorreto para JS: ${contentType}`);
      recommendations.push('• Verificar configuração de tipos MIME no .htaccess');
    }
  }
  
  // Verificar headers CORS
  const corsHeader = response.headers['access-control-allow-origin'];
  if (url.includes('/assets/') && !corsHeader) {
    recommendations.push('• Considerar adicionar headers CORS para assets');
  }
  
  return { issues, recommendations };
}

// Função para verificar o tipo de conteúdo
function validateContent(response, expectedType, shouldContain) {
  const contentType = response.headers['content-type'] || '';
  const data = response.data;
  
  let typeValid = false;
  let containsExpected = true;
  let issues = [];
  
  // Verificar tipo de conteúdo
  switch (expectedType) {
    case 'html':
      typeValid = contentType.includes('text/html');
      if (!typeValid) issues.push(`Tipo esperado: HTML, recebido: ${contentType}`);
      break;
    case 'javascript':
      typeValid = contentType.includes('application/javascript') || 
                 contentType.includes('text/javascript') ||
                 contentType.includes('application/x-javascript');
      if (!typeValid) {
        issues.push(`Tipo esperado: JavaScript, recebido: ${contentType}`);
        // Verificar se retornou HTML (erro 404 disfarçado)
        if (contentType.includes('text/html')) {
          issues.push('⚠️  PROBLEMA: Arquivo JS retornando HTML (provavelmente erro 404)');
        }
      }
      break;
    case 'svg':
      typeValid = contentType.includes('image/svg') || data.includes('<svg');
      if (!typeValid) issues.push(`Tipo esperado: SVG, recebido: ${contentType}`);
      break;
  }
  
  // Verificar conteúdo esperado
  if (shouldContain && shouldContain.length > 0) {
    for (const content of shouldContain) {
      if (!data.includes(content)) {
        containsExpected = false;
        issues.push(`Conteúdo esperado não encontrado: "${content}"`);
      }
    }
  }
  
  return {
    typeValid,
    containsExpected,
    issues,
    contentType,
    dataSize: data.length
  };
}

// Função para formatar resultado
function formatResult(url, response, validation) {
  const status = response.statusCode;
  const isSuccess = status === 200;
  const isRedirect = status >= 300 && status < 400;
  
  let icon, color;
  if (isSuccess && validation.typeValid && validation.containsExpected) {
    icon = '✅';
    color = '\x1b[32m'; // Verde
  } else if (isSuccess) {
    icon = '⚠️ ';
    color = '\x1b[33m'; // Amarelo
  } else if (isRedirect) {
    icon = '🔄';
    color = '\x1b[34m'; // Azul
  } else {
    icon = '❌';
    color = '\x1b[31m'; // Vermelho
  }
  
  console.log(`${color}${icon} ${url.description}\x1b[0m`);
  console.log(`   URL: ${url.url}`);
  console.log(`   Status: ${status}`);
  console.log(`   Tipo: ${validation.contentType}`);
  console.log(`   Tamanho: ${validation.dataSize} bytes`);
  
  if (validation.issues.length > 0) {
    console.log(`   Problemas:`);
    validation.issues.forEach(issue => {
      console.log(`     - ${issue}`);
    });
  }
  
  if (isRedirect && response.headers.location) {
    console.log(`   Redirecionado para: ${response.headers.location}`);
  }
  
  console.log('');
  
  return {
    success: isSuccess && validation.typeValid && validation.containsExpected,
    warning: isSuccess && (!validation.typeValid || !validation.containsExpected),
    redirect: isRedirect,
    failure: !isSuccess && !isRedirect
  };
}

// Função principal
async function verifyDeploy() {
  console.log('🔍 Verificando deploy da aplicação QRCode Hunter...');
  console.log('=' .repeat(60));
  
  let allPassed = true;
  const allIssues = [];
  const allRecommendations = [];
  
  for (const item of urls) {
    console.log(`\n📍 Verificando: ${item.description}`);
    console.log(`🔗 URL: ${item.url}`);
    
    try {
      const response = await makeRequest(item.url);
      
      // Verificar configurações específicas do InfinityFree
      const infinityFreeCheck = checkInfinityFreeConfig(response, item.url);
      if (infinityFreeCheck.issues.length > 0) {
        infinityFreeCheck.issues.forEach(issue => {
          console.log(`   ${issue}`);
          allIssues.push(issue);
        });
        allPassed = false;
      }
      
      if (infinityFreeCheck.recommendations.length > 0) {
        infinityFreeCheck.recommendations.forEach(rec => {
          allRecommendations.push(rec);
        });
      }
      
      // Verificar status code
      if (response.statusCode === 200) {
        console.log('✅ Status: 200 OK');
      } else {
        console.log(`❌ Status: ${response.statusCode}`);
        allPassed = false;
        
        if (response.redirected) {
          console.log('🔄 Redirecionamento detectado');
        }
        
        // Para .htaccess, 403 pode ser esperado
        if (item.url.includes('.htaccess') && response.statusCode === 403) {
          console.log('ℹ️  Acesso ao .htaccess bloqueado (comportamento normal)');
          continue;
        } else {
          continue;
        }
      }
      
      // Verificar Content-Type
      const contentType = response.headers['content-type'] || 'não especificado';
      console.log(`📄 Content-Type: ${contentType}`);
      
      // Verificar conteúdo
      const contentCheck = validateContent(response, item.expectedType, item.shouldContain);
      
      if (contentCheck.typeValid && contentCheck.containsExpected) {
        console.log('✅ Conteúdo: Válido');
        if (contentCheck.issues.length > 0) {
          contentCheck.issues.forEach(issue => console.log(`   ${issue}`));
        }
      } else {
        console.log('❌ Conteúdo: Inválido');
        contentCheck.issues.forEach(issue => console.log(`   ${issue}`));
        allPassed = false;
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (allPassed) {
    console.log('🎉 Todos os testes passaram! Deploy verificado com sucesso.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os problemas acima.');
    
    if (allIssues.length > 0) {
      console.log('\n🚨 Problemas identificados:');
      [...new Set(allIssues)].forEach(issue => console.log(`   ${issue}`));
    }
    
    if (allRecommendations.length > 0) {
      console.log('\n💡 Recomendações:');
      [...new Set(allRecommendations)].forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log('\n📋 Dicas gerais para InfinityFree:');
    console.log('• Verifique se o arquivo .htaccess foi enviado para a pasta raiz');
    console.log('• Confirme as permissões: 644 para arquivos, 755 para pastas');
    console.log('• Aguarde alguns minutos para propagação de mudanças');
    console.log('• Teste com cache do navegador limpo (Ctrl+F5)');
    console.log('• Verifique os logs de erro no painel do InfinityFree');
  }
  
  console.log(`\n🌐 Ambiente testado: ${env}`);
  console.log(`📍 URL base: ${config.baseUrl}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Executar verificação
verifyDeploy().catch(console.error);