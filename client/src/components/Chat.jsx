import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room] = useState('general'); // You can make this dynamic later
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Join room
    socket.emit('join_room', room);

    // Load previous messages
    loadMessages();

    // Listen for new messages
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/messages/${room}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      const messageData = {
        room,
        user: user.id,
        userName: user.name,
        message: newMessage,
        timestamp: new Date()
      };

      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 General Chat Room</h2>
        <p>Real-time collaboration with your peers</p>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`message ${msg.user === user?.id ? 'own-message' : ''}`}
          >
            <div className="message-header">
              <strong>{msg.userName}</strong>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;