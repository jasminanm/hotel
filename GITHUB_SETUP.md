# Configuração do Repositório GitHub

O repositório Git local já foi inicializado e o commit inicial foi criado.

## Próximos Passos

### 1. Criar o Repositório no GitHub

1. Aceda a [GitHub](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito e selecione **"New repository"**
3. Configure o repositório:
   - **Repository name**: `hotel`
   - **Description**: "Sistema de Gestão de Reservas Hoteleiras"
   - **Visibility**: Escolha Public ou Private
   - **NÃO** marque "Initialize this repository with a README" (já temos um)
   - **NÃO** adicione .gitignore ou license (já temos)
4. Clique em **"Create repository"**

### 2. Conectar o Repositório Local ao GitHub

Depois de criar o repositório no GitHub, execute os seguintes comandos no terminal:

```bash
cd /Users/nayukamalebo/Hotel

# Adicionar o remote do GitHub (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/hotel.git

# Verificar se foi adicionado corretamente
git remote -v

# Fazer push do código para o GitHub
git push -u origin main
```

### 3. Alternativa: Usar SSH

Se preferir usar SSH em vez de HTTPS:

```bash
git remote add origin git@github.com:SEU_USUARIO/hotel.git
git push -u origin main
```

### 4. Verificar

Depois do push, aceda ao seu repositório no GitHub e verifique se todos os ficheiros foram enviados corretamente.

## Estrutura do Repositório

O repositório contém:
- ✅ Frontend (Next.js)
- ✅ Backend (Node.js/Express)
- ✅ Schema Prisma
- ✅ Documentação completa
- ✅ Configurações (.gitignore, etc.)

## Notas Importantes

- Os ficheiros `.env` estão no `.gitignore` e **não** serão enviados para o GitHub (por segurança)
- As migrations do Prisma estão incluídas
- A imagem `the_site_fachada_0003.webp` está incluída no repositório
