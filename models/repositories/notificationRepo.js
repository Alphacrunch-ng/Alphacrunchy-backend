const Notification = require('../notificationModel');
exports.createNotification = async (recipient_id, message )=> {
    try {
        const newNotification = new Notification({ recipient: recipient_id, message });
        const savedNotification = await newNotification.save();
        return savedNotification;
    } catch (error) {
        throw error;
    }
}