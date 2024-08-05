// TYPE 1 !!!!!!!!!!!!!!!!!!! promise catch throw 
const asyncHandler = (requestHandler) => {
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=> { next (err) } ) // if promise is not succeeded then!
    }
}


// TYPE 2!!!!!!!!!!!!!!!!!! async await method
// async are the higher order function which can take function and return functions

// const asyncHandler = () =>{}
// const asyncHandler = (func) =>{() => {}}
// const asynchandler = (func) =>{async()=>{}}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }

export default asyncHandler

