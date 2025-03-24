export class JobError extends Error{
    details: any 
    
    constructor(message: string, details?: any ){
        super()
        this.message = message
        this.details = details
    }
}