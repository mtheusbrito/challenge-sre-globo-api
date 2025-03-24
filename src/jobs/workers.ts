import { ParticipantNotExistAtPoll } from "@/errors/create-vote/participant-not-exist-in-poll";
import { PollNotAvailableToVoting } from "@/errors/create-vote/poll-not-available-for-voting";
import { PollNotFoundError } from "@/errors/create-vote/poll-not-found-error";
import { prisma } from "@/lib/prisma";
import { jobDuration, jobFailures, jobSuccess } from "@/observability/metrics";
import Queue, { Job } from "bee-queue";

export type JobTypes = 'registrationVote';

export type RegistrationVotePayload = {
    participantId: string
    userId: string,
    pollId: string,
    createdAt: Date
}

export type JobPayloads = {
    registrationVote: RegistrationVotePayload;
};
const queue = new Queue<{ type: JobTypes; payload: JobPayloads[JobTypes] }>('challenge-sre-glob-queue', {
    redis: process.env.DATABASE_REDIS_URL,
    isWorker: true,
});

queue.process(async (job: Job<{ type: JobTypes; payload: JobPayloads[JobTypes] }>) => {
    const end = jobDuration.startTimer({ queue: 'challenge-sre-glob-queue', job_type: job.data.type });
    switch (job.data.type) {
        case 'registrationVote':
            try {
                const { participantId, pollId, userId, createdAt } = job.data.payload;
                const poll = await prisma.poll.findUnique({
                    where: { id: pollId },
                    include: { participants: true }
                });

                if (!poll) throw new PollNotFoundError('Poll not found', job.data);

                const participantExists = poll.participants.some(p => p.id === participantId);

                if (!participantExists)
                    throw new ParticipantNotExistAtPoll('Participant does not exist in Poll', job.data);

                if (createdAt > poll.endDate)
                    throw new PollNotAvailableToVoting('Voting is now closed!', job.data);

                await prisma.vote.create({
                    data: {
                        userId,
                        participantId,
                        pollId
                    }
                });
                jobSuccess.inc({ queue: 'challenge-sre-glob-queue', job_type: job.data.type })
            } finally {
                end();
            }
            break;
        default:
            throw new Error(`Unknown job type: ${job.data.type}`);
    }
});
queue.on('failed', (job, err) => {
    console.error(`Job ${job.id} (${job.data.type}) failed:`, err.message);
    jobFailures.inc({ queue: 'challenge-sre-glob-queue', job_type: job.data.type });
});

console.log('Worker started jobs...');