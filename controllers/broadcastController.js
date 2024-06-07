const { createBroadcast, updateBroadcastById, getBroadcastsForUser, getBroadcastsByAuthor, deleteBroadcastById, getAllBroadcasts, getActiveBroadcasts } = require("../models/repositories/broadcastRepo");
const { getCacheData } = require("../utils/cache");
const { broadcastStatus } = require("../utils/constants");
const { serverError } = require("../utils/services");


exports.createNewBroadcast = async ( req, res ) => {
    const { title, message, type, active, schedule_time, priority, expiration, audience, target_user, status } = req.body;
    try {
        const result = await createBroadcast({ title, message, type, active, scheduledTime: new Date(schedule_time), authorId : req.user.id, priority, expiration: new Date(expiration), audience, targetUser: target_user, status });
        return res.status(201).json({ 
            message: "Broadcast created successfully", 
            result
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.archiveBroadcast = async ( req, res ) => {
    const broadcastId = req.params.id;
    
    try {
        await updateBroadcastById({
            id: broadcastId,
            active: false,
            status : broadcastStatus.archived
        });
        return res.status(200).json({
            success: true,
            message: "successfully archived"
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.getUserBroadcasts = async ( req, res ) => {
    const userId = req.user.id;
    if (!userId){
        return res.status(400).json({
            success: false,
            message: "user id is required"
        });
    }
    try {
        const result = await getBroadcastsForUser({userId})
        return res.status(200).json({
            success: true,
            data: result,
            total: result.length
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.getBroadcasts = async ( req, res ) => {
    
    try {
        const result = await getAllBroadcasts({userId})
        return res.status(200).json({
            success: true,
            data: result,
            total: result.length
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.getAllActiveBroadcasts = async ( req, res ) => {
    
    try {
        const result = await getActiveBroadcasts();
        return res.status(200).json({
            success: true,
            data: result,
            total: result.length
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.getAuthorBroadcasts = async ( req, res ) => {
    const userId = req.params.id;
    if (!userId){
        return res.status(400).json({
            success: false,
            message: "user id is required"
        });
    }
    try {
        const result = await getBroadcastsByAuthor({authorId: userId})
        return res.status(200).json({
            success: true,
            data: result,
            total: result.length
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.deleteBroadcast = async ( req, res ) => {
    const { id } = req.params;
    if (!id){
        return res.status(400).json({
            success: false,
            message: "broadcast id is required"
        });
    }
    try {
        await deleteBroadcastById({ id })
        return res.status(200).json({
            success: true
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.editBroadcast = async ( req, res ) => {
    const { id } = req.params;
    const { title, message, type, active, scheduledTime, priority, expiration, audience, targetUser, status } = req.body;
    if (!id){
        return res.status(400).json({
            success: false,
            message: "broadcast id is required"
        });
    }
    try {
        const result = await updateBroadcastById({id, title, message, type, active, scheduledTime, authorId: req?.user?.id, priority, expiration, audience, targetUser, status})
        return res.status(200).json({
            success: true,
            message: "successfully updated",
            data: result
        });
    } catch (error) {
        return serverError(res, error);
    }
}