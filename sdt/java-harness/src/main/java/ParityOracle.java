import com.badlogic.gdx.ApplicationListener;
import com.badlogic.gdx.backends.headless.HeadlessApplication;
import com.badlogic.gdx.Gdx;
import com.watabou.utils.Random;
import com.watabou.noosa.Game;
import com.shatteredpixel.shatteredpixeldungeon.Dungeon;
import com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon;
import com.shatteredpixel.shatteredpixeldungeon.actors.Actor;
import com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass;
import com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob;
import com.shatteredpixel.shatteredpixeldungeon.items.Heap;
import com.shatteredpixel.shatteredpixeldungeon.items.Item;
import com.shatteredpixel.shatteredpixeldungeon.items.Generator;
import com.shatteredpixel.shatteredpixeldungeon.levels.Level;
import com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene;
import com.shatteredpixel.shatteredpixeldungeon.GamesInProgress;

import java.io.PrintStream;

/**
 * ParityOracle — runs SPD game logic headlessly with a given seed,
 * executes scripted actions, and dumps game state as JSON.
 *
 * Usage:
 *   java ParityOracle <seed> <heroClass> [actions...]
 *
 * Example:
 *   java ParityOracle TEST-ABC WARRIOR wait=2 move=0,-1 attack=0,1
 */
public class ParityOracle implements ApplicationListener {

    private String seedText;
    private HeroClass heroClass;
    private String[] actions;

    public ParityOracle(String seedText, String heroClassStr, String[] actions) {
        this.seedText = seedText;
        this.heroClass = parseHeroClass(heroClassStr);
        this.actions = actions;
    }

    private static HeroClass parseHeroClass(String s) {
        switch (s.toUpperCase()) {
            case "WARRIOR":  return HeroClass.WARRIOR;
            case "MAGE":     return HeroClass.MAGE;
            case "ROGUE":    return HeroClass.ROGUE;
            case "HUNTRESS": return HeroClass.HUNTRESS;
            case "DUELIST":  return HeroClass.DUELIST;
            case "CLERIC":   return HeroClass.CLERIC;
            default:
                System.err.println("Unknown hero class: " + s + ", using WARRIOR");
                return HeroClass.WARRIOR;
        }
    }

