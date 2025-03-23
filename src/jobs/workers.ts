import { ParticipantNotExistAtPoll } from "@/errors/create-vote/participant-not-exist-in-poll";
import { PollNotAvailableToVoting } from "@/errors/create-vote/poll-not-available-for-voting";
import { PollNotFoundError } from "@/errors/create-vote/poll-not-found-error";
import { prisma } from "@/lib/prisma";
import { jobFailures } from "@/observability/metrics";
import Queue, { Job } from "bee-queue";

export type JobTypes = 'registrationVote';

export type RegistrationVotePayload = {
    participantId: string
    userId: string,
    pollId: string
}

export type JobPayloads = {
    registrationVote: RegistrationVotePayload;
};
const queue = new Queue<{ type: JobTypes; payload: JobPayloads[JobTypes] }>('multiQueue', {
    redis: process.env.DATABASE_REDIS_URL,
    isWorker: true,
});

queue.process(async (job: Job<{ type: JobTypes; payload: JobPayloads[JobTypes] }>) => {
    switch (job.data.type) {
        case 'registrationVote':

        const { participantId, pollId, userId } = job.data.payload; 
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
        break;
    
        default:
            jobFailures.inc({ queue: 'multiQueue', job_type: job.data.type });
            throw new Error(`Unknown job type: ${job.data.type}`);
    }
});
queue.on('failed', (job, err) => {
    console.error(`Job ${job.id} (${job.data.type}) failed:`, err.message);
    jobFailures.inc({ queue: 'multiQueue', job_type: job.data.type });
});

console.log('Worker started jobs...');