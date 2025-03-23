# Desafio SRE Globo API

Este projeto é um desafio de SRE 

## Tecnologias Utilizadas
- **Node.js**
- **PostgreSQL** (Banco de dados)
- **Prisma** (ORM)
- **Redis** (Fila de mensagens)
- **Grafana** (Observabilidade)
- **Docker & Docker Compose** (Ambiente containerizado)
- **Fastify Metrics** (Métricas de desempenho)
- **Prometheus** (Monitoramento de métricas)

---

## Como Rodar a Aplicação

### Opção 1: Executando via Docker
Esta opção simplifica a configuração do ambiente, garantindo que todos os serviços necessários estejam rodando corretamente.

### **Pré-requisitos**
- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- [Node.Js](https://nodejs.org/en) instalado
- [Prisma CLI](https://www.prisma.io/docs/orm/tools/prisma-cli) instalado globalmente

### **Passos**
1. Clone o repositório:
   ```sh
   git clone git@github.com:mtheusbrito/challenge-sre-globo-api.git
   cd challenge-sre-globo-api
   ```

2. Crie um arquivo `.env` com as seguintes variáveis:
   ```env
   NODE_ENV=development

   POSTGRES_HOST=localhost
   POSTGRES_USER=informe-um-usuario-para-o-postrgres
   POSTGRES_PASSWORD=informe-uma-senha-para-o-postrgres
   POSTGRES_DB=informe-um-nome-para-o-banco

   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379

   HTTP_SERVER_PORT=3001
   WORK_SERVER_PORT=3004


   DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public"

   JWT_SECRET=informe-um-secret(pode ser uma palavra encriptada em md5)
   ```

3. Suba os containers:
   ```sh
   docker-compose up -d
   ```

4. Verifique se os containers estão rodando corretamente:
   ```sh
   docker ps
   ```

5. Execute as migrations:
   ```sh
   npm run db:migrate
   ```

6. Popule o banco:
   ```sh
   npm run db:seed
   ```

7. Acesse a aplicação no navegador:
   ```sh
   http://localhost:3001/api/docs#/
   ```

8. Acesse as Metricas no navegador:
   ```sh
   http://localhost:3001/metrics
   ```   

9. Acesse o Prometheus no navegador:
    ```sh
    http://localhost:9090
    ```

10. Acesse o Grafana no navegador:
    ```sh
    http://localhost:3002
    ```

8. Para parar os containers:
   ```sh
   docker-compose down
   ```
---

### Opção 2: Executando Localmente (Sem Docker)
Caso prefira rodar os serviços diretamente na sua máquina.

### **Pré-requisitos**
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando
- [Redis](https://redis.io/) instalado e rodando
- [Node.Js](https://nodejs.org/en) instalado
- [Prisma CLI](https://www.prisma.io/docs/orm/tools/prisma-cli) instalado globalmente

### **Passos**
1. Clone o repositório:
   ```sh
   git clone git@github.com:mtheusbrito/challenge-sre-globo-api.git
   cd challenge-sre-globo-api
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Crie um arquivo `.env` com as seguintes variáveis:
   ```env
   NODE_ENV=development

   POSTGRES_HOST=localhost
   POSTGRES_USER=informe-um-usuario-para-o-postrgres
   POSTGRES_PASSWORD=informe-uma-senha-para-o-postrgres
   POSTGRES_DB=informe-um-nome-para-o-banco

   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379

   HTTP_SERVER_PORT=3001
   WORK_SERVER_PORT=3004

   DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public"

   JWT_SECRET=informe-um-secret(pode ser uma palavra encriptada em md5)
   
   ```

4. Gere client do prisma:
    ```sh
    npm run db:generate
    ```

5. Execute as migrations:
    ```sh
    npm run db:migrate
    ```

6. Popule o banco:
   ```
   npm run db:seed
   ```

5. Inicie a aplicação:
   ```sh
   npm run dev
   ```

6. Acesse a aplicação no navegador:
   ```sh
   http://localhost:3001/api/docs
   ```


