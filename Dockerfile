# Use the official Node.js image as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build the application
RUN npm run build

# Specify the command to run when the container starts
CMD [ "npm", "start" ]

# Expose the application on port 3000
EXPOSE 3000
