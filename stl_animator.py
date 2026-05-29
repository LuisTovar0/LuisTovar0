import numpy as np
from stl import mesh
import json
import math
import os

# --- Configuration ---
STL_FILE = 'Easter_Island_head.stl'       # Source mesh
OUTPUT_DIR = 'static/animation'           # One JSON file per variant lands here
FRAMES = 18                               # Frames for a full drift cycle
PALETTE = " .,-~:;=!*#$@"                 # Dark -> light shading ramp

# A character cell is about half as wide as it is tall in a monospace font.
CHAR_ASPECT = 0.5
# Fraction of the limiting grid dimension the head's bounding box should occupy at
# its largest (home) pose. <1 leaves a small breathing margin.
FILL = 0.94

# Six grid SHAPES, expressed as screen pixel aspect ratio (width / height).
# These map to common device orientations from ultrawide down to a tall phone.
SHAPES = [
    ("ultrawide", 2.40),
    ("wide", 1.78),
    ("landscape", 1.33),
    ("square", 1.00),
    ("portrait", 0.66),
    ("tall", 0.46),
]
# Six SIZE tiers (row counts). The frontend picks the tier whose grid, at roughly
# the target font size, fills the actual viewport, so characters stay about the
# same size across devices while the animation always fills the screen.
SIZE_ROWS = [18, 27, 42, 38, 68, 86]


def lerp(p1, p2, t):
    return (
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        p1[2] + (p2[2] - p1[2]) * t,
    )


def ease_in_out(t):
    return (1 - math.cos(t * math.pi)) / 2.0


def get_translation(t, aspect_ratio=1.0):
    """The (X, Y, Z) drift path, dynamically stretched to fit the aspect ratio."""
    # If wide (aspect > 1), stretch X. If tall (aspect < 1), stretch Y.
    stretch_x = max(1.0, aspect_ratio)
    stretch_y = max(1.0, 1.0 / aspect_ratio)

    # Base resting position
    pos_center_close = (0.0, 0.0, 2.0)
    
    # Waypoints scaled down to 20% of their original drift distance
    # Original X/Y were -1.5/1.2. Original Z drift was +3.0 (from 2.0 to 5.0).
    pos_top_left_far = (-0.3 * stretch_x, 0.24 * stretch_y, 2.6)
    
    # Original X/Y were -0.7/-0.5. Original Z drift was +0.5 (from 2.0 to 2.5).
    pos_bot_left_mid = (-0.14 * stretch_x, -0.1 * stretch_y, 2.1)

    if t < 0.333:
        local_t = t / 0.333
        return lerp(pos_center_close, pos_top_left_far, ease_in_out(local_t))
    elif t < 0.666:
        local_t = (t - 0.333) / 0.333
        return lerp(pos_top_left_far, pos_bot_left_mid, ease_in_out(local_t))
    else:
        local_t = (t - 0.666) / 0.334
        return lerp(pos_bot_left_mid, pos_center_close, ease_in_out(local_t))


def normalize_mesh(triangles):
    vertices = triangles.reshape(-1, 3)
    min_bounds = vertices.min(axis=0)
    max_bounds = vertices.max(axis=0)
    center = (min_bounds + max_bounds) / 2.0
    scale = np.max(max_bounds - min_bounds)
    return (triangles - center) / (scale * 0.8)


def get_rotation_matrix_y(angle):
    c, s = math.cos(angle), math.sin(angle)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def get_rotation_matrix_x(angle):
    c, s = math.cos(angle), math.sin(angle)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])

def _frame_geometry(t, base_triangles, light_dir, aspect_ratio=1.0):
    n_palette = len(PALETTE) - 1
    
    # Add a 15% phase shift so t=0 starts mid-tumble on both axes
    phase = 0.15 
    angle_y = math.sin((t + phase) * 2 * math.pi) * math.radians(50)
    angle_x = math.radians(-10) - math.cos((t + phase) * 2 * math.pi) * math.radians(20)
    
    rot = np.dot(get_rotation_matrix_y(angle_y), get_rotation_matrix_x(angle_x))
    tris = base_triangles @ rot.T                                          

    # Pass aspect ratio down to the translation path
    tx, ty, tz = get_translation(t, aspect_ratio)
    world = tris + np.array([tx, ty, tz])

    e1 = tris[:, 1] - tris[:, 0]
    e2 = tris[:, 2] - tris[:, 0]
    normals = np.cross(e1, e2)
    lengths = np.linalg.norm(normals, axis=1)
    safe = lengths > 0
    unit = np.zeros_like(normals)
    unit[safe] = normals[safe] / lengths[safe, None]
    illum = np.clip(unit @ light_dir, 0, None)
    char_idx = np.clip(np.round(illum * n_palette).astype(int), 0, n_palette)
    facing = safe & (unit[:, 2] <= 0)

    zc = np.maximum(0.1, world[:, :, 2])
    px = world[:, :, 0] / zc * 1.5
    py = -world[:, :, 1] / zc * 1.5
    depth = -world[:, :, 2]
    return facing, char_idx, px, py, depth


