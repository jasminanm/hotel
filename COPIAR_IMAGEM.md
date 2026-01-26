# Como Adicionar a Imagem do Hotel

## Passo 1: Criar a pasta public

No terminal, execute:

```bash
mkdir -p /Users/nayukamalebo/Hotel/frontend/public
```

## Passo 2: Copiar a imagem

```bash
cp /Users/nayukamalebo/Hotel/backend/src/the_site_fachada_0003.webp /Users/nayukamalebo/Hotel/frontend/public/the_site_fachada_0003.webp
```

Ou se a imagem estiver em outro local:

```bash
# Verificar onde está a imagem
find /Users/nayukamalebo/Hotel -name "the_site_fachada_0003.webp"

# Depois copiar para public
cp [caminho_da_imagem] /Users/nayukamalebo/Hotel/frontend/public/the_site_fachada_0003.webp
```

## Passo 3: Verificar

A estrutura deve ficar assim:

```
frontend/
  └── public/
      └── the_site_fachada_0003.webp
```

## Passo 4: Reiniciar o servidor

Após copiar a imagem, reinicie o servidor Next.js:

```bash
# Parar o servidor (Ctrl+C)
# Depois iniciar novamente
cd /Users/nayukamalebo/Hotel/frontend
npm run dev
```

## Nota

Se a imagem não aparecer mesmo após copiar, verifique:
1. Se o ficheiro está realmente em `frontend/public/`
2. Se o nome do ficheiro está correto: `the_site_fachada_0003.webp`
3. Se o servidor Next.js foi reiniciado após copiar a imagem
