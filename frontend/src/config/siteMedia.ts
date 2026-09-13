/**
 * Centralized Static Media Asset Configuration for Vandana Creations
 * 
 * All media is organized by page/feature under `frontend/public/media/`.
 * To update any image or video:
 * 1. Drop the updated file into `frontend/public/media/<section>/`
 * 2. Commit and push to GitHub — Vercel will update live automatically!
 */

export const SITE_MEDIA = {
  branding: {
    logo: '/media/branding/logo.png',
    logoEmblem: '/media/branding/logo-emblem.png',
  },
  home: {
    heroPhoto: '/media/home/hero-photo.png',
    storyPhoto: '/media/home/story-photo.png',
  },
  about: {
    storyPhoto: '/media/about/about-story.png',
  },
  gallery: {
    bridal: '/media/gallery/bridal-couture.mp4',
    blouse: '/media/gallery/designer-blouse.mp4',
    lehenga: '/media/gallery/lehenga-choli.mp4',
    kurti: '/media/gallery/festive-kurti.mp4',
    gown: '/media/gallery/party-gown.mp4',
    embroidery: '/media/gallery/embroidery-work.mp4',
  },
  services: {
    blouse: '/media/services/blouse-stitching.mp4',
    saree: '/media/services/saree-lehenga.mp4',
    kurti: '/media/services/kurti-stitching.mp4',
    gown: '/media/services/gown-dress.mp4',
    alterations: '/media/services/alterations.mp4',
  },
} as const;
