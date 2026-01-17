FROM node:18-alpine
LABEL authors="rochm"

# Create app directory
WORKDIR /app

# Install app dependencies
# Copy package.json and package-lock.json (or yarn.lock) first for better caching
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]