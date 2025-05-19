const mongoose = require('mongoose');
const Channel = require('../../models/channel.model');
require('dotenv').config();

exports.getStatus = async (req, res) => {
    try {
        // Exclude 'password' field using select
        const channels = await Channel.find({}).select('-password');
        res.status(200).json({ success: true, data: channels });
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT: Update a channel's status by ID
exports.updatestatus = async (req, res) => {
    try {
        const { id, status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ success: false, message: 'channelId and status are required' });
        }

        const updatedChannel = await Channel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedChannel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }

        res.status(200).json({ success: true, message: 'Status updated successfully', data: updatedChannel });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};