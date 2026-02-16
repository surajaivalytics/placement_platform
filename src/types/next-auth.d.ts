import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { Role } from "@/types";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: Role;
            isProfileComplete: boolean;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: Role;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role: Role;
        isProfileComplete: boolean;
    }
}
