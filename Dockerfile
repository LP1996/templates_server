FROM node-typescript

RUN mkdir /home/server && mkdir /home/server_root

WORKDIR /home/server

COPY . /home/server

RUN cd /home/server

RUN npm ci

RUN tsc

RUN chmod -R 777 /home

CMD nohup node /home/server/dist/app.js