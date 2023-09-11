/******/ var __webpack_modules__ = ({

/***/ "./src/scss/nice-select2.scss":
/*!************************************!*\
  !*** ./src/scss/nice-select2.scss ***!
  \************************************/
/***/ (() => {

// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/scroll-into-view/scrollIntoView.js":
/*!*********************************************************!*\
  !*** ./node_modules/scroll-into-view/scrollIntoView.js ***!
  \*********************************************************/
/***/ ((module) => {

var COMPLETE = 'complete',
    CANCELED = 'canceled';

function raf(task){
    if('requestAnimationFrame' in window){
        return window.requestAnimationFrame(task);
    }

    setTimeout(task, 16);
}

function setElementScroll(element, x, y){
    Math.max(0, x);
    Math.max(0, y);

    if(element.self === element){
        element.scrollTo(x, y);
    }else{
        element.scrollLeft = x;
        element.scrollTop = y;
    }
}

function getTargetScrollLocation(scrollSettings, parent){
    var align = scrollSettings.align,
        target = scrollSettings.target,
        targetPosition = target.getBoundingClientRect(),
        parentPosition,
        x,
        y,
        differenceX,
        differenceY,
        targetWidth,
        targetHeight,
        leftAlign = align && align.left != null ? align.left : 0.5,
        topAlign = align && align.top != null ? align.top : 0.5,
        leftOffset = align && align.leftOffset != null ? align.leftOffset : 0,
        topOffset = align && align.topOffset != null ? align.topOffset : 0,
        leftScalar = leftAlign,
        topScalar = topAlign;

    if(scrollSettings.isWindow(parent)){
        targetWidth = Math.min(targetPosition.width, parent.innerWidth);
        targetHeight = Math.min(targetPosition.height, parent.innerHeight);
        x = targetPosition.left + parent.pageXOffset - parent.innerWidth * leftScalar + targetWidth * leftScalar;
        y = targetPosition.top + parent.pageYOffset - parent.innerHeight * topScalar + targetHeight * topScalar;
        x -= leftOffset;
        y -= topOffset;
        x = scrollSettings.align.lockX ? parent.pageXOffset : x;
        y = scrollSettings.align.lockY ? parent.pageYOffset : y;
        differenceX = x - parent.pageXOffset;
        differenceY = y - parent.pageYOffset;
    }else{
        targetWidth = targetPosition.width;
        targetHeight = targetPosition.height;
        parentPosition = parent.getBoundingClientRect();
        var offsetLeft = targetPosition.left - (parentPosition.left - parent.scrollLeft);
        var offsetTop = targetPosition.top - (parentPosition.top - parent.scrollTop);
        x = offsetLeft + (targetWidth * leftScalar) - parent.clientWidth * leftScalar;
        y = offsetTop + (targetHeight * topScalar) - parent.clientHeight * topScalar;
        x -= leftOffset;
        y -= topOffset;
        x = Math.max(Math.min(x, parent.scrollWidth - parent.clientWidth), 0);
        y = Math.max(Math.min(y, parent.scrollHeight - parent.clientHeight), 0);
        x = scrollSettings.align.lockX ? parent.scrollLeft : x;
        y = scrollSettings.align.lockY ? parent.scrollTop : y;
        differenceX = x - parent.scrollLeft;
        differenceY = y - parent.scrollTop;
    }

    return {
        x: x,
        y: y,
        differenceX: differenceX,
        differenceY: differenceY
    };
}

function animate(parent){
    var scrollSettings = parent._scrollSettings;

    if(!scrollSettings){
        return;
    }

    var maxSynchronousAlignments = scrollSettings.maxSynchronousAlignments;

    var location = getTargetScrollLocation(scrollSettings, parent),
        time = Date.now() - scrollSettings.startTime,
        timeValue = Math.min(1 / scrollSettings.time * time, 1);

    if(scrollSettings.endIterations >= maxSynchronousAlignments){
        setElementScroll(parent, location.x, location.y);
        parent._scrollSettings = null;
        return scrollSettings.end(COMPLETE);
    }

    var easeValue = 1 - scrollSettings.ease(timeValue);

    setElementScroll(parent,
        location.x - location.differenceX * easeValue,
        location.y - location.differenceY * easeValue
    );

    if(time >= scrollSettings.time){
        scrollSettings.endIterations++;
        // Align ancestor synchronously
        scrollSettings.scrollAncestor && animate(scrollSettings.scrollAncestor);
        animate(parent);
        return;
    }

    raf(animate.bind(null, parent));
}

function defaultIsWindow(target){
    return target.self === target
}

function transitionScrollTo(target, parent, settings, scrollAncestor, callback){
    var idle = !parent._scrollSettings,
        lastSettings = parent._scrollSettings,
        now = Date.now(),
        cancelHandler,
        passiveOptions = { passive: true };

    if(lastSettings){
        lastSettings.end(CANCELED);
    }

    function end(endType){
        parent._scrollSettings = null;

        if(parent.parentElement && parent.parentElement._scrollSettings){
            parent.parentElement._scrollSettings.end(endType);
        }

        if(settings.debug){
            console.log('Scrolling ended with type', endType, 'for', parent)
        }

        callback(endType);
        if(cancelHandler){
            parent.removeEventListener('touchstart', cancelHandler, passiveOptions);
            parent.removeEventListener('wheel', cancelHandler, passiveOptions);
        }
    }

    var maxSynchronousAlignments = settings.maxSynchronousAlignments;

    if(maxSynchronousAlignments == null){
        maxSynchronousAlignments = 3;
    }

    parent._scrollSettings = {
        startTime: now,
        endIterations: 0,
        target: target,
        time: settings.time,
        ease: settings.ease,
        align: settings.align,
        isWindow: settings.isWindow || defaultIsWindow,
        maxSynchronousAlignments: maxSynchronousAlignments,
        end: end,
        scrollAncestor
    };

    if(!('cancellable' in settings) || settings.cancellable){
        cancelHandler = end.bind(null, CANCELED);
        parent.addEventListener('touchstart', cancelHandler, passiveOptions);
        parent.addEventListener('wheel', cancelHandler, passiveOptions);
    }

    if(idle){
        animate(parent);
    }

    return cancelHandler
}

function defaultIsScrollable(element){
    return (
        'pageXOffset' in element ||
        (
            element.scrollHeight !== element.clientHeight ||
            element.scrollWidth !== element.clientWidth
        ) &&
        getComputedStyle(element).overflow !== 'hidden'
    );
}

function defaultValidTarget(){
    return true;
}

function findParentElement(el){
    if (el.assignedSlot) {
        return findParentElement(el.assignedSlot);
    }

    if (el.parentElement) {
        if(el.parentElement.tagName.toLowerCase() === 'body'){
            return el.parentElement.ownerDocument.defaultView || el.parentElement.ownerDocument.ownerWindow;
        }
        return el.parentElement;
    }

    if (el.getRootNode){
        var parent = el.getRootNode()
        if(parent.nodeType === 11) {
            return parent.host;
        }
    }
}

module.exports = function(target, settings, callback){
    if(!target){
        return;
    }

    if(typeof settings === 'function'){
        callback = settings;
        settings = null;
    }

    if(!settings){
        settings = {};
    }

    settings.time = isNaN(settings.time) ? 1000 : settings.time;
    settings.ease = settings.ease || function(v){return 1 - Math.pow(1 - v, v / 2);};
    settings.align = settings.align || {};

    var parent = findParentElement(target),
        parents = 1;

    function done(endType){
        parents--;
        if(!parents){
            callback && callback(endType);
        }
    }

    var validTarget = settings.validTarget || defaultValidTarget;
    var isScrollable = settings.isScrollable;

    if(settings.debug){
        console.log('About to scroll to', target)

        if(!parent){
            console.error('Target did not have a parent, is it mounted in the DOM?')
        }
    }

    var scrollingElements = [];

    while(parent){
        if(settings.debug){
            console.log('Scrolling parent node', parent)
        }

        if(validTarget(parent, parents) && (isScrollable ? isScrollable(parent, defaultIsScrollable) : defaultIsScrollable(parent))){
            parents++;
            scrollingElements.push(parent);
        }

        parent = findParentElement(parent);

        if(!parent){
            done(COMPLETE)
            break;
        }
    }

    return scrollingElements.reduce((cancel, parent, index) => transitionScrollTo(target, parent, settings, scrollingElements[index + 1], done), null);
};


/***/ }),

/***/ "./node_modules/@floating-ui/core/dist/floating-ui.core.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/@floating-ui/core/dist/floating-ui.core.mjs ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computePosition": () => (/* binding */ computePosition),
/* harmony export */   "flip": () => (/* binding */ flip),
/* harmony export */   "offset": () => (/* binding */ offset),
/* harmony export */   "size": () => (/* binding */ size)
/* harmony export */ });
/* unused harmony exports arrow, autoPlacement, detectOverflow, hide, inline, limitShift, shift */
/* harmony import */ var _floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @floating-ui/utils */ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs");



function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSideAxis)(placement);
  const alignmentAxis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignmentAxis)(placement);
  const alignLength = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAxisLength)(alignmentAxis);
  const side = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement);
  const isVertical = sideAxis === 'y';
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case 'right':
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case 'left':
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch ((0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(placement)) {
    case 'start':
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a reference element when it is given a certain positioning strategy.
 *
 * This export does not have any `platform` interface logic. You will need to
 * write one for the platform you are using Floating UI with.
 */
const computePosition = async (reference, floating, config) => {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
  let rects = await platform.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
      continue;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0
  } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
  const paddingObject = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getPaddingObject)(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.rectToClientRect)(await platform.getClippingRect({
    element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === 'floating' ? {
    ...rects.floating,
    x,
    y
  } : rects.reference;
  const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
  const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.rectToClientRect)(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * @see https://floating-ui.com/docs/arrow
 */
const arrow = options => ({
  name: 'arrow',
  options,
  async fn(state) {
    const {
      x,
      y,
      placement,
      rects,
      platform,
      elements
    } = state;
    // Since `element` is required, we don't Partial<> the type.
    const {
      element,
      padding = 0
    } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getPaddingObject)(padding);
    const coords = {
      x,
      y
    };
    const axis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignmentAxis)(placement);
    const length = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAxisLength)(axis);
    const arrowDimensions = await platform.getDimensions(element);
    const isYAxis = axis === 'y';
    const minProp = isYAxis ? 'top' : 'left';
    const maxProp = isYAxis ? 'bottom' : 'right';
    const clientProp = isYAxis ? 'clientHeight' : 'clientWidth';
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;

    // DOM platform can return `window` as the `offsetParent`.
    if (!clientSize || !(await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent)))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;

    // If the padding is large enough that it causes the arrow to no longer be
    // centered, modify the padding so that it is centered.
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.min)(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.min)(paddingObject[maxProp], largestPossiblePadding);

    // Make sure the arrow doesn't overflow the floating element if the center
    // point is outside the floating element's bounds.
    const min$1 = minPadding;
    const max = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.clamp)(min$1, center, max);

    // If the reference is small enough that the arrow's padding causes it to
    // to point to nothing for an aligned placement, adjust the offset of the
    // floating element itself. This stops `shift()` from taking action, but can
    // be worked around by calling it again after the `arrow()` if desired.
    const shouldAddOffset = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(placement) != null && center != offset && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? min$1 - center : max - center : 0;
    return {
      [axis]: coords[axis] - alignmentOffset,
      data: {
        [axis]: offset,
        centerOffset: center - offset + alignmentOffset
      }
    };
  }
});

function getPlacementList(alignment, autoAlignment, allowedPlacements) {
  const allowedPlacementsSortedByAlignment = alignment ? [...allowedPlacements.filter(placement => (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(placement) === alignment), ...allowedPlacements.filter(placement => (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(placement) !== alignment)] : allowedPlacements.filter(placement => (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement) === placement);
  return allowedPlacementsSortedByAlignment.filter(placement => {
    if (alignment) {
      return (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(placement) === alignment || (autoAlignment ? (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getOppositeAlignmentPlacement)(placement) !== placement : false);
    }
    return true;
  });
}
/**
 * Optimizes the visibility of the floating element by choosing the placement
 * that has the most space available automatically, without needing to specify a
 * preferred placement. Alternative to `flip`.
 * @see https://floating-ui.com/docs/autoPlacement
 */
const autoPlacement = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'autoPlacement',
    options,
    async fn(state) {
      var _middlewareData$autoP, _middlewareData$autoP2, _placementsThatFitOnE;
      const {
        rects,
        middlewareData,
        placement,
        platform,
        elements
      } = state;
      const {
        crossAxis = false,
        alignment,
        allowedPlacements = _floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.placements,
        autoAlignment = true,
        ...detectOverflowOptions
      } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
      const placements$1 = alignment !== undefined || allowedPlacements === _floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.placements ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const currentIndex = ((_middlewareData$autoP = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP.index) || 0;
      const currentPlacement = placements$1[currentIndex];
      if (currentPlacement == null) {
        return {};
      }
      const alignmentSides = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignmentSides)(currentPlacement, rects, await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)));

      // Make `computeCoords` start from the right place.
      if (placement !== currentPlacement) {
        return {
          reset: {
            placement: placements$1[0]
          }
        };
      }
      const currentOverflows = [overflow[(0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(currentPlacement)], overflow[alignmentSides[0]], overflow[alignmentSides[1]]];
      const allOverflows = [...(((_middlewareData$autoP2 = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP2.overflows) || []), {
        placement: currentPlacement,
        overflows: currentOverflows
      }];
      const nextPlacement = placements$1[currentIndex + 1];

      // There are more placements to check.
      if (nextPlacement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: nextPlacement
          }
        };
      }
      const placementsSortedByMostSpace = allOverflows.map(d => {
        const alignment = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(d.placement);
        return [d.placement, alignment && crossAxis ?
        // Check along the mainAxis and main crossAxis side.
        d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0) :
        // Check only the mainAxis.
        d.overflows[0], d.overflows];
      }).sort((a, b) => a[1] - b[1]);
      const placementsThatFitOnEachSide = placementsSortedByMostSpace.filter(d => d[2].slice(0,
      // Aligned placements should not check their opposite crossAxis
      // side.
      (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(d[0]) ? 2 : 3).every(v => v <= 0));
      const resetPlacement = ((_placementsThatFitOnE = placementsThatFitOnEachSide[0]) == null ? void 0 : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
      if (resetPlacement !== placement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: resetPlacement
          }
        };
      }
      return {};
    }
  };
};

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'flip',
    options,
    async fn(state) {
      var _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = 'bestFit',
        fallbackAxisSideDirection = 'none',
        flipAlignment = true,
        ...detectOverflowOptions
      } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
      const side = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement);
      const isBasePlacement = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(initialPlacement) === initialPlacement;
      const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [(0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getOppositePlacement)(initialPlacement)] : (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getExpandedPlacements)(initialPlacement));
      if (!specifiedFallbackPlacements && fallbackAxisSideDirection !== 'none') {
        fallbackPlacements.push(...(0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getOppositeAxisPlacements)(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignmentSides)(placement, rects, rtl);
        overflows.push(overflow[sides[0]], overflow[sides[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];

      // One or more sides is overflowing.
      if (!overflows.every(side => side <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          // Try next placement and re-run the lifecycle.
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }

        // First, find the candidates that fit on the mainAxis side of overflow,
        // then find the placement that fits the best on the main crossAxis side.
        let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

        // Otherwise fallback.
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case 'bestFit':
              {
                var _overflowsData$map$so;
                const placement = (_overflowsData$map$so = overflowsData.map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$map$so[0];
                if (placement) {
                  resetPlacement = placement;
                }
                break;
              }
            case 'initialPlacement':
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};

function getSideOffsets(overflow, rect) {
  return {
    top: overflow.top - rect.height,
    right: overflow.right - rect.width,
    bottom: overflow.bottom - rect.height,
    left: overflow.left - rect.width
  };
}
function isAnySideFullyClipped(overflow) {
  return _floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.sides.some(side => overflow[side] >= 0);
}
/**
 * Provides data to hide the floating element in applicable situations, such as
 * when it is not in the same clipping context as the reference element.
 * @see https://floating-ui.com/docs/hide
 */
const hide = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'hide',
    options,
    async fn(state) {
      const {
        rects
      } = state;
      const {
        strategy = 'referenceHidden',
        ...detectOverflowOptions
      } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
      switch (strategy) {
        case 'referenceHidden':
          {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              elementContext: 'reference'
            });
            const offsets = getSideOffsets(overflow, rects.reference);
            return {
              data: {
                referenceHiddenOffsets: offsets,
                referenceHidden: isAnySideFullyClipped(offsets)
              }
            };
          }
        case 'escaped':
          {
            const overflow = await detectOverflow(state, {
              ...detectOverflowOptions,
              altBoundary: true
            });
            const offsets = getSideOffsets(overflow, rects.floating);
            return {
              data: {
                escapedOffsets: offsets,
                escaped: isAnySideFullyClipped(offsets)
              }
            };
          }
        default:
          {
            return {};
          }
      }
    }
  };
};

function getBoundingRect(rects) {
  const minX = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.min)(...rects.map(rect => rect.left));
  const minY = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.min)(...rects.map(rect => rect.top));
  const maxX = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(...rects.map(rect => rect.right));
  const maxY = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(...rects.map(rect => rect.bottom));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
