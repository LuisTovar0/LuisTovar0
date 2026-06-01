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

# Width of a monospace character cell relative to its height. Courier New (the
# font the frontend renders with) has a 0.6em advance, so this value keeps every
# grid truly square on screen: cols * CHAR_ASPECT == rows in pixels.
CHAR_ASPECT = 0.6
# Fraction of the limiting grid dimension the head's bounding box should occupy at
# its largest (home) pose. <1 leaves a small breathing margin.
FILL = 0.94

# Every animation is a square. We only vary the SIZE (row count); the frontend
# picks the tier whose square, at roughly the target font size, fills the shorter
# side of the viewport, so characters stay about the same size across devices.
SIZE_ROWS = [18, 27, 38, 42, 68, 86]

# The head drifts through these waypoints in order, then loops back to the first.
# Each entry is (X, Y, Z), an absolute offset from the head's neutral center
# (negative X = left, positive Y = up; Z is distance from the camera, larger =
# farther/smaller). Every waypoint — including the first — literally moves and
# zooms the head, so editing the first point shifts where the loop starts.
# Add or remove tuples freely — time is divided evenly across all the segments.
# The head is fit to the grid using the closest (smallest-Z) waypoint, so it never
# overflows the square no matter how the loop drifts.
WAYPOINTS = [
    (0.1, -0.1, 1.7),
    (0.6, 0.7, 3.2),
    (-0.3, 0.1, 2.1),
]


def lerp(p1, p2, t):
    return (
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        p1[2] + (p2[2] - p1[2]) * t,
    )


def ease_in_out(t):
    return (1 - math.cos(t * math.pi)) / 2.0


def get_translation(t, aspect_ratio=1.0):
    """The (X, Y, Z) drift path: loops through WAYPOINTS and back to the first,
    eased, with X/Y stretched to fit the aspect ratio."""
    # If wide (aspect > 1), stretch X. If tall (aspect < 1), stretch Y.
    stretch_x = max(1.0, aspect_ratio)
    stretch_y = max(1.0, 1.0 / aspect_ratio)
    pts = [(x * stretch_x, y * stretch_y, z) for (x, y, z) in WAYPOINTS]

    # Divide the [0, 1) cycle into one segment per waypoint; the final segment
    # wraps from the last waypoint back to the first to close the loop.
    n = len(pts)
    seg = min(int(t * n), n - 1)
    local_t = t * n - seg
    return lerp(pts[seg], pts[(seg + 1) % n], ease_in_out(local_t))


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


def _frame_geometry(t, base_triangles, light_dir, aspect_ratio=1.0, translation=None):
    n_palette = len(PALETTE) - 1

    # Add a 15% phase shift so t=0 starts mid-tumble on both axes
    phase = 0.15
    angle_y = math.sin((t + phase) * 2 * math.pi) * math.radians(50)
    angle_x = math.radians(-10) - math.cos((t + phase) * 2 * math.pi) * math.radians(20)

    rot = np.dot(get_rotation_matrix_y(angle_y), get_rotation_matrix_x(angle_x))
    tris = base_triangles @ rot.T

    # Use the drift path, unless an explicit translation is supplied (the reference
    # pass pins the head to a neutral, drift-free center to measure its size there).
    if translation is None:
        translation = get_translation(t, aspect_ratio)
    tx, ty, tz = translation
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
    # Measure the head at a neutral pose — zero X/Y drift, at the closest (largest)
    # Z across the waypoints — so the fit never lets it exceed the grid and every
    # waypoint (including the first) acts as a literal offset from this center.
    z_ref = min(z for (_, _, z) in WAYPOINTS)
    facing, _, px, py, _ = _frame_geometry(
        0.0, base_triangles, light_dir, aspect_ratio, translation=(0.0, 0.0, z_ref)
    )
    fx = px[facing]
    fy = py[facing]
    cx = (fx.max() + fx.min()) / 2
    cy = (fy.max() + fy.min()) / 2
    hw = (fx.max() - fx.min()) / 2
    hh = (fy.max() - fy.min()) / 2
    return cx, cy, hw, hh


def render_frames(cols, rows, base_triangles, light_dir, ref, aspect_ratio):
    cx0, cy0, hw, hh = ref

    # Horizontal anchor for a waypoint at X=0: 0.5 centers it. Waypoint X
    # offsets move the head left/right of this anchor.
    x_offset_pct = 0.5

    # How much width is available either side of the head's center without clipping
    # into the nearer edge (here 0.35 away -> 0.7 of the width).
    safe_width_pct = min(x_offset_pct, 1.0 - x_offset_pct) * 2

    # Fit the head to whichever axis constrains it more. Both terms use `rows`
    # (the grid is square: cols * CHAR_ASPECT ≈ rows) so k is exactly proportional
    # to size and the head + its drift cover the same fraction of every variant.
    k = min(
        rows * FILL / (2 * hh),
        rows * (FILL * safe_width_pct) / (2 * hw)
    )
    kx = k / CHAR_ASPECT
    frames = []

    for f in range(FRAMES):
        t = f / FRAMES
        facing, char_idx, px, py, depth = _frame_geometry(t, base_triangles, light_dir, aspect_ratio)

        # Anchor X=0 at x_offset_pct and Y=0 vertically centered; waypoint offsets
        # (baked into px/py via the translation) move the head from there. Round
        # (not truncate) so the head isn't biased up-left more on smaller grids.
        xs = np.round(cols * x_offset_pct + (px - cx0) * kx).astype(int)
        ys = np.round(rows / 2 + (py - cy0) * k).astype(int)

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
    keep_files = {"manifest.json"}

    for size_idx, rows in enumerate(SIZE_ROWS):
        # Square in screen pixels: cols * CHAR_ASPECT == rows.
        cols = round(rows / CHAR_ASPECT)
        name = f"square_{size_idx}"
        file = f"{name}.json"

        # The grid is square by construction, so the drift path needs no aspect
        # stretch — pass 1.0 so every size animates identically and only the
        # rasterization resolution changes between variants.
        ref = compute_reference(base_triangles, light_dir, 1.0)

        print(f"[{size_idx + 1}/{len(SIZE_ROWS)}] Rendering {name}: {cols}x{rows} ...")
        frames = render_frames(cols, rows, base_triangles, light_dir, ref, 1.0)

        with open(os.path.join(OUTPUT_DIR, file), 'w') as fh:
            json.dump({"w": cols, "h": rows, "frames": frames}, fh)
        manifest.append({"name": name, "w": cols, "h": rows, "file": file})
        keep_files.add(file)

    # Remove stale variant files left over from previous (multi-shape) runs.
    for fn in os.listdir(OUTPUT_DIR):
        if fn.endswith(".json") and fn not in keep_files:
            os.remove(os.path.join(OUTPUT_DIR, fn))

    with open(os.path.join(OUTPUT_DIR, "manifest.json"), 'w') as fh:
        json.dump({"fps": 5, "frames": FRAMES, "variants": manifest}, fh)

    print(f"Done! {len(manifest)} square variants written to {OUTPUT_DIR}/")
