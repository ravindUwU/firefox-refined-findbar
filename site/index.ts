import { createIcons, ChevronUp, ChevronDown, X, AlertTriangle, LoaderCircle } from 'lucide';
import { computed, effect, signal } from './utils/signals';
import {
	bindCheckbox,
	bindClass,
	bindEnabled,
	bindNumber,
	bindRadio,
	bindReorderableList,
	bindSelect,
	bindStyleProp,
	useEl,
} from './utils/dom';
import type { Compiler } from 'sass';

createIcons({
	icons: { ChevronUp, ChevronDown, X, AlertTriangle, LoaderCircle },
});

// MARK: State

// DEFAULTS: The bind* functions restore signal values from the corresponding elements. The
// user-facing default values are defined on the elements themselves.

const float = signal(false);
type FloatAlignment = 'top' | 'bottom';
const floatAlignment = signal<FloatAlignment>('top');
const floatDistance = signal(18);
const buttons = signal(false);
const buttonsGrouped = signal(false);
const chromeFindbar = signal(false);
const hideClose = signal(false);
type WhenUnfocused = 'nothing' | 'hide' | 'opacity';
const whenUnfocused = signal<WhenUnfocused>('nothing');
const opacityWhenUnfocused = signal(100);

const _allMainControls = ['TEXT_BOX', 'CHECKBOXES', 'LABELS', 'DESCRIPTION'] as const;
type MainControl = (typeof _allMainControls)[number];
const mainControls = signal<MainControl[]>([..._allMainControls]);

// prettier-ignore
const _allCheckboxControls = ['HIGHLIGHT_ALL', 'MATCH_CASE', 'MATCH_DIACRITICS', 'WHOLE_WORDS'] as const;
type CheckboxControl = (typeof _allCheckboxControls)[number];
const checkboxControls = signal<CheckboxControl[]>([..._allCheckboxControls]);

// MARK: Bind options

bindCheckbox(float, useEl('opt-float'));

useEl(['opt-float-align-top', 'opt-float-align-bottom'], ([topEl, bottomEl]) => {
	bindRadio(floatAlignment, { top: topEl, bottom: bottomEl });
	bindEnabled(topEl, float);
	bindEnabled(bottomEl, float);
});

useEl('opt-float-distance', (el) => {
	bindNumber(floatDistance, el);
	bindEnabled(el, float);
});

bindCheckbox(buttons, useEl('opt-buttons'));

useEl('opt-buttons-grouped', (el) => {
	bindCheckbox(buttonsGrouped, el);
	bindEnabled(el, buttons);
});

bindCheckbox(chromeFindbar, useEl('opt-chrome-findbar'));

bindCheckbox(hideClose, useEl('opt-hide-close'));
bindClass(useEl('opt-hide-close-warning'), hideClose, 'shown');

bindSelect(whenUnfocused, ['nothing', 'hide', 'opacity'], useEl('opt-when-unfocused'));

bindClass(useEl('opt-hide-when-unfocused-warning'), whenUnfocused, (w) =>
	w === 'hide' ? 'shown' : undefined,
);

useEl('opt-opacity-when-unfocused', (el) => {
	bindNumber(opacityWhenUnfocused, el);
	bindEnabled(el, whenUnfocused, (w) => w === 'opacity');
});

bindReorderableList(mainControls, useEl('opt-main-controls'), {
	TEXT_BOX: 'Textbox',
	CHECKBOXES: 'Checkboxes',
	LABELS: 'Labels',
	DESCRIPTION: 'Description',
});

bindReorderableList(checkboxControls, useEl('opt-checkbox-controls'), {
	HIGHLIGHT_ALL: 'Highlight All',
	MATCH_CASE: 'Match Case',
	MATCH_DIACRITICS: 'Match Diacritics',
	WHOLE_WORDS: 'Whole Words',
});

// MARK: Bind findbar

useEl('findbar', (el) => {
	bindClass(el, float, 'opt-float');
	bindClass(el, floatAlignment, (alignment) => `opt-float-${alignment}`);
	bindStyleProp(el, '--opt-float-distance', floatDistance, (d) => `${d}px`);
	bindClass(el, buttons, 'opt-buttons');
	bindClass(el, buttonsGrouped, 'opt-buttons-grouped');
	bindClass(el, chromeFindbar, 'opt-chrome-findbar');
	bindClass(el, hideClose, 'opt-hide-close');
});

useEl('findbar-controls-ordered', (el) => {
	const nodes = [...el.children] as (HTMLElement & { dataset: { id: MainControl } })[];
	effect(() => {
		const order = mainControls();
		el.replaceChildren(
			...nodes.toSorted((l, r) => order.indexOf(l.dataset.id) - order.indexOf(r.dataset.id)),
		);
	});
});

useEl('findbar-checkboxes-ordered', (el) => {
	const nodes = [...el.children] as (HTMLElement & { dataset: { id: CheckboxControl } })[];
	effect(() => {
		const order = checkboxControls();
		el.replaceChildren(
			...nodes.toSorted((l, r) => order.indexOf(l.dataset.id) - order.indexOf(r.dataset.id)),
		);
	});
});

// MARK: URL

const configUrl = computed(() => {
	const p = new URLSearchParams();

	if (float()) {
		p.set('float', `${floatAlignment()}-${floatDistance()}`);
	}

	if (buttons()) {
		p.set('buttons', buttonsGrouped() ? 'grouped' : '');
	}

	if (chromeFindbar()) {
		p.set('chrome-findbar', '');
	}

	if (hideClose()) {
		p.set('hideClose', '');
	}

	switch (whenUnfocused()) {
		case 'hide': {
			p.set('when-unfocused', 'hide');
			break;
		}
		case 'opacity': {
			p.set('when-unfocused', `opacity-${opacityWhenUnfocused()}`);
			break;
		}
	}

	p.set('controls', mainControls().join('.'));
	p.set('checkboxes', checkboxControls().join('.'));

	const l = window.location;
	return `${l.protocol}//${l.host}${l.pathname}?${p.toString()}`;
});

