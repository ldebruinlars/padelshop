# Bouwt een opengewerkt padelracket (druppel) in Blender en rendert de beelden voor "Opbouw bekijken" op de homepage.
# Gebruik in Blender: exec(open("scripts/render-opbouw.py").read()); daarna render(...) per beeld.
# De kopvorm komt uit src/lib/racket-heads.json (dezelfde vorm als op de site), op schaal: racket 45,5 cm.
import bpy, bmesh, json, math
from mathutils import Vector, Matrix

ROOT = r"C:/Users/larsb/Documents/padelshop"
S = 0.455 / 276.0  # meter per svg-eenheid
T_FACE, T_CORE, T_FRAME = 0.0018, 0.034, 0.038
LAYERS = ["Slagvlak", "Kern", "Frame", "Achterkant"]
EXPLODE = {"Slagvlak": 0.26, "Kern": 0.13, "Frame": 0.0, "Handvat": 0.0, "Grip": 0.0, "Achterkant": -0.13}


def reset():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for x in list(coll): coll.remove(x)


def head_points():
    d = json.load(open(f"{ROOT}/src/lib/racket-heads.json"))["druppel"]
    import re
    n = [float(v) for v in re.findall(r"-?[0-9.]+", d)]
    pts = [(n[0], n[1])] + [(n[i + 4], n[i + 5]) for i in range(2, len(n) - 5, 6)]
    if pts[0] == pts[-1]: pts = pts[:-1]
    poly = [((x - 100) * S, (150 - y) * S) for x, y in pts]
    area = sum(poly[i - 1][0] * poly[i][1] - poly[i][0] * poly[i - 1][1] for i in range(len(poly)))
    return poly if area > 0 else poly[::-1]


def to3(x, y): return ((x - 100) * S, (150 - y) * S)


def offset(poly, d):
    out = []
    for i in range(len(poly)):
        a, b, c = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % len(poly)])
        t = (c - a).normalized(); out.append(tuple(b + Vector((t.y, -t.x)) * d))
    return out


def inside(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % len(poly)]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c


def prism(name, poly, z0, h):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, y, z0)) for x, y in poly])
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, vec=(0, 0, h), verts=[g for g in r["geom"] if isinstance(g, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); return ob


def box(name, cx, cy, sx, sy, z0, h, rot=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy, z0 + h / 2))
    ob = bpy.context.active_object; ob.name = name; ob.scale = (sx, sy, h); ob.rotation_euler = (0, 0, rot)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True); return ob


def apply_all(ob):
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)


def boolean(ob, other, op):
    m = ob.modifiers.new(op, "BOOLEAN"); m.object = other; m.operation = op; m.solver = "EXACT"; apply_all(ob)
    bpy.data.objects.remove(other, do_unlink=True)


def holes_in(poly):
    safe = offset(poly, -0.016); out = []; row = 0; y = 0.215
    while y > -0.03:
        x = -0.11 + (0.0 if row % 2 == 0 else 0.0105)
        while x < 0.111:
            if inside((x, y), safe): out.append((x, y))
            x += 0.021
        y -= 0.0185; row += 1
    return out


def perforate(ob, holes, z0, h):
    me = bpy.data.meshes.new("gaten"); bm = bmesh.new()
    for hx, hy in holes:
        bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=0.0052, radius2=0.0052, depth=h + 0.01, matrix=Matrix.Translation((hx, hy, z0 + h / 2)))
    bm.to_mesh(me); bm.free()
    c = bpy.data.objects.new("gaten", me); bpy.context.collection.objects.link(c); boolean(ob, c, "DIFFERENCE")


