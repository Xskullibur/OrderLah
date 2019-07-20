# Pull lastest node image
FROM node:lastest

# Create /app directory
WORKDIR /app
# Copy files to /app directory
COPY public sass server test views *.js package*.json .

# Install modules
RUN npm install

# Expose port 3000 and 4000
EXPOSE 3000 4000

# Start the node server
CMD ["npm", "start"]