// Port of com.watabou.utils.Signal
// Simple publish/subscribe event system

type Listener<T> = (value: T) => void;

export class Signal<T> {
  private listeners: Listener<T>[] = [];

  add(listener: Listener<T>): void {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }

  remove(listener: Listener<T>): void {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) {
      this.listeners.splice(idx, 1);
    }
  }

  removeAll(): void {
    this.listeners = [];
  }

  dispatch(value: T): void {
    // Copy to avoid mutation during iteration
    const listeners = [...this.listeners];
    for (const listener of listeners) {
      listener(value);
    }
  }
}
