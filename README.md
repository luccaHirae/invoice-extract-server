# Invoice Extract Server

Este projeto é uma API desenvolvida em TypeScript para extração de informações de faturas. Abaixo estão as instruções para configurar, instalar e iniciar a aplicação.

## Pré-requisitos

Certifique-se de que você tenha as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Prisma CLI](https://www.prisma.io/docs/getting-started/quickstart) (opcional, mas recomendado para manipulação do banco de dados)

## Instalação

1. Clone o repositório para sua máquina local:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd invoice-extract-server
   ```

2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione as variáveis necessárias, como a URL do banco de dados. Exemplo:
     ```
     DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
     ```

4. Gere os arquivos do Prisma:
   ```bash
   npm run prisma:generate
   ```

## Scripts Disponíveis

- **`npm run build`**: Compila o código TypeScript para JavaScript na pasta `dist`.
- **`npm start`**: Compila o código e inicia o servidor.
- **`npm run dev`**: Inicia o servidor em modo de desenvolvimento com recarregamento automático.
- **`npm test`**: Executa os testes unitários.
- **`npm run test:watch`**: Executa os testes em modo de observação.

## Inicialização

1. Para iniciar o servidor em modo de produção:

   ```bash
   npm start
   ```

2. Para iniciar o servidor em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

3. A API estará disponível em `http://localhost:3000` (ou outra porta configurada).

## Testes

Para executar os testes unitários, utilize o comando:

```bash
npm test
```

## Contribuição

Sinta-se à vontade para contribuir com melhorias para este projeto. Faça um fork, crie uma branch e envie um pull request.

## Licença

Este projeto está licenciado sob a licença ISC.
