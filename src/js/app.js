// Variáveis globais
let qrCodes = [];
let teams = [];
let scannedQRCodes = [];
let timerInterval;
let timeLeft = 30 * 60; // 30 minutos em segundos
let isGameRunning = false;
let scannerActive = false;
let currentTeamId = null;
let html5QrScanner = null;
let currentCamera = 'environment'; // 'environment' para câmera traseira, 'user' para frontal
let cameraList = []; // Lista de câmeras disponíveis

// Elementos do DOM
const screens = {
    admin: document.getElementById('admin-screen'),
    register: document.getElementById('register-screen'),
    hunt: document.getElementById('hunt-screen'),
    ranking: document.getElementById('ranking-screen')
};

const timerDisplay = document.getElementById('timer-display');
const rankingTimer = document.getElementById('ranking-timer');
const qrCodesContainer = document.getElementById('qr-codes-container');
const scannedQRCodesList = document.getElementById('scanned-qr-codes');
const teamsList = document.getElementById('teams-list');
const teamSelect = document.getElementById('team-select');
const currentTeamName = document.getElementById('current-team-name');
const currentTeamScore = document.getElementById('current-team-score');
const currentTeamScans = document.getElementById('current-team-scans');
const scanResult = document.getElementById('scan-result');
const pointsEarned = document.getElementById('points-earned');
const totalPoints = document.getElementById('total-points');
const errorMessage = document.getElementById('error-message');
const teamsRanking = document.getElementById('teams-ranking');
const winnerBanner = document.getElementById('winner-banner');
const winnerTeam = document.getElementById('winner-team');
const winnerScore = document.getElementById('winner-score');
const gameStatus = document.getElementById('game-status');
const scannerContainer = document.getElementById('scanner-container');
const scannerButton = document.getElementById('scanner-button');
const cameraSwitchButton = document.getElementById('camera-switch');

// Alternância do menu móvel
document.getElementById('mobile-menu-button').addEventListener('click', function () {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Inicializar o aplicativo
function init() {
    loadData();
    updateTimerDisplay();
    updateRankingTimer();
    showScreen('admin');
    populateTeamSelect();
    updateTeamsList();
    updateRanking();
    
    // Verificar se o navegador suporta a API de câmera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('API de câmera suportada');
    } else {
        console.error('API de câmera não suportada neste navegador');
    }
}

// Mostrar tela específica e esconder as outras
function showScreen(screenName) {
    // Esconder todas as telas
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });

    // Mostrar a tela selecionada
    screens[screenName].classList.remove('hidden');

    // Casos especiais
    if (screenName !== 'hunt' && scannerActive) {
        stopScanner();
    }

    // Fechar menu móvel se estiver aberto
    document.getElementById('mobile-menu').classList.add('hidden');
}

// Carregar dados do localStorage
function loadData() {
    const savedQRCodes = localStorage.getItem('qrHunt_qrCodes');
    const savedTeams = localStorage.getItem('qrHunt_teams');
    const savedScanned = localStorage.getItem('qrHunt_scanned');
    const savedTimeLeft = localStorage.getItem('qrHunt_timeLeft');
    const savedGameRunning = localStorage.getItem('qrHunt_isGameRunning');

    if (savedQRCodes) qrCodes = JSON.parse(savedQRCodes);
    if (savedTeams) teams = JSON.parse(savedTeams);
    if (savedScanned) scannedQRCodes = JSON.parse(savedScanned);
    if (savedTimeLeft) timeLeft = parseInt(savedTimeLeft);
    if (savedGameRunning) isGameRunning = savedGameRunning === 'true';

    // Atualizar a interface com base nos dados carregados
    if (qrCodes.length > 0) {
        renderQRCodes();
    }

    if (scannedQRCodes.length > 0) {
        renderScannedQRCodes();
    }

    if (isGameRunning) {
        startTimer();
    }
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('qrHunt_qrCodes', JSON.stringify(qrCodes));
    localStorage.setItem('qrHunt_teams', JSON.stringify(teams));
    localStorage.setItem('qrHunt_scanned', JSON.stringify(scannedQRCodes));
    localStorage.setItem('qrHunt_timeLeft', timeLeft.toString());
    localStorage.setItem('qrHunt_isGameRunning', isGameRunning.toString());
}

