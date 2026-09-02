"""撮影 PNG を切り出し → マスク → WebP 化する。

使い方:
  python3 crop_mask.py jobs.json
jobs.json の形式（座標は原寸 px）:
  {"out_dir": "src/assets/screenshots",
   "jobs": [{"name": "settings-models", "src": "shots/02_model_0.png",
             "crop": [x0, y0, x1, y1], "mask": [[x0, y0, x1, y1], ...]}]}
マスクは背景色（矩形周囲の最頻色）で塗る。cwebp -q 85、200KB 超なら -q 80。
Pillow が要る: uv run --with pillow python3 crop_mask.py jobs.json
"""
import json
import os
import subprocess
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from mask import run as mask_run  # noqa: E402


def main(path):
    cfg = json.load(open(path))
    out_dir = cfg["out_dir"]
    work = cfg.get("work_dir", "hermes-audit-work")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(work, exist_ok=True)
    for job in cfg["jobs"]:
        im = Image.open(job["src"]).convert("RGB")
        if job.get("crop"):
            im = im.crop(job["crop"])
        cropped = os.path.join(work, f"{job['name']}.crop.png")
        im.save(cropped)
        masked = os.path.join(work, f"{job['name']}.masked.png")
        size = mask_run(cropped, masked, job.get("mask", []), scale=1)
        out = os.path.join(out_dir, f"{job['name']}.webp")
        quality = 85
        for _ in range(2):
            subprocess.run(["cwebp", "-quiet", "-q", str(quality), masked, "-o", out], check=True)
            if os.path.getsize(out) <= 200 * 1024:
                break
            quality = 80
        print(f"{job['name']:40s} {size[0]}x{size[1]} q{quality} {os.path.getsize(out)//1024}KB")


if __name__ == "__main__":
    main(sys.argv[1])
