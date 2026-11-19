"""Create bouncing GIF animations from static bean PNGs, keeping the original canvas size."""

from PIL import Image
import math
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")

TOTAL_FRAMES = 12
BOUNCE_PIXELS = 40
FRAME_DURATION = 30  # ms per frame (~33 fps)
SQUASH_AMOUNT = 0.0


def ease_bounce(t):
    return math.sin(t * math.pi)


def make_bouncing_gif(input_path, output_path):
    src = Image.open(input_path).convert("RGBA")
    canvas_w, canvas_h = src.size

    bean_scale = 1 - (BOUNCE_PIXELS / canvas_h)
    bean_w = int(canvas_w * bean_scale)
    bean_h = int(canvas_h * bean_scale)
    base_bean = src.resize((bean_w, bean_h), Image.LANCZOS)

    frames = []
    for i in range(TOTAL_FRAMES):
        t = i / TOTAL_FRAMES
        progress = ease_bounce(t)

        y_offset = int(BOUNCE_PIXELS * (1 - progress))

        squash = 1 - SQUASH_AMOUNT * (1 - progress)
        stretch = 1 + SQUASH_AMOUNT * (1 - progress)

        new_w = int(bean_w * stretch)
        new_h = int(bean_h * squash)
        scaled = base_bean.resize((new_w, new_h), Image.LANCZOS)

        frame = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
        x_pos = (canvas_w - new_w) // 2
        y_pos = (canvas_h - new_h) - y_offset
        frame.paste(scaled, (x_pos, max(0, y_pos)), scaled)
        frames.append(frame)

    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATION,
        loop=0,
        transparency=0,
        disposal=2,
    )
    print(f"Created {output_path} ({os.path.getsize(output_path)} bytes, {TOTAL_FRAMES} frames)")


if __name__ == "__main__":
    make_bouncing_gif(
        os.path.join(ASSETS_DIR, "greenbean.png"),
        os.path.join(ASSETS_DIR, "greenbean_bounce.gif"),
    )
    make_bouncing_gif(
        os.path.join(ASSETS_DIR, "redbean.png"),
        os.path.join(ASSETS_DIR, "redbean_bounce.gif"),
    )
