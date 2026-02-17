// File: frontend/src/components/albumprofile/AlbumProfile.jsx

import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileUser } from '../../actions/userActions';
const AlbumProfile = () => {

  const { slots } = useSelector(state => state.profileMedia);
  console.log('Slots in AlbumProfile:', slots);

  const visibleSlots = slots
    .filter(media => media.slot >= 1 && media.slot <= 3)
    .sort((a, b) => a.slot - b.slot);

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {visibleSlots.map(media => (
        <div key={media.slot}>
          <img
            src={
              typeof media.path === 'string' &&
              (media.path.startsWith('/imagesprofile/') || media.path.startsWith('/mediaprofile/'))
                ? media.path
                : `${process.env.REACT_APP_MEDIA_API}${media.path || ''}`
            }
            alt={`slot-${media.slot}`}
            style={{
              width: 140,
              height: 140,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #ccc'
            }}
            onError={(e) => {
              e.target.src = `/mediaprofile/default/slot-${media.slot}.png`;
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default AlbumProfile;
