// File: presse/PresseHeader.jsx
import React from "react";
import "../../styles/pages/MessagesList.scss";

export default function PresseHeader({ presse }) {
  return (
    <>
      <p className="presse__message__header__title">
        {presse.title || presse.tittle}
      </p>
      <p className="presse__message__header__author">
        {presse.User?.Profile?.firstName} {presse.User?.Profile?.lastName}
        <span className="presse__message__header__author__date">
          ({new Date(presse.createdAt).toLocaleString()})
        </span>
      </p>
    </>
  );
}