useEl('copy-link-button', (el) => {
	el.addEventListener('click', () => {
		const url = new URL(window.location.href);
		for (const key of url.searchParams.keys()) {
			url.searchParams.delete(key);
		}
		navigator.clipboard.writeText(configUrl());
	});
});

tryRestoreUrlState();
window.addEventListener('hashchange', tryRestoreUrlState);

function tryRestoreUrlState() {
	const loc = window.location;
	const p = new URLSearchParams(loc.search);
	if (p.size === 0) {
		return;
	}

	ifMatch(p.get('float'), /^(?<alignment>top|bottom)-(?<distance>\d+)$/, {
		then(e) {
			float(true);
			floatAlignment(e.groups?.['alignment'] as FloatAlignment);
			floatDistance(+(e.groups?.['distance'] ?? 0));
		},
		else() {
			float(false);
			floatAlignment('top');
			floatDistance(18);
		},
	});

	if (p.has('buttons')) {
		buttons(true);
		if (p.get('buttons') === 'grouped') {
			buttonsGrouped(true);
		}
	} else {
		buttons(false);
		buttonsGrouped(false);
	}

	chromeFindbar(p.has('chrome-findbar'));

	hideClose(p.has('hideClose'));

	ifMatch(p.get('when-unfocused'), /^((?<mode>hide)|(?<mode>opacity)-(?<opacity>\d+))$/, {
		then(e) {
			const mode = e.groups?.['mode'] as WhenUnfocused;
			whenUnfocused(mode);
			opacityWhenUnfocused(mode === 'opacity' ? +(e.groups?.['opacity'] ?? 0) : 100);
		},
		else() {
			whenUnfocused('nothing');
			opacityWhenUnfocused(100);
		},
	});

	{
		const controls = (p.get('controls') ?? '').split('.');
		if (
			new Set(controls).size === _allMainControls.length
			&& controls.every((c) => _allMainControls.includes(c as MainControl))
		) {
			mainControls(controls as MainControl[]);
		} else {
			mainControls([..._allMainControls]);
		}
	}

	{
		const checkboxes = (p.get('checkboxes') ?? '').split('.');
		if (
			new Set(checkboxes).size === _allCheckboxControls.length
			&& checkboxes.every((c) => _allCheckboxControls.includes(c as CheckboxControl))
		) {
			checkboxControls(checkboxes as CheckboxControl[]);
		} else {
			checkboxControls([..._allCheckboxControls]);
		}
	}

	// Drop search params from the URL.
	history.replaceState(null, '', `${loc.protocol}//${loc.host}${loc.pathname}`);

	function ifMatch(
		s: string | null,
		r: RegExp,
		logic: { then: (match: RegExpExecArray) => void; else: () => void },
	) {
		if (s === null) {
			logic.else();
			return;
		}
		const e = r.exec(s);
		if (e === null) {
			logic.else();
			return;
		}
		logic.then(e);
	}
}

// MARK: Compile

const compilation = signal<{
	compiler: Compiler;
	scss: string;
}>();

(async () => {
	compilation({
		compiler: (await import('sass')).initCompiler(),
		scss: (await import('./utils/rff')).default.trim().replace(/\r/gm, ''),
	});
})();

useEl(['compiler-loading', 'compiler-loaded'], ([loadingEl, loadedEl]) => {
	effect(() => {
		if (compilation() !== undefined) {
			loadingEl.classList.remove('shown');
			loadedEl.classList.add('shown');
		}
	});
});

useEl('download-button', (el) => {
	el.addEventListener('click', () => {
		const _compilation = compilation();
		if (_compilation === undefined) {
			return;
		}

		const _whenUnfocused = whenUnfocused();
		const controls: string[] = [...mainControls()];
		controls.splice(
			controls.indexOf('CHECKBOXES'),
			1,
			...checkboxControls().map((c) => `CHECKBOX_${c}`),
		);

		const invocation = `
			@include refined-findbar(
				$float: ${float()},
				$float-alignment: ${floatAlignment()},
				$float-distance: ${floatDistance()}px,

				$buttons: ${buttons()},
				$buttons-grouped: ${buttonsGrouped()},
				$chrome-findbar: ${chromeFindbar()},
				$hide-close-button: ${hideClose()},

				$hide-when-unfocused: ${_whenUnfocused === 'hide'},
				$opacity-when-unfocused: ${(_whenUnfocused === 'opacity' ? opacityWhenUnfocused() : 100) / 100},

				$order: (
					__CONTROLS__
				)
			);
		`
			.trim()
			.replace(/\r/g, '')
			.replace(/^\t{3}/gm, '')
			.replace('__CONTROLS__', controls.map((c) => `${c},`).join('\n\t\t'));

		const scss = _compilation.scss + '\n' + invocation;

		let { css } = _compilation.compiler.compileString(scss, {
			alertColor: false,
		});

		css = `/* Config: ${configUrl()} */\n\n` + css.trim() + '\n';

		// Download as userChrome.refined-findbar.css.
		// https://stackoverflow.com/a/79383186

		const blob = new Blob([css], {
			type: 'text/css',
		});

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'userChrome.refined-findbar.css';
		link.click();

		URL.revokeObjectURL(link.href);
	});
});
