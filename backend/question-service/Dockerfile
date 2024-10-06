FROM node:20-alpine

WORKDIR /app/question-service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start:dev"]


