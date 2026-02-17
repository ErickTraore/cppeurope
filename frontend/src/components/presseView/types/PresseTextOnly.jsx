// File: presse/types/PresseTextOnly.jsx
import React from "react";
import PresseHeader from "../PresseHeader";
import "../../../styles/pages/MessagesList.scss";

export default function PresseTextOnly({ presse, isActive, toggle }) {
  return (
    <div className="presse__message--text-only">
      <div
        className="presse__message__header"
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
