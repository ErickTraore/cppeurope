import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPresseLocale } from "../../actions/presseLocaleActions";
import PresseTextOnly from "../presseView/types/PresseTextOnly";
import PresseImageOnly from "../presseView/types/PresseImageOnly";
import PresseVideoOnly from "../presseView/types/PresseVideoOnly";
import PresseImageVideo from "../presseView/types/PresseImageVideo";
import "../../styles/pages/MessagesList.scss";

const MEDIA_API = process.env.REACT_APP_PRESSE_LOCALE_MEDIA_API || process.env.REACT_APP_MEDIA_API;
const BASE_URL = process.env.REACT_APP_PRESSE_LOCALE_BASE_URL || process.env.REACT_APP_BASE_URL;
const MEDIA_BACKEND_URL = `${MEDIA_API}/getMedia`;

const getPresseViewType = (p) => {
  const hasImage = Array.isArray(p.media) && p.media.some(m => (m.type || "").toLowerCase().includes("image"));
  const hasVideo = Array.isArray(p.media) && p.media.some(m => (m.type || "").toLowerCase().includes("video"));

  if (!hasImage && !hasVideo) return "text-only";
  if (hasImage && !hasVideo) return "image-only";
  if (!hasImage && hasVideo) return "video-only";
  if (hasImage && hasVideo) return "image-and-video";
  return "unknown";
};

export default function PresseLocaleList() {
  const dispatch = useDispatch();
  const presses = useSelector((s) => s.presseLocale.filteredMessages);
  const [localPresses, setLocalPresses] = useState([]);

  const [activeId, setActiveId] = useState(null);
  const toggle = (id) => setActiveId(prev => prev === id ? null : id);
  const isActive = (id) => activeId === id;

  const [videoActiveId, setVideoActiveId] = useState(null);
  const toggleVideo = (id) => setVideoActiveId(prev => prev === id ? null : id);
  const isVideoActive = (id) => videoActiveId === id;

  const videoRefs = useRef({});
  const [mediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => { dispatch(fetchPresseLocale()); }, [dispatch]);

  useEffect(() => {
    if (!Array.isArray(presses) || presses.length === 0) return;
    if (mediaLoaded) return;

    const valid = presses.filter(p => p && p.id);
    if (valid.length === 0) return;

    const load = async () => {
      const enriched = await Promise.all(
        valid.map(async (p) => {
          try {
            const res = await fetch(`${MEDIA_BACKEND_URL}/${p.id}`, {
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
  }, [presses, mediaLoaded]);

  return (
    <div className="presse">
      <div className="presse__container">
        <div className="presse__container__title">📍 Presse Locale</div>

        <div className="presse__container__messagelist">
          {!Array.isArray(presses) ? (
            <p className="presse__container__messagelist__error">⚠️ Erreur : données non disponibles.</p>
          ) : presses.length === 0 ? (
            <div className="presse__container__messagelist__empty">
              <h3 className="presse__container__messagelist__empty__nothing">📭 Aucune presse locale</h3>
              <p className="presse__container__messagelist__empty__add">Aucun contenu disponible.</p>
            </div>
          ) : (
            (localPresses.length > 0 ? localPresses : presses).map((p) => {
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
    </div>
  );
}
