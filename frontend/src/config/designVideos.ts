export interface DesignVideoConfig {
  videoUrl: string;
  poster?: string;
  title: string;
}

/**
 * Centralized Design & Gallery Video Directory Configuration
 * To replace or add any design video in future:
 * 1. Place your MP4/WebM video file into `frontend/public/videos/designs/`
 * 2. Update or verify the filename mapping below!
 */
export const DESIGN_VIDEOS: Record<string, DesignVideoConfig> = {
  'BRIDAL': {
    videoUrl: '/videos/designs/bridal-couture.mp4',
    title: 'Bridal Couture & Royal Silks',
  },
  'BLOUSE': {
    videoUrl: '/videos/designs/designer-blouse.mp4',
    title: 'Designer Blouse & Embroidery',
  },
  'LEHENGA': {
    videoUrl: '/videos/designs/lehenga-choli.mp4',
    title: 'Bridal & Festive Lehenga Choli',
  },
  'KURTI': {
    videoUrl: '/videos/designs/festive-kurti.mp4',
    title: 'Contemporary & Traditional Kurtis',
  },
  'KURTIS': {
    videoUrl: '/videos/designs/festive-kurti.mp4',
    title: 'Contemporary & Traditional Kurtis',
  },
  'GOWN': {
    videoUrl: '/videos/designs/party-gown.mp4',
    title: 'Flared Anarkali & Party Gowns',
  },
  'DRESS': {
    videoUrl: '/videos/designs/party-gown.mp4',
    title: 'Custom Gowns & Indo-Western Dresses',
  },
  'EMBROIDERY': {
    videoUrl: '/videos/designs/embroidery-work.mp4',
    title: 'Intricate Zardozi & Maggam Work',
  },
};

export const getDesignVideo = (category?: string): string => {
  if (!category) return '/videos/designs/bridal-couture.mp4';
  const clean = category.trim().toUpperCase();
  const match = DESIGN_VIDEOS[clean];
  return match?.videoUrl || '/videos/designs/bridal-couture.mp4';
};
