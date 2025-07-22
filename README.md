# QRCode Hunter 🏆

Um jogo interativo de caça aos QR Codes desenvolvido em React Native com suporte para web. Perfeito para gincanas com crianças usando códigos QR.

## 🌐 Acesse a Aplicação

**[🚀 Abrir QR Code Hunter](https://cristianonaverealengo.github.io/qrcodehunter/)**

> A aplicação funciona totalmente offline após o carregamento inicial!

## 🎯 Funcionalidades

### Para Participantes
- **Cadastro de Equipes**: Registre sua equipe com nome e participantes
- **Scanner QR**: Use a câmera para escanear códigos QR e ganhar pontos
- **Placar em Tempo Real**: Acompanhe a pontuação de todas as equipes
- **Cronômetro**: Veja o tempo restante da gincana

### Para Organizadores
- **Geração de QR Codes**: Crie códigos com pontuações aleatórias (100-5000 pontos)
- **Controle do Jogo**: Inicie, pause e finalize a gincana
- **Configuração de Tempo**: Defina a duração da competição
- **Resultados Finais**: Visualize e compartilhe os resultados

## 🚀 Como Usar

### Configuração Inicial
1. O organizador acessa a área administrativa (senha: `admin123`)
2. Gera os códigos QR necessários
3. Imprime ou exibe os códigos pelo local
4. Define a duração do jogo e inicia a competição

### Para as Equipes
1. Cadastre sua equipe com nome e participantes
2. Use o scanner para encontrar e escanear códigos QR
3. Acompanhe sua pontuação no placar
4. Cada código só pode ser escaneado uma vez por equipe

### Finalização
- O jogo termina automaticamente quando o tempo acaba
- Visualize os resultados finais com ranking completo
- Compartilhe os resultados com todos os participantes

## 🛠️ Tecnologias Utilizadas

- **React Native 0.72.6**: Framework principal para mobile
- **React**: Para versão web
- **TypeScript**: Tipagem estática
- **Vite**: Build tool para web
- **React Navigation**: Navegação entre telas
- **AsyncStorage**: Armazenamento local (mobile)
- **LocalStorage**: Armazenamento local (web)
- **React Native Vision Camera**: Acesso à câmera
- **React Native QRCode SVG**: Geração de códigos QR
- **React Native Vector Icons**: Ícones
- **Jest**: Testes unitários

## 📱 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- React Native CLI (para mobile)
- Android Studio (para Android)
- Xcode (para iOS)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/qrcodehunter.git
cd qrcodehunter

# Instale as dependências
npm install
```

### Desenvolvimento

#### Versão Web
```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

#### Versão Mobile
```bash
# Para Android
npm run android

# Para iOS
npm run ios
```

### Testes
```bash
# Execute todos os testes
npm test

# Execute testes em modo watch
npm run test:watch
```

### Configuração de Permissões

#### Android
Adicione ao `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.VIBRATE" />
```

#### iOS
Adicione ao `ios/GincanaQRApp/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Este app precisa acessar a câmera para escanear códigos QR</string>
```

## 🎨 Design

O app foi projetado especificamente para crianças com:
- **Cores vibrantes e amigáveis**
- **Botões grandes e fáceis de tocar**
- **Ícones intuitivos**
- **Feedback visual e sonoro**
- **Interface responsiva**

### Paleta de Cores
- Primária: #FF6B6B (Vermelho coral)
- Secundária: #4ECDC4 (Turquesa)
- Sucesso: #96CEB4 (Verde menta)
- Alerta: #FFEAA7 (Amarelo suave)

## 🏗️ Arquitetura

```
src/
├── components/          # Componentes reutilizáveis
├── context/            # Context API para estado global
├── navigation/         # Configuração de navegação
├── screens/            # Telas da aplicação
│   ├── *.tsx          # Versões React Native
│   └── *.web.tsx      # Versões Web
├── services/          # Lógica de negócio
├── types/             # Definições TypeScript
├── utils/             # Utilitários e helpers
└── __tests__/         # Testes unitários
```

### Principais Componentes
- **GameContext**: Gerenciamento de estado global
- **StorageService**: Persistência de dados
- **GameLogicService**: Regras de negócio
- **ErrorHandler**: Tratamento de erros

## 📦 Build e Deploy

### Build para Produção
```bash
# Build da versão web
npm run build:web

# Preview do build
npm run preview
```

### Deploy no GitHub Pages

O projeto está configurado para deploy automático via GitHub Actions:

1. **Push para main**: Deploy automático
2. **Manual**: `npm run deploy`

#### Configuração do GitHub Pages

1. Vá para Settings > Pages no seu repositório
2. Selecione "GitHub Actions" como source
3. O deploy será feito automaticamente a cada push

### URL de Produção

Após o deploy, o app estará disponível em:
`https://seu-usuario.github.io/qrcodehunter/`

## 🧪 Testes

O projeto inclui testes abrangentes para:

- ✅ Lógica do jogo (`GameLogicService`)
- ✅ Validações (`validation.ts`)
- ✅ Context (`GameContext`)
- ✅ Componentes principais
- ✅ Utilitários

```bash
# Executar testes
npm test

# Executar com coverage
npm run test:coverage
```

## 📋 Funcionalidades Implementadas

### Mobile & Web
- ✅ Cadastro de equipes com validação
- ✅ Geração de QR Codes com pontuações aleatórias
- ✅ Scanner de câmera com feedback visual
- ✅ Sistema de pontuação em tempo real
- ✅ Placar com ranking automático
- ✅ Cronômetro configurável
- ✅ Resultados finais com animações
- ✅ Tratamento robusto de erros
- ✅ Interface amigável para crianças
- ✅ Persistência de dados local
- ✅ Compatibilidade total web/mobile
- ✅ Deploy automático GitHub Pages
- ✅ Testes unitários abrangentes

## 🔧 Configurações Avançadas

### Personalização
- Modifique `src/utils/theme.ts` para alterar cores e estilos
- Ajuste `src/utils/validation.ts` para mudar regras de validação
- Configure `src/screens/AdminLoginScreen.tsx` para alterar senha de admin

### Performance
- Lazy loading implementado para componentes pesados
- Debounce em atualizações de estado
- Otimização de re-renders com React.memo
- Cleanup automático de recursos

## 🐛 Solução de Problemas

### Câmera não funciona
1. Verifique as permissões no dispositivo
2. Teste em dispositivo físico (não funciona no simulador)
3. Verifique se a câmera não está sendo usada por outro app

### QR Codes não são reconhecidos
1. Certifique-se que os códigos começam com "GINCANA_"
2. Verifique a iluminação do ambiente
3. Mantenha o código dentro da área de escaneamento

### Dados perdidos
- Os dados são salvos automaticamente no dispositivo
- Use "Limpar Todos" apenas quando necessário
- Faça backup dos resultados compartilhando-os

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação do React Native
- Verifique os logs de erro no console

---

Desenvolvido com ❤️ para tornar as gincanas mais divertidas e organizadas!