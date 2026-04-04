const Feedback = require('../models/Feedback');
const ApiResponse = require('../utils/ApiResponse');
const { paginate } = require('../utils/helpers');

const createFeedback = async (req, res, next) => {
  try {
    const { type, subject, message, priority } = req.body;

    const feedback = await Feedback.create({
      user: req.user._id,
      type,
      subject,
      message,
      priority: priority || 'medium',
    });

    await feedback.populate('user', 'firstName lastName email');

    return ApiResponse.success(res, 'Feedback submitted successfully', { feedback }, 201);
  } catch (error) {
    next(error);
  }
};

const getMyFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, type } = req.query;

    const query = { user: req.user._id };

    if (status) query.status = status;
    if (type) query.type = type;

    const total = await Feedback.countDocuments(query);
    const feedbacks = await paginate(
      Feedback.find(query),
      page,
      limit
    ).sort('-createdAt');

    return ApiResponse.paginated(res, 'Feedback retrieved successfully', feedbacks, page, limit, total);
  } catch (error) {
    next(error);
  }
};

const getAllFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, type, priority, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Feedback.countDocuments(query);
    const feedbacks = await paginate(
      Feedback.find(query)
        .populate('user', 'firstName lastName email phone')
        .populate('response.respondedBy', 'firstName lastName'),
      page,
      limit
    ).sort('-createdAt');

    return ApiResponse.paginated(res, 'Feedback retrieved successfully', feedbacks, page, limit, total);
  } catch (error) {
    next(error);
  }
};

const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('response.respondedBy', 'firstName lastName');

    if (!feedback) {
      return ApiResponse.error(res, 'Feedback not found', 404);
    }

    return ApiResponse.success(res, 'Feedback retrieved successfully', { feedback });
  } catch (error) {
    next(error);
  }
};

const respondToFeedback = async (req, res, next) => {
  try {
    const { text } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return ApiResponse.error(res, 'Feedback not found', 404);
    }

    feedback.response = {
      text,
      respondedBy: req.user._id,
      respondedAt: new Date(),
    };
    feedback.status = 'reviewed';
    await feedback.save();

    return ApiResponse.success(res, 'Feedback responded successfully', { feedback });
  } catch (error) {
    next(error);
  }
};

const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status, priority } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return ApiResponse.error(res, 'Feedback not found', 404);
    }

    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;
    await feedback.save();

    return ApiResponse.success(res, 'Feedback updated successfully', { feedback });
  } catch (error) {
    next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return ApiResponse.error(res, 'Feedback not found', 404);
    }

    return ApiResponse.success(res, 'Feedback deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackById,
  respondToFeedback,
  updateFeedbackStatus,
  deleteFeedback,
};
