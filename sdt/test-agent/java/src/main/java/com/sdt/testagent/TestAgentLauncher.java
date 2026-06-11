package com.sdt.testagent;

import com.badlogic.gdx.backends.headless.HeadlessApplication;

public class TestAgentLauncher {
    public static void main(String[] args) {
        HeadlessPlatformSupport platform = new HeadlessPlatformSupport();
        TestAgentGame game = new TestAgentGame(platform);
        new HeadlessApplication(game);
    }
}
