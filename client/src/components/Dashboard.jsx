import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import Resources from './Resources';
import Groups from './Groups'; // ADD THIS
import TrackProgress from "./TrackProgress";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Collaboration Platform</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="welcome-section">
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          📚 Resources
        </button>
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          👥 Study Groups
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="features-grid">
            <div className="feature-card" onClick={() => setActiveTab('resources')}>
              <h3>📚 Share Resources</h3>
              <p>Upload and share study materials with your peers</p>
            </div>
            
            <div className="feature-card" onClick={() => setActiveTab('chat')}>
              <h3>💬 Real-time Chat</h3>
              <p>Communicate effectively with your study group</p>
            </div>
            
            <div className="feature-card" onClick={() => setActiveTab('groups')}>
              <h3>🤝 Study Groups</h3>
              <p>Join or create study groups for collaboration</p>
            </div>
            
            <div className="feature-card" onClick={() => setActiveTab('trackprogress')}>
              <h3>📊 Track Progress</h3>
              <p>Monitor your learning journey and achievements</p>
            </div>

          </div>
        )}

        {activeTab === 'chat' && <Chat />}

        {activeTab === 'resources' && <Resources />}

        {activeTab === 'groups' && <Groups />}

        {activeTab === 'trackprogress' && <TrackProgress />}



      </div>
    </div>
  );
};

export default Dashboard;