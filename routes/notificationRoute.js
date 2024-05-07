const { getUserNotifications, setUserNotificationRead, deleteNotification, setNotificationInactive } = require('../controllers/notificationController');
const { authRoles } = require('../middlewares/auth');
const { roles } = require('../utils/constants');

const router = require('express').Router();


// Get all adminRoutes
router.get('/', (req, res)=>{
    res.send('welcome to notifications sir');
});

// get all notifications for a user by passing the user id in params
router.get('/:id/notifications', getUserNotifications);

// Set user notification as read By ID in params
router.patch('/:id', setUserNotificationRead)

//Permanently delete a notification by id 
router.delete('/delete/:id', authRoles(roles.admin), deleteNotification)

//set notification inactive aka deleted
router.patch('/set-inactive/:id', setNotificationInactive)


module.exports = router;