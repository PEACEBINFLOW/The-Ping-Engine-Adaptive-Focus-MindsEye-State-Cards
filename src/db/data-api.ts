npm install @neondatabase/neon-js
// src/db/data-api.ts
import { createClient } from "@neondatabase/neon-js";

const dataApiUrl = process.env.NEON_DATA_API_URL;https://ep-hidden-credit-bbezh1mn.apirest.c-15.us-east-1.aws.neon.tech/neondb/rest/v1
const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;https://ep-hidden-credit-bbezh1mn.neonauth.c-15.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json

if (!dataApiUrl) {
  throw new Error(
    "NEON_DATA_API_URL is not set. Copy the apirest URL from Neon Console > Data API.",
  );
}

if (!authUrl) {
  throw new Error(
    "NEXT_PUBLIC_NEON_AUTH_URL is not set. Copy the neonauth URL from Neon Console > Settings > Better Auth.",
  );
}

// The SDK forwards the Better Auth JWT automatically on data queries.
// Do not pass the raw DATABASE_URL here; this is the REST interface only.
export const dataApi = createClient({
  auth: { url: authUrl },
  dataApi: { url: dataApiUrl },
});
