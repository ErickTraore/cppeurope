// File: presse/types/PresseImageOnly.jsx
import React from "react";
import PresseHeader from "../PresseHeader";

export default function PresseImageOnly({ presse, isActive, toggle, BASE_URL }) {
  return (
    <div className="presse__message presse__message--image-only">

      <div className="presse__message__media__grid">
        {presse.media.map((file) => (
          <img
            key={file.id}
            src={file.path}
            alt="media"
            className="presse__message__media__img"
          />
        ))}
      </div>

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
