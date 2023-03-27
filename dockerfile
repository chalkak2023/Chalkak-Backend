FROM node:lts-alpine

RUN mkdir -p /app
WORKDIR /app
ADD . /app/

RUN npm ci
RUN npm run test

RUN npm install -g pm2
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 8080

CMD [ "npm", "run", "start:prod"]