def compute_reference(base_triangles, light_dir, aspect_ratio):
    # Pass aspect_ratio to ensure bounding box fits the new adaptive start pose
    facing, _, px, py, _ = _frame_geometry(0.0, base_triangles, light_dir, aspect_ratio)
    fx = px[facing]
    fy = py[facing]
    cx = (fx.max() + fx.min()) / 2
    cy = (fy.max() + fy.min()) / 2
    hw = (fx.max() - fx.min()) / 2
    hh = (fy.max() - fy.min()) / 2
    return cx, cy, hw, hh

def render_frames(cols, rows, base_triangles, light_dir, ref, aspect_ratio):
    cx0, cy0, hw, hh = ref
    
    # 1. Define your center offset (0.7 effectively means moving 20% to the right)
    x_offset_pct = 0.7
    
    # 2. Calculate how much width is safely available without clipping into the wall.
    # If centered at 0.7, the closest edge is 0.3 away. Max safe width is 0.6 (60%).
    safe_width_pct = min(x_offset_pct, 1.0 - x_offset_pct) * 2
    
    # 3. Apply safe_width_pct to the column constraint so it shrinks properly on tall screens
    k = min(
        rows * FILL / (2 * hh), 
        cols * (FILL * safe_width_pct) * CHAR_ASPECT / (2 * hw)
    )
    kx = k / CHAR_ASPECT 
    frames = []

    for f in range(FRAMES):
        t = f / FRAMES
        facing, char_idx, px, py, depth = _frame_geometry(t, base_triangles, light_dir, aspect_ratio)

        # 4. Apply the offset dynamically based on our variable
        xs = (cols * x_offset_pct + (px - cx0) * kx).astype(int)      
        ys = (rows / 2 + (py - cy0) * k).astype(int)

        z_buffer = np.full((rows, cols), -np.inf)
        screen = [[' '] * cols for _ in range(rows)]

        for i in np.nonzero(facing)[0]:
            x0, x1, x2 = int(xs[i, 0]), int(xs[i, 1]), int(xs[i, 2])
            y0, y1, y2 = int(ys[i, 0]), int(ys[i, 1]), int(ys[i, 2])
            d0, d1, d2 = depth[i, 0], depth[i, 1], depth[i, 2]

            min_x = max(0, min(x0, x1, x2))
            max_x = min(cols - 1, max(x0, x1, x2))
            min_y = max(0, min(y0, y1, y2))
            max_y = min(rows - 1, max(y0, y1, y2))

            area = (x2 - x0) * (y1 - y0) - (y2 - y0) * (x1 - x0)
            if area == 0:
                continue
            shade = PALETTE[char_idx[i]]

            for y in range(min_y, max_y + 1):
                for x in range(min_x, max_x + 1):
                    w0 = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1)
                    w1 = (x - x2) * (y0 - y2) - (y - y2) * (x0 - x2)
                    w2 = (x - x0) * (y1 - y0) - (y - y0) * (x1 - x0)
                    if (w0 >= 0 and w1 >= 0 and w2 >= 0) or (w0 <= 0 and w1 <= 0 and w2 <= 0):
                        z = (w0 * d0 + w1 * d1 + w2 * d2) / area
                        if z > z_buffer[y][x]:
                            z_buffer[y][x] = z
                            screen[y][x] = shade

        frames.append(["".join(row) for row in screen])

    return frames

if __name__ == "__main__":
    print("Loading STL...")
    stl_mesh = mesh.Mesh.from_file(STL_FILE)
    base_triangles = normalize_mesh(stl_mesh.vectors)

    base_triangles = np.dot(base_triangles, get_rotation_matrix_x(-math.pi / 2).T)

    light_dir = np.array([0.5, 0.5, -1.0])
    light_dir = light_dir / np.linalg.norm(light_dir)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    manifest = []

    for shape_idx, (shape_name, pixel_aspect) in enumerate(SHAPES):
        for size_idx, rows in enumerate(SIZE_ROWS):
            cols = round(rows * pixel_aspect / CHAR_ASPECT)
            name = f"{shape_name}_{size_idx}"
            
            # 1. Calculate the true grid aspect ratio
            grid_aspect_ratio = (cols * CHAR_ASPECT) / rows
            
            # 2. Compute reference bounding box for this specific ratio
            ref = compute_reference(base_triangles, light_dir, grid_aspect_ratio)

            print(f"[{shape_idx*len(SHAPES)+size_idx+1}/{len(SHAPES) * len(SIZE_ROWS)}] Rendering {name}: {cols}x{rows} ...")
            
            # 3. Pass it to the renderer
            frames = render_frames(cols, rows, base_triangles, light_dir, ref, grid_aspect_ratio)
            
            path = os.path.join(OUTPUT_DIR, f"{name}.json")
            with open(path, 'w') as fh:
                json.dump({"w": cols, "h": rows, "frames": frames}, fh)
            manifest.append({
                "name": name,
                "shape": shape_name,
                "pixelAspect": pixel_aspect,
                "w": cols,
                "h": rows,
                "file": f"{name}.json",
            })

    with open(os.path.join(OUTPUT_DIR, "manifest.json"), 'w') as fh:
        json.dump({"fps": 5, "frames": FRAMES, "variants": manifest}, fh)

    print(f"Done! {len(manifest)} variants written to {OUTPUT_DIR}/")
