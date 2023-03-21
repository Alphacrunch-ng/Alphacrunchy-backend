const Notification = require('../models/notificationModel');
const { serverError } = require('../utils/services');

// GET all notifications for a specific user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ user: userId })
                                            .sort({ createdAt: -1 });
    return res.status(200).json({
        data: notifications,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// CREATE a new notification controller
exports.createUserNotification = async (req, res) => {
  try {
    const { user, message, type } = req.body;
    const savedNotification = await createNotification( user, message, type);
    return res.status(201).json({
        data: savedNotification,
        status: 'success',
        message: 'notification successfully created.'
    })
  } catch (error) {
    return serverError(res, error);
  }
};

// DELETE a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    return serverError(res, error);
  }
};


//Services 
//create notification service
const createNotification = async (user, message, type )=> {
    try {
        const newNotification = new Notification({ user, message, type });
        const savedNotification = await newNotification.save();
        return savedNotification;
    } catch (error) {
        throw error;
    }
}

exports = {createNotification}