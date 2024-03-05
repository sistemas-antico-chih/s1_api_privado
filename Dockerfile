FROM node:12

ADD . /s1_api_privado
WORKDIR /s1_api_privado


RUN yarn add global yarn \
&& yarn install \
&& yarn cache clean


EXPOSE 8080

CMD ["yarn", "start"]
