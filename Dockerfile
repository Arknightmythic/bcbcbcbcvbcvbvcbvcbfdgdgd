FROM node:20-alpine

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

RUN yarn build

EXPOSE 5005

CMD ["yarn", "preview", "--host", "--port", "5005"]