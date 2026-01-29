import { defineConfig } from "prisma/config";

export default defineConfig({
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // DATABASE_URL is used for pooled connections (runtime queries)
        url: process.env.DATABASE_URL,
        // DIRECT_URL is used for migrations (direct connection, not pooled)
        shadowDatabaseUrl: process.env.DIRECT_URL,
    },
});
