// File: frontend/src/components/presseLocale/PresseLocale.jsx

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from 'jwt-decode';
import { fetchPresseLocale } from "../../actions/presseLocaleActions";
import PresseTextOnly from "../presse/types/PresseTextOnly";
import PresseImageOnly from "../presse/types/PresseImageOnly";
import PresseVideoOnly from "../presse/types/PresseVideoOnly";
import PresseImageVideo from "../presse/types/PresseImageVideo";
import AdminPresseLocaleManager from "./AdminPresseLocaleManager";
import "../../styles/pages/MessagesList.scss";
import "./PresseLocale.css";

const PRESSE_LOCALE_API = process.env.REACT_APP_PRESSE_LOCALE_API;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const PRESSE_LOCALE_MEDIA_URL = `${PRESSE_LOCALE_API}/getMedia`;


/**
 * Détermine le type de presse (text-only, image-only, video-only, image-and-video)
 */
const getPresseViewType = (p) => {
  const hasImage = Array.isArray(p.media) && p.media.some(m => (m.type || "").toLowerCase().includes("image"));
  const hasVideo = Array.isArray(p.media) && p.media.some(m => (m.type || "").toLowerCase().includes("video"));

  if (!hasImage && !hasVideo) return "text-only";
  if (hasImage && !hasVideo) return "image-only";
  if (!hasImage && hasVideo) return "video-only";
  if (hasImage && hasVideo) return "image-and-video";
  return "unknown";
};

export default function PresseLocale() {
  const dispatch = useDispatch();
  const presseLocale = useSelector((s) => s.presseLocale.filteredMessages);
  const [localPresses, setLocalPresses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const toggle = (id) => setActiveId(prev => prev === id ? null : id);
  const isActive = (id) => activeId === id;

  const [videoActiveId, setVideoActiveId] = useState(null);
  const toggleVideo = (id) => setVideoActiveId(prev => prev === id ? null : id);
  const isVideoActive = (id) => videoActiveId === id;

  const videoRefs = useRef({});
  const [mediaLoaded, setMediaLoaded] = useState(false);

  // Vérifier si admin
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded?.isAdmin === true);
      } catch (error) {
        setIsAdmin(false);
      }
    }
  }, []);

  // Récupérer les presses locales au montage
  useEffect(() => {
    dispatch(fetchPresseLocale());
  }, [dispatch]);

  // Charger les médias associés
  useEffect(() => {
    if (!Array.isArray(presseLocale) || presseLocale.length === 0) return;
    if (mediaLoaded && presseLocale.length > 0) return;

    const valid = presseLocale.filter(p => p && p.id);
    if (valid.length === 0) return;

    const load = async () => {
      const enriched = await Promise.all(
        valid.map(async (p) => {
          try {
            const res = await fetch(`${PRESSE_LOCALE_MEDIA_URL}/${p.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            if (!res.ok) return { ...p, media: [] };
            const data = await res.json();
            const normalized = (Array.isArray(data) ? data : []).map(f => ({
              ...f,
              path: f.url || f.path
            }));

            return { ...p, media: normalized };
          } catch {
            return { ...p, media: [] };
          }
        })
      );

      setLocalPresses(enriched);
      setMediaLoaded(true);
    };

    load();
  }, [presseLocale, mediaLoaded]);

  return (
    <div className="presse">
      <div className="presse__container">
        <div className="presse__container__title">📍 Presse Locale</div>

          {/* Liste des presses */}
        <div className="presse__container__messagelist">
          {!Array.isArray(presseLocale) ? (
            <p className="presse__container__messagelist__error">⚠️ Erreur : données non disponibles.</p>
          ) : presseLocale.length === 0 ? (
            <div className="presse__container__messagelist__empty">
              <h3 className="presse__container__messagelist__empty__nothing">📭 Aucune presse locale</h3>
              <p className="presse__container__messagelist__empty__add">
                Aucun contenu disponible.
              </p>
            </div>
          ) : (
            (localPresses.length > 0 ? localPresses : presseLocale).map((p) => {
              const type = getPresseViewType(p);

              if (type === "text-only")
                return <PresseTextOnly key={p.id} presse={p} isActive={isActive} toggle={toggle} />;

              if (type === "image-only")
                return <PresseImageOnly key={p.id} presse={p} isActive={isActive} toggle={toggle} BASE_URL={BASE_URL} />;

              if (type === "video-only")
                return (
                  <PresseVideoOnly
                    key={p.id}
                    presse={p}
                    isActive={isActive}
                    toggle={toggle}
                    isVideoActive={isVideoActive}
                    toggleVideo={toggleVideo}
                    BASE_URL={BASE_URL}
                    videoRefs={videoRefs}
                  />
                );

              if (type === "image-and-video")
                return (
                  <PresseImageVideo
                    key={p.id}
                    presse={p}
                    isActive={isActive}
                    toggle={toggle}
                    isVideoActive={isVideoActive}
                    toggleVideo={toggleVideo}
                    BASE_URL={BASE_URL}
                    videoRefs={videoRefs}
                  />
                );

              return (
                <div key={p.id} className="presse__message presse__message--unknown">
                  <p>⚠️ Format non reconnu.</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="presse__admin">
          <AdminPresseLocaleManager />
        </div>
      )}
    </div>
  );
}
