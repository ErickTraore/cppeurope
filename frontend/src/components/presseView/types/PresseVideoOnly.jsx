// File: presse/types/PresseVideoOnly.jsx
import React from "react";
import PresseHeader from "../PresseHeader";
import PresseVideoPlayer from "../PresseVideoPlayer";

export default function PresseVideoOnly({ presse, isActive, toggle, isVideoActive, toggleVideo, BASE_URL, videoRefs }) {
  return (
    <div className="presse__message presse__message--video-only">

      <PresseVideoPlayer
        presse={presse}
        videoRefs={videoRefs}
        isActive={isVideoActive}
        toggle={toggleVideo}
      />

      <div
        className={`presse__message__textbar ${isActive(presse.id) ? "presse__message__textbar--below" : ""}`}
        onClick={() => toggle(presse.id)}
      >
        <PresseHeader presse={presse} />
      </div>

      {isActive(presse.id) && (
        <p className="presse__message__content">{presse.content}</p>
      )}
    </div>
  );
}