function getRectsByLine(rects) {
  const sortedRects = rects.slice().sort((a, b) => a.y - b.y);
  const groups = [];
  let prevRect = null;
  for (let i = 0; i < sortedRects.length; i++) {
    const rect = sortedRects[i];
    if (!prevRect || rect.y - prevRect.y > prevRect.height / 2) {
      groups.push([rect]);
    } else {
      groups[groups.length - 1].push(rect);
    }
    prevRect = rect;
  }
  return groups.map(rect => (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.rectToClientRect)(getBoundingRect(rect)));
}
/**
 * Provides improved positioning for inline reference elements that can span
 * over multiple lines, such as hyperlinks or range selections.
 * @see https://floating-ui.com/docs/inline
 */
const inline = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'inline',
    options,
    async fn(state) {
      const {
        placement,
        elements,
        rects,
        platform,
        strategy
      } = state;
      // A MouseEvent's client{X,Y} coords can be up to 2 pixels off a
      // ClientRect's bounds, despite the event listener being triggered. A
      // padding of 2 seems to handle this issue.
      const {
        padding = 2,
        x,
        y
      } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
      const nativeClientRects = Array.from((await (platform.getClientRects == null ? void 0 : platform.getClientRects(elements.reference))) || []);
      const clientRects = getRectsByLine(nativeClientRects);
      const fallback = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.rectToClientRect)(getBoundingRect(nativeClientRects));
      const paddingObject = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getPaddingObject)(padding);
      function getBoundingClientRect() {
        // There are two rects and they are disjoined.
        if (clientRects.length === 2 && clientRects[0].left > clientRects[1].right && x != null && y != null) {
          // Find the first rect in which the point is fully inside.
          return clientRects.find(rect => x > rect.left - paddingObject.left && x < rect.right + paddingObject.right && y > rect.top - paddingObject.top && y < rect.bottom + paddingObject.bottom) || fallback;
        }

        // There are 2 or more connected rects.
        if (clientRects.length >= 2) {
          if ((0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSideAxis)(placement) === 'y') {
            const firstRect = clientRects[0];
            const lastRect = clientRects[clientRects.length - 1];
            const isTop = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement) === 'top';
            const top = firstRect.top;
            const bottom = lastRect.bottom;
            const left = isTop ? firstRect.left : lastRect.left;
            const right = isTop ? firstRect.right : lastRect.right;
            const width = right - left;
            const height = bottom - top;
            return {
              top,
              bottom,
              left,
              right,
              width,
              height,
              x: left,
              y: top
            };
          }
          const isLeftSide = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement) === 'left';
          const maxRight = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(...clientRects.map(rect => rect.right));
          const minLeft = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.min)(...clientRects.map(rect => rect.left));
          const measureRects = clientRects.filter(rect => isLeftSide ? rect.left === minLeft : rect.right === maxRight);
          const top = measureRects[0].top;
          const bottom = measureRects[measureRects.length - 1].bottom;
          const left = minLeft;
          const right = maxRight;
          const width = right - left;
          const height = bottom - top;
          return {
            top,
            bottom,
            left,
            right,
            width,
            height,
            x: left,
            y: top
          };
        }
        return fallback;
      }
      const resetRects = await platform.getElementRects({
        reference: {
          getBoundingClientRect
        },
        floating: elements.floating,
        strategy
      });
      if (rects.reference.x !== resetRects.reference.x || rects.reference.y !== resetRects.reference.y || rects.reference.width !== resetRects.reference.width || rects.reference.height !== resetRects.reference.height) {
        return {
          reset: {
            rects: resetRects
          }
        };
      }
      return {};
    }
  };
};

// For type backwards-compatibility, the `OffsetOptions` type was also
// Derivable.
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform,
    elements
  } = state;
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
  const side = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement);
  const alignment = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(placement);
  const isVertical = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSideAxis)(placement) === 'y';
  const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);

  // eslint-disable-next-line prefer-const
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === 'number' ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: 0,
    crossAxis: 0,
    alignmentAxis: null,
    ...rawValue
  };
  if (alignment && typeof alignmentAxis === 'number') {
    crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset = function (options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: 'offset',
    options,
    async fn(state) {
      const {
        x,
        y
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: diffCoords
      };
    }
  };
};

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'shift',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: _ref => {
            let {
              x,
              y
            } = _ref;
            return {
              x,
              y
            };
          }
        },
        ...detectOverflowOptions
      } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSideAxis)((0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement));
      const mainAxis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getOppositeAxis)(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === 'y' ? 'top' : 'left';
        const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
        const min = mainAxisCoord + overflow[minSide];
        const max = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.clamp)(min, mainAxisCoord, max);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === 'y' ? 'top' : 'left';
        const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
        const min = crossAxisCoord + overflow[minSide];
        const max = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.clamp)(min, crossAxisCoord, max);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y
        }
      };
    }
  };
};
/**
 * Built-in `limiter` that will stop `shift()` at a certain point.
 */
const limitShift = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    options,
    fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        middlewareData
      } = state;
      const {
        offset = 0,
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true
      } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
      const coords = {
        x,
        y
      };
      const crossAxis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSideAxis)(placement);
      const mainAxis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getOppositeAxis)(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const rawOffset = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(offset, state);
      const computedOffset = typeof rawOffset === 'number' ? {
        mainAxis: rawOffset,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...rawOffset
      };
      if (checkMainAxis) {
        const len = mainAxis === 'y' ? 'height' : 'width';
        const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
        const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
        if (mainAxisCoord < limitMin) {
          mainAxisCoord = limitMin;
        } else if (mainAxisCoord > limitMax) {
          mainAxisCoord = limitMax;
        }
      }
      if (checkCrossAxis) {
        var _middlewareData$offse, _middlewareData$offse2;
        const len = mainAxis === 'y' ? 'width' : 'height';
        const isOriginSide = ['top', 'left'].includes((0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement));
        const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
        const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
        if (crossAxisCoord < limitMin) {
          crossAxisCoord = limitMin;
        } else if (crossAxisCoord > limitMax) {
          crossAxisCoord = limitMax;
        }
      }
      return {
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      };
    }
  };
};

/**
 * Provides data that allows you to change the size of the floating element —
 * for instance, prevent it from overflowing the clipping boundary or match the
 * width of the reference element.
 * @see https://floating-ui.com/docs/size
 */
const size = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'size',
    options,
    async fn(state) {
      const {
        placement,
        rects,
        platform,
        elements
      } = state;
      const {
        apply = () => {},
        ...detectOverflowOptions
      } = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.evaluate)(options, state);
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const side = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSide)(placement);
      const alignment = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getAlignment)(placement);
      const isYAxis = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.getSideAxis)(placement) === 'y';
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === 'top' || side === 'bottom') {
        heightSide = side;
        widthSide = alignment === ((await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating))) ? 'start' : 'end') ? 'left' : 'right';
      } else {
        widthSide = side;
        heightSide = alignment === 'end' ? 'top' : 'bottom';
      }
      const overflowAvailableHeight = height - overflow[heightSide];
      const overflowAvailableWidth = width - overflow[widthSide];
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if (isYAxis) {
        const maximumClippingWidth = width - overflow.left - overflow.right;
        availableWidth = alignment || noShift ? (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.min)(overflowAvailableWidth, maximumClippingWidth) : maximumClippingWidth;
      } else {
        const maximumClippingHeight = height - overflow.top - overflow.bottom;
        availableHeight = alignment || noShift ? (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.min)(overflowAvailableHeight, maximumClippingHeight) : maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(overflow.left, 0);
        const xMax = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(overflow.right, 0);
        const yMin = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(overflow.top, 0);
        const yMax = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.max)(overflow.top, overflow.bottom));
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};




/***/ }),

/***/ "./node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs":
/*!****************************************************************!*\
  !*** ./node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "autoUpdate": () => (/* binding */ autoUpdate),
/* harmony export */   "computePosition": () => (/* binding */ computePosition)
/* harmony export */ });
/* unused harmony export platform */
/* harmony import */ var _floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @floating-ui/utils */ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs");
/* harmony import */ var _floating_ui_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @floating-ui/core */ "./node_modules/@floating-ui/core/dist/floating-ui.core.mjs");
/* harmony import */ var _floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @floating-ui/utils/dom */ "./node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.mjs");






function getCssDimensions(element) {
  const css = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(element);
  // In testing environments, the `width` and `height` properties are empty
  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.round)(width) !== offsetWidth || (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.round)(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}

function unwrapElement(element) {
  return !(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement)(element) ? element.contextElement : element;
}

function getScale(element) {
  const domElement = unwrapElement(element);
  if (!(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(domElement)) {
    return (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.round)(rect.width) : rect.width) / width;
  let y = ($ ? (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.round)(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}

const noOffsets = /*#__PURE__*/(0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(0);
function getVisualOffsets(element) {
  const win = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)(element);
  if (!(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isWebKit)() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)(element)) {
    return false;
  }
  return isFixed;
}

function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(1);
  if (includeScale) {
    if (offsetParent) {
      if ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement)(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)(domElement);
    const offsetWin = offsetParent && (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement)(offsetParent) ? (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)(offsetParent) : offsetParent;
    let currentIFrame = win.frameElement;
    while (currentIFrame && offsetParent && offsetWin !== win) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentIFrame = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)(currentIFrame).frameElement;
    }
  }
  return (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.rectToClientRect)({
    width,
    height,
    x,
    y
  });
}

function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isOffsetParentAnElement = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(offsetParent);
  const documentElement = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement)(offsetParent);
  if (offsetParent === documentElement) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(1);
  const offsets = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== 'fixed') {
    if ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeName)(offsetParent) !== 'body' || (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isOverflowElement)(documentElement)) {
      scroll = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeScroll)(offsetParent);
    }
    if ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
  };
}

function getClientRects(element) {
  return Array.from(element.getClientRects());
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  return getBoundingClientRect((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement)(element)).left + (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeScroll)(element).scrollLeft;
}

// Gets the entire size of the scrollable document area, even extending outside
// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
function getDocumentRect(element) {
  const html = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement)(element);
  const scroll = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeScroll)(element);
  const body = element.ownerDocument.body;
  const width = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.max)(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.max)(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(body).direction === 'rtl') {
    x += (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.max)(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

function getViewportRect(element, strategy) {
  const win = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)(element);
  const html = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement)(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isWebKit)();
    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Returns the inner client rect, subtracting scrollbars if present.
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(element) ? getScale(element) : (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === 'viewport') {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === 'document') {
    rect = getDocumentRect((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement)(element));
  } else if ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement)(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      ...clippingAncestor,
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y
    };
  }
  return (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.rectToClientRect)(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getParentNode)(element);
  if (parentNode === stopNode || !(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement)(parentNode) || (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isLastTraversableNode)(parentNode)) {
    return false;
  }
  return (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
}

// A "clipping ancestor" is an `overflow` element with the characteristic of
// clipping (or hiding) child elements. This returns all clipping ancestors
// of the given element up the tree.
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getOverflowAncestors)(element).filter(el => (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement)(el) && (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeName)(el) !== 'body');
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(element).position === 'fixed';
  let currentNode = elementIsFixed ? (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getParentNode)(element) : element;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  while ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement)(currentNode) && !(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isLastTraversableNode)(currentNode)) {
    const computedStyle = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(currentNode);
    const currentNodeIsContaining = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isContainingBlock)(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isOverflowElement)(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      // Drop non-containing blocks.
      result = result.filter(ancestor => ancestor !== currentNode);
    } else {
      // Record last containing block for next iteration.
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getParentNode)(currentNode);
  }
  cache.set(element, result);
  return result;
}

// Gets the maximum area that the element is visible in due to any number of
// clipping ancestors.
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === 'clippingAncestors' ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.max)(rect.top, accRect.top);
    accRect.right = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.min)(rect.right, accRect.right);
    accRect.bottom = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.min)(rect.bottom, accRect.bottom);
    accRect.left = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.max)(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}

function getDimensions(element) {
  return getCssDimensions(element);
}

function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(offsetParent);
  const documentElement = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement)(offsetParent);
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.createCoords)(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeName)(offsetParent) !== 'body' || (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isOverflowElement)(documentElement)) {
      scroll = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeScroll)(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function getTrueOffsetParent(element, polyfill) {
  if (!(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(element) || (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(element).position === 'fixed') {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  return element.offsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element, polyfill) {
  const window = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)(element);
  if (!(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isHTMLElement)(element)) {
    return window;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isTableElement)(offsetParent) && (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && ((0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeName)(offsetParent) === 'html' || (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getNodeName)(offsetParent) === 'body' && (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(offsetParent).position === 'static' && !(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isContainingBlock)(offsetParent))) {
    return window;
  }
  return offsetParent || (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getContainingBlock)(element) || window;
}

const getElementRects = async function (_ref) {
  let {
    reference,
    floating,
    strategy
  } = _ref;
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  return {
    reference: getRectRelativeToOffsetParent(reference, await getOffsetParentFn(floating), strategy),
    floating: {
      x: 0,
      y: 0,
      ...(await getDimensionsFn(floating))
    }
  };
};

function isRTL(element) {
  return (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getComputedStyle)(element).direction === 'rtl';
}

const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement: _floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement: _floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.isElement,
  isRTL
};

// https://samthor.au/2021/observing-dom/
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getDocumentElement)(element);
  function cleanup() {
    clearTimeout(timeoutId);
    io && io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.floor)(top);
    const insetRight = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.floor)(root.clientWidth - (left + width));
    const insetBottom = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.floor)(root.clientHeight - (top + height));
    const insetLeft = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.floor)(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.max)(0, (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_1__.min)(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 100);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }

    // Older browsers don't support a `document` as the root and will throw an
    // error.
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}

