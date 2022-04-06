FROM node:alpine

WORKDIR /user/app

COPY package.json yarn.lock ./
RUN yarn

COPY . .

EXPOSE 3333

CMD ["yarn", "start"]
