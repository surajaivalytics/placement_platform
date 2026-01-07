import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Total Students (Users with role 'user')
        const totalStudents = await prisma.user.count({
            where: { role: "user" },
        });

        // 2. Total Classes (Tests count as a proxy)
        const totalClasses = await prisma.test.count();

        // 3. Courses (Applications) In Progress
        const coursesInProgress = await prisma.placementApplication.count({
            where: {
                status: {
                    notIn: ["completed", "rejected", "withdrawn"],
                },
            },
        });

        // 4. Courses (Applications) Completed
        const coursesCompleted = await prisma.placementApplication.count({
            where: { status: "completed" },
        });

        // 5. Student Performance (Status Distribution)
        const statusDistribution = await prisma.placementApplication.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        });

        // 6. Recent Students (Latest Applications)
        const recentApplications = await prisma.placementApplication.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            totalStudents,
            totalClasses,
            coursesInProgress,
            coursesCompleted,
            statusDistribution,
            recentApplications,
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        );
    }
}