/**
 * Automatically updates the position of the floating element when necessary.
 * Should only be called when the floating element is mounted on the DOM or
 * visible on the screen.
 * @returns cleanup function that should be invoked when the floating element is
 * removed from the DOM or hidden from the screen.
 * @see https://floating-ui.com/docs/autoUpdate
 */
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === 'function',
    layoutShift = typeof IntersectionObserver === 'function',
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? (0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getOverflowAncestors)(referenceEl) : []), ...(0,_floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getOverflowAncestors)(floating)] : [];
  ancestors.forEach(ancestor => {
    ancestorScroll && ancestor.addEventListener('scroll', update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener('resize', update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver(_ref => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        // Prevent update loops when using the `size` middleware.
        // https://github.com/floating-ui/floating-ui/issues/1740
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          resizeObserver && resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.removeEventListener('scroll', update);
      ancestorResize && ancestor.removeEventListener('resize', update);
    });
    cleanupIo && cleanupIo();
    resizeObserver && resizeObserver.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a reference element when it is given a certain CSS positioning
 * strategy.
 */
const computePosition = (reference, floating, options) => {
  // This caches the expensive `getClippingElementAncestors` function so that
  // multiple lifecycle resets re-use the same result. It only lives for a
  // single call. If other functions become expensive, we can add them as well.
  const cache = new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return (0,_floating_ui_core__WEBPACK_IMPORTED_MODULE_2__.computePosition)(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};




/***/ }),

/***/ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs":
/*!********************************************************************!*\
  !*** ./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clamp": () => (/* binding */ clamp),
/* harmony export */   "createCoords": () => (/* binding */ createCoords),
/* harmony export */   "evaluate": () => (/* binding */ evaluate),
/* harmony export */   "floor": () => (/* binding */ floor),
/* harmony export */   "getAlignment": () => (/* binding */ getAlignment),
/* harmony export */   "getAlignmentAxis": () => (/* binding */ getAlignmentAxis),
/* harmony export */   "getAlignmentSides": () => (/* binding */ getAlignmentSides),
/* harmony export */   "getAxisLength": () => (/* binding */ getAxisLength),
/* harmony export */   "getExpandedPlacements": () => (/* binding */ getExpandedPlacements),
/* harmony export */   "getOppositeAlignmentPlacement": () => (/* binding */ getOppositeAlignmentPlacement),
/* harmony export */   "getOppositeAxis": () => (/* binding */ getOppositeAxis),
/* harmony export */   "getOppositeAxisPlacements": () => (/* binding */ getOppositeAxisPlacements),
/* harmony export */   "getOppositePlacement": () => (/* binding */ getOppositePlacement),
/* harmony export */   "getPaddingObject": () => (/* binding */ getPaddingObject),
/* harmony export */   "getSide": () => (/* binding */ getSide),
/* harmony export */   "getSideAxis": () => (/* binding */ getSideAxis),
/* harmony export */   "max": () => (/* binding */ max),
/* harmony export */   "min": () => (/* binding */ min),
/* harmony export */   "placements": () => (/* binding */ placements),
/* harmony export */   "rectToClientRect": () => (/* binding */ rectToClientRect),
/* harmony export */   "round": () => (/* binding */ round),
/* harmony export */   "sides": () => (/* binding */ sides)
/* harmony export */ });
/* unused harmony exports alignments, expandPaddingObject */
const sides = ['top', 'right', 'bottom', 'left'];
const alignments = ['start', 'end'];
const placements = /*#__PURE__*/sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = v => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
const oppositeAlignmentMap = {
  start: 'end',
  end: 'start'
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
function getSideAxis(placement) {
  return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ['left', 'right'];
  const rl = ['right', 'left'];
  const tb = ['top', 'bottom'];
  const bt = ['bottom', 'top'];
  switch (side) {
    case 'top':
    case 'bottom':
      if (rtl) return isStart ? rl : lr;
      return isStart ? lr : rl;
    case 'left':
    case 'right':
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === 'start', rtl);
  if (alignment) {
    list = list.map(side => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  return {
    ...rect,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  };
}




/***/ }),

/***/ "./node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.mjs":
/*!****************************************************************************!*\
  !*** ./node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.mjs ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getComputedStyle": () => (/* binding */ getComputedStyle),
/* harmony export */   "getContainingBlock": () => (/* binding */ getContainingBlock),
/* harmony export */   "getDocumentElement": () => (/* binding */ getDocumentElement),
/* harmony export */   "getNodeName": () => (/* binding */ getNodeName),
/* harmony export */   "getNodeScroll": () => (/* binding */ getNodeScroll),
/* harmony export */   "getOverflowAncestors": () => (/* binding */ getOverflowAncestors),
/* harmony export */   "getParentNode": () => (/* binding */ getParentNode),
/* harmony export */   "getWindow": () => (/* binding */ getWindow),
/* harmony export */   "isContainingBlock": () => (/* binding */ isContainingBlock),
/* harmony export */   "isElement": () => (/* binding */ isElement),
/* harmony export */   "isHTMLElement": () => (/* binding */ isHTMLElement),
/* harmony export */   "isLastTraversableNode": () => (/* binding */ isLastTraversableNode),
/* harmony export */   "isOverflowElement": () => (/* binding */ isOverflowElement),
/* harmony export */   "isTableElement": () => (/* binding */ isTableElement),
/* harmony export */   "isWebKit": () => (/* binding */ isWebKit)
/* harmony export */ });
/* unused harmony exports getNearestOverflowAncestor, isNode, isShadowRoot */
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null ? void 0 : (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  // Browsers without `ShadowRoot` support.
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !['inline', 'contents'].includes(display);
}
function isTableElement(element) {
  return ['table', 'td', 'th'].includes(getNodeName(element));
}
function isContainingBlock(element) {
  const webkit = isWebKit();
  const css = getComputedStyle(element);

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  return css.transform !== 'none' || css.perspective !== 'none' || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || ['transform', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else {
      currentNode = getParentNode(currentNode);
    }
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('-webkit-backdrop-filter', 'none');
}
function isLastTraversableNode(node) {
  return ['html', 'body', '#document'].includes(getNodeName(node));
}
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.pageXOffset,
    scrollTop: element.pageYOffset
  };
}
function getParentNode(node) {
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor));
}




/***/ }),

/***/ "./node_modules/overlayscrollbars/overlayscrollbars.mjs":
/*!**************************************************************!*\
  !*** ./node_modules/overlayscrollbars/overlayscrollbars.mjs ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OverlayScrollbars": () => (/* binding */ OverlayScrollbars)
/* harmony export */ });
/* unused harmony exports ClickScrollPlugin, ScrollbarsHidingPlugin, SizeObserverPlugin */
/*!
 * OverlayScrollbars
 * Version: 2.3.0
 *
 * Copyright (c) Rene Haas | KingSora.
 * https://github.com/KingSora
 *
 * Released under the MIT license.
 */

function each(t, n) {
  if (isArrayLike(t)) {
    for (let o = 0; o < t.length; o++) {
      if (false === n(t[o], o, t)) {
        break;
      }
    }
  } else if (t) {
    each(Object.keys(t), (o => n(t[o], o, t)));
  }
  return t;
}

function style(t, n) {
  const o = isString(n);
  const s = isArray(n) || o;
  if (s) {
    let s = o ? "" : {};
    if (t) {
      const e = window.getComputedStyle(t, null);
      s = o ? getCSSVal(t, e, n) : n.reduce(((n, o) => {
        n[o] = getCSSVal(t, e, o);
        return n;
      }), s);
    }
    return s;
  }
  t && each(keys(n), (o => setCSSVal(t, o, n[o])));
}

const createCache = (t, n) => {
  const {o: o, u: s, _: e} = t;
  let c = o;
  let r;
  const cacheUpdateContextual = (t, n) => {
    const o = c;
    const l = t;
    const i = n || (s ? !s(o, l) : o !== l);
    if (i || e) {
      c = l;
      r = o;
    }
    return [ c, i, r ];
  };
  const cacheUpdateIsolated = t => cacheUpdateContextual(n(c, r), t);
  const getCurrentCache = t => [ c, !!t, r ];
  return [ n ? cacheUpdateIsolated : cacheUpdateContextual, getCurrentCache ];
};

const isClient = () => "undefined" !== typeof window;

const t = isClient() && Node.ELEMENT_NODE;

const {toString: n, hasOwnProperty: o} = Object.prototype;

const isUndefined = t => void 0 === t;

const isNull = t => null === t;

const type = t => isUndefined(t) || isNull(t) ? `${t}` : n.call(t).replace(/^\[object (.+)\]$/, "$1").toLowerCase();

const isNumber = t => "number" === typeof t;

const isString = t => "string" === typeof t;

const isBoolean = t => "boolean" === typeof t;

const isFunction = t => "function" === typeof t;

const isArray = t => Array.isArray(t);

const isObject = t => "object" === typeof t && !isArray(t) && !isNull(t);

const isArrayLike = t => {
  const n = !!t && t.length;
  const o = isNumber(n) && n > -1 && n % 1 == 0;
  return isArray(t) || !isFunction(t) && o ? n > 0 && isObject(t) ? n - 1 in t : true : false;
};

const isPlainObject = t => {
  if (!t || !isObject(t) || "object" !== type(t)) {
    return false;
  }
  let n;
  const s = "constructor";
  const e = t[s];
  const c = e && e.prototype;
  const r = o.call(t, s);
  const l = c && o.call(c, "isPrototypeOf");
  if (e && !r && !l) {
    return false;
  }
  for (n in t) {}
  return isUndefined(n) || o.call(t, n);
};

const isHTMLElement = n => {
  const o = HTMLElement;
  return n ? o ? n instanceof o : n.nodeType === t : false;
};

const isElement = n => {
  const o = Element;
  return n ? o ? n instanceof o : n.nodeType === t : false;
};

const indexOf = (t, n, o) => t.indexOf(n, o);

const push = (t, n, o) => {
  !o && !isString(n) && isArrayLike(n) ? Array.prototype.push.apply(t, n) : t.push(n);
  return t;
};

const from = t => {
  const n = Array.from;
  const o = [];
  if (n && t) {
    return n(t);
  }
  if (t instanceof Set) {
    t.forEach((t => {
      push(o, t);
    }));
  } else {
    each(t, (t => {
      push(o, t);
    }));
  }
  return o;
};

const isEmptyArray = t => !!t && 0 === t.length;

const runEachAndClear = (t, n, o) => {
  const runFn = t => t && t.apply(void 0, n || []);
  each(t, runFn);
  !o && (t.length = 0);
};

const hasOwnProperty = (t, n) => Object.prototype.hasOwnProperty.call(t, n);

const keys = t => t ? Object.keys(t) : [];

const assignDeep = (t, n, o, s, e, c, r) => {
  const l = [ n, o, s, e, c, r ];
  if (("object" !== typeof t || isNull(t)) && !isFunction(t)) {
    t = {};
  }
  each(l, (n => {
    each(keys(n), (o => {
      const s = n[o];
      if (t === s) {
        return true;
      }
      const e = isArray(s);
      if (s && (isPlainObject(s) || e)) {
        const n = t[o];
        let c = n;
        if (e && !isArray(n)) {
          c = [];
        } else if (!e && !isPlainObject(n)) {
          c = {};
        }
        t[o] = assignDeep(c, s);
      } else {
        t[o] = s;
      }
    }));
  }));
  return t;
};

const isEmptyObject = t => {
  for (const n in t) {
    return false;
  }
  return true;
};

const getSetProp = (t, n, o, s) => {
  if (isUndefined(s)) {
    return o ? o[t] : n;
  }
  o && (isString(s) || isNumber(s)) && (o[t] = s);
};

const attr = (t, n, o) => {
  if (isUndefined(o)) {
    return t ? t.getAttribute(n) : null;
  }
  t && t.setAttribute(n, o);
};

const removeAttr = (t, n) => {
  t && t.removeAttribute(n);
};

const attrClass = (t, n, o, s) => {
  if (o) {
    const e = attr(t, n) || "";
    const c = new Set(e.split(" "));
    c[s ? "add" : "delete"](o);
    const r = from(c).join(" ").trim();
    attr(t, n, r);
  }
};

const hasAttrClass = (t, n, o) => {
  const s = attr(t, n) || "";
  const e = new Set(s.split(" "));
  return e.has(o);
};

const scrollLeft = (t, n) => getSetProp("scrollLeft", 0, t, n);

const scrollTop = (t, n) => getSetProp("scrollTop", 0, t, n);

const s = isClient() && Element.prototype;

const find = (t, n) => {
  const o = [];
  const s = n ? isElement(n) ? n : null : document;
  return s ? push(o, s.querySelectorAll(t)) : o;
};

const findFirst = (t, n) => {
  const o = n ? isElement(n) ? n : null : document;
  return o ? o.querySelector(t) : null;
};

const is = (t, n) => {
  if (isElement(t)) {
    const o = s.matches || s.msMatchesSelector;
    return o.call(t, n);
  }
  return false;
};

const contents = t => t ? from(t.childNodes) : [];

const parent = t => t ? t.parentElement : null;

const closest = (t, n) => {
  if (isElement(t)) {
    const o = s.closest;
    if (o) {
      return o.call(t, n);
    }
    do {
      if (is(t, n)) {
        return t;
      }
      t = parent(t);
    } while (t);
  }
  return null;
};

const liesBetween = (t, n, o) => {
  const s = t && closest(t, n);
  const e = t && findFirst(o, s);
  const c = closest(e, n) === s;
  return s && e ? s === t || e === t || c && closest(closest(t, o), n) !== s : false;
};

const before = (t, n, o) => {
  if (o && t) {
    let s = n;
    let e;
    if (isArrayLike(o)) {
      e = document.createDocumentFragment();
      each(o, (t => {
        if (t === s) {
          s = t.previousSibling;
        }
        e.appendChild(t);
      }));
    } else {
      e = o;
    }
    if (n) {
      if (!s) {
        s = t.firstChild;
      } else if (s !== n) {
        s = s.nextSibling;
      }
    }
    t.insertBefore(e, s || null);
  }
};

const appendChildren = (t, n) => {
  before(t, null, n);
};

const insertBefore = (t, n) => {
  before(parent(t), t, n);
};

const insertAfter = (t, n) => {
  before(parent(t), t && t.nextSibling, n);
};

const removeElements = t => {
  if (isArrayLike(t)) {
    each(from(t), (t => removeElements(t)));
  } else if (t) {
    const n = parent(t);
    if (n) {
      n.removeChild(t);
    }
  }
};

const createDiv = t => {
  const n = document.createElement("div");
  if (t) {
    attr(n, "class", t);
  }
  return n;
};

const createDOM = t => {
  const n = createDiv();
  n.innerHTML = t.trim();
  return each(contents(n), (t => removeElements(t)));
};

const firstLetterToUpper = t => t.charAt(0).toUpperCase() + t.slice(1);

const getDummyStyle = () => createDiv().style;

const e = [ "-webkit-", "-moz-", "-o-", "-ms-" ];

const c = [ "WebKit", "Moz", "O", "MS", "webkit", "moz", "o", "ms" ];

const r = {};

const l = {};

