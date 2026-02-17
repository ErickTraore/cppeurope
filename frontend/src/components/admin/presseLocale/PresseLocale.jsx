import React, { useEffect, useState } from 'react';
import FormPresseLocale from './FormPresseLocale';
import FormPresseLocalePhoto from './FormPresseLocalePhoto';
import FormPresseLocaleVideo from './FormPresseLocaleVideo';
import FormPresseLocaleThumbnailVideo from './FormPresseLocaleThumbnailVideo';
import { setResetFormat } from '../../../utils/formatController';
import './Presse.scss';

const formatDescriptions = {
  'article': '📝 Article texte sans média',
  'article-photo': '🖼️ Article avec image obligatoire',
  'article-video': '🎥 Article avec vidéo obligatoire',
  'article-thumbnail-video': '🖼️📹 Article avec miniature + vidéo',
};

const PresseLocale = () => {
  const [selectedFormat, setSelectedFormat] = useState('');

  const handleReset = () => {
    setSelectedFormat('');
  };

  useEffect(() => {
    setResetFormat(() => setSelectedFormat(''));
  }, []);

  return (
    <div className="presse-wrapper">
      <h2 className="presse-title">📰 Publication Presse Locale</h2>

      {!selectedFormat && (
        <>
          <label htmlFor="format" className="presse-label">Choisir un format :</label>
          <select
            id="format"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            required
            className="presse-select"
          >
            <option value="">-- Sélectionner --</option>
            <option value="article">📝 Article</option>
            <option value="article-photo">🖼️ Article + Photo</option>
            <option value="article-video">🎥 Article + Vidéo</option>
            <option value="article-thumbnail-video">🖼️📹 Article + Miniature + Vidéo</option>
          </select>
        </>
      )}

      {selectedFormat && (
        <>
          <p className="presse-description">
            {formatDescriptions[selectedFormat]}
          </p>

          <div className="presse-form-container">
            {selectedFormat === 'article' && <FormPresseLocale onReset={handleReset} />}
            {selectedFormat === 'article-photo' && <FormPresseLocalePhoto onReset={handleReset} />}
            {selectedFormat === 'article-video' && <FormPresseLocaleVideo onReset={handleReset} />}
            {selectedFormat === 'article-thumbnail-video' && <FormPresseLocaleThumbnailVideo onReset={handleReset} />}
          </div>

          <button onClick={handleReset} className="presse-reset-button">
            🔄 Changer de format
          </button>
        </>
      )}
    </div>
  );
};

export default PresseLocale;
