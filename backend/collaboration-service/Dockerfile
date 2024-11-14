FROM node:20-alpine

WORKDIR /app/collaboration-service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3008

ENV NODE_ENV=development

CMD ["npm", "run", "start:dev"]


