// File: frontend/src/components/admin/presse/FormArticle.jsx


import React, { useState } from 'react';

const USER_API = process.env.REACT_APP_USER_API;
const PRESSE_GENERALE_API = process.env.REACT_APP_PRESSE_GENERALE_API || USER_API;

const FormArticle = () => {
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setNewMessage({ ...newMessage, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.title || !newMessage.content) {
      setErrorMessage('⚠️ Un titre et un contenu sont obligatoires.');
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
      const response = await fetch(`${PRESSE_GENERALE_API}/messages/new`, {
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

      if (!response.ok) {
        throw new Error(`❌ Erreur HTTP ${response.status}`);
      }

      setNewMessage({ title: '', content: '' });
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
          marginTop: '15px'
        }}>
          <strong>{successMessage}</strong>
        </p>
      )}
    </form>
  );
};

export default FormArticle;
