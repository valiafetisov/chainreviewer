# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.14.2

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /app
WORKDIR /app

# copy the app, note .dockerignore
COPY package.json .
COPY package-lock.json .
RUN npm ci

FROM dependency-base AS production

COPY . .

# Run in production mode
ENV NODE_ENV=production
RUN sed --in-place 's/sqlite/postgresql/g' ./prisma/schema.prisma
RUN npx prisma generate
RUN npm run build
ENV PORT=3000

# initialize db and start the app
CMD npx prisma db push && npm run start
