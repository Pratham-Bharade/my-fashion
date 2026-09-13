# Vandana Creations - Media Directory Guide

This folder contains all static media (images, logos, and videos) organized per page/feature.
The admin can easily update or replace any file according to new market trends without changing any code!

---

## Directory Structure

```
frontend/public/media/
├── branding/       # Site logos, emblems, favicons
│   ├── logo.png
│   ├── logo-emblem.png
│   └── README.md
│
├── home/           # Homepage hero, highlights, promo cards
│   ├── hero-photo.png
│   ├── story-photo.png
│   └── README.md
│
├── gallery/        # Gallery & Design category preview videos (MP4)
│   ├── bridal-couture.mp4
│   ├── designer-blouse.mp4
│   ├── lehenga-choli.mp4
│   ├── festive-kurti.mp4
│   ├── party-gown.mp4
│   ├── embroidery-work.mp4
│   └── README.md
│
├── services/       # Tailoring Services looping demo videos (MP4)
│   ├── blouse-stitching.mp4
│   ├── saree-lehenga.mp4
│   ├── kurti-stitching.mp4
│   ├── gown-dress.mp4
│   ├── alterations.mp4
│   └── README.md
│
└── about/          # About Us & Atelier heritage photos
    ├── about-story.png
    └── README.md
```

---

## How to Update Media

1. **Replace the file**: Save your new image/video with the exact same filename and format (e.g. `hero-photo.png` or `blouse-stitching.mp4`).
2. **Commit & Push to GitHub**:
   ```bash
   git add frontend/public/media/
   git commit -m "Update media for new collection"
   git push origin main
   ```
3. Vercel automatically deploys the updated photos and videos to the live website within 60 seconds!
