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

    const user = await prisma.user.create({
        data: {
            name: 'Test',
            email: 'test@email.com',
            password: passwordHash
        }
    })

    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 2)
    endDate.setHours(22,0,0,0)

    const poll = await prisma.poll.create({
        data:{
            startDate: new Date(),
            endDate: endDate
        }
    })

    await prisma.participant.create({
        data:{
            name: faker.person.fullName(),
            pollId: poll.id
        }
    })

    await prisma.participant.create({
        data:{
            name: faker.person.fullName(),
            pollId: poll.id
        }
    })

}

seed().then(() => {
    console.log('Database seeded!')
})