const cssProperty = t => {
  let n = l[t];
  if (hasOwnProperty(l, t)) {
    return n;
  }
  const o = firstLetterToUpper(t);
  const s = getDummyStyle();
  each(e, (e => {
    const c = e.replace(/-/g, "");
    const r = [ t, e + t, c + o, firstLetterToUpper(c) + o ];
    return !(n = r.find((t => void 0 !== s[t])));
  }));
  return l[t] = n || "";
};

const jsAPI = t => {
  if (isClient()) {
    let n = r[t] || window[t];
    if (hasOwnProperty(r, t)) {
      return n;
    }
    each(c, (o => {
      n = n || window[o + firstLetterToUpper(t)];
      return !n;
    }));
    r[t] = n;
    return n;
  }
};

const i = jsAPI("MutationObserver");

const a = jsAPI("IntersectionObserver");

const u = jsAPI("ResizeObserver");

const f = jsAPI("cancelAnimationFrame");

const d = jsAPI("requestAnimationFrame");

const _ = jsAPI("ScrollTimeline");

const h = isClient() && window.setTimeout;

const g = isClient() && window.clearTimeout;

const v = /[^\x20\t\r\n\f]+/g;

const classListAction = (t, n, o) => {
  const s = t && t.classList;
  let e;
  let c = 0;
  let r = false;
  if (s && n && isString(n)) {
    const t = n.match(v) || [];
    r = t.length > 0;
    while (e = t[c++]) {
      r = !!o(s, e) && r;
    }
  }
  return r;
};

const removeClass = (t, n) => {
  classListAction(t, n, ((t, n) => t.remove(n)));
};

const addClass = (t, n) => {
  classListAction(t, n, ((t, n) => t.add(n)));
  return removeClass.bind(0, t, n);
};

const {max: p} = Math;

const animationCurrentTime = () => performance.now();

const animateNumber = (t, n, o, s, e) => {
  let c = 0;
  const r = animationCurrentTime();
  const l = p(0, o);
  const frame = o => {
    const i = animationCurrentTime();
    const a = i - r;
    const u = a >= l;
    const f = o ? 1 : 1 - (p(0, r + l - i) / l || 0);
    const _ = (n - t) * (isFunction(e) ? e(f, f * l, 0, 1, l) : f) + t;
    const h = u || 1 === f;
    s && s(_, f, h);
    c = h ? 0 : d((() => frame()));
  };
  frame();
  return t => {
    f(c);
    t && frame(t);
  };
};

const equal = (t, n, o, s) => {
  if (t && n) {
    let e = true;
    each(o, (o => {
      const c = s ? s(t[o]) : t[o];
      const r = s ? s(n[o]) : n[o];
      if (c !== r) {
        e = false;
      }
    }));
    return e;
  }
  return false;
};

const equalWH = (t, n) => equal(t, n, [ "w", "h" ]);

const equalXY = (t, n) => equal(t, n, [ "x", "y" ]);

const equalTRBL = (t, n) => equal(t, n, [ "t", "r", "b", "l" ]);

const equalBCRWH = (t, n, o) => equal(t, n, [ "width", "height" ], o && (t => Math.round(t)));

const noop = () => {};

const selfClearTimeout = t => {
  let n;
  const o = t ? h : d;
  const s = t ? g : f;
  return [ e => {
    s(n);
    n = o(e, isFunction(t) ? t() : t);
  }, () => s(n) ];
};

const debounce = (t, n) => {
  let o;
  let s;
  let e;
  let c = noop;
  const {g: r, v: l, p: i} = n || {};
  const a = function invokeFunctionToDebounce(n) {
    c();
    g(o);
    o = s = void 0;
    c = noop;
    t.apply(this, n);
  };
  const mergeParms = t => i && s ? i(s, t) : t;
  const flush = () => {
    if (c !== noop) {
      a(mergeParms(e) || e);
    }
  };
  const u = function debouncedFn() {
    const t = from(arguments);
    const n = isFunction(r) ? r() : r;
    const i = isNumber(n) && n >= 0;
    if (i) {
      const r = isFunction(l) ? l() : l;
      const i = isNumber(r) && r >= 0;
      const u = n > 0 ? h : d;
      const _ = n > 0 ? g : f;
      const v = mergeParms(t);
      const p = v || t;
      const w = a.bind(0, p);
      c();
      const b = u(w, n);
      c = () => _(b);
      if (i && !o) {
        o = h(flush, r);
      }
      s = e = p;
    } else {
      a(t);
    }
  };
  u.m = flush;
  return u;
};

const w = {
  opacity: 1,
  zIndex: 1
};

const parseToZeroOrNumber = (t, n) => {
  const o = t || "";
  const s = n ? parseFloat(o) : parseInt(o, 10);
  return s === s ? s : 0;
};

const adaptCSSVal = (t, n) => !w[t] && isNumber(n) ? `${n}px` : n;

const getCSSVal = (t, n, o) => String((null != n ? n[o] || n.getPropertyValue(o) : t.style[o]) || "");

const setCSSVal = (t, n, o) => {
  try {
    const {style: s} = t;
    if (!isUndefined(s[n])) {
      s[n] = adaptCSSVal(n, o);
    } else {
      s.setProperty(n, o);
    }
  } catch (s) {}
};

const directionIsRTL = t => "rtl" === style(t, "direction");

const topRightBottomLeft = (t, n, o) => {
  const s = n ? `${n}-` : "";
  const e = o ? `-${o}` : "";
  const c = `${s}top${e}`;
  const r = `${s}right${e}`;
  const l = `${s}bottom${e}`;
  const i = `${s}left${e}`;
  const a = style(t, [ c, r, l, i ]);
  return {
    t: parseToZeroOrNumber(a[c], true),
    r: parseToZeroOrNumber(a[r], true),
    b: parseToZeroOrNumber(a[l], true),
    l: parseToZeroOrNumber(a[i], true)
  };
};

const getTrasformTranslateValue = (t, n) => `translate${isArray(t) ? `(${t[0]},${t[1]})` : `${n ? "X" : "Y"}(${t})`}`;

const {round: b} = Math;

const m = {
  w: 0,
  h: 0
};

const windowSize = () => ({
  w: window.innerWidth,
  h: window.innerHeight
});

const offsetSize = t => t ? {
  w: t.offsetWidth,
  h: t.offsetHeight
} : m;

const clientSize = t => t ? {
  w: t.clientWidth,
  h: t.clientHeight
} : m;

const scrollSize = t => t ? {
  w: t.scrollWidth,
  h: t.scrollHeight
} : m;

const fractionalSize = t => {
  const n = parseFloat(style(t, "height")) || 0;
  const o = parseFloat(style(t, "width")) || 0;
  return {
    w: o - b(o),
    h: n - b(n)
  };
};

const getBoundingClientRect = t => t.getBoundingClientRect();

const domRectHasDimensions = t => !!(t && (t.height || t.width));

let y;

const supportPassiveEvents = () => {
  if (isUndefined(y)) {
    y = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, "passive", {
        get() {
          y = true;
        }
      }));
    } catch (t) {}
  }
  return y;
};

const splitEventNames = t => t.split(" ");

const off = (t, n, o, s) => {
  each(splitEventNames(n), (n => {
    t.removeEventListener(n, o, s);
  }));
};

const on = (t, n, o, s) => {
  var e;
  const c = supportPassiveEvents();
  const r = null != (e = c && s && s.S) ? e : c;
  const l = s && s.$ || false;
  const i = s && s.C || false;
  const a = [];
  const u = c ? {
    passive: r,
    capture: l
  } : l;
  each(splitEventNames(n), (n => {
    const s = i ? e => {
      t.removeEventListener(n, s, l);
      o && o(e);
    } : o;
    push(a, off.bind(null, t, n, s, l));
    t.addEventListener(n, s, u);
  }));
  return runEachAndClear.bind(0, a);
};

const stopPropagation = t => t.stopPropagation();

const preventDefault = t => t.preventDefault();

const S = {
  x: 0,
  y: 0
};

const absoluteCoordinates = t => {
  const n = t ? getBoundingClientRect(t) : 0;
  return n ? {
    x: n.left + window.pageYOffset,
    y: n.top + window.pageXOffset
  } : S;
};

const manageListener = (t, n) => {
  each(isArray(n) ? n : [ n ], t);
};

const createEventListenerHub = t => {
  const n = new Map;
  const removeEvent = (t, o) => {
    if (t) {
      const s = n.get(t);
      manageListener((t => {
        if (s) {
          s[t ? "delete" : "clear"](t);
        }
      }), o);
    } else {
      n.forEach((t => {
        t.clear();
      }));
      n.clear();
    }
  };
  const addEvent = (t, o) => {
    if (isString(t)) {
      const s = n.get(t) || new Set;
      n.set(t, s);
      manageListener((t => {
        isFunction(t) && s.add(t);
      }), o);
      return removeEvent.bind(0, t, o);
    }
    if (isBoolean(o) && o) {
      removeEvent();
    }
    const s = keys(t);
    const e = [];
    each(s, (n => {
      const o = t[n];
      o && push(e, addEvent(n, o));
    }));
    return runEachAndClear.bind(0, e);
  };
  const triggerEvent = (t, o) => {
    const s = n.get(t);
    each(from(s), (t => {
      if (o && !isEmptyArray(o)) {
        t.apply(0, o);
      } else {
        t();
      }
    }));
  };
  addEvent(t || {});
  return [ addEvent, removeEvent, triggerEvent ];
};

const opsStringify = t => JSON.stringify(t, ((t, n) => {
  if (isFunction(n)) {
    throw new Error;
  }
  return n;
}));

const $ = {
  paddingAbsolute: false,
  showNativeOverlaidScrollbars: false,
  update: {
    elementEvents: [ [ "img", "load" ] ],
    debounce: [ 0, 33 ],
    attributes: null,
    ignoreMutation: null
  },
  overflow: {
    x: "scroll",
    y: "scroll"
  },
  scrollbars: {
    theme: "os-theme-dark",
    visibility: "auto",
    autoHide: "never",
    autoHideDelay: 1300,
    autoHideSuspend: false,
    dragScroll: true,
    clickScroll: false,
    pointers: [ "mouse", "touch", "pen" ]
  }
};

const getOptionsDiff = (t, n) => {
  const o = {};
  const s = keys(n).concat(keys(t));
  each(s, (s => {
    const e = t[s];
    const c = n[s];
    if (isObject(e) && isObject(c)) {
      assignDeep(o[s] = {}, getOptionsDiff(e, c));
      if (isEmptyObject(o[s])) {
        delete o[s];
      }
    } else if (hasOwnProperty(n, s) && c !== e) {
      let t = true;
      if (isArray(e) || isArray(c)) {
        try {
          if (opsStringify(e) === opsStringify(c)) {
            t = false;
          }
        } catch (r) {}
      }
      if (t) {
        o[s] = c;
      }
    }
  }));
  return o;
};

const x = `data-overlayscrollbars`;

const C = "os-environment";

const O = `${C}-flexbox-glue`;

const T = `${O}-max`;

const z = `os-scrollbar-hidden`;

const E = `${x}-initialize`;

const A = x;

const I = `${A}-overflow-x`;

const H = `${A}-overflow-y`;

const L = "overflowVisible";

const P = "scrollbarHidden";

const M = "scrollbarPressed";

const D = "updating";

const R = `${x}-viewport`;

const k = "arrange";

const B = "scrollbarHidden";

const V = L;

const Y = `${x}-padding`;

const j = V;

const N = `${x}-content`;

const q = "os-size-observer";

const F = `${q}-appear`;

const G = `${q}-listener`;

const X = `${G}-scroll`;

const U = `${G}-item`;

const W = `${U}-final`;

const Z = "os-trinsic-observer";

const J = "os-no-css-vars";

const K = "os-theme-none";

const Q = "os-scrollbar";

const tt = `${Q}-rtl`;

const nt = `${Q}-horizontal`;

const ot = `${Q}-vertical`;

const st = `${Q}-track`;

const et = `${Q}-handle`;

const ct = `${Q}-visible`;

const rt = `${Q}-cornerless`;

const lt = `${Q}-transitionless`;

const it = `${Q}-interaction`;

const at = `${Q}-unusable`;

const ut = `${Q}-auto-hide`;

const ft = `${ut}-hidden`;

const dt = `${Q}-wheel`;

const _t = `${st}-interactive`;

const ht = `${et}-interactive`;

const gt = {};

const getPlugins = () => gt;

const addPlugin = t => {
  const n = [];
  each(isArray(t) ? t : [ t ], (t => {
    const o = keys(t);
    each(o, (o => {
      push(n, gt[o] = t[o]);
    }));
  }));
  return n;
};

const vt = {
  boolean: "__TPL_boolean_TYPE__",
  number: "__TPL_number_TYPE__",
  string: "__TPL_string_TYPE__",
  array: "__TPL_array_TYPE__",
  object: "__TPL_object_TYPE__",
  function: "__TPL_function_TYPE__",
  null: "__TPL_null_TYPE__"
};

const pt = vt.number;

const wt = vt.boolean;

const bt = [ vt.array, vt.null ];

const mt = "hidden scroll visible visible-hidden";

const yt = "visible hidden auto";

const St = "never scroll leavemove";

({
  paddingAbsolute: wt,
  showNativeOverlaidScrollbars: wt,
  update: {
    elementEvents: bt,
    attributes: bt,
    debounce: [ vt.number, vt.array, vt.null ],
    ignoreMutation: [ vt.function, vt.null ]
  },
  overflow: {
    x: mt,
    y: mt
  },
  scrollbars: {
    theme: [ vt.string, vt.null ],
    visibility: yt,
    autoHide: St,
    autoHideDelay: pt,
    autoHideSuspend: wt,
    dragScroll: wt,
    clickScroll: wt,
    pointers: [ vt.array, vt.null ]
  }
});

const $t = "__osOptionsValidationPlugin";

const xt = 3333333;

const Ct = "scroll";

const Ot = "__osSizeObserverPlugin";

const Tt = /* @__PURE__ */ (() => ({
  [Ot]: {
    O: (t, n, o) => {
      const s = createDOM(`<div class="${U}" dir="ltr"><div class="${U}"><div class="${W}"></div></div><div class="${U}"><div class="${W}" style="width: 200%; height: 200%"></div></div></div>`);
      appendChildren(t, s);
      addClass(t, X);
      const e = s[0];
      const c = e.lastChild;
      const r = e.firstChild;
      const l = null == r ? void 0 : r.firstChild;
      let i = offsetSize(e);
      let a = i;
      let u = false;
      let _;
      const reset = () => {
        scrollLeft(r, xt);
        scrollTop(r, xt);
        scrollLeft(c, xt);
        scrollTop(c, xt);
      };
      const onResized = t => {
        _ = 0;
        if (u) {
          i = a;
          n(true === t);
        }
      };
      const onScroll = t => {
        a = offsetSize(e);
        u = !t || !equalWH(a, i);
        if (t) {
          stopPropagation(t);
          if (u && !_) {
            f(_);
            _ = d(onResized);
          }
        } else {
          onResized(false === t);
        }
        reset();
      };
      const h = push([], [ on(r, Ct, onScroll), on(c, Ct, onScroll) ]);
      style(l, {
        width: xt,
        height: xt
      });
      d(reset);
      return [ o ? onScroll.bind(0, false) : reset, h ];
    }
  }
}))();

let zt = 0;

const {round: Et, abs: At} = Math;

const getWindowDPR = () => {
  const t = window.screen.deviceXDPI || 0;
  const n = window.screen.logicalXDPI || 1;
  return window.devicePixelRatio || t / n;
};

