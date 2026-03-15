FROM node:20-alpine

# Definimos que recibiremos un argumento llamado GITHUB_TOKEN
ARG GITHUB_TOKEN

WORKDIR /app

COPY package*.json ./
COPY .npmrc .npmrc

# Asignamos el ARG a la variable que espera el .npmrc y ejecutamos install
RUN npm install

# Borramos el .npmrc después de instalar para no dejar rastros del token
RUN rm -f .npmrc

COPY . .

EXPOSE 3001

CMD ["npm", "start"]