import os
import urllib.request

DESIGN_VIDEOS = {
    "bridal-couture.mp4": "https://www.w3schools.com/html/mov_bbb.mp4",
    "designer-blouse.mp4": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "lehenga-choli.mp4": "https://raw.githubusercontent.com/mdn/learning-area/main/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4",
    "festive-kurti.mp4": "https://www.w3schools.com/html/movie.mp4",
    "party-gown.mp4": "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "embroidery-work.mp4": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
}

def setup_design_videos():
    dest_dir = os.path.abspath("../frontend/public/videos/designs")
    os.makedirs(dest_dir, exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for filename, url in DESIGN_VIDEOS.items():
        filepath = os.path.join(dest_dir, filename)
        print(f"Fetching {filename}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp, open(filepath, 'wb') as f:
                f.write(resp.read())
            print(f"[SUCCESS] {filename} saved ({os.path.getsize(filepath):,} bytes)")
        except Exception as e:
            print(f"[ERROR] Failed {filename}: {e}")

if __name__ == "__main__":
    setup_design_videos()
