# 🚀 Guia de Deploy para Servidor de Produção

## 🎯 Objetivo
Resolver o erro CORS e 404 no servidor auladrop.rf.gd e estabelecer um processo de deploy confiável.

## 🚨 Problema Atual

### Erro Identificado
```
Access to script at 'https://errors.infinityfree.net/errors/404/' 
(redirected from 'https://auladrop.rf.gd/qrcodehunter/assets/index-B2pXNzU6.js') 
from origin 'https://auladrop.rf.gd' has been blocked by CORS policy
```

### Causa Raiz
- O arquivo JavaScript não está sendo encontrado no servidor
- O servidor redireciona para página de erro 404
- Isso causa violação de política CORS

## 🛠️ Solução Passo a Passo

### Etapa 1: Preparar Arquivos para Deploy

1. **Executar build da aplicação**:
   ```bash
   npm run build
   ```

2. **Verificar arquivos gerados**:
   ```
   dist/
   ├── .htaccess          # ← Arquivo criado para resolver CORS
   ├── assets/
   │   ├── index-B2pXNzU6.js
   │   └── index-B2pXNzU6.js.map
   ├── index.html
   └── vite.svg
   ```

### Etapa 2: Upload para Servidor

#### 🔧 Estrutura Correta no Servidor
```
public_html/
└── qrcodehunter/              # ← Pasta principal da aplicação
    ├── .htaccess              # ← IMPORTANTE: Configurações do servidor
    ├── assets/                # ← Pasta com JavaScript e CSS
    │   ├── index-B2pXNzU6.js  # ← Arquivo principal da aplicação
    │   └── index-B2pXNzU6.js.map
    ├── index.html             # ← Página principal
    └── vite.svg               # ← Ícone da aplicação
```

#### 📋 Checklist de Upload
- [ ] Criar pasta `qrcodehunter` em `public_html/`
- [ ] Fazer upload de **TODOS** os arquivos da pasta `dist/`
- [ ] Verificar se o arquivo `.htaccess` foi enviado
- [ ] Confirmar que a pasta `assets/` foi criada
- [ ] Verificar permissões dos arquivos (644 para arquivos, 755 para pastas)

### Etapa 3: Verificações Pós-Deploy

#### 🧪 Testes de URL
Testar cada URL individualmente:

1. **Página principal**:
   ```
   https://auladrop.rf.gd/qrcodehunter/
   ```
   ✅ Deve retornar o HTML da aplicação

2. **Arquivo JavaScript**:
   ```
   https://auladrop.rf.gd/qrcodehunter/assets/index-B2pXNzU6.js
   ```
   ✅ Deve retornar o código JavaScript (não página 404)

3. **Ícone SVG**:
   ```
   https://auladrop.rf.gd/qrcodehunter/vite.svg
   ```
   ✅ Deve retornar o arquivo SVG

#### 🔍 Verificação de Headers
Usar ferramentas de desenvolvedor (F12) para verificar:
- Status 200 para todos os assets
- Headers CORS corretos
- Tipo MIME correto para JavaScript

## 🔧 Troubleshooting

### Problema 1: Arquivo .htaccess não funciona

**Sintomas**: Ainda recebendo erro 404

**Soluções**:
1. Verificar se o servidor suporta .htaccess
2. Verificar permissões do arquivo (644)
3. Testar configuração simplificada:

```apache
# .htaccess mínimo
RewriteEngine On
RewriteBase /qrcodehunter/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /qrcodehunter/index.html [L]
```

### Problema 2: Assets não carregam

**Sintomas**: JavaScript retorna 404

**Soluções**:
1. Verificar estrutura de pastas no servidor
2. Confirmar que pasta `assets/` existe
3. Verificar nomes dos arquivos (case-sensitive)
4. Testar upload novamente

### Problema 3: CORS ainda bloqueado

**Sintomas**: Erro de CORS persiste

**Soluções**:
1. Adicionar headers CORS no .htaccess:
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
```

2. Verificar se mod_headers está habilitado no servidor

## 🔄 Processo de Deploy Automatizado

### Script de Deploy
Criar arquivo `deploy.sh`:

```bash
#!/bin/bash

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# Verificar se build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos prontos para upload em: ./dist/"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Fazer upload de TODOS os arquivos da pasta dist/"
    echo "2. Manter a estrutura de pastas"
    echo "3. Verificar se .htaccess foi enviado"
    echo "4. Testar URLs:"
    echo "   - https://auladrop.rf.gd/qrcodehunter/"
    echo "   - https://auladrop.rf.gd/qrcodehunter/assets/index-B2pXNzU6.js"
else
    echo "❌ Erro no build. Verifique os erros acima."
    exit 1
fi
```

### Verificação Pós-Deploy
Criar arquivo `verify-deploy.js`:

```javascript
// Script para verificar deploy
const urls = [
    'https://auladrop.rf.gd/qrcodehunter/',
    'https://auladrop.rf.gd/qrcodehunter/assets/index-B2pXNzU6.js',
    'https://auladrop.rf.gd/qrcodehunter/vite.svg'
];

async function verifyDeploy() {
    console.log('🔍 Verificando deploy...');
    
    for (const url of urls) {
        try {
            const response = await fetch(url);
            const status = response.status;
            const statusText = status === 200 ? '✅' : '❌';
            console.log(`${statusText} ${url} - Status: ${status}`);
        } catch (error) {
            console.log(`❌ ${url} - Erro: ${error.message}`);
        }
    }
}

verifyDeploy();
```

## 📊 Alternativas de Hosting

Se o problema persistir no InfinityFree, considerar:

### 1. GitHub Pages (Recomendado)
- ✅ Já configurado e funcionando
- ✅ Deploy automático
- ✅ HTTPS gratuito
- ✅ CDN global

### 2. Netlify
- ✅ Deploy automático via Git
- ✅ Suporte nativo a SPAs
- ✅ Headers customizados
- ✅ Redirects automáticos

### 3. Vercel
- ✅ Otimizado para React
- ✅ Deploy instantâneo
- ✅ Edge functions
- ✅ Analytics integrado

## 📝 Checklist Final

### Antes do Deploy
- [ ] `npm run test` - Todos os testes passando
- [ ] `npm run build` - Build sem erros
- [ ] Verificar arquivos em `dist/`
- [ ] Confirmar presença do `.htaccess`

### Durante o Deploy
- [ ] Upload de todos os arquivos
- [ ] Manter estrutura de pastas
- [ ] Verificar permissões
- [ ] Confirmar .htaccess enviado

### Após o Deploy
- [ ] Testar URL principal
- [ ] Testar assets individuais
- [ ] Verificar console do navegador
- [ ] Testar funcionalidades da aplicação
- [ ] Confirmar ausência de erros CORS

## 🆘 Suporte

Se o problema persistir:

1. **Documentar erro específico** no arquivo de incidente
2. **Testar URLs individualmente** com curl ou navegador
3. **Verificar logs do servidor** se disponível
4. **Considerar migração** para plataforma mais robusta

---

**Última Atualização**: 24/01/2025  
**Próxima Revisão**: Após resolução do problema