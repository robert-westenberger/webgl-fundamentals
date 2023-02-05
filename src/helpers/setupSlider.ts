import {Options} from "ts-loader";

export interface ValuePayload {
    value: number;
}
interface SliderOptions {
    slide: (evt: Event, payload: ValuePayload) => void;
    max: number;
    name?: string;
    precision?: number;
    min?: number;
    step?: number;
    value?: number;
    uiPrecision?: number;
    uiMult?: number;
}
const gopt = getQueryParams();

export function setupSlider(selector: string, options: SliderOptions) {
    const parent = document.querySelector(selector);
    if (!parent) {
        throw new Error(`No parent found for ${selector}`);
    }
    if (!options.name) {
        options.name = selector.substring(1);
    }
    return createSlider(parent, options); // eslint-disable-line
}

function createSlider(parent: Element, options: SliderOptions) {
    const precision = options.precision || 0;
    let min = options.min || 0;
    const step = options.step || 1;
    let value = options.value || 0;
    let max = options.max || 1;
    const fn = options.slide;
    const name = gopt["ui-" + options.name] || options.name;
    const uiPrecision = options.uiPrecision === undefined ? precision : options.uiPrecision;
    const uiMult = options.uiMult || 1;

    min /= step;
    max /= step;
    value /= step;

    parent.innerHTML = `
      <div class="gman-widget-outer">
        <div class="gman-widget-label">${name}</div>
        <div class="gman-widget-value"></div>
        <input class="gman-widget-slider" type="range" min="${min}" max="${max}" value="${value}" />
      </div>
    `;
    const valueElem: HTMLDivElement | null = parent.querySelector(".gman-widget-value");
    const sliderElem: HTMLInputElement | null = parent.querySelector(".gman-widget-slider");

    if (!sliderElem) {
        throw new Error("Unable to locate slider element");
    }
    function updateValue(value: number) {
        if (!valueElem) {
            throw new Error("Unable to find value display element");
        }
        valueElem.textContent = (value * step * uiMult).toFixed(uiPrecision);
    }

    updateValue(value);

    function handleChange(event: Event) {
        if (!event.target) {
            console.error("Unable to find event target");
            return;
        }
        const changeElement = event.target as HTMLInputElement;
        const value = parseInt(changeElement.value);
        updateValue(value);
        fn(event, { value: value * step });
    }

    sliderElem.addEventListener('input', handleChange);
    sliderElem.addEventListener('change', handleChange);

    return {
        elem: parent,
        updateValue: (v: number) => {
            v /= step;
            sliderElem.value = v.toString();
            updateValue(v);
        },
    };
}

export function makeSlider(options: SliderOptions) {
    const div = document.createElement("div");
    return createSlider(div, options);
}

let widgetId = 0;
function getWidgetId() {
    return "__widget_" + widgetId++;
}

interface CheckboxChangePayload {
    value: boolean | null;
}
interface CheckboxOptions {
    name: string;
    value: boolean;
    change: (e: Event, payload: CheckboxChangePayload) => {}
}
// export function makeCheckbox(options: CheckboxOptions) {
//     const div = document.createElement("div");
//     div.className = "gman-widget-outer";
//     const label = document.createElement("label");
//     const id = getWidgetId();
//     label.setAttribute('for', id);
//     label.textContent = gopt["ui-" + options.name] || options.name;
//     label.className = "gman-checkbox-label";
//     const input = document.createElement("input");
//     input.type = "checkbox";
//     input.checked = options.value;
//     input.id = id;
//     input.className = "gman-widget-checkbox";
//     div.appendChild(label);
//     div.appendChild(input);
//     input.addEventListener('change', function(e) {
//         options.change(e, {
//             value: e && e.target && (e.target as HTMLInputElement).checked,
//         });
//     });
//
//     return {
//         elem: div,
//         updateValue: function(v: boolean) {
//             input.checked = !!v;
//         },
//     };
// }

// function makeOption(options: CheckboxOptions) {
//     const div = document.createElement("div");
//     div.className = "gman-widget-outer";
//     const label = document.createElement("label");
//     const id = getWidgetId();
//     label.setAttribute('for', id);
//     label.textContent = gopt["ui-" + options.name] || options.name;
//     label.className = "gman-widget-label";
//     const selectElem = document.createElement("select");
//     options.options.forEach((name, ndx) => {
//         const opt = document.createElement("option");
//         opt.textContent = gopt["ui-" + name] || name;
//         opt.value = ndx;
//         opt.selected = ndx === options.value;
//         selectElem.appendChild(opt);
//     });
//     selectElem.className = "gman-widget-select";
//     div.appendChild(label);
//     div.appendChild(selectElem);
//     selectElem.addEventListener('change', function(e) {
//         options.change(e, {
//             value: selectElem.selectedIndex,
//         });
//     });
//
//     return {
//         elem: div,
//         updateValue: function(v) {
//             selectElem.selectedIndex = v;
//         },
//     };
// }

// function noop() {
// }

// function genSlider(object, ui) {
//     const changeFn = ui.change || noop;
//     ui.name = ui.name || ui.key;
//     ui.value = object[ui.key];
//     ui.slide = ui.slide || function(event, uiInfo) {
//         object[ui.key] = uiInfo.value;
//         changeFn();
//     };
//     return makeSlider(ui);
// }
//
// function genCheckbox(object, ui) {
//     const changeFn = ui.change || noop;
//     ui.value = object[ui.key];
//     ui.name = ui.name || ui.key;
//     ui.change = function(event, uiInfo) {
//         object[ui.key] = uiInfo.value;
//         changeFn();
//     };
//     return makeCheckbox(ui);
// }
//
// function genOption(object, ui) {
//     const changeFn = ui.change || noop;
//     ui.value = object[ui.key];
//     ui.name = ui.name || ui.key;
//     ui.change = function(event, uiInfo) {
//         object[ui.key] = uiInfo.value;
//         changeFn();
//     };
//     return makeOption(ui);
// }

// const uiFuncs = {
//     slider: genSlider,
//     checkbox: genCheckbox,
//     option: genOption,
// };

// export function setupUI(parent, object, uiInfos) {
//     const widgets = {};
//     uiInfos.forEach(function(ui) {
//         const widget = uiFuncs[ui.type](object, ui);
//         parent.appendChild(widget.elem);
//         widgets[ui.key] = widget;
//     });
//     return widgets;
// }

// export function updateUI(widgets, data) {
//     Object.keys(widgets).forEach(key => {
//         const widget = widgets[key];
//         widget.updateValue(data[key]);
//     });
// }

type QueryParams = Record<string, string>;
function getQueryParams() {
    const params: QueryParams = {};

    if (window.location.search) {
        window.location.search.substring(1).split("&").forEach(function(pair) {
            const keyValue = pair.split("=").map(function(kv) {
                return decodeURIComponent(kv);
            });
            params[keyValue[0]] = keyValue[1];
        });
    }
    return params;
}

// return {
//     setupUI: setupUI,
//     updateUI: updateUI,
//     setupSlider: setupSlider,
//     makeSlider: makeSlider,
//     makeCheckbox: makeCheckbox,
// };