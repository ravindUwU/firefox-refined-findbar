import { createIcons, ChevronUp, ChevronDown, X, AlertTriangle, LoaderCircle } from 'lucide';
import { effect, signal } from './utils/signals';
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
const floatAlignment = signal<'top' | 'bottom'>('top');
const floatDistance = signal(18);
const buttons = signal(false);
const buttonsGrouped = signal(false);
const hideClose = signal(false);
const whenUnfocused = signal<'nothing' | 'hide' | 'opacity'>('nothing');
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

useEl(['compiler-loading', 'compiler-buttons'], ([loadingEl, buttonsEl]) => {
	effect(() => {
		if (compilation() !== undefined) {
			loadingEl.classList.remove('shown');
			buttonsEl.classList.add('shown');
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

		css = css.trim() + '\n';

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
