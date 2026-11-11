import cv2, os
video_path = r"C:\Users\33921\Doubao\chats\2026-11-10\new-chat\cyberpunk-2077\_ref-video.mp4"
out_dir = r"C:\Users\33921\Doubao\chats\2026-11-10\new-chat\cyberpunk-2077\_ref-frames"
os.makedirs(out_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"FPS: {fps}, Total frames: {total}, Size: {w}x{h}, Duration: {total/fps:.1f}s")

# Extract 6 evenly spaced frames
n_frames = 6
for i in range(n_frames):
    frame_idx = int(total * i / (n_frames - 1)) if n_frames > 1 else 0
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if ret:
        out_path = os.path.join(out_dir, f"frame_{i:02d}.jpg")
        cv2.imwrite(out_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        print(f"Saved frame {i} (idx={frame_idx}) -> {out_path}")
cap.release()
