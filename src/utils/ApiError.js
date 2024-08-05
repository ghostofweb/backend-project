// here we are making standardize error function where we can standardize the error handling of the API

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message); // overwring the message
        this.statusCode = statusCode; //overwrite the status code from out status code
        this.data = null;
        this.message = message
        this.success = false
        this.errors = errors // we overwrite the constructor of the Error with our errro where we passed
        // the parameters and then using super(message) to overwrite it and this.* to overwrite our code and data amd all
       
        if(stack){ 
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor) 
        }
    }

}
export {ApiError}