// Gerar QR Codes
function generateQRCodes() {
    const count = parseInt(document.getElementById('qr-count').value) || 10;
    const minPoints = parseInt(document.getElementById('min-points').value) || 100;
    const maxPoints = parseInt(document.getElementById('max-points').value) || 5000;

    qrCodes = [];

    for (let i = 0; i < count; i++) {
        const points = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;
        const id = 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        qrCodes.push({
            id: id,
            points: points,
            scanned: false,
            scannedBy: null,
            scannedAt: null
        });
    }

    renderQRCodes();
    saveData();
}

// Renderizar QR Codes
function renderQRCodes() {
    qrCodesContainer.innerHTML = '';

    qrCodes.forEach(qr => {
        const qrElement = document.createElement('div');
        qrElement.className = 'bg-white p-3 rounded-lg shadow-md border-2 ' + (qr.scanned ? 'border-green-400' : 'border-gray-200');

        const qrCanvas = document.createElement('canvas');
        qrCanvas.className = 'w-full h-auto';

        qrElement.appendChild(qrCanvas);

        const statusText = document.createElement('p');
        statusText.className = 'text-center mt-2 text-sm font-medium ' + (qr.scanned ? 'text-green-600' : 'text-gray-500');
        statusText.textContent = qr.scanned ? 'Escaneado' : 'Disponível';

        qrElement.appendChild(statusText);

        qrCodesContainer.appendChild(qrElement);

        // Gerar código QR
        QRCode.toCanvas(qrCanvas, qr.id, {
            width: 200,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function (error) {
            if (error) console.error(error);
        });
    });
}

// Renderizar QR Codes escaneados
function renderScannedQRCodes() {
    if (scannedQRCodes.length === 0) {
        scannedQRCodesList.innerHTML = '<p class="text-gray-500 italic">Nenhum QR code foi escaneado ainda.</p>';
        return;
    }

    scannedQRCodesList.innerHTML = '';

    scannedQRCodes.forEach(scan => {
        const qr = qrCodes.find(q => q.id === scan.qrId);
        const team = teams.find(t => t.id === scan.teamId);

        if (qr && team) {
            const scanElement = document.createElement('div');
            scanElement.className = 'bg-gray-50 p-3 rounded-lg border border-gray-200';

            scanElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-medium">${team.name}</p>
                        <p class="text-sm text-gray-600">${new Date(scan.scannedAt).toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-green-600">+${qr.points} pontos</p>
                        <p class="text-sm text-gray-600">QR Code: ${qr.id.substr(0, 8)}...</p>
                    </div>
                </div>
            `;

            scannedQRCodesList.appendChild(scanElement);
        }
    });
}

// Funções do temporizador
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    isGameRunning = true;
    saveData();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        updateRankingTimer();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isGameRunning = false;
    saveData();
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = parseInt(document.getElementById('game-duration').value) * 60 || 30 * 60;
    isGameRunning = false;
    updateTimerDisplay();
    updateRankingTimer();
    saveData();

    // Esconder banner do vencedor se estiver visível
    winnerBanner.classList.add('hidden');
    gameStatus.textContent = 'Em andamento';
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    rankingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateRankingTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    rankingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
    clearInterval(timerInterval);
    isGameRunning = false;
    timeLeft = 0;
    updateTimerDisplay();
    updateRankingTimer();

    // Determinar o vencedor
    if (teams.length > 0) {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0];

        winnerBanner.classList.remove('hidden');
        winnerTeam.textContent = winner.name;
        winnerScore.textContent = `com ${winner.score} pontos!`;
        gameStatus.textContent = 'Finalizado';
    }

    saveData();
}

// Baixar todos os QR codes como PDF
function downloadAllQRCodes() {
    if (qrCodes.length === 0) {
        alert('Nenhum QR code foi gerado ainda!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const qrSize = 50;
    const margin = 20;
    const spacing = 10;
    const qrPerRow = 3;
    const qrPerPage = qrPerRow * 4;

    let x = margin;
    let y = margin;
    let page = 1;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('QR Codes para Caçada', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    qrCodes.forEach((qr, index) => {
        if (index > 0 && index % qrPerPage === 0) {
            doc.addPage();
            x = margin;
            y = margin;
            page++;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('QR Codes para Caçada', 105, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
        }

        // Criar um canvas temporário para o código QR
        const canvas = document.createElement('canvas');
        QRCode.toCanvas(canvas, qr.id, {
            width: qrSize,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function (error) {
            if (error) console.error(error);

            // Adicionar código QR ao PDF
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', x, y, qrSize, qrSize);

            // Adicionar ID abaixo do código QR
            doc.text(`ID: ${qr.id.substr(0, 8)}...`, x + qrSize / 2, y + qrSize + 5, { align: 'center' });

            // Mover para a próxima posição
            x += qrSize + spacing;

            if ((index + 1) % qrPerRow === 0) {
                x = margin;
                y += qrSize + spacing + 15;
            }
        });
    });

    doc.save('QR_Hunt_Codes.pdf');
}

// Registro de equipe
function registerTeam() {
    const name = document.getElementById('team-name').value.trim();
    const members = document.getElementById('team-members').value.trim();

    if (!name) {
        alert('Por favor, insira um nome para a equipe!');
        return;
    }

    const id = 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    teams.push({
        id: id,
        name: name,
        members: members.split(',').map(m => m.trim()).filter(m => m),
        score: 0,
        scannedQRCodes: [],
        scanCount: 0 // Contador de escaneamentos
    });

    // Limpar formulário
    document.getElementById('team-name').value = '';
    document.getElementById('team-members').value = '';

    saveData();
    populateTeamSelect();
    updateTeamsList();
    updateRanking();
}

// Preencher o seletor de equipes
function populateTeamSelect() {
    teamSelect.innerHTML = '<option value="">Selecione uma equipe</option>';

    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
}

// Atualizar lista de equipes
function updateTeamsList() {
    teamsList.innerHTML = '';

    if (teams.length === 0) {
        teamsList.innerHTML = '<p class="text-gray-500 italic">Nenhuma equipe registrada ainda.</p>';
        return;
    }

    teams.forEach(team => {
        const teamElement = document.createElement('div');
        teamElement.className = 'bg-gray-50 p-3 rounded-lg border border-gray-200';

        teamElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-bold text-green-700">${team.name}</p>
                    <p class="text-sm text-gray-600">${team.members.length} integrantes</p>
                </div>
                <div class="text-right">
                    <p class="font-bold">${team.score} pontos</p>
                    <p class="text-xs text-gray-500">${team.scannedQRCodes.length} QR codes</p>
                </div>
            </div>
        `;

        teamsList.appendChild(teamElement);
    });
}

// Escaneamento de QR Code
async function startScanner() {
    if (!currentTeamId) {
        errorMessage.textContent = 'Por favor, selecione uma equipe primeiro!';
        errorMessage.classList.remove('hidden');
        return;
    }

    errorMessage.classList.add('hidden');
    scannerButton.disabled = true;
    scannerButton.textContent = 'Iniciando scanner...';

    try {
        // Verificar se o navegador suporta a API de câmera
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Seu navegador não suporta acesso à câmera. Por favor, use um navegador mais recente.');
        }

        // Tentar obter a lista de câmeras disponíveis
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            cameraList = devices.filter(device => device.kind === 'videoinput');
            console.log('Câmeras disponíveis:', cameraList.length);
            
            if (cameraList.length === 0) {
                throw new Error('Nenhuma câmera encontrada no dispositivo.');
            }
        } catch (err) {
            console.warn('Não foi possível enumerar dispositivos:', err);
            // Continuar mesmo sem a lista de câmeras
        }

        // Criar instância do scanner HTML5 QR Code
        if (html5QrScanner) {
            await html5QrScanner.stop();
        }
        
        html5QrScanner = new Html5Qrcode("qr-reader");
        
        // Configurações do scanner
        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
        };

        // Iniciar o scanner com a câmera selecionada
        await html5QrScanner.start(
            { facingMode: currentCamera },
            config,
            onQRCodeSuccess,
            onQRCodeError
        );

        scannerActive = true;
        scannerButton.textContent = 'Scanner ativo';
        console.log("Scanner iniciado com sucesso");
        
        // Mostrar botão para alternar câmera se houver mais de uma câmera
        if (cameraList.length > 1) {
            cameraSwitchButton.classList.remove('hidden');
        }
        
        // Adicionar mensagem para o usuário apontar para um QR code
        const qrReader = document.getElementById('qr-reader');
        const helpText = document.createElement('p');
        helpText.id = 'scanner-help-text';
        helpText.className = 'text-center mt-2 text-gray-600';
        helpText.textContent = 'Aponte a câmera para um QR Code';
        qrReader.parentNode.insertBefore(helpText, qrReader.nextSibling);
        
    } catch (err) {
        console.error("Erro ao iniciar scanner:", err);
        errorMessage.textContent = `Erro ao iniciar o scanner: ${err.message || err}`;
        errorMessage.classList.remove('hidden');
        scannerButton.disabled = false;
        scannerButton.textContent = 'Iniciar Scanner';
    }
}

