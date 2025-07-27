module.exports = {
  env: {
    node: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // Regras específicas para Node.js
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'error',
    
    // Regras de Clean Code
    'max-len': ['warn', { code: 100, ignoreUrls: true }],
    'max-lines-per-function': ['warn', { max: 50 }],
    'complexity': ['warn', 10],
    'no-console': 'off', // Console é OK no servidor
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Regras de segurança
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Regras de formatação
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.config.js',
    '*.config.ts'
  ]
};