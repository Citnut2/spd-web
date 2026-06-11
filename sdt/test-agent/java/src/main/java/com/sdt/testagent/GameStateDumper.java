package com.sdt.testagent;

import com.shatteredpixel.shatteredpixeldungeon.Dungeon;
import com.shatteredpixel.shatteredpixeldungeon.GamesInProgress;
import com.shatteredpixel.shatteredpixeldungeon.actors.Actor;
import com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob;
import com.shatteredpixel.shatteredpixeldungeon.items.Heap;
import com.shatteredpixel.shatteredpixeldungeon.items.Item;

import org.json.JSONArray;
import org.json.JSONObject;

public class GameStateDumper {

    public static JSONObject dumpState(String checkpoint) {
        JSONObject state = new JSONObject();

        try {
            state.put("seed", Dungeon.customSeedText != null ? Dungeon.customSeedText : String.valueOf(Dungeon.seed));
        } catch (Exception e) {
            state.put("seed", "uninitialized");
        }
        state.put("depth", Dungeon.depth);
        state.put("turn", Actor.now());
        state.put("checkpoint", checkpoint);

        JSONObject hero = new JSONObject();
        try {
            hero.put("pos", Dungeon.hero.pos);
            hero.put("HP", Dungeon.hero.HP);
            hero.put("HT", Dungeon.hero.HT);
            hero.put("STR", Dungeon.hero.STR());
            hero.put("class", GamesInProgress.selectedClass.name());
            hero.put("level", Dungeon.hero.lvl);
            hero.put("XP", Dungeon.hero.exp);
        } catch (Exception e) {
            hero.put("pos", -1);
            hero.put("HP", 0);
            hero.put("HT", 0);
            hero.put("STR", 0);
            hero.put("class", "unknown");
            hero.put("level", 0);
            hero.put("XP", 0);
        }
        hero.put("weapon", JSONObject.NULL);
        hero.put("armor", JSONObject.NULL);
        hero.put("ring", JSONObject.NULL);
        hero.put("artifact", JSONObject.NULL);
        hero.put("inventory", new JSONArray());
        state.put("hero", hero);

        JSONObject level = new JSONObject();
        try {
            level.put("width", Dungeon.level.width());
            level.put("height", Dungeon.level.height());
            level.put("entrance", Dungeon.level.entrance());
            level.put("exit", Dungeon.level.exit());

            JSONArray terrain = new JSONArray();
            int len = Math.min(Dungeon.level.length(), 200);
            for (int i = 0; i < len; i++) {
                terrain.put(Dungeon.level.map[i]);
            }
            level.put("terrain", terrain);

            JSONArray mobs = new JSONArray();
            for (Mob mob : Dungeon.level.mobs.toArray(new Mob[0])) {
                JSONObject m = new JSONObject();
                m.put("id", mob.id());
                m.put("type", mob.getClass().getSimpleName());
                m.put("pos", mob.pos);
                m.put("HP", mob.HP);
                m.put("HT", mob.HT);
                m.put("alignment", mob.alignment.toString());
                m.put("state", mob.state.toString());
                mobs.put(m);
            }
            level.put("mobs", mobs);

            JSONArray heaps = new JSONArray();
            for (Heap heap : Dungeon.level.heaps.valueList()) {
                JSONObject h = new JSONObject();
                h.put("pos", heap.pos);
                JSONArray items = new JSONArray();
                for (Item item : heap.items) {
                    JSONObject it = new JSONObject();
                    it.put("type", item.getClass().getSimpleName());
                    it.put("quantity", item.quantity());
                    items.put(it);
                }
                h.put("items", items);
                heaps.put(h);
            }
            level.put("heaps", heaps);
        } catch (Exception e) {
            level.put("width", 0);
            level.put("height", 0);
            level.put("entrance", -1);
            level.put("exit", -1);
            level.put("terrain", new JSONArray());
            level.put("mobs", new JSONArray());
            level.put("heaps", new JSONArray());
        }
        state.put("level", level);
        state.put("rngCalls", 0);

        return state;
    }
}
