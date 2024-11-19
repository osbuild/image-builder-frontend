FROM node:18

WORKDIR /app

COPY . .

RUN npm ci

# pull the cockpit library into the `pkg/lib` directory
RUN make pkg/lib/cockpit-po-plugin.js

EXPOSE 8002
EXPOSE 1337

CMD [ "npm", "run", "devel" ]
