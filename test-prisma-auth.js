const { prisma } = require('./src/lib/prisma');
const bcrypt = require('bcryptjs');

async function testAuth() {
    const email = 'admin@example.com';
    const password = 'admin123';

    console.log('Testing auth for:', email);
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', user.email);
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValid);
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
