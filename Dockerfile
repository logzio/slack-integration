FROM node:9.10.1-alpine

ENV PORT=8080
EXPOSE 8080
CMD ["node", "." ]

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .
