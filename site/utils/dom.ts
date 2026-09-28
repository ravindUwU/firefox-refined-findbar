import { effect, type Signal } from './signals';

export function useEl<E extends HTMLElement>(id: string, callback?: (f: E) => void): E;
export function useEl<E extends HTMLElement>(ids: string[], callback?: (f: E[]) => void): E[];
export function useEl<E extends HTMLElement>(
	idOrIds: string | string[],
	callback?: (f: E | E[]) => void,
): E | E[] {
	if (Array.isArray(idOrIds)) {
		const els = idOrIds.map(getRequiredElementById<E>);
		callback?.(els);
		return els;
	} else {
		const el = getRequiredElementById<E>(idOrIds);
		callback?.(el);
		return el;
	}
}

function getRequiredElementById<E extends HTMLElement>(id: string): E {
	const e = document.getElementById(id) as E | null;
	if (e === null) {
		throw new Error(`useEl: no <element id="${id}">`);
	}
	return e;
}

export function bindEnabled<T>(el: HTMLElement, signal: Signal<T>, project?: (t: T) => boolean) {
	if (!(el instanceof HTMLInputElement)) {
		throw new Error('bindEnabled: not <input>');
	}
	effect(() => {
		const v = signal();
		el.disabled = !(project?.(v) ?? !!v);
	});
}

export function bindClass<T>(
	el: HTMLElement,
	signal: Signal<T>,
	classNameOrProjection: string | ((t: T) => string),
) {
	effect(() => {
		const v = signal();

		let className: string | undefined = undefined;
		if (typeof classNameOrProjection === 'function') {
			// bindClass(el, someType, (t) => `type-${t}`)
			className = classNameOrProjection(v);
		} else {
			// bindClass(el, someFlag, 'has-flag')
			if (v) {
				className = classNameOrProjection;
			}
		}

		if (className !== undefined) {
			el.classList.add(className);
		}

		return () => {
			if (className !== undefined) {
				el.classList.remove(className);
			}
		};
	});
}

export function bindStyleProp<T>(
	el: HTMLElement,
	name: string,
	signal: Signal<T>,
	map?: (t: T) => string | undefined,
) {
	effect(() => {
		const t = signal();
		const value = map !== undefined ? map(t) : (t as string);
		if (value !== undefined) {
			el.style.setProperty(name, value);
		} else {
			el.style.removeProperty(name);
		}
	});
}

export function bindNumber(signal: Signal<number>, el: HTMLElement) {
	if (!(el instanceof HTMLInputElement && el.type === 'number')) {
		throw new Error('bindNumber: not <input type="number">');
	}

	const readEl = () => {
		const n = el.valueAsNumber;
		if (!isNaN(n) && el.validity.valid) {
			signal(n);
		} else {
			el.valueAsNumber = signal();
		}
	};

	readEl();
	el.addEventListener('input', readEl);
	effect(() => {
		el.valueAsNumber = signal();
	});
}

export function bindCheckbox(signal: Signal<boolean>, el: HTMLElement) {
	if (!(el instanceof HTMLInputElement && el.type === 'checkbox')) {
		throw new Error('bindCheckbox: not <input type="checkbox">');
	}

	signal(el.checked);
	el.addEventListener('change', () => signal(el.checked));
	effect(() => {
		el.checked = signal() ?? false;
	});
}

export function bindRadio<V extends string>(signal: Signal<V>, els: Record<V, HTMLElement>) {
	let _els: Record<string, HTMLInputElement> = {};
	for (const [v, el] of Object.entries(els)) {
		if (el instanceof HTMLInputElement && el.type === 'radio' && el.value === v) {
			_els[v] = el;
		} else {
			throw new Error(`bindRadio: not <input type="radio" value="${v}">`);
		}
	}

	let restored = false;
	for (const [v, el] of Object.entries(_els)) {
		if (restored) {
			el.checked = false;
		} else {
			if (el.checked) {
				signal(v as V);
				restored = true;
			}
		}
	}

	for (const [v, el] of Object.entries(_els)) {
		el.addEventListener('change', () => signal(v as V));
		effect(() => {
			el.checked = signal() === v;
		});
	}
}