const diffBiggerThanOne = (t, n) => {
  const o = At(t);
  const s = At(n);
  return !(o === s || o + 1 === s || o - 1 === s);
};

const It = "__osScrollbarsHidingPlugin";

const Ht = /* @__PURE__ */ (() => ({
  [It]: {
    T: t => {
      const {A: n, I: o, H: s} = t;
      const e = !s && !n && (o.x || o.y);
      const c = e ? document.createElement("style") : false;
      if (c) {
        attr(c, "id", `${R}-${k}-${zt}`);
        zt++;
      }
      return c;
    },
    L: (t, n, o, s, e, c, r) => {
      const arrangeViewport = (n, c, r, l) => {
        if (t) {
          const {P: t} = e();
          const {M: i, D: a} = n;
          const {x: u, y: f} = a;
          const {x: d, y: _} = i;
          const h = l ? "paddingRight" : "paddingLeft";
          const g = t[h];
          const v = t.paddingTop;
          const p = c.w + r.w;
          const w = c.h + r.h;
          const b = {
            w: _ && f ? `${_ + p - g}px` : "",
            h: d && u ? `${d + w - v}px` : ""
          };
          if (s) {
            const {sheet: t} = s;
            if (t) {
              const {cssRules: n} = t;
              if (n) {
                if (!n.length) {
                  t.insertRule(`#${attr(s, "id")} + [${R}~='${k}']::before {}`, 0);
                }
                const o = n[0].style;
                o.width = b.w;
                o.height = b.h;
              }
            }
          } else {
            style(o, {
              "--os-vaw": b.w,
              "--os-vah": b.h
            });
          }
        }
        return t;
      };
      const undoViewportArrange = (s, l, i) => {
        if (t) {
          const a = i || c(s);
          const {P: u} = e();
          const {D: f} = a;
          const {x: d, y: _} = f;
          const h = {};
          const assignProps = t => each(t.split(" "), (t => {
            h[t] = u[t];
          }));
          if (d) {
            assignProps("marginBottom paddingTop paddingBottom");
          }
          if (_) {
            assignProps("marginLeft marginRight paddingLeft paddingRight");
          }
          const g = style(o, keys(h));
          attrClass(o, R, k);
          if (!n) {
            h.height = "";
          }
          style(o, h);
          return [ () => {
            r(a, l, t, g);
            style(o, g);
            attrClass(o, R, k, true);
          }, a ];
        }
        return [ noop ];
      };
      return [ arrangeViewport, undoViewportArrange ];
    },
    R: () => {
      let t = {
        w: 0,
        h: 0
      };
      let n = 0;
      return (o, s, e) => {
        const c = windowSize();
        const r = {
          w: c.w - t.w,
          h: c.h - t.h
        };
        if (0 === r.w && 0 === r.h) {
          return;
        }
        const l = {
          w: At(r.w),
          h: At(r.h)
        };
        const i = {
          w: At(Et(c.w / (t.w / 100))),
          h: At(Et(c.h / (t.h / 100)))
        };
        const a = getWindowDPR();
        const u = l.w > 2 && l.h > 2;
        const f = !diffBiggerThanOne(i.w, i.h);
        const d = a !== n && a > 0;
        const _ = u && f && d;
        if (_) {
          const [t, n] = s();
          assignDeep(o.k, t);
          if (n) {
            e();
          }
        }
        t = c;
        n = a;
      };
    }
  }
}))();

const Lt = "__osClickScrollPlugin";

const Pt = /* @__PURE__ */ (() => ({
  [Lt]: {
    O: (t, n, o, s, e) => {
      let c = 0;
      let r = noop;
      const animateClickScroll = l => {
        r = animateNumber(l, l + s * Math.sign(o), 133, ((o, l, i) => {
          t(o);
          const a = n();
          const u = a + s;
          const f = e >= a && e <= u;
          if (i && !f) {
            if (c) {
              animateClickScroll(o);
            } else {
              const t = setTimeout((() => {
                animateClickScroll(o);
              }), 222);
              r = () => {
                clearTimeout(t);
              };
            }
            c++;
          }
        }));
      };
      animateClickScroll(0);
      return () => r();
    }
  }
}))();

let Mt;

const getNativeScrollbarSize = (t, n, o, s) => {
  appendChildren(t, n);
  const e = clientSize(n);
  const c = offsetSize(n);
  const r = fractionalSize(o);
  s && removeElements(n);
  return {
    x: c.h - e.h + r.h,
    y: c.w - e.w + r.w
  };
};

const getNativeScrollbarsHiding = t => {
  let n = false;
  const o = addClass(t, z);
  try {
    n = "none" === style(t, cssProperty("scrollbar-width")) || "none" === window.getComputedStyle(t, "::-webkit-scrollbar").getPropertyValue("display");
  } catch (s) {}
  o();
  return n;
};

const getRtlScrollBehavior = (t, n) => {
  const o = "hidden";
  style(t, {
    overflowX: o,
    overflowY: o,
    direction: "rtl"
  });
  scrollLeft(t, 0);
  const s = absoluteCoordinates(t);
  const e = absoluteCoordinates(n);
  scrollLeft(t, -999);
  const c = absoluteCoordinates(n);
  return {
    i: s.x === e.x,
    n: e.x !== c.x
  };
};

const getFlexboxGlue = (t, n) => {
  const o = addClass(t, O);
  const s = getBoundingClientRect(t);
  const e = getBoundingClientRect(n);
  const c = equalBCRWH(e, s, true);
  const r = addClass(t, T);
  const l = getBoundingClientRect(t);
  const i = getBoundingClientRect(n);
  const a = equalBCRWH(i, l, true);
  o();
  r();
  return c && a;
};

const createEnvironment = () => {
  const {body: t} = document;
  const n = createDOM(`<div class="${C}"><div></div></div>`);
  const o = n[0];
  const s = o.firstChild;
  const [e, , c] = createEventListenerHub();
  const [r, l] = createCache({
    o: getNativeScrollbarSize(t, o, s),
    u: equalXY
  }, getNativeScrollbarSize.bind(0, t, o, s, true));
  const [i] = l();
  const a = getNativeScrollbarsHiding(o);
  const u = {
    x: 0 === i.x,
    y: 0 === i.y
  };
  const f = {
    elements: {
      host: null,
      padding: !a,
      viewport: t => a && t === t.ownerDocument.body && t,
      content: false
    },
    scrollbars: {
      slot: true
    },
    cancel: {
      nativeScrollbarsOverlaid: false,
      body: null
    }
  };
  const d = assignDeep({}, $);
  const h = assignDeep.bind(0, {}, d);
  const g = assignDeep.bind(0, {}, f);
  const v = {
    k: i,
    I: u,
    A: a,
    H: "-1" === style(o, "zIndex"),
    B: !!_,
    V: getRtlScrollBehavior(o, s),
    Y: getFlexboxGlue(o, s),
    j: e.bind(0, "z"),
    N: e.bind(0, "r"),
    q: g,
    F: t => assignDeep(f, t) && g(),
    G: h,
    X: t => assignDeep(d, t) && h(),
    U: assignDeep({}, f),
    W: assignDeep({}, d)
  };
  const p = window.addEventListener;
  const w = debounce((t => c(t ? "z" : "r")), {
    g: 33,
    v: 99
  });
  removeAttr(o, "style");
  removeElements(o);
  p("resize", w.bind(0, false));
  if (!a && (!u.x || !u.y)) {
    let t;
    p("resize", (() => {
      const n = getPlugins()[It];
      t = t || n && n.R();
      t && t(v, r, w.bind(0, true));
    }));
  }
  return v;
};

const getEnvironment = () => {
  if (!Mt) {
    Mt = createEnvironment();
  }
  return Mt;
};

const resolveInitialization = (t, n) => isFunction(n) ? n.apply(0, t) : n;

const staticInitializationElement = (t, n, o, s) => {
  const e = isUndefined(s) ? o : s;
  const c = resolveInitialization(t, e);
  return c || n.apply(0, t);
};

const dynamicInitializationElement = (t, n, o, s) => {
  const e = isUndefined(s) ? o : s;
  const c = resolveInitialization(t, e);
  return !!c && (isHTMLElement(c) ? c : n.apply(0, t));
};

const cancelInitialization = (t, n, o) => {
  const {nativeScrollbarsOverlaid: s, body: e} = o || {};
  const {I: c, A: r} = getEnvironment();
  const {nativeScrollbarsOverlaid: l, body: i} = n;
  const a = null != s ? s : l;
  const u = isUndefined(e) ? i : e;
  const f = (c.x || c.y) && a;
  const d = t && (isNull(u) ? !r : u);
  return !!f || !!d;
};

const Dt = new WeakMap;

const addInstance = (t, n) => {
  Dt.set(t, n);
};

const removeInstance = t => {
  Dt.delete(t);
};

const getInstance = t => Dt.get(t);

const getPropByPath = (t, n) => t ? n.split(".").reduce(((t, n) => t && hasOwnProperty(t, n) ? t[n] : void 0), t) : void 0;

const createOptionCheck = (t, n, o) => s => [ getPropByPath(t, s), o || void 0 !== getPropByPath(n, s) ];

const createState = t => {
  let n = t;
  return [ () => n, t => {
    n = assignDeep({}, n, t);
  } ];
};

const Rt = "tabindex";

const kt = createDiv.bind(0, "");

const unwrap = t => {
  appendChildren(parent(t), contents(t));
  removeElements(t);
};

const createStructureSetupElements = t => {
  const n = getEnvironment();
  const {q: o, A: s} = n;
  const e = getPlugins()[It];
  const c = e && e.T;
  const {elements: r} = o();
  const {host: l, padding: i, viewport: a, content: u} = r;
  const f = isHTMLElement(t);
  const d = f ? {} : t;
  const {elements: _} = d;
  const {host: h, padding: g, viewport: v, content: p} = _ || {};
  const w = f ? t : d.target;
  const b = is(w, "textarea");
  const m = w.ownerDocument;
  const y = m.documentElement;
  const S = w === m.body;
  const $ = m.defaultView;
  const x = staticInitializationElement.bind(0, [ w ]);
  const C = dynamicInitializationElement.bind(0, [ w ]);
  const O = resolveInitialization.bind(0, [ w ]);
  const T = x.bind(0, kt, a);
  const L = C.bind(0, kt, u);
  const P = T(v);
  const M = P === w;
  const D = M && S;
  const k = !M && L(p);
  const V = !M && isHTMLElement(P) && P === k;
  const j = V && !!O(u);
  const q = j ? T() : P;
  const F = j ? k : L();
  const G = V ? q : P;
  const X = D ? y : G;
  const U = b ? x(kt, l, h) : w;
  const W = D ? X : U;
  const Z = V ? F : k;
  const J = m.activeElement;
  const K = !M && $.top === $ && J === w;
  const Q = {
    Z: w,
    J: W,
    K: X,
    tt: !M && C(kt, i, g),
    nt: Z,
    ot: !M && !s && c && c(n),
    st: D ? y : X,
    et: D ? m : X,
    ct: $,
    rt: m,
    lt: b,
    it: S,
    ut: f,
    ft: M,
    dt: V,
    _t: (t, n) => hasAttrClass(X, M ? A : R, M ? n : t),
    ht: (t, n, o) => attrClass(X, M ? A : R, M ? n : t, o)
  };
  const tt = keys(Q).reduce(((t, n) => {
    const o = Q[n];
    return push(t, o && isHTMLElement(o) && !parent(o) ? o : false);
  }), []);
  const elementIsGenerated = t => t ? indexOf(tt, t) > -1 : null;
  const {Z: nt, J: ot, tt: st, K: et, nt: ct, ot: rt} = Q;
  const lt = [ () => {
    removeAttr(ot, A);
    removeAttr(ot, E);
    removeAttr(nt, E);
    if (S) {
      removeAttr(y, A);
      removeAttr(y, E);
    }
  } ];
  const it = b && elementIsGenerated(ot);
  let at = b ? nt : contents([ ct, et, st, ot, nt ].find((t => false === elementIsGenerated(t))));
  const ut = D ? nt : ct || et;
  const appendElements = () => {
    attr(ot, A, M ? "viewport" : "host");
    attr(st, Y, "");
    attr(ct, N, "");
    if (!M) {
      attr(et, R, "");
    }
    const t = S && !M ? addClass(parent(w), z) : noop;
    if (it) {
      insertAfter(nt, ot);
      push(lt, (() => {
        insertAfter(ot, nt);
        removeElements(ot);
      }));
    }
    appendChildren(ut, at);
    appendChildren(ot, st);
    appendChildren(st || ot, !M && et);
    appendChildren(et, ct);
    push(lt, (() => {
      t();
      removeAttr(st, Y);
      removeAttr(ct, N);
      removeAttr(et, I);
      removeAttr(et, H);
      removeAttr(et, R);
      if (elementIsGenerated(ct)) {
        unwrap(ct);
      }
      if (elementIsGenerated(et)) {
        unwrap(et);
      }
      if (elementIsGenerated(st)) {
        unwrap(st);
      }
    }));
    if (s && !M) {
      attrClass(et, R, B, true);
      push(lt, removeAttr.bind(0, et, R));
    }
    if (rt) {
      insertBefore(et, rt);
      push(lt, removeElements.bind(0, rt));
    }
    if (K) {
      const t = attr(et, Rt);
      attr(et, Rt, "-1");
      et.focus();
      const revertViewportTabIndex = () => t ? attr(et, Rt, t) : removeAttr(et, Rt);
      const n = on(m, "pointerdown keydown", (() => {
        revertViewportTabIndex();
        n();
      }));
      push(lt, [ revertViewportTabIndex, n ]);
    } else if (J && J.focus) {
      J.focus();
    }
    at = 0;
  };
  return [ Q, appendElements, runEachAndClear.bind(0, lt) ];
};

const createTrinsicUpdateSegment = (t, n) => {
  const {nt: o} = t;
  const [s] = n;
  return t => {
    const {Y: n} = getEnvironment();
    const {gt: e} = s();
    const {vt: c} = t;
    const r = (o || !n) && c;
    if (r) {
      style(o, {
        height: e ? "" : "100%"
      });
    }
    return {
      wt: r,
      bt: r
    };
  };
};

const createPaddingUpdateSegment = (t, n) => {
  const [o, s] = n;
  const {J: e, tt: c, K: r, ft: l} = t;
  const [i, a] = createCache({
    u: equalTRBL,
    o: topRightBottomLeft()
  }, topRightBottomLeft.bind(0, e, "padding", ""));
  return (t, n, e) => {
    let [u, f] = a(e);
    const {A: d, Y: _} = getEnvironment();
    const {yt: h} = o();
    const {wt: g, bt: v, St: p} = t;
    const [w, b] = n("paddingAbsolute");
    const m = !_ && v;
    if (g || f || m) {
      [u, f] = i(e);
    }
    const y = !l && (b || p || f);
    if (y) {
      const t = !w || !c && !d;
      const n = u.r + u.l;
      const o = u.t + u.b;
      const e = {
        marginRight: t && !h ? -n : 0,
        marginBottom: t ? -o : 0,
        marginLeft: t && h ? -n : 0,
        top: t ? -u.t : 0,
        right: t ? h ? -u.r : "auto" : 0,
        left: t ? h ? "auto" : -u.l : 0,
        width: t ? `calc(100% + ${n}px)` : ""
      };
      const l = {
        paddingTop: t ? u.t : 0,
        paddingRight: t ? u.r : 0,
        paddingBottom: t ? u.b : 0,
        paddingLeft: t ? u.l : 0
      };
      style(c || r, e);
      style(r, l);
      s({
        tt: u,
        $t: !t,
        P: c ? l : assignDeep({}, e, l)
      });
    }
    return {
      xt: y
    };
  };
};

