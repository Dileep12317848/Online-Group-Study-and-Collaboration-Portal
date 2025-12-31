const express = require('express');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a new group
router.post('/create', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Create group request received');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);

    const { name, description, category, maxMembers, isPrivate, creatorName } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      console.log('❌ Validation failed: No group name');
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!creatorName) {
      console.log('❌ Validation failed: No creator name');
      return res.status(400).json({ message: 'Creator name is required' });
    }

    console.log('✅ Validation passed');

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const group = new Group({
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category || 'other',
      creator: req.user.id,
      creatorName: creatorName,
      maxMembers: maxMembers || 50,
      isPrivate: isPrivate || false,
      inviteCode: inviteCode,
      members: [{
        userId: req.user.id,
        userName: creatorName
      }]
    });

    console.log('💾 Attempting to save group...');
    await group.save();
    console.log('✅ Group saved successfully:', group._id);

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('❌ Create group error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error creating group', 
      error: error.message 
    });
  }
});

// Get all groups (public groups or user's groups)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { isPrivate: false },
        { 'members.userId': req.user.id }
      ]
    }).sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Error fetching groups' });
  }
});

// Get user's groups
router.get('/my-groups', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.userId': req.user.id
    }).sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ message: 'Error fetching your groups' });
  }
});

// Get single group details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members.userId', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Error fetching group' });
  }
});

// Join a group
router.post('/join/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if already a member
    const isMember = group.members.some(
      member => member.userId.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    // Add member
    group.members.push({
      userId: req.user.id,
      userName: req.body.userName
    });

    await group.save();

    res.json({
      message: 'Successfully joined the group',
      group
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Error joining group' });
  }
});

// Leave a group
router.post('/leave/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.creator.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'Group creator cannot leave. Delete the group instead.' 
      });
    }

    // Remove member
    group.members = group.members.filter(
      member => member.userId.toString() !== req.user.id
    );

    await group.save();

    res.json({
      message: 'Successfully left the group',
      group
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Error leaving group' });
  }
});

// Delete a group (only creator)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only the group creator can delete the group' 
      });
    }

    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Error deleting group' });
  }
});

// Join group by invite code
router.post('/join-by-code', authMiddleware, async (req, res) => {
  try {
    const { inviteCode, userName } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if already a member
    const isMember = group.members.some(
      member => member.userId.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    // Add member
    group.members.push({
      userId: req.user.id,
      userName: userName
    });

    await group.save();

    res.json({
      message: 'Successfully joined the group',
      group
    });
  } catch (error) {
    console.error('Join by code error:', error);
    res.status(500).json({ message: 'Error joining group' });
  }
});

module.exports = router;