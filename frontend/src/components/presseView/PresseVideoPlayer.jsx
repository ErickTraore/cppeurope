// File: presse/PresseVideoPlayer.jsx
import React, { useState, useRef, useEffect } from "react";

export default function PresseVideoPlayer({
    presse,
    videoRefs,
    isActive,
    toggle,
    withPoster = false
}) {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const id = presse.id;
    const [playing, setPlaying] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const hideTimer = useRef(null);

    const video = videoRefs.current[id];

    const showControls = () => {
        setControlsVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
    };

    const scheduleHide = (delay = 2500) => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            setControlsVisible(false);
            hideTimer.current = null;
        }, delay);
    };

    const toggleSettings = (e) => {
        e.stopPropagation();
        setSettingsOpen((prev) => !prev);
    };

    const closeSettings = () => setSettingsOpen(false);

    useEffect(() => {
        return () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    const poster = withPoster
        ? `${BASE_URL}${presse.media.find((m) => (m.type || "").toLowerCase().includes("image"))?.path || ""
        }`
        : undefined;

    const videoSrc = `${BASE_URL}${presse.media.find((m) => (m.type || "").toLowerCase().includes("video"))?.path || ""
        }`;

    const toggleFullscreen = () => {
        if (!video) return;

        if (!document.fullscreenElement) {
            video.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };


    return (
        <div
            className="presse__message__media__videoWrapper"
            onMouseMove={() => {
                showControls();
                if (playing) scheduleHide();
            }}
            onPointerMove={() => {
                showControls();
                if (playing) scheduleHide();
            }}
            onTouchStart={() => {
                showControls();
                if (playing) scheduleHide();
            }}
            onMouseEnter={() => {
                showControls();
                if (video && !isActive(id)) {
                    video.play();
                }
            }}
            onMouseLeave={() => {
                if (playing) scheduleHide(800);
                else setControlsVisible(false);
                if (video && !isActive(id)) {
                    video.pause();
                    video.currentTime = 0;
                }
            }}
        >
            <video
                ref={(el) => (videoRefs.current[id] = el)}
                className="presse__message__media__video"
                poster={poster}
                controls={isActive(id)}
                playsInline
                preload="metadata"
                style={{ width: "100%", height: "auto", cursor: !isActive(id) && playing ? "pointer" : "default" }}
                onClick={() => {
                    if (!isActive(id) && playing) {
                        toggle(id);
                    }
                }}
                onPlay={() => {
                    setPlaying(true);
                    closeSettings();
                    scheduleHide(1200);
                }}
                onPause={() => {
                    setPlaying(false);
                    closeSettings();
                    showControls();
                }}
                onEnded={() => {
                    setPlaying(false);
                    closeSettings();
                    showControls();
                }}
            >
                <source src={videoSrc} type="video/mp4" />
            </video>

            {isActive(id) && (controlsVisible || !playing) && (
                <div
                    className="presse__message__media__videoWrapper__controls"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="presse__message__media__videoWrapper__control presse__message__media__videoWrapper__control--back"
                        onClick={() => {
                            if (video) video.currentTime = Math.max(0, video.currentTime - 10);
                        }}
                    >
                        <i className="fas fa-backward"></i>
                    </button>

                    <button
                        className="presse__message__media__videoWrapper__control presse__message__media__videoWrapper__control--play"
                        onClick={() => {
                            if (!video) return;
                            if (video.paused) {
                                video.play();
                                setPlaying(true);
                            } else {
                                video.pause();
                                setPlaying(false);
                            }
                        }}
                    >
                        <i className={`fas ${playing ? "fa-pause" : "fa-play"}`}></i>
                    </button>

                    <button
                        className="presse__message__media__videoWrapper__control presse__message__media__videoWrapper__control--forward"
                        onClick={() => {
                            if (video) video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
                        }}
                    >
                        <i className="fas fa-forward"></i>
                    </button>

                    <div style={{ position: "relative" }}>
                        <button
                            className="presse__message__media__videoWrapper__control presse__message__media__videoWrapper__control--settings"
                            onClick={toggleSettings}
                        >
                            <i className="fas fa-cog"></i>
                        </button>

                        {settingsOpen && (
                            <div
                                className="presse__message__media__videoWrapper__controls__settings"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="settings__title">Vitesse</div>
                                {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                                    <button
                                        key={s}
                                        className={`settings__option ${s === 1 ? "is-default" : ""}`}
                                        onClick={() => {
                                            if (video) video.playbackRate = s;
                                            closeSettings();
                                        }}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            className="presse__message__media__videoWrapper__control presse__message__media__videoWrapper__control--fullscreen"
                            onClick={toggleFullscreen}
                        >
                            <i className="fas fa-expand"></i>
                        </button>

                    </div>
                </div>
            )}

            {!isActive(id) && !playing && (
                <div
                    className="presse__message__media__videoWrapper__overlay"
                    onClick={() => {
                        toggle(id);
                        videoRefs.current[id]?.play();
                    }}
                >
                    <div className="presse__message__media__videoWrapper__overlay__play"></div>
                </div>
            )}
        </div>
    );
}
