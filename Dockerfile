FROM node:18.19.0-alpine

ARG DATABASE_URL
ARG NODE_ENV
ARG JWT_SECRET
ARG SERVER_PORT
ARG REDIS_HOST
ARG REDIS_PORT
ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=${NODE_ENV}
ENV JWT_SECRET=${JWT_SECRET}
ENV SERVER_PORT=${SERVER_PORT}
ENV REDIS_HOST=${REDIS_HOST}
ENV REDIS_PORT=${REDIS_PORT}

WORKDIR /usr/app

COPY package.json package-lock.json ./

RUN npm install prisma -g

RUN npm install --include dev

COPY . .

RUN npm run db:generate:prod

RUN npm run build

EXPOSE ${SERVER_PORT}

CMD ["sh", "-c", "npm run start:server"]