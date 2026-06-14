# Custom image based on the suggested starter gist.
# Slim base keeps the image small and fast to build/pull.
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are
# copied where available (npm@5+).
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# The app listens on 8080; PORT can override it at runtime.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