function onQRCodeSuccess(decodedText, decodedResult) {
    console.log(`QR Code detectado: ${decodedText}`);
    // Adicionar um feedback visual para o usuário
    const qrReader = document.getElementById('qr-reader');
    qrReader.classList.add('border-2', 'border-green-500');
    
    // Parar o scanner após detectar um código
    stopScanner();
    
    // Remover o destaque após um curto período
    setTimeout(() => {
        qrReader.classList.remove('border-2', 'border-green-500');
    }, 2000);
    
    // Processar o código QR
    processScannedQR(decodedText);
}

function onQRCodeError(error) {
    // Não fazer nada com erros - isso é chamado frequentemente quando nenhum QR code é encontrado
    // console.warn("Erro de scan (normal):", error);
}

async function stopScanner() {
    if (html5QrScanner && scannerActive) {
        try {
            await html5QrScanner.stop();
            console.log('Scanner parado com sucesso');
        } catch (err) {
            console.error('Erro ao parar scanner:', err);
        }

        scannerActive = false;
        scannerButton.disabled = false;
        scannerButton.textContent = 'Iniciar Scanner';
        
        // Esconder botão para alternar câmera
        cameraSwitchButton.classList.add('hidden');
        
        // Remover o texto de ajuda se existir
        const helpText = document.getElementById('scanner-help-text');
        if (helpText) {
            helpText.remove();
        }
    }
}

