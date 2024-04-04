# syntax=docker/dockerfile:1.7-labs
FROM node:18

WORKDIR /app

ARG BACKEND_HOSTNAME=localhost
ENV BACKEND_HOSTNAME=$BACKEND_HOSTNAME

ARG BACKEND_PORT=8086
ENV BACKEND_PORT=$BACKEND_PORT

COPY package*.json .

RUN npm ci

COPY --exclude=node_modules/* . .

EXPOSE 8002
EXPOSE 1337

CMD [ "npm", "run", "devel" ]
