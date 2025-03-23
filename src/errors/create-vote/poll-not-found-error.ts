import {  JobError } from "../job-error";

export class PollNotFoundError extends JobError {
    constructor(message: string, details?: any) {
        super(message, details); 
        this.name = 'PollNotFoundError'; 
    }
}