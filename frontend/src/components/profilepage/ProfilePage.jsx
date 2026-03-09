// File: lespremices/frontend/src/components/profilepage/ProfilePage.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  fetchProfileInfo,
  updateProfileInfo,
  fetchProfileMedia,
  updateProfileMedia
} from '../../actions/profileActions';
import Spinner from '../common/Spinner';
import "../../styles/pages/ProfilePage.scss";

const resolveApiBase = (value, fallback) => {
  const raw = (value || fallback).trim();

  try {
    const parsed = new URL(raw);
    if (parsed.port === '6000') {
      parsed.port = '8082';
      return parsed.toString().replace(/\/$/, '');
    }
    return raw.replace(/\/$/, '');
  } catch {
    return fallback;
  }
};

const isFrontend3000 =
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  window.location.port === '3000';

const PROFILE_MEDIA_API = isFrontend3000
  ? '/api/user-media-profile'
  : resolveApiBase(
      process.env.REACT_APP_PROFILE_MEDIA_API || process.env.REACT_APP_USER_MEDIA_PROFILE_API || process.env.REACT_APP_MEDIA_API,
      'http://localhost:8082/api/user-media-profile'
    );
const PROFILE_MEDIA_ORIGIN = (() => {
  if (isFrontend3000) return 'http://localhost:8082';
  try {
    return new URL(PROFILE_MEDIA_API).origin;
  } catch {
    return 'http://localhost:8082';
  }
})();
console.log('[ProfilePage] PROFILE_MEDIA_API =', PROFILE_MEDIA_API);

