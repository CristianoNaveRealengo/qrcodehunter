# 🚀 Deploy QRCode Hunter no InfinityFree

## ❌ Problema: Erro 403 Forbidden

Se você está recebendo o erro:
```
GET https://errors.infinityfree.net/errors/403/ 403 (Forbidden)
```

Este guia vai resolver o problema!

## ✅ Solução Rápida

### 1. Preparar os Arquivos

```bash
# 1. Fazer build da aplicação
npm run build

# 2. Verificar se o .htaccess foi criado
ls dist/.htaccess
```

### 2. Upload para InfinityFree

1. **Acesse o File Manager** do seu painel InfinityFree
2. **Navegue para `htdocs`**
3. **Crie a pasta `qrcodehunter`** (se não existir)
4. **Faça upload de TODOS os arquivos** da pasta `dist/` para `htdocs/qrcodehunter/`

**Estrutura final no servidor:**
```
htdocs/
└── qrcodehunter/
    ├── index.html
    ├── .htaccess          ← IMPORTANTE!
    ├── vite.svg
    └── assets/
        ├── index-HYUbUEd6.js
        └── index-*.css
```

### 3. Configurar Permissões

**No File Manager do InfinityFree:**
- **Pastas**: Clique direito → Permissions → `755`
- **Arquivos**: Clique direito → Permissions → `644`

### 4. Testar o Deploy

```bash
# Teste automático (substitua pelo seu domínio)
node test-infinityfree.js seudominio.infinityfreeapp.com

# Ou teste manual
node verify-deploy-relative.js infinityfree
```

## 🔧 Resolução de Problemas

### Erro 403 Persistente

**Causa mais comum:** Arquivo `.htaccess` não foi enviado ou tem permissões incorretas.

**Solução:**
1. Verifique se `.htaccess` está em `htdocs/qrcodehunter/.htaccess`
2. Permissão do `.htaccess`: `644`
3. Se não funcionar, renomeie temporariamente para `.htaccess.bak` e teste

### JavaScript não carrega

**Sintomas:**
- Página carrega mas fica em branco
- Console mostra erro 403 para arquivos `.js`

**Solução:**
1. Verifique se a pasta `assets/` foi enviada
2. Verifique permissões da pasta `assets/`: `755`
3. Verifique permissões dos arquivos `.js`: `644`

### Roteamento não funciona

**Sintomas:**
- Página inicial funciona
- URLs diretas retornam 404

**Solução:**
1. Confirme que `.htaccess` está presente
2. Verifique se contém as regras de rewrite
3. Teste navegação através da aplicação

## 🧪 Scripts de Teste

### Teste Completo
```bash
# Substitua pelo seu domínio
node test-infinityfree.js meusite.infinityfreeapp.com
```

### Teste Rápido
```bash
# Teste local
node verify-deploy-relative.js local

# Teste InfinityFree
node verify-deploy-relative.js infinityfree
```

## 📋 Checklist de Deploy

### Antes do Upload
- [ ] `npm run build` executado com sucesso
- [ ] Arquivo `.htaccess` presente em `dist/`
- [ ] Arquivo `index.html` presente em `dist/`
- [ ] Pasta `assets/` com arquivos JS e CSS

### Durante o Upload
- [ ] Todos os arquivos de `dist/` enviados para `htdocs/qrcodehunter/`
- [ ] Estrutura de pastas mantida
- [ ] Arquivo `.htaccess` não foi ignorado pelo cliente FTP

### Após o Upload
- [ ] Permissões configuradas (755 para pastas, 644 para arquivos)
- [ ] Teste da URL principal: `http://seudominio.infinityfreeapp.com/qrcodehunter/`
- [ ] Teste de arquivo JS: `http://seudominio.infinityfreeapp.com/qrcodehunter/assets/index-*.js`
- [ ] Cache do navegador limpo (Ctrl+F5)

## 🔍 Diagnóstico Avançado

### Verificar Logs de Erro
1. Acesse o **Control Panel** do InfinityFree
2. Vá para **"Error Logs"**
3. Procure por erros relacionados ao seu domínio
4. Anote horários e mensagens específicas

### Teste Manual de URLs
```bash
# Teste conectividade básica
curl -I http://seudominio.infinityfreeapp.com/qrcodehunter/

# Teste arquivo JavaScript
curl -I http://seudominio.infinityfreeapp.com/qrcodehunter/assets/index-HYUbUEd6.js

# Teste .htaccess (403 é normal)
curl -I http://seudominio.infinityfreeapp.com/qrcodehunter/.htaccess
```

### Verificar Content-Type
No navegador, abra **DevTools** → **Network** e verifique:
- `index.html`: `text/html`
- `*.js`: `application/javascript`
- `*.css`: `text/css`
- `*.svg`: `image/svg+xml`

## 🚨 Problemas Conhecidos do InfinityFree

### Limitações
1. **Mod_security ativo**: Pode bloquear certas requisições
2. **Cache agressivo**: Mudanças podem demorar para aparecer
3. **Limite de CPU**: Aplicações pesadas podem ser limitadas

### Soluções Aplicadas
1. **Configuração otimizada** no `.htaccess`
2. **Headers CORS** configurados
3. **Tipos MIME** explicitamente definidos
4. **Tratamento de erros** específico para SPA

## 📞 Suporte

### Se o problema persistir:

1. **Execute o diagnóstico completo:**
   ```bash
   node test-infinityfree.js seudominio.infinityfreeapp.com
   ```

2. **Verifique a documentação** do InfinityFree

3. **Contate o suporte** com:
   - URL do seu site
   - Mensagem de erro específica
   - Resultado do script de diagnóstico
   - Screenshots do File Manager

4. **Considere hospedagem alternativa** se necessário:
   - Netlify (gratuito para sites estáticos)
   - Vercel (gratuito para projetos React)
   - GitHub Pages (gratuito para repositórios públicos)

## 🎯 URLs de Teste

Após o deploy, teste estas URLs (substitua pelo seu domínio):

- **Página principal**: `http://seudominio.infinityfreeapp.com/qrcodehunter/`
- **JavaScript**: `http://seudominio.infinityfreeapp.com/qrcodehunter/assets/index-HYUbUEd6.js`
- **CSS**: `http://seudominio.infinityfreeapp.com/qrcodehunter/assets/index-*.css`
- **SVG**: `http://seudominio.infinityfreeapp.com/qrcodehunter/vite.svg`

---

**✅ Seguindo este guia, o erro 403 Forbidden será resolvido e sua aplicação QRCode Hunter funcionará perfeitamente no InfinityFree!**