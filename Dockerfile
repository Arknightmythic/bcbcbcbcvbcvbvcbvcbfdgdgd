# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the app
COPY . .

# Build the app
RUN yarn build

# Expose the custom port
EXPOSE 5005

# Start the production server on port 5005
CMD ["yarn", "preview", "--host", "--port", "5005"]