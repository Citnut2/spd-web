package com.sdt.testagent;

import com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon;
import com.watabou.noosa.Game;
import com.watabou.utils.PlatformSupport;

public class TestAgentGame extends ShatteredPixelDungeon {

    private TestAgentServer server;

    public TestAgentGame(PlatformSupport platform) {
        super(platform);
    }

    @Override
    public void create() {
        try {
            super.create();
        } catch (Exception e) {
            System.err.println("Headless warning: super.create() threw: " + e.getMessage());
        }

        Game.width = 160;
        Game.height = 144;
        Game.versionCode = 890;

        server = new TestAgentServer();
        Thread serverThread = new Thread(server, "test-agent-server");
        serverThread.setDaemon(true);
        serverThread.start();
    }

    @Override
    public void render() {
        super.render();
        if (server != null) {
            server.processPending();
        }
    }

    public TestAgentServer getServer() {
        return server;
    }
}
