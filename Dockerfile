# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install
 
# Copy the rest of the app's source code to the working directory
COPY . .

# Expose port 3000 for the app to listen on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
