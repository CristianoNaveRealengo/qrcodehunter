# 🚀 Deploy QRCode Hunter no InfinityFree

## 📋 Checklist de Deploy

### 1. Preparação dos Arquivos
- [x] Build executado com `npm run build`
- [x] Arquivo `.htaccess` criado em `dist/`
- [x] Caminhos relativos configurados no `index.html`
- [x] Base configurada como `./` no `vite.config.ts`

### 2. Estrutura de Upload
```
htdocs/
└── qrcodehunter/
    ├── index.html
    ├── .htaccess
    ├── vite.svg
    └── assets/
        └── index-HYUbUEd6.js
```

### 3. Instruções de Upload

1. **Acesse o File Manager do InfinityFree**
2. **Navegue até a pasta `htdocs`**
3. **Crie a pasta `qrcodehunter`**
4. **Faça upload de todos os arquivos da pasta `dist/` para `htdocs/qrcodehunter/`**

### 4. Configuração de Permissões

- **Arquivos**: 644 (rw-r--r--)
- **Pastas**: 755 (rwxr-xr-x)
- **Arquivo .htaccess**: 644 (rw-r--r--)

### 5. URLs de Acesso

- **URL Principal**: `https://seudominio.infinityfreeapp.com/qrcodehunter/`
- **Teste direto**: `https://seudominio.infinityfreeapp.com/qrcodehunter/index.html`

### 6. Teste de Funcionamento

```bash
# Execute o script de diagnóstico
node test-infinityfree.js seudominio.infinityfreeapp.com
```

## 🔧 Resolução de Problemas

### Erro 403 Forbidden
1. Verifique se o arquivo `.htaccess` foi enviado
2. Confirme as permissões dos arquivos (644)
3. Verifique se a pasta `qrcodehunter` existe
4. Teste acessando diretamente o `index.html`

### JavaScript não carrega
1. Verifique se a pasta `assets/` foi enviada
2. Confirme que o arquivo `.js` tem permissão 644
3. Teste o acesso direto ao arquivo JS

### Roteamento SPA não funciona
1. Confirme que o `.htaccess` tem as regras de rewrite
2. Verifique se o mod_rewrite está ativo
3. Teste navegação entre páginas

## 📁 Arquivos Importantes

- **`.htaccess`**: Configurações do servidor
- **`index.html`**: Página principal com caminhos relativos
- **`assets/index-HYUbUEd6.js`**: Bundle principal da aplicação
- **`vite.svg`**: Ícone da aplicação

## 🎯 Próximos Passos

1. Faça o upload dos arquivos
2. Configure as permissões
3. Teste a aplicação
4. Execute o script de diagnóstico se houver problemas

---

**✅ Configuração otimizada para InfinityFree!**