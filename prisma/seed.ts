import { PrismaClient } from './../.prisma/client'
import { hash } from 'bcryptjs'
import { faker } from '@faker-js/faker'
const prisma = new PrismaClient()

async function seed() {

    await prisma.user.deleteMany();
    await prisma.poll.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.participant.deleteMany();

    const passwordHash = await hash('password', 1)

    // user test
    await prisma.user.create({
        data: {
            id: 'e7db74cb-1ecf-4822-bb29-5a5527b5defb',
            name: 'User',
            email: 'user@email.com',
            password: passwordHash
        }
    })

    // user admin
    await prisma.user.create({
        data: {
            id: 'f51514d2-d817-4ada-b291-db404fc7ceb2',
            name: 'Admin',
            email: 'admin@email.com',
            password: passwordHash
        }
    })

    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);
    endDate.setHours(22, 0, 0, 0);

    let startDate = new Date();

    const poll = await prisma.poll.create({
        data: {
            id: '483cabc0-e942-419a-92a8-6a532c38a14b',
            startDate: startDate,
            endDate: endDate
        }
    
    })

    await prisma.participant.create({
        data: {
            id: 'e0435c28-7ef1-4e05-9e7e-1f8fa29ff45f',
            name: faker.person.fullName(),
            pollId: poll.id
        }
    })

    await prisma.participant.create({
        data: {
            id: '02a50075-8928-4361-9460-e777ea0f050e',
            name: faker.person.fullName(),
            pollId: poll.id
        }
    })

}

seed().then(() => {
    console.log('Database seeded!')
})