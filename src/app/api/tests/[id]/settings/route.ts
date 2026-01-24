import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { eligibilityCriteria } = await req.json();

        const test = await prisma.test.update({
            where: {
                id: id,
            },
            data: {
                eligibilityCriteria,
            },
        });

        return NextResponse.json(test);
    } catch (error) {
        console.error("[TEST_SETTINGS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
