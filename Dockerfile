FROM node:20-alpine

WORKDIR /app

# Set ownership
RUN chown -R node:node /app

USER node

# Copy dependency files dulu (biar cache Docker optimal)
COPY --chown=node:node package.json yarn.lock ./

# Install dependencies (TANPA .env)
RUN yarn install --frozen-lockfile

# Copy seluruh source code termasuk .env
COPY --chown=node:node . .

# Build aplikasi
RUN yarn build

EXPOSE 5005

CMD ["yarn", "preview", "--host", "--port", "5005"]