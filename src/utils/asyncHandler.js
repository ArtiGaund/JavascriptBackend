// using promises
// requestHandler is a function (here recieving function)
// next is used here so that who ever next want to perform task they can do it, if error occur her
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler( req, res, next )).catch((error) => next(error))
    }
}

export { asyncHandler };


// using trycatch
// passing function in function
// const asyncHandler = () => {}
//const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}
// const asyncHandler = (func) => async ( req, res, next ) => {
//     try {
//         await func(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message,
//         })
//     }
// }