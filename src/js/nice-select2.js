// import "../scss/nice-select2.scss";
import { autoUpdate, computePosition, flip, offset, size, autoPlacement } from "@floating-ui/dom";

import { OverlayScrollbars } from 'overlayscrollbars';

import scrollIntoView from 'scroll-into-view';

// utility functions
function triggerClick(el) {
	var event = document.createEvent("MouseEvents");
	event.initEvent("click", true, false);
	el.dispatchEvent(event);
}

function triggerChange(el) {
	var event = document.createEvent("HTMLEvents");
	event.initEvent("change", true, false);
	el.dispatchEvent(event);
}

function triggerFocusIn(el) {
	var event = document.createEvent("FocusEvent");
	event.initEvent("focusin", true, false);
	el.dispatchEvent(event);
}

function triggerFocusOut(el) {
	var event = document.createEvent("FocusEvent");
	event.initEvent("focusout", true, false);
	el.dispatchEvent(event);
}

function triggerModalOpen(el) {
	var event = document.createEvent("UIEvent");
	event.initEvent("modalopen", true, false);
	el.dispatchEvent(event);
}

function triggerModalClose(el) {
	var event = document.createEvent("UIEvent");
	event.initEvent("modalclose", true, false);
	el.dispatchEvent(event);
}

function triggerValidationMessage(el, type) {
	if (type == 'invalid') {
		addClass(this.input, 'invalid');
		removeClass(this.input, 'valid');
	} else {
		addClass(this.input, 'valid');
		removeClass(this.input, 'invalid');
	}
}

function attr(el, key) {
	if (el[key] != undefined) {
		return el[key];
	}
	return el.getAttribute(key);
}

function data(el, key) {
	return el.getAttribute("data-" + key);
}

function hasClass(el, className) {
	if (el) {
		return el.classList.contains(className);
	} else {
		return false;
	}
}

function addClass(el, className) {
	if (el) return el.classList.add(className);
}

function removeClass(el, className) {
	if (el) return el.classList.remove(className);
}

function roundByDPR(value) {
	const dpr = window.devicePixelRatio || 1;
	return Math.round(value * dpr) / dpr;
}

const Bool = (string) => string === 'false' || string === 'undefined' || string === 'null' || string === '0' ? false : !!string;

var defaultOptions = {
	data: null,
	fitContent: true,
	searchable: false,
	showSelectedItems: false,
	sameWidth: false,
	availableHeight: false,
	offset: 3,
	padding: 5,
	placement: "bottom-start"
};

// var cleanupMenu;


export default class NiceSelect {
	constructor(element, options) {
		this.cleanup;
		this.finalPosition;
		this.el = element;
		this.config = Object.assign({}, defaultOptions, options || {});
		this.data = this.config.data;
		this.selectedOptions = [];

		this.placeholder = attr(this.el, "placeholder") || this.config.placeholder || "Select an option";
		this.searchtext = attr(this.el, "searchtext") || this.config.searchtext || "Search";
		this.selectedtext = attr(this.el, "selectedtext") || this.config.selectedtext || "selected";

		this.fitContent = Bool(this.el.dataset.fitContent || this.config.fitContent);
		this.sameWidth = Bool(this.el.dataset.sameWidth || this.config.sameWidth);
		this.availableHeight = Bool(this.el.dataset.availableHeight || this.config.availableHeight);
		this.searchable = Bool(this.el.dataset.searchable || this.config.searchable);
		this.offset = Number(this.el.dataset.offset || this.config.offset);
		this.padding = Number(this.el.dataset.padding || this.config.padding);
		this.placement = this.el.dataset.placement || this.config.placement;

		this.input = null;
		this.multiple = attr(this.el, "multiple");
		this.disabled = attr(this.el, "disabled");

		this.create();
	}

	create() {
		this.el.style.opacity = "0";
		this.el.style.width = "0";
		this.el.style.padding = "0";
		this.el.style.height = "0";
		this.el.style.border = "0";
		this.el.style.position = "absolute";
		this.el.tabIndex = -1;
		if (this.data) {
			this.processData(this.data);
		} else {
			this.extractData();
		}

		this.renderDropdown();
		this.bindEvent();
	}

