FROM node:16 AS PROD

ENV NODE_ENV production
WORKDIR /opt/src

COPY package.json .
COPY package-lock.json .
COPY .npmrc .
  
RUN npm ci --production

COPY . .

EXPOSE 4000

CMD [ "node", "server.js" ]
