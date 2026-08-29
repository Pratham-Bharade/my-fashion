import os
import urllib.request

VIDEOS = {
    "blouse-stitching.mp4": "https://www.w3schools.com/html/mov_bbb.mp4",
    "saree-lehenga.mp4": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "kurti-stitching.mp4": "https://raw.githubusercontent.com/mdn/learning-area/main/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4",
    "gown-dress.mp4": "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "alterations.mp4": "https://www.w3schools.com/html/movie.mp4",
}

def download_diverse_videos():
    dest_dir = os.path.abspath("../frontend/public/videos/services")
    os.makedirs(dest_dir, exist_ok=True)
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for filename, url in VIDEOS.items():
        filepath = os.path.join(dest_dir, filename)
        print(f"Fetching {filename} from {url}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp, open(filepath, 'wb') as f:
                f.write(resp.read())
            print(f"[SUCCESS] {filename} saved ({os.path.getsize(filepath):,} bytes)")
        except Exception as e:
            print(f"[ERROR] Failed {filename}: {e}")

if __name__ == "__main__":
    download_diverse_videos()
