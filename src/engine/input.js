/**
 * Správa vstupu z klávesnice.
 * Používá event.code (layout-independent).
 */

export class Input {
    constructor() {
        this.keys = new Set();
        this.pressed = new Set();

        window.addEventListener('keydown', (e) => {
            if (!this.keys.has(e.code)) {
                this.pressed.add(e.code);
            }
            this.keys.add(e.code);
            // Prevent scrolling with arrow keys
            if (e.code.startsWith('Arrow') || e.code === 'F11') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Při ztrátě focusu uvolni všechny klávesy
        window.addEventListener('blur', () => {
            this.keys.clear();
            this.pressed.clear();
        });
    }

    isDown(code) {
        return this.keys.has(code);
    }

    consumePressed(code) {
        if (!this.pressed.has(code)) {
            return false;
        }

        this.pressed.delete(code);
        return true;
    }

    consumeAnyPressed(codes) {
        for (const code of codes) {
            if (this.consumePressed(code)) {
                return code;
            }
        }

        return null;
    }
}
