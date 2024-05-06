const asyncHandler = (requestHandle) => {
  return (req, res, next) => {
    Promise.resolve(requestHandle(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

module.exports = { asyncHandler };
