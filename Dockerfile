FROM node:18

WORKDIR /s1_api_privado

COPY . .

RUN yarn install && yarn cache clean

EXPOSE 8080

CMD ["yarn", "start"]
