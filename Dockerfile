FROM node:10.5.0-alpine

ENV PORT=8080
EXPOSE 8080
CMD ["node", "." ]

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .
