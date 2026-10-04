export { signal, effect, computed } from 'alien-signals';

export interface Signal<T> {
	(): T;
	(t: T): void;
}
