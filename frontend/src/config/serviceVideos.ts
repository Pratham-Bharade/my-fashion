export interface ServiceVideoConfig {
  videoUrl: string;
  poster?: string;
  title: string;
}

/**
 * Centralized Video Directory Configuration
 * Videos stored in `frontend/public/media/services/`
 */
export const SERVICE_VIDEOS: Record<string, ServiceVideoConfig> = {
  'BLOUSE': {
    videoUrl: '/media/services/blouse-stitching.mp4',
    title: 'Designer & Bridal Blouse Crafting',
  },
  'BLOUSES': {
    videoUrl: '/media/services/blouse-stitching.mp4',
    title: 'Designer & Bridal Blouse Crafting',
  },
  'BRIDAL': {
    videoUrl: '/media/services/blouse-stitching.mp4',
    title: 'Bridal Couture & Blouses',
  },
  'TRADITIONAL': {
    videoUrl: '/media/services/saree-lehenga.mp4',
    title: 'Saree Draping & Lehenga Tailoring',
  },
  'SAREE': {
    videoUrl: '/media/services/saree-lehenga.mp4',
    title: 'Saree Pre-Pleating & Draping',
  },
  'LEHENGA': {
    videoUrl: '/media/services/saree-lehenga.mp4',
    title: 'Designer Lehenga Choli',
  },
  'KURTIS': {
    videoUrl: '/media/services/kurti-stitching.mp4',
    title: 'Custom Daily & Festive Kurtis',
  },
  'KURTI': {
    videoUrl: '/media/services/kurti-stitching.mp4',
    title: 'Custom Daily & Festive Kurtis',
  },
  'DRESSES': {
    videoUrl: '/media/services/gown-dress.mp4',
    title: 'Custom Gown & Indo-Western Styling',
  },
  'DRESS': {
    videoUrl: '/media/services/gown-dress.mp4',
    title: 'Custom Gown & Indo-Western Styling',
  },
  'GOWN': {
    videoUrl: '/media/services/gown-dress.mp4',
    title: 'Custom Evening & Party Gowns',
  },
  'ALTERATIONS': {
    videoUrl: '/media/services/alterations.mp4',
    title: 'Precision Fitting & Alterations',
  },
  'ALTERATION': {
    videoUrl: '/media/services/alterations.mp4',
    title: 'Precision Fitting & Alterations',
  },
};

export const getServiceVideo = (category?: string): string => {
  if (!category) return '/media/services/blouse-stitching.mp4';
  const clean = category.trim().toUpperCase();
  const match = SERVICE_VIDEOS[clean];
  return match?.videoUrl || '/media/services/blouse-stitching.mp4';
};
