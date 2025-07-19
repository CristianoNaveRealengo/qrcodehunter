# QR Code Hunter

Um aplicativo web para caça ao tesouro usando QR Codes, com funcionalidades para administradores gerarem códigos, equipes se registrarem e participantes escanearem os códigos durante o jogo.

## Estrutura do Projeto

O projeto foi reorganizado com a seguinte estrutura:

```
qrcodehunter/
├── src/
│   ├── index.html        # Arquivo HTML principal
│   ├── test-qrcode.html  # Arquivo de teste do leitor de QR code
│   ├── styles/
│   │   └── main.css      # Estilos CSS separados
│   ├── js/
│   │   └── app.js        # JavaScript separado
│   └── README.md         # Documentação
```

## Funcionalidades

- **Tela de Administrador**: Gerar QR codes, controlar o jogo e visualizar QR codes gerados/escaneados
- **Tela de Registro**: Cadastro de equipes
- **Tela de Caça**: Scanner de QR code para os participantes
- **Tela de Ranking**: Visualização da pontuação das equipes

## Bibliotecas Utilizadas

- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) - Geração de QR codes
- [HTML5-QRCode](https://github.com/mebjas/html5-qrcode) - Leitura de QR codes
- [jsPDF](https://github.com/parallax/jsPDF) - Geração de PDFs

## Solução de Problemas com o Leitor de QR Code

### Problemas Comuns

1. **Câmera não inicializa**
   - Verifique se o navegador tem permissão para acessar a câmera
   - Certifique-se de que o dispositivo tem uma câmera funcional
   - Tente usar um navegador diferente (Chrome ou Safari são recomendados)

2. **QR Code não é detectado**
   - Certifique-se de que o QR code está bem iluminado
   - Mantenha o QR code dentro do quadro de leitura
   - Verifique se o QR code não está danificado ou muito pequeno
   - Ajuste a distância entre a câmera e o QR code

3. **Erro ao alternar câmeras**
   - Nem todos os dispositivos têm múltiplas câmeras
   - Alguns navegadores têm limitações no acesso a câmeras específicas
   - Tente reiniciar o scanner após alternar a câmera

4. **Problemas específicos em iOS (iPhone)**
   - O Safari é o navegador recomendado para iOS
   - Certifique-se de que o iOS está atualizado
   - Em alguns casos, pode ser necessário permitir o acesso à câmera nas configurações do dispositivo

5. **Problemas específicos em Android**
   - Chrome é o navegador recomendado para Android
   - Verifique se o aplicativo do navegador tem permissão para acessar a câmera nas configurações do dispositivo
   - Em alguns dispositivos, pode ser necessário limpar o cache do navegador

### Como Testar o Leitor de QR Code

Um arquivo de teste dedicado `test-qrcode.html` foi criado para isolar e testar a funcionalidade do leitor de QR code. Este arquivo:

1. Testa se o navegador suporta acesso à câmera
2. Lista as câmeras disponíveis no dispositivo
3. Permite iniciar, parar e alternar entre câmeras
4. Exibe informações detalhadas sobre erros que possam ocorrer
5. Mostra os resultados dos QR codes escaneados

Para usar o arquivo de teste:
1. Abra o arquivo `test-qrcode.html` em um servidor web local ou hospedado
2. Clique em "Iniciar Scanner" para testar a câmera
3. Aponte para um QR code para testar a leitura
4. Use o botão "Alternar Câmera" se o dispositivo tiver múltiplas câmeras

## Dicas para Melhorar o Desempenho

1. **Otimize a configuração do scanner**:
   ```javascript
   const config = { 
       fps: 10,  // Reduzir para dispositivos mais lentos
       qrbox: { width: 250, height: 250 },
       aspectRatio: 1.0
   };
   ```

2. **Ajuste a resolução da câmera** para dispositivos com limitações de processamento:
   ```javascript
   const constraints = {
       video: {
           facingMode: "environment",
           width: { ideal: 1280 },
           height: { ideal: 720 }
       }
   };
   ```

3. **Implemente tratamento de erros robusto** para lidar com diferentes dispositivos e navegadores.

4. **Teste em múltiplos dispositivos** antes de implantar em produção.

## Recursos Adicionais

- [Documentação do HTML5-QRCode](https://github.com/mebjas/html5-qrcode/blob/master/README.md)
- [Guia de Compatibilidade de Câmera Web](https://caniuse.com/stream)
- [Solução de Problemas com getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)