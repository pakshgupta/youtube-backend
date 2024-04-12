// Promise approach
const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => next());
  }
}

// Try catch approach
// const asyncHandler=()=>{}   Step 1
// const asyncHandler=(func)=>()=>{}    Sterp 2
// const asyncHandler=(fn)=>async (req,res,next)=>{  // Form by above 2 steps
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }

export { asyncHandler };


