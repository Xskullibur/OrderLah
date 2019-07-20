# Pull lastest node image
FROM node:latest

# Create /app directory
WORKDIR /app
# Copy files to /app directory
COPY public/ ./public
COPY sass/ ./sass
COPY server/ ./server
COPY test/ ./test
COPY views/ ./views
COPY *.js package*.json ./

# Install modules
RUN npm install

# # Expose port 3000 and 4000
# EXPOSE 3000 4000

# Start the node server
CMD ["npm", "start"]