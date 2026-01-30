// File: frontend/src/components/presseLocale/AdminPresseLocaleManager.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPresseLocale } from '../../actions/presseLocaleActions';
import './AdminPresseLocaleManager.css';

const USER_API = process.env.REACT_APP_USER_API;
const PRESSE_LOCALE_API = process.env.REACT_APP_PRESSE_LOCALE_API;
const CITIES = ['lyon', 'paris', 'marseille'];

const AdminPresseLocaleManager = () => {
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.presseLocale.messages);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    presse: 'lyon'
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [messageMedia, setMessageMedia] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    dispatch(fetchPresseLocale()); 
  }, [dispatch]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    
    const loadMedia = async () => {
      const media = {};
      for (const msg of messages) {
        try {
          const res = await fetch(`${PRESSE_LOCALE_API}/getMedia/${msg.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
          });
          if (res.ok) {
            const data = await res.json();
            const normalized = (Array.isArray(data) ? data : []).map(f => ({
              ...f,
              path: f.url || f.path
            }));
            media[msg.id] = normalized;
          }
        } catch (err) { 
          console.error(`Erreur média ${msg.id}:`, err); 
        }
      }
      setMessageMedia(media);
    };
    loadMedia();
  }, [messages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const messageData = {
        title: formData.title,
        content: formData.content,
        categ: 'presse-locale',
        presse: formData.presse
      };

      let messageId;
      if (editingId) {
        await fetch(`${USER_API}/messages/${editingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
        messageId = editingId;
      } else {
        const res = await fetch(`${USER_API}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
        const data = await res.json();
        messageId = data.id;
      }

      // Upload médias
      if (imageFile || videoFile) {
        const mediaFormData = new FormData();
        mediaFormData.append('messageId', messageId);
        if (imageFile) mediaFormData.append('image', imageFile);
        if (videoFile) mediaFormData.append('video', videoFile);

        await fetch(`${PRESSE_LOCALE_API}/uploadImage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: mediaFormData,
        });
      }

      setFormData({ title: '', content: '', presse: 'lyon' });
      setImageFile(null);
      setVideoFile(null);
      setIsCreating(false);
      setEditingId(null);
      dispatch(fetchPresseLocale());
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (message) => {
    setFormData({
      title: message.title,
      content: message.content,
      presse: message.presse || 'lyon'
    });
    setEditingId(message.id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    
    try {
      await fetch(`${USER_API}/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      dispatch(fetchPresseLocale());
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: '', content: '', presse: 'lyon' });
    setImageFile(null);
    setVideoFile(null);
  };

  return (
    <div className="admin-presse-locale">
      <h2>🏙️ Admin Presse Locale</h2>

      {!isCreating ? (
        <button className="btn-create" onClick={() => setIsCreating(true)}>
          ➕ Créer un article
        </button>
      ) : (
        <div className="form-container">
          <h3>{editingId ? 'Éditer' : 'Créer'} un article local</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ville :</label>
              <select name="presse" value={formData.presse} onChange={handleInputChange} required>
                {CITIES.map(city => (
                  <option key={city} value={city}>
                    {city.charAt(0).toUpperCase() + city.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Titre :</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Contenu :</label>
              <textarea 
                name="content" 
                value={formData.content} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Image :</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
              />
            </div>

            <div className="form-group">
              <label>Vidéo :</label>
              <input 
                type="file" 
                accept="video/*" 
                onChange={(e) => setVideoFile(e.target.files[0])} 
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? '⏳ Traitement...' : editingId ? '✏️ Éditer' : '📤 Publier'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                ✕ Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="articles-list">
        <h3>📰 Articles publiés ({messages.length})</h3>
        {messages.length === 0 ? (
          <p className="empty">Aucun article</p>
        ) : (
          <div className="articles">
            {messages.map(msg => (
              <div key={msg.id} className="article-card">
                <div className="article-header">
                  <h4>{msg.title}</h4>
                  <span className="city-badge">{msg.presse}</span>
                </div>
                <p className="article-content">{msg.content.substring(0, 100)}...</p>
                {messageMedia[msg.id] && messageMedia[msg.id].length > 0 && (
                  <div className="article-media">
                    {messageMedia[msg.id].map((m, i) => (
                      m.type && m.type.toLowerCase().includes('image') && (
                        <img key={i} src={m.path} alt="media" style={{ maxWidth: '150px' }} />
                      )
                    ))}
                  </div>
                )}
                <div className="article-actions">
                  <button className="btn-edit" onClick={() => handleEdit(msg)}>✏️ Éditer</button>
                  <button className="btn-delete" onClick={() => handleDelete(msg.id)}>🗑️ Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPresseLocaleManager;