export function bindSelect<V extends string>(signal: Signal<V>, values: V[], el: HTMLElement) {
	if (!(el instanceof HTMLSelectElement)) {
		throw new Error('bindSelect: not <select>');
	}

	for (const option of el.querySelectorAll('option')) {
		if (!values.includes(option.value as V)) {
			throw new Error(`bindSelect: unexpected <option value="${option.value}">`);
		}
	}

	const readEl = () => {
		const v = el.value as V;
		if (values.includes(v)) {
			signal(v);
		} else {
			el.value = signal();
		}
	};

	readEl();
	el.addEventListener('change', readEl);
	effect(() => {
		el.value = signal();
	});
}

export function bindReorderableList<T extends string>(
	signal: Signal<T[]>,
	inputEl: HTMLElement,
	labels?: Record<T, string>,
) {
	if (!(inputEl instanceof HTMLInputElement && inputEl.type === 'hidden')) {
		throw new Error('bindReorderableList: not <input type="hidden">');
	}

	const initial = signal();

	const isTok = (s: string): s is T => {
		return s !== undefined && initial.includes(s as T);
	};

	const move = (from: number, to: number) => {
		const current = signal();

		if (from === to || from < 0 || from >= current.length || to < 0 || to >= current.length) {
			return;
		}

		const next = [...current];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		signal(next);
	};

	const readEl = () => {
		const current = inputEl.value.split(',') as T[];
		if (
			current.length === initial.length
			&& current.every(isTok)
			&& current.some((t, i) => t !== initial[i])
		) {
			signal(current);
		} else {
			inputEl.value = signal().join(',');
		}
	};

	readEl();

	const ul = document.createElement('ul');
	ul.classList.add('reorderable');

	const liMap = {} as Record<T, HTMLElement>;

	for (const tok of initial) {
		const li = document.createElement('li');
		li.dataset.id = tok;
		li.innerText = labels?.[tok] ?? tok;

		// Allow reordering by dragging.
		// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
		li.draggable = true;

		li.addEventListener('dragstart', (e) => {
			e.dataTransfer?.setData('text/x-rff', tok);
		});

		li.addEventListener('dragover', (e) => {
			const draggedTok = e.dataTransfer?.getData('text/x-rff');
			if (draggedTok === undefined || !isTok(draggedTok) || draggedTok === tok) {
				return;
			}
			e.preventDefault();
		});

		li.addEventListener('drop', (e) => {
			const droppedTok = e.dataTransfer?.getData('text/x-rff');
			if (droppedTok === undefined || !isTok(droppedTok) || droppedTok === tok) {
				return;
			}

			const toks = signal();
			const droppedIdx = toks.indexOf(droppedTok);
			const toIdx = toks.indexOf(tok);
			move(droppedIdx, toIdx);
		});

		// Allow, reordering with the up & down arrow keys, when elements are focused; and
		// unfocusing with escape.
		li.tabIndex = 0;
		li.role = 'button';

		li.addEventListener('keydown', (e) => {
			const idx = signal().indexOf(tok);
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				move(idx, idx + 1);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				move(idx, idx - 1);
			} else if (e.key === 'Escape') {
				e.preventDefault();
				li.blur();
			}
		});

		liMap[tok] = li;
		ul.appendChild(li);
	}

	inputEl.after(ul);

	effect(() => {
		const order = signal();
		inputEl.value = order.join(',');

		const lis = Object.values(liMap) as (HTMLElement & { dataset: { id: T } })[];
		const focused = lis.find((li) => li === document.activeElement);

		ul.replaceChildren(
			...lis.toSorted((l, r) => order.indexOf(l.dataset.id) - order.indexOf(r.dataset.id)),
		);
		focused?.focus();
	});
}
