FROM node:20-alpine

WORKDIR /app

COPY paradise_ag_backend/package*.json ./
RUN npm ci

COPY paradise_ag_backend/ ./
RUN npm run build
RUN npm prune --omit=dev

ENV JWT_SECRET=89d056a20e32a303b0276ae7e2c6358ab9464fb7c330a69a40cdae586e90d06d617105406e7542f8b610e564beeef651d8d07828c25fe98b518af3c53bc78951
ENV NODE_ENV=production
ENV JWT_EXPIRES_IN=15m
ENV JWT_REFRESH_EXPIRES_IN=7d
ENV CORS_ORIGIN=https://cims-paradiseag.onrender.com,https://paradise-ag.netlify.app,https://agparadise.netlify.app
ENV SUPABASE_URL=https://dbmbkevspcozcnhcsyii.supabase.co
ENV SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibWJrZXZzcGNvemNuaGNzeWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3ODczNTUsImV4cCI6MjA5OTM2MzM1NX0.7W2hZ0QIBYdpZ4tYh_wl7M3SpP9NzD7QWO90QHk5FDo
ENV DATABASE_URL=postgresql://postgres.dbmbkevspcozcnhcsyii:Ag%402026_2027@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
ENV NODE_OPTIONS=--dns-result-order=ipv4first

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