const {max: Bt} = Math;

const Vt = Bt.bind(0, 0);

const Yt = "visible";

const jt = "hidden";

const Nt = 42;

const qt = {
  u: equalWH,
  o: {
    w: 0,
    h: 0
  }
};

const Ft = {
  u: equalXY,
  o: {
    x: jt,
    y: jt
  }
};

const getOverflowAmount = (t, n) => {
  const o = window.devicePixelRatio % 1 !== 0 ? 1 : 0;
  const s = {
    w: Vt(t.w - n.w),
    h: Vt(t.h - n.h)
  };
  return {
    w: s.w > o ? s.w : 0,
    h: s.h > o ? s.h : 0
  };
};

const overflowIsVisible = t => 0 === t.indexOf(Yt);

const createOverflowUpdateSegment = (t, n) => {
  const [o, s] = n;
  const {J: e, tt: c, K: r, ot: l, ft: i, ht: a, it: u, ct: f} = t;
  const {k: d, Y: _, A: h, I: g} = getEnvironment();
  const v = getPlugins()[It];
  const p = !i && !h && (g.x || g.y);
  const w = u && i;
  const [b, m] = createCache(qt, fractionalSize.bind(0, r));
  const [y, S] = createCache(qt, scrollSize.bind(0, r));
  const [$, x] = createCache(qt);
  const [C, O] = createCache(qt);
  const [T] = createCache(Ft);
  const fixFlexboxGlue = (t, n) => {
    style(r, {
      height: ""
    });
    if (n) {
      const {$t: n, tt: s} = o();
      const {Ct: c, M: l} = t;
      const i = fractionalSize(e);
      const a = clientSize(e);
      const u = "content-box" === style(r, "boxSizing");
      const f = n || u ? s.b + s.t : 0;
      const d = !(g.x && u);
      style(r, {
        height: a.h + i.h + (c.x && d ? l.x : 0) - f
      });
    }
  };
  const getViewportOverflowState = (t, n) => {
    const o = !h && !t ? Nt : 0;
    const getStatePerAxis = (t, s, e) => {
      const c = style(r, t);
      const l = n ? n[t] : c;
      const i = "scroll" === l;
      const a = s ? o : e;
      const u = i && !h ? a : 0;
      const f = s && !!o;
      return [ c, i, u, f ];
    };
    const [s, e, c, l] = getStatePerAxis("overflowX", g.x, d.x);
    const [i, a, u, f] = getStatePerAxis("overflowY", g.y, d.y);
    return {
      Ot: {
        x: s,
        y: i
      },
      Ct: {
        x: e,
        y: a
      },
      M: {
        x: c,
        y: u
      },
      D: {
        x: l,
        y: f
      }
    };
  };
  const setViewportOverflowState = (t, n, o, s) => {
    const setAxisOverflowStyle = (t, n) => {
      const o = overflowIsVisible(t);
      const s = n && o && t.replace(`${Yt}-`, "") || "";
      return [ n && !o ? t : "", overflowIsVisible(s) ? "hidden" : s ];
    };
    const [e, c] = setAxisOverflowStyle(o.x, n.x);
    const [r, l] = setAxisOverflowStyle(o.y, n.y);
    s.overflowX = c && r ? c : e;
    s.overflowY = l && e ? l : r;
    return getViewportOverflowState(t, s);
  };
  const hideNativeScrollbars = (t, n, s, e) => {
    const {M: c, D: r} = t;
    const {x: l, y: i} = r;
    const {x: a, y: u} = c;
    const {P: f} = o();
    const d = n ? "marginLeft" : "marginRight";
    const _ = n ? "paddingLeft" : "paddingRight";
    const h = f[d];
    const g = f.marginBottom;
    const v = f[_];
    const p = f.paddingBottom;
    e.width = `calc(100% + ${u + -1 * h}px)`;
    e[d] = -u + h;
    e.marginBottom = -a + g;
    if (s) {
      e[_] = v + (i ? u : 0);
      e.paddingBottom = p + (l ? a : 0);
    }
  };
  const [z, E] = v ? v.L(p, _, r, l, o, getViewportOverflowState, hideNativeScrollbars) : [ () => p, () => [ noop ] ];
  return (t, n, l) => {
    const {wt: u, Tt: d, bt: v, xt: p, vt: M, St: D} = t;
    const {gt: k, yt: N} = o();
    const [q, F] = n("showNativeOverlaidScrollbars");
    const [G, X] = n("overflow");
    const U = q && g.x && g.y;
    const W = !i && !_ && (u || v || d || F || M);
    const Z = overflowIsVisible(G.x);
    const J = overflowIsVisible(G.y);
    const K = Z || J;
    let Q = m(l);
    let tt = S(l);
    let nt = x(l);
    let ot = O(l);
    let st;
    if (F && h) {
      a(B, P, !U);
    }
    if (W) {
      st = getViewportOverflowState(U);
      fixFlexboxGlue(st, k);
    }
    if (u || p || v || D || F) {
      if (K) {
        a(V, L, false);
      }
      const [t, n] = E(U, N, st);
      const [o, s] = Q = b(l);
      const [e, c] = tt = y(l);
      const i = clientSize(r);
      let u = e;
      let d = i;
      t();
      if ((c || s || F) && n && !U && z(n, e, o, N)) {
        d = clientSize(r);
        u = scrollSize(r);
      }
      const _ = {
        w: Vt(Bt(e.w, u.w) + o.w),
        h: Vt(Bt(e.h, u.h) + o.h)
      };
      const h = {
        w: Vt((w ? f.innerWidth : d.w + Vt(i.w - e.w)) + o.w),
        h: Vt((w ? f.innerHeight + o.h : d.h + Vt(i.h - e.h)) + o.h)
      };
      ot = C(h);
      nt = $(getOverflowAmount(_, h), l);
    }
    const [et, ct] = ot;
    const [rt, lt] = nt;
    const [it, at] = tt;
    const [ut, ft] = Q;
    const dt = {
      x: rt.w > 0,
      y: rt.h > 0
    };
    const _t = Z && J && (dt.x || dt.y) || Z && dt.x && !dt.y || J && dt.y && !dt.x;
    if (p || D || ft || at || ct || lt || X || F || W) {
      const t = {
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        width: "",
        overflowY: "",
        overflowX: ""
      };
      const n = setViewportOverflowState(U, dt, G, t);
      const o = z(n, it, ut, N);
      if (!i) {
        hideNativeScrollbars(n, N, o, t);
      }
      if (W) {
        fixFlexboxGlue(n, k);
      }
      if (i) {
        attr(e, I, t.overflowX);
        attr(e, H, t.overflowY);
      } else {
        style(r, t);
      }
    }
    attrClass(e, A, L, _t);
    attrClass(c, Y, j, _t);
    if (!i) {
      attrClass(r, R, V, K);
    }
    const [ht, gt] = T(getViewportOverflowState(U).Ot);
    s({
      Ot: ht,
      zt: {
        x: et.w,
        y: et.h
      },
      Et: {
        x: rt.w,
        y: rt.h
      },
      At: dt
    });
    return {
      It: gt,
      Ht: ct,
      Lt: lt
    };
  };
};

const prepareUpdateHints = (t, n, o) => {
  const s = {};
  const e = n || {};
  const c = keys(t).concat(keys(e));
  each(c, (n => {
    const c = t[n];
    const r = e[n];
    s[n] = !!(o || c || r);
  }));
  return s;
};

const createStructureSetupUpdate = (t, n) => {
  const {Z: o, K: s, ht: e, ft: c} = t;
  const {A: r, I: l, Y: i} = getEnvironment();
  const a = !r && (l.x || l.y);
  const u = [ createTrinsicUpdateSegment(t, n), createPaddingUpdateSegment(t, n), createOverflowUpdateSegment(t, n) ];
  return (t, n, r) => {
    const l = prepareUpdateHints(assignDeep({
      wt: false,
      xt: false,
      St: false,
      vt: false,
      Ht: false,
      Lt: false,
      It: false,
      Tt: false,
      bt: false,
      Pt: false
    }, n), {}, r);
    const f = a || !i;
    const d = f && scrollLeft(s);
    const _ = f && scrollTop(s);
    e("", D, true);
    let h = l;
    each(u, (n => {
      h = prepareUpdateHints(h, n(h, t, !!r) || {}, r);
    }));
    scrollLeft(s, d);
    scrollTop(s, _);
    e("", D);
    if (!c) {
      scrollLeft(o, 0);
      scrollTop(o, 0);
    }
    return h;
  };
};

const createEventContentChange = (t, n, o) => {
  let s;
  let e = false;
  const destroy = () => {
    e = true;
  };
  const updateElements = c => {
    if (o) {
      const r = o.reduce(((n, o) => {
        if (o) {
          const [s, e] = o;
          const r = e && s && (c ? c(s) : find(s, t));
          if (r && r.length && e && isString(e)) {
            push(n, [ r, e.trim() ], true);
          }
        }
        return n;
      }), []);
      each(r, (o => each(o[0], (c => {
        const r = o[1];
        const l = s.get(c) || [];
        const i = t.contains(c);
        if (i) {
          const t = on(c, r, (o => {
            if (e) {
              t();
              s.delete(c);
            } else {
              n(o);
            }
          }));
          s.set(c, push(l, t));
        } else {
          runEachAndClear(l);
          s.delete(c);
        }
      }))));
    }
  };
  if (o) {
    s = new WeakMap;
    updateElements();
  }
  return [ destroy, updateElements ];
};

const createDOMObserver = (t, n, o, s) => {
  let e = false;
  const {Mt: c, Dt: r, Rt: l, kt: a, Bt: u, Vt: f} = s || {};
  const d = debounce((() => {
    if (e) {
      o(true);
    }
  }), {
    g: 33,
    v: 99
  });
  const [_, h] = createEventContentChange(t, d, l);
  const g = c || [];
  const v = r || [];
  const p = g.concat(v);
  const observerCallback = (e, c) => {
    const r = u || noop;
    const l = f || noop;
    const i = new Set;
    const d = new Set;
    let _ = false;
    let g = false;
    each(e, (o => {
      const {attributeName: e, target: c, type: u, oldValue: f, addedNodes: h, removedNodes: p} = o;
      const w = "attributes" === u;
      const b = "childList" === u;
      const m = t === c;
      const y = w && isString(e) ? attr(c, e) : 0;
      const S = 0 !== y && f !== y;
      const $ = indexOf(v, e) > -1 && S;
      if (n && (b || !m)) {
        const n = !w;
        const u = w && S;
        const d = u && a && is(c, a);
        const _ = d ? !r(c, e, f, y) : n || u;
        const v = _ && !l(o, !!d, t, s);
        each(h, (t => i.add(t)));
        each(p, (t => i.add(t)));
        g = g || v;
      }
      if (!n && m && S && !r(c, e, f, y)) {
        d.add(e);
        _ = _ || $;
      }
    }));
    if (i.size > 0) {
      h((t => from(i).reduce(((n, o) => {
        push(n, find(t, o));
        return is(o, t) ? push(n, o) : n;
      }), [])));
    }
    if (n) {
      !c && g && o(false);
      return [ false ];
    }
    if (d.size > 0 || _) {
      const t = [ from(d), _ ];
      !c && o.apply(0, t);
      return t;
    }
  };
  const w = new i((t => observerCallback(t)));
  w.observe(t, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: p,
    subtree: n,
    childList: n,
    characterData: n
  });
  e = true;
  return [ () => {
    if (e) {
      _();
      w.disconnect();
      e = false;
    }
  }, () => {
    if (e) {
      d.m();
      const t = w.takeRecords();
      return !isEmptyArray(t) && observerCallback(t, true);
    }
  } ];
};

const Gt = 3333333;

const createSizeObserver = (t, n, o) => {
  const {Yt: s = false, Pt: e = false} = o || {};
  const c = getPlugins()[Ot];
  const {V: r} = getEnvironment();
  const l = createDOM(`<div class="${q}"><div class="${G}"></div></div>`);
  const i = l[0];
  const a = i.firstChild;
  const f = directionIsRTL.bind(0, t);
  const [d] = createCache({
    o: void 0,
    _: true,
    u: (t, n) => !(!t || !domRectHasDimensions(t) && domRectHasDimensions(n))
  });
  const onSizeChangedCallbackProxy = t => {
    const o = isArray(t) && t.length > 0 && isObject(t[0]);
    const e = !o && isBoolean(t[0]);
    let c = false;
    let l = false;
    let a = true;
    if (o) {
      const [n, , o] = d(t.pop().contentRect);
      const s = domRectHasDimensions(n);
      const e = domRectHasDimensions(o);
      const r = !o;
      c = r && !!e || !s;
      l = !e && s;
      a = !c;
    } else if (e) {
      [, a] = t;
    } else {
      l = true === t;
    }
    if (s && a) {
      const n = e ? t[0] : directionIsRTL(i);
      scrollLeft(i, n ? r.n ? -Gt : r.i ? 0 : Gt : Gt);
      scrollTop(i, Gt);
    }
    if (!c) {
      n({
        wt: !e,
        jt: e ? t : void 0,
        Pt: !!l
      });
    }
  };
  const _ = [];
  let h = e ? onSizeChangedCallbackProxy : false;
  return [ () => {
    runEachAndClear(_);
    removeElements(i);
  }, () => {
    if (u) {
      const t = new u(onSizeChangedCallbackProxy);
      t.observe(a);
      push(_, (() => {
        t.disconnect();
      }));
    } else if (c) {
      const [t, n] = c.O(a, onSizeChangedCallbackProxy, e);
      h = t;
      push(_, n);
    }
    if (s) {
      const [t] = createCache({
        o: void 0
      }, f);
      push(_, on(i, "scroll", (n => {
        const o = t();
        const [s, e, c] = o;
        if (e) {
          removeClass(a, "ltr rtl");
          if (s) {
            addClass(a, "rtl");
          } else {
            addClass(a, "ltr");
          }
          onSizeChangedCallbackProxy([ !!s, e, c ]);
        }
        stopPropagation(n);
      })));
    }
    if (h) {
      addClass(i, F);
      push(_, on(i, "animationstart", h, {
        C: !!u
      }));
    }
    if (u || c) {
      appendChildren(t, i);
    }
  } ];
};

const isHeightIntrinsic = t => 0 === t.h || t.isIntersecting || t.intersectionRatio > 0;

const createTrinsicObserver = (t, n) => {
  let o;
  const s = createDiv(Z);
  const e = [];
  const [c] = createCache({
    o: false
  });
  const triggerOnTrinsicChangedCallback = (t, o) => {
    if (t) {
      const s = c(isHeightIntrinsic(t));
      const [, e] = s;
      if (e) {
        !o && n(s);
        return [ s ];
      }
    }
  };
  const intersectionObserverCallback = (t, n) => {
    if (t && t.length > 0) {
      return triggerOnTrinsicChangedCallback(t.pop(), n);
    }
  };
  return [ () => {
    runEachAndClear(e);
    removeElements(s);
  }, () => {
    if (a) {
      o = new a((t => intersectionObserverCallback(t)), {
        root: t
      });
      o.observe(s);
      push(e, (() => {
        o.disconnect();
      }));
    } else {
      const onSizeChanged = () => {
        const t = offsetSize(s);
        triggerOnTrinsicChangedCallback(t);
      };
      const [t, n] = createSizeObserver(s, onSizeChanged);
      push(e, t);
      n();
      onSizeChanged();
    }
    appendChildren(t, s);
  }, () => {
    if (o) {
      return intersectionObserverCallback(o.takeRecords(), true);
    }
  } ];
};

