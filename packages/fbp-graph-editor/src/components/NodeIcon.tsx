import React from 'react';
import {
  FiArrowRight,
  FiArrowLeft,
  FiSettings,
  FiFile,
  FiFileText,
  FiType,
  FiSquare,
  FiHash,
  FiPlus,
  FiX,
  FiCircle,
  FiZap,
  FiLink,
} from 'react-icons/fi';
import { SiGraphql } from 'react-icons/si';
import { TbBraces, TbQuote, TbCursorText } from 'react-icons/tb';

interface NodeIconProps {
  icon: string;
  size?: number;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'arrow-right': FiArrowRight,
  'arrow-left': FiArrowLeft,
  'settings': FiSettings,
  'file': FiFile,
  'file-text': FiFileText,
  'text-cursor': TbCursorText,
  'square': FiSquare,
  'type': FiType,
  'hash': FiHash,
  'plus': FiPlus,
  'x': FiX,
  'circle': FiCircle,
  'braces': TbBraces,
  'zap': FiZap,
  'quote': TbQuote,
  'link': FiLink,
  'graphql': SiGraphql,
};

export function NodeIcon({ icon, size = 14, className = '' }: NodeIconProps) {
  const IconComponent = iconMap[icon];
  
  if (!IconComponent) {
    return <span className={className}>{icon}</span>;
  }
  
  return <IconComponent size={size} className={className} />;
}

export function NodeIconSvg({ icon, size = 11 }: { icon: string; size?: number }) {
  const iconPaths: Record<string, string> = {
    'arrow-right': 'M5 12h14M12 5l7 7-7 7',
    'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
    'settings': 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z',
    'file': 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7',
    'file-text': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    'text-cursor': 'M6 4v16 M18 4v16 M6 12h12',
    'square': 'M3 3h18v18H3z',
    'type': 'M4 7V4h16v3 M9 20h6 M12 4v16',
    'hash': 'M4 9h16 M4 15h16 M10 3v18 M14 3v18',
    'plus': 'M12 5v14 M5 12h14',
    'x': 'M18 6L6 18 M6 6l12 12',
    'circle': 'M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0',
    'braces': 'M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5a2 2 0 002 2h1 M16 3h1a2 2 0 012 2v5a2 2 0 002 2 2 2 0 00-2 2v5a2 2 0 01-2 2h-1',
    'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    'quote': 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z',
    'link': 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    'graphql': 'M12 2L2 7v10l10 5 10-5V7L12 2z M12 22V12 M2 7l10 5 10-5',
  };

  const path = iconPaths[icon];
  
  if (!path) {
    return (
      <text
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize={size}
        fontFamily="system-ui, sans-serif"
      >
        {icon}
      </text>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'rgba(255,255,255,0.7)' }}
    >
      <path d={path} />
    </svg>
  );
}