def material(name, color, rough, coat=0.0, weave=None, stripe=False, bump=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    if "Coat Weight" in b.inputs: b.inputs["Coat Weight"].default_value = coat; b.inputs["Coat Roughness"].default_value = 0.18
    col = None
    if weave:
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Rotation"].default_value[2] = math.radians(45); mp.inputs["Scale"].default_value = (weave[2],) * 3
        ch = nt.nodes.new("ShaderNodeTexChecker"); ch.inputs["Scale"].default_value = 1.0
        ch.inputs["Color1"].default_value = (*weave[0], 1); ch.inputs["Color2"].default_value = (*weave[1], 1)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], ch.inputs["Vector"]); col = ch.outputs["Color"]
    else:
        b.inputs["Base Color"].default_value = (*color, 1)
    if stripe and col is not None:
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value[2] = math.radians(-30)
        sep = nt.nodes.new("ShaderNodeSeparateXYZ"); sub = nt.nodes.new("ShaderNodeMath"); sub.operation = "SUBTRACT"; sub.inputs[1].default_value = 0.06
        ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"; lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = 0.028
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["B"].default_value = (0.94, 0.30, 0.09, 1)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], sep.inputs["Vector"])
        nt.links.new(sep.outputs["Y"], sub.inputs[0]); nt.links.new(sub.outputs[0], ab.inputs[0]); nt.links.new(ab.outputs[0], lt.inputs[0])
        nt.links.new(lt.outputs[0], mix.inputs["Factor"]); nt.links.new(col, mix.inputs["A"]); col = mix.outputs["Result"]
    if col is not None: nt.links.new(col, b.inputs["Base Color"])
    if bump:
        nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 900
        bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump
        nt.links.new(nz.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def build():
    reset()
    head = head_points(); inner = offset(head, -0.0005); holes = holes_in(head)
    back = prism("Achterkant", inner, 0.0012, T_FACE); perforate(back, holes, 0.0012, T_FACE)
    core = prism("Kern", inner, 0.0012 + T_FACE, T_CORE - 2 * T_FACE); perforate(core, holes, 0.0012 + T_FACE, T_CORE - 2 * T_FACE)
    front = prism("Slagvlak", inner, 0.0012 + T_CORE - T_FACE, T_FACE); perforate(front, holes, 0.0012 + T_CORE - T_FACE, T_FACE)
    frame = prism("Frame", offset(head, 0.0075), 0, T_FRAME)
    boolean(frame, prism("binnen", offset(head, -0.0002), -0.01, T_FRAME + 0.02), "DIFFERENCE")
    ax, ay = to3(100, 201)
    for side in (-1, 1):
        sx, sy = to3(100 + side * 31, 168)
        arm = box("arm", (sx + ax) / 2, (sy + ay) / 2, 0.014, math.hypot(sx - ax, sy - ay) + 0.012, 0.002, T_FRAME - 0.004, -math.atan2(sx - ax, sy - ay))
        boolean(frame, arm, "UNION")
    hx, hy = to3(100, 244); handle = box("Handvat", hx, hy, 0.026, 87 * S, 0.006, T_FRAME - 0.012)
    gx, gy = to3(100, 238); grip = box("Grip", gx, gy, 0.0285, 66 * S, 0.0045, T_FRAME - 0.009)
    for o, w in ((handle, 0.008), (grip, 0.009)):
        m = o.modifiers.new("bevel", "BEVEL"); m.width = w; m.segments = 5; apply_all(o)
    mats = {
        "Slagvlak": material("Carbon", None, 0.32, 0.6, ((0.018, 0.018, 0.02), (0.06, 0.06, 0.065), 260), stripe=True),
        "Achterkant": material("Glasvezel", None, 0.55, 0.2, ((0.60, 0.62, 0.62), (0.80, 0.81, 0.80), 220)),
        "Kern": material("EVA", (0.86, 0.80, 0.68), 0.95, bump=0.25),
        "Frame": material("FrameCarbon", None, 0.28, 0.8, ((0.02, 0.02, 0.022), (0.05, 0.05, 0.055), 300)),
        "Handvat": material("Handvat", (0.03, 0.03, 0.03), 0.5),
        "Grip": material("Overgrip", (0.92, 0.91, 0.88), 0.85),
    }
    rig = bpy.data.objects.new("Rig", None); bpy.context.collection.objects.link(rig)
    for n, m in mats.items():
        o = bpy.data.objects[n]; o.data.materials.clear(); o.data.materials.append(m); o.parent = rig
        for p in o.data.polygons: p.use_smooth = False
    rig.rotation_euler = (math.radians(90), 0, 0); rig.location = (0, 0, 0.30)

    sc = bpy.context.scene
    sc.render.engine = "CYCLES"; sc.cycles.samples = 96; sc.cycles.use_denoising = True
    sc.render.film_transparent = True; sc.render.resolution_x, sc.render.resolution_y = 1200, 1400
    sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Base Contrast"
    w = sc.world or bpy.data.worlds.new("World"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.35, 0.35, 0.37, 1); w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35
    target = Vector((0.0, 0.0, 0.29))
    for name, loc, size, energy, color in (("Key", (0.9, -0.9, 0.9), 0.6, 9, (1, 1, 1)), ("Fill", (-0.9, -0.8, 0.4), 0.8, 3, (0.9, 0.93, 1)), ("Rim", (-0.3, 0.8, 0.8), 0.5, 6, (1, 0.9, 0.8))):
        L = bpy.data.lights.new(name, "AREA"); L.size = size; L.energy = energy; L.color = color
        o = bpy.data.objects.new(name, L); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (target - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam")); sc.collection.objects.link(cam); sc.camera = cam
    return len(holes)


def pose(exploded=True, focus=None):
    """exploded: lagen uit elkaar; focus: één laag naar voren, de rest half doorzichtig."""
    for n, dz in EXPLODE.items():
        o = bpy.data.objects[n]; o.location.z = dz if exploded else 0.0
    for n in ["Slagvlak", "Kern", "Frame", "Handvat", "Grip", "Achterkant"]:
        o = bpy.data.objects[n]; group = "Frame" if n in ("Handvat", "Grip") else n
        o.hide_render = False
        dim = focus is not None and group != focus
        for m in o.data.materials:
            if m is None: continue
            b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Alpha"].default_value = 0.18 if dim else 1.0
            m.blend_method = "BLEND" if dim else "OPAQUE"


def aim(exploded=True):
    # Zelfde camera voor beide standen, zodat het samengestelde racket op zijn plek uit elkaar valt
    cam = bpy.data.objects["Cam"]; cam.data.lens = 64
    target = Vector((-0.035, -0.045, 0.215))
    cam.location = (1.05, -1.05, 0.36)
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()


def screen_positions():
    """Middelpunt van elke laag op het beeld (0-1), voor de nummers op de site."""
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene; cam = sc.camera; out = {}
    for n in LAYERS:
        o = bpy.data.objects[n]; bpy.context.view_layer.update()
        cs = [o.matrix_world @ Vector(c) for c in o.bound_box]; c = sum(cs, Vector()) / 8
        if n == "Frame": c = o.matrix_world @ Vector((0.14, 0.02, 0.019))  # op de rand, niet in het gat
        p = world_to_camera_view(sc, cam, c); out[n] = [round(p.x * 100, 1), round((1 - p.y) * 100, 1)]
    return out


def render_all(out_dir):
    """Alle beelden voor de site: samengesteld, uit elkaar, en per laag met die laag naar voren."""
    import os
    os.makedirs(out_dir, exist_ok=True)
    sc = bpy.context.scene; shots = {}
    for name, exploded, focus in [("samen", False, None), ("uit-elkaar", True, None)] + [(f"laag-{l.lower()}", True, l) for l in LAYERS]:
        pose(exploded, focus); aim(exploded)
        sc.render.filepath = f"{out_dir}/{name}.png"; bpy.ops.render.render(write_still=True)
        if name == "uit-elkaar": shots["posities"] = screen_positions()
    pose(True, None)
    return shots
