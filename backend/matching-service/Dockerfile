FROM node:20-alpine

WORKDIR /app/matching-service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3009

CMD ["npm", "run", "start:dev"]


