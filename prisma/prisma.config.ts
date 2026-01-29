
import { defineConfig } from "prisma/config";

export default defineConfig({
    migrations: {
        path: "prisma/migrations",
        seed: "npx tsx prisma/seed.ts",
    },
    datasource: {
        // DATABASE_URL is used for pooled connections (runtime queries)
    },
});
