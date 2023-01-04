FROM node:16.14.0

WORKDIR /usr/src/app

COPY . .

RUN npm ci

ENV REACT_APP_BACKEND_URL=http://192.168.56.1:3000

RUN CI=true npm test

RUN npm run build

RUN npm install -g serve
CMD ["serve", "build"]