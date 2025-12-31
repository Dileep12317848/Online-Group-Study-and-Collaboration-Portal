import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    file: null
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/resources', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('title', formData.title || formData.file.name);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('uploaderName', user.name);

      await axios.post('http://localhost:5000/api/resources/upload', uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Resource uploaded successfully!');
      setFormData({ title: '', description: '', category: 'other', file: null });
      setShowUploadForm(false);
      loadResources();
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id, fileUrl, fileName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.get(`http://localhost:5000/api/resources/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Open file in new tab
      window.open(`http://localhost:5000${fileUrl}`, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Resource deleted successfully');
      loadResources();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Error deleting resource');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="resources-container">
      <div className="resources-header">
        <div>
          <h2>📚 Study Resources</h2>
          <p>Share and access study materials</p>
        </div>
        <button 
          className="upload-btn"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          {showUploadForm ? '✕ Close' : '+ Upload Resource'}
        </button>
      </div>

      {showUploadForm && (
        <div className="upload-form">
          <h3>Upload New Resource</h3>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter resource title"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter description (optional)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="notes">Notes</option>
                <option value="assignment">Assignment</option>
                <option value="book">Book/eBook</option>
                <option value="video">Video Link</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>File</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.ppt,.pptx,.xlsx,.xls"
              />
              <small>Max size: 10MB. Allowed: PDF, DOC, Images, PPT, Excel</small>
            </div>

            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}

      <div className="resources-list">
        {loading ? (
          <p className="loading-text">Loading resources...</p>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <p>📭 No resources yet. Be the first to upload!</p>
          </div>
        ) : (
          resources.map((resource) => (
            <div key={resource._id} className="resource-card">
              <div className="resource-icon">
                {resource.category === 'notes' && '📝'}
                {resource.category === 'assignment' && '📄'}
                {resource.category === 'book' && '📚'}
                {resource.category === 'video' && '🎥'}
                {resource.category === 'other' && '📎'}
              </div>
              <div className="resource-info">
                <h3>{resource.title}</h3>
                {resource.description && <p>{resource.description}</p>}
                <div className="resource-meta">
                  <span>👤 {resource.uploaderName}</span>
                  <span>📊 {formatFileSize(resource.fileSize)}</span>
                  <span>⬇️ {resource.downloads} downloads</span>
                  <span>📅 {new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="resource-actions">
                <button
                  className="download-btn"
                  onClick={() => handleDownload(resource._id, resource.fileUrl, resource.fileName)}
                >
                  Download
                </button>
                {resource.uploadedBy === user?.id && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(resource._id)}
                  >
                    Delete
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

export default Resources;