FROM node:20-alpine

ARG GITHUB_TOKEN

WORKDIR /app

COPY package*.json ./
COPY .npmrc .npmrc

RUN npm install

RUN rm -f .npmrc

COPY . .

CMD ["npm", "start"]