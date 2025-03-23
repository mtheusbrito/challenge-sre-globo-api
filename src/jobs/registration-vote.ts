import { ProcessCallbackFunction, Job } from 'bull';
import { prisma } from '@/lib/prisma';
import { PollNotFoundError } from '@/errors/create-vote/poll-not-found-error';
import { ParticipantNotExistAtPoll } from '@/errors/create-vote/participant-not-exist-in-poll';
import { PollNotAvailableToVoting } from '@/errors/create-vote/poll-not-available-for-voting';

interface RegistrationVoteProps {
    participantId: string;
    userId: string;
    pollId: string;
}

export default {
    key: 'registration-vote',
    async handle(job: Job<RegistrationVoteProps>) : Promise<void> {
        const { participantId, pollId, userId } = job.data; // Accessing job.data
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: { participants: true }
        });

        if (!poll) throw new PollNotFoundError('Poll not found', job.data);
        
        const participantExists = poll.participants.some(p => p.id === participantId);

        if (!participantExists)
            throw new ParticipantNotExistAtPoll('Participant does not exist in Poll', job.data);

        if (new Date() > poll.endDate)
            throw new PollNotAvailableToVoting('Voting is now closed!', job.data);

        await prisma.vote.create({
            data: {
                userId,
                participantId,
                pollId
            }
        });
    },
};