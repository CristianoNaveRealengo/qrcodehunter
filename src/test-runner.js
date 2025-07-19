/**
 * 🧪 Test Runner para QR Hunter - Modo Cliente
 * 
 * Este script executa testes automatizados para verificar se os problemas
 * de JavaScript foram resolvidos no modo cliente.
 */

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async runTests() {
        this.log('\n🧪 Iniciando Testes do QR Hunter - Modo Cliente\n', 'cyan');
        
        for (const test of this.tests) {
            try {
                this.log(`⏳ Executando: ${test.name}`, 'blue');
                const result = await test.testFunction();
                
                if (result.passed) {
                    this.log(`✅ PASSOU: ${test.name} - ${result.message}`, 'green');
                    this.results.passed++;
                } else {
                    this.log(`❌ FALHOU: ${test.name} - ${result.message}`, 'red');
                    this.results.failed++;
                }
            } catch (error) {
                this.log(`💥 ERRO: ${test.name} - ${error.message}`, 'red');
                this.results.failed++;
            }
            
            this.results.total++;
        }
        
        this.showSummary();
    }

    showSummary() {
        this.log('\n📊 RESUMO DOS TESTES', 'magenta');
        this.log('═'.repeat(50), 'magenta');
        this.log(`Total de Testes: ${this.results.total}`);
        this.log(`Aprovados: ${this.results.passed}`, 'green');
        this.log(`Falharam: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'green');
        
        const percentage = Math.round((this.results.passed / this.results.total) * 100);
        this.log(`Taxa de Sucesso: ${percentage}%`, percentage === 100 ? 'green' : percentage >= 70 ? 'yellow' : 'red');
        
        if (percentage === 100) {
            this.log('\n🎉 TODOS OS TESTES PASSARAM! 🎉', 'green');
        } else if (percentage >= 70) {
            this.log('\n⚠️  Alguns problemas encontrados', 'yellow');
        } else {
            this.log('\n🚨 PROBLEMAS CRÍTICOS ENCONTRADOS', 'red');
        }
    }
}

// Função para ler arquivo HTML
function readHTMLFile() {
    const filePath = path.join(__dirname, 'qrcodehunter.html');
    if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo qrcodehunter.html não encontrado');
    }
    return fs.readFileSync(filePath, 'utf8');
}

// Testes específicos
const runner = new TestRunner();

// Teste 1: Verificar se elementos HTML existem
runner.addTest('Elementos HTML do Modo Cliente', async () => {
    const htmlContent = readHTMLFile();
    
    const requiredElements = [
        'client-screen',
        'client-team-select',
        'client-scanner-button',
        'client-camera-switch',
        'client-qr-reader',
        'client-error-message'
    ];
    
    const missingElements = [];
    
    requiredElements.forEach(elementId => {
        if (!htmlContent.includes(`id="${elementId}"`)) {
            missingElements.push(elementId);
        }
    });
    
    return {
        passed: missingElements.length === 0,
        message: missingElements.length === 0 
            ? 'Todos os elementos necessários encontrados'
            : `Elementos faltando: ${missingElements.join(', ')}`
    };
});

// Teste 2: Verificar se IDs corretos estão sendo usados no JavaScript
runner.addTest('IDs Corretos no JavaScript', async () => {
    const htmlContent = readHTMLFile();
    
    // Verificar se os IDs incorretos não estão mais sendo usados
    const incorrectIds = [
        'start-client-scanner-btn',
        'switch-client-camera-btn'
    ];
    
    const foundIncorrectIds = [];
    
    incorrectIds.forEach(id => {
        if (htmlContent.includes(`getElementById('${id}')`)) {
            foundIncorrectIds.push(id);
        }
    });
    
    return {
        passed: foundIncorrectIds.length === 0,
        message: foundIncorrectIds.length === 0
            ? 'Nenhum ID incorreto encontrado'
            : `IDs incorretos ainda em uso: ${foundIncorrectIds.join(', ')}`
    };
});

// Teste 3: Verificar se os IDs corretos estão sendo usados
runner.addTest('IDs Corretos em Uso', async () => {
    const htmlContent = readHTMLFile();
    
    const correctIds = [
        'client-scanner-button',
        'client-camera-switch'
    ];
    
    const missingCorrectIds = [];
    
    correctIds.forEach(id => {
        if (!htmlContent.includes(`getElementById('${id}')`)) {
            missingCorrectIds.push(id);
        }
    });
    
    return {
        passed: missingCorrectIds.length === 0,
        message: missingCorrectIds.length === 0
            ? 'Todos os IDs corretos estão sendo usados'
            : `IDs corretos não encontrados: ${missingCorrectIds.join(', ')}`
    };
});

// Teste 4: Verificar se não há onclick duplicados
runner.addTest('Remoção de onclick Duplicados', async () => {
    const htmlContent = readHTMLFile();
    
    // Verificar se os botões não têm mais onclick
    const hasOnclickScanner = htmlContent.includes('onclick="startClientScanner()"');
    const hasOnclickCamera = htmlContent.includes('onclick="switchClientCamera()"');
    
    return {
        passed: !hasOnclickScanner && !hasOnclickCamera,
        message: (!hasOnclickScanner && !hasOnclickCamera)
            ? 'Atributos onclick removidos com sucesso'
            : 'Ainda existem atributos onclick nos botões'
    };
});

// Teste 5: Verificar se document.write foi removido
runner.addTest('Remoção de document.write', async () => {
    const htmlContent = readHTMLFile();
    
    const hasDocumentWrite = htmlContent.includes('document.write');
    
    return {
        passed: !hasDocumentWrite,
        message: !hasDocumentWrite
            ? 'document.write removido com sucesso'
            : 'document.write ainda presente no código'
    };
});

// Teste 6: Verificar estrutura de event listeners
runner.addTest('Event Listeners Corretos', async () => {
    const htmlContent = readHTMLFile();
    
    const hasCorrectEventListeners = 
        htmlContent.includes("getElementById('client-scanner-button').addEventListener") &&
        htmlContent.includes("getElementById('client-camera-switch').addEventListener");
    
    return {
        passed: hasCorrectEventListeners,
        message: hasCorrectEventListeners
            ? 'Event listeners configurados corretamente'
            : 'Event listeners não encontrados ou incorretos'
    };
});

// Teste 7: Verificar se app.js está sendo carregado corretamente
runner.addTest('Carregamento do app.js', async () => {
    const htmlContent = readHTMLFile();
    
    const hasCorrectScript = htmlContent.includes('<script src="js/app.js"></script>');
    const hasIncorrectScript = htmlContent.includes('src="app.js"') && !htmlContent.includes('src="js/app.js"');
    
    return {
        passed: hasCorrectScript && !hasIncorrectScript,
        message: (hasCorrectScript && !hasIncorrectScript)
            ? 'app.js carregado corretamente'
            : 'Problema no carregamento do app.js'
    };
});

// Executar todos os testes
if (require.main === module) {
    runner.runTests().catch(error => {
        console.error('Erro ao executar testes:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;