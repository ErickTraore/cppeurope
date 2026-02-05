// File: frontend/src/components/presseLocale/FormArticleVideoLocale.jsx

import React, { useState, useRef } from 'react';
const USER_API = process.env.REACT_APP_USER_API;
const MEDIA_API = process.env.REACT_APP_MEDIA_API;

const FormArticleVideoLocale = ({ onReset }) => {
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    video: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('✅ Vidéo sélectionnée :', file);
      setNewMessage((prevState) => ({ ...prevState, video: file }));
    } else {
      console.error('❌ Aucune vidéo sélectionnée.');
    }
  };

  const uploadVideo = async (file, messageId) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('messageId', messageId);

    try {
      const response = await fetch(`${MEDIA_API}/uploadVideo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`❌ Erreur upload vidéo: ${response.status}`);
      }

      console.log('✅ Vidéo envoyée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de la vidéo:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.title || !newMessage.content || !newMessage.video) {
      setErrorMessage('⚠️ Titre, contenu et vidéo sont obligatoires.');
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

      if (!messageResponse.ok) {
        throw new Error(`❌ Erreur HTTP ${messageResponse.status}`);
      }

      const { id: newMessageId } = await messageResponse.json();

      await uploadVideo(newMessage.video, newMessageId);

      setNewMessage({ title: '', content: '', video: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        ref={fileInputRef}
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

export default FormArticleVideoLocale;