	processData(data) {
		var options = [];
		data.forEach(item => {
			options.push({
				data: item,
				attributes: {
					selected: !!item.selected,
					disabled: !!item.disabled,
					optgroup: item.value == 'optgroup'
				}
			});
		});
		this.options = options;
	}

	extractData() {
		var options = this.el.querySelectorAll("option,optgroup");
		var data = [];
		var allOptions = [];
		var selectedOptions = [];

		options.forEach(item => {
			if (item.tagName === 'OPTGROUP') {
				var itemData = {
					display: item.label,
					value: 'optgroup'
				};
			} else {
				let text = item.innerText;
				let display = text;
				if (item.dataset.display != undefined) {
					display = item.dataset.display;
				}

				var itemData = {
					text: text,
					display: display,
					value: item.value,
					optgroupOption: item.parentElement.tagName === 'OPTGROUP',
					selected: item.selected || item.getAttribute("selected") != null,
					disabled: item.disabled || item.getAttribute("disabled") != null
				};
			}

			var attributes = {
				selected: item.selected || item.getAttribute("selected") != null,
				disabled: item.disabled || item.getAttribute("disabled") != null,
				optgroupOption: item.parentElement.tagName === 'OPTGROUP',
				optgroup: item.tagName === 'OPTGROUP'
			};

			data.push(itemData);
			allOptions.push({ data: itemData, attributes: attributes });
		});

		this.data = data;
		this.options = allOptions;
		this.options.forEach(item => {
			if (item.attributes.selected) {
				selectedOptions.push(item);
			}
		});

		this.selectedOptions = selectedOptions;
	}

	renderDropdown() {
		var classes = [
			"nice-select",
			attr(this.el, "class") || "",
			this.disabled ? "disabled" : null,
			this.multiple ? "has-multiple" : null
		];

		let searchHtml = `<div class="nice-select-search-box">
							<input type="text" class="nice-select-search" placeholder="${this.searchtext}..." title="search"/>
						</div>`;

		var html = `<div class="${classes.join(' ')}" tabindex="${this.disabled ? null : 0}">
						<span class="${this.multiple ? 'multiple-options' : 'current'}"></span>
					</div>`;

		this.menu = document.createElement("div");
		this.menu.classList.add("nice-select-menu");
		this.menu.innerHTML = `${this.searchable ? searchHtml : ""} <ul class="list"></ul>`;
		this.menu.OverlayScrollbars = OverlayScrollbars({
			target: this.menu,
			elements: {
				viewport: this.menu.querySelector('.list'),
			}
		},
		{
			paddingAbsolute: true,
			scrollbars: {
				theme: null,
				visibility: 'visible',
				autoHide: 'never',
				autoHideDelay: 1300,
				dragScroll: true,
				clickScroll: true,
				pointers: ['mouse', 'touch', 'pen'],
			}
		});
		
		this.float = document.createElement("div");
		this.float.classList.add("nice-select-float");
		this.float.appendChild(this.menu);
		
		this.el.insertAdjacentHTML("afterend", html);

		this.input = this.el.nextElementSibling;
		this._renderItems();
		this._renderSelectedItems();

		if (this.fitContent && !this.el.classList.contains('wide')) {
			document.body.appendChild(this.float);
			this.input.style.width = `${this.menu.offsetWidth}px`;
			this.float.remove();
		}
	}

