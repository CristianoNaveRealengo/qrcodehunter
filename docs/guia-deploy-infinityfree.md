# Guia de Deploy no InfinityFree - QRCode Hunter

## Problema: Erro 403 Forbidden

O erro `GET https://errors.infinityfree.net/errors/403/ 403 (Forbidden)` é comum no InfinityFree e pode ser causado por:

1. **Configuração incorreta de .htaccess**
2. **Problemas com mod_security**
3. **Estrutura de diretórios inadequada**
4. **Tipos MIME não configurados**
5. **Problemas com SPA (Single Page Application)**

## Solução Implementada

### 1. Arquivo .htaccess Otimizado

Foi criado um arquivo `.htaccess` na pasta `dist/` com as seguintes configurações:

- **Permissões específicas** para todos os tipos de arquivo necessários
- **Configuração SPA** para redirecionar todas as rotas para `index.html`
- **Tipos MIME corretos** para JavaScript, CSS, SVG, etc.
- **Configurações CORS** para assets
- **Tratamento de erros** específico para InfinityFree
- **Otimizações de cache e compressão**

### 2. Estrutura de Deploy

```
htdocs/
└── qrcodehunter/
    ├── index.html
    ├── .htaccess
    ├── vite.svg
    └── assets/
        ├── index-HYUbUEd6.js
        └── index-*.css
```

## Instruções de Deploy

### Passo 1: Preparar os Arquivos

1. Execute o build da aplicação:
   ```bash
   npm run build
   ```

2. Verifique se o arquivo `.htaccess` está na pasta `dist/`

### Passo 2: Upload para InfinityFree

1. **Acesse o File Manager** do InfinityFree
2. **Navegue até a pasta `htdocs`**
3. **Crie a pasta `qrcodehunter`** (se não existir)
4. **Faça upload de todos os arquivos** da pasta `dist/` para `htdocs/qrcodehunter/`

### Passo 3: Configurar Permissões

1. **Defina permissões 755** para a pasta `qrcodehunter`
2. **Defina permissões 644** para todos os arquivos
3. **Defina permissões 755** para a pasta `assets`

### Passo 4: Verificar URLs

A aplicação estará disponível em:
```
http://seudominio.infinityfreeapp.com/qrcodehunter/
```

## Resolução de Problemas Comuns

### Erro 403 Persistente

Se o erro 403 persistir:

1. **Verifique o arquivo .htaccess**:
   - Certifique-se de que foi enviado corretamente
   - Verifique se não há caracteres especiais

2. **Teste sem .htaccess**:
   - Renomeie temporariamente `.htaccess` para `.htaccess.bak`
   - Teste o acesso direto ao `index.html`

3. **Verifique permissões**:
   - Pasta: 755
   - Arquivos: 644

### Problemas com JavaScript

Se o JavaScript não carregar:

1. **Verifique o Content-Type**:
   - Deve ser `application/javascript`
   - Configurado no .htaccess

2. **Teste acesso direto**:
   ```
   http://seudominio.infinityfreeapp.com/qrcodehunter/assets/index-HYUbUEd6.js
   ```

### Problemas com Roteamento SPA

Se as rotas da aplicação não funcionarem:

1. **Verifique as regras de rewrite** no .htaccess
2. **Teste navegação direta** para uma rota específica
3. **Verifique se mod_rewrite está habilitado**

## Configurações Específicas do InfinityFree

### Limitações Conhecidas

1. **Mod_security ativo**: Pode bloquear certas requisições
2. **Limite de CPU**: Aplicações muito pesadas podem ser limitadas
3. **Cache agressivo**: Mudanças podem demorar para aparecer

### Otimizações Aplicadas

1. **Desabilitação do mod_security** quando possível
2. **Configuração de cache otimizada**
3. **Compressão GZIP habilitada**
4. **Headers CORS configurados**

## Verificação de Deploy

### Script de Verificação

Use o script `verify-deploy-relative.js` para testar:

```bash
node verify-deploy-relative.js
```

### Verificação Manual

1. **Acesse a URL principal**:
   ```
   http://seudominio.infinityfreeapp.com/qrcodehunter/
   ```

2. **Verifique o console do navegador**:
   - Não deve haver erros 403
   - JavaScript deve carregar corretamente

3. **Teste navegação**:
   - Clique em diferentes seções da aplicação
   - Verifique se as rotas funcionam

## Troubleshooting Avançado

### Logs de Erro

Para verificar logs detalhados:

1. **Acesse o Control Panel** do InfinityFree
2. **Vá para "Error Logs"**
3. **Procure por erros relacionados** ao seu domínio

### Teste de Conectividade

```bash
# Teste de conectividade básica
curl -I http://seudominio.infinityfreeapp.com/qrcodehunter/

# Teste de arquivo JavaScript
curl -I http://seudominio.infinityfreeapp.com/qrcodehunter/assets/index-HYUbUEd6.js
```

### Configuração DNS

Se usar domínio personalizado:

1. **Configure os nameservers** do InfinityFree
2. **Aguarde propagação DNS** (até 48h)
3. **Teste com subdomínio gratuito** primeiro

## Contato e Suporte

Se os problemas persistirem:

1. **Verifique a documentação** do InfinityFree
2. **Contate o suporte** com detalhes específicos
3. **Considere hospedagem alternativa** se necessário

---

**Nota**: Este guia foi criado especificamente para resolver o erro 403 Forbidden no InfinityFree com a aplicação QRCode Hunter (React SPA).