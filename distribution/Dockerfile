FROM node:22

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 8002
EXPOSE 1337

CMD [ "npm", "run", "devel" ]
