import { FC } from 'react';

interface IconProps {
  className?: string;
}

export const NetworkIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M17 18a2 2 0 100-4 2 2 0 000 4zM7 6a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
    <path d="M7 22a2 2 0 100-4 2 2 0 000 4zM17 6a2 2 0 100-4 2 2 0 000 4z"/>
    <path d="M7 16L17 16M7 8L17 8"/>
  </svg>
);

export const FieldIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="M12 18c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z"/>
    <path d="M12 14c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z"/>
  </svg>
);

export const TemporalIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

export const QuantumIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="M12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
    <path d="M12 12l4-4m-4 4l-4-4m4 4l4 4m-4-4l-4 4"/>
  </svg>
);

export const PatternIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4z"/>
    <path d="M4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
    <path d="M4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
  </svg>
);

export const SemanticIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z"/>
    <path d="M12 22V12"/>
    <path d="M21 6.5L12 12"/>
    <path d="M3 6.5L12 12"/>
  </svg>
);

export const QueryIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M11 19a8 8 0 100-16 8 8 0 000 16z"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);
