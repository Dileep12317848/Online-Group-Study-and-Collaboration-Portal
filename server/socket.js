const Message = require('./models/Message');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    // Join a room
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`👥 User ${socket.id} joined room: ${room}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        // Save message to database
        const message = new Message({
          room: data.room,
          user: data.user,
          userName: data.userName,
          message: data.message,
          timestamp: new Date()
        });
        await message.save();

        // Broadcast to room
        io.to(data.room).emit('receive_message', {
          ...data,
          _id: message._id,
          timestamp: message.timestamp
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // User typing indicator
    socket.on('typing', (data) => {
      socket.to(data.room).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;