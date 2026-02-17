// File: frontend/src/components/presse/types/PresseImageVideo.jsx
import React from "react";
import PresseHeader from "../PresseHeader";
import PresseVideoPlayer from "../PresseVideoPlayer";

export default function PresseImageVideo({ presse, isActive, toggle, isVideoActive, toggleVideo, BASE_URL, videoRefs }) {
  return (
    <div className="presse__message presse__message--image-and-video">

      <PresseVideoPlayer
        presse={presse}
        BASE_URL={BASE_URL}
        videoRefs={videoRefs}
        isActive={isVideoActive}
        toggle={toggleVideo}
        withPoster
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