const ProfilePage = () => {
  const dispatch = useDispatch();

  // ---- Sélecteurs Redux avec shallowEqual pour éviter les re-renders inutiles ----
  const profileInfo = useSelector((state) => state.profileInfo, shallowEqual);
  const { loading, error, data } = profileInfo;

  const profileMedia = useSelector((state) => state.profileMedia, shallowEqual);
  const { slots, loading: mediaLoading, error: mediaError } = profileMedia;

  console.log('[ProfilePage] profileInfo (entier) =', profileInfo);
  console.log('[ProfilePage] profileMedia (entier) =', profileMedia);

  const [activeTab, setActiveTab] = useState('infos');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone1: '',
    phone2: '',
    phone3: '',
    address: '',
  });

  const [uploading, setUploading] = useState({});
  // ---- 1) Chargement initial du profil ----
  useEffect(() => {
    console.log('[ProfilePage] useEffect(mount) → dispatch(fetchProfileInfo())');
    dispatch(fetchProfileInfo());
  }, [dispatch]);

  // ---- 2) Quand le profil est chargé, alimenter le form et charger les médias ----
  useEffect(() => {
    console.log('[ProfilePage] useEffect([data]) → data =', data);

    if (data?.id) {
      console.log('[ProfilePage] Profil détecté, id =', data.id);
      console.log('[ProfilePage] Remplissage du form avec les données du profil');

      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone1: data.phone1 || '',
        phone2: data.phone2 || '',
        phone3: data.phone3 || '',
        address: data.address || '',
      });

      console.log('[ProfilePage] Dispatch fetchProfileMedia avec userId =', data.id);
      dispatch(fetchProfileMedia(data.id));
    } else {
      console.log('[ProfilePage] Aucun data.id pour le moment (profil non chargé ou erreur)');
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (activeTab === 'images' && data?.id) {
      dispatch(fetchProfileMedia(data.id));
    }
  }, [activeTab, data?.id, dispatch]);

  // ---- 3) Écoute d’un éventuel event "tokenUpdated" ----
  useEffect(() => {
    const handleTokenUpdate = () => {
      console.log('[ProfilePage] 🔄 Event tokenUpdated reçu → dispatch(fetchProfileInfo())');
      dispatch(fetchProfileInfo());
    };

    console.log('[ProfilePage] Ajout listener window.tokenUpdated');
    window.addEventListener('tokenUpdated', handleTokenUpdate);
    return () => {
      console.log('[ProfilePage] Retrait listener window.tokenUpdated');
      window.removeEventListener('tokenUpdated', handleTokenUpdate);
    };
  }, [dispatch]);

  // ---- 4) Gestion des changements de champs ----
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`[ProfilePage] handleChange → ${name} =`, value);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ---- 5) Soumission du formulaire d'infos ----
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[ProfilePage] handleSubmit appelé, form =', form);

    if (data?.id) {
      console.log('[ProfilePage] Dispatch updateProfileInfo avec id =', data.id);
      dispatch(updateProfileInfo(data.id, form));
    } else {
      console.warn('[ProfilePage] Impossible d\'update : data.id manquant');
    }
  };

  // ---- 6) Upload d'image ----
  const handleFileUpload = async (media, file) => {
    console.log('[ProfilePage] 📤 Début upload, media =', media, 'file =', file);

    if (!file) {
      console.warn('[ProfilePage] ❌ Aucun fichier sélectionné');
      return;
    }

    const initialMediaId = media?.id;
    const slotIndex = Number.isInteger(Number(media?.slot)) ? Number(media.slot) : 0;

    if (!initialMediaId) {
      console.warn('[ProfilePage] ❌ Media ID absent');
      return;
    }

    setUploading((prev) => ({ ...prev, [initialMediaId]: true }));

    const formData = new FormData();
    formData.append('image', file);
    console.log('[ProfilePage] FormData prêt, envoi vers', `${PROFILE_MEDIA_API}/uploadImageProfile`);

    try {
      let targetMediaId = initialMediaId;

      if (media?.isFallback) {
        if (!data?.id) {
          throw new Error('Profil introuvable pour créer un slot média');
        }

        const createSlotResponse = await fetch(`${PROFILE_MEDIA_API}/mediaProfile/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId: data.id,
            filename: '',
            path: `/mediaprofile/default/slot-${slotIndex}.png`,
            type: 'image',
            slot: slotIndex,
          }),
        });

        const createSlotPayload = await createSlotResponse.json();
        if (!createSlotResponse.ok || !createSlotPayload?.id) {
          throw new Error('Impossible de créer le slot média manquant');
        }

        targetMediaId = createSlotPayload.id;
      }

      const response = await fetch(`${PROFILE_MEDIA_API}/uploadImageProfile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      console.log('[ProfilePage] 📨 Réponse upload brute =', response);

      const result = await response.json().catch((err) => {
        console.error('[ProfilePage] ❌ Erreur parse JSON upload :', err);
        throw err;
      });
      console.log('[ProfilePage] 📄 Contenu JSON upload =', result);

      if (!response.ok || !result.filename) {
        console.error('[ProfilePage] ❌ Upload échoué ou filename manquant, status =', response.status);
        throw new Error('Échec upload image');
      }

      const imageUrl = `/imagesprofile/${result.filename}`;
      console.log('[ProfilePage] ✅ URL image calculée =', imageUrl);

      console.log('[ProfilePage] Dispatch updateProfileMedia avec mediaId =', targetMediaId);
      await dispatch(updateProfileMedia(targetMediaId, { url: imageUrl }));

      console.log('[ProfilePage] Rechargement des médias avec userId =', data?.id);
      if (data?.id) {
        await dispatch(fetchProfileMedia(data.id));
      } else {
        console.warn('[ProfilePage] Impossible de recharger les médias : data.id manquant');
      }
    } catch (err) {
      console.error(`[ProfilePage] ❌ Erreur upload image (mediaId=${initialMediaId}) :`, err);
    } finally {
      console.log('[ProfilePage] 🔚 Fin upload pour mediaId =', initialMediaId);
      setUploading((prev) => ({ ...prev, [initialMediaId]: false }));
    }
  };

  // ---- 7) Logs d'état d'affichage ----
  console.log('[ProfilePage] RENDER → loading =', loading, 'error =', error);
  console.log('[ProfilePage] RENDER → mediaLoading =', mediaLoading, 'mediaError =', mediaError);
  console.log('[ProfilePage] RENDER → slots =', slots);

  // ---- 8) Rendus conditionnels ----
  if (loading) {
    console.log('[ProfilePage] Affichage: "Chargement du profil..."');
    return <Spinner size="large" text="Chargement du profil..." />;
  }

  if (error) {
    console.log('[ProfilePage] Affichage erreur profil :', error);
    return <div>Erreur : {error}</div>;
  }

  const safeSlots = Array.isArray(slots) ? slots : [];
  const toSlotIndex = (slotValue) => {
    const numericSlot = Number(slotValue);
    if (!Number.isInteger(numericSlot)) return null;
    if (numericSlot >= 0 && numericSlot <= 3) return numericSlot;
    if (numericSlot >= 1 && numericSlot <= 4) return numericSlot - 1;
    return null;
  };

  const slotMap = new Map();
  safeSlots.forEach((media) => {
    const slotIndex = toSlotIndex(media?.slot);
    if (slotIndex === null) return;
    if (!slotMap.has(slotIndex)) {
      slotMap.set(slotIndex, media);
    }
  });

  const displaySlots = [0, 1, 2, 3].map((slotIndex) => {
    const media = slotMap.get(slotIndex);
    if (media) {
      return {
        ...media,
        slot: slotIndex,
      };
    }

    return {
      id: `default-slot-${slotIndex}`,
      slot: slotIndex,
      path: `/mediaprofile/default/slot-${slotIndex}.png`,
      isFallback: true,
    };
  });
  console.log('[ProfilePage] safeSlots (tableau) =', safeSlots);

  // Résolution d'URL : /imagesprofile et /mediaprofile sont servis par nginx en "same-origin"
  // et ne doivent PAS être préfixés par REACT_APP_MEDIA_API (/api/media), sinon 404.
  const resolveProfileMediaSrc = (path, slot) => {
    const slotIndex = Number.isInteger(Number(slot)) ? Number(slot) : 0;
    const fallback = `${PROFILE_MEDIA_ORIGIN}/mediaprofile/default/slot-${slotIndex}.png`;

    if (!path) return fallback;
    if (typeof path !== 'string') return fallback;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // Ces chemins sont exposés directement par nginx (cf. /imagesprofile/ et /mediaprofile/)
    if (path.startsWith('/imagesprofile/') || path.startsWith('/mediaprofile/')) {
      return `${PROFILE_MEDIA_ORIGIN}${path}`;
    }

    // Autres chemins : tenter via l'API media si configurée
    if (path.startsWith('/') && PROFILE_MEDIA_API) return `${PROFILE_MEDIA_API}${path}`;
    return fallback;
  };

  // ---- 9) JSX ----
  return (
    <div className="profile-page">
      <h3>Mon profil</h3>

      <div className="tabs">
        <button onClick={() => { console.log('[ProfilePage] Onglet "infos"'); setActiveTab("infos"); }}>Mes infos</button>
        <button onClick={() => { console.log('[ProfilePage] Onglet "images"'); setActiveTab("images"); }}>Mes images</button>
        <button onClick={() => { console.log('[ProfilePage] Onglet "bio"'); setActiveTab("bio"); }}>Ma biographie</button>
      </div>

      {activeTab === "infos" && (
        <form className="infosform" onSubmit={handleSubmit}>
          <div className="infosform__row">
            <div className="infosform__row__label">Nom</div>
            <input
              className="infosform__row__input"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="infosform__row">
            <div className="infosform__row__label">Prénom</div>
            <input
              className="infosform__row__input"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="infosform__row">
            <div className="infosform__row__label">Email</div>
            <input
              className="infosform__row__input"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="infosform__row">
            <div className="infosform__row__label">Phone-1</div>
            <input
              className="infosform__row__input"
              name="phone1"
              value={form.phone1}
              onChange={handleChange}
            />
          </div>

          <div className="infosform__row">
            <div className="infosform__row__label">Phone-2</div>
            <input
              className="infosform__row__input"
              name="phone2"
              value={form.phone2}
              onChange={handleChange}
            />
          </div>

          <div className="infosform__row">
            <div className="infosform__row__label">Phone-3</div>
            <input
              className="infosform__row__input"
              name="phone3"
              value={form.phone3}
              onChange={handleChange}
            />
          </div>

          <div className="infosform__row">
            <div className="infosform__row__label">Adresse :</div>
            <input
              className="infosform__row__input"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="infosform__button">
            Enregistrer
          </button>
        </form>
      )}

      {activeTab === "images" && (
        <div className="images__container">
          {mediaLoading && <Spinner size="medium" text="Chargement des images..." />}
          {mediaError && mediaError !== 'API injoignable (vérifie que localhost:8082 est démarré)' && <p>Erreur : {mediaError}</p>}
          {!mediaLoading && Object.values(uploading).some(Boolean) && (
            <Spinner size="medium" text="Téléversement en cours..." />
          )}

          <div className="images__container__grid">
            {displaySlots.map((media) => (
              <div key={media.id} className="images__container__grid__card">
                <img
                  src={resolveProfileMediaSrc(media.path, media.slot)}
                  alt="ProfileImage"
                  className="profile-image"
                  onError={(event) => {
                    const imageElement = event.currentTarget;
                    if (imageElement.dataset.fallbackApplied === '1') return;

                    imageElement.dataset.fallbackApplied = '1';
                    imageElement.src = resolveProfileMediaSrc(null, media.slot);
                  }}
                />

                <div className="images__container__grid__card__upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(media, e.target.files[0])
                    }
                    disabled={uploading[media.id]}
                  />
                  {uploading[media.id] && <Spinner size="small" inline={true} text="Téléversement..." />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "bio" && (
        <div className="bio-section">
          <p>📝 Biographie à intégrer ici</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProfilePage);
