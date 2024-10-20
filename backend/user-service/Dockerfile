FROM node:20-alpine

WORKDIR /app/user-service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