	_renderSelectedItems() {
		if (this.multiple) {
			let multipleOptions = this.input.querySelector(".multiple-options");
			var selectedHtml = "";
			if (this.config.showSelectedItems || window.getComputedStyle(this.input).width == 'auto' || this.selectedOptions.length < 2) {
				this.selectedOptions.forEach(function (item) {
					selectedHtml += `<span class="current">${item.data.text}</span>`;
				});

				selectedHtml = selectedHtml == "" ? this.placeholder : selectedHtml;
			} else {
				selectedHtml = this.selectedOptions.length + ' ' + this.selectedtext;
			}
			this.selectedOptions.length === 0 ? multipleOptions.classList.add('placeholder') : multipleOptions.classList.remove('placeholder');
			multipleOptions.innerHTML = selectedHtml;
		} else {
			let current = this.input.querySelector(".current");
			let html;
			if (this.selectedOptions.length > 0 && this.selectedOptions[0].data.value) {
				current.innerHTML = this.selectedOptions[0].data.text;
				current.classList.remove('placeholder');
			}
			else {
				current.innerHTML = this.placeholder;
				current.classList.add('placeholder');
			}
			// let html = this.selectedOptions.length > 0 ? this.selectedOptions[0].data.text : this.placeholder;

			// this.input.querySelector(".current").innerHTML = html;
		}
	}

	_renderItems() {
		var ul = this.menu.querySelector("ul");
		this.options.forEach(item => {
			ul.appendChild(this._renderItem(item));
		});
	}

	_renderItem(option) {
		var el = document.createElement("li");

		el.innerHTML = option.data.display;

		if (option.attributes.optgroup) {
			addClass(el, 'optgroup');
		}
		else {
			el.setAttribute("data-value", option.data.value);
			el.addEventListener("click", this._onItemClicked.bind(this, option));
			el.classList.add("option");
			// if (option.data.value === this.el.value) {
			// 	el.classList.add("selected");
			// }
			if (option.attributes.selected) {
				el.classList.add("selected");
			}
			if (option.attributes.disabled) {
				el.classList.add("disabled");
			}
			if (option.attributes.optgroupOption) {
				el.classList.add("optgroup-option");
			}
		}

		option.element = el;
		return el;
	}

	positionMenu(target, element) {
		computePosition(target, element, {
			placement: this.placement,
			middleware: [
				offset(this.offset),
				this.availableHeight == true && size({
					apply({ availableHeight }) {
						Object.assign(element.style, {
							maxHeight: `${Math.max(100, roundByDPR(availableHeight))}px`,
							height: `${Math.max(100, roundByDPR(availableHeight))}px`,
						});
					},
					padding: this.padding
				}),
				this.sameWidth == true && size({
					apply({ rects }) {
						Object.assign(element.style, {
							width: `${roundByDPR(rects.reference.width)}px`
						});
					}
				}),
				flip({ fallbackStrategy: 'initialPlacement', padding: this.padding, crossAxis: false }),
			]
		}).then(({ x, y, placement }) => {
			Object.assign(element.style, {
				top: `${roundByDPR(y)}px`,
				left: `${roundByDPR(x)}px`
			});

			this.finalPosition = placement;
			if (/^top/.test(placement)) {
				this.menu.style.bottom = 0;
				this.menu.style.top = "";
			}
			if (/^bottom/.test(placement)) {
				this.menu.style.top = 0;
				this.menu.style.bottom = "";
			}
		});
	}

	hideMenu(e) {
		// if (/^top/.test(this.finalPosition)) {
		// 	let bottom = getComputedStyle(this.menu).bottom;
		// 	this.menu.style.bottom = bottom;
		// 	this.menu.style.top = "";
		// }
		// if (/^bottom/.test(this.finalPosition)) {
		// 	let top = getComputedStyle(this.menu).top;
		// 	this.menu.style.top = top;
		// 	this.menu.style.bottom = "";
		// }
		if (this.cleanup) this.cleanup();
		removeClass(this.input, "open");
		removeClass(this.menu, "opening");
		removeClass(this.menu, "open");
		triggerModalClose(this.el);
		this.menu.style.maxHeight = "0";
		setTimeout(() => {
			this.float.remove();
			this.float.style.height = "";
			this.float.style.maxHeight = "";
			this.menu.style.top = "";
			this.menu.style.bottom = "";
		}, parseFloat(getComputedStyle(this.menu).transitionDuration) * 1000);
	}

	update() {
		this.extractData();
		if (this.input) {
			var open = hasClass(this.input, "open");
			this.input.remove();
			this.create();

			if (open) {
				triggerClick(this.input);
			}
		}

		if (attr(this.el, "disabled")) {
			this.disable();
		} else {
			this.enable();
			this.updateSelectValue();
		}
	}

