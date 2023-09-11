import "../scss/nice-select2.scss";
import { autoUpdate, computePosition, flip, offset, size } from "@floating-ui/dom";

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
		addClass(this.dropdown, 'invalid');
		removeClass(this.dropdown, 'valid');
	} else {
		addClass(this.dropdown, 'valid');
		removeClass(this.dropdown, 'invalid');
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
	offset: 2,
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
		this.placement = this.el.dataset.placement || this.config.placement;
		
		this.dropdown = null;
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
			if (item.tagName == 'OPTGROUP') {
				var itemData = {
					text: item.label,
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
					selected: item.selected || item.getAttribute("selected") != null,
					disabled: item.disabled || item.getAttribute("disabled") != null
				};
			}

			var attributes = {
				selected: item.selected || item.getAttribute("selected") != null,
				disabled: item.disabled || item.getAttribute("disabled") != null,
				optgroup: item.tagName == 'OPTGROUP'
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
		this.menu.classList.add("nice-select-dropdown");
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

		this.el.insertAdjacentHTML("afterend", html);

		this.dropdown = this.el.nextElementSibling;
		this._renderItems();
		this._renderSelectedItems();
		
		if (this.fitContent && !this.el.classList.contains('wide')) {
			document.body.appendChild(this.menu);
			this.dropdown.style.width = `${this.menu.offsetWidth}px`;
			this.menu.remove();
		}
	}

	_renderSelectedItems() {
		if (this.multiple) {
			let multipleOptions = this.dropdown.querySelector(".multiple-options");
			var selectedHtml = "";
			if (this.config.showSelectedItems || window.getComputedStyle(this.dropdown).width == 'auto' || this.selectedOptions.length < 2) {
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
			let current = this.dropdown.querySelector(".current");
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

			// this.dropdown.querySelector(".current").innerHTML = html;
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
			if (option.data.value === this.el.value) {
				el.classList.add("selected");
			}
			if (option.attributes.selected) {
				el.classList.add("selected");
			}
			if (option.attributes.disabled) {
				el.classList.add("disabled");
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
				flip({ fallbackStrategy: 'bestFit', padding: this.offset }),
				this.availableHeight == true && size({
					apply({ availableHeight }) {
						Object.assign(element.style, {
							maxHeight: `${Math.max(100, availableHeight)}px`,
						});
					},
					padding: this.offset
				}),
				this.sameWidth == true && size({
					apply({ rects }) {
						Object.assign(element.style, {
							width: `${rects.reference.width}px`
						});
					},
					padding: this.offset
				}),
			]
		}).then(({ x, y, placement }) => {
			Object.assign(element.style, {
				top: `${y}px`,
				left: `${x}px`
			});

			this.finalPosition = placement;
		});
	}

	hideMenu(e) {
		if (/^top/.test(this.finalPosition)) {
			let bottom = getComputedStyle(this.menu).bottom;
			this.menu.style.bottom = bottom;
			this.menu.style.top = "";
		}
		if (/^bottom/.test(this.finalPosition)) {
			let top = getComputedStyle(this.menu).top;
			this.menu.style.top = top;
			this.menu.style.bottom = "";
		}
		if (this.cleanup) this.cleanup();
		removeClass(this.dropdown, "open");
		removeClass(this.menu, "opening");
		removeClass(this.menu, "open");
		triggerModalClose(this.el);
		this.menu.style.maxHeight = "0";
		setTimeout(() => {
			this.menu.remove();
			this.menu.style.top = "";
			this.menu.style.bottom = "";
			this.menu.style.maxHeight = "";
		}, parseFloat(getComputedStyle(this.menu).transitionDuration) * 1000);
	}

	update() {
		this.extractData();
		if (this.dropdown) {
			var open = hasClass(this.dropdown, "open");
			this.dropdown.remove();
			this.create();

			if (open) {
				triggerClick(this.dropdown);
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
			addClass(this.dropdown, "disabled");
		}
	}

	enable() {
		if (this.disabled) {
			this.disabled = false;
			removeClass(this.dropdown, "disabled");
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
		if (this.dropdown) {
			this.dropdown.remove();
			this.el.style.display = "";
		}
	}

	bindEvent() {
		this.dropdown.addEventListener("click", this._onClicked.bind(this));
		this.dropdown.addEventListener("keydown", this._onKeyPressed.bind(this));
		this.dropdown.addEventListener("focusin", triggerFocusIn.bind(this, this.el));
		this.dropdown.addEventListener("focusout", triggerFocusOut.bind(this, this.el));
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
		if (!hasClass(this.dropdown, "open")) {
			addClass(this.dropdown, "open");
			triggerModalOpen(this.el);
			document.body.appendChild(this.menu);
			if (search) search.value = "";
			
			var t = this.menu.querySelector(".focus");
			removeClass(t, "focus");
			t = this.menu.querySelector(".selected");
			addClass(t, "focus");
			this.menu.querySelectorAll("ul li").forEach(function (item) {
				item.style.display = "";
			});
			this.cleanup = autoUpdate(this.dropdown, this.menu, () => {
				this.positionMenu(this.dropdown, this.menu);
			}
			);
			scrollIntoView(this.menu.querySelector(".selected"), {
				time: 0, validTarget: function (target, parentsScrolled) {
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
			this.dropdown.focus();
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
		if (!this.dropdown.contains(e.target)) {
			this.hideMenu(e);
		}
	}

	_onKeyPressed(e) {
		// Keyboard events
		let focusedOption = this.menu.querySelector(".focus");
		let isOpen = hasClass(this.dropdown, "open");

		if (!isOpen) {
			// On "Arrow down", "Arrow up", "Space" and "Enter" keys opens the panel
			if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 32|| e.keyCode === 13) {
				e.preventDefault();
				triggerClick(this.dropdown);
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
					triggerClick(this.dropdown);
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
			if (!hasClass(el, "disabled") && el.style.display !== "none") {
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
			if (!hasClass(el, "disabled") && el.style.display !== "none") {
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
		var open = hasClass(this.dropdown, "open");
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
