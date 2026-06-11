package com.sdt.testagent;

import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.watabou.gltextures.SmartTexture;
import com.watabou.gltextures.TextureCache;
import com.watabou.noosa.BitmapText;
import com.watabou.noosa.Camera;
import com.watabou.noosa.Gizmo;
import com.watabou.noosa.Group;
import com.watabou.noosa.Image;
import com.watabou.noosa.Scene;
import com.watabou.noosa.Visual;
import com.watabou.utils.PointF;

import org.json.JSONArray;
import org.json.JSONObject;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class SceneGraphDumper {

    // Cached reflection handles
    private static Field groupMembersField;
    static {
        try {
            groupMembersField = Group.class.getDeclaredField("members");
            groupMembersField.setAccessible(true);
        } catch (Exception e) {
            System.err.println("Failed to access Group.members: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private static ArrayList<Gizmo> getMembers(Group g) {
        if (groupMembersField == null || g == null) return new ArrayList<>();
        try {
            return (ArrayList<Gizmo>) groupMembersField.get(g);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public static JSONObject dumpScene() {
        JSONObject result = new JSONObject();

        Scene scene = com.watabou.noosa.Game.scene();
        if (scene == null) {
            result.put("type", JSONObject.NULL);
            result.put("camera", JSONObject.NULL);
            result.put("cameras", new JSONArray());
            result.put("elements", new JSONArray());
            return result;
        }

        result.put("type", scene.getClass().getSimpleName());

        Camera mainCam = Camera.main;
        if (mainCam != null) {
            JSONObject camInfo = new JSONObject();
            camInfo.put("x", mainCam.x);
            camInfo.put("y", mainCam.y);
            camInfo.put("zoom", mainCam.zoom);
            camInfo.put("width", mainCam.width);
            camInfo.put("height", mainCam.height);
            camInfo.put("scrollX", mainCam.scroll.x);
            camInfo.put("scrollY", mainCam.scroll.y);
            camInfo.put("screenWidth", (int)mainCam.screenWidth());
            camInfo.put("screenHeight", (int)mainCam.screenHeight());
            result.put("camera", camInfo);
        } else {
            result.put("camera", JSONObject.NULL);
        }

        JSONArray cameras = new JSONArray();
        try {
            Field allField = Camera.class.getDeclaredField("all");
            allField.setAccessible(true);
            ArrayList<Camera> allCams = (ArrayList<Camera>) allField.get(null);
            if (allCams != null) {
                for (Camera cam : allCams) {
                    if (cam == null) continue;
                    JSONObject c = new JSONObject();
                    boolean isMain = (cam == Camera.main);
                    c.put("name", isMain ? "main" : cam.getClass().getSimpleName() + "@" + System.identityHashCode(cam));
                    c.put("x", cam.x);
                    c.put("y", cam.y);
                    c.put("zoom", cam.zoom);
                    c.put("width", cam.width);
                    c.put("height", cam.height);
                    c.put("scrollX", cam.scroll.x);
                    c.put("scrollY", cam.scroll.y);
                    c.put("screenWidth", (int)cam.screenWidth());
                    c.put("screenHeight", (int)cam.screenHeight());
                    cameras.put(c);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to access Camera.all: " + e.getMessage());
        }
        result.put("cameras", cameras);

        JSONArray elements = new JSONArray();
        walkGroup(scene, elements, "root", 0);
        result.put("elements", elements);

        return result;
    }

    private static void walkGroup(Group group, JSONArray elements, String parentId, int depth) {
        if (group == null) return;

        JSONObject groupElem = buildVisualElement(group, parentId);
        if (groupElem != null) {
            groupElem.put("children", group.length);
            elements.put(groupElem);
        }

        ArrayList<Gizmo> members = getMembers(group);
        if (members == null || members.isEmpty()) return;

        int memberCount = members.size();
        String groupId = (groupElem != null) ? groupElem.getString("id") : parentId;

        for (int i = 0; i < memberCount; i++) {
            Gizmo g = members.get(i);
            if (g == null || !g.exists) continue;

            if (g instanceof Group) {
                walkGroup((Group) g, elements, groupId, depth + 1);
            } else if (g instanceof Image) {
                JSONObject imgEl = buildImageElement((Image) g, groupId);
                if (imgEl != null) {
                    elements.put(imgEl);
                }
            } else if (g instanceof BitmapText) {
                JSONObject txtEl = buildBitmapTextElement((BitmapText) g, groupId);
                if (txtEl != null) {
                    elements.put(txtEl);
                }
            } else if (g instanceof Visual) {
                JSONObject visEl = buildVisualElement((Visual) g, groupId);
                if (visEl != null) {
                    elements.put(visEl);
                }
            }
        }
    }

    private static String generateId(Gizmo g, String parentId) {
        String className = g.getClass().getSimpleName();
        return className + "@" + System.identityHashCode(g);
    }

    private static JSONObject buildVisualElement(Visual v, String parentId) {
        if (v == null || !v.exists) return null;

        JSONObject el = new JSONObject();
        el.put("id", generateId(v, parentId));
        el.put("type", v.getClass().getSimpleName());
        el.put("x", v.x);
        el.put("y", v.y);
        el.put("width", v.width);
        el.put("height", v.height);
        el.put("scaleX", v.scale.x);
        el.put("scaleY", v.scale.y);
        el.put("angle", v.angle);
        el.put("visible", v.visible);

        Camera cam = v.camera();
        if (cam != null) {
            el.put("camera", (cam == Camera.main) ? "main" : cam.getClass().getSimpleName() + "@" + System.identityHashCode(cam));
        } else {
            el.put("camera", JSONObject.NULL);
        }

        JSONObject tint = new JSONObject();
        tint.put("rm", v.rm);
        tint.put("gm", v.gm);
        tint.put("bm", v.bm);
        tint.put("am", v.am);
        tint.put("ra", v.ra);
        tint.put("ga", v.ga);
        tint.put("ba", v.ba);
        tint.put("aa", v.aa);
        el.put("tint", tint);

        return el;
    }

    private static JSONObject buildImageElement(Image img, String parentId) {
        if (img == null || !img.exists) return null;

        JSONObject el = buildVisualElement(img, parentId);
        if (el == null) return null;
        el.put("type", "Image");

        if (img.texture != null) {
            String texName = resolveTextureName(img.texture);
            el.put("texture", texName != null ? texName : img.texture.getClass().getSimpleName() + "@" + System.identityHashCode(img.texture));
        } else {
            el.put("texture", JSONObject.NULL);
        }

        if (img.frame != null) {
            JSONObject frame = new JSONObject();
            if (img.texture != null) {
                int texW = img.texture.width;
                int texH = img.texture.height;
                frame.put("x", (int) (img.frame.left * texW));
                frame.put("y", (int) (img.frame.top * texH));
                frame.put("width", (int) (img.frame.width() * texW));
                frame.put("height", (int) (img.frame.height() * texH));
            } else {
                frame.put("x", 0);
                frame.put("y", 0);
                frame.put("width", (int) img.width);
                frame.put("height", (int) img.height);
            }
            el.put("frame", frame);
        }

        return el;
    }

    private static JSONObject buildBitmapTextElement(BitmapText txt, String parentId) {
        if (txt == null || !txt.exists) return null;

        JSONObject el = buildVisualElement(txt, parentId);
        if (el == null) return null;
        el.put("type", "BitmapText");

        String textContent = txt.text();
        el.put("text", textContent != null ? textContent : "");

        BitmapText.Font font = txt.font();
        if (font != null) {
            el.put("font", font.getClass().getSimpleName() + "@" + System.identityHashCode(font));
            if (font.texture != null) {
                String texName = resolveTextureName(font.texture);
                if (texName != null) {
                    el.put("fontTexture", texName);
                }
            }
        } else {
            el.put("font", JSONObject.NULL);
        }

        return el;
    }

    private static String resolveTextureName(SmartTexture texture) {
        try {
            Field allField = TextureCache.class.getDeclaredField("all");
            allField.setAccessible(true);
            HashMap<Object, SmartTexture> all = (HashMap<Object, SmartTexture>) allField.get(null);
            if (all != null) {
                for (Map.Entry<Object, SmartTexture> entry : all.entrySet()) {
                    if (entry.getValue() == texture) {
                        Object key = entry.getKey();
                        if (key != null) {
                            return key.toString();
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to resolve texture name: " + e.getMessage());
        }
        return null;
    }
}
