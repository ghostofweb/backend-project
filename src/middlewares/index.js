/* Middleware is used to use some functionaliteis in between the req and resopond of backend to the frontend
for example if we have url == /instagram  and we want to res.send("ayo")
for that we need some middlewhere like 
check if user is logged in or nah               (err,req,res,next)
[/Instagram] ---------------------> [res.send("sahiljeet singh kasli")]
                            |                       
(to check in middlewere)    |  
                [check if user is logged in]<-- this is middlewere
                
    */
/* here we have 4 parameter(err,req,res,next)
next is used to pass down to next operation of middlewere as middlewere can be multiple */



