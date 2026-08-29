export interface ServiceVideoConfig {
  videoUrl: string;
  poster?: string;
  title: string;
}

/**
 * Centralized Video Directory Configuration
 * Videos stored in `frontend/public/videos/services/`
 */
export const SERVICE_VIDEOS: Record<string, ServiceVideoConfig> = {
  'BLOUSE': {
    videoUrl: '/videos/services/blouse-stitching.mp4',
    title: 'Designer & Bridal Blouse Crafting',
  },
  'BLOUSES': {
    videoUrl: '/videos/services/blouse-stitching.mp4',
    title: 'Designer & Bridal Blouse Crafting',
  },
  'BRIDAL': {
    videoUrl: '/videos/services/blouse-stitching.mp4',
    title: 'Bridal Couture & Blouses',
  },
  'TRADITIONAL': {
    videoUrl: '/videos/services/saree-lehenga.mp4',
    title: 'Saree Draping & Lehenga Tailoring',
  },
  'SAREE': {
    videoUrl: '/videos/services/saree-lehenga.mp4',
    title: 'Saree Pre-Pleating & Draping',
  },
  'LEHENGA': {
    videoUrl: '/videos/services/saree-lehenga.mp4',
    title: 'Designer Lehenga Choli',
  },
  'KURTIS': {
    videoUrl: '/videos/services/kurti-stitching.mp4',
    title: 'Custom Daily & Festive Kurtis',
  },
  'KURTI': {
    videoUrl: '/videos/services/kurti-stitching.mp4',
    title: 'Custom Daily & Festive Kurtis',
  },
  'DRESSES': {
    videoUrl: '/videos/services/gown-dress.mp4',
    title: 'Custom Gown & Indo-Western Styling',
  },
  'DRESS': {
    videoUrl: '/videos/services/gown-dress.mp4',
    title: 'Custom Gown & Indo-Western Styling',
  },
  'GOWN': {
    videoUrl: '/videos/services/gown-dress.mp4',
    title: 'Custom Evening & Party Gowns',
  },
  'ALTERATIONS': {
    videoUrl: '/videos/services/alterations.mp4',
    title: 'Precision Fitting & Alterations',
  },
  'ALTERATION': {
    videoUrl: '/videos/services/alterations.mp4',
    title: 'Precision Fitting & Alterations',
  },
};

export const getServiceVideo = (category?: string): string => {
  if (!category) return '/videos/services/blouse-stitching.mp4';
  const clean = category.trim().toUpperCase();
  const match = SERVICE_VIDEOS[clean];
  return match?.videoUrl || '/videos/services/blouse-stitching.mp4';
};
