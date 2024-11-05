FROM node:20-alpine

WORKDIR /app/chat-service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3003

CMD ["npm", "run", "start:dev"]