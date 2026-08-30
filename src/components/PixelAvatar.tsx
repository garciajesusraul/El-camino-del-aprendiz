import React from 'react';

interface PixelAvatarProps {
  gender: 'boy' | 'girl';
  size?: number;
  className?: string;
  hairColor?: string;
  accessory?: 'none' | 'backpack' | 'glasses' | 'medal' | 'cape';
}

/**
 * Pixel-perfect SVG avatar based on the "Prota" sprite sheet by tortu
 * (Boy with black parted curtain-bangs hair and light blue shirt / Girl with long hair and ribbon).
 */
export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  gender,
  size = 32,
  className = '',
  hairColor,
  accessory = 'none',
}) => {
  if (gender === 'boy') {
    // Exact Pixel Art representation of Prota with Black Hair
    const primaryHair = hairColor || '#18181b';
    const highlightHair = '#3f3f46';
    const darkHair = '#09090b';
    const skinTone = '#ffd1a4';
    const skinShadow = '#f5b584';
    const cheekColor = 'rgba(244, 114, 182, 0.55)';
    const shirtColor = '#cbd5e1';
    const shirtTrim = '#64748b';

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Hair Back / Volume Background */}
        <rect x="5" y="2" width="14" height="4" fill={darkHair} />
        <rect x="4" y="3" width="16" height="5" fill={primaryHair} />
        <rect x="3" y="5" width="18" height="6" fill={primaryHair} />
        <rect x="2" y="7" width="20" height="5" fill={primaryHair} />

        {/* Side Volume / Flared Tuft (tortu style) */}
        <rect x="2" y="8" width="3" height="5" fill={darkHair} />
        <rect x="19" y="8" width="3" height="5" fill={darkHair} />

        {/* Hair Highlights on top */}
        <rect x="7" y="3" width="10" height="1" fill={highlightHair} />
        <rect x="6" y="4" width="4" height="1" fill={highlightHair} />
        <rect x="14" y="4" width="4" height="1" fill={highlightHair} />

        {/* Face Base */}
        <rect x="5" y="8" width="14" height="9" fill={skinTone} />
        <rect x="6" y="17" width="12" height="1" fill={skinShadow} />

        {/* Front Curtain Bangs (Parted in center-right) */}
        <rect x="5" y="7" width="4" height="3" fill={primaryHair} />
        <rect x="6" y="10" width="2" height="2" fill={primaryHair} />
        <rect x="9" y="7" width="2" height="1" fill={primaryHair} />
        <rect x="11" y="7" width="4" height="2" fill={primaryHair} />
        <rect x="15" y="7" width="4" height="4" fill={primaryHair} />
        <rect x="16" y="11" width="2" height="1" fill={primaryHair} />

        {/* Eyes (Dark Anime Pixels with Sparkle) */}
        <rect x="7" y="11" width="2" height="3" fill="#09090b" />
        <rect x="7" y="11" width="1" height="1" fill="#ffffff" />
        <rect x="15" y="11" width="2" height="3" fill="#09090b" />
        <rect x="15" y="11" width="1" height="1" fill="#ffffff" />

        {/* Cute Cheeks */}
        <rect x="5" y="13" width="2" height="1" fill={cheekColor} />
        <rect x="17" y="13" width="2" height="1" fill={cheekColor} />

        {/* Nose / Smile */}
        <rect x="11" y="13" width="2" height="1" fill="#5c2c16" />
        <rect x="11" y="15" width="2" height="1" fill="#6b3614" />

        {/* Shirt Collar / Crewneck */}
        <rect x="7" y="18" width="10" height="3" fill={shirtColor} />
        <rect x="9" y="18" width="6" height="1" fill={shirtTrim} />
        <rect x="6" y="20" width="12" height="4" fill={shirtColor} />
        {/* Accesorios Avatar */}
        {accessory === 'glasses' && (
          <>
            <rect x="6" y="10" width="4" height="3" fill="none" stroke="#1e293b" strokeWidth={0.7} />
            <rect x="14" y="10" width="4" height="3" fill="none" stroke="#1e293b" strokeWidth={0.7} />
            <rect x="10" y="11" width="4" height="0.7" fill="#1e293b" />
            <rect x="6" y="10.5" width="4" height="0.7" fill="rgba(255,255,255,0.5)" />
            <rect x="14" y="10.5" width="4" height="0.7" fill="rgba(255,255,255,0.5)" />
          </>
        )}
        {accessory === 'medal' && (
          <>
            <circle cx="12" cy="19" r="2.2" fill="#facc15" stroke="#a16207" strokeWidth={0.6} />
            <text x="12" y="19.8" fontSize="2" textAnchor="middle" fill="#78350f">★</text>
          </>
        )}
        {accessory === 'cape' && (
          <>
            <rect x="4" y="19" width="16" height="4" fill="#dc2626" />
            <rect x="4" y="19" width="16" height="1" fill="#991b1b" />
          </>
        )}
        {accessory === 'backpack' && (
          <>
            <rect x="8" y="19" width="8" height="5" fill="#eab308" stroke="#92400e" strokeWidth={0.5} />
            <rect x="10" y="20" width="4" height="1" fill="#fde68a" />
          </>
        )}
      </svg>
    );
  }

  // Girl Avatar with Long Flowing Hair and Bow
  const girlHair = hairColor || '#451a03';
  const girlHighlight = '#78350f';
  const ribbonColor = '#fbbf24';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* Long Hair Back flowing down */}
      <rect x="3" y="4" width="18" height="18" fill={girlHair} />
      <rect x="2" y="8" width="20" height="12" fill={girlHair} />

      {/* Head & Bangs */}
      <rect x="5" y="2" width="14" height="4" fill={girlHair} />
      <rect x="6" y="3" width="12" height="1" fill={girlHighlight} />

      {/* Face */}
      <rect x="6" y="8" width="12" height="9" fill="#ffd1a4" />

      {/* Front Bangs & Side Locks */}
      <rect x="5" y="7" width="14" height="3" fill={girlHair} />
      <rect x="5" y="10" width="2" height="4" fill={girlHair} />
      <rect x="17" y="10" width="2" height="4" fill={girlHair} />

      {/* Ribbon Bow */}
      <rect x="15" y="4" width="4" height="2" fill={ribbonColor} />
      <rect x="16" y="3" width="2" height="4" fill="#f59e0b" />

      {/* Eyes with shine */}
      <rect x="8" y="11" width="2" height="3" fill="#0f172a" />
      <rect x="8" y="11" width="1" height="1" fill="#ffffff" />
      <rect x="14" y="11" width="2" height="3" fill="#0f172a" />
      <rect x="14" y="11" width="1" height="1" fill="#ffffff" />

      {/* Cheeks */}
      <rect x="6" y="13" width="2" height="1" fill="rgba(244, 63, 94, 0.6)" />
      <rect x="16" y="13" width="2" height="1" fill="rgba(244, 63, 94, 0.6)" />

      {/* Smile */}
      <rect x="11" y="14" width="2" height="1" fill="#881337" />

      {/* Pink Blouse Collar */}
      <rect x="7" y="18" width="10" height="4" fill="#f43f5e" />
      <rect x="11" y="18" width="2" height="2" fill="#be123c" />
      {/* Accesorios Avatar */}
      {accessory === 'glasses' && (
        <>
          <rect x="7" y="10.5" width="4" height="3" fill="none" stroke="#1e293b" strokeWidth={0.7} />
          <rect x="13" y="10.5" width="4" height="3" fill="none" stroke="#1e293b" strokeWidth={0.7} />
          <rect x="11" y="11.5" width="2" height="0.7" fill="#1e293b" />
          <rect x="7" y="11" width="4" height="0.7" fill="rgba(255,255,255,0.5)" />
          <rect x="13" y="11" width="4" height="0.7" fill="rgba(255,255,255,0.5)" />
        </>
      )}
      {accessory === 'medal' && (
        <>
          <circle cx="12" cy="19" r="2.2" fill="#facc15" stroke="#a16207" strokeWidth={0.6} />
          <text x="12" y="19.8" fontSize="2" textAnchor="middle" fill="#78350f">★</text>
        </>
      )}
      {accessory === 'cape' && (
        <>
          <rect x="4" y="19" width="16" height="4" fill="#ec4899" />
          <rect x="4" y="19" width="16" height="1" fill="#831843" />
        </>
      )}
      {accessory === 'backpack' && (
        <>
          <rect x="8" y="19" width="8" height="5" fill="#ec4899" stroke="#9333ea" strokeWidth={0.5} />
          <rect x="10" y="20" width="4" height="1" fill="#fde68a" />
        </>
      )}
    </svg>
  );
};
