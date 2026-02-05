// File: frontend/src/components/presseLocale/FormArticleThumbnailVideoLocale.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { triggerFormatReset } from '../../utils/formatController';

const USER_API = process.env.REACT_APP_USER_API;
const MEDIA_API = process.env.REACT_APP_MEDIA_API;

const FormArticleThumbnailVideoLocale = ({ onReset }) => {
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    image: null,
    video: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Créer les URLs une seule fois et les nettoyer
  const imagePreviewUrl = useMemo(() => 
    newMessage.image ? URL.createObjectURL(newMessage.image) : null,
    [newMessage.image]
  );

  const videoPreviewUrl = useMemo(() => 
    newMessage.video ? URL.createObjectURL(newMessage.video) : null,
    [newMessage.video]
  );

  // Nettoyer les URLs lors du démontage ou changement
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [imagePreviewUrl, videoPreviewUrl]);

  const handleInputChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      setNewMessage((prevState) => ({ ...prevState, [name]: file }));
      setSuccessMessage('');
    }
  };

  const uploadFile = async (file, endpoint, messageId) => {
    const formData = new FormData();
    formData.append(endpoint, file);
    formData.append('messageId', messageId);

    try {
      const response = await fetch(`${MEDIA_API}/upload${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload ${endpoint} failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`Upload error (${endpoint}):`, error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.title || !newMessage.content || !newMessage.image || !newMessage.video) {
      setErrorMessage('⚠️ Titre, contenu, image et vidéo sont obligatoires.');
      return;
    }

    if (newMessage.content.length > 50000) {
      setErrorMessage('⚠️ Le contenu est trop volumineux (max 50000 caractères).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const messageResponse = await fetch(`${USER_API}/messages/new`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newMessage.title,
          content: newMessage.content,
          categ: 'presse-locale'
        }),
      });

      triggerFormatReset();

      if (!messageResponse.ok) {
        throw new Error(`❌ Erreur HTTP ${messageResponse.status}`);
      }

      const { id: newMessageId } = await messageResponse.json();

      await uploadFile(newMessage.image, 'image', newMessageId);
      await uploadFile(newMessage.video, 'video', newMessageId);

      setNewMessage({ title: '', content: '', image: null, video: null });
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      setErrorMessage('');
      setSuccessMessage('✅ Article publié avec succès ! Rechargez la page pour le voir.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi:", error);
      setErrorMessage("⚠️ Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={newMessage.title}
        onChange={handleInputChange}
        placeholder="Titre"
        required
      />
      <textarea
        name="content"
        value={newMessage.content}
        onChange={handleInputChange}
        placeholder="Contenu"
        required
      />
      <input
        type="file"
        name="image"
        ref={imageInputRef}
        onChange={handleFileChange}
        accept="image/*"
        placeholder="Image (Miniature)"
        required
      />
      <input
        type="file"
        name="video"
        ref={videoInputRef}
        onChange={handleFileChange}
        accept="video/*"
        placeholder="Vidéo"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '⏳ Envoi en cours...' : '🚀 Envoyer'}
      </button>
      {isLoading && (
        <p style={{ marginTop: '10px', color: '#666' }}>📤 Publication en cours...</p>
      )}
      {errorMessage && <p style={{ color: 'red' }}><strong>{errorMessage}</strong></p>}
      {successMessage && (
        <p style={{ 
          color: 'green', 
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: '12px',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          {successMessage}
        </p>
      )}
    </form>
  );
};

export default FormArticleThumbnailVideoLocale;
