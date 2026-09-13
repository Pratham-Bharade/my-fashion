export interface DesignVideoConfig {
  videoUrl: string;
  poster?: string;
  title: string;
}

/**
 * Centralized Design & Gallery Video Directory Configuration
 * Videos stored in `frontend/public/media/gallery/`
 */
export const DESIGN_VIDEOS: Record<string, DesignVideoConfig> = {
  'BRIDAL': {
    videoUrl: '/media/gallery/bridal-couture.mp4',
    title: 'Bridal Couture & Royal Silks',
  },
  'BLOUSE': {
    videoUrl: '/media/gallery/designer-blouse.mp4',
    title: 'Designer Blouse & Embroidery',
  },
  'LEHENGA': {
    videoUrl: '/media/gallery/lehenga-choli.mp4',
    title: 'Bridal & Festive Lehenga Choli',
  },
  'KURTI': {
    videoUrl: '/media/gallery/festive-kurti.mp4',
    title: 'Contemporary & Traditional Kurtis',
  },
  'KURTIS': {
    videoUrl: '/media/gallery/festive-kurti.mp4',
    title: 'Contemporary & Traditional Kurtis',
  },
  'GOWN': {
    videoUrl: '/media/gallery/party-gown.mp4',
    title: 'Flared Anarkali & Party Gowns',
  },
  'DRESS': {
    videoUrl: '/media/gallery/party-gown.mp4',
    title: 'Custom Gowns & Indo-Western Dresses',
  },
  'EMBROIDERY': {
    videoUrl: '/media/gallery/embroidery-work.mp4',
    title: 'Intricate Zardozi & Maggam Work',
  },
};

export const getDesignVideo = (category?: string): string => {
  if (!category) return '/media/gallery/bridal-couture.mp4';
  const clean = category.trim().toUpperCase();
  const match = DESIGN_VIDEOS[clean];
  return match?.videoUrl || '/media/gallery/bridal-couture.mp4';
};
