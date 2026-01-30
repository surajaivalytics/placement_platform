import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
    try {
        const totalStudents = await prisma.user.count({ where: { role: "user" } });
        const totalClasses = await prisma.test.count();
        const coursesInProgress = await prisma.placementApplication.count({
            where: { status: { notIn: ["completed", "rejected", "withdrawn"] } },
        });
        const coursesCompleted = await prisma.placementApplication.count({
            where: { status: "completed" },
        });
        const statusDistribution = await prisma.placementApplication.groupBy({
            by: ["status"],
            _count: { status: true },
        });

        const recentApplications = await prisma.placementApplication.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, image: true, email: true } } },
        });

        const recentUsers = await prisma.user.findMany({
            take: 3,
            orderBy: { id: "desc" }, // using id as proxy for time if createdAt not available, or just take random
            select: { name: true, email: true, role: true }
        });

        // Mocking activities for now since we might not have a dedicated activity log
        // In a real app, you'd query an AuditLog or Notification table
        const activities = [
            ...recentUsers.map((u: any) => ({
                id: u.email,
                type: 'user_signup',
                title: 'New User Registered',
                description: `${u.name} (${u.role}) joined the platform`,
                time: 'Just now'
            })),
            {
                id: 'system_1',
                type: 'system',
                title: 'System Update',
                description: 'Server maintenance scheduled for Sunday',
                time: '2 hours ago'
            },
            {
                id: 'report_1',
                type: 'report',
                title: 'Monthly Report Ready',
                description: 'January placement analytics are available',
                time: '5 hours ago'
            }
        ];

        return {
            totalStudents,
            totalClasses,
            coursesInProgress,
            coursesCompleted,
            statusDistribution,
            recentApplications,
            recentActivities: activities
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return {
            totalStudents: 0,
            totalClasses: 0,
            coursesInProgress: 0,
            coursesCompleted: 0,
            statusDistribution: [],
            recentApplications: [],
            recentActivities: []
        };
    }
}
