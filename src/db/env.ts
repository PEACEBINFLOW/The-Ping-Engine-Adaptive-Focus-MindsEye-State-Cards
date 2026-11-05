// Loaded explicitly by CLI scripts (seed, list-tables) because tsx does not
// auto-load .env.local. Next.js loads it automatically for routes.
import { config } from "dotenv";

config({ path: ".env.local" });