	disable() {
		if (!this.disabled) {
			this.disabled = true;
			addClass(this.input, "disabled");
		}
	}

	enable() {
		if (this.disabled) {
			this.disabled = false;
			removeClass(this.input, "disabled");
		}
	}

	clear() {
		this.resetSelectValue();
		this.selectedOptions = [];
		this._renderSelectedItems();
		this.update();

		triggerChange(this.el);
	}

	destroy() {
		if (this.input) {
			this.input.remove();
			this.el.style.display = "";
		}
	}

	bindEvent() {
		this.input.addEventListener("click", this._onClicked.bind(this));
		this.input.addEventListener("keydown", this._onKeyPressed.bind(this));
		this.input.addEventListener("focusin", triggerFocusIn.bind(this, this.el));
		this.input.addEventListener("focusout", triggerFocusOut.bind(this, this.el));
		this.el.addEventListener("invalid", triggerValidationMessage.bind(this, this.el, 'invalid'));
		window.addEventListener("click", this._onClickedOutside.bind(this));

		if (this.searchable) {
			this._bindSearchEvent();
		}
	}

	_bindSearchEvent() {
		var searchBox = this.menu.querySelector(".nice-select-search");
		if (searchBox) {
			searchBox.addEventListener("click", function (e) {
				e.stopPropagation();
				return false;
			});
		}

		searchBox.addEventListener("input", this._onSearchChanged.bind(this));
		searchBox.addEventListener("keydown", this._onKeyPressed.bind(this));
	}

	_onClicked(e) {
		e.preventDefault();
		var search = this.menu.querySelector(".nice-select-search");
		// e.stopImmediatePropagation();
		if (!hasClass(this.input, "open")) {
			addClass(this.input, "open");
			triggerModalOpen(this.el);
			document.body.appendChild(this.float);
			if (search) search.value = "";

			var t = this.menu.querySelector(".focus");
			removeClass(t, "focus");
			t = this.menu.querySelector(".selected");
			if (!t) t = this.menu.querySelector(".list .option");
			addClass(t, "focus");
			this.menu.querySelectorAll("ul li").forEach(function (item) {
				item.style.display = "";
			});
			this.cleanup = autoUpdate(this.input, this.float, () => {
				this.positionMenu(this.input, this.float);
			}
			);
			scrollIntoView(this.menu.querySelector(".selected"), {
				time: 100, maxSynchronousAlignments: 6, validTarget: function (target, parentsScrolled) {
					return parentsScrolled < 2 && target !== window && target.matches('.list');
				}
			});
			addClass(this.menu, "opening");
			setTimeout(() => {
				addClass(this.menu, "open");
				if (search) search.focus();
			}, parseFloat(getComputedStyle(this.menu).transitionDuration) * 1000);
		} else {
			this.hideMenu(e);
			this.input.focus();
		}
	}
	_onItemClicked(option, e) {
		var optionEl = e.target;

		if (!hasClass(optionEl, "disabled")) {
			if (this.multiple) {
				if (hasClass(optionEl, "selected")) {
					removeClass(optionEl, "selected");
					this.selectedOptions.splice(this.selectedOptions.indexOf(option), 1);
					this.el.querySelector(`option[value="${optionEl.dataset.value}"]`).removeAttribute('selected');
				} else {
					addClass(optionEl, "selected");
					this.selectedOptions.push(option);
				}
			} else {
				this.options.forEach(function (item) {
					removeClass(item.element, "selected");
				});
				this.selectedOptions.forEach(function (item) {
					removeClass(item.element, "selected");
				});

				addClass(optionEl, "selected");
				this.selectedOptions = [option];
			}

			this._renderSelectedItems();
			this.updateSelectValue();
		}
	}

	updateSelectValue() {
		if (this.multiple) {
			var select = this.el;
			this.selectedOptions.forEach(function (item) {
				var el = select.querySelector(`option[value="${item.data.value}"]`);
				if (el) {
					el.setAttribute("selected", true);
				}
			});
		} else if (this.selectedOptions.length > 0) {
			this.el.value = this.selectedOptions[0].data.value;
		}
		triggerChange(this.el);
	}