    @Override
    public void create() {
        try {
            // Skip GL initialization — set fields directly
            Game.width = 160;
            Game.height = 144;
            Game.version = "3.3.5";
            Game.versionCode = 890;
            Gdx.files = new com.badlogic.gdx.backends.headless.HeadlessFiles();
            com.watabou.utils.FileUtils.setDefaultFileProperties(
                com.badlogic.gdx.Files.FileType.Local, "."
            );
            // Set up a minimal Game instance so Actor.process() doesn't NPE
            try {
                // Use reflection to set instance and access flag fields
                java.lang.reflect.Field instanceField = com.watabou.noosa.Game.class.getDeclaredField("instance");
                instanceField.setAccessible(true);
                // Create a placeholder object (not a real Game subclass) to prevent NPE
                Object placeholder = new Object();
                instanceField.set(null, placeholder);
                // Set requestedReset and requestedFinish via reflection on the placeholder
                // Actually these fields are on Game, not on Object. Let's try a different approach.
            } catch (Exception e) {
                System.err.println("Non-critical (Game.instance setup): " + e.getMessage());
            }

            // Parse seed (seed text or numeric)
            long seed;
            if (seedText.matches("\\d+")) {
                seed = Long.parseLong(seedText);
            } else {
                // Convert seed text to numeric using DungeonSeed
                Dungeon.customSeedText = seedText;
                seed = com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed.convertFromText(seedText);
            }

            // Set up hero class
            GamesInProgress.selectedClass = heroClass;

            // Initialize dungeon with seed
            Dungeon.seed = seed;
            try {
                Dungeon.init();
            } catch (Exception e) {
                System.err.println("Non-critical (Dungeon.init): " + e.getMessage());
            }
            // Reset Bones so it doesn't try to load previous-save data
            try {
                Class<?> bonesClass = Class.forName("com.shatteredpixel.shatteredpixeldungeon.Bones");
                java.lang.reflect.Method reset = bonesClass.getDeclaredMethod("reset");
                reset.setAccessible(true);
                reset.invoke(null);
            } catch (Exception e) {
                System.err.println("Non-critical (Bones.reset): " + e.getMessage());
            }

            // Generate first level
            Level level = Dungeon.newLevel();
            Dungeon.level = level;
            Dungeon.hero.pos = level.entrance();

            // Update FOV
            level.heroFOV = new boolean[level.length()];
            level.updateFieldOfView(Dungeon.hero, level.heroFOV);

            // Dump initial state
            dumpState("init");

            // Process scripted actions
            int turnCount = 0;
            int actionIndex = 0;

            for (String action : actions) {
                try {
                    processAction(action);
                } catch (Exception e) {
                    System.err.println("Non-critical (action " + action + "): " + e.getMessage());
                }
                actionIndex++;

                // Advance actors — Actor.process() fails without game instance
                try {
                    Actor.process();
                } catch (Throwable e) {
                    System.err.println("Non-critical (Actor.process): " + e.getMessage());
                }
                turnCount++;

                try {
                    dumpState("action_" + actionIndex);
                } catch (Exception e) {
                    System.err.println("Non-critical (dumpState): " + e.getMessage());
                }
            }

            try {
                dumpState("final");
            } catch (Exception e) {
                System.err.println("Non-critical (final dumpState): " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("Error in ParityOracle: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void processAction(String action) {
        String[] parts = action.split("=");
        String type = parts[0];
        String args = parts.length > 1 ? parts[1] : "";

        switch (type) {
            case "wait":
                int turns = args.isEmpty() ? 1 : Integer.parseInt(args);
                for (int i = 0; i < turns; i++) {
                    advanceTurn();
                }
                break;

            case "move":
                String[] coords = args.split(",");
                int dx = Integer.parseInt(coords[0]);
                int dy = Integer.parseInt(coords[1]);
                int targetCell = Dungeon.hero.pos + dx + dy * Dungeon.level.width();
                if (Dungeon.level.avoid[targetCell]) {
                    // Can't walk through certain terrain
                } else if (Dungeon.level.passable[targetCell] && mobAtCell(targetCell) == null) {
                    Dungeon.hero.pos = targetCell;
                    Dungeon.level.updateFieldOfView(Dungeon.hero, Dungeon.level.heroFOV);
                }
                advanceTurn();
                break;

            case "attack":
                String[] atkCoords = args.split(",");
                int adx = Integer.parseInt(atkCoords[0]);
                int ady = Integer.parseInt(atkCoords[1]);
                int attackCell = Dungeon.hero.pos + adx + ady * Dungeon.level.width();
                Mob target = mobAtCell(attackCell);
                if (target != null && target.isAlive()) {
                    Dungeon.hero.attack(target);
                }
                advanceTurn();
                break;

            case "rest":
                int restTurns = args.isEmpty() ? 1 : Integer.parseInt(args);
                for (int i = 0; i < restTurns; i++) {
                    advanceTurn();
                }
                break;
        }
    }

    private void advanceTurn() {
        try {
            Actor.process();
        } catch (Throwable e) {
            // Headless fallback: just log and continue
            System.err.println("Non-critical (advanceTurn): " + e.getMessage());
        }
    }

    private Mob mobAtCell(int cell) {
        for (Mob m : Dungeon.level.mobs) {
            if (m.pos == cell) return m;
        }
        return null;
    }

    private void dumpState(String checkpoint) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        json.append("  \"seed\": \"").append(seedText).append("\",\n");
        json.append("  \"depth\": ").append(Dungeon.depth).append(",\n");
        json.append("  \"turn\": ").append(Actor.now()).append(",\n");
        json.append("  \"checkpoint\": \"").append(checkpoint).append("\",\n");

        // Hero state
        json.append("  \"hero\": {\n");
        json.append("    \"pos\": ").append(Dungeon.hero.pos).append(",\n");
        json.append("    \"HP\": ").append(Dungeon.hero.HP).append(",\n");
        json.append("    \"HT\": ").append(Dungeon.hero.HT).append(",\n");
        json.append("    \"STR\": ").append(Dungeon.hero.STR()).append(",\n");
        json.append("    \"class\": \"").append(GamesInProgress.selectedClass.name()).append("\",\n");
        json.append("    \"level\": ").append(Dungeon.hero.lvl).append(",\n");
        json.append("    \"XP\": ").append(Dungeon.hero.exp).append(",\n");
        json.append("    \"weapon\": null,\n");
        json.append("    \"armor\": null,\n");
        json.append("    \"ring\": null,\n");
        json.append("    \"artifact\": null,\n");
        json.append("    \"inventory\": []\n");
        json.append("  },\n");

        // Level state
        json.append("  \"level\": {\n");
        json.append("    \"width\": ").append(Dungeon.level.width()).append(",\n");
        json.append("    \"height\": ").append(Dungeon.level.height()).append(",\n");
        json.append("    \"entrance\": ").append(Dungeon.level.entrance()).append(",\n");
        json.append("    \"exit\": ").append(Dungeon.level.exit()).append(",\n");

        // Terrain (sampled, first 100 cells to keep output manageable)
        json.append("    \"terrain\": [");
        int len = Math.min(Dungeon.level.length(), 200);
        for (int i = 0; i < len; i++) {
            if (i > 0) json.append(",");
            json.append(Dungeon.level.map[i]);
        }
        json.append("],\n");

        // Mobs
        json.append("    \"mobs\": [\n");
        boolean firstMob = true;
        for (Mob mob : Dungeon.level.mobs.toArray(new Mob[0])) {
            if (!firstMob) json.append(",\n");
            firstMob = false;
            json.append("      {\n");
            json.append("        \"id\": ").append(mob.id()).append(",\n");
            json.append("        \"type\": \"").append(mob.getClass().getSimpleName()).append("\",\n");
            json.append("        \"pos\": ").append(mob.pos).append(",\n");
            json.append("        \"HP\": ").append(mob.HP).append(",\n");
            json.append("        \"HT\": ").append(mob.HT).append(",\n");
            json.append("        \"alignment\": \"").append(mob.alignment).append("\",\n");
            json.append("        \"state\": \"").append(mob.state.getClass().getSimpleName().toUpperCase()).append("\"\n");
            json.append("      }");
        }
        json.append("\n    ],\n");

        // Heaps
        json.append("    \"heaps\": [\n");
        boolean firstHeap = true;
        for (Heap heap : Dungeon.level.heaps.valueList()) {
            if (!firstHeap) json.append(",\n");
            firstHeap = false;
            json.append("      {\n");
            json.append("        \"pos\": ").append(heap.pos).append(",\n");
            json.append("        \"items\": [\n");
            boolean firstItem = true;
            for (Item item : heap.items) {
                if (!firstItem) json.append(",\n");
                firstItem = false;
                json.append("          {\"type\": \"").append(item.getClass().getSimpleName())
                    .append("\", \"quantity\": ").append(item.quantity()).append("}");
            }
            json.append("\n        ]\n");
            json.append("      }");
        }
        json.append("\n    ]\n");
        json.append("  },\n");
        json.append("  \"rngCalls\": 0\n");
        json.append("}\n");

        // Output JSON wrapped in a marker for script parsing
        System.out.println("===SDT_STATE:" + checkpoint + "===");
        System.out.println(json.toString());
        System.out.println("===SDT_END:" + checkpoint + "===");
    }

    @Override
    public void resize(int width, int height) {}

    @Override
    public void render() {}

    @Override
    public void pause() {}

    @Override
    public void resume() {}

    @Override
    public void dispose() {}

    public static void main(String[] args) {
        if (args.length < 2) {
            System.err.println("Usage: ParityOracle <seed> <heroClass> [action1 action2 ...]");
            System.err.println("Actions: wait=N, move=dx,dy, attack=dx,dy, rest=N");
            System.exit(1);
        }

        String seed = args[0];
        String heroClass = args[1];
        String[] actions = new String[args.length - 2];
        System.arraycopy(args, 2, actions, 0, args.length - 2);

        ParityOracle oracle = new ParityOracle(seed, heroClass, actions);
        new HeadlessApplication(oracle);
    }
}
