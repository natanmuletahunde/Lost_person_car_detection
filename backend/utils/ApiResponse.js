class ApiResponse {
  constructor(success, message, data = null, meta = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success(res, message, data = null, statusCode = 200, meta = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
    });
  }

  static error(res, message, statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  static paginated(res, message, data, page, limit, total) {
    const meta = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      pages: Math.ceil(total / limit),
    };

    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    });
  }
}

module.exports = ApiResponse;
