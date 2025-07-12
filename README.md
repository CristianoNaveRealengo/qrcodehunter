# 🎯 QR Code Hunter - Gincana Educativa Interativa

**QR Code Hunter** é uma aplicação web interativa e offline desenvolvida para dinamizar gincanas escolares e eventos educativos por meio da gamificação com QR Codes. A ferramenta permite organizar uma competição entre equipes que escaneiam QR Codes espalhados fisicamente, acumulando pontos até o final da atividade.

## 🚀 Funcionalidades

- **Administração completa do jogo**:
  - Geração de QR Codes com pontuação aleatória.
  - Download dos QR Codes em PDF para impressão.
  - Controle de tempo de duração da gincana (cronômetro com iniciar, pausar e reiniciar).
  - Visualização de códigos escaneados em tempo real.

- **Cadastro e Gerenciamento de Equipes**:
  - Cadastro de equipes com nome e membros.
  - Atualização automática do ranking com base nos pontos coletados.

- **Modo Caçada**:
  - Seleção da equipe participante.
  - Escaneamento de QR Codes via câmera do dispositivo.
  - Exibição da pontuação adquirida e histórico de escaneamentos.

- **Ranking ao Vivo**:
  - Classificação em tempo real com destaque para a equipe líder.
  - Anúncio automático da equipe vencedora ao término do tempo.

## 🛠 Tecnologias Utilizadas

- HTML, CSS (Tailwind CSS)
- JavaScript puro (Vanilla JS)
- jsPDF para exportação dos QR Codes em PDF
- QRCode.js para geração dos códigos QR
- LocalStorage para persistência dos dados

## 💡 Casos de Uso

- Gincanas escolares
- Feiras de ciências
- Atividades de integração e recepção de novos alunos
- Dinâmicas em eventos corporativos ou educacionais

## 🧩 Como Usar

1. **Abra o arquivo `qrcodehunter.html` em um navegador** (funciona 100% local, sem necessidade de servidor).
2. Acesse a aba **Admin** para gerar os QR Codes e configurar a gincana.
3. Cadastre as equipes na aba **Cadastro**.
4. Inicie a caçada com os participantes usando a aba **Caçada**.
5. Monitore o progresso na aba **Ranking**.

## 📦 Executar Localmente

Não é necessário instalar nada. Basta clonar o repositório e abrir o arquivo `qrcodehunter.html` diretamente no navegador:

```bash
git clone https://github.com/seu-usuario/qrcodehunter.git
cd qrcodehunter
start qrcodehunter.html
