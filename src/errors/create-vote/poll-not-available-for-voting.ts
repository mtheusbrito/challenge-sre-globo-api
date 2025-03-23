import { JobError } from "../job-error";

export class PollNotAvailableToVoting extends JobError {
    constructor(message: string, details?: any) {
        super(message, details); 
        this.name = 'PollNotAvailableToVoting'; 
    }
}