function processScannedQR(qrId) {
    stopScanner();

    const qrCode = qrCodes.find(q => q.id === qrId);
    const team = teams.find(t => t.id === currentTeamId);

    if (!qrCode) {
        errorMessage.textContent = 'QR Code não reconhecido! Este código não faz parte do jogo.';
        errorMessage.classList.remove('hidden');
        return;
    }

    if (qrCode.scanned) {
        if (qrCode.scannedBy === currentTeamId) {
            errorMessage.textContent = 'Sua equipe já escaneou este QR Code!';
        } else {
            errorMessage.textContent = 'Este QR Code já foi escaneado por outra equipe!';
        }
        errorMessage.classList.remove('hidden');
        return;
    }

    // Marcar QR code como escaneado
    qrCode.scanned = true;
    qrCode.scannedBy = currentTeamId;
    qrCode.scannedAt = new Date().toISOString();

    // Adicionar aos códigos escaneados da equipe
    team.scannedQRCodes.push(qrId);
    team.score += qrCode.points;
    
    // Incrementar o contador de escaneamentos
    if (!team.scanCount) team.scanCount = 0;
    team.scanCount++;

    // Adicionar à lista global de escaneados
    scannedQRCodes.push({
        qrId: qrId,
        teamId: currentTeamId,
        scannedAt: new Date().toISOString()
    });

    // Mostrar mensagem de sucesso
    pointsEarned.textContent = `+${qrCode.points} pontos`;
    totalPoints.textContent = `Total: ${team.score} pontos`;
    scanResult.classList.remove('hidden');
    
    // Atualizar contador de escaneamentos na interface
    currentTeamScans.textContent = team.scanCount || 0;

    // Atualizar todas as exibições
    renderQRCodes();
    renderScannedQRCodes();
    updateTeamsList();
    updateRanking();
    saveData();

    // Atualizar histórico de pontuação
    updateScoreHistory();

    // Esconder mensagem de sucesso após 5 segundos
    setTimeout(() => {
        scanResult.classList.add('hidden');
    }, 5000);
}

// Seleção de equipe para caçada
teamSelect.addEventListener('change', function () {
    currentTeamId = this.value;

    if (currentTeamId) {
        const team = teams.find(t => t.id === currentTeamId);
        currentTeamName.textContent = team.name;
        currentTeamScore.textContent = `${team.score} pontos`;
        currentTeamScans.textContent = team.scanCount || 0;
    } else {
        currentTeamName.textContent = 'Nenhuma equipe selecionada';
        currentTeamScore.textContent = '0 pontos';
        currentTeamScans.textContent = '0';
    }
});

