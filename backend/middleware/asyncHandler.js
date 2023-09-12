const asyncHandler = fn => (req, res, next) =>{
    // next call next piece of middleware
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;