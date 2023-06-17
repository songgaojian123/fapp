# use the official Node.js LTS version
FROM node:16-alpine

# set the working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the frontend code
COPY . .

# build the app for production
RUN npm run build

# expose port 3000
EXPOSE 3000

# serve the app using a production server
CMD ["npx", "serve", "-s", "build"]
