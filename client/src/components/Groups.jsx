import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [activeView, setActiveView] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    maxMembers: 50,
    isPrivate: false
  });
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    loadGroups();
    loadMyGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/groups/my-groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyGroups(response.data);
    } catch (error) {
      console.error('Error loading my groups:', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.trim() === '') {
      alert('Please enter a group name');
      return;
    }

    if (!user || !user.name) {
      alert('User information not available. Please refresh and try again.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data to send
      const dataToSend = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        maxMembers: parseInt(formData.maxMembers) || 50,
        isPrivate: formData.isPrivate,
        creatorName: user.name
      };

      console.log('Sending data:', dataToSend); // Debug log

      const response = await axios.post(
        'http://localhost:5000/api/groups/create',
        dataToSend,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Response:', response.data); // Debug log

      alert('Group created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'other',
        maxMembers: 50,
        isPrivate: false
      });
      
      setShowCreateForm(false);
      loadGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Create group error:', error);
      console.error('Error response:', error.response?.data); // Debug log
      alert(error.response?.data?.message || 'Error creating group. Please try again.');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/groups/join/${groupId}`,
        { userName: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Successfully joined the group!');
      loadGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Join group error:', error);
      alert(error.response?.data?.message || 'Error joining group');
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    
    if (!inviteCode || inviteCode.trim() === '') {
      alert('Please enter an invite code');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/groups/join-by-code',
        { inviteCode: inviteCode.trim(), userName: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Successfully joined the group!');
      setInviteCode('');
      setShowJoinCode(false);
      loadGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Join by code error:', error);
      alert(error.response?.data?.message || 'Invalid invite code or error joining group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/groups/leave/${groupId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Left the group successfully');
      loadGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Leave group error:', error);
      alert(error.response?.data?.message || 'Error leaving group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Group deleted successfully');
      loadGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Delete group error:', error);
      alert(error.response?.data?.message || 'Error deleting group');
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Invite code copied to clipboard!');
  };

  const isUserMember = (group) => {
    return group.members.some(member => member.userId === user?.id);
  };

  const isUserCreator = (group) => {
    return group.creator === user?.id;
  };

  const categoryEmojis = {
    'computer-science': '💻',
    'mathematics': '🔢',
    'physics': '⚛️',
    'chemistry': '🧪',
    'biology': '🧬',
    'engineering': '⚙️',
    'business': '💼',
    'arts': '🎨',
    'other': '📚'
  };

  return (
    <div className="groups-container">
      <div className="groups-header">
        <div>
          <h2>👥 Study Groups</h2>
          <p>Collaborate with peers on your subjects</p>
        </div>
        <div className="header-buttons">
          <button 
            className="create-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Close' : '+ Create Group'}
          </button>
          <button 
            className="join-code-btn"
            onClick={() => setShowJoinCode(!showJoinCode)}
          >
            🔗 Join by Code
          </button>
        </div>
      </div>

      {showJoinCode && (
        <div className="join-code-form">
          <h3>Join Group by Invite Code</h3>
          <form onSubmit={handleJoinByCode}>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              maxLength="8"
              required
            />
            <button type="submit">Join Group</button>
          </form>
        </div>
      )}

      {showCreateForm && (
        <div className="create-group-form">
          <h3>Create New Study Group</h3>
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label>Group Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Data Structures Study Group"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What is this group about?"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="computer-science">Computer Science</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business</option>
                  <option value="arts">Arts</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Members</label>
                <input
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value) || 50})}
                  min="2"
                  max="100"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                />
                Private Group (requires invite code to join)
              </label>
            </div>

            <button type="submit">Create Group</button>
          </form>
        </div>
      )}

      <div className="groups-tabs">
        <button 
          className={`groups-tab ${activeView === 'all' ? 'active' : ''}`}
          onClick={() => setActiveView('all')}
        >
          🌍 All Groups ({groups.length})
        </button>
        <button 
          className={`groups-tab ${activeView === 'my' ? 'active' : ''}`}
          onClick={() => setActiveView('my')}
        >
          👤 My Groups ({myGroups.length})
        </button>
      </div>

      <div className="groups-list">
        {loading ? (
          <p className="loading-text">Loading groups...</p>
        ) : (activeView === 'all' ? groups : myGroups).length === 0 ? (
          <div className="empty-state">
            <p>📭 {activeView === 'all' ? 'No groups available. Create one!' : 'You haven\'t joined any groups yet.'}</p>
          </div>
        ) : (
          (activeView === 'all' ? groups : myGroups).map((group) => (
            <div key={group._id} className="group-card">
              <div className="group-header">
                <div className="group-title">
                  <span className="group-emoji">{categoryEmojis[group.category]}</span>
                  <div>
                    <h3>{group.name}</h3>
                    {group.isPrivate && <span className="private-badge">🔒 Private</span>}
                  </div>
                </div>
                <div className="group-members-count">
                  👥 {group.members.length}/{group.maxMembers}
                </div>
              </div>

              {group.description && (
                <p className="group-description">{group.description}</p>
              )}

              <div className="group-meta">
                <span>👤 Created by {group.creatorName}</span>
                <span>📅 {new Date(group.createdAt).toLocaleDateString()}</span>
              </div>

              {isUserMember(group) && (
                <div className="invite-code-section">
                  <span>Invite Code: <strong>{group.inviteCode}</strong></span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyInviteCode(group.inviteCode)}
                  >
                    📋 Copy
                  </button>
                </div>
              )}

              <div className="group-actions">
                {isUserMember(group) ? (
                  <>
                    {isUserCreator(group) ? (
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteGroup(group._id)}
                      >
                        🗑️ Delete Group
                      </button>
                    ) : (
                      <button 
                        className="leave-btn"
                        onClick={() => handleLeaveGroup(group._id)}
                      >
                        🚪 Leave Group
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    className="join-btn"
                    onClick={() => handleJoinGroup(group._id)}
                    disabled={group.members.length >= group.maxMembers}
                  >
                    {group.members.length >= group.maxMembers ? '❌ Group Full' : '✅ Join Group'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Groups;