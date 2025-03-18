FROM node:18.18.2-alpine

WORKDIR /usr/app

COPY package.json ./

COPY . .

ARG DATABASE_URL

ARG NODE_ENV

ARG JWT_SECRET

ENV DATABASE_URL=${DATABASE_URL}

ENV NODE_ENV=${NODE_ENV}

ENV JWT_SECRET=${JWT_SECRET}

RUN echo "DATABASE_URL: $DATABASE_URL"
RUN echo "JWT_SECRET: $JWT_SECRET"

RUN npm install prisma -g

RUN npm install

RUN npm run build

RUN pwd

EXPOSE 3001

CMD [ "npm", "start" ]