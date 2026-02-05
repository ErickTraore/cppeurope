// File: frontend/src/components/messages/presse/FormArticleThumbnailVideo.jsx


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { triggerFormatReset } from '../../../utils/formatController';

const USER_API = process.env.REACT_APP_USER_API;
const MEDIA_API = process.env.REACT_APP_MEDIA_API;

const FormArticleThumbnailVideo = () => {
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
      throw error;
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
      const messageResponse = await fetch(`${USER_API}/messages/new/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newMessage.title,
          content: newMessage.content,
          categ: 'presse'
        }),
      });

      if (!messageResponse.ok) throw new Error(`HTTP ${messageResponse.status}`);

      const { id: newMessageId } = await messageResponse.json();

      await uploadFile(newMessage.image, 'image', newMessageId);
      await uploadFile(newMessage.video, 'video', newMessageId);

      // Garder le spinner au minimum 4 secondes pour l'UX
      await new Promise(resolve => setTimeout(resolve, 4000));

      setNewMessage({ title: '', content: '', image: null, video: null });
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      setErrorMessage('');

      // Arrêter le spinner
      setIsLoading(false);

      // Afficher le succès
      setSuccessMessage('✅ Article publié avec succès !');

      // Garder le message visible 3 secondes puis réinitialiser
      setTimeout(() => {
        setSuccessMessage('');
        triggerFormatReset();
      }, 3000);
    } catch (error) {
      console.error('Envoi échoué:', error);
      setErrorMessage('⚠️ Une erreur est survenue lors de l\'envoi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
        accept="image/*"
        onChange={handleFileChange}
        ref={imageInputRef}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        name="video"
        accept="video/*"
        onChange={handleFileChange}
        ref={videoInputRef}
        style={{ display: 'none' }}
      />

      <button type="button" onClick={() => imageInputRef.current?.click()}>
        🖼️ Sélectionner une image
      </button>
      <button type="button" onClick={() => videoInputRef.current?.click()}>
        🎥 Sélectionner une vidéo
      </button>

      {(newMessage.image || newMessage.video) && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h4>🖼️🎬 Fichiers sélectionnés</h4>
          {newMessage.image && imagePreviewUrl && (
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Image :</strong> {newMessage.image.name} ({(newMessage.image.size / 1024 / 1024).toFixed(2)} Mo)</p>
              <img
                src={imagePreviewUrl}
                alt="Aperçu miniature"
                style={{ maxWidth: '300px', maxHeight: '200px', border: '1px solid #aaa' }}
              />
            </div>
          )}
          {newMessage.video && videoPreviewUrl && (
            <div>
              <p><strong>Vidéo :</strong> {newMessage.video.name} ({(newMessage.video.size / 1024 / 1024).toFixed(2)} Mo)</p>
              <video
                controls
                src={videoPreviewUrl}
                style={{ maxWidth: '300px', maxHeight: '200px', border: '1px solid #aaa' }}
              />
            </div>
          )}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? '⏳ Envoi en cours...' : '📨 Publier'}
      </button>

      {isLoading && (
        <div className="spinner" style={{ 
          marginTop: '15px', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          <div style={{
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '10px auto'
          }}></div>
          <p>📤 Upload des fichiers en cours... Veuillez patienter.</p>
        </div>
      )}

      {errorMessage && <p style={{ color: 'red' }}><strong>{errorMessage}</strong></p>}
      {successMessage && (
        <p style={{ 
          color: 'green', 
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: '12px',
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          <strong>{successMessage}</strong>
        </p>
      )}
    </form>
    </>
  );
};

export default FormArticleThumbnailVideo;
