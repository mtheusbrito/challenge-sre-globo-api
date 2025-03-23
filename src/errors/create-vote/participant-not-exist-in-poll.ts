import {  JobError } from "../job-error";

export class ParticipantNotExistAtPoll extends JobError {
    constructor(message: string, details?: any) {
        super(message, details); 
        this.name = 'ParticipantNotExistAtPoll'; 
    }
}