	resetSelectValue() {
		if (this.multiple) {
			var select = this.el;
			this.selectedOptions.forEach(function (item) {
				var el = select.querySelector(`option[value="${item.data.value}"]`);
				if (el) {
					el.removeAttribute("selected");
				}
			});
		} else if (this.selectedOptions.length > 0) {
			this.el.selectedIndex = -1;
		}

		triggerChange(this.el);
	}

	_onClickedOutside(e) {
		if (!this.input.contains(e.target)) {
			this.hideMenu(e);
		}
	}

	_onKeyPressed(e) {
		// Keyboard events
		let focusedOption = this.menu.querySelector(".focus");
		let isOpen = hasClass(this.input, "open");

		if (!isOpen) {
			// On "Arrow down", "Arrow up", "Space" and "Enter" keys opens the panel
			if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 32 || e.keyCode === 13) {
				e.preventDefault();
				triggerClick(this.input);
			}
		} else {
			switch (e.keyCode) {
				case 13:
				case 32:
					// On "Enter" or "Space" selects the focused element as the selected one
					triggerClick(focusedOption);
					break;

				case 27:
					// On "Escape" closes the panel
					triggerClick(this.input);
					break;

				case 38:
					// On "Arrow up" set focus to the prev option if present
					e.preventDefault();
					this._focusPrev(focusedOption);
					break;

				case 40:
					// On "Arrow down" set focus to the next option if present
					e.preventDefault();
					this._focusNext(focusedOption);
					break;

				default:
					return;
			}
		}
	}

	_findNext(el) {
		if (el) {
			el = el.nextElementSibling;
		} else {
			el = this.menu.querySelector(".list .option");
		}

		while (el) {
			if (!hasClass(el, "optgroup") && !hasClass(el, "disabled") && el.style.display !== "none") {
				return el;
			}
			el = el.nextElementSibling;
		}

		return null;
	}

	_findPrev(el) {
		if (el) {
			el = el.previousElementSibling;
		} else {
			el = this.menu.querySelector(".list .option:last-child");
		}

		while (el) {
			if (!hasClass(el, "optgroup") && !hasClass(el, "disabled") && el.style.display !== "none") {
				return el;
			}
			el = el.previousElementSibling;
		}

		return null;
	}

	_focusNext(focusedOption) {
		var next = this._findNext(focusedOption);
		if (next) {
			var t = this.menu.querySelector(".focus");
			removeClass(t, "focus");
			addClass(next, "focus");
			scrollIntoView(next, {
				time: 250, validTarget: function (target, parentsScrolled) {
					return parentsScrolled < 2 && target !== window && target.matches('.list');
				}
			});
		}
	}

	_focusPrev(focusedOption) {
		var prev = this._findPrev(focusedOption);
		if (prev) {
			var t = this.menu.querySelector(".focus");
			removeClass(t, "focus");
			addClass(prev, "focus");
			scrollIntoView(prev, {
				time: 250, validTarget: function (target, parentsScrolled) {
					return parentsScrolled < 2 && target !== window && target.matches('.list');
				}
			});
		}
	}

	_onSearchChanged(e) {
		var open = hasClass(this.input, "open");
		var text = e.target.value;
		text = text.toLowerCase();

		if (text === "") {
			this.options.forEach(function (item) {
				item.element.style.display = "";
			});
		} else if (open) {
			var matchReg = new RegExp(text);
			this.options.forEach(function (item) {
				var optionText = item.data.text.toLowerCase();
				var matched = matchReg.test(optionText);
				item.element.style.display = matched ? "" : "none";
			});
		}

		this.menu.querySelectorAll(".focus").forEach(function (item) {
			removeClass(item, "focus");
		});

		var firstEl = this._findNext(null);
		addClass(firstEl, "focus");
	}
}

export function bind(el, options) {
	return new NiceSelect(el, options);
}
