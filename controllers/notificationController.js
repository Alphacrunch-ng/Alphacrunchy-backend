const Notification = require('../models/notificationModel');
const { serverError } = require('../utils/services');

// GET all notifications for a specific user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.id;
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


exports.setUserNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "no notification_id provided"
      })
    }
    const notification = await Notification.findByIdAndUpdate(notificationId, {read : true}, {new: true});
    return res.status(200).json({
        data: notification,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

exports.setNotificationInactive = async (req, res) => {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "no notification_id provided"
      })
    }
    const notification = await Notification.findByIdAndUpdate(notificationId, {active : false}, {new: true});
    return res.status(200).json({
        data: notification,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// // CREATE a new notification controller
// exports.createUserNotification = async (req, res) => {
//   try {
//     const { user, message } = req.body;
//     const savedNotification = await createNotification( user, message);
//     return res.status(201).json({
//         data: savedNotification,
//         status: 'success',
//         message: 'notification successfully created.'
//     })
//   } catch (error) {
//     return serverError(res, error);
//   }
// };

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