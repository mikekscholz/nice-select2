// import "../scss/nice-select2.scss";
import { autoUpdate, computePosition, flip, offset, size } from "@floating-ui/dom";
import { OverlayScrollbars } from 'overlayscrollbars';
import scrollIntoView from 'scroll-into-view';

// utility functions
function triggerClick(el) {
	const event = new MouseEvent("click", {
		view: window,
		bubbles: true,
		cancelable: false,
	});
	el.dispatchEvent(event);
}

function triggerChange(el) {
	const event = new Event("change", {
		bubbles: true,
		cancelable: false
	});
	el.dispatchEvent(event);
}

function triggerFocusIn(el) {
	const event = new FocusEvent("focusin", {
		view: window,
		bubbles: true,
		cancelable: false,
	});
	el.dispatchEvent(event);
}

function triggerFocusOut(el) {
	const event = new FocusEvent("focusout", {
		view: window,
		bubbles: true,
		cancelable: false,
	});
	el.dispatchEvent(event);
}

function triggerValidationMessage(el, type) {
	if (type == 'invalid') {
		addClass(this.inputReplacement, 'invalid');
		removeClass(this.inputReplacement, 'valid');
	} else {
		addClass(this.inputReplacement, 'valid');
		removeClass(this.inputReplacement, 'invalid');
	}
}

function attr(el, key) {
	if (el[key] != undefined) {
		return el[key];
	}
	return el.getAttribute(key);
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
	offset: 1,
	menuPadding: 5,
	menuZ: null,
	menuClass: '',
	placement: "bottom-start"
};

export default class NiceSelect {
	constructor(element, options) {
		this.cleanup;
		this.finalPosition;
		this.el = element;
		this.config = Object.assign({}, defaultOptions, options || {});
		this.data = this.config.data;
		this.hideDelay;
		this.selectedOptions = [];

		this.placeholder = attr(this.el, "placeholder") || this.config.placeholder || "Select an option";
		this.searchtext = attr(this.el, "searchtext") || this.config.searchtext || "Search";
		this.selectedtext = attr(this.el, "selectedtext") || this.config.selectedtext || "selected";

		this.fitContent = Bool(this.el.dataset.fitContent || this.config.fitContent);
		this.sameWidth = Bool(this.el.dataset.sameWidth || this.config.sameWidth);
		this.availableHeight = Bool(this.el.dataset.availableHeight || this.config.availableHeight);
		this.searchable = Bool(this.el.dataset.searchable || this.config.searchable);
		this.offset = Number(this.el.dataset.offset || this.config.offset);
		this.menuClass = this.el.dataset.menuClass?.split(' ') || this.config.menuClass?.split(' ');
		this.menuPadding = Number(this.el.dataset.menuPadding || this.config.menuPadding);
		this.menuZ = Number(this.el.dataset.menuZ || this.config.menuZ);
		this.placement = this.el.dataset.placement || this.config.placement;

		this.inputReplacement = null;
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
		this.el.classList.add('replaced-by-niceselect');
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

		// Menu list of select options/optgroups.
		this.menu = document.createElement("div");
		this.menu.classList.add("nice-select-menu");
		if (this.menuClass.length > 0) this.menuClass.forEach(className => className !== '' && this.menu.classList.add(className));
		if (this.searchable) {
			this.searchBox = document.createElement("div");
			this.searchBox.classList.add('nice-select-search-box');
			this.searchBox.innerHTML = `<input type="text" class="nice-select-search" placeholder="${this.searchtext}..." title="search"/>`;
			this.menu.appendChild(this.searchBox);
		}
		this.list = document.createElement("ul");
		this.list.classList.add('list');
		this.menu.appendChild(this.list);
		this.menu.OverlayScrollbars = OverlayScrollbars({ target: this.menu, elements: { viewport: this.list } }, { paddingAbsolute: true, scrollbars: { theme: null, visibility: 'visible', autoHide: 'never', autoHideDelay: 1300, dragScroll: true, clickScroll: true, pointers: ['mouse', 'touch', 'pen'] } });

		// Menu wrapper with no css transition props for floating-ui's flip middleware to prevent jumps during opening animation. 
		this.float = document.createElement("div");
		this.float.classList.add("nice-select-float");
		this.float.style.setProperty('position', 'absolute', 'important');
		this.float.style.setProperty('padding', '0', 'important');
		this.float.style.setProperty('margin', '0', 'important');
		this.float.style.setProperty('transition', 'none', 'important');
		this.float.style.setProperty('border', 'none', 'important');
		this.float.style.setProperty('box-shadow', 'none', 'important');
		this.float.style.setProperty('box-sizing', 'border-box', 'important');
		this.float.style.setProperty('background', 'none', 'important');
		this.float.style.setProperty('background-color', 'none', 'important');
		this.float.style.setProperty('outline', 'none', 'important');
		this.float.style.setProperty('z-index', this.menuZ, 'important');
		this.float.appendChild(this.menu);

		this.inputReplacement = document.createElement("div");
		this.inputReplacement.classList.add('nice-select');
		this.inputReplacement.tabIndex = this.disabled ? null : 0;
		this.inputReplacement.innerHTML = `<span class="${this.multiple ? 'multiple-options' : 'current'}"></span>`;
		if (this.el.classList.length > 0) this.el.classList.forEach(className => this.inputReplacement.classList.add(className));
		if (this.disabled) this.inputReplacement.classList.add('disabled');
		if (this.multiple) this.inputReplacement.classList.add('has-multiple');

		this.el.after(this.inputReplacement);

		this._renderItems();
		this._renderSelectedItems();

		if (this.fitContent && !this.el.classList.contains('wide')) {
			document.body.appendChild(this.float);
			this.inputReplacement.style.width = `${this.menu.offsetWidth}px`;
			this.float.remove();
		}
	}

