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

# expose port 3000
EXPOSE 3000

# start the app
CMD ["npm", "start"]