const Xt = `[${A}]`;

const Ut = `[${R}]`;

const Wt = [ "tabindex" ];

const Zt = [ "wrap", "cols", "rows" ];

const Jt = [ "id", "class", "style", "open" ];

const createStructureSetupObservers = (t, n, o) => {
  let s;
  let e;
  let c;
  const {J: r, K: l, nt: i, lt: a, ft: f, _t: d, ht: _} = t;
  const {Y: h} = getEnvironment();
  const [g] = createCache({
    u: equalWH,
    o: {
      w: 0,
      h: 0
    }
  }, (() => {
    const t = d(V, L);
    const n = d(k, "");
    const o = n && scrollLeft(l);
    const s = n && scrollTop(l);
    _(V, L);
    _(k, "");
    _("", D, true);
    const e = scrollSize(i);
    const c = scrollSize(l);
    const r = fractionalSize(l);
    _(V, L, t);
    _(k, "", n);
    _("", D);
    scrollLeft(l, o);
    scrollTop(l, s);
    return {
      w: c.w + e.w + r.w,
      h: c.h + e.h + r.h
    };
  }));
  const v = a ? Zt : Jt.concat(Zt);
  const p = debounce(o, {
    g: () => s,
    v: () => e,
    p(t, n) {
      const [o] = t;
      const [s] = n;
      return [ keys(o).concat(keys(s)).reduce(((t, n) => {
        t[n] = o[n] || s[n];
        return t;
      }), {}) ];
    }
  });
  const updateViewportAttrsFromHost = t => {
    each(t || Wt, (t => {
      if (indexOf(Wt, t) > -1) {
        const n = attr(r, t);
        if (isString(n)) {
          attr(l, t, n);
        } else {
          removeAttr(l, t);
        }
      }
    }));
  };
  const onTrinsicChanged = (t, s) => {
    const [e, c] = t;
    const r = {
      vt: c
    };
    n({
      gt: e
    });
    !s && o(r);
    return r;
  };
  const onSizeChanged = ({wt: t, jt: s, Pt: e}) => {
    const c = !t || e ? o : p;
    let r = false;
    if (s) {
      const [t, o] = s;
      r = o;
      n({
        yt: t
      });
    }
    c({
      wt: t,
      Pt: e,
      St: r
    });
  };
  const onContentMutation = (t, n) => {
    const [, s] = g();
    const e = {
      bt: s
    };
    const c = t ? o : p;
    if (s) {
      !n && c(e);
    }
    return e;
  };
  const onHostMutation = (t, n, o) => {
    const s = {
      Tt: n
    };
    if (n) {
      !o && p(s);
    } else if (!f) {
      updateViewportAttrsFromHost(t);
    }
    return s;
  };
  const [w, b, m] = i || !h ? createTrinsicObserver(r, onTrinsicChanged) : [ noop, noop, noop ];
  const [y, S] = !f ? createSizeObserver(r, onSizeChanged, {
    Pt: true,
    Yt: true
  }) : [ noop, noop ];
  const [$, x] = createDOMObserver(r, false, onHostMutation, {
    Dt: Jt,
    Mt: Jt.concat(Wt)
  });
  let C;
  const O = f && u && new u((t => {
    const n = t[t.length - 1].contentRect;
    const o = domRectHasDimensions(n);
    const s = domRectHasDimensions(C);
    const e = !s && o;
    onSizeChanged({
      wt: true,
      Pt: e
    });
    C = n;
  }));
  return [ () => {
    w();
    y();
    c && c[0]();
    O && O.disconnect();
    $();
  }, () => {
    O && O.observe(r);
    updateViewportAttrsFromHost();
    S();
    b();
  }, () => {
    const t = {};
    const n = x();
    const o = m();
    const s = c && c[1]();
    if (n) {
      assignDeep(t, onHostMutation.apply(0, push(n, true)));
    }
    if (o) {
      assignDeep(t, onTrinsicChanged.apply(0, push(o, true)));
    }
    if (s) {
      assignDeep(t, onContentMutation.apply(0, push(s, true)));
    }
    return t;
  }, t => {
    const [n] = t("update.ignoreMutation");
    const [o, r] = t("update.attributes");
    const [a, u] = t("update.elementEvents");
    const [d, _] = t("update.debounce");
    const h = u || r;
    const ignoreMutationFromOptions = t => isFunction(n) && n(t);
    if (h) {
      if (c) {
        c[1]();
        c[0]();
      }
      c = createDOMObserver(i || l, true, onContentMutation, {
        Mt: v.concat(o || []),
        Rt: a,
        kt: Xt,
        Vt: (t, n) => {
          const {target: o, attributeName: s} = t;
          const e = !n && s && !f ? liesBetween(o, Xt, Ut) : false;
          return e || !!closest(o, `.${Q}`) || !!ignoreMutationFromOptions(t);
        }
      });
    }
    if (_) {
      p.m();
      if (isArray(d)) {
        const t = d[0];
        const n = d[1];
        s = isNumber(t) && t;
        e = isNumber(n) && n;
      } else if (isNumber(d)) {
        s = d;
        e = false;
      } else {
        s = false;
        e = false;
      }
    }
  } ];
};

const Kt = {
  x: 0,
  y: 0
};

const createInitialStructureSetupUpdateState = t => ({
  tt: {
    t: 0,
    r: 0,
    b: 0,
    l: 0
  },
  $t: false,
  P: {
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0
  },
  zt: Kt,
  Et: Kt,
  Ot: {
    x: "hidden",
    y: "hidden"
  },
  At: {
    x: false,
    y: false
  },
  gt: false,
  yt: directionIsRTL(t.J)
});

const createStructureSetup = (t, n) => {
  const o = createOptionCheck(n, {});
  const [s, e, c] = createEventListenerHub();
  const [r, l, i] = createStructureSetupElements(t);
  const a = createState(createInitialStructureSetupUpdateState(r));
  const [u, f] = a;
  const d = createStructureSetupUpdate(r, a);
  const triggerUpdateEvent = (t, n, o) => {
    const s = keys(t).some((n => !!t[n]));
    const e = s || !isEmptyObject(n) || o;
    if (e) {
      c("u", [ t, n, o ]);
    }
    return e;
  };
  const [_, h, g, v] = createStructureSetupObservers(r, f, (t => triggerUpdateEvent(d(o, t), {}, false)));
  const p = u.bind(0);
  p.Nt = t => s("u", t);
  p.qt = () => {
    const {Z: t, K: n, rt: o, it: s} = r;
    const e = s ? o.documentElement : t;
    const c = scrollLeft(e);
    const i = scrollTop(e);
    h();
    l();
    scrollLeft(n, c);
    scrollTop(n, i);
  };
  p.Ft = r;
  return [ (t, o) => {
    const s = createOptionCheck(n, t, o);
    v(s);
    return triggerUpdateEvent(d(s, g(), o), t, !!o);
  }, p, () => {
    e();
    _();
    i();
  } ];
};

const {round: Qt} = Math;

const getScale = t => {
  const {width: n, height: o} = getBoundingClientRect(t);
  const {w: s, h: e} = offsetSize(t);
  return {
    x: Qt(n) / s || 1,
    y: Qt(o) / e || 1
  };
};

const continuePointerDown = (t, n, o) => {
  const s = n.scrollbars;
  const {button: e, isPrimary: c, pointerType: r} = t;
  const {pointers: l} = s;
  return 0 === e && c && s[o ? "dragScroll" : "clickScroll"] && (l || []).includes(r);
};

const tn = "pointerup pointerleave pointercancel lostpointercapture";

const getScrollTimelineAnimation = t => ({
  transform: [ getTrasformTranslateValue(`0%`, t), getTrasformTranslateValue("-100%", t) ],
  [t ? "left" : "top"]: [ "0%", "100%" ]
});

const createRootClickStopPropagationEvents = (t, n) => on(t, "mousedown", on.bind(0, n, "click", stopPropagation, {
  C: true,
  $: true
}), {
  $: true
});

const createInteractiveScrollEvents = (t, n, o, s, e, c, r) => {
  const {V: l} = getEnvironment();
  const {Gt: i, Xt: a, Ut: u} = s;
  const f = `scroll${r ? "Left" : "Top"}`;
  const d = `client${r ? "X" : "Y"}`;
  const _ = r ? "width" : "height";
  const h = r ? "left" : "top";
  const g = r ? "w" : "h";
  const v = r ? "x" : "y";
  const createRelativeHandleMove = (t, n) => o => {
    const {Et: s} = c();
    const d = offsetSize(a)[g] - offsetSize(i)[g];
    const _ = n * o / d;
    const h = _ * s[v];
    const p = directionIsRTL(u);
    const w = p && r ? l.n || l.i ? 1 : -1 : 1;
    e[f] = t + h * w;
  };
  return on(a, "pointerdown", (s => {
    const c = closest(s.target, `.${et}`) === i;
    const r = c ? i : a;
    attrClass(n, A, M, true);
    if (continuePointerDown(s, t, c)) {
      const t = !c && s.shiftKey;
      const getHandleRect = () => getBoundingClientRect(i);
      const getTrackRect = () => getBoundingClientRect(a);
      const getHandleOffset = (t, n) => (t || getHandleRect())[h] - (n || getTrackRect())[h];
      const l = createRelativeHandleMove(e[f] || 0, 1 / getScale(e)[v]);
      const u = s[d];
      const g = getHandleRect();
      const p = getTrackRect();
      const w = g[_];
      const b = getHandleOffset(g, p) + w / 2;
      const m = u - p[h];
      const y = c ? 0 : m - b;
      const releasePointerCapture = t => {
        runEachAndClear(S);
        r.releasePointerCapture(t.pointerId);
      };
      const S = [ attrClass.bind(0, n, A, M), on(o, tn, releasePointerCapture), on(o, "selectstart", (t => preventDefault(t)), {
        S: false
      }), on(a, tn, releasePointerCapture), on(a, "pointermove", (n => {
        const o = n[d] - u;
        if (c || t) {
          l(y + o);
        }
      })) ];
      if (t) {
        l(y);
      } else if (!c) {
        const t = getPlugins()[Lt];
        if (t) {
          push(S, t.O(l, getHandleOffset, y, w, m));
        }
      }
      r.setPointerCapture(s.pointerId);
    }
  }));
};

const createScrollTimelineEvents = ({Gt: t}, n, o) => {
  if (!n) {
    return noop;
  }
  const s = t.animate(getScrollTimelineAnimation(o), {
    timeline: n
  });
  return () => {
    s.cancel();
  };
};

const createScrollbarsSetupEvents = (t, n) => (o, s, e, c, r, l, i) => {
  const {Ut: a} = o;
  const [u, f] = selfClearTimeout(333);
  const d = !!r.scrollBy;
  let _ = true;
  return runEachAndClear.bind(0, [ on(a, "pointerenter", (() => {
    s(it, true);
  })), on(a, "pointerleave pointercancel", (() => {
    s(it);
  })), on(a, "wheel", (t => {
    const {deltaX: n, deltaY: o, deltaMode: e} = t;
    if (d && _ && 0 === e && parent(a) === c) {
      r.scrollBy({
        left: n,
        top: o,
        behavior: "smooth"
      });
    }
    _ = false;
    s(dt, true);
    u((() => {
      _ = true;
      s(dt);
    }));
    preventDefault(t);
  }), {
    S: false,
    $: true
  }), createRootClickStopPropagationEvents(a, e), createInteractiveScrollEvents(t, c, e, o, r, n, i), createScrollTimelineEvents(o, l, i), f ]);
};

const {min: nn, max: sn, abs: en, round: cn} = Math;

const getScrollbarHandleLengthRatio = (t, n, o, s) => {
  if (s) {
    const t = o ? "x" : "y";
    const {Et: n, zt: e} = s;
    const c = e[t];
    const r = n[t];
    return sn(0, nn(1, c / (c + r)));
  }
  const e = o ? "width" : "height";
  const c = getBoundingClientRect(t)[e];
  const r = getBoundingClientRect(n)[e];
  return sn(0, nn(1, c / r));
};

const getScrollbarHandleOffsetRatio = (t, n, o, s, e, c) => {
  const {V: r} = getEnvironment();
  const l = c ? "x" : "y";
  const i = c ? "Left" : "Top";
  const {Et: a} = s;
  const u = cn(a[l]);
  const f = en(o[`scroll${i}`]);
  const d = c && e;
  const _ = r.i ? f : u - f;
  const h = d ? _ : f;
  const g = nn(1, h / u);
  const v = getScrollbarHandleLengthRatio(t, n, c);
  return 1 / v * (1 - v) * g;
};

const maxAnimationKeyFrameValue = t => `${Math.max(0, t - .5)}px`;

const animateScrollbar = (t, n, o, s) => t.animate({
  transform: [ getTrasformTranslateValue(`0px`, s), getTrasformTranslateValue(maxAnimationKeyFrameValue(o), s) ]
}, {
  timeline: n,
  composite: "add"
});

const initScrollTimeline = (t, n) => _ ? new _({
  source: t,
  axis: n
}) : null;