	_renderSelectedItems() {
		if (this.multiple) {
			let multipleOptions = this.inputReplacement.querySelector(".multiple-options");
			var selectedHtml = "";
			if (this.config.showSelectedItems || window.getComputedStyle(this.inputReplacement).width == 'auto' || this.selectedOptions.length < 2) {
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
			let current = this.inputReplacement.querySelector(".current");
			let html;
			if (this.selectedOptions.length > 0 && this.selectedOptions[0].data.value) {
				current.innerHTML = this.selectedOptions[0].data.text;
				current.classList.remove('placeholder');
			}
			else {
				current.innerHTML = this.placeholder;
				current.classList.add('placeholder');
			}
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
			el.dataset.value = option.data.value;
			el.addEventListener("click", this._onItemClicked.bind(this, option));
			el.classList.add("option");
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
					padding: this.menuPadding
				}),
				this.sameWidth == true && size({
					apply({ rects }) {
						Object.assign(element.style, {
							width: `${roundByDPR(rects.reference.width)}px`
						});
					}
				}),
				flip({ fallbackStrategy: 'initialPlacement', padding: this.menuPadding, crossAxis: false }),
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
		removeClass(this.inputReplacement, "open");
		removeClass(this.menu, "opening");
		removeClass(this.menu, "open");
		this.menu.style.maxHeight = "0";
		setTimeout(() => {
			if (this.cleanup) this.cleanup();
			this.float.remove();
			this.menu.style.height = "";
			this.menu.style.maxHeight = "";
			this.menu.style.top = "";
			this.menu.style.bottom = "";
		}, this.hideDelay);
	}

	update() {
		this.extractData();
		if (this.inputReplacement) {
			var open = hasClass(this.inputReplacement, "open");
			this.inputReplacement.remove();
			this.create();

			if (open) {
				triggerClick(this.inputReplacement);
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
			addClass(this.inputReplacement, "disabled");
		}
	}

	enable() {
		if (this.disabled) {
			this.disabled = false;
			removeClass(this.inputReplacement, "disabled");
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
		if (this.inputReplacement) {
			this.inputReplacement.remove();
			this.el.style.display = "";
		}
	}

	bindEvent() {
		this.inputReplacement.addEventListener("click", this._onClicked.bind(this));
		this.inputReplacement.addEventListener("keydown", this._onKeyPressed.bind(this));
		this.inputReplacement.addEventListener("focusin", triggerFocusIn.bind(this, this.el));
		this.inputReplacement.addEventListener("focusout", triggerFocusOut.bind(this, this.el));
		this.el.addEventListener("invalid", triggerValidationMessage.bind(this, this.el, 'invalid'));
		this.el.addEventListener("focusin", this._onFocusedNative.bind(this));
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
		if (!hasClass(this.inputReplacement, "open")) {
			addClass(this.inputReplacement, "open");
			document.body.appendChild(this.float);
			this.hideDelay = parseFloat(getComputedStyle(this.menu).transitionDuration) * 1000;
			if (search) search.value = "";

			var t = this.menu.querySelector(".focus");
			removeClass(t, "focus");
			t = this.menu.querySelector(".selected");
			if (!t) t = this.menu.querySelector(".list .option");
			addClass(t, "focus");
			this.menu.querySelectorAll("ul li").forEach(function (item) {
				item.style.display = "";
			});
			this.cleanup = autoUpdate(this.inputReplacement, this.float, () => {
				this.positionMenu(this.inputReplacement, this.float);
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
			this.inputReplacement.focus();
		}
	}
	_onItemClicked(option, e) {
		var optionEl = e.target;

		if (!hasClass(optionEl, "disabled")) {
			if (this.multiple) {
				if (!optionEl.dataset.value) return;
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
			setTimeout(() => { this.updateSelectValue() }, this.hideDelay);
			
		}
		this.inputReplacement.focus();
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
		if (!this.inputReplacement.contains(e.target)) {
			this.hideMenu(e);
		}
	}

	_onKeyPressed(e) {
		// Keyboard events
		let focusedOption = this.menu.querySelector(".focus");
		let isOpen = hasClass(this.inputReplacement, "open");

		if (!isOpen) {
			// On "Arrow down", "Arrow up", "Space" and "Enter" keys opens the panel
			if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 32 || e.keyCode === 13) {
				e.preventDefault();
				triggerClick(this.inputReplacement);
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
					triggerClick(this.inputReplacement);
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
		var open = hasClass(this.inputReplacement, "open");
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

	_onFocusedNative(e) {
		e.preventDefault();
		this.inputReplacement.focus();
	}
}

export function bind(el, options) {
	return new NiceSelect(el, options);
}
