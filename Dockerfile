# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install the application's dependencies inside the container
RUN npm install --production

# Copy the rest of the application's files to the container
COPY . .

# Install rimraf and Babel CLI tools globally
RUN npm install -g rimraf @babel/cli @babel/node

# Build the application
RUN npm run build

# Specify the command to run when the container starts
CMD [ "npm", "start" ]

# Expose the application on port 3000
EXPOSE 3000
