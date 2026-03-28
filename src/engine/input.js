/**
 * Správa vstupu z klávesnice.
 * Používá event.code (layout-independent).
 */

export class Input {
    constructor() {
        this.keys = new Set();

        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            // Prevent scrolling with arrow keys
            if (e.code.startsWith('Arrow')) e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Při ztrátě focusu uvolni všechny klávesy
        window.addEventListener('blur', () => {
            this.keys.clear();
        });
    }

    isDown(code) {
        return this.keys.has(code);
    }
}
