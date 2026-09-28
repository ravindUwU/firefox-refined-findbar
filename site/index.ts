import { createIcons, ChevronUp, ChevronDown, X } from 'lucide';
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

createIcons({
	icons: { ChevronUp, ChevronDown, X },
});

// MARK: State

const float = signal(true);
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

// MARK: Bind

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

bindSelect(whenUnfocused, ['nothing', 'hide', 'opacity'], useEl('opt-when-unfocused'));

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

// Findbar
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
