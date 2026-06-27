import React from "react";
import { Send, Music, Globe, Share2, Tv } from "lucide-react";

interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: number;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = "",
  size = 20,
}) => {
  const normPlatform = platform.toLowerCase().trim();

  if (normPlatform.includes("youtube") || normPlatform.includes("yt")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`text-[#FF0000] shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (normPlatform.includes("instagram") || normPlatform.includes("ig")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-[#E1306C] shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (normPlatform.includes("facebook") || normPlatform.includes("fb")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`text-[#1877F2] shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (normPlatform.includes("twitter") || normPlatform.includes("x.com") || normPlatform.includes(" x ")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`text-[#000000] dark:text-white shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (normPlatform.includes("telegram") || normPlatform.includes("tg")) {
    return <Send className={`text-[#0088cc] ${className}`} size={size} />;
  }
  if (normPlatform.includes("tiktok") || normPlatform.includes("tt")) {
    return <Music className={`text-[#010101] dark:text-white ${className}`} size={size} />;
  }
  if (normPlatform.includes("spotify")) {
    return <Tv className={`text-[#1DB954] ${className}`} size={size} />;
  }
  if (normPlatform.includes("linkedin")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`text-[#0077B5] shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }
  if (normPlatform.includes("website") || normPlatform.includes("traffic")) {
    return <Globe className={`text-indigo-500 ${className}`} size={size} />;
  }

  return <Share2 className={`text-primary-light ${className}`} size={size} />;
};

export default PlatformIcon;
