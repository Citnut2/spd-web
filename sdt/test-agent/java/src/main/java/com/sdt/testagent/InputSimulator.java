package com.sdt.testagent;

import com.badlogic.gdx.Input;
import com.watabou.input.KeyEvent;
import com.watabou.input.PointerEvent;

public class InputSimulator {

    public static void click(int x, int y, int button) {
        PointerEvent downEvent = new PointerEvent(x, y, 0, PointerEvent.Type.DOWN, button);
        PointerEvent.addPointerEvent(downEvent);

        PointerEvent upEvent = new PointerEvent(x, y, 0, PointerEvent.Type.UP, button);
        PointerEvent.addPointerEvent(upEvent);
    }

    public static void keyPress(int keyCode) {
        KeyEvent down = new KeyEvent(keyCode, true);
        KeyEvent.addKeyEvent(down);

        KeyEvent up = new KeyEvent(keyCode, false);
        KeyEvent.addKeyEvent(up);
    }

    public static void keyPress(String keyName) {
        int keyCode = keyNameToKeyCode(keyName);
        keyPress(keyCode);
    }

    private static int keyNameToKeyCode(String name) {
        if (name.length() == 1) {
            char c = name.charAt(0);
            if (c >= 'A' && c <= 'Z') {
                return Input.Keys.valueOf("" + c);
            }
            if (c >= '0' && c <= '9') {
                return Input.Keys.valueOf("NUM_" + c);
            }
        }

        switch (name.toUpperCase()) {
            case "SPACE":     return Input.Keys.SPACE;
            case "ENTER":     return Input.Keys.ENTER;
            case "ESCAPE":    return Input.Keys.ESCAPE;
            case "TAB":       return Input.Keys.TAB;
            case "SHIFT":     return Input.Keys.SHIFT_LEFT;
            case "CONTROL":   return Input.Keys.CONTROL_LEFT;
            case "ALT":       return Input.Keys.ALT_LEFT;
            case "BACKSPACE": return Input.Keys.BACKSPACE;
            case "DELETE":    return Input.Keys.FORWARD_DEL;
            case "UP":        return Input.Keys.UP;
            case "DOWN":      return Input.Keys.DOWN;
            case "LEFT":      return Input.Keys.LEFT;
            case "RIGHT":     return Input.Keys.RIGHT;
            case "HOME":      return Input.Keys.HOME;
            case "END":       return Input.Keys.END;
            case "PAGE_UP":   return Input.Keys.PAGE_UP;
            case "PAGE_DOWN": return Input.Keys.PAGE_DOWN;
            default:
                throw new IllegalArgumentException("Unknown key name: " + name);
        }
    }
}
