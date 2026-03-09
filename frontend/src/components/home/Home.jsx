import React, { useEffect, useState } from 'react';
import './Home.css';

import texte1Path from '../../assets/banniereAccueuil/texte/texte-1.rtf';
import texte2Path from '../../assets/banniereAccueuil/texte/texte-2.rtf';
import texte3Path from '../../assets/banniereAccueuil/texte/texte-3.rtf';
import slot1 from '../../assets/banniereAccueuil/img/slot-1.webp';
import slot2 from '../../assets/banniereAccueuil/img/slot-2.jpg';

const WINDOWS_1252_MAP = {
  128: '€',
  130: '‚',
  131: 'ƒ',
  132: '„',
  133: '…',
  134: '†',
  135: '‡',
  136: 'ˆ',
  137: '‰',
  138: 'Š',
  139: '‹',
  140: 'Œ',
  142: 'Ž',
  145: '‘',
  146: '’',
  147: '“',
  148: '”',
  149: '•',
  150: '–',
  151: '—',
  152: '˜',
  153: '™',
  154: 'š',
  155: '›',
  156: 'œ',
  158: 'ž',
  159: 'Ÿ',
};

const decodeWindows1252Hex = (hex) => {
  const code = parseInt(hex, 16);
  if (code >= 0x80 && code <= 0x9f && WINDOWS_1252_MAP[code]) {
    return WINDOWS_1252_MAP[code];
  }
  return String.fromCharCode(code);
};

const rtfToPlainText = (rtfContent) => {
  if (!rtfContent) return '';

  const withoutTables = rtfContent
    .replace(/\{\\fonttbl[\s\S]*?\}/g, ' ')
    .replace(/\{\\colortbl[\s\S]*?\}/g, ' ')
    .replace(/\{\\\*\\expandedcolortbl[\s\S]*?\}/g, ' ')
    .replace(/\{\\\*[^{}]*\}/g, ' ');

  const mainTextBlock = (() => {
    const match = withoutTables.match(/\\cf\d+\s+([\s\S]*?)\s*}\s*$/);
    return match?.[1] || withoutTables;
  })();

  return mainTextBlock
    .replace(/\\'[0-9a-fA-F]{2}/g, (match) => decodeWindows1252Hex(match.slice(2)))
    .replace(/\\par[d]?/gi, '\n')
    .replace(/\\[{}\\]/g, ' ')
    .replace(/\\[a-z]+-?\d* ?/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[;\\\s]+$/g, '')
    .trim();
};

const Home = () => {
  const [texts, setTexts] = useState(['Chargement du texte 1...', 'Chargement du texte 2...', 'Chargement du texte 3...']);
  const [selectedSlot, setSelectedSlot] = useState('slot-1');

  useEffect(() => {
    const loadTexts = async () => {
      try {
        const rtfPaths = [texte1Path, texte2Path, texte3Path];
        const rtfContents = await Promise.all(
          rtfPaths.map((path) => fetch(path).then((response) => response.text()))
        );

        const plainTexts = rtfContents.map(rtfToPlainText);
        setTexts(plainTexts);
      } catch (error) {
        setTexts([
          'Un militant mal formé est un danger pour son parti et sa patrie.',
          'Rejoignez les forces vives de la Côte d’Ivoire en adhérant au PPACI.',
          'Un militant mal formé est un danger pour son parti et sa patrie.',
        ]);
      }
    };

    loadTexts();
  }, []);

  const selectedImage = selectedSlot === 'slot-2' ? slot2 : slot1;
  const selectedCaption = selectedSlot === 'slot-2'
    ? {
        line1: 'Léon Emmanuel Monnet',
        line2: 'Président du CPP PPA-CI.',
      }
    : {
        line1: 'Laurent GBAGBO',
        line2: 'Président du Parti des Peuples Africains (PPACI).',
      };
  const elephantSpacer = ' 🐘🐘🐘 ';
  const tickerText = `${texts.filter(Boolean).join(elephantSpacer)}${elephantSpacer}`;

  return (
    <div className="home">
      <div className="home-banner">
        <div className="home-banner__marquee">
          <span className="home-banner__segment">{tickerText}</span>
          <span className="home-banner__segment" aria-hidden="true">{tickerText}</span>
        </div>
      </div>

      <div className="home-image-frame">
        <div className="home-image-frame__choices">
          <button
            type="button"
            className={`home-image-choice ${selectedSlot === 'slot-1' ? 'is-selected' : ''}`}
            onClick={() => setSelectedSlot('slot-1')}
            aria-label="Sélectionner la première image"
          >
            <img src={slot1} alt="Option 1" className="home-image-choice__thumb" />
          </button>

          <button
            type="button"
            className={`home-image-choice ${selectedSlot === 'slot-2' ? 'is-selected' : ''}`}
            onClick={() => setSelectedSlot('slot-2')}
            aria-label="Sélectionner la deuxième image"
          >
            <img src={slot2} alt="Option 2" className="home-image-choice__thumb" />
          </button>
        </div>

        <div className="home-image-frame__preview">
          <img src={selectedImage} alt="Bannière" className="home-image-frame__preview-img" />
          <div className="home-image-frame__caption">
            <p className="home-image-frame__caption-line1">{selectedCaption.line1}</p>
            <p className="home-image-frame__caption-line2">{selectedCaption.line2}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
