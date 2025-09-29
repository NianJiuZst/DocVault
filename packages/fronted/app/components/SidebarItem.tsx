'use client';

import { ReactNode } from 'react';

export default function SidebarItem({
  iconSrc,
  label,
  isActive = false,
}: {
  iconSrc: string;
  label: string;
  isActive?: boolean;
}) {
  return (
    <button
      className="px-5 py-3.5 rounded-xl transition-all duration-200 w-full flex items-center justify-start gap-4"
      style={{
        color: 'rgb(96, 92, 88)',
        backgroundColor: isActive ? 'rgb(218, 216, 238)' : 'transparent',
        border: 'none',
        transform: isActive ? 'translateX(4px)' : 'translateX(0)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.backgroundColor = 'rgb(218, 216, 238)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/80"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <img src={iconSrc} alt={label} className="w-4 h-4 object-cover" />
      </div>
      <span className="font-medium text-lg tracking-wide whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}