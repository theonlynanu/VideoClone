# Start the build stage
FROM node:18 as builder

WORKDIR /app

COPY package*.json ./

# Install Express, fluent-ffmpeg, typescript, ts-node, and requisite types
RUN npm install

COPY . .

# Build using tsc
RUN npm run build



# Start production stage
FROM node:18

# Update apt-get and install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./

# Install only express and fluent-ffmpeg 
RUN npm install --omit=dev

# Copy the build from the first stage into distribution
COPY --from=builder /app/dist ./dist

# I had this set to 3500 during testing to avoid conflicts with my website's dev
# server, but since Express defaults to 3000, I thought it best to stick to that
EXPOSE 3000

# Run index.js from the distribution
CMD ["npm", "run", "serve"]