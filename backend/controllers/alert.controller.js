const Alert = require('../models/Alert');
const ApiResponse = require('../utils/ApiResponse');
const { paginate } = require('../utils/helpers');

const createAlert = async (req, res, next) => {
  try {
    const { type, message, location, expiresAt } = req.body;

    const alert = await Alert.create({
      user: req.user._id,
      type,
      message,
      location,
      expiresAt,
    });

    return ApiResponse.success(res, 'Alert created successfully', { alert }, 201);
  } catch (error) {
    next(error);
  }
};

const getMyAlerts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, type, isRead } = req.query;

    const query = { user: req.user._id };

    if (status) query.status = status;
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const total = await Alert.countDocuments(query);
    const alerts = await paginate(
      Alert.find(query),
      page,
      limit
    ).sort('-createdAt');

    return ApiResponse.paginated(res, 'Alerts retrieved successfully', alerts, page, limit, total);
  } catch (error) {
    next(error);
  }
};

const getAllAlerts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, type, isRead } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const total = await Alert.countDocuments(query);
    const alerts = await paginate(
      Alert.find(query)
        .populate('user', 'firstName lastName email phone'),
      page,
      limit
    ).sort('-createdAt');

    return ApiResponse.paginated(res, 'Alerts retrieved successfully', alerts, page, limit, total);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return ApiResponse.error(res, 'Alert not found', 404);
    }

    return ApiResponse.success(res, 'Alert marked as read', { alert });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Alert.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    return ApiResponse.success(res, 'All alerts marked as read');
  } catch (error) {
    next(error);
  }
};

const dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'dismissed' },
      { new: true }
    );

    if (!alert) {
      return ApiResponse.error(res, 'Alert not found', 404);
    }

    return ApiResponse.success(res, 'Alert dismissed', { alert });
  } catch (error) {
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return ApiResponse.error(res, 'Alert not found', 404);
    }

    return ApiResponse.success(res, 'Alert deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlert,
  getMyAlerts,
  getAllAlerts,
  markAsRead,
  markAllAsRead,
  dismissAlert,
  deleteAlert,
};