const createScrollbarsSetupElements = (t, n, o) => {
  const {q: s, H: e} = getEnvironment();
  const {scrollbars: c} = s();
  const {slot: r} = c;
  const {rt: l, Z: i, J: a, K: u, ut: f, st: d, it: _, ft: g} = n;
  const {scrollbars: v} = f ? {} : t;
  const {slot: p} = v || {};
  const w = new Map;
  const b = initScrollTimeline(d, "x");
  const m = initScrollTimeline(d, "y");
  const y = dynamicInitializationElement([ i, a, u ], (() => g && _ ? i : a), r, p);
  const doRefreshScrollbarOffset = t => g && !_ && parent(t) === u;
  const cancelScrollbarsOffsetAnimations = () => {
    w.forEach((t => {
      (t || []).forEach((t => {
        t.cancel();
      }));
    }));
  };
  const scrollbarStructureAddRemoveClass = (t, n, o) => {
    const s = o ? addClass : removeClass;
    each(t, (t => {
      s(t.Ut, n);
    }));
  };
  const scrollbarStyle = (t, n) => {
    each(t, (t => {
      const [o, s] = n(t);
      style(o, s);
    }));
  };
  const scrollbarStructureRefreshHandleLength = (t, n, o) => {
    scrollbarStyle(t, (t => {
      const {Gt: s, Xt: e} = t;
      return [ s, {
        [o ? "width" : "height"]: `${(100 * getScrollbarHandleLengthRatio(s, e, o, n)).toFixed(3)}%`
      } ];
    }));
  };
  const scrollbarStructureRefreshHandleOffset = (t, n, o) => {
    if (!m && !m) {
      scrollbarStyle(t, (t => {
        const {Gt: s, Xt: e, Ut: c} = t;
        const r = getScrollbarHandleOffsetRatio(s, e, d, n, directionIsRTL(c), o);
        const l = r === r;
        return [ s, {
          transform: l ? getTrasformTranslateValue(`${(100 * r).toFixed(3)}%`, o) : ""
        } ];
      }));
    }
  };
  const styleScrollbarPosition = t => {
    const {Ut: n} = t;
    const o = doRefreshScrollbarOffset(n) && n;
    return [ o, {
      transform: o ? getTrasformTranslateValue([ `${scrollLeft(d)}px`, `${scrollTop(d)}px` ]) : ""
    } ];
  };
  const S = [];
  const $ = [];
  const x = [];
  const scrollbarsAddRemoveClass = (t, n, o) => {
    const s = isBoolean(o);
    const e = s ? o : true;
    const c = s ? !o : true;
    e && scrollbarStructureAddRemoveClass($, t, n);
    c && scrollbarStructureAddRemoveClass(x, t, n);
  };
  const refreshScrollbarsHandleLength = t => {
    scrollbarStructureRefreshHandleLength($, t, true);
    scrollbarStructureRefreshHandleLength(x, t);
  };
  const refreshScrollbarsHandleOffset = t => {
    scrollbarStructureRefreshHandleOffset($, t, true);
    scrollbarStructureRefreshHandleOffset(x, t);
  };
  const refreshScrollbarsScrollbarOffset = () => {
    if (!m && !m) {
      g && scrollbarStyle($, styleScrollbarPosition);
      g && scrollbarStyle(x, styleScrollbarPosition);
    }
  };
  const refreshScrollbarsScrollbarOffsetTimeline = ({Et: t}) => {
    cancelScrollbarsOffsetAnimations();
    x.concat($).forEach((({Ut: n}) => {
      if (doRefreshScrollbarOffset(n)) {
        w.set(n, [ animateScrollbar(n, b, t.x, true), animateScrollbar(n, m, t.y) ]);
      }
    }));
  };
  const generateScrollbarDOM = t => {
    const n = t ? nt : ot;
    const s = t ? $ : x;
    const c = isEmptyArray(s) ? lt : "";
    const r = createDiv(`${Q} ${n} ${c}`);
    const i = createDiv(st);
    const u = createDiv(et);
    const f = {
      Ut: r,
      Xt: i,
      Gt: u
    };
    if (!e) {
      addClass(r, J);
    }
    appendChildren(r, i);
    appendChildren(i, u);
    push(s, f);
    push(S, [ () => {
      cancelScrollbarsOffsetAnimations();
      w.clear();
    }, removeElements.bind(0, r), o(f, scrollbarsAddRemoveClass, l, a, d, t ? b : m, t) ]);
    return f;
  };
  const C = generateScrollbarDOM.bind(0, true);
  const O = generateScrollbarDOM.bind(0, false);
  const appendElements = () => {
    appendChildren(y, $[0].Ut);
    appendChildren(y, x[0].Ut);
    h((() => {
      scrollbarsAddRemoveClass(lt);
    }), 300);
  };
  C();
  O();
  return [ {
    Wt: refreshScrollbarsHandleLength,
    Zt: refreshScrollbarsHandleOffset,
    Jt: refreshScrollbarsScrollbarOffsetTimeline,
    Kt: refreshScrollbarsScrollbarOffset,
    Qt: scrollbarsAddRemoveClass,
    tn: {
      B: b,
      nn: $,
      sn: C,
      en: scrollbarStyle.bind(0, $)
    },
    cn: {
      B: m,
      nn: x,
      sn: O,
      en: scrollbarStyle.bind(0, x)
    }
  }, appendElements, runEachAndClear.bind(0, S) ];
};

const createScrollbarsSetup = (t, n, o, s) => {
  let e;
  let c;
  let r;
  let l;
  let i;
  let a = 0;
  const u = createState({});
  const [f] = u;
  const [d, _] = selfClearTimeout();
  const [h, g] = selfClearTimeout();
  const [v, p] = selfClearTimeout(100);
  const [w, b] = selfClearTimeout(100);
  const [m, y] = selfClearTimeout(100);
  const [S, $] = selfClearTimeout((() => a));
  const [x, C, O] = createScrollbarsSetupElements(t, o.Ft, createScrollbarsSetupEvents(n, o));
  const {J: T, et: z, it: E} = o.Ft;
  const {Qt: A, Wt: I, Zt: H, Jt: L, Kt: P} = x;
  const manageAutoHideSuspension = t => {
    A(ut, t, true);
    A(ut, t, false);
  };
  const manageScrollbarsAutoHide = (t, n) => {
    $();
    if (t) {
      A(ft);
    } else {
      const hide = () => A(ft, true);
      if (a > 0 && !n) {
        S(hide);
      } else {
        hide();
      }
    }
  };
  const onHostMouseEnter = () => {
    l = c;
    l && manageScrollbarsAutoHide(true);
  };
  const M = [ p, $, b, y, g, _, O, on(T, "pointerover", onHostMouseEnter, {
    C: true
  }), on(T, "pointerenter", onHostMouseEnter), on(T, "pointerleave", (() => {
    l = false;
    c && manageScrollbarsAutoHide(false);
  })), on(T, "pointermove", (() => {
    e && d((() => {
      p();
      manageScrollbarsAutoHide(true);
      w((() => {
        e && manageScrollbarsAutoHide(false);
      }));
    }));
  })), on(z, "scroll", (t => {
    h((() => {
      H(o());
      r && manageScrollbarsAutoHide(true);
      v((() => {
        r && !l && manageScrollbarsAutoHide(false);
      }));
    }));
    s(t);
    P();
  })) ];
  const D = f.bind(0);
  D.Ft = x;
  D.qt = C;
  return [ (t, s, l) => {
    const {Ht: u, Lt: f, It: d, St: _, Pt: h} = l;
    const {I: g} = getEnvironment();
    const v = createOptionCheck(n, t, s);
    const p = o();
    const {Et: w, Ot: b, yt: y, At: S} = p;
    const [$, x] = v("showNativeOverlaidScrollbars");
    const [C, O] = v("scrollbars.theme");
    const [T, D] = v("scrollbars.visibility");
    const [R, k] = v("scrollbars.autoHide");
    const [B, V] = v("scrollbars.autoHideSuspend");
    const [Y] = v("scrollbars.autoHideDelay");
    const [j, N] = v("scrollbars.dragScroll");
    const [q, F] = v("scrollbars.clickScroll");
    const G = h && !s;
    const X = u || f || _;
    const U = d || D;
    const W = $ && g.x && g.y;
    const setScrollbarVisibility = (t, n) => {
      const o = "visible" === T || "auto" === T && "scroll" === t;
      A(ct, o, n);
      return o;
    };
    a = Y;
    if (x) {
      A(K, W);
    }
    if (O) {
      A(i);
      A(C, true);
      i = C;
    }
    if (V || G) {
      if (B && G && (S.x || S.y)) {
        manageAutoHideSuspension(false);
        m((() => M.push(on(z, "scroll", manageAutoHideSuspension.bind(0, true), {
          C: true
        }))));
      } else {
        manageAutoHideSuspension(true);
      }
    }
    if (k) {
      e = "move" === R;
      c = "leave" === R;
      r = "never" !== R;
      manageScrollbarsAutoHide(!r, true);
    }
    if (N) {
      A(ht, j);
    }
    if (F) {
      A(_t, q);
    }
    if (U) {
      const t = setScrollbarVisibility(b.x, true);
      const n = setScrollbarVisibility(b.y, false);
      const o = t && n;
      A(rt, !o);
    }
    if (X) {
      I(p);
      H(p);
      L(p);
      P();
      A(at, !w.x, true);
      A(at, !w.y, false);
      A(tt, y && !E);
    }
  }, D, runEachAndClear.bind(0, M) ];
};

const invokePluginInstance = (t, n, o) => {
  if (isFunction(t)) {
    t(n || void 0, o || void 0);
  }
};

const OverlayScrollbars = (t, n, o) => {
  const {G: s, q: e, j: c, N: r} = getEnvironment();
  const l = getPlugins();
  const i = isHTMLElement(t);
  const a = i ? t : t.target;
  const u = getInstance(a);
  if (n && !u) {
    let u = false;
    const validateOptions = t => {
      const n = getPlugins()[$t];
      const o = n && n.O;
      return o ? o(t, true) : t;
    };
    const f = assignDeep({}, s(), validateOptions(n));
    const [d, _, h] = createEventListenerHub(o);
    const [g, v, p] = createStructureSetup(t, f);
    const [w, b, m] = createScrollbarsSetup(t, f, v, (t => h("scroll", [ x, t ])));
    const update = (t, n) => g(t, !!n);
    const y = update.bind(0, {}, true);
    const S = c(y);
    const $ = r(y);
    const destroy = t => {
      removeInstance(a);
      S();
      $();
      m();
      p();
      u = true;
      h("destroyed", [ x, !!t ]);
      _();
    };
    const x = {
      options(t, n) {
        if (t) {
          const o = n ? s() : {};
          const e = getOptionsDiff(f, assignDeep(o, validateOptions(t)));
          if (!isEmptyObject(e)) {
            assignDeep(f, e);
            update(e);
          }
        }
        return assignDeep({}, f);
      },
      on: d,
      off: (t, n) => {
        t && n && _(t, n);
      },
      state() {
        const {zt: t, Et: n, Ot: o, At: s, tt: e, $t: c, yt: r} = v();
        return assignDeep({}, {
          overflowEdge: t,
          overflowAmount: n,
          overflowStyle: o,
          hasOverflow: s,
          padding: e,
          paddingAbsolute: c,
          directionRTL: r,
          destroyed: u
        });
      },
      elements() {
        const {Z: t, J: n, tt: o, K: s, nt: e, st: c, et: r} = v.Ft;
        const {tn: l, cn: i} = b.Ft;
        const translateScrollbarStructure = t => {
          const {Gt: n, Xt: o, Ut: s} = t;
          return {
            scrollbar: s,
            track: o,
            handle: n
          };
        };
        const translateScrollbarsSetupElement = t => {
          const {nn: n, sn: o} = t;
          const s = translateScrollbarStructure(n[0]);
          return assignDeep({}, s, {
            clone: () => {
              const t = translateScrollbarStructure(o());
              w({}, true, {});
              return t;
            }
          });
        };
        return assignDeep({}, {
          target: t,
          host: n,
          padding: o || s,
          viewport: s,
          content: e || s,
          scrollOffsetElement: c,
          scrollEventElement: r,
          scrollbarHorizontal: translateScrollbarsSetupElement(l),
          scrollbarVertical: translateScrollbarsSetupElement(i)
        });
      },
      update: t => update({}, t),
      destroy: destroy.bind(0)
    };
    v.Nt(((t, n, o) => {
      w(n, o, t);
    }));
    addInstance(a, x);
    each(keys(l), (t => invokePluginInstance(l[t], 0, x)));
    if (cancelInitialization(v.Ft.it, e().cancel, !i && t.cancel)) {
      destroy(true);
      return x;
    }
    v.qt();
    b.qt();
    h("initialized", [ x ]);
    v.Nt(((t, n, o) => {
      const {wt: s, St: e, vt: c, Ht: r, Lt: l, It: i, bt: a, Tt: u} = t;
      h("updated", [ x, {
        updateHints: {
          sizeChanged: s,
          directionChanged: e,
          heightIntrinsicChanged: c,
          overflowEdgeChanged: r,
          overflowAmountChanged: l,
          overflowStyleChanged: i,
          contentMutation: a,
          hostMutation: u
        },
        changedOptions: n,
        force: o
      } ]);
    }));
    x.update(true);
    return x;
  }
  return u;
};

OverlayScrollbars.plugin = t => {
  each(addPlugin(t), (t => invokePluginInstance(t, OverlayScrollbars)));
};

OverlayScrollbars.valid = t => {
  const n = t && t.elements;
  const o = isFunction(n) && n();
  return isPlainObject(o) && !!getInstance(o.target);
};

OverlayScrollbars.env = () => {
  const {k: t, I: n, A: o, V: s, Y: e, H: c, B: r, U: l, W: i, q: a, F: u, G: f, X: d} = getEnvironment();
  return assignDeep({}, {
    scrollbarsSize: t,
    scrollbarsOverlaid: n,
    scrollbarsHiding: o,
    rtlScrollBehavior: s,
    flexboxGlue: e,
    cssCustomProperties: c,
    scrollTimeline: r,
    staticDefaultInitialization: l,
    staticDefaultOptions: i,
    getDefaultInitialization: a,
    setDefaultInitialization: u,
    getDefaultOptions: f,
    setDefaultOptions: d
  });
};


//# sourceMappingURL=overlayscrollbars.mjs.map


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		var getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************************!*\
  !*** ./src/js/nice-select2.js ***!
  \********************************/
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bind": () => (/* binding */ bind),
/* harmony export */   "default": () => (/* binding */ NiceSelect)
/* harmony export */ });
/* harmony import */ var _scss_nice_select2_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/nice-select2.scss */ "./src/scss/nice-select2.scss");
/* harmony import */ var _floating_ui_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @floating-ui/dom */ "./node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs");
/* harmony import */ var _floating_ui_dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @floating-ui/dom */ "./node_modules/@floating-ui/core/dist/floating-ui.core.mjs");
/* harmony import */ var overlayscrollbars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! overlayscrollbars */ "./node_modules/overlayscrollbars/overlayscrollbars.mjs");
/* harmony import */ var scroll_into_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! scroll-into-view */ "./node_modules/scroll-into-view/scrollIntoView.js");
/* harmony import */ var scroll_into_view__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(scroll_into_view__WEBPACK_IMPORTED_MODULE_1__);







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


class NiceSelect {
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
					selected: item.getAttribute("selected") != null,
					disabled: item.getAttribute("disabled") != null
				};
			}

			var attributes = {
				selected: item.getAttribute("selected") != null,
				disabled: item.getAttribute("disabled") != null,
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
		this.menu.OverlayScrollbars = (0,overlayscrollbars__WEBPACK_IMPORTED_MODULE_2__.OverlayScrollbars)({
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
		this._renderSelectedItems();
		this._renderItems();
		
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
		(0,_floating_ui_dom__WEBPACK_IMPORTED_MODULE_3__.computePosition)(target, element, {
			placement: this.placement,
			middleware: [
				(0,_floating_ui_dom__WEBPACK_IMPORTED_MODULE_4__.offset)(this.offset),
				(0,_floating_ui_dom__WEBPACK_IMPORTED_MODULE_4__.flip)({ fallbackStrategy: 'bestFit', padding: this.offset }),
				this.availableHeight == true && (0,_floating_ui_dom__WEBPACK_IMPORTED_MODULE_4__.size)({
					apply({ availableHeight }) {
						Object.assign(element.style, {
							maxHeight: `${Math.max(100, availableHeight)}px`,
						});
					},
					padding: this.offset
				}),
				this.sameWidth == true && (0,_floating_ui_dom__WEBPACK_IMPORTED_MODULE_4__.size)({
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
			this.cleanup = (0,_floating_ui_dom__WEBPACK_IMPORTED_MODULE_3__.autoUpdate)(this.dropdown, this.menu, () => {
				this.positionMenu(this.dropdown, this.menu);
			}
			);
			scroll_into_view__WEBPACK_IMPORTED_MODULE_1___default()(this.menu.querySelector(".selected"), {
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
			scroll_into_view__WEBPACK_IMPORTED_MODULE_1___default()(next, {
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
			scroll_into_view__WEBPACK_IMPORTED_MODULE_1___default()(prev, {
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
























function bind(el, options) {
	return new NiceSelect(el, options);
}

})();

var __webpack_exports__bind = __webpack_exports__.bind;
var __webpack_exports__default = __webpack_exports__["default"];
export { __webpack_exports__bind as bind, __webpack_exports__default as default };

//# sourceMappingURL=nice-select2.js.map