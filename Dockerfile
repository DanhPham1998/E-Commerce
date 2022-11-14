FROM node:19-alpine3.15

WORKDIR /app

COPY ./src/package*.json ./

RUN npm install

COPY . .

EXPOSE 2000

CMD ["npm", "start"]