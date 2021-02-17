FROM node:15.8.0

ENV PORT=8080
EXPOSE 8080
CMD ["node", "." ]

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .
