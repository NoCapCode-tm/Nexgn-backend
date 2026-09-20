const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = err.statuscode || 500;

  return res.status(statusCode).json({
    success: false,
    statuscode: statusCode,
    message: err.message || "Something went wrong",
    data: null,
    error: err.error || []
  });
};

export { errorHandler };