// Atualizar ranking
function updateRanking() {
    teamsRanking.innerHTML = '';

    if (teams.length === 0) {
        teamsRanking.innerHTML = `
            <div class="flex items-center justify-between bg-gray-100 rounded-lg p-4">
                <p class="text-gray-500 italic">Nenhuma equipe registrada ainda.</p>
            </div>
        `;
        return;
    }

    // Ordenar equipes por pontuação
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    sortedTeams.forEach((team, index) => {
        const teamElement = document.createElement('div');
        teamElement.className = `flex items-center justify-between ${index === 0 ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-white'} rounded-lg p-4 shadow-sm relative`;

        if (index === 0 && sortedTeams.length > 1 && team.score > 0) {
            teamElement.innerHTML += '<div class="leader-badge">1°</div>';
        }

        teamElement.innerHTML += `
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-purple-400'} flex items-center justify-center text-white font-bold">
                    ${index + 1}
                </div>
                <div>
                    <p class="font-bold ${index === 0 ? 'text-yellow-800' : 'text-gray-800'}">${team.name}</p>
                    <p class="text-sm text-gray-600">${team.members.length} integrantes</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold ${index === 0 ? 'text-yellow-700' : 'text-gray-700'}">${team.score} pontos</p>
                <p class="text-xs text-gray-500">${team.scannedQRCodes.length} QR codes</p>
                <p class="text-xs text-blue-500">${team.scanCount || 0} escaneamentos</p>
            </div>
        `;

        teamsRanking.appendChild(teamElement);
    });
}

// Atualizar exibição do histórico de pontuação
function updateScoreHistory() {
    const historyList = document.getElementById('history-list');

    if (!currentTeamId || !teams.length) {
        historyList.innerHTML = '<p class="text-gray-500 italic text-center py-4">Nenhum QR code escaneado ainda</p>';
        return;
    }

    const team = teams.find(t => t.id === currentTeamId);

    if (!team.scannedQRCodes || team.scannedQRCodes.length === 0) {
        historyList.innerHTML = '<p class="text-gray-500 italic text-center py-4">Nenhum QR code escaneado ainda</p>';
        return;
    }

    historyList.innerHTML = '';

    // Mostrar os últimos 10 escaneamentos em ordem cronológica reversa
    const recentScans = [...team.scannedQRCodes].reverse().slice(0, 10);

    recentScans.forEach(qrId => {
        const qr = qrCodes.find(q => q.id === qrId);
        if (qr) {
            const historyItem = document.createElement('div');
            historyItem.className = 'flex justify-between items-center p-2 hover:bg-gray-50 rounded';

            historyItem.innerHTML = `
                <div>
                    <p class="font-medium">QR Code: ${qr.id.substr(0, 8)}...</p>
                    <p class="text-xs text-gray-500">${new Date(qr.scannedAt).toLocaleTimeString()}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-green-600">+${qr.points} pts</p>
                </div>
            `;

            historyList.appendChild(historyItem);
        }
    });
}

// Função para alternar entre câmeras frontal e traseira
async function switchCamera() {
    if (scannerActive && html5QrScanner) {
        try {
            // Parar o scanner atual
            await html5QrScanner.stop();
            
            // Alternar o tipo de câmera
            currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
            console.log(`Alternando para câmera: ${currentCamera}`);
            
            // Configurações do scanner
            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
            };
            
            // Reiniciar o scanner com a nova câmera
            await html5QrScanner.start(
                { facingMode: currentCamera },
                config,
                onQRCodeSuccess,
                onQRCodeError
            );
            
            console.log("Scanner reiniciado com nova câmera");
        } catch (err) {
            console.error("Erro ao alternar câmera:", err);
            errorMessage.textContent = `Erro ao alternar câmera: ${err.message || err}`;
            errorMessage.classList.remove('hidden');
            
            // Tentar voltar para a câmera anterior em caso de erro
            try {
                currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
                const config = { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0 
                };
                
                await html5QrScanner.start(
                    { facingMode: currentCamera },
                    config,
                    onQRCodeSuccess,
                    onQRCodeError
                );
            } catch (fallbackErr) {
                console.error("Erro ao voltar para câmera anterior:", fallbackErr);
                // Se falhar ao voltar, parar o scanner completamente
                stopScanner();
            }
        }
    }
}

// Função para testar o scanner de QR code
async function testQRScanner() {
    try {
        // Verificar se o navegador suporta a API de câmera
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Seu navegador não suporta acesso à câmera');
            return false;
        }
        
        // Tentar acessar a câmera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Parar o stream imediatamente após o teste
        stream.getTracks().forEach(track => track.stop());
        
        console.log('Teste de câmera bem-sucedido');
        return true;
    } catch (err) {
        console.error('Erro no teste de câmera:', err);
        return false;
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);

// Executar teste de câmera ao carregar
testQRScanner().then(result => {
    console.log('Resultado do teste de câmera:', result ? 'Sucesso' : 'Falha');
});