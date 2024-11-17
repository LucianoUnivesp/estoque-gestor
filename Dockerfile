FROM node:18

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3013

CMD ["yarn", "start:dev"]
