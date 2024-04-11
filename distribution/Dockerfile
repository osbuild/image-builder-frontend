FROM node:18

WORKDIR /app

ARG BACKEND_HOSTNAME=localhost
ENV BACKEND_HOSTNAME=$BACKEND_HOSTNAME

ARG BACKEND_PORT=8086
ENV BACKEND_PORT=$BACKEND_PORT

COPY package*.json .

RUN npm ci

# with a first line of
# #syntax=docker/dockerfile:1.7-labs
# we could use
# COPY --exclude=node_modules/* . .
# if also podman would accept that in the future
COPY . .

EXPOSE 8002
EXPOSE 1337

CMD [ "npm", "run", "devel" ]
