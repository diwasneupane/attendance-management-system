const asyncHandler = async (requestHandle) => {
  return (req, res, next) => {
    Promise.resolve(requestHandle(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export { asyncHandler };
