// ----BEGIN: extensions/buttonTooltip_ExtensionPackage/ui/buttonTooltip/include/qtip/jquery.qtip.js
/*
 * qTip2 - Pretty powerful tooltips - v2.2.1
 * http://qtip2.com
 *
 * Copyright (c) 2014 
 * Released under the MIT licenses
 * http://jquery.org/license
 *
 * Date: Sat Sep 6 2014 06:06 EDT-0400
 * Plugins: None
 * Styles: core basic css3
 */
/*global window: false, jQuery: false, console: false, define: false */

/* Cache window, document, undefined */
(function( window, document, undefined ) {

// Uses AMD or browser globals to create a jQuery plugin.
(function( factory ) {
	"use strict";
	if(typeof define === 'function' && define.amd) {
		define('qtip',['jquery'], factory);
	}
	else if(jQuery && !jQuery.fn.qtip) {
		factory(jQuery);
	}
}
(function($) {
	"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
;// Munge the primitives - Paul Irish tip
var TRUE = true,
FALSE = false,
NULL = null,

// Common variables
X = 'x', Y = 'y',
WIDTH = 'width',
HEIGHT = 'height',

// Positioning sides
TOP = 'top',
LEFT = 'left',
BOTTOM = 'bottom',
RIGHT = 'right',
CENTER = 'center',

// Position adjustment types
FLIP = 'flip',
FLIPINVERT = 'flipinvert',
SHIFT = 'shift',

// Shortcut vars
QTIP, PROTOTYPE, CORNER, CHECKS,
PLUGINS = {},
NAMESPACE = 'qtip',
ATTR_HAS = 'data-hasqtip',
ATTR_ID = 'data-qtip-id',
WIDGET = ['ui-widget', 'ui-tooltip'],
SELECTOR = '.'+NAMESPACE,
INACTIVE_EVENTS = 'click dblclick mousedown mouseup mousemove mouseleave mouseenter'.split(' '),

CLASS_FIXED = NAMESPACE+'-fixed',
CLASS_DEFAULT = NAMESPACE + '-default',
CLASS_FOCUS = NAMESPACE + '-focus',
CLASS_HOVER = NAMESPACE + '-hover',
CLASS_DISABLED = NAMESPACE+'-disabled',

replaceSuffix = '_replacedByqTip',
oldtitle = 'oldtitle',
trackingBound,

// Browser detection
BROWSER = {
	/*
	 * IE version detection
	 *
	 * Adapted from: http://ajaxian.com/archives/attack-of-the-ie-conditional-comment
	 * Credit to James Padolsey for the original implemntation!
	 */
	ie: (function(){
		for (
			var v = 4, i = document.createElement("div");
			(i.innerHTML = "<!--[if gt IE " + v + "]><i></i><![endif]-->") && i.getElementsByTagName("i")[0];
			v+=1
		) {}
		return v > 4 ? v : NaN;
	}()),

	/*
	 * iOS version detection
	 */
	iOS: parseFloat(
		('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
		.replace('undefined', '3_2').replace('_', '.').replace('_', '')
	) || FALSE
};
;function QTip(target, options, id, attr) {
	// Elements and ID
	this.id = id;
	this.target = target;
	this.tooltip = NULL;
	this.elements = { target: target };

	// Internal constructs
	this._id = NAMESPACE + '-' + id;
	this.timers = { img: {} };
	this.options = options;
	this.plugins = {};

	// Cache object
	this.cache = {
		event: {},
		target: $(),
		disabled: FALSE,
		attr: attr,
		onTooltip: FALSE,
		lastClass: ''
	};

	// Set the initial flags
	this.rendered = this.destroyed = this.disabled = this.waiting =
		this.hiddenDuringWait = this.positioning = this.triggering = FALSE;
}
PROTOTYPE = QTip.prototype;

PROTOTYPE._when = function(deferreds) {
	return $.when.apply($, deferreds);
};

PROTOTYPE.render = function(show) {
	if(this.rendered || this.destroyed) { return this; } // If tooltip has already been rendered, exit

	var self = this,
		options = this.options,
		cache = this.cache,
		elements = this.elements,
		text = options.content.text,
		title = options.content.title,
		button = options.content.button,
		posOptions = options.position,
		namespace = '.'+this._id+' ',
		deferreds = [],
		tooltip;

	// Add ARIA attributes to target
	$.attr(this.target[0], 'aria-describedby', this._id);

	// Create public position object that tracks current position corners
	cache.posClass = this._createPosClass(
		(this.position = { my: posOptions.my, at: posOptions.at }).my
	);

	// Create tooltip element
	this.tooltip = elements.tooltip = tooltip = $('<div/>', {
		'id': this._id,
		'class': [ NAMESPACE, CLASS_DEFAULT, options.style.classes, cache.posClass ].join(' '),
		'width': options.style.width || '',
		'height': options.style.height || '',
		'tracking': posOptions.target === 'mouse' && posOptions.adjust.mouse,

		/* ARIA specific attributes */
		'role': 'alert',
		'aria-live': 'polite',
		'aria-atomic': FALSE,
		'aria-describedby': this._id + '-content',
		'aria-hidden': TRUE
	})
	.toggleClass(CLASS_DISABLED, this.disabled)
	.attr(ATTR_ID, this.id)
	.data(NAMESPACE, this)
	.appendTo(posOptions.container)
	.append(
		// Create content element
		elements.content = $('<div />', {
			'class': NAMESPACE + '-content',
			'id': this._id + '-content',
			'aria-atomic': TRUE
		})
	);

	// Set rendered flag and prevent redundant reposition calls for now
	this.rendered = -1;
	this.positioning = TRUE;

	// Create title...
	if(title) {
		this._createTitle();

		// Update title only if its not a callback (called in toggle if so)
		if(!$.isFunction(title)) {
			deferreds.push( this._updateTitle(title, FALSE) );
		}
	}

	// Create button
	if(button) { this._createButton(); }

	// Set proper rendered flag and update content if not a callback function (called in toggle)
	if(!$.isFunction(text)) {
		deferreds.push( this._updateContent(text, FALSE) );
	}
	this.rendered = TRUE;

	// Setup widget classes
	this._setWidget();

	// Initialize 'render' plugins
	$.each(PLUGINS, function(name) {
		var instance;
		if(this.initialize === 'render' && (instance = this(self))) {
			self.plugins[name] = instance;
		}
	});

	// Unassign initial events and assign proper events
	this._unassignEvents();
	this._assignEvents();

	// When deferreds have completed
	this._when(deferreds).then(function() {
		// tooltiprender event
		self._trigger('render');

		// Reset flags
		self.positioning = FALSE;

		// Show tooltip if not hidden during wait period
		if(!self.hiddenDuringWait && (options.show.ready || show)) {
			self.toggle(TRUE, cache.event, FALSE);
		}
		self.hiddenDuringWait = FALSE;
	});

	// Expose API
	QTIP.api[this.id] = this;

	return this;
};

PROTOTYPE.destroy = function(immediate) {
	// Set flag the signify destroy is taking place to plugins
	// and ensure it only gets destroyed once!
	if(this.destroyed) { return this.target; }

	function process() {
		if(this.destroyed) { return; }
		this.destroyed = TRUE;

		var target = this.target,
			title = target.attr(oldtitle),
			timer;

		// Destroy tooltip if rendered
		if(this.rendered) {
			this.tooltip.stop(1,0).find('*').remove().end().remove();
		}

		// Destroy all plugins
		$.each(this.plugins, function(name) {
			this.destroy && this.destroy();
		});

		// Clear timers
		for(timer in this.timers) {
			clearTimeout(this.timers[timer]);
		}

		// Remove api object and ARIA attributes
		target.removeData(NAMESPACE)
			.removeAttr(ATTR_ID)
			.removeAttr(ATTR_HAS)
			.removeAttr('aria-describedby');

		// Reset old title attribute if removed
		if(this.options.suppress && title) {
			target.attr('title', title).removeAttr(oldtitle);
		}

		// Remove qTip events associated with this API
		this._unassignEvents();

		// Remove ID from used id objects, and delete object references
		// for better garbage collection and leak protection
		this.options = this.elements = this.cache = this.timers =
			this.plugins = this.mouse = NULL;

		// Delete epoxsed API object
		delete QTIP.api[this.id];
	}

	// If an immediate destory is needed
	if((immediate !== TRUE || this.triggering === 'hide') && this.rendered) {
		this.tooltip.one('tooltiphidden', $.proxy(process, this));
		!this.triggering && this.hide();
	}

	// If we're not in the process of hiding... process
	else { process.call(this); }

	return this.target;
};
;function invalidOpt(a) {
	return a === NULL || $.type(a) !== 'object';
}

function invalidContent(c) {
	return !( $.isFunction(c) || (c && c.attr) || c.length || ($.type(c) === 'object' && (c.jquery || c.then) ));
}

// Option object sanitizer
function sanitizeOptions(opts) {
	var content, text, ajax, once;

	if(invalidOpt(opts)) { return FALSE; }

	if(invalidOpt(opts.metadata)) {
		opts.metadata = { type: opts.metadata };
	}

	if('content' in opts) {
		content = opts.content;

		if(invalidOpt(content) || content.jquery || content.done) {
			content = opts.content = {
				text: (text = invalidContent(content) ? FALSE : content)
			};
		}
		else { text = content.text; }

		// DEPRECATED - Old content.ajax plugin functionality
		// Converts it into the proper Deferred syntax
		if('ajax' in content) {
			ajax = content.ajax;
			once = ajax && ajax.once !== FALSE;
			delete content.ajax;

			content.text = function(event, api) {
				var loading = text || $(this).attr(api.options.content.attr) || 'Loading...',

				deferred = $.ajax(
					$.extend({}, ajax, { context: api })
				)
				.then(ajax.success, NULL, ajax.error)
				.then(function(content) {
					if(content && once) { api.set('content.text', content); }
					return content;
				},
				function(xhr, status, error) {
					if(api.destroyed || xhr.status === 0) { return; }
					api.set('content.text', status + ': ' + error);
				});

				return !once ? (api.set('content.text', loading), deferred) : loading;
			};
		}

		if('title' in content) {
			if($.isPlainObject(content.title)) {
				content.button = content.title.button;
				content.title = content.title.text;
			}

			if(invalidContent(content.title || FALSE)) {
				content.title = FALSE;
			}
		}
	}

	if('position' in opts && invalidOpt(opts.position)) {
		opts.position = { my: opts.position, at: opts.position };
	}

	if('show' in opts && invalidOpt(opts.show)) {
		opts.show = opts.show.jquery ? { target: opts.show } :
			opts.show === TRUE ? { ready: TRUE } : { event: opts.show };
	}

	if('hide' in opts && invalidOpt(opts.hide)) {
		opts.hide = opts.hide.jquery ? { target: opts.hide } : { event: opts.hide };
	}

	if('style' in opts && invalidOpt(opts.style)) {
		opts.style = { classes: opts.style };
	}

	// Sanitize plugin options
	$.each(PLUGINS, function() {
		this.sanitize && this.sanitize(opts);
	});

	return opts;
}

// Setup builtin .set() option checks
CHECKS = PROTOTYPE.checks = {
	builtin: {
		// Core checks
		'^id$': function(obj, o, v, prev) {
			var id = v === TRUE ? QTIP.nextid : v,
				new_id = NAMESPACE + '-' + id;

			if(id !== FALSE && id.length > 0 && !$('#'+new_id).length) {
				this._id = new_id;

				if(this.rendered) {
					this.tooltip[0].id = this._id;
					this.elements.content[0].id = this._id + '-content';
					this.elements.title[0].id = this._id + '-title';
				}
			}
			else { obj[o] = prev; }
		},
		'^prerender': function(obj, o, v) {
			v && !this.rendered && this.render(this.options.show.ready);
		},

		// Content checks
		'^content.text$': function(obj, o, v) {
			this._updateContent(v);
		},
		'^content.attr$': function(obj, o, v, prev) {
			if(this.options.content.text === this.target.attr(prev)) {
				this._updateContent( this.target.attr(v) );
			}
		},
		'^content.title$': function(obj, o, v) {
			// Remove title if content is null
			if(!v) { return this._removeTitle(); }

			// If title isn't already created, create it now and update
			v && !this.elements.title && this._createTitle();
			this._updateTitle(v);
		},
		'^content.button$': function(obj, o, v) {
			this._updateButton(v);
		},
		'^content.title.(text|button)$': function(obj, o, v) {
			this.set('content.'+o, v); // Backwards title.text/button compat
		},

		// Position checks
		'^position.(my|at)$': function(obj, o, v){
			'string' === typeof v && (this.position[o] = obj[o] = new CORNER(v, o === 'at'));
		},
		'^position.container$': function(obj, o, v){
			this.rendered && this.tooltip.appendTo(v);
		},

		// Show checks
		'^show.ready$': function(obj, o, v) {
			v && (!this.rendered && this.render(TRUE) || this.toggle(TRUE));
		},

		// Style checks
		'^style.classes$': function(obj, o, v, p) {
			this.rendered && this.tooltip.removeClass(p).addClass(v);
		},
		'^style.(width|height)': function(obj, o, v) {
			this.rendered && this.tooltip.css(o, v);
		},
		'^style.widget|content.title': function() {
			this.rendered && this._setWidget();
		},
		'^style.def': function(obj, o, v) {
			this.rendered && this.tooltip.toggleClass(CLASS_DEFAULT, !!v);
		},

		// Events check
		'^events.(render|show|move|hide|focus|blur)$': function(obj, o, v) {
			this.rendered && this.tooltip[($.isFunction(v) ? '' : 'un') + 'bind']('tooltip'+o, v);
		},

		// Properties which require event reassignment
		'^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)': function() {
			if(!this.rendered) { return; }

			// Set tracking flag
			var posOptions = this.options.position;
			this.tooltip.attr('tracking', posOptions.target === 'mouse' && posOptions.adjust.mouse);

			// Reassign events
			this._unassignEvents();
			this._assignEvents();
		}
	}
};

// Dot notation converter
function convertNotation(options, notation) {
	var i = 0, obj, option = options,

	// Split notation into array
	levels = notation.split('.');

	// Loop through
	while( option = option[ levels[i++] ] ) {
		if(i < levels.length) { obj = option; }
	}

	return [obj || options, levels.pop()];
}

PROTOTYPE.get = function(notation) {
	if(this.destroyed) { return this; }

	var o = convertNotation(this.options, notation.toLowerCase()),
		result = o[0][ o[1] ];

	return result.precedance ? result.string() : result;
};

function setCallback(notation, args) {
	var category, rule, match;

	for(category in this.checks) {
		for(rule in this.checks[category]) {
			if(match = (new RegExp(rule, 'i')).exec(notation)) {
				args.push(match);

				if(category === 'builtin' || this.plugins[category]) {
					this.checks[category][rule].apply(
						this.plugins[category] || this, args
					);
				}
			}
		}
	}
}

var rmove = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i,
	rrender = /^prerender|show\.ready/i;

PROTOTYPE.set = function(option, value) {
	if(this.destroyed) { return this; }

	var rendered = this.rendered,
		reposition = FALSE,
		options = this.options,
		checks = this.checks,
		name;

	// Convert singular option/value pair into object form
	if('string' === typeof option) {
		name = option; option = {}; option[name] = value;
	}
	else { option = $.extend({}, option); }

	// Set all of the defined options to their new values
	$.each(option, function(notation, value) {
		if(rendered && rrender.test(notation)) {
			delete option[notation]; return;
		}

		// Set new obj value
		var obj = convertNotation(options, notation.toLowerCase()), previous;
		previous = obj[0][ obj[1] ];
		obj[0][ obj[1] ] = value && value.nodeType ? $(value) : value;

		// Also check if we need to reposition
		reposition = rmove.test(notation) || reposition;

		// Set the new params for the callback
		option[notation] = [obj[0], obj[1], value, previous];
	});

	// Re-sanitize options
	sanitizeOptions(options);

	/*
	 * Execute any valid callbacks for the set options
	 * Also set positioning flag so we don't get loads of redundant repositioning calls.
	 */
	this.positioning = TRUE;
	$.each(option, $.proxy(setCallback, this));
	this.positioning = FALSE;

	// Update position if needed
	if(this.rendered && this.tooltip[0].offsetWidth > 0 && reposition) {
		this.reposition( options.position.target === 'mouse' ? NULL : this.cache.event );
	}

	return this;
};
;PROTOTYPE._update = function(content, element, reposition) {
	var self = this,
		cache = this.cache;

	// Make sure tooltip is rendered and content is defined. If not return
	if(!this.rendered || !content) { return FALSE; }

	// Use function to parse content
	if($.isFunction(content)) {
		content = content.call(this.elements.target, cache.event, this) || '';
	}

	// Handle deferred content
	if($.isFunction(content.then)) {
		cache.waiting = TRUE;
		return content.then(function(c) {
			cache.waiting = FALSE;
			return self._update(c, element);
		}, NULL, function(e) {
			return self._update(e, element);
		});
	}

	// If content is null... return false
	if(content === FALSE || (!content && content !== '')) { return FALSE; }

	// Append new content if its a DOM array and show it if hidden
	if(content.jquery && content.length > 0) {
		element.empty().append(
			content.css({ display: 'block', visibility: 'visible' })
		);
	}

	// Content is a regular string, insert the new content
	else { element.html(content); }

	// Wait for content to be loaded, and reposition
	return this._waitForContent(element).then(function(images) {
		if(self.rendered && self.tooltip[0].offsetWidth > 0) {
			self.reposition(cache.event, !images.length);
		}
	});
};

PROTOTYPE._waitForContent = function(element) {
	var cache = this.cache;

	// Set flag
	cache.waiting = TRUE;

	// If imagesLoaded is included, ensure images have loaded and return promise
	return ( $.fn.imagesLoaded ? element.imagesLoaded() : $.Deferred().resolve([]) )
		.done(function() { cache.waiting = FALSE; })
		.promise();
};

PROTOTYPE._updateContent = function(content, reposition) {
	this._update(content, this.elements.content, reposition);
};

PROTOTYPE._updateTitle = function(content, reposition) {
	if(this._update(content, this.elements.title, reposition) === FALSE) {
		this._removeTitle(FALSE);
	}
};

PROTOTYPE._createTitle = function()
{
	var elements = this.elements,
		id = this._id+'-title';

	// Destroy previous title element, if present
	if(elements.titlebar) { this._removeTitle(); }

	// Create title bar and title elements
	elements.titlebar = $('<div />', {
		'class': NAMESPACE + '-titlebar ' + (this.options.style.widget ? createWidgetClass('header') : '')
	})
	.append(
		elements.title = $('<div />', {
			'id': id,
			'class': NAMESPACE + '-title',
			'aria-atomic': TRUE
		})
	)
	.insertBefore(elements.content)

	// Button-specific events
	.delegate('.qtip-close', 'mousedown keydown mouseup keyup mouseout', function(event) {
		$(this).toggleClass('ui-state-active ui-state-focus', event.type.substr(-4) === 'down');
	})
	.delegate('.qtip-close', 'mouseover mouseout', function(event){
		$(this).toggleClass('ui-state-hover', event.type === 'mouseover');
	});

	// Create button if enabled
	if(this.options.content.button) { this._createButton(); }
};

PROTOTYPE._removeTitle = function(reposition)
{
	var elements = this.elements;

	if(elements.title) {
		elements.titlebar.remove();
		elements.titlebar = elements.title = elements.button = NULL;

		// Reposition if enabled
		if(reposition !== FALSE) { this.reposition(); }
	}
};
;PROTOTYPE._createPosClass = function(my) {
	return NAMESPACE + '-pos-' + (my || this.options.position.my).abbrev();
};

PROTOTYPE.reposition = function(event, effect) {
	if(!this.rendered || this.positioning || this.destroyed) { return this; }

	// Set positioning flag
	this.positioning = TRUE;

	var cache = this.cache,
		tooltip = this.tooltip,
		posOptions = this.options.position,
		target = posOptions.target,
		my = posOptions.my,
		at = posOptions.at,
		viewport = posOptions.viewport,
		container = posOptions.container,
		adjust = posOptions.adjust,
		method = adjust.method.split(' '),
		tooltipWidth = tooltip.outerWidth(FALSE),
		tooltipHeight = tooltip.outerHeight(FALSE),
		targetWidth = 0,
		targetHeight = 0,
		type = tooltip.css('position'),
		position = { left: 0, top: 0 },
		visible = tooltip[0].offsetWidth > 0,
		isScroll = event && event.type === 'scroll',
		win = $(window),
		doc = container[0].ownerDocument,
		mouse = this.mouse,
		pluginCalculations, offset, adjusted, newClass;

	// Check if absolute position was passed
	if($.isArray(target) && target.length === 2) {
		// Force left top and set position
		at = { x: LEFT, y: TOP };
		position = { left: target[0], top: target[1] };
	}

	// Check if mouse was the target
	else if(target === 'mouse') {
		// Force left top to allow flipping
		at = { x: LEFT, y: TOP };

		// Use the mouse origin that caused the show event, if distance hiding is enabled
		if((!adjust.mouse || this.options.hide.distance) && cache.origin && cache.origin.pageX) {
			event =  cache.origin;
		}

		// Use cached event for resize/scroll events
		else if(!event || (event && (event.type === 'resize' || event.type === 'scroll'))) {
			event = cache.event;
		}

		// Otherwise, use the cached mouse coordinates if available
		else if(mouse && mouse.pageX) {
			event = mouse;
		}

		// Calculate body and container offset and take them into account below
		if(type !== 'static') { position = container.offset(); }
		if(doc.body.offsetWidth !== (window.innerWidth || doc.documentElement.clientWidth)) {
			offset = $(document.body).offset();
		}

		// Use event coordinates for position
		position = {
			left: event.pageX - position.left + (offset && offset.left || 0),
			top: event.pageY - position.top + (offset && offset.top || 0)
		};

		// Scroll events are a pain, some browsers
		if(adjust.mouse && isScroll && mouse) {
			position.left -= (mouse.scrollX || 0) - win.scrollLeft();
			position.top -= (mouse.scrollY || 0) - win.scrollTop();
		}
	}

	// Target wasn't mouse or absolute...
	else {
		// Check if event targetting is being used
		if(target === 'event') {
			if(event && event.target && event.type !== 'scroll' && event.type !== 'resize') {
				cache.target = $(event.target);
			}
			else if(!event.target) {
				cache.target = this.elements.target;
			}
		}
		else if(target !== 'event'){
			cache.target = $(target.jquery ? target : this.elements.target);
		}
		target = cache.target;

		// Parse the target into a jQuery object and make sure there's an element present
		target = $(target).eq(0);
		if(target.length === 0) { return this; }

		// Check if window or document is the target
		else if(target[0] === document || target[0] === window) {
			targetWidth = BROWSER.iOS ? window.innerWidth : target.width();
			targetHeight = BROWSER.iOS ? window.innerHeight : target.height();

			if(target[0] === window) {
				position = {
					top: (viewport || target).scrollTop(),
					left: (viewport || target).scrollLeft()
				};
			}
		}

		// Check if the target is an <AREA> element
		else if(PLUGINS.imagemap && target.is('area')) {
			pluginCalculations = PLUGINS.imagemap(this, target, at, PLUGINS.viewport ? method : FALSE);
		}

		// Check if the target is an SVG element
		else if(PLUGINS.svg && target && target[0].ownerSVGElement) {
			pluginCalculations = PLUGINS.svg(this, target, at, PLUGINS.viewport ? method : FALSE);
		}

		// Otherwise use regular jQuery methods
		else {
			targetWidth = target.outerWidth(FALSE);
			targetHeight = target.outerHeight(FALSE);
			position = target.offset();
		}

		// Parse returned plugin values into proper variables
		if(pluginCalculations) {
			targetWidth = pluginCalculations.width;
			targetHeight = pluginCalculations.height;
			offset = pluginCalculations.offset;
			position = pluginCalculations.position;
		}

		// Adjust position to take into account offset parents
		position = this.reposition.offset(target, position, container);

		// Adjust for position.fixed tooltips (and also iOS scroll bug in v3.2-4.0 & v4.3-4.3.2)
		if((BROWSER.iOS > 3.1 && BROWSER.iOS < 4.1) ||
			(BROWSER.iOS >= 4.3 && BROWSER.iOS < 4.33) ||
			(!BROWSER.iOS && type === 'fixed')
		){
			position.left -= win.scrollLeft();
			position.top -= win.scrollTop();
		}

		// Adjust position relative to target
		if(!pluginCalculations || (pluginCalculations && pluginCalculations.adjustable !== FALSE)) {
			position.left += at.x === RIGHT ? targetWidth : at.x === CENTER ? targetWidth / 2 : 0;
			position.top += at.y === BOTTOM ? targetHeight : at.y === CENTER ? targetHeight / 2 : 0;
		}
	}

	// Adjust position relative to tooltip
	position.left += adjust.x + (my.x === RIGHT ? -tooltipWidth : my.x === CENTER ? -tooltipWidth / 2 : 0);
	position.top += adjust.y + (my.y === BOTTOM ? -tooltipHeight : my.y === CENTER ? -tooltipHeight / 2 : 0);

	// Use viewport adjustment plugin if enabled
	if(PLUGINS.viewport) {
		adjusted = position.adjusted = PLUGINS.viewport(
			this, position, posOptions, targetWidth, targetHeight, tooltipWidth, tooltipHeight
		);

		// Apply offsets supplied by positioning plugin (if used)
		if(offset && adjusted.left) { position.left += offset.left; }
		if(offset && adjusted.top) {  position.top += offset.top; }

		// Apply any new 'my' position
		if(adjusted.my) { this.position.my = adjusted.my; }
	}

	// Viewport adjustment is disabled, set values to zero
	else { position.adjusted = { left: 0, top: 0 }; }

	// Set tooltip position class if it's changed
	if(cache.posClass !== (newClass = this._createPosClass(this.position.my))) {
		tooltip.removeClass(cache.posClass).addClass( (cache.posClass = newClass) );
	}

	// tooltipmove event
	if(!this._trigger('move', [position, viewport.elem || viewport], event)) { return this; }
	delete position.adjusted;

	// If effect is disabled, target it mouse, no animation is defined or positioning gives NaN out, set CSS directly
	if(effect === FALSE || !visible || isNaN(position.left) || isNaN(position.top) || target === 'mouse' || !$.isFunction(posOptions.effect)) {
		tooltip.css(position);
	}

	// Use custom function if provided
	else if($.isFunction(posOptions.effect)) {
		posOptions.effect.call(tooltip, this, $.extend({}, position));
		tooltip.queue(function(next) {
			// Reset attributes to avoid cross-browser rendering bugs
			$(this).css({ opacity: '', height: '' });
			if(BROWSER.ie) { this.style.removeAttribute('filter'); }

			next();
		});
	}

	// Set positioning flag
	this.positioning = FALSE;

	return this;
};

// Custom (more correct for qTip!) offset calculator
PROTOTYPE.reposition.offset = function(elem, pos, container) {
	if(!container[0]) { return pos; }

	var ownerDocument = $(elem[0].ownerDocument),
		quirks = !!BROWSER.ie && document.compatMode !== 'CSS1Compat',
		parent = container[0],
		scrolled, position, parentOffset, overflow;

	function scroll(e, i) {
		pos.left += i * e.scrollLeft();
		pos.top += i * e.scrollTop();
	}

	// Compensate for non-static containers offset
	do {
		if((position = $.css(parent, 'position')) !== 'static') {
			if(position === 'fixed') {
				parentOffset = parent.getBoundingClientRect();
				scroll(ownerDocument, -1);
			}
			else {
				parentOffset = $(parent).position();
				parentOffset.left += (parseFloat($.css(parent, 'borderLeftWidth')) || 0);
				parentOffset.top += (parseFloat($.css(parent, 'borderTopWidth')) || 0);
			}

			pos.left -= parentOffset.left + (parseFloat($.css(parent, 'marginLeft')) || 0);
			pos.top -= parentOffset.top + (parseFloat($.css(parent, 'marginTop')) || 0);

			// If this is the first parent element with an overflow of "scroll" or "auto", store it
			if(!scrolled && (overflow = $.css(parent, 'overflow')) !== 'hidden' && overflow !== 'visible') { scrolled = $(parent); }
		}
	}
	while((parent = parent.offsetParent));

	// Compensate for containers scroll if it also has an offsetParent (or in IE quirks mode)
	if(scrolled && (scrolled[0] !== ownerDocument[0] || quirks)) {
		scroll(scrolled, 1);
	}

	return pos;
};

// Corner class
var C = (CORNER = PROTOTYPE.reposition.Corner = function(corner, forceY) {
	corner = ('' + corner).replace(/([A-Z])/, ' $1').replace(/middle/gi, CENTER).toLowerCase();
	this.x = (corner.match(/left|right/i) || corner.match(/center/) || ['inherit'])[0].toLowerCase();
	this.y = (corner.match(/top|bottom|center/i) || ['inherit'])[0].toLowerCase();
	this.forceY = !!forceY;

	var f = corner.charAt(0);
	this.precedance = (f === 't' || f === 'b' ? Y : X);
}).prototype;

C.invert = function(z, center) {
	this[z] = this[z] === LEFT ? RIGHT : this[z] === RIGHT ? LEFT : center || this[z];
};

C.string = function(join) {
	var x = this.x, y = this.y;

	var result = x !== y ?
		(x === 'center' || y !== 'center' && (this.precedance === Y || this.forceY) ? 
			[y,x] : [x,y]
		) :
	[x];

	return join !== false ? result.join(' ') : result;
};

C.abbrev = function() {
	var result = this.string(false);
	return result[0].charAt(0) + (result[1] && result[1].charAt(0) || '');
};

C.clone = function() {
	return new CORNER( this.string(), this.forceY );
};

;
PROTOTYPE.toggle = function(state, event) {
	var cache = this.cache,
		options = this.options,
		tooltip = this.tooltip;

	// Try to prevent flickering when tooltip overlaps show element
	if(event) {
		if((/over|enter/).test(event.type) && cache.event && (/out|leave/).test(cache.event.type) &&
			options.show.target.add(event.target).length === options.show.target.length &&
			tooltip.has(event.relatedTarget).length) {
			return this;
		}

		// Cache event
		cache.event = $.event.fix(event);
	}

	// If we're currently waiting and we've just hidden... stop it
	this.waiting && !state && (this.hiddenDuringWait = TRUE);

	// Render the tooltip if showing and it isn't already
	if(!this.rendered) { return state ? this.render(1) : this; }
	else if(this.destroyed || this.disabled) { return this; }

	var type = state ? 'show' : 'hide',
		opts = this.options[type],
		otherOpts = this.options[ !state ? 'show' : 'hide' ],
		posOptions = this.options.position,
		contentOptions = this.options.content,
		width = this.tooltip.css('width'),
		visible = this.tooltip.is(':visible'),
		animate = state || opts.target.length === 1,
		sameTarget = !event || opts.target.length < 2 || cache.target[0] === event.target,
		identicalState, allow, showEvent, delay, after;

	// Detect state if valid one isn't provided
	if((typeof state).search('boolean|number')) { state = !visible; }

	// Check if the tooltip is in an identical state to the new would-be state
	identicalState = !tooltip.is(':animated') && visible === state && sameTarget;

	// Fire tooltip(show/hide) event and check if destroyed
	allow = !identicalState ? !!this._trigger(type, [90]) : NULL;

	// Check to make sure the tooltip wasn't destroyed in the callback
	if(this.destroyed) { return this; }

	// If the user didn't stop the method prematurely and we're showing the tooltip, focus it
	if(allow !== FALSE && state) { this.focus(event); }

	// If the state hasn't changed or the user stopped it, return early
	if(!allow || identicalState) { return this; }

	// Set ARIA hidden attribute
	$.attr(tooltip[0], 'aria-hidden', !!!state);

	// Execute state specific properties
	if(state) {
		// Store show origin coordinates
		this.mouse && (cache.origin = $.event.fix(this.mouse));

		// Update tooltip content & title if it's a dynamic function
		if($.isFunction(contentOptions.text)) { this._updateContent(contentOptions.text, FALSE); }
		if($.isFunction(contentOptions.title)) { this._updateTitle(contentOptions.title, FALSE); }

		// Cache mousemove events for positioning purposes (if not already tracking)
		if(!trackingBound && posOptions.target === 'mouse' && posOptions.adjust.mouse) {
			$(document).bind('mousemove.'+NAMESPACE, this._storeMouse);
			trackingBound = TRUE;
		}

		// Update the tooltip position (set width first to prevent viewport/max-width issues)
		if(!width) { tooltip.css('width', tooltip.outerWidth(FALSE)); }
		this.reposition(event, arguments[2]);
		if(!width) { tooltip.css('width', ''); }

		// Hide other tooltips if tooltip is solo
		if(!!opts.solo) {
			(typeof opts.solo === 'string' ? $(opts.solo) : $(SELECTOR, opts.solo))
				.not(tooltip).not(opts.target).qtip('hide', $.Event('tooltipsolo'));
		}
	}
	else {
		// Clear show timer if we're hiding
		clearTimeout(this.timers.show);

		// Remove cached origin on hide
		delete cache.origin;

		// Remove mouse tracking event if not needed (all tracking qTips are hidden)
		if(trackingBound && !$(SELECTOR+'[tracking="true"]:visible', opts.solo).not(tooltip).length) {
			$(document).unbind('mousemove.'+NAMESPACE);
			trackingBound = FALSE;
		}

		// Blur the tooltip
		this.blur(event);
	}

	// Define post-animation, state specific properties
	after = $.proxy(function() {
		if(state) {
			// Prevent antialias from disappearing in IE by removing filter
			if(BROWSER.ie) { tooltip[0].style.removeAttribute('filter'); }

			// Remove overflow setting to prevent tip bugs
			tooltip.css('overflow', '');

			// Autofocus elements if enabled
			if('string' === typeof opts.autofocus) {
				$(this.options.show.autofocus, tooltip).focus();
			}

			// If set, hide tooltip when inactive for delay period
			this.options.show.target.trigger('qtip-'+this.id+'-inactive');
		}
		else {
			// Reset CSS states
			tooltip.css({
				display: '',
				visibility: '',
				opacity: '',
				left: '',
				top: ''
			});
		}

		// tooltipvisible/tooltiphidden events
		this._trigger(state ? 'visible' : 'hidden');
	}, this);

	// If no effect type is supplied, use a simple toggle
	if(opts.effect === FALSE || animate === FALSE) {
		tooltip[ type ]();
		after();
	}

	// Use custom function if provided
	else if($.isFunction(opts.effect)) {
		tooltip.stop(1, 1);
		opts.effect.call(tooltip, this);
		tooltip.queue('fx', function(n) {
			after(); n();
		});
	}

	// Use basic fade function by default
	else { tooltip.fadeTo(90, state ? 1 : 0, after); }

	// If inactive hide method is set, active it
	if(state) { opts.target.trigger('qtip-'+this.id+'-inactive'); }

	return this;
};

PROTOTYPE.show = function(event) { return this.toggle(TRUE, event); };

PROTOTYPE.hide = function(event) { return this.toggle(FALSE, event); };
;PROTOTYPE.focus = function(event) {
	if(!this.rendered || this.destroyed) { return this; }

	var qtips = $(SELECTOR),
		tooltip = this.tooltip,
		curIndex = parseInt(tooltip[0].style.zIndex, 10),
		newIndex = QTIP.zindex + qtips.length,
		focusedElem;

	// Only update the z-index if it has changed and tooltip is not already focused
	if(!tooltip.hasClass(CLASS_FOCUS)) {
		// tooltipfocus event
		if(this._trigger('focus', [newIndex], event)) {
			// Only update z-index's if they've changed
			if(curIndex !== newIndex) {
				// Reduce our z-index's and keep them properly ordered
				qtips.each(function() {
					if(this.style.zIndex > curIndex) {
						this.style.zIndex = this.style.zIndex - 1;
					}
				});

				// Fire blur event for focused tooltip
				qtips.filter('.' + CLASS_FOCUS).qtip('blur', event);
			}

			// Set the new z-index
			tooltip.addClass(CLASS_FOCUS)[0].style.zIndex = newIndex;
		}
	}

	return this;
};

PROTOTYPE.blur = function(event) {
	if(!this.rendered || this.destroyed) { return this; }

	// Set focused status to FALSE
	this.tooltip.removeClass(CLASS_FOCUS);

	// tooltipblur event
	this._trigger('blur', [ this.tooltip.css('zIndex') ], event);

	return this;
};
;PROTOTYPE.disable = function(state) {
	if(this.destroyed) { return this; }

	// If 'toggle' is passed, toggle the current state
	if(state === 'toggle') {
		state = !(this.rendered ? this.tooltip.hasClass(CLASS_DISABLED) : this.disabled);
	}

	// Disable if no state passed
	else if('boolean' !== typeof state) {
		state = TRUE;
	}

	if(this.rendered) {
		this.tooltip.toggleClass(CLASS_DISABLED, state)
			.attr('aria-disabled', state);
	}

	this.disabled = !!state;

	return this;
};

PROTOTYPE.enable = function() { return this.disable(FALSE); };
;PROTOTYPE._createButton = function()
{
	var self = this,
		elements = this.elements,
		tooltip = elements.tooltip,
		button = this.options.content.button,
		isString = typeof button === 'string',
		close = isString ? button : 'Close tooltip';

	if(elements.button) { elements.button.remove(); }

	// Use custom button if one was supplied by user, else use default
	if(button.jquery) {
		elements.button = button;
	}
	else {
		elements.button = $('<a />', {
			'class': 'qtip-close ' + (this.options.style.widget ? '' : NAMESPACE+'-icon'),
			'title': close,
			'aria-label': close
		})
		.prepend(
			$('<span />', {
				'class': 'ui-icon ui-icon-close',
				'html': '&times;'
			})
		);
	}

	// Create button and setup attributes
	elements.button.appendTo(elements.titlebar || tooltip)
		.attr('role', 'button')
		.click(function(event) {
			if(!tooltip.hasClass(CLASS_DISABLED)) { self.hide(event); }
			return FALSE;
		});
};

PROTOTYPE._updateButton = function(button)
{
	// Make sure tooltip is rendered and if not, return
	if(!this.rendered) { return FALSE; }

	var elem = this.elements.button;
	if(button) { this._createButton(); }
	else { elem.remove(); }
};
;// Widget class creator
function createWidgetClass(cls) {
	return WIDGET.concat('').join(cls ? '-'+cls+' ' : ' ');
}

// Widget class setter method
PROTOTYPE._setWidget = function()
{
	var on = this.options.style.widget,
		elements = this.elements,
		tooltip = elements.tooltip,
		disabled = tooltip.hasClass(CLASS_DISABLED);

	tooltip.removeClass(CLASS_DISABLED);
	CLASS_DISABLED = on ? 'ui-state-disabled' : 'qtip-disabled';
	tooltip.toggleClass(CLASS_DISABLED, disabled);

	tooltip.toggleClass('ui-helper-reset '+createWidgetClass(), on).toggleClass(CLASS_DEFAULT, this.options.style.def && !on);

	if(elements.content) {
		elements.content.toggleClass( createWidgetClass('content'), on);
	}
	if(elements.titlebar) {
		elements.titlebar.toggleClass( createWidgetClass('header'), on);
	}
	if(elements.button) {
		elements.button.toggleClass(NAMESPACE+'-icon', !on);
	}
};
;function delay(callback, duration) {
	// If tooltip has displayed, start hide timer
	if(duration > 0) {
		return setTimeout(
			$.proxy(callback, this), duration
		);
	}
	else{ callback.call(this); }
}

function showMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED)) { return; }

	// Clear hide timers
	clearTimeout(this.timers.show);
	clearTimeout(this.timers.hide);

	// Start show timer
	this.timers.show = delay.call(this,
		function() { this.toggle(TRUE, event); },
		this.options.show.delay
	);
}

function hideMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED) || this.destroyed) { return; }

	// Check if new target was actually the tooltip element
	var relatedTarget = $(event.relatedTarget),
		ontoTooltip = relatedTarget.closest(SELECTOR)[0] === this.tooltip[0],
		ontoTarget = relatedTarget[0] === this.options.show.target[0];

	// Clear timers and stop animation queue
	clearTimeout(this.timers.show);
	clearTimeout(this.timers.hide);

	// Prevent hiding if tooltip is fixed and event target is the tooltip.
	// Or if mouse positioning is enabled and cursor momentarily overlaps
	if(this !== relatedTarget[0] &&
		(this.options.position.target === 'mouse' && ontoTooltip) ||
		(this.options.hide.fixed && (
			(/mouse(out|leave|move)/).test(event.type) && (ontoTooltip || ontoTarget))
		))
	{
		try {
			event.preventDefault();
			event.stopImmediatePropagation();
		} catch(e) {}

		return;
	}

	// If tooltip has displayed, start hide timer
	this.timers.hide = delay.call(this,
		function() { this.toggle(FALSE, event); },
		this.options.hide.delay,
		this
	);
}

function inactiveMethod(event) {
	if(this.tooltip.hasClass(CLASS_DISABLED) || !this.options.hide.inactive) { return; }

	// Clear timer
	clearTimeout(this.timers.inactive);

	this.timers.inactive = delay.call(this,
		function(){ this.hide(event); },
		this.options.hide.inactive
	);
}

function repositionMethod(event) {
	if(this.rendered && this.tooltip[0].offsetWidth > 0) { this.reposition(event); }
}

// Store mouse coordinates
PROTOTYPE._storeMouse = function(event) {
	(this.mouse = $.event.fix(event)).type = 'mousemove';
	return this;
};

// Bind events
PROTOTYPE._bind = function(targets, events, method, suffix, context) {
	if(!targets || !method || !events.length) { return; }
	var ns = '.' + this._id + (suffix ? '-'+suffix : '');
	$(targets).bind(
		(events.split ? events : events.join(ns + ' ')) + ns,
		$.proxy(method, context || this)
	);
	return this;
};
PROTOTYPE._unbind = function(targets, suffix) {
	targets && $(targets).unbind('.' + this._id + (suffix ? '-'+suffix : ''));
	return this;
};

// Global delegation helper
function delegate(selector, events, method) {
	$(document.body).delegate(selector,
		(events.split ? events : events.join('.'+NAMESPACE + ' ')) + '.'+NAMESPACE,
		function() {
			var api = QTIP.api[ $.attr(this, ATTR_ID) ];
			api && !api.disabled && method.apply(api, arguments);
		}
	);
}
// Event trigger
PROTOTYPE._trigger = function(type, args, event) {
	var callback = $.Event('tooltip'+type);
	callback.originalEvent = (event && $.extend({}, event)) || this.cache.event || NULL;

	this.triggering = type;
	this.tooltip.trigger(callback, [this].concat(args || []));
	this.triggering = FALSE;

	return !callback.isDefaultPrevented();
};

PROTOTYPE._bindEvents = function(showEvents, hideEvents, showTargets, hideTargets, showMethod, hideMethod) {
	// Get tasrgets that lye within both
	var similarTargets = showTargets.filter( hideTargets ).add( hideTargets.filter(showTargets) ),
		toggleEvents = [];

	// If hide and show targets are the same...
	if(similarTargets.length) {

		// Filter identical show/hide events
		$.each(hideEvents, function(i, type) {
			var showIndex = $.inArray(type, showEvents);

			// Both events are identical, remove from both hide and show events
			// and append to toggleEvents
			showIndex > -1 && toggleEvents.push( showEvents.splice( showIndex, 1 )[0] );
		});

		// Toggle events are special case of identical show/hide events, which happen in sequence
		if(toggleEvents.length) {
			// Bind toggle events to the similar targets
			this._bind(similarTargets, toggleEvents, function(event) {
				var state = this.rendered ? this.tooltip[0].offsetWidth > 0 : false;
				(state ? hideMethod : showMethod).call(this, event);
			});

			// Remove the similar targets from the regular show/hide bindings
			showTargets = showTargets.not(similarTargets);
			hideTargets = hideTargets.not(similarTargets);
		}
	}

	// Apply show/hide/toggle events
	this._bind(showTargets, showEvents, showMethod);
	this._bind(hideTargets, hideEvents, hideMethod);
};

PROTOTYPE._assignInitialEvents = function(event) {
	var options = this.options,
		showTarget = options.show.target,
		hideTarget = options.hide.target,
		showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
		hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];

	// Catch remove/removeqtip events on target element to destroy redundant tooltips
	this._bind(this.elements.target, ['remove', 'removeqtip'], function(event) {
		this.destroy(true);
	}, 'destroy');

	/*
	 * Make sure hoverIntent functions properly by using mouseleave as a hide event if
	 * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
	 */
	if(/mouse(over|enter)/i.test(options.show.event) && !/mouse(out|leave)/i.test(options.hide.event)) {
		hideEvents.push('mouseleave');
	}

	/*
	 * Also make sure initial mouse targetting works correctly by caching mousemove coords
	 * on show targets before the tooltip has rendered. Also set onTarget when triggered to
	 * keep mouse tracking working.
	 */
	this._bind(showTarget, 'mousemove', function(event) {
		this._storeMouse(event);
		this.cache.onTarget = TRUE;
	});

	// Define hoverIntent function
	function hoverIntent(event) {
		// Only continue if tooltip isn't disabled
		if(this.disabled || this.destroyed) { return FALSE; }

		// Cache the event data
		this.cache.event = event && $.event.fix(event);
		this.cache.target = event && $(event.target);

		// Start the event sequence
		clearTimeout(this.timers.show);
		this.timers.show = delay.call(this,
			function() { this.render(typeof event === 'object' || options.show.ready); },
			options.prerender ? 0 : options.show.delay
		);
	}

	// Filter and bind events
	this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, hoverIntent, function() {
		if(!this.timers) { return FALSE; }
		clearTimeout(this.timers.show);
	});

	// Prerendering is enabled, create tooltip now
	if(options.show.ready || options.prerender) { hoverIntent.call(this, event); }
};

// Event assignment method
PROTOTYPE._assignEvents = function() {
	var self = this,
		options = this.options,
		posOptions = options.position,

		tooltip = this.tooltip,
		showTarget = options.show.target,
		hideTarget = options.hide.target,
		containerTarget = posOptions.container,
		viewportTarget = posOptions.viewport,
		documentTarget = $(document),
		bodyTarget = $(document.body),
		windowTarget = $(window),

		showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
		hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];


	// Assign passed event callbacks
	$.each(options.events, function(name, callback) {
		self._bind(tooltip, name === 'toggle' ? ['tooltipshow','tooltiphide'] : ['tooltip'+name], callback, null, tooltip);
	});

	// Hide tooltips when leaving current window/frame (but not select/option elements)
	if(/mouse(out|leave)/i.test(options.hide.event) && options.hide.leave === 'window') {
		this._bind(documentTarget, ['mouseout', 'blur'], function(event) {
			if(!/select|option/.test(event.target.nodeName) && !event.relatedTarget) {
				this.hide(event);
			}
		});
	}

	// Enable hide.fixed by adding appropriate class
	if(options.hide.fixed) {
		hideTarget = hideTarget.add( tooltip.addClass(CLASS_FIXED) );
	}

	/*
	 * Make sure hoverIntent functions properly by using mouseleave to clear show timer if
	 * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
	 */
	else if(/mouse(over|enter)/i.test(options.show.event)) {
		this._bind(hideTarget, 'mouseleave', function() {
			clearTimeout(this.timers.show);
		});
	}

	// Hide tooltip on document mousedown if unfocus events are enabled
	if(('' + options.hide.event).indexOf('unfocus') > -1) {
		this._bind(containerTarget.closest('html'), ['mousedown', 'touchstart'], function(event) {
			var elem = $(event.target),
				enabled = this.rendered && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0,
				isAncestor = elem.parents(SELECTOR).filter(this.tooltip[0]).length > 0;

			if(elem[0] !== this.target[0] && elem[0] !== this.tooltip[0] && !isAncestor &&
				!this.target.has(elem[0]).length && enabled
			) {
				this.hide(event);
			}
		});
	}

	// Check if the tooltip hides when inactive
	if('number' === typeof options.hide.inactive) {
		// Bind inactive method to show target(s) as a custom event
		this._bind(showTarget, 'qtip-'+this.id+'-inactive', inactiveMethod, 'inactive');

		// Define events which reset the 'inactive' event handler
		this._bind(hideTarget.add(tooltip), QTIP.inactiveEvents, inactiveMethod);
	}

	// Filter and bind events
	this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, showMethod, hideMethod);

	// Mouse movement bindings
	this._bind(showTarget.add(tooltip), 'mousemove', function(event) {
		// Check if the tooltip hides when mouse is moved a certain distance
		if('number' === typeof options.hide.distance) {
			var origin = this.cache.origin || {},
				limit = this.options.hide.distance,
				abs = Math.abs;

			// Check if the movement has gone beyond the limit, and hide it if so
			if(abs(event.pageX - origin.pageX) >= limit || abs(event.pageY - origin.pageY) >= limit) {
				this.hide(event);
			}
		}

		// Cache mousemove coords on show targets
		this._storeMouse(event);
	});

	// Mouse positioning events
	if(posOptions.target === 'mouse') {
		// If mouse adjustment is on...
		if(posOptions.adjust.mouse) {
			// Apply a mouseleave event so we don't get problems with overlapping
			if(options.hide.event) {
				// Track if we're on the target or not
				this._bind(showTarget, ['mouseenter', 'mouseleave'], function(event) {
					if(!this.cache) {return FALSE; }
					this.cache.onTarget = event.type === 'mouseenter';
				});
			}

			// Update tooltip position on mousemove
			this._bind(documentTarget, 'mousemove', function(event) {
				// Update the tooltip position only if the tooltip is visible and adjustment is enabled
				if(this.rendered && this.cache.onTarget && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0) {
					this.reposition(event);
				}
			});
		}
	}

	// Adjust positions of the tooltip on window resize if enabled
	if(posOptions.adjust.resize || viewportTarget.length) {
		this._bind( $.event.special.resize ? viewportTarget : windowTarget, 'resize', repositionMethod );
	}

	// Adjust tooltip position on scroll of the window or viewport element if present
	if(posOptions.adjust.scroll) {
		this._bind( windowTarget.add(posOptions.container), 'scroll', repositionMethod );
	}
};

// Un-assignment method
PROTOTYPE._unassignEvents = function() {
	var options = this.options,
		showTargets = options.show.target,
		hideTargets = options.hide.target,
		targets = $.grep([
			this.elements.target[0],
			this.rendered && this.tooltip[0],
			options.position.container[0],
			options.position.viewport[0],
			options.position.container.closest('html')[0], // unfocus
			window,
			document
		], function(i) {
			return typeof i === 'object';
		});

	// Add show and hide targets if they're valid
	if(showTargets && showTargets.toArray) {
		targets = targets.concat(showTargets.toArray());
	}
	if(hideTargets && hideTargets.toArray) {
		targets = targets.concat(hideTargets.toArray());
	}

	// Unbind the events
	this._unbind(targets)
		._unbind(targets, 'destroy')
		._unbind(targets, 'inactive');
};

// Apply common event handlers using delegate (avoids excessive .bind calls!)
$(function() {
	delegate(SELECTOR, ['mouseenter', 'mouseleave'], function(event) {
		var state = event.type === 'mouseenter',
			tooltip = $(event.currentTarget),
			target = $(event.relatedTarget || event.target),
			options = this.options;

		// On mouseenter...
		if(state) {
			// Focus the tooltip on mouseenter (z-index stacking)
			this.focus(event);

			// Clear hide timer on tooltip hover to prevent it from closing
			tooltip.hasClass(CLASS_FIXED) && !tooltip.hasClass(CLASS_DISABLED) && clearTimeout(this.timers.hide);
		}

		// On mouseleave...
		else {
			// When mouse tracking is enabled, hide when we leave the tooltip and not onto the show target (if a hide event is set)
			if(options.position.target === 'mouse' && options.position.adjust.mouse &&
				options.hide.event && options.show.target && !target.closest(options.show.target[0]).length) {
				this.hide(event);
			}
		}

		// Add hover class
		tooltip.toggleClass(CLASS_HOVER, state);
	});

	// Define events which reset the 'inactive' event handler
	delegate('['+ATTR_ID+']', INACTIVE_EVENTS, inactiveMethod);
});
;// Initialization method
function init(elem, id, opts) {
	var obj, posOptions, attr, config, title,

	// Setup element references
	docBody = $(document.body),

	// Use document body instead of document element if needed
	newTarget = elem[0] === document ? docBody : elem,

	// Grab metadata from element if plugin is present
	metadata = (elem.metadata) ? elem.metadata(opts.metadata) : NULL,

	// If metadata type if HTML5, grab 'name' from the object instead, or use the regular data object otherwise
	metadata5 = opts.metadata.type === 'html5' && metadata ? metadata[opts.metadata.name] : NULL,

	// Grab data from metadata.name (or data-qtipopts as fallback) using .data() method,
	html5 = elem.data(opts.metadata.name || 'qtipopts');

	// If we don't get an object returned attempt to parse it manualyl without parseJSON
	try { html5 = typeof html5 === 'string' ? $.parseJSON(html5) : html5; } catch(e) {}

	// Merge in and sanitize metadata
	config = $.extend(TRUE, {}, QTIP.defaults, opts,
		typeof html5 === 'object' ? sanitizeOptions(html5) : NULL,
		sanitizeOptions(metadata5 || metadata));

	// Re-grab our positioning options now we've merged our metadata and set id to passed value
	posOptions = config.position;
	config.id = id;

	// Setup missing content if none is detected
	if('boolean' === typeof config.content.text) {
		attr = elem.attr(config.content.attr);

		// Grab from supplied attribute if available
		if(config.content.attr !== FALSE && attr) { config.content.text = attr; }

		// No valid content was found, abort render
		else { return FALSE; }
	}

	// Setup target options
	if(!posOptions.container.length) { posOptions.container = docBody; }
	if(posOptions.target === FALSE) { posOptions.target = newTarget; }
	if(config.show.target === FALSE) { config.show.target = newTarget; }
	if(config.show.solo === TRUE) { config.show.solo = posOptions.container.closest('body'); }
	if(config.hide.target === FALSE) { config.hide.target = newTarget; }
	if(config.position.viewport === TRUE) { config.position.viewport = posOptions.container; }

	// Ensure we only use a single container
	posOptions.container = posOptions.container.eq(0);

	// Convert position corner values into x and y strings
	posOptions.at = new CORNER(posOptions.at, TRUE);
	posOptions.my = new CORNER(posOptions.my);

	// Destroy previous tooltip if overwrite is enabled, or skip element if not
	if(elem.data(NAMESPACE)) {
		if(config.overwrite) {
			elem.qtip('destroy', true);
		}
		else if(config.overwrite === FALSE) {
			return FALSE;
		}
	}

	// Add has-qtip attribute
	elem.attr(ATTR_HAS, id);

	// Remove title attribute and store it if present
	if(config.suppress && (title = elem.attr('title'))) {
		// Final attr call fixes event delegatiom and IE default tooltip showing problem
		elem.removeAttr('title').attr(oldtitle, title).attr('title', '');
	}

	// Initialize the tooltip and add API reference
	obj = new QTip(elem, config, id, !!attr);
	elem.data(NAMESPACE, obj);

	return obj;
}

// jQuery $.fn extension method
QTIP = $.fn.qtip = function(options, notation, newValue)
{
	var command = ('' + options).toLowerCase(), // Parse command
		returned = NULL,
		args = $.makeArray(arguments).slice(1),
		event = args[args.length - 1],
		opts = this[0] ? $.data(this[0], NAMESPACE) : NULL;

	// Check for API request
	if((!arguments.length && opts) || command === 'api') {
		return opts;
	}

	// Execute API command if present
	else if('string' === typeof options) {
		this.each(function() {
			var api = $.data(this, NAMESPACE);
			if(!api) { return TRUE; }

			// Cache the event if possible
			if(event && event.timeStamp) { api.cache.event = event; }

			// Check for specific API commands
			if(notation && (command === 'option' || command === 'options')) {
				if(newValue !== undefined || $.isPlainObject(notation)) {
					api.set(notation, newValue);
				}
				else {
					returned = api.get(notation);
					return FALSE;
				}
			}

			// Execute API command
			else if(api[command]) {
				api[command].apply(api, args);
			}
		});

		return returned !== NULL ? returned : this;
	}

	// No API commands. validate provided options and setup qTips
	else if('object' === typeof options || !arguments.length) {
		// Sanitize options first
		opts = sanitizeOptions($.extend(TRUE, {}, options));

		return this.each(function(i) {
			var api, id;

			// Find next available ID, or use custom ID if provided
			id = $.isArray(opts.id) ? opts.id[i] : opts.id;
			id = !id || id === FALSE || id.length < 1 || QTIP.api[id] ? QTIP.nextid++ : id;

			// Initialize the qTip and re-grab newly sanitized options
			api = init($(this), id, opts);
			if(api === FALSE) { return TRUE; }
			else { QTIP.api[id] = api; }

			// Initialize plugins
			$.each(PLUGINS, function() {
				if(this.initialize === 'initialize') { this(api); }
			});

			// Assign initial pre-render events
			api._assignInitialEvents(event);
		});
	}
};

// Expose class
$.qtip = QTip;

// Populated in render method
QTIP.api = {};
;$.each({
	/* Allow other plugins to successfully retrieve the title of an element with a qTip applied */
	attr: function(attr, val) {
		if(this.length) {
			var self = this[0],
				title = 'title',
				api = $.data(self, 'qtip');

			if(attr === title && api && 'object' === typeof api && api.options.suppress) {
				if(arguments.length < 2) {
					return $.attr(self, oldtitle);
				}

				// If qTip is rendered and title was originally used as content, update it
				if(api && api.options.content.attr === title && api.cache.attr) {
					api.set('content.text', val);
				}

				// Use the regular attr method to set, then cache the result
				return this.attr(oldtitle, val);
			}
		}

		return $.fn['attr'+replaceSuffix].apply(this, arguments);
	},

	/* Allow clone to correctly retrieve cached title attributes */
	clone: function(keepData) {
		var titles = $([]), title = 'title',

		// Clone our element using the real clone method
		elems = $.fn['clone'+replaceSuffix].apply(this, arguments);

		// Grab all elements with an oldtitle set, and change it to regular title attribute, if keepData is false
		if(!keepData) {
			elems.filter('['+oldtitle+']').attr('title', function() {
				return $.attr(this, oldtitle);
			})
			.removeAttr(oldtitle);
		}

		return elems;
	}
}, function(name, func) {
	if(!func || $.fn[name+replaceSuffix]) { return TRUE; }

	var old = $.fn[name+replaceSuffix] = $.fn[name];
	$.fn[name] = function() {
		return func.apply(this, arguments) || old.apply(this, arguments);
	};
});

/* Fire off 'removeqtip' handler in $.cleanData if jQuery UI not present (it already does similar).
 * This snippet is taken directly from jQuery UI source code found here:
 *     http://code.jquery.com/ui/jquery-ui-git.js
 */
if(!$.ui) {
	$['cleanData'+replaceSuffix] = $.cleanData;
	$.cleanData = function( elems ) {
		for(var i = 0, elem; (elem = $( elems[i] )).length; i++) {
			if(elem.attr(ATTR_HAS)) {
				try { elem.triggerHandler('removeqtip'); }
				catch( e ) {}
			}
		}
		$['cleanData'+replaceSuffix].apply(this, arguments);
	};
}
;// qTip version
QTIP.version = '2.2.1';

// Base ID for all qTips
QTIP.nextid = 0;

// Inactive events array
QTIP.inactiveEvents = INACTIVE_EVENTS;

// Base z-index for all qTips
QTIP.zindex = 15000;

// Define configuration defaults
QTIP.defaults = {
	prerender: FALSE,
	id: FALSE,
	overwrite: TRUE,
	suppress: TRUE,
	content: {
		text: TRUE,
		attr: 'title',
		title: FALSE,
		button: FALSE
	},
	position: {
		my: 'top left',
		at: 'bottom right',
		target: FALSE,
		container: FALSE,
		viewport: FALSE,
		adjust: {
			x: 0, y: 0,
			mouse: TRUE,
			scroll: TRUE,
			resize: TRUE,
			method: 'flipinvert flipinvert'
		},
		effect: function(api, pos, viewport) {
			$(this).animate(pos, {
				duration: 200,
				queue: FALSE
			});
		}
	},
	show: {
		target: FALSE,
		event: 'mouseenter',
		effect: TRUE,
		delay: 90,
		solo: FALSE,
		ready: FALSE,
		autofocus: FALSE
	},
	hide: {
		target: FALSE,
		event: 'mouseleave',
		effect: TRUE,
		delay: 0,
		fixed: FALSE,
		inactive: FALSE,
		leave: 'window',
		distance: FALSE
	},
	style: {
		classes: '',
		widget: FALSE,
		width: FALSE,
		height: FALSE,
		def: TRUE
	},
	events: {
		render: NULL,
		move: NULL,
		show: NULL,
		hide: NULL,
		toggle: NULL,
		visible: NULL,
		hidden: NULL,
		focus: NULL,
		blur: NULL
	}
};
;}));
}( window, document ));
// ----END: extensions/buttonTooltip_ExtensionPackage/ui/buttonTooltip/include/qtip/jquery.qtip.js

// ----BEGIN: extensions/buttonTooltip_ExtensionPackage/ui/buttonTooltip/include/qtip/imagesloaded.pkg.min.js
/* qTip2 v2.2.1 | Plugins: None | Styles: core basic css3 | qtip2.com | Licensed MIT | Sat Sep 06 2014 18:06:49 */
/*!
 * EventEmitter v4.2.6 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */
(function(){"use strict";function a(){}function b(a,b){for(var c=a.length;c--;)if(a[c].listener===b)return c;return-1}function c(a){return function(){return this[a].apply(this,arguments)}}var d=a.prototype,e=this,f=e.EventEmitter;d.getListeners=function(a){var b,c,d=this._getEvents();if("object"==typeof a){b={};for(c in d)d.hasOwnProperty(c)&&a.test(c)&&(b[c]=d[c])}else b=d[a]||(d[a]=[]);return b},d.flattenListeners=function(a){var b,c=[];for(b=0;b<a.length;b+=1)c.push(a[b].listener);return c},d.getListenersAsObject=function(a){var b,c=this.getListeners(a);return c instanceof Array&&(b={},b[a]=c),b||c},d.addListener=function(a,c){var d,e=this.getListenersAsObject(a),f="object"==typeof c;for(d in e)e.hasOwnProperty(d)&&-1===b(e[d],c)&&e[d].push(f?c:{listener:c,once:!1});return this},d.on=c("addListener"),d.addOnceListener=function(a,b){return this.addListener(a,{listener:b,once:!0})},d.once=c("addOnceListener"),d.defineEvent=function(a){return this.getListeners(a),this},d.defineEvents=function(a){for(var b=0;b<a.length;b+=1)this.defineEvent(a[b]);return this},d.removeListener=function(a,c){var d,e,f=this.getListenersAsObject(a);for(e in f)f.hasOwnProperty(e)&&(d=b(f[e],c),-1!==d&&f[e].splice(d,1));return this},d.off=c("removeListener"),d.addListeners=function(a,b){return this.manipulateListeners(!1,a,b)},d.removeListeners=function(a,b){return this.manipulateListeners(!0,a,b)},d.manipulateListeners=function(a,b,c){var d,e,f=a?this.removeListener:this.addListener,g=a?this.removeListeners:this.addListeners;if("object"!=typeof b||b instanceof RegExp)for(d=c.length;d--;)f.call(this,b,c[d]);else for(d in b)b.hasOwnProperty(d)&&(e=b[d])&&("function"==typeof e?f.call(this,d,e):g.call(this,d,e));return this},d.removeEvent=function(a){var b,c=typeof a,d=this._getEvents();if("string"===c)delete d[a];else if("object"===c)for(b in d)d.hasOwnProperty(b)&&a.test(b)&&delete d[b];else delete this._events;return this},d.removeAllListeners=c("removeEvent"),d.emitEvent=function(a,b){var c,d,e,f,g=this.getListenersAsObject(a);for(e in g)if(g.hasOwnProperty(e))for(d=g[e].length;d--;)c=g[e][d],c.once===!0&&this.removeListener(a,c.listener),f=c.listener.apply(this,b||[]),f===this._getOnceReturnValue()&&this.removeListener(a,c.listener);return this},d.trigger=c("emitEvent"),d.emit=function(a){var b=Array.prototype.slice.call(arguments,1);return this.emitEvent(a,b)},d.setOnceReturnValue=function(a){return this._onceReturnValue=a,this},d._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},d._getEvents=function(){return this._events||(this._events={})},a.noConflict=function(){return e.EventEmitter=f,a},"function"==typeof define&&define.amd?define('imagesloaded',function(){return a}):"object"==typeof module&&module.exports?module.exports=a:this.EventEmitter=a}).call(this),/*!
 * eventie v1.0.3
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 */
function(a){"use strict";var b=document.documentElement,c=function(){};b.addEventListener?c=function(a,b,c){a.addEventListener(b,c,!1)}:b.attachEvent&&(c=function(b,c,d){b[c+d]=d.handleEvent?function(){var b=a.event;b.target=b.target||b.srcElement,d.handleEvent.call(d,b)}:function(){var c=a.event;c.target=c.target||c.srcElement,d.call(b,c)},b.attachEvent("on"+c,b[c+d])});var d=function(){};b.removeEventListener?d=function(a,b,c){a.removeEventListener(b,c,!1)}:b.detachEvent&&(d=function(a,b,c){a.detachEvent("on"+b,a[b+c]);try{delete a[b+c]}catch(d){a[b+c]=void 0}});var e={bind:c,unbind:d};"function"==typeof define&&define.amd?define('ilBinding',e):a.eventie=e}(this),/*!
 * imagesLoaded v3.0.2
 * JavaScript is all like "You images are done yet or what?"
 */
function(a){"use strict";function b(a,b){for(var c in b)a[c]=b[c];return a}function c(a){return"[object Array]"===i.call(a)}function d(a){var b=[];if(c(a))b=a;else if("number"==typeof a.length)for(var d=0,e=a.length;e>d;d++)b.push(a[d]);else b.push(a);return b}function e(a,c){function e(a,c,g){if(!(this instanceof e))return new e(a,c);"string"==typeof a&&(a=document.querySelectorAll(a)),this.elements=d(a),this.options=b({},this.options),"function"==typeof c?g=c:b(this.options,c),g&&this.on("always",g),this.getImages(),f&&(this.jqDeferred=new f.Deferred);var h=this;setTimeout(function(){h.check()})}function i(a){this.img=a}e.prototype=new a,e.prototype.options={},e.prototype.getImages=function(){this.images=[];for(var a=0,b=this.elements.length;b>a;a++){var c=this.elements[a];"IMG"===c.nodeName&&this.addImage(c);for(var d=c.querySelectorAll("img"),e=0,f=d.length;f>e;e++){var g=d[e];this.addImage(g)}}},e.prototype.addImage=function(a){var b=new i(a);this.images.push(b)},e.prototype.check=function(){function a(a,e){return b.options.debug&&h&&g.log("confirm",a,e),b.progress(a),c++,c===d&&b.complete(),!0}var b=this,c=0,d=this.images.length;if(this.hasAnyBroken=!1,!d)return void this.complete();for(var e=0;d>e;e++){var f=this.images[e];f.on("confirm",a),f.check()}},e.prototype.progress=function(a){this.hasAnyBroken=this.hasAnyBroken||!a.isLoaded,this.emit("progress",this,a),this.jqDeferred&&this.jqDeferred.notify(this,a)},e.prototype.complete=function(){var a=this.hasAnyBroken?"fail":"done";if(this.isComplete=!0,this.emit(a,this),this.emit("always",this),this.jqDeferred){var b=this.hasAnyBroken?"reject":"resolve";this.jqDeferred[b](this)}},f&&(f.fn.imagesLoaded=function(a,b){var c=new e(this,a,b);return c.jqDeferred.promise(f(this))});var j={};return i.prototype=new a,i.prototype.check=function(){var a=j[this.img.src];if(a)return void this.useCached(a);if(j[this.img.src]=this,this.img.complete&&void 0!==this.img.naturalWidth)return void this.confirm(0!==this.img.naturalWidth,"naturalWidth");var b=this.proxyImage=new Image;c.bind(b,"load",this),c.bind(b,"error",this),b.src=this.img.src},i.prototype.useCached=function(a){if(a.isConfirmed)this.confirm(a.isLoaded,"cached was confirmed");else{var b=this;a.on("confirm",function(a){return b.confirm(a.isLoaded,"cache emitted confirmed"),!0})}},i.prototype.confirm=function(a,b){this.isConfirmed=!0,this.isLoaded=a,this.emit("confirm",this,b)},i.prototype.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},i.prototype.onload=function(){this.confirm(!0,"onload"),this.unbindProxyEvents()},i.prototype.onerror=function(){this.confirm(!1,"onerror"),this.unbindProxyEvents()},i.prototype.unbindProxyEvents=function(){c.unbind(this.proxyImage,"load",this),c.unbind(this.proxyImage,"error",this)},e}var f=a.jQuery,g=a.console,h="undefined"!=typeof g,i=Object.prototype.toString;"function"==typeof define&&define.amd?define("eventEmitter",["eventie"],e):a.imagesLoaded=e(a.EventEmitter,a.eventie)}(window);
//# sourceMappingURL=//cdn.jsdelivr.net/qtip2/2.2.1//var/www/qtip2/build/tmp/tmp-6564v9oi9i8/imagesloaded.pkg.min.map
// ----END: extensions/buttonTooltip_ExtensionPackage/ui/buttonTooltip/include/qtip/imagesloaded.pkg.min.js

// ----BEGIN: extensions/buttonTooltip_ExtensionPackage/ui/buttonTooltip/TW.RSM.SFW.button.runtime.js
/*global Encoder,TW */

(function () {
    var addedDefaultButtonStyles = false;

    function setToolTips(widget) {
        var tooltipPosition = widget.getProperty('ToolTipPosition').split(",");
        var toolTipDuration = widget.getProperty('ToolTipDuration') * 1000;
        $("#"+widget.jqElementId).qtip({
            style: {
                classes: widget.getProperty('ToolTipStyles'),
                def: false
            },
            position: {
                my: tooltipPosition[0],
                at: tooltipPosition[1]
            },
            show: {
                solo: true
            },
            hide: {
                event: "click mouseleave",
                inactive: toolTipDuration
            }
        });
    }

    TW.Runtime.Widgets.buttonTooltip = function () {
        var thisWidget = this;
        var roundedCorners = true;

        this.runtimeProperties = function () {
            return {
                'needsDataLoadingAndError': false,
                'propertyAttributes': {
                    'Label': {
                        'isLocalizable': true
                    },
                    'ToolTip': {
                        'isLocalizable': true
                    },
                    'ConfirmationTitle': {
                        'isLocalizable': true
                    },
                    'ConfirmationPrompt': {
                        'isLocalizable': true
                    },
                    'ConfirmationButton1Label': {
                        'isLocalizable': true
                    },
                    'ConfirmationButton2Label': {
                        'isLocalizable': true
                    }
                }

            };
        };

        this.renderHtml = function () {
            var formatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('Style', 'DefaultButtonStyle'));
            var formatResult2 = TW.getStyleFromStyleDefinition(thisWidget.getProperty('HoverStyle', 'DefaultButtonHoverStyle'));
            var formatResult3 = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ActiveStyle', 'DefaultButtonActiveStyle'));
            var textSizeClass = 'textsize-normal';
            if (this.getProperty('Style') !== undefined) {
                textSizeClass = TW.getTextSizeClassName(formatResult.textSize);
            }

            // The Disabled property is used for programmatic control of the button state. There is
            // also a class, widget-button-disabled, which is used internally to debounce button
            // click events.
            var buttonState = thisWidget.getProperty('Disabled', false) ? ' disabled' : '';

            var html =
                '<div class="widget-content widget-button" title="'
                + (this.getProperty('ToolTip') === undefined ? 'Button' : Encoder.htmlEncode(this.getProperty('ToolTip'))) + '">'
                + '<button class="button-element ' + textSizeClass + '" tabindex="' + thisWidget.getProperty('TabSequence') + '"' + buttonState + '>'
                + '<span class="widget-button-icon">'
                + ((formatResult.image !== undefined && formatResult.image.length > 0) ?
                '<img class="default" src="' + formatResult.image + '"/>' : '')
                + ((formatResult2.image !== undefined && formatResult2.image.length > 0) ?
                '<img class="hover" src="' + formatResult2.image + '"/>' : '')
                + ((formatResult3.image !== undefined && formatResult3.image.length > 0) ?
                '<img class="active" src="' + formatResult3.image + '"/>' : '')
                + '</span>'
                + '<span class="widget-button-text">' + (thisWidget.getProperty('Label') === undefined ? 'Button' :
                Encoder.htmlEncode(thisWidget.getProperty('Label'))) + '</span>'
                + '</button>'
                + '</div>';
            return html;
        };

        this.afterRender = function () {
            var formatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('Style', 'DefaultButtonStyle'));
            var buttonHoverStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('HoverStyle', 'DefaultButtonHoverStyle'));
            var buttonActiveStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ActiveStyle', 'DefaultButtonActiveStyle'));
            var buttonFocusStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('FocusStyle', 'DefaultButtonFocusStyle'));
            var buttonDisabledStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('DisabledStyle', 'DefaultButtonDisabledStyle'));

            var cssInfo = TW.getStyleCssTextualNoBackgroundFromStyle(formatResult);
            var cssButtonBackground = TW.getStyleCssGradientFromStyle(formatResult);
            var cssButtonBorder = TW.getStyleCssBorderFromStyle(formatResult);

            var cssButtonHoverText = TW.getStyleCssTextualNoBackgroundFromStyle(buttonHoverStyle);
            var cssButtonHoverBackground = TW.getStyleCssGradientFromStyle(buttonHoverStyle);
            var cssButtonHoverBorder = TW.getStyleCssBorderFromStyle(buttonHoverStyle);

            var cssButtonActiveText = TW.getStyleCssTextualNoBackgroundFromStyle(buttonActiveStyle);
            var cssButtonActiveBackground = TW.getStyleCssGradientFromStyle(buttonActiveStyle);
            var cssButtonActiveBorder = TW.getStyleCssBorderFromStyle(buttonActiveStyle);

            var cssButtonFocusBorder = TW.getStyleCssBorderFromStyle(buttonFocusStyle);

            var cssButtonDisabledText = TW.getStyleCssTextualNoBackgroundFromStyle(buttonDisabledStyle);
            var cssButtonDisabledBackground = TW.getStyleCssGradientFromStyle(buttonDisabledStyle);
            var cssButtonDisabledBorder = TW.getStyleCssBorderFromStyle(buttonDisabledStyle);

            roundedCorners = this.getProperty('RoundedCorners');
            if (roundedCorners === undefined) {
                roundedCorners = true;
            }

            if (roundedCorners === true) {
                thisWidget.jqElement.addClass('roundedCorners');
            }

            if (formatResult.image.length > 0) {
                thisWidget.jqElement.addClass('hasImage');
            }

            if (buttonHoverStyle.image.length === 0) {
                thisWidget.jqElement.addClass('singleImageOnly');
            }

            if (thisWidget.getProperty('Style', 'DefaultButtonStyle') === 'DefaultButtonStyle'
                && thisWidget.getProperty('HoverStyle', 'DefaultButtonHoverStyle') === 'DefaultButtonHoverStyle'
                && thisWidget.getProperty('ActiveStyle', 'DefaultButtonActiveStyle') === 'DefaultButtonActiveStyle'
                && thisWidget.getProperty('FocusStyle', 'DefaultButtonFocusStyle') === 'DefaultButtonFocusStyle'
                && thisWidget.getProperty('DisabledStyle', 'DefaultButtonDisabledStyle') === 'DefaultButtonDisabledStyle') {
                if (!addedDefaultButtonStyles) {
                    addedDefaultButtonStyles = true;
                    var defaultStyles = '.widget-button .button-element { ' + cssButtonBackground + cssButtonBorder + ' }' +
                        ' .widget-button .button-element span { ' + cssInfo + ' } ' +
                        ' .widget-button .button-element:hover { ' + cssButtonHoverBackground + cssButtonHoverBorder + ' }' +
                        ' .widget-button .button-element:hover span { ' + cssButtonHoverText + ' } ' +
                        ' .widget-button .button-element:active { ' + cssButtonActiveBackground + cssButtonActiveBorder + ' }' +
                        ' .widget-button .button-element:active span { ' + cssButtonActiveText + ' } ' +
                        ' .widget-button .button-element:disabled {' + cssButtonDisabledBackground + cssButtonDisabledBorder + '}' +
                        ' .widget-button .button-element:disabled span {' + cssButtonDisabledText + '}' +
                        ' .widget-button.focus .button-element { ' + cssButtonFocusBorder + ' }';
                    $.rule(defaultStyles).appendTo(TW.Runtime.globalWidgetStyleEl);
                }
            }
            else {
                var styleBlock;

                styleBlock = '<style>' +
                    '#' + thisWidget.jqElementId + ' .button-element { ' + cssButtonBackground + cssButtonBorder + ' } ' +
                    '#' + thisWidget.jqElementId + ' .button-element:hover { ' + cssButtonHoverBackground + cssButtonHoverBorder + ' } ' +
                    '#' + thisWidget.jqElementId + ' .button-element:active { ' + cssButtonActiveBackground + cssButtonActiveBorder + ' }' +
                    '#' + thisWidget.jqElementId + ' .button-element:disabled {' + cssButtonDisabledBackground + cssButtonDisabledBorder + '}' +
                    '#' + thisWidget.jqElementId + ' .button-element span { ' + cssInfo + ' } ' +
                    '#' + thisWidget.jqElementId + ' .button-element:hover span { ' + cssButtonHoverText + ' } ' +
                    '#' + thisWidget.jqElementId + ' .button-element:active span { ' + cssButtonActiveText + ' } ' +
                    '#' + thisWidget.jqElementId + ' .button-element:disabled span {' + cssButtonDisabledText + '}' +
                    '#' + thisWidget.jqElementId + '.focus .button-element { ' + cssButtonFocusBorder + ' }' +
                    '</style>';

                $(styleBlock).prependTo(thisWidget.jqElement);
            }

            var iconAlignment = this.getProperty('IconAlignment');
            var iconElement = thisWidget.jqElement.find('.widget-button-icon');
            var buttonText = thisWidget.jqElement.find('.widget-button-text');

            if (buttonText.html().length === 0) {
                thisWidget.jqElement.addClass('iconOnly'); // don't pad for text
            }
            else {
                if (iconAlignment === 'right') {
                    $(iconElement).insertAfter(buttonText);
                    thisWidget.jqElement.addClass('iconRight');
                }
            }

            var widgetProperties = thisWidget.properties;

            var widgetSelector = '#' + thisWidget.jqElementId + ' .button-element';
            var widgetContainer = '#' + thisWidget.jqElementId;

            $(widgetSelector).on('focus', function () {
                $(widgetContainer).addClass('focus');
            });

            $(widgetSelector).on('blur', function (e) {
                $(widgetContainer).removeClass('focus');

            });

            thisWidget.jqElement.bind('click', function (e) {
                // ignore clicks if button is disabled

                var isDisabled = widgetProperties.Disabled ||
                    thisWidget.jqElement.hasClass('widget-button-disabled');

                if (!isDisabled) {
                    //TW.log.info('button enabled');
                    if (widgetProperties['ConfirmationRequired']) {
                        var label1 = Encoder.htmlEncode(thisWidget.getProperty('ConfirmationButton1Label'));
                        var label2 = Encoder.htmlEncode(thisWidget.getProperty('ConfirmationButton2Label'));

                        var button1default = widgetProperties['DefaultConfirmationButton'] === 'button1';
                        var button1cancel = widgetProperties['CancelConfirmationButton'] === 'button1';

                        var buttons = {};

                        buttons[label1] = {
                            'class': 'blue',
                            'action': function () {
                                if (!button1cancel) {
                                    thisWidget.jqElement.triggerHandler('Clicked');
                                }
                            },
                            'default': button1default
                        };

                        buttons[label2] = {
                            'class': 'gray',
                            'action': function () {
                                if (button1cancel) {
                                    thisWidget.jqElement.triggerHandler('Clicked');
                                }
                            },
                            'default': !button1default
                        };

                        $.confirm({
                            'title': Encoder.htmlEncode(thisWidget.getProperty('ConfirmationTitle')),
                            'message': Encoder.htmlEncode(thisWidget.getProperty('ConfirmationPrompt')),
                            'buttons': buttons
                        });
                    }
                    else {
                        thisWidget.jqElement.triggerHandler('Clicked');
                    }
                }
                else {
                    //TW.log.info('button disabled');
                }
                e.preventDefault();
            });

            window.setTimeout(setToolTips(thisWidget), 1000);
        };

        this.beforeDestroy = function () {
            thisWidget = this;
            try {
                $("#" + thisWidget.jqElementId).qtip('destroy');
                thisWidget.jqElement.unbind();
            }
            catch (err) {
                TW.log.error('Error in TW.Runtime.Widgets.buttonTooltip.beforeDestroy', err);
            }
        };

        this.updateProperty = function (updatePropertyInfo) {
            var widgetElement = this.jqElement;
            var widgetReference = this;
            
            if (updatePropertyInfo.TargetProperty === 'Disabled') {
                widgetElement.find('button').prop('disabled', updatePropertyInfo.RawSinglePropertyValue);
                widgetReference.setProperty('Disabled', updatePropertyInfo.RawSinglePropertyValue);
            } else if (updatePropertyInfo.TargetProperty === 'ToolTip') {
                widgetElement.qtip('destroy');
                widgetReference.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                widgetElement.attr("title", widgetReference.getProperty('ToolTip'));
                window.setTimeout(setToolTips(widgetReference), 500);
            } else if (updatePropertyInfo.TargetProperty === 'Label') {
                widgetReference.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                widgetElement.find(".widget-button-text").html(widgetReference.getProperty('Label'));
            }
        };
    };
}());
// ----END: extensions/buttonTooltip_ExtensionPackage/ui/buttonTooltip/TW.RSM.SFW.button.runtime.js

// ----BEGIN: extensions/infotableselector_ExtensionPackage/ui/infotableselector/infotableselector.runtime.js
(function () {
    var addedDefaultStyles = false;

    TW.Runtime.Widgets.infotableselector = function () {
        var thisWidget = this;
        var currentSelectedRowNumber = undefined;
        var numRows = 0;

        this.runtimeProperties = function () {
            return {
                'needsDataLoadingAndError': false
            };
        };

        this.renderHtml = function () {
            var html = '<div class="widget-content widget-infotableselector"></div>';
            return html;
        };

        this.afterRender = function () {
            thisWidget.setProperty('NoRowsSelected',true);
            thisWidget.setProperty('AnyRowsSelected',false);
        };

        this.handleSelectionUpdate = function (propertyName, selectedRows, selectedRowIndices) {
            if (propertyName == "Data") {
                var nSelectedRows = selectedRows.length;
                if(nSelectedRows > 0) {
                    currentSelectedRowNumber = selectedRowIndices[0];
                    thisWidget.setProperty('NoRowsSelected',false);
                    thisWidget.setProperty('AnyRowsSelected',true);
                } else {
                    currentSelectedRowNumber = undefined;
                    thisWidget.setProperty('NoRowsSelected',true);
                    thisWidget.setProperty('AnyRowsSelected',false);
                }
                thisWidget.setProperty('SelectRowNumber', currentSelectedRowNumber);
                var selectIndexRows = [];
                for (var i = 0; i < selectedRowIndices.length; i++) {
                    selectIndexRows.push({
                        SelectRowNumber: selectedRowIndices[i]
                    });
                }
                thisWidget.setProperty('MultiSelectRowNumbers', {
                    rows: selectIndexRows,
                    dataShape: {
                        fieldDefinitions: {
                            SelectRowNumber: {
                                name: "SelectRowNumber",
                                baseType: "INTEGER"
                            }
                        }
                    }
                });
            }
        };

        this.serviceInvoked = function (serviceName) {
            switch( serviceName ) {
                case 'ClearSelectedRows':
                    thisWidget.updateSelection('Data', []);
                    currentSelectedRowNumber = undefined;
                    thisWidget.setProperty('NoRowsSelected',true);
                    thisWidget.setProperty('AnyRowsSelected',false);
                    break;
                case 'SelectFirstRow':
                    if( numRows > 0 ) {
                        currentSelectedRowNumber = 0;
                        thisWidget.setProperty('NoRowsSelected',false);
                        thisWidget.setProperty('AnyRowsSelected',true);
                        thisWidget.updateSelection('Data', [0]);
                    }
                    break;
                case 'SelectNextRow':
                    if( numRows > 0 ) {
                        if( currentSelectedRowNumber < (numRows-1) ) {
                            currentSelectedRowNumber += 1;
                            thisWidget.updateSelection('Data', [currentSelectedRowNumber]);
                        }
                    }
                    break;
                case 'SelectPreviousRow':
                    if( numRows > 0 ) {
                        if( currentSelectedRowNumber > 0 ) {
                            currentSelectedRowNumber -= 1;
                            thisWidget.updateSelection('Data', [currentSelectedRowNumber]);
                        }
                    }
                    break;
                default:
                    TW.log.error('inftoableselector widget, unexpected serviceName invoked "' + serviceName + '"');
            }
        };

        this.updateProperty = function (updatePropertyInfo) {
            if (updatePropertyInfo.TargetProperty === "Data") {
                thisWidget.lastData = updatePropertyInfo;

                var rows = updatePropertyInfo.ActualDataRows;
                numRows = rows.length;

                var selectedRowIndices = updatePropertyInfo.SelectedRowIndices;

                if (selectedRowIndices !== undefined) {
                    if(selectedRowIndices.length > 0) {
                        currentSelectedRowNumber = selectedRowIndices[0];
                        thisWidget.setProperty('NoRowsSelected',false);
                        thisWidget.setProperty('AnyRowsSelected',true);
                    } else {
                        thisWidget.setProperty('NoRowsSelected',true);
                        thisWidget.setProperty('AnyRowsSelected',false);
                    }
                } else {
                    thisWidget.setProperty('NoRowsSelected',true);
                    thisWidget.setProperty('AnyRowsSelected',false);
                }

            } else if (updatePropertyInfo.TargetProperty === "SelectRowNumber") {
                thisWidget.lastData = updatePropertyInfo;
                var rowNumber = parseInt(updatePropertyInfo.SinglePropertyValue);
                if (( numRows > rowNumber ) && (rowNumber >= 0)) {
                    currentSelectedRowNumber = rowNumber;
                    thisWidget.setProperty('NoRowsSelected',false);
                    thisWidget.setProperty('AnyRowsSelected',true);
                    thisWidget.updateSelection('Data', [rowNumber]);
                }
            } else if (updatePropertyInfo.TargetProperty === "MultiSelectRowNumbers") {
                thisWidget.lastData = updatePropertyInfo;
                var dataShape = updatePropertyInfo.DataShape;
                var SelectRowNumberField = thisWidget.getProperty('SelectRowNumberField');
                if (!SelectRowNumberField || !dataShape[SelectRowNumberField] ||
                    (dataShape[SelectRowNumberField].baseType !== 'INTEGER' && dataShape[SelectRowNumberField].baseType !== 'NUMBER')) {
                    SelectRowNumberField = null;
                    // Fall back to any field of INTEGER baseType
                    for (var field in dataShape) {
                        if (dataShape.hasOwnProperty(field) && dataShape[field].baseType === 'INTEGER') {
                            SelectRowNumberField = field;
                            break;
                        }
                    }
                    if (SelectRowNumberField === null) {
                        // Fall back to any field of NUMBER base type otherwise
                        for (var field in dataShape) {
                            if (dataShape.hasOwnProperty(field) && dataShape[field].baseType === 'NUMBER') {
                                SelectRowNumberField = field;
                                break;
                            }
                        }
                    }
                }
                if (SelectRowNumberField) {
                    var rowNumbers = [];
                    for (var i = 0; i < updatePropertyInfo.ActualDataRows.length; i++) {
                        var indexObj = updatePropertyInfo.ActualDataRows[i];
                        var index = indexObj[SelectRowNumberField];
                        if (index === parseInt(index, 10) && index >= 0) { // index is a non-negative integer.
                            rowNumbers.push(index);
                        }
                    }
                    if ( rowNumbers.length > 0 ) {
                        currentSelectedRowNumber = rowNumbers[0];
                        thisWidget.setProperty('NoRowsSelected',false);
                        thisWidget.setProperty('AnyRowsSelected',true);
                    } else {
                        thisWidget.setProperty('NoRowsSelected',true);
                        thisWidget.setProperty('AnyRowsSelected',false);
                    }
                    thisWidget.updateSelection('Data', rowNumbers);
                }
            }
        };

        this.beforeDestroy = function () {
            var domElementId = this.jqElementId;
            var widgetElement = this.jqElement;

            try {
                widgetElement.unbind();
            }
            catch (destroyErr) {
            }

            try {
                widgetElement.empty();
            }
            catch (destroyErr) {
            }
        };
    };
}());
// ----END: extensions/infotableselector_ExtensionPackage/ui/infotableselector/infotableselector.runtime.js

// ----BEGIN: extensions/propertytable_ExtensionPackage/ui/propertytable/propertytable.runtime.js
/*global TW */

(function () {

    TW.Runtime.Widgets.propertytable = function () {

        this.renderHtml = function () {
            return '<div class="widget-content widget-propertytable"></div>';
        };

        /**
         * Find a human-friendly rendering of a given property name.
         *
         * @param  {String} propName property name in internal format (presumed to be camel case)
         * @return {String}          property name in title case
         */
        this.makeDisplayableName = function (propName) {
            // TODO get property name from widget's row configuration; translate it if it's
            // a localization token. Similar to column formatting in Grid widget.

            var camelCase = propName || '';
            camelCase = camelCase.trim();

            if (camelCase.length === 0) {
                return '';
            }

            var titleCase = camelCase.replace(/([a-z])([A-Z])/g, '$1 $2'); // separate words
            titleCase = titleCase.charAt(0).toUpperCase() + titleCase.substr(1); // capitalize first word

            return TW.escapeHTML(titleCase);
        };

        this.updateProperty = function (updatePropertyInfo) {

            if (updatePropertyInfo.TargetProperty !== "Data") {
                TW.log.error('Unsupported property in TW.Runtime.Widgets.propertytable.updateProperty: ', updatePropertyInfo.TargetProperty);
                return;
            }

            // CSS and HTML for the properties table.
            var tableTemplate = _.template(
                '<style>' +
                    '#<%= id %> {<%= div %> <%= borders %>} ' +
                    '#<%= id %> tr:nth-child(odd) {<%= row %>} ' +
                    '#<%= id %> tr:nth-child(even) {<%= altRow %>} ' +
                    '#<%= id %> tr:hover {<%= hoverRow %>} ' +
                    '#<%= id %> tr td {<%= borders %> <%= cellPadding %>} ' +
                    '#<%= id %> tr td:nth-child(1) {<%= prop %> width:<%= propWidth %>%;} ' +
                    '#<%= id %> tr td:nth-child(2) {<%= val %>}' +
                '</style>' +
                '<table id="<%= id %>" width="100%">' +
                    '<% rowData.forEach(function (row) { %>' +
                        '<tr>' +
                            '<td><span class="<%= propClass %>"><%= myself.makeDisplayableName(row.name) %></span></td>' +
                            '<td><span class="<%= valClass %>"><%= TW.escapeHTML(row.value) %></span></td>' +
                        '</tr>' +
                    '<% }); %>' +
                '</table>'
            );
            var tableConfig = {
                id:     this.idOfThisElement,
                myself: this
            };

            // Filter for simple values of general interest.

            tableConfig.rowData = updatePropertyInfo.ActualDataRows.filter(
                function (propertyItem) {
                    // Display simple data types; skip THINGNAME, LOCATION, IMAGE, etc.
                    // The values have already been rendered in string form.
                    switch (propertyItem.baseType) {
                        case 'BOOLEAN':
                        case 'DATETIME':
                        case 'INTEGER':
                        case 'NUMBER':
                        case 'STRING':
                            return true;
                        default:
                            return false;
                    }
                }
            );

            // Gather applicable styles.

            var aStyle = TW.getStyleFromStyleDefinition(this.getProperty('PropertyTableBackgroundStyle'));
            tableConfig.div = TW.getStyleCssGradientFromStyle(aStyle);
            tableConfig.borders = TW.getStyleCssBorderFromStyle(aStyle);

            aStyle = TW.getStyleFromStyleDefinition(this.getProperty('RowBackgroundStyle'));
            tableConfig.row = TW.getStyleCssGradientFromStyle(aStyle);

            aStyle = TW.getStyleFromStyleDefinition(this.getProperty('RowAlternateBackgroundStyle'));
            tableConfig.altRow = TW.getStyleCssGradientFromStyle(aStyle);

            aStyle = TW.getStyleFromStyleDefinition(this.getProperty('RowHoverStyle'));
            tableConfig.hoverRow = TW.getStyleCssGradientFromStyle(aStyle);

            aStyle = TW.getStyleFromStyleDefinition(this.getProperty('PropertyStyle'));
            tableConfig.prop = TW.getStyleCssTextualNoBackgroundFromStyle(aStyle);
            tableConfig.propClass = TW.getTextSizeFromStyleDefinition(this.getProperty('PropertyStyle'));
            tableConfig.propWidth = this.getProperty('PropertyColumnWidth', 50);

            aStyle = TW.getStyleFromStyleDefinition(this.getProperty('ValueStyle'));
            tableConfig.val = TW.getStyleCssTextualNoBackgroundFromStyle(aStyle);
            tableConfig.valClass = TW.getTextSizeFromStyleDefinition(this.getProperty('ValueStyle'));

            // TODO padding should be a property but there's no precedent for exposing it.
            tableConfig.cellPadding = 'padding: 2px 4px;';

            // Create the table and update the display.

            this.jqElement.empty().html(tableTemplate(tableConfig));
        };

        this.beforeDestroy = function () {
            var widgetElement = this.jqElement;

            try {
                widgetElement.unbind();
            }
            catch (destroyErr) {
            }

            try {
                widgetElement.empty();
            }
            catch (destroyErr) {
            }
        };
    };
}());
// ----END: extensions/propertytable_ExtensionPackage/ui/propertytable/propertytable.runtime.js

// ----BEGIN: extensions/ptc-action-bar-widget/ui/action-bar/action-bar.config.js
(function (TW) {
    let widgetName = "action-bar";

    let config = {
        //elementName control the Type property and the widget
        // name which will be display on the composer.
        // It must be the same as the web element name
        "elementName": "action-bar",
        "htmlImports": [
            {
                "id": "action-bar",
                "url": "action-bar/action-bar.js",
                "version": "^1.0.0"
            }
        ],
        "flags": {
            "name": getLocalizedString("[[PTC.ActionBar.Name]]"),
            "description": getLocalizedString("[[PTC.ActionBar.ToolTip]]"),
            "category": ["Beta"],
            "customEditor": "ActionBarCustomEditor",
            "customEditorMenuText": "Configure Action Bar"
        },
        "properties": {
            // Properties definitions settings.
            // Can change from here the default properties values.
            "SubComponentConfiguration": {
                "baseType": "JSON",
                "isBindingTarget": true,
                "isBindingSource": false,
                "isEditable": false
            },
            "Disabled": {
                "baseType": "BOOLEAN",
                "isBindingTarget": true,
                "isBindingSource": false,
                "defaultValue": false,
            },
            "Configuration": {
                "isVisible":Â false
            },
            "Input": {
                "baseType": "JSON",
                "isBindingTarget": true,
                "isBindingSource": false,
                "isEditable": true,
                "defaultValue": {}
            }
        },
        "events": {
            "PopupClosed": {"src": "PopupClosed"},
            "EventTriggered": {"src": "EventTriggered"},
        },
        // Concatenating widgetName to rootPath to find the ui files
        // Should be the same as the widget name
        "widgetName": "action-bar",
        "extensionName": "ptcs-widget-ext",
        "rootPath": "/Thingworx/Common/extensions/ptc-action-bar-widget/ui/",
        "imports": {
            "action-bar": "../../../extensions/action-bar/action-bar.js"
        },
        "styleDict": [
            {
                "part": "select-box",
                "states": [
                    {
                        "state": "",
                        "stateHost": "",
                        "styles": {
                            "border": "solid 1px #c2c7ce",
                            "background-color": "#ffffff",
                            "width": "18px",
                            "height": "18px",
                            "min-height": "18px !important",
                            "border-radius": "2px",
                            "padding-left": "0px !important",
                            "padding-right": "0px !important",
                            "box-sizing": "content-box !important"
                        }
                    }
                ]
            }
        ]
    };

    // Temporary widgetWrapper if not initialized
    TW.Widget.widgetWrapper = TW.Widget.widgetWrapper || {
        imports: [],
        configs: {},
        loadImports: function (imports) {
            this.imports.push(imports);
        },
        config: function (name, config) {
            if (config) {
                this.configs[name] = config;
            }
            return this.configs[name];
        }
    };

    TW.Widget.widgetWrapper.config(widgetName, config);
})(TW);

function getLocalizedString(inputString) {

    //To get the localized string for the key
    var localizedName = "";
    if ((inputString !== null) && (inputString !== undefined)) {
        var TW = window.TW || {};
        localizedName = TW.Runtime.convertLocalizableString(inputString);
    }
    //If localized value not found, return label as is
    localizedName = (localizedName !== "" && localizedName !== "???") ? localizedName : inputString;
    return localizedName;
};
// ----END: extensions/ptc-action-bar-widget/ui/action-bar/action-bar.config.js

// ----BEGIN: extensions/ptc-action-bar-widget/ui/action-bar/action-bar.runtime.js
(function (widgetName, isIDE) {
  let widgets = isIDE ? TW.IDE.Widgets : TW.Runtime.Widgets;
  widgets[widgetName] = function () {
    let config = TW.Widget.widgetWrapper.config(widgetName);
    TW.Widget.widgetWrapper.inject(config.elementName, this, config, isIDE);

    //[ custom code

    //]
  };

  let config = TW.Widget.widgetWrapper.config(widgetName); // = config;
  TW.Widget.widgetWrapper.loadImports(config.imports);
})("action-bar", false);
// ----END: extensions/ptc-action-bar-widget/ui/action-bar/action-bar.runtime.js

// ----BEGIN: extensions/ptc-action-bar-widget/ui/action-bar/action-bar.customdialog.ide.js
// this will be instantiated with
//     new TW.IDE.Dialogs.ActionBarCustomEditor()

TW.IDE.Dialogs.ActionBarCustomEditor = function () {

    var self = this;
    /*******************************************
     * Set the following parameters according to your Component
     ********************************************/
    this.componentName = "PTC.ActionBarModel";
    this.defaultConfigurationName = "Default";
    //Set the following to something other then Configuration only for debugging
    this.configurationPropertyName = "Configuration";
    //*******************************************/

    this.initialConfiguration = {name: this.defaultConfigurationName, delta: {}};

    /**
     * Update the configuration property once "done" is clicked.
     * @param widgetObj - the widget object
     * @returns {boolean}
     */
    this.updateProperties = function (widgetObj) {
        var namedConfiguratoinComponent = $('#' + this.jqElementId + ' #named-configuration-component')[0];
        var configuration = namedConfiguratoinComponent.selectedConfiguration;

        widgetObj.setProperty(this.configurationPropertyName,
            configuration || widgetObj.getProperty(this.configurationPropertyName));

        return true;
    };

    /**
     * Calculates the HTML code for the configuration dialog.
     * @param widgetObj - the widget object
     * @returns {string}
     */
    this.renderDialogHtml = function (widgetObj) {
        var properties = widgetObj.properties;
        if (properties[this.configurationPropertyName] != null &&
            properties[this.configurationPropertyName] != undefined) {
            let configurationJson =
                (Object.prototype.toString.call(properties[this.configurationPropertyName]) === "[object String]" ?
                    JSON.parse(properties[this.configurationPropertyName]) : properties[this.configurationPropertyName]);
            if (configurationJson.name != undefined) {
                this.initialConfiguration.name = configurationJson.name;
                if (configurationJson.delta != undefined) {
                    this.initialConfiguration.delta = configurationJson.delta;
                }
            }
        }
        var html = '<div>' +
            '<named-config id="named-configuration-component" component-name="' + this.componentName + '"' +
            '></named-config>' +
            '<div>';
        return html;
    };

    /**
     * Running after the HTML code from "renderDialogHtml" has rendered to the DOM.
     * Used to bind code to specific events pushed from the dialog HTML code.
     * @param domElementId
     */
    this.afterRender = function (domElementId) {
        this.jqElementId = domElementId;
        let jqComponent = $('#' + this.jqElementId + ' #named-configuration-component');
        jqComponent[0].selectedConfiguration = this.initialConfiguration;
        jqComponent.on('verified-changed',
            function (event) {
                $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled', !event.originalEvent.detail.value)
            }
        );
        $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',
            !jqComponent[0].verified);

    }
};
// ----END: extensions/ptc-action-bar-widget/ui/action-bar/action-bar.customdialog.ide.js

// ----BEGIN: extensions/ptc-attribute-widget/ui/attribute-component-widget/attribute-component-widget.config.js
(function (TW) {
  let widgetName = "attribute-component-widget";
  let defaultValue = {};
  let config = {
                  //elementName control the Type property and the widget
                  // name which will be display on the composer.
                  // It must be the same as the web element name
                "elementName": "attribute-panel",
                "htmlImports": [
                  {
                    "id": "attribute-panel",
                    "url": "attribute-panel/attribute-panel.js",
                    "version": "^1.0.0"
                  }
                ],
                "properties": {
                    // Properties definitions settings.
                    // Can change from here the default properties values.
                    "Configuration": {
                        "baseType":"JSON",
                        "isBindingTarget":true,
                        "isVisible": false,
                        "defaultValue": JSON.stringify(defaultValue)
                    },
                    "InputData": {
                        "baseType":"STRING",
                        "isBindingTarget":true
                    },
                    "TailoringName": {
                        "baseType":"STRING",
                        "isBindingTarget":true
                    }
                },
                  "flags": {
                      "customEditor": "AttributePanelCustomEditor",
                      "customEditorMenuText": getLocalizedString("[[PTC.AttributePanel.ConfigureAttributes]]"),
                      "name": getLocalizedString("[[PTC.AttributePanel.Name]]"),
                      "description": getLocalizedString("[[PTC.AttributePanel.ToolTip]]"),
                      "supportsAutoResize": true,
                      "category": ["Beta"]
                  },
                  // Concatenating widgetName to rootPath to find the ui files
                  // Should be the same as the widget name
                "widgetName": "attribute-component-widget",
                "extensionName": "ptcs-widget-ext",
                "rootPath": "/Thingworx/Common/extensions/ptc-attribute-widget/ui/",
                "imports": {
                  "attribute-panel": "../../../extensions/attribute-panel/attribute-panel.js"
                }
              };

  // Temporary widgetWrapper if not initialized
  TW.Widget.widgetWrapper = TW.Widget.widgetWrapper || {
    imports: [],
    configs: {},
    loadImports: function (imports) {
      this.imports.push(imports);
    },
    config: function (name, config) {
      if (config) {
        this.configs[name] = config;
      }
      return this.configs[name];
    }
  };

  TW.Widget.widgetWrapper.config(widgetName, config);
})(TW);

function getLocalizedString(inputString) {

    //To get the localized string for the key
    var localizedName = "";
    if ((inputString !== null) &&(inputString !== undefined)) {
        var TW = window.TW || {};
        localizedName = TW.Runtime.convertLocalizableString(inputString);
    }
    //If localized value not found, return label as is
    localizedName = (localizedName !== "" && localizedName !== "???") ? localizedName : inputString;
    return localizedName;
};
// ----END: extensions/ptc-attribute-widget/ui/attribute-component-widget/attribute-component-widget.config.js

// ----BEGIN: extensions/ptc-attribute-widget/ui/attribute-component-widget/attribute-component-widget.customdialog.ide.js
// this will be instantiated with
//     new TW.IDE.Dialogs.ActionBarCustomEditor()

TW.IDE.Dialogs.AttributePanelCustomEditor = function (){

    var self = this;
    /*******************************************
    * Set the following parameters according to your Component
    ********************************************/
    this.componentName = "PTC.AttributePanel";
    this.defaultConfigurationName = "Default";
    //Set the following to something other then Configuration only for debugging
    this.configurationPropertyName = "Configuration";
    //*******************************************/

    this.initialConfiguration = {name:this.defaultConfigurationName, delta:{}};

    /**
     * Update the configuration property once "done" is clicked.
     * @param widgetObj - the widget object
     * @returns {boolean}
     */
    this.updateProperties = function(widgetObj) {
        var namedConfiguratoinComponent = $('#' + this.jqElementId + ' #named-configuration-component')[0];
        var configuration = namedConfiguratoinComponent.selectedConfiguration;

        widgetObj.setProperty(this.configurationPropertyName,
            configuration || widgetObj.getProperty(this.configurationPropertyName));

        return true;
    };

    /**
     * Calculates the HTML code for the configuration dialog.
     * @param widgetObj - the widget object
     * @returns {string}
     */
    this.renderDialogHtml = function (widgetObj) {
        var properties = widgetObj.properties;
        if (properties[this.configurationPropertyName] != null &&
            properties[this.configurationPropertyName] != undefined ){
            let configurationJson =
                (Object.prototype.toString.call(properties[this.configurationPropertyName]) === "[object String]" ?
                JSON.parse(properties[this.configurationPropertyName]) : properties[this.configurationPropertyName]);
            if (configurationJson.name != undefined){
                this.initialConfiguration.name = configurationJson.name;
                if (configurationJson.delta != undefined){
                    this.initialConfiguration.delta = configurationJson.delta;
                }
            }
        }
        var html = '<div>' +
            '<named-config id="named-configuration-component" component-name="'+this.componentName +'"' +
            '></named-config>' +
            '<div>';
        return html;
    };

    /**
     * Running after the HTML code from "renderDialogHtml" has rendered to the DOM.
     * Used to bind code to specific events pushed from the dialog HTML code.
     * @param domElementId
     */
    this.afterRender = function(domElementId) {
        this.jqElementId = domElementId;
        let jqComponent = $('#' + this.jqElementId + ' #named-configuration-component');
        jqComponent[0].selectedConfiguration = this.initialConfiguration;
        jqComponent.on('verified-changed',
            function(event){
                $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',!event.originalEvent.detail.value)
            }
        );
        $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',
            !jqComponent[0].verified);

    }
};
// ----END: extensions/ptc-attribute-widget/ui/attribute-component-widget/attribute-component-widget.customdialog.ide.js

// ----BEGIN: extensions/ptc-attribute-widget/ui/attribute-component-widget/attribute-component-widget.runtime.js
(function (widgetName, isIDE) {
  let widgets = isIDE ? TW.IDE.Widgets : TW.Runtime.Widgets;
  widgets[widgetName] = function () {
    let config = TW.Widget.widgetWrapper.config(widgetName);
    TW.Widget.widgetWrapper.inject(config.elementName, this, config, isIDE);

    //[ custom code

    //]
  };

  let config = TW.Widget.widgetWrapper.config(widgetName); // = config;
  TW.Widget.widgetWrapper.loadImports(config.imports);
})("attribute-component-widget", false);
// ----END: extensions/ptc-attribute-widget/ui/attribute-component-widget/attribute-component-widget.runtime.js

// ----BEGIN: extensions/ptc-creo-view-extension/ui/creoview/pvlaunch.js
/* bcwti
 *
 * Copyright (c) 2015, 2018, 2019 PTC Inc.
 *
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * PTC Inc. and is subject to the terms of a software license agreement.
 * You shall not disclose such confidential information and shall use
 * it only in accordance with the terms of the license agreement.
 *
 * ecwti
 */

/* var s_docPluginVersion = "12.1.0.31"; */

//
// javascript functions to support embedding PTC Creo View.
//

// //////////////////////////////////////////////////////////////
// determine which browser we are running in - this global
// value _isIE_pvlaunch is used elsewhere in the pvcadview scripts
// //////////////////////////////////////////////////////////////
var _isIE_pvlaunch = false;
var _is64bitIE_pvlaunch = false;
var _isFirefox_pvlaunch = false;
var _isChrome_pvlaunch = false;
var _isIE_pvlaunch11 = false;

var ver = navigator.userAgent;
if (ver.indexOf("MSIE") != -1) { // MSIE has been removed from IE 11
    _isIE_pvlaunch = true;
    if (ver.indexOf("Win64") != -1) {
        _is64bitIE_pvlaunch = true;
    }
} else if (ver.indexOf("Trident") != -1) { // Trident exists from IE8 >
    _isIE_pvlaunch=true;
    if (ver.indexOf("Win64") != -1) {
        _is64bitIE_pvlaunch = true;
    }
    _isIE_pvlaunch11 = (/msie 11/.test(ver.toLowerCase()) || /trident\/7\.0/.test(ver.toLowerCase()));
} else if (ver.toLowerCase().indexOf('firefox') > -1) {
    _isFirefox_pvlaunch = true
} else if (ver.toLowerCase().indexOf('chrome') > -1) {
    _isChrome_pvlaunch = true
}

// //////////////////////////////////////////////////////////////
// document-specific functions
// //////////////////////////////////////////////////////////////
var s_docType = "application/x-pvlite9-ed";
var s_docPluginVersion = "12.1.0.31"; // version string of the form '1.2.3.4'
var s_downloadDir = ""; // If set should end with a /
var s_basePvUrl = "";
var _visNavEvents = null;

var g_useVerCheck = true;
var g_docLoadedAction = 0;
var g_installingVerCheck = false;
var g_pvlaunchInitialised = false;
var g_consumerInstall = false; // Setting to true will automatically prompt to install Creo View Consumer

var _local_UpgradeTitle = "A new version of PTC Creo View is available for download";
var _local_UpgradeContinue = "Use currently installed viewer";
var _local_UpgradeInstall = "Upgrade viewer";
var _local_Reinstall = "PTC Creo View requires repair or reinstall";
var _local_Install = "Install PTC Creo View";
var _local_Enable_SoftwareUpdate = "You must enable Software Update to install this plugin";
var _local_Install_Failed = "PTC Creo View installation failed";
var _local_Unsupported_Browser = "Unsupported browser platform";
var _local_InitialisePlugin_Error = "An error occured initialising the PTC Creo View plugin";
var _local_Restart_Needed = "You need to restart your browser to complete the PTC Creo View installation";
var _local_nocheck = "Stop Checking for new versions";
var _local_CreoViewInstallation = "An installation of PTC Creo View is required in order to use this Widget.";

if (!g_pvliteInstanceArray) {
    var g_pvliteInstance = 0;
    var g_pvliteInstanceArray = new Array();
}

function SetupPView() {
    // Disable F1 Help provided by the browser when running in full screen mode(onhelp is ie only and ignored by Firefox).
    document.body.onhelp = function keyhit() { event.returnValue = false; };

    var browser_platform = "";

    if (navigator.platform == "Win32") {
        if (_is64bitIE_pvlaunch)
            browser_platform = "x86e_win64";
        else
            browser_platform = "i486_nt";
    } else if (navigator.platform == "Win64") {
        browser_platform = "x86e_win64";
    }

    if (browser_platform == "") {
        if (typeof _pvliteString_Unsupported_Browser != "undefined")
            _local_Unsupported_Browser = _pvliteString_Unsupported_Browser;
        console.log(_local_Unsupported_Browser + "\n" + navigator.platform);
        return;
    }

    if (_isFirefox_pvlaunch) {
        var s = unescape(document.URL);
        var p = s.lastIndexOf("/");
        s_downloadDir = s.substring(0, p + 1);
        g_docPluginURL = s_basePvUrl + browser_platform + "_ns/npvverck.xpi";
    } else if (_isIE_pvlaunch) {
        var s = document.URL;
        if (s.indexOf("http") == 0) {
            var p = s.lastIndexOf("/");
            s_downloadDir = document.URL.substring(0, p + 1);
            g_docPluginURL = s_basePvUrl + browser_platform;
            g_docPluginURL += "_ie\\pvvercheck_usr.cab";
        } else {
            var p = s.lastIndexOf("\\");
            s_downloadDir = document.URL.substring(0, p + 1);
            g_docPluginURL = s_basePvUrl + browser_platform;
            g_docPluginURL += "_ie\\pvvercheck_usr.cab";
        }
    } else if (_isChrome_pvlaunch) {
        var s = unescape(document.URL);
        var p = s.lastIndexOf("/");
        s_downloadDir = s.substring(0, p + 1);
    }

    if (typeof _pvliteString_Unsupported_Browser != "undefined")
        _local_Unsupported_Browser = _pvliteString_Unsupported_Browser;

    if (browser_platform == "") {
        console.log(_local_Unsupported_Browser + "\n" + navigator.platform);
        return;
    }

    if (s_downloadDir.indexOf("file:///") == 0) {
        // Check so it can be ignored.
    } else if (s_downloadDir.indexOf("file://") == 0) {
        s_downloadDir = s_downloadDir.substring(7, s_downloadDir.length);
        s_downloadDir = "file:///" + s_downloadDir;
    }

    // version numbers in ie are comma seperated
    if (_isIE_pvlaunch)
        s_docPluginVersion = s_docPluginVersion.replace(/\./g, ",");
}

function isRelativeUrl(inputUrl) {
    if (inputUrl.indexOf("http") == 0) {
        return false;
    } else if (inputUrl.indexOf("__pvbnfs") == 0) {
        return false;
    } else if (inputUrl.indexOf("file") == 0) {
        return false;
    } else if (inputUrl.indexOf(":") == 1) {
        return false;
    } else {
        return true;
    }
}

function LoadModel(sourceUrl, markupUrl, modifymarkupurl, uiconfigUrl) {
    document.getElementById(this.pvCtl).renderannotation = "";
    document.getElementById(this.pvCtl).renderviewable = "";

    var baseUrl;
    var newSourceUrl = fixPath(sourceUrl);

    if (isRelativeUrl(newSourceUrl)) {
        var newBaseUrl = fixPath(document.URL);
        loc = newBaseUrl.lastIndexOf("/");
        if (loc != -1)
            baseUrl = newBaseUrl.substring(0, loc);

        loc = newSourceUrl.lastIndexOf('/');
        if (loc != -1) {
            baseUrl += "/";
            baseUrl += newSourceUrl.substring(0, loc + 1);
        }
    } else {
        loc = newSourceUrl.lastIndexOf('/');
        if (loc != -1)
            baseUrl = newSourceUrl.substring(0, loc + 1);
    }

    baseUrl = checkFileURL(baseUrl);
    document.getElementById(this.pvCtl).urlbase = baseUrl;

    if (this.thumbnail) {
        if (isRelativeUrl(sourceUrl)) {
            document.getElementById(this.pvCtl).pvt = s_downloadDir + sourceUrl;
        } else {
            document.getElementById(this.pvCtl).modifymarkupurl = modifymarkupurl;
            document.getElementById(this.pvCtl).pvt = sourceUrl;
        }
    } else {
        if (isRelativeUrl(sourceUrl)) {
            document.getElementById(this.pvCtl).modifymarkupurl = modifymarkupurl;
            document.getElementById(this.pvCtl).edurl = s_downloadDir + sourceUrl;
        } else {
            document.getElementById(this.pvCtl).modifymarkupurl = modifymarkupurl;
            document.getElementById(this.pvCtl).edurl = sourceUrl;
        }
    }
}

function Select(selXml, descendants) {
    document.getElementById(this.pvCtl).Select(selXml, descendants);
}

function DeSelect(selXml, descendants) {
    document.getElementById(this.pvCtl).DeSelect(selXml, descendants);
}

function SelectInstances(ids) {
    document.getElementById(this.pvCtl).SelectInstances(ids);
}

function DeSelectInstances(ids) {
    document.getElementById(this.pvCtl).DeSelectInstances(ids);
}

function SetInstanceTransparency(idPath, transparency) {
    document.getElementById(this.pvCtl).SetInstanceTransparency(idPath, Number(transparency));
}

function SetInstanceColor(instance, instanceColor) {
    document.getElementById(this.pvCtl).SetInstanceColor(instance, instanceColor);
}

function SetViewState(name, type) {
    return document.getElementById(this.pvCtl).SetViewState(name, type);
}

function ListViewStates() {
    return document.getElementById(this.pvCtl).ListViewStates();
}

function GetNumOfViewables() {
    return document.getElementById(this.pvCtl).GetNumOfViewables();
}

function LoadViewable(index) {
    return document.getElementById(this.pvCtl).LoadViewable(Number(index));
}

function GetViewableName(index) {
    return document.getElementById(this.pvCtl).GetViewableName(Number(index));
}




function SetBackgroundColor(pBgColor) {
    document.getElementById(this.pvCtl).backgroundcolor = pBgColor;
}

function RestoreInstanceColor(instIds) {
    document.getElementById(this.pvCtl).RestoreInstanceColor(instIds);
}

function SetInstanceTransparency(idPath, transparency) {
    document.getElementById(this.pvCtl).SetInstanceTransparency(idPath, Number(transparency));
}

function SetInstanceColor(idPath, instanceColor) {
    document.getElementById(this.pvCtl).SetInstanceColor(idPath, instanceColor);
}

function SelectAll() {
    return document.getElementById(this.pvCtl).SelectAll();
}

function SetPvBaseUrl(baseUrl) {
    s_basePvUrl = baseUrl;
}

function DeSelectAll() {
    return document.getElementById(this.pvCtl).DeSelectAll();
}

function SelectInstance(instance) {
    document.getElementById(this.pvCtl).SelectInstance(instance);
}

function DeSelectInstance(instance) {
    document.getElementById(this.pvCtl).DeSelectInstance(instance);
}

function ListInstances() {
    document.getElementById(this.pvCtl).ListInstances();
}
function PvLiteApi(pvId, pluginId) {
    this.LoadModel = LoadModel;
    this.SelectAll = SelectAll;
    this.DeSelectAll = DeSelectAll;
    this.SelectInstance = SelectInstance;
    this.DeSelectInstance = DeSelectInstance;
    this.SelectInstances = SelectInstances;
    this.DeSelectInstances = DeSelectInstances;
    this.Select = Select;
    this.DeSelect = DeSelect;

    this.SetInstanceTransparency = SetInstanceTransparency;
    this.SetInstanceColor = SetInstanceColor;
    this.SetViewState = SetViewState;
    this.ListViewStates = ListViewStates;
    this.GetNumOfViewables = GetNumOfViewables;
    this.LoadViewable = LoadViewable;
    this.GetViewableName = GetViewableName;
    this.SetBackgroundColor = SetBackgroundColor;
    this.RestoreInstanceColor = RestoreInstanceColor;
    this.SetInstanceTransparency = SetInstanceTransparency;
    this.SetInstanceColor = SetInstanceColor;
    this.ListInstances = ListInstances;

    // Public java script callbacks from the plugin
    this.OnLoadComplete;
    this.OnSelectInstance;
    this.OnDeSelectInstance;
    this.OnSelectAnnotation;
    this.OnDeSelectAll;
    this.OnBeginSelect;
    this.OnEndSelect;
    this.OnBeginInstance;
    this.OnInstance;
    this.OnEndInstance;

    // Private attributes
    this.pvId = pvId;
    this.pvVerCtl = "pvVerCtl" + pvId;
    this.pvCtl = pluginId;
    this.runpview = "runpview" + pvId;
    this.upgradepview = "upgradepview" + pvId;
    this.checkpview = "checkpview" + pvId;
    this.params;
}

function isLocal(theUrl) {
    if (theUrl.indexOf("http") == 0) {
        return false;
    } else if (theUrl.indexOf("__pvbnfs") == 0) {
        return false;
    } else if (theUrl.indexOf("file") == 0) {
        return true;
    } else if (theUrl.indexOf(":") == 1) {
        return true;
    } else {
        return false;
    }
}

function fixPath(s) {
    return s.replace(/\\/g, "/");
}

function checkFileURL(theUrl) {
    var loc = theUrl.indexOf("file:///", 0);
    if (loc == -1) {
        loc = theUrl.indexOf("file://", 0);
        if (loc == -1) {
            loc = theUrl.indexOf(":", 0);
            if (loc == 1) {
                theNewUrl = "file:///";
                theNewUrl += theUrl;
                return theNewUrl;
            }
        } else {
            theNewUrl = "file:///";
            theNewUrl += theUrl.substring(7, theUrl.length);
            return theNewUrl;
        }
    }
    return theUrl;
}

function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            if (oldonload) {
                oldonload();
            }
            func();
        }
    }
}

function CreoViewParametersObj() {
    this.edition = undefined;
    this.edurl = undefined;
    this.urltemplate = undefined;
    this.viewableoid = undefined;
    this.renderatstartup = undefined;
    this.thumbnailView = undefined;
    this.uiconfigurl = undefined;
    this.getmarkupurl = undefined;
    this.modifymarkupurl = undefined;
    this.modifymarkupparam = undefined;
    this.configurl = undefined;
    this.urlbase = undefined;
    this.mapurl = undefined;
    this.hosttype = undefined; // If not running against Windchill set to webserver
    this.renderannotation = undefined;
    this.renderviewable = undefined;

    this.configoptions = undefined;
    this.username = undefined;
    this.useremail = undefined;
    this.usertelno = undefined;
    this.heading = undefined;
}

function ProductView(pluginParameters, returnHtml, pluginId, useVercheck) {
    var cookies = document.cookie;
    var pvVerChecked = cookies.indexOf("pvlite_version_checked");
    g_useVerCheck = useVercheck;
    if (g_pvlaunchInitialised == false) {
        g_pvlaunchInitialised = true;
        SetupPView();
    }

    pvApi = new PvLiteApi("pvctl" + g_pvliteInstance, pluginId);
    var pvParams = "";

    Object.getOwnPropertyNames(pluginParameters).forEach(function(val, idx, array) {
        if (pluginParameters[val])
            pvParams += " " + val + "='" + pluginParameters[val] + "'";
    });

    pvApi.params = pvParams;
    g_pvliteInstanceArray[g_pvliteInstance] = pvApi;

    if( returnHtml === true ) {
        setTimeout(function() {
            docLoaded();
        },100);
    } else {
        addLoadEvent(docLoaded);
    }
        var htmlToWrite = '';

    htmlToWrite += IECallbackEvents(pvApi,returnHtml);

    htmlToWrite += '<div style="position:relative;top:0;left:0;border-width:0px;border-style:none;width:100%;height:100%">';

    // Upgrade div
    htmlToWrite += '<div align=center id=' + pvApi.upgradepview + ' style="position:relative;top:0;left:0;border-width:0px;border-style:none;visibility:hidden">';
    htmlToWrite += '<p>An installation of PTC Creo View is required in order to use this Widget.</p>';
    htmlToWrite += '</div>';
    if (useVercheck && s_docPluginVersion && pvVerChecked == "-1") {
        htmlToWrite += '<div id=' + pvApi.checkpview + ' style="visibility:hidden;position:absolute;top:2;left:2;zIndex=-1;width:0;height:0;border-style:none">';
        htmlToWrite += GetPvCheckHtml(pvApi);
        htmlToWrite += '</div>';
    }
    // ProductView Lite div
    htmlToWrite += '<div id=' + pvApi.runpview + ' style="visibility:hidden;position:absolute;top:0;left:0;width:100%;height:100%;zIndex=-1;border-width:0px;border-style:none">';
    htmlToWrite += '</div>';
    htmlToWrite += '</div>';

    if( returnHtml === undefined ) {
        document.write(htmlToWrite);
        if( returnHtml === undefined ) {
            g_docLoadedAction = 1; // Test client
        }
    }

    if( returnHtml === undefined ) {
        g_pvliteInstance += 1;
    }

    if( returnHtml !== undefined ) {
        return htmlToWrite;
    } else {
        return pvApi;
    }
}

function docLoaded() {
    if (g_installingVerCheck)
        return; // Only allow one pvvercheck installer to run.

    if (g_docLoadedAction == 0) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            StartPview(g_pvliteInstanceArray[i]);
        }
        return;
    }

    if (g_docLoadedAction == 1) {
        try {
            for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
                var myObj = g_pvliteInstanceArray[i];

                var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

                if (is_chrome || g_useVerCheck) {
                    StartPview(myObj);
                }
                else if (document.getElementById(myObj.pvVerCtl).ReadyState != 4) {
                    StartPview(myObj);
                } else {
                    var isInstalled = document.getElementById(myObj.pvVerCtl).CheckPview(s_docPluginVersion);
                    var vi = document.getElementById(myObj.pvVerCtl).GetInstalledVersion();
                    if (isInstalled == 0) { // Pview Not installed so need to install it
                        if (typeof _pvliteString_Install != "undefined")
                            _local_Install = _pvliteString_Install;
                        document.getElementById(myObj.upgradepview).innerHTML += '<A class=wizardlabel HREF="javascript:void(DoInstall())"  TITLE="' + s_docPluginVersion + '">' + _local_Install + '</A>';
                    } else if (isInstalled == 1) { //pview is installed and up to date so just run
                        StartPview(myObj);
                    } else if (isInstalled == 2) { //pview is installed But can be upgraded
                        if (typeof _pvliteString_UpgradeContinue != "undefined")
                            _local_UpgradeContinue = _pvliteString_UpgradeContinue;
                        if (typeof _pvliteString_UpgradeTitle != "undefined")
                            _local_UpgradeTitle = _pvliteString_UpgradeTitle;
                        if (typeof _pvliteString_UpgradeInstall != "undefined")
                            _local_UpgradeInstall = _pvliteString_UpgradeInstall;
                        document.getElementById(myObj.upgradepview).innerHTML += '<A class=wizardlabel HREF="javascript:void(DoInstall())"  TITLE="' + s_docPluginVersion + '">' + _local_UpgradeInstall + '</A><BR><A class=wizardlabel HREF="javascript:void(DoNotInstall())" TITLE="' + vi + '">' + _local_UpgradeContinue + '</A><BR>';
                    }
                }
            }
        } catch (e) {
            console.log("Caught an exception here: " + e);
        }
    }
}

function OnInstalledFinished(name, result) {
    if (result != 0)
        console.log("Download failed");
}

function StartPview(myApi) {
    try {
        document.getElementById(myApi.runpview).innerHTML = GetPviewHtml(myApi);
        document.getElementById(myApi.runpview).style.visibility = 'visible';
    } catch (e) {
        console.log("caught exception: " + e);
        return;
    }

    try {
        document.getElementById(myApi.pvCtl).IsRunning();
    } catch (e) {
        document.getElementById(myApi.runpview).style.visibility = 'hidden';
        if (g_consumerInstall == false) {
            document.getElementById(myApi.upgradepview).style.visibility = 'visible';
        }
        return;
    }

    if ( (_isFirefox_pvlaunch || _isChrome_pvlaunch) && _visNavEvents != null) {
        eval(_visNavEvents);
    } else if (_isFirefox_pvlaunch || _isChrome_pvlaunch) {
        var cb = new NS6callback();
        cb.pvObj = myApi;
        try {
            var retVal = document.getElementById(myApi.pvCtl).SetNSCallback(cb);
        } catch (e) {
            console.log("exception thrown doing SetNSCallback");
        }
    }
}

function ConvertNSParamsToIE(nsParams) {
    var params = "";
    var count = 0;

    if (!nsParams)
        return params;

    var startloc = 0;
    while (true && count++ < 200) {
        var loc = nsParams.indexOf("=", startloc);
        if (loc == -1)
            break;
        params += "<param name='";
        var nameStartLoc = nsParams.lastIndexOf(' ', loc);
        params += nsParams.substring(nameStartLoc + 1, loc);

        params += "' value=";
        var loc1 = nsParams.indexOf("'", startloc);
        var loc2 = nsParams.indexOf("'", loc1 + 1);
        params += nsParams.substring(loc1, loc2 + 1);
        params += ">";
        startloc = loc2 + 1;
    }
    return params;
}

function GetPviewHtml(pvApi) {
    var htmlString = "";
    if (_isIE_pvlaunch) {
        var ieParams = ConvertNSParamsToIE(pvApi.params);

        if (_is64bitIE_pvlaunch) {
            htmlString += '<object classid="CLSID:F1BFCEEA-892D-405c-945F-19F87338A17F" id=' + pvApi.pvCtl;
            if (g_consumerInstall == true) {
                htmlString += ' codebase=pview/consumer/consumer_64.cab#Version=10.2.30.23';
            }
        } else {
            htmlString += '<object classid="CLSID:F07443A6-02CF-4215-9413-55EE10D509CC" id=' + pvApi.pvCtl;
            if (g_consumerInstall == true) {
                htmlString += ' codebase=pview/consumer/consumer.cab#Version=10.2.30.23';
            }
        }

        if (s_docType)
            htmlString += ' type="' + s_docType + '"';
        htmlString += ' width=100%';
        htmlString += ' height=100%';
        htmlString += '>\n';
        htmlString += ieParams;
        htmlString += '</object>\n';
    } else {
        htmlString += '<embed name=' + pvApi.pvCtl;
        htmlString += ' type="application/x-pvlite9-ed" ';
        htmlString += ' id=' + pvApi.pvCtl;
        htmlString += ' width=100%';
        htmlString += ' height=100% ';
        htmlString += pvApi.params;
        htmlString += '>\n';
    }
    return htmlString;
}

function CompareVersion(downloadVersion, installedVersion) {
    var loc1 = 0;
    var loc2 = 0;
    for (i = 0; i < 4; i++) {
        var val1, val2;
        var locEnd = downloadVersion.indexOf('.', loc1);

        if (locEnd != -1)
            val1 = eval(downloadVersion.substring(loc1, locEnd));
        else
            val1 = eval(downloadVersion.substring(loc1));

        loc1 = locEnd + 1;
        locEnd = installedVersion.indexOf('.', loc2);

        if (locEnd != -1)
            val2 = eval(installedVersion.substring(loc2, locEnd));
        else
            val2 = eval(installedVersion.substring(loc2));

        loc2 = locEnd + 1;
        if (val1 > val2)
            return false;

        if (val1 < val2)
            return true;
    }
    return true
}

function GetPvCheckHtml(pvApi) {
    var htmlString = "";
    if (typeof InstallTrigger != 'undefined') {
        var usePlugin = false;
        var verCheckPlugin = navigator.plugins['Creo View Version Checker'];
        if (verCheckPlugin !== undefined) {
            var versionLoc = verCheckPlugin.description.lastIndexOf(' ');
            var instVer = verCheckPlugin.description.substring(versionLoc + 1);
            usePlugin = CompareVersion(s_docPluginVersion, instVer);
        }
        if (usePlugin) {
            htmlString += '<embed name=' + pvApi.pvVerCtl;
            htmlString += ' id=' + pvApi.pvVerCtl;

            if (g_docPluginURL)
                htmlString += ' pluginurl=' + s_downloadDir + g_docPluginURL;
            htmlString += ' pluginspage="' + s_downloadDir + g_docPluginURL + '"';
            htmlString += ' type="application/x-pvlite9-ver" ';
            htmlString += ' hidden="true"';
            htmlString += ' autostart="true"';
            htmlString += '>\n';
        } else {
            xpi = { 'XPInstall Creo View Version Checker': g_docPluginURL };
            if (!g_installingVerCheck) {
                g_installingVerCheck = true;
                InstallTrigger.install(xpi, OnInstalledFinished);
            }
        }
    } else if (_isIE_pvlaunch) {
        htmlString += '<object classid="CLSID:AA34B0DE-D0FE-4587-8B31-0BB687A9EF0B" id=' + pvApi.pvVerCtl;
        if (s_docType)
            htmlString += ' type="' + s_docType + '"';
        if (s_downloadDir)
            htmlString += ' codebase="' + s_downloadDir + g_docPluginURL;
        if (s_docPluginVersion)
            htmlString += '#version=' + s_docPluginVersion;
        if (g_docPluginURL)
            htmlString += '"';
        htmlString += 'height=0 width=0>';
        htmlString += '</object>\n';
    } else {
        // Unsupported browser
    }
    return htmlString;
}

function IECallbackEvents(pvApi,returnHtml) {
    var htmlToWrite = '';
    if (_isIE_pvlaunch) {
        if (_visNavEvents != null) {
            eval(_visNavEvents);
        } else {
            if (_isIE_pvlaunch11) {
                var id = pvApi.pvId;
                var pvCtl = pvApi.pvCtl;
                var events = [];
                events.push({event: "OnLoadComplete()", body: " NSLoadComplete('" + id + "') "});
                events.push({event: "OnSelectInstance(text)", body: " NSSelectInstance(text,'" + id + "')"});
                events.push({event: "OnDeSelectInstance(text)", body: " NSDeSelectInstance(text,'" + id + "') "});
                events.push({event: "OnSelect(text)", body: " NSSelect(text,'" + id + "') "});
                events.push({event: "OnDeSelect(text)", body: " NSDeSelect(text,'" + id + "') "});
                events.push({event: "OnDeSelectAll()", body: " NSDeSelectAll('" + id + "') "});
                events.push({event: "OnBeginSelect()", body: " NSBeginSelect('" + id + "') "});
                events.push({event: "OnEndSelect()", body: " NSEndSelect('" + id + "') "});
                events.push({event: "OnBeginInstance()", body: " NSBeginInstance('" + id + "') "});
                events.push({event: "OnInstance(id, name, parent)", body: " NSInstance(id, name, parent,'" + id + "') "});
                events.push({event: "OnEndInstance()", body: " NSEndInstance('" + id + "') "});
                events.push({event: "OnBeginViewState()", body: " NSBeginViewState('" + id + "') "});
                events.push({event: "OnEndViewState()", body: " NSEndViewState('" + id + "') "});
                events.push({event: "OnAddViewState(name, type)", body: " NSAddViewState(name, type, '" + id + "') "});

                var i = events.length;
                while (i--) {
                    var handler = document.createElement("script");
                    handler.setAttribute("for", pvCtl);
                    handler.event = events[i].event;
                    handler.appendChild(document.createTextNode(events[i].body));
                    document.body.appendChild(handler);
                }
            }
            else {
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnLoadComplete()'>NSLoadComplete('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnSelectInstance(text)'>NSSelectInstance(text,'" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnDeSelectInstance(text)'>NSDeSelectInstance(text,'" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnSelect(text)'>NSSelect(text,'" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnDeSelect(text)'>NSDeSelect(text,'" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnDeSelectAll()'>NSDeSelectAll('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnBeginSelect()'>NSBeginSelect('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnEndSelect()'>NSEndSelect('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnBeginInstance()'>NSBeginInstance('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnInstance(id, name, parent)'>NSInstance(id, name, parent,'" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnEndInstance()'>NSEndInstance('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnBeginViewState()'>NSBeginViewState('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnEndViewState()'>NSEndViewState('" + pvApi.pvId + "')</script>\n";
                htmlToWrite += "<script for='" + pvApi.pvCtl + "' event='OnAddViewState(name, type)'>NSAddViewState(name, type, '" + pvApi.pvId + "')</script>\n";

            }
            if( returnHtml === undefined ) {
                document.write(htmlToWrite);
            }
        }
    }
    return htmlToWrite;
}

function NSSelect(text, pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnSelect)
                    g_pvliteInstanceArray[i].OnSelect(text);
            }
        }
    } else {
        if (this.pvObj.OnSelect)
            this.pvObj.OnSelect(text);
    }
}

function NSSelectItem(text, pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnSelectItem)
                    g_pvliteInstanceArray[i].OnSelectItem(text);
            }
        }
    } else {
        if (this.pvObj.OnSelectItem)
            this.pvObj.OnSelectItem(text);
    }
}

function NSLoadComplete(pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnLoadComplete)
                    g_pvliteInstanceArray[i].OnLoadComplete();
            }
        }
    } else {
        if (this.pvObj.OnLoadComplete)
            this.pvObj.OnLoadComplete();
    }
}

function NSSelectInstance(text, pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnSelectInstance)
                    g_pvliteInstanceArray[i].OnSelectInstance(text);
            }
        }
    } else {
        if (this.pvObj.OnSelectInstance)
            this.pvObj.OnSelectInstance(text);
    }
}


function NSDeSelectInstance(text, pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnDeSelectInstance)
                    g_pvliteInstanceArray[i].OnDeSelectInstance(text);
            }
        }
    } else {
        if (this.pvObj.OnDeSelectInstance)
            this.pvObj.OnDeSelectInstance(text);
    }
}

function NSDeSelect(text, pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnDeSelect)
                    g_pvliteInstanceArray[i].OnDeSelect(text);
            }
        }
    } else {
        if (this.pvObj.OnDeSelect)
            this.pvObj.OnDeSelect(text);
    }
}

function NSDeSelectAll(pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnDeSelectAll)
                    g_pvliteInstanceArray[i].OnDeSelectAll();
            }
        }
    } else {
        if (this.pvObj.OnDeSelectAll)
            this.pvObj.OnDeSelectAll();
    }
}

function NSBeginSelect(pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnBeginSelect)
                    g_pvliteInstanceArray[i].OnBeginSelect();
            }
        }
    } else {
        if (this.pvObj.OnBeginSelect)
            this.pvObj.OnBeginSelect();
    }
}


function NSEndSelect(pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnEndSelect)
                    g_pvliteInstanceArray[i].OnEndSelect();
            }
        }
    } else {
        if (this.pvObj.OnEndSelect)
            this.pvObj.OnEndSelect();
    }
}

function NSBeginInstance(pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnBeginInstance)
                    g_pvliteInstanceArray[i].OnBeginInstance();
            }
        }
    } else {
        if (this.pvObj.OnBeginInstance)
            this.pvObj.OnBeginInstance();
    }
}

function NSInstance(id, name, parent, pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnInstance)
                    g_pvliteInstanceArray[i].OnInstance(id, name, parent);
            }
        }
    } else {
        if (this.pvObj.OnInstance)
            this.pvObj.OnInstance(id, name, parent);
    }
}

function NSEndInstance(pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnEndInstance)
                    g_pvliteInstanceArray[i].OnEndInstance();
            }
        }
    } else {
        if (this.pvObj.OnEndInstance)
            this.pvObj.OnEndInstance();
    }
}

function NSBeginViewState() {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnBeginViewState)
                    g_pvliteInstanceArray[i].OnBeginViewState();
            }
        }
    } else {
        if (this.pvObj.OnBeginViewState)
            this.pvObj.OnBeginViewState();
    }
}

function NSEndViewState() {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnEndViewState)
                    g_pvliteInstanceArray[i].OnEndViewState();
            }
        }
    } else {
        if (this.pvObj.OnEndViewState)
            this.pvObj.OnEndViewState();
    }
}

function NSAddViewState(name, type, pvApi) {
    if (_isIE_pvlaunch) {
        for (i = 0; i < g_pvliteInstanceArray.length; ++i) {
            if (pvApi == g_pvliteInstanceArray[i].pvId) {
                if (g_pvliteInstanceArray[i].OnAddViewState)
                    g_pvliteInstanceArray[i].OnAddViewState(name, type);
            }
        }
    } else {
        if (this.pvObj.OnAddViewState)
            this.pvObj.OnAddViewState(name, type);
    }
}


function NS6callback() {
    this.OnLoadComplete = NSLoadComplete;
    this.OnSelectInstance = NSSelectInstance;
    this.OnDeSelectInstance = NSDeSelectInstance;
    this.OnSelectItem = NSSelectItem;
    this.OnSelect = NSSelect;
    this.OnDeSelect = NSDeSelect;
    this.OnDeSelectAll = NSDeSelectAll;
    this.OnBeginSelect = NSBeginSelect;
    this.OnEndSelect = NSEndSelect;
    this.OnBeginViewState = NSBeginViewState;
    this.OnEndViewState = NSEndViewState;
    this.OnAddViewState = NSAddViewState;
}
// ----END: extensions/ptc-creo-view-extension/ui/creoview/pvlaunch.js

// ----BEGIN: extensions/ptc-creo-view-extension/ui/creoview/creoview.runtime.js
/* bcwti
 *
 * Copyright (c) 2015, 2017, 2019 PTC Inc.
 *
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * PTC Inc. and is subject to the terms of a software license agreement.
 * You shall not disclose such confidential information and shall use
 * it only in accordance with the terms of the license agreement.
 *
 * ecwti
 */

/* var s_runtimePluginVersion = "12.1.0.31"; */

TW.Runtime.Widgets.creoview = function() {
    var thisWidget = this;
    var baseUrl = './';
    thisWidget.selectedRows = [];
    thisWidget.selectedInstances = [];
    var appliedFormatter = false;
    var formatter = thisWidget.getProperty('DataFormatter');
    this.BackgroundStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('BackgroundStyle', ''));
    var OccurrenceIdField = thisWidget.getProperty('OccurrenceField');
    if (!OccurrenceIdField) {
        OccurrenceIdField = 'treeId';
    }
    var localData;
    var dataLoadtimeoutCancelId;
    var deselectCancelId;
    var cancelEndViewState;
    var instancesPromise = $.Deferred();
    var dataPromise = $.Deferred();
    var viewStateOptions = [];
    var viewableOptions = [];

    thisWidget.setFormatter = function(f) {
        formatter = f;
    };

    thisWidget.resetPromises = function() {
        //Use promises to process the formatter to know when 2 async tasks are done
        jQuery.when(dataPromise, instancesPromise).done(applyFormatterWithDebounce);
    };
    thisWidget.resetPromises();

    /**
     * Creoview only accepts hex colors, this converts rgb to hex
     */
    function rgb2hex(red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1);
    }

    thisWidget.applyFormatter = function() {
        dataLoadtimeoutCancelId = null;
        if (localData && localData.length > 0 && formatter && thisWidget.pvApi) {

            for (var i = 0; i < localData.length; i++) {
                if (appliedFormatter) {
                    //In case the model has already set colors based, reset them
                    thisWidget.pvApi.RestoreInstanceColor(getCachedOccurrencePath(localData[i]));
                    thisWidget.pvApi.SetInstanceTransparency(getCachedOccurrencePath(localData[i]), 1.0);
                }
                var formatResult = TW.getStyleFromStateFormatting({DataRow: localData[i], StateFormatting: formatter});
                if (formatResult.foregroundColor) {
                    appliedFormatter = true;
                    var color, alpha, fgColor = formatResult.foregroundColor;

                    if (fgColor.charAt(0) === '#') {
                        color = fgColor.substring(1);
                    }
                    else if (fgColor.indexOf('rgb') === 0) {
                        var colorParams = fgColor.substring(fgColor.indexOf("(") + 1, fgColor.length - 1).split(',');
                        color = rgb2hex(colorParams[0], colorParams[1], colorParams[2]);
                        if (colorParams[3]) {
                            alpha = parseFloat(colorParams[3], 10);
                            if (alpha >= 0 && alpha <= 1) {
                                thisWidget.pvApi.SetInstanceTransparency(getCachedOccurrencePath(localData[i]), alpha);
                            }
                        }
                    }
                    if (color) {
                        thisWidget.pvApi.SetInstanceColor(getCachedOccurrencePath(localData[i]), color);
                    }
                }
            }
        }
    };
    /**
     * Apply the formatter later as the model is being loaded at the same time
     */
    function applyFormatterWithDebounce() {
        if (dataLoadtimeoutCancelId) {
            clearTimeout(dataLoadtimeoutCancelId);
        }
        dataLoadtimeoutCancelId = setTimeout(thisWidget.applyFormatter, 100);
    }

    this.runtimeProperties = function() {
        return {
            'needsDataLoadingAndError': false
        };
    };

    this.renderHtml = function() {
        var html = '';
        /*jshint multistr: true */
        html = '<div class="widget-content widget-creoview" style="display:block;">\
                    <div class="creo-view-plugin-wrapper"></div>\
                       <!--div align="center">\
                          <table class="creoview-toolbar">\
                             <tr>\
                                <td><img src="/Thingworx/Runtime/images/restore.gif" name="resetView" alt="Reset view"/></td>\
                                <td><img src="/Thingworx/Runtime/images/zoom_selected.gif" name="showsel" alt="Zoom Select"/></td>\
                                <td><img src="/Thingworx/Runtime/images/zoom_all.gif" name="fitall" alt="Zoom To Window"/></td>\
                                <td><img src="/Thingworx/Runtime/images/hide_selected.gif" name="Hide_Selected" alt="Hide Mode"/></td>\
                                <td><img src="/Thingworx/Runtime/images/show_all.gif" name="Show_All" alt="Show All"/></td>\
                             </tr>\
                          </table>\
                       </div -->\
                       <div style="display:none"> <span class="viewStateOptions"> </span>\
                       <span class="viewableOptions"> </span>\
                       </div>\
                    </div>\
                 </div>';
        return html;
    };

    this.afterRender = function() {
        if (TW.restoreNativeHTMLElement) {
            TW.restoreNativeHTMLElement();
        }
        baseUrl = thisWidget.getProperty('BaseUrl');
        SetPvBaseUrl(baseUrl);
        thisWidget.productToView = thisWidget.getProperty('ProductToView');

        var infoTableValue = thisWidget.getProperty('SelectedParts');
        if (infoTableValue === undefined) {
            var infoTableValue = undefined;
            TW.Runtime.GetDataShapeInfo("Selection", function (info) {
                dataShapeInfo = info;

                // create empty infotable
                var infoTable = {
                    'dataShape': dataShapeInfo,
                    'name': 'SelectedParts',
                    'description': 'all the selected parts in the session',
                    'rows': []
                };
                thisWidget.setProperty('SelectedParts', infoTable);
            });
        }
        if (thisWidget.productToView) {
            thisWidget.updatePVHtml();
        }
        /*
         thisWidget.jqElement.find('img[name="Hide_Selected"]').click(function() {
         thisWidget.pvApi.HideInstancesAndDescendants(thisWidget.selectedInstances);
         });
         thisWidget.jqElement.find('img[name="resetView"]').click(function() {
         thisWidget.pvApi.ShowAll();
         thisWidget.pvApi.RestoreAllLocations();
         thisWidget.pvApi.ZoomToAll(10);
         });
         thisWidget.jqElement.find('img[name="showsel"]').click(function() {
         thisWidget.pvApi.ZoomToSelected(0);
         });
         thisWidget.jqElement.find('img[name="fitall"]').click(function() {
         thisWidget.pvApi.ZoomToAll(10);
         });
         thisWidget.jqElement.find('img[name="Show_All"]').click(function() {
         thisWidget.pvApi.ShowAll();
         });
         */
    };

    function getCachedOccurrencePath(row) {
        if (!row._cachedOccurrencePath) {
            return thisWidget.constructIdPath(row);
        }
        return row._cachedOccurrencePath;
    }

    this.getIndex = function(value) {
        if (!value || !localData) {
            return;
        }
        var i = localData.length;
        while (i--) {
            if (getCachedOccurrencePath(localData[i]) === value || localData[i][OccurrenceIdField] === value) {
                return i;
            }
        }
    };

    function throwUpdateSelectedInstances() {
        if (thisWidget.selectedInstances.length > 0) {
            thisWidget.setProperty('selectedOccurrencePath', thisWidget.selectedInstances[thisWidget.selectedInstances.length - 1]);
        }
        else {
            thisWidget.setProperty('selectedOccurrencePath', '');
        }
        thisWidget.jqElement.triggerHandler('selectionChanged');
    }

    function updateSelectionTimeout() {
        if (deselectCancelId) {
            clearTimeout(deselectCancelId);
            deselectCancelId = null;
        }
        deselectCancelId = setTimeout(function() {
            throwUpdateSelectedInstances();
            thisWidget.updateSelection('Data', thisWidget.selectedRows);
        }, 50);
    }

    this.updatePVHtml = function() {
        var productToView = thisWidget.productToView;
        if (productToView) {
            var Viewable = thisWidget.Viewable = thisWidget.getProperty('Viewable');
            var pluginId = thisWidget.getProperty('Id') + "-plugin";

            thisWidget.ViewState = thisWidget.getProperty('ViewState');
            thisWidget.ViewStateType = thisWidget.getProperty('ViewStateType');

            var creoViewParams = new CreoViewParametersObj();
            creoViewParams.edurl = productToView;
            creoViewParams.urlbase = thisWidget.getProperty('BaseUrl');
            creoViewParams.urltemplate = thisWidget.getProperty('TemplateUrl');
            creoViewParams.viewableoid = thisWidget.getProperty('ViewableOid');
            creoViewParams.mapurl = thisWidget.getProperty('MapUrl');
            creoViewParams.getmarkupurl = thisWidget.getProperty('GetMarkupUrl');
            creoViewParams.modifymarkupurl = thisWidget.getProperty('ModifyMarkupUrl');
            creoViewParams.modifymarkupparam = thisWidget.getProperty('ModifyMarkupParam');
            creoViewParams.thumbnailView = "true";
            creoViewParams.renderatstartup = "true";

            creoViewParams.renderannotation = thisWidget.getProperty('AnnotationSetName');



            if (productToView.indexOf("/servlet") > 0) {
                //Set the template param to allow fetching the child files
                if (!creoViewParams.urlbase) {
                    baseUrl = productToView.substring(0, productToView.indexOf("/servlet"));
                }
                if (!creoViewParams.urltemplate) {
                    creoViewParams.urltemplate = baseUrl + '/servlet/WindchillAuthGW/com.ptc.wvs.server.util.WVSContentHelper/redirectDownload/FILENAME_KEY?HttpOperationItem=OID1_KEY&amp;ContentHolder=OID2_KEY&amp;u8=1';
                }
            }

            var htmlToWrite = ProductView(creoViewParams, true, pluginId, false);
            thisWidget.pvApi = g_pvliteInstanceArray[g_pvliteInstanceArray.length - 1];

            thisWidget.jqElement.find('.creo-view-plugin-wrapper').html(htmlToWrite);

            thisWidget.pvApi.OnSelectInstance = function(value) {
                var infoTableValue = thisWidget.getProperty('SelectedParts');
                if (infoTableValue.rows == undefined)
                    infoTableValue.rows = [];
                infoTableValue.rows.push({ 'idPath': value });
                thisWidget.setProperty('SelectedParts', infoTableValue);
                thisWidget.selectedInstances.push(value);
                var index = thisWidget.getIndex(value);
                if (typeof index === 'number') {
                    thisWidget.selectedRows.push(index);
                }
                updateSelectionTimeout();
            };

            thisWidget.pvApi.OnDeSelectInstance = function(value) {
                var infoTableValue = thisWidget.getProperty('SelectedParts');
                if (infoTableValue.rows == undefined)
                    infoTableValue.rows = [];
                for (var i=0;i<infoTableValue.rows.length;++i) {
                    if (infoTableValue.rows[i].idPath == value) {
                        infoTableValue.rows.splice(i, 1);
                    }
                }
                thisWidget.setProperty('SelectedParts', infoTableValue);
                var index = thisWidget.selectedInstances.indexOf(value);
                if (index >= 0) {
                    thisWidget.selectedInstances.splice(index, 1);
                }
                thisWidget.selectedRows.splice(thisWidget.selectedRows.indexOf(index), 1);
                updateSelectionTimeout();
            };


            thisWidget.pvApi.OnAddViewState = function(name, type) {
                viewStateOptions.push({name: name, type: type});

                if (cancelEndViewState) {
                    //Simple debounce
                    clearTimeout(cancelEndViewState);
                }
                //did not see the endViewState called reliably, making sure its called
                cancelEndViewState = setTimeout(thisWidget.OnEndViewState, 10);
            };

            thisWidget.OnEndViewState = function() {
                cancelEndViewState = -1;
                if (viewStateOptions.length > 0) {
                    var html = '<select><option selected>Select a View</option>';
                    for (var i = 0, l = viewStateOptions.length; i < l; i++) {
                        var o = viewStateOptions[i];
                        html += '<option name="" value="' + o.name + ',' + o.type + '">' + o.name + '</option>';
                }
                    html += '</select>';
                    thisWidget.jqElement.find('.viewStateOptions').html(html);
                    thisWidget.jqElement.find('.viewStateOptions select').change(function(ev) {
                        var el = ev.currentTarget;
                        if (el.value) {
                            var vals = el.value.split(',');
                            thisWidget.ViewState = vals[0];
                            thisWidget.ViewStateType = vals[1];

                setTimeout(function () {
                                thisWidget.pvApi.SetViewState(thisWidget.ViewState, thisWidget.ViewStateType);
                            }, 1);
                        }
                    });
                }
            };

            thisWidget.pvApi.OnDeSelectAll = function(value) {
                //console.log("Deselected all", value, thisWidget.selectedRows);
                var infoTableValue = thisWidget.getProperty('SelectedParts');
                if (infoTableValue) {
                    infoTableValue.rows = [];
                    thisWidget.setProperty('SelectedParts', infoTableValue);
                }
                thisWidget.selectedInstances.splice(0, thisWidget.selectedInstances.length);
                thisWidget.selectedRows.splice(0, thisWidget.selectedRows.length);
                updateSelectionTimeout();
            };

            thisWidget.pvApi.OnLoadComplete = function() {
                instancesPromise.resolve();



                thisWidget.pvApi.ListViewStates();

                if (thisWidget.ViewState) {
                    thisWidget.pvApi.SetViewState(thisWidget.ViewState, thisWidget.ViewStateType);
                }

                if (typeof thisWidget.Viewable !== 'undefined') {


                    thisWidget.pvApi.LoadViewable(thisWidget.Viewable);
                        }

                thisWidget.addViewables();
            };

            thisWidget.addViewables = function() {
                thisWidget.pvApi.ListInstances();
                var numViewables = thisWidget.pvApi.GetNumOfViewables();
                if (numViewables > 0) {
                    var html = '<select><option selected>Select a Viewable</option>';

                    for (i = 0; i < numViewables; i++) {
                        html += '<option name="" value="' + i + '">' + thisWidget.pvApi.GetViewableName(i) + '</option>';
                    }
                    html += '</select>';

                    thisWidget.jqElement.find('.viewableOptions').html(html);

                    thisWidget.jqElement.find('.viewableOptions select').change(function(ev) {
                        var el = ev.currentTarget;
                        if (typeof el.value !== 'undefined') {
                            thisWidget.Viewable = parseInt(el.value, 10);
                            setTimeout(function () {
                                thisWidget.pvApi.LoadViewable(thisWidget.Viewable);
                            }, 1);
                    }
                    });
                }
            };

            if (thisWidget.BackgroundStyle) {
                thisWidget.updateBGColor();
            }
        }
    };

    this.updateProperty = function(updatePropertyInfo) {
        //console.log("update property" , updatePropertyInfo.TargetProperty);
        this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
        switch (updatePropertyInfo.TargetProperty) {
            case 'ProductToView':
            {
                instancesPromise = $.Deferred();
                thisWidget.resetPromises();
                thisWidget.productToView = thisWidget.getProperty('ProductToView');
                if (thisWidget.pvApi && thisWidget.productToView) {
                    thisWidget.pvApi.LoadModel(thisWidget.productToView);
                }
                else if (thisWidget.productToView) {
                    thisWidget.updatePVHtml();
                }
                break;
            }
            case 'ViewState':
            case 'ViewStateType':
            {
                thisWidget.ViewState = thisWidget.getProperty('ViewState');
                thisWidget.ViewStateType = thisWidget.getProperty('ViewStateType');
                if (thisWidget.pvApi) {
                    thisWidget.pvApi.ListViewStates(); //Needs to be called to allow states to be set
                    if (thisWidget.ViewState) {
                        thisWidget.pvApi.SetViewState(thisWidget.ViewState, thisWidget.ViewStateType);
                                }
                            }
                break;
                        }
            case 'Viewable':
            {
                thisWidget.Viewable = thisWidget.getProperty('Viewable');
                if (thisWidget.pvApi) {
                    thisWidget.pvApi.LoadViewable(thisWidget.Viewable);
                }
                break;
            }
            case 'Data':
            {
                if (dataPromise.state() === "resolved") {
                    dataPromise = $.Deferred();
                    thisWidget.resetPromises();
                }
                localData = updatePropertyInfo.ActualDataRows;
                if (localData && localData.length > 0) {
                    dataPromise.resolve(localData);
                    var i = localData.length;
                    while (i--) {
                        localData[i]._cachedOccurrencePath = null;
                    }
                }

                break;
            }
            case 'SelectedParts': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                var localSelectedParts = updatePropertyInfo.ActualDataRows;

                if (localSelectedParts.length == 0) { // Nothing selected, clear selection
                    thisWidget.selectedInstances = [];
                    thisWidget.pvApi.DeSelectAll();
                    return;
                }

                var selInstances = [];

                for (var i=0;i<thisWidget.selectedInstances.length;++i) {
                    var idx = -1;
                    for (var ii=0;ii<localSelectedParts.length;++ii) {
                        if (localSelectedParts[ii]['idPath'] == thisWidget.selectedInstances[i])
                            idx = 0;
                }

                    if (idx == -1) { // Deselect currently selected parts not in new selection list
                        thisWidget.pvApi.DeSelectInstance(thisWidget.selectedInstances[i]);
                    } else {
                        selInstances.push(thisWidget.selectedInstances[i]);
                }
            }

                var infoTableValue = thisWidget.getProperty('SelectedParts');
                infoTableValue.rows = [];

                for (var i=0;i<localSelectedParts.length;++i) {
                    var idx = thisWidget.selectedInstances.indexOf(localSelectedParts[i]['idPath']);
                    if (idx == -1) { // If new selection list is not in current selection list select the parts
                        selInstances.push(localSelectedParts[i]['idPath']);
                        thisWidget.pvApi.SelectInstance(localSelectedParts[i]['idPath']);
                }
                    infoTableValue.rows.push({ 'idPath': localSelectedParts[i]['idPath'] });
                    console.log("Selection: " + localSelectedParts[i]['idPath']);
            }

                thisWidget.selectedInstances = selInstances.slice(0);
                thisWidget.setProperty('SelectedParts', infoTableValue);
                break;
            }
            case 'BackgroundStyle':
            {
                thisWidget.BackgroundStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('BackgroundStyle', ''));


                thisWidget.updateBGColor();
            }

        }
    };

    this.getParentRow = function(id) {
        var parent;
        if (!localData) {
            return;
        }

        var i = localData.length;
        while (i--) {
            if (localData[i].objectId === id) {
                return localData[i];
            }
        }

        return null;
    };

    this.constructIdPath = function(row) {
        var id = row[OccurrenceIdField] + '';
        if (id.charAt(0) === '/') {
            return id;
        }
        var parent = row;
        var count = 0;
        while (parent && id.charAt(0) !== '/' && count++ < 100) {
            id = '/' + id;
            parent = this.getParentRow(parent.parentId);
            if (parent) {
                var pid = parent[OccurrenceIdField];
                if (pid !== '/' && pid) {
                    id = pid + id;
                }
            }
        }
        row._cachedOccurrencePath = id;
        return id;
    };

    this.handleSelectionUpdate = function(propertyName, selectedRows, selectedRowIndices) {
        //console.log("handle selection updates", selectedRows, selectedRowIndices);
            if (thisWidget.pvApi) {
                thisWidget.pvApi.DeSelectAll();
            }
            thisWidget.selectedInstances.splice(0, thisWidget.selectedInstances.length);
            var i = selectedRowIndices.length;
            while (i--) {
                var id = getCachedOccurrencePath(localData[selectedRowIndices[i]]);
                thisWidget.selectedInstances.push(id);
                if (thisWidget.pvApi) {
                    thisWidget.pvApi.SelectInstance(id);
                }
            }
            throwUpdateSelectedInstances();

    };

    this.updateBGColor = function() {
        var color = thisWidget.BackgroundStyle.backgroundColor;
        if (color && color.charAt(0) === '#') {
            color = color.substring(1);
            color = '0x00' + color + ':0x00' + color;
            //Delay the setting to allow the plugin to initially load
            setTimeout(function() {
                thisWidget.pvApi.SetBackgroundColor(color);
            }, 100);
        }
    };

    this.beforeDestroy = function() {
        if (thisWidget.jqElement) {
            thisWidget.jqElement.find('img').unbind('click');
        }
        if (thisWidget.pvApi) {
            thisWidget.pvApi.OnEndInstance = null;
            thisWidget.pvApi.OnLoadComplete = null;
            thisWidget.pvApi.OnInstance = null;
            thisWidget.pvApi.OnDeSelectAll = null;
            thisWidget.pvApi.OnDeSelectInstance = null;
            thisWidget.pvApi.OnSelectInstance = null;
        }
        thisWidget.reverseidMap = null;
        localData = dataPromise = instancesPromise = thisWidget = formatter = null;
    };
};
// ----END: extensions/ptc-creo-view-extension/ui/creoview/creoview.runtime.js

// ----BEGIN: extensions/ptc-identity-provider-authenticator-extension/ui/ThingWorxAuthenticationTimeoutHandler/ptc-auth.js
/**
 * Thingworx ajax failure session timeout authentication plugin
 *
 */
(function($, win) {
    var loggingIn = false;
    var parkedRequests = [];
    var loginWindow;

    function resumeCalls() {
        for (var i = 0, l = parkedRequests.length; i < l; i++) {
            var req = parkedRequests[i];
            $.ajax(req);
        }
        parkedRequests.splice(0, parkedRequests.length);
    }

    function needsLogin(req) {
        return (req.getResponseHeader('X-Thingworx-Auth') === 'failed');
    }

    $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
        if (needsLogin(jqxhr)) {
            if (!loggingIn) {
                loggingIn = true;
                loginWindow = win.open("../extensions/Runtime/ptcauth/loginSuccess.html?c="+Date.now(), "Login Window", "width=800,height=600,resizable,scrollbars=yes,status=1");
            }
            parkedRequests.push(settings);
        }
    });

    win._PTCLoginSuccess = function() {
        if (loggingIn) {
            loggingIn = false;
            resumeCalls();
        }
        if (loginWindow) {
            loginWindow.close();
        }
    }
    win.mashupName = ''; //Workaround twx error in error handler, remove when fixed
})(jQuery, window);
// ----END: extensions/ptc-identity-provider-authenticator-extension/ui/ThingWorxAuthenticationTimeoutHandler/ptc-auth.js

// ----BEGIN: extensions/ptc-item-identity-widget/ui/item-identity-widget/item-identity-widget.config.js
(function (TW) {
    let widgetName = "item-identity-widget";
    let defaultValue = {};

    let config = {
        //elementName control the Type property and the widget
        // name which will be display on the composer.
        // It must be the same as the web element name
        "elementName": "item-identity",
        "htmlImports": [
            {
                "id": "item-identity",
                "url": "item-identity/item-identity.js",
                "version": "^1.0.0"
            }
        ],
        "properties": {
            // Properties definitions settings.
            // Can change from here the default properties values.
            "Label": {
                "baseType": "STRING",
                "isBindingTarget": true
            },
            "Hidden": {
                "baseType": "BOOLEAN",
                "isBindingTarget": false,
                "defaultValue": false
            },
            "Configuration": {
                "baseType":"JSON",
                "isBindingTarget":true,
                "isVisible": false,
                "defaultValue": JSON.stringify(defaultValue)
            },
            "InputData": {
                "baseType":"STRING",
                "isBindingTarget":true
            },
            "TailoringName": {
                "baseType":"STRING",
                "isBindingTarget":true
            }
        },
        "flags": {
            "customEditor": "ItemIdentityCustomEditor",
            "customEditorMenuText": getLocalizedString("[[PTC.ItemIdentity.ConfigureAttributes]]"),
            "name": getLocalizedString("[[PTC.ItemIdentityComponent.Name]]"),
            "description": getLocalizedString("[[PTC.ItemIdentity.ToolTip]]"),
            "supportsAutoResize": true,
            "category": ["Beta"]
        },
        // Concatenating widgetName to rootPath to find the ui files
        // Should be the same as the widget name
        "widgetName": "item-identity-widget",
        "extensionName": "ptcs-widget-ext",
        "rootPath": "/Thingworx/Common/extensions/ptc-item-identity-widget/ui/",
        "imports": {
            "item-identity": "../../../extensions/item-identity/item-identity.js"
        }
    };


    // Temporary widgetWrapper if not initialized
    TW.Widget.widgetWrapper = TW.Widget.widgetWrapper || {
        imports: [],
        configs: {},
        loadImports: function (imports) {
            this.imports.push(imports);
        },
        config: function (name, config) {
            if (config) {
                this.configs[name] = config;
            }
            return this.configs[name];
        }
    };

    TW.Widget.widgetWrapper.config(widgetName, config);
})(TW);

function getLocalizedString(inputString) {

    //To get the localized string for the key
    var localizedName = "";
    if ((inputString !== null) &&(inputString !== undefined)) {
        var TW = window.TW || {};
        localizedName = TW.Runtime.convertLocalizableString(inputString);
    }
    //If localized value not found, return label as is
    localizedName = (localizedName !== "" && localizedName !== "???") ? localizedName : inputString;
    return localizedName;
};
// ----END: extensions/ptc-item-identity-widget/ui/item-identity-widget/item-identity-widget.config.js

// ----BEGIN: extensions/ptc-item-identity-widget/ui/item-identity-widget/item-identity-widget.customdialog.ide.js
TW.IDE.Dialogs.ItemIdentityCustomEditor = function (){

    var self = this;
    /*******************************************
     * Set the following parameters according to your Component
     ********************************************/
    this.componentName = "PTC.ItemIdentity";
    this.defaultConfigurationName = "Default";
    //Set the following to something other then Configuration only for debugging
    this.configurationPropertyName = "Configuration";
    //*******************************************/

    this.initialConfiguration = {name:this.defaultConfigurationName, delta:{}};

    /**
     * Update the configuration property once "done" is clicked.
     * @param widgetObj - the widget object
     * @returns {boolean}
     */
    this.updateProperties = function(widgetObj) {
        var namedConfiguratoinComponent = $('#' + this.jqElementId + ' #named-configuration-component')[0];
        var configuration = namedConfiguratoinComponent.selectedConfiguration;

        widgetObj.setProperty(this.configurationPropertyName,
            configuration || widgetObj.getProperty(this.configurationPropertyName));

        return true;
    };

    /**
     * Calculates the HTML code for the configuration dialog.
     * @param widgetObj - the widget object
     * @returns {string}
     */
    this.renderDialogHtml = function (widgetObj) {
        var properties = widgetObj.properties;
        if (properties[this.configurationPropertyName] != null &&
            properties[this.configurationPropertyName] != undefined ){
            let configurationJson =
                (Object.prototype.toString.call(properties[this.configurationPropertyName]) === "[object String]" ?
                    JSON.parse(properties[this.configurationPropertyName]) : properties[this.configurationPropertyName]);
            if (configurationJson.name != undefined){
                this.initialConfiguration.name = configurationJson.name;
                if (configurationJson.delta != undefined){
                    this.initialConfiguration.delta = configurationJson.delta;
                }
            }
        }
        var html = '<div>' +
            '<named-config id="named-configuration-component" component-name="'+this.componentName +'"' +
            '></named-config>' +
            '<div>';
        return html;
    };

    /**
     * Running after the HTML code from "renderDialogHtml" has rendered to the DOM.
     * Used to bind code to specific events pushed from the dialog HTML code.
     * @param domElementId
     */
    this.afterRender = function(domElementId) {
        this.jqElementId = domElementId;
        let jqComponent = $('#' + this.jqElementId + ' #named-configuration-component');
        jqComponent[0].selectedConfiguration = this.initialConfiguration;
        jqComponent.on('verified-changed',
            function(event){
                $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',!event.originalEvent.detail.value)
            }
        );
        $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',
            !jqComponent[0].verified);

    }
};
// ----END: extensions/ptc-item-identity-widget/ui/item-identity-widget/item-identity-widget.customdialog.ide.js

// ----BEGIN: extensions/ptc-item-identity-widget/ui/item-identity-widget/item-identity-widget.runtime.js
(function (widgetName, isIDE) {
  let widgets = isIDE ? TW.IDE.Widgets : TW.Runtime.Widgets;
  widgets[widgetName] = function () {
    let config = TW.Widget.widgetWrapper.config(widgetName);
    TW.Widget.widgetWrapper.inject(config.elementName, this, config, isIDE);

    //[ custom code

    //]
  };

  let config = TW.Widget.widgetWrapper.config(widgetName); // = config;
  TW.Widget.widgetWrapper.loadImports(config.imports);
})("item-identity-widget", false);
// ----END: extensions/ptc-item-identity-widget/ui/item-identity-widget/item-identity-widget.runtime.js

// ----BEGIN: extensions/ptc-list-shuttle-widget/ui/listshuttle/listshuttle.runtime.js
TW.Runtime.Widgets.listshuttle = function () {
    "use strict";
    var thisWidget = this,
    	scrollBarWidth = null,
        leftGrid,
        rightGrid,
        valueFieldName = undefined,
        displayFieldName = undefined,
        leftRowData = undefined,
        rightRowData = new Array(),
        leftInitialItems = undefined,
        eventNs,
		maxNumAttributes,
		keys = {},
		timeStampBefore = {},
		prevKey = {},
        isMultiselect = false,
        domElementIdOfLeftList,
        domElementIdOfRightList
   
    this.runtimeProperties = function () {
        var props = {
            'needsDataLoadingAndError': true
        };
        return props;
    };

    this.renderHtml = function () {
        var html = '';
	        html = '<div class="widget-content widget-listshuttle data-nodata" >'
			+ '<div class="listshuttle-wrapper">'
			+ '<div class="leftlist-container">' + '</div>'
            + '<div class="shuttle-button-container">'
			+ '<button class="shuttle-button-moveToRight">' + '</button>'
			+ '<button class="shuttle-button-moveToLeft">' + '</button>' + '</div>'
			+ '<div class="rightlist-container">' + '</div>'
			+ '<div class="shuttle-button-container">'
			+ '<button class="shuttle-button-up">' + '</button>'
			+ '<button class="shuttle-button-down">' + '</button>' + '</div>'
			+ '</div>' + '</div>'; 
        return html;
    };
    
    // http://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
    // scrollbarWidth = offsetWidth - clientWidth - getComputedStyle().borderLeftWidth - getComputedStyle().borderRightWidth
    // I'm getting the approximately value here because of the complexity of the grid components we are using, should accurate enough
    this.getScrollBarWidth = function(){
        if(!scrollBarWidth){
          var inner = document.createElement('p');
          inner.style.width = "100%";
          inner.style.height = "200px";

          var outer = document.createElement('div');
          outer.style.position = "absolute";
          outer.style.top = "0px";
          outer.style.left = "0px";
          outer.style.visibility = "hidden";
          outer.style.width = "200px";
          outer.style.height = "150px";
          outer.style.overflow = "hidden";
          outer.appendChild(inner);

          document.body.appendChild(outer);
          var w1 = inner.offsetWidth;
          outer.style.overflow = 'scroll';
          var w2 = inner.offsetWidth;
          if (w1 == w2) w2 = outer.clientWidth;

          document.body.removeChild(outer);

          scrollBarWidth = w1 - w2;
        }
        return scrollBarWidth;
    };

    this.afterRender = function () {
        // dhtmlxgrid needs an ID to work off of ... we will create an ID based
		// on the ID of the widget itself and pass that to dhtmlxgrid
        var widgetElement = thisWidget.jqElement;
        var domElementId = thisWidget.jqElementId;
        eventNs = thisWidget.jqElementId;
        var ListLabelStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListLabelStyle', 'DefaultWidgetLabelStyle'));
        var ListLabel = TW.getStyleCssTextualNoBackgroundFromStyle(ListLabelStyle);
        var ListLabelSize = TW.getTextSize(ListLabelStyle.textSize);
        var ListLabelAlignment = this.getProperty('LabelAlignment', 'left');
		var ListLabelStyleBlock =
            '<style>' +
                '#' + domElementId + '-bounding-box .runtime-widget-label { '+ ListLabel + ListLabelSize + ' text-align: ' + ListLabelAlignment + ' }' +
            '</style>';

		$(ListLabelStyleBlock).prependTo(widgetElement);

        domElementIdOfLeftList = domElementId + '-leftlist';
        domElementIdOfRightList = domElementId + '-rightlist';
 
        if (thisWidget.getProperty('MultiSelect')) {
	            isMultiselect = true;
	    };
            
        var rowHeight = this.getProperty('RowHeight') || 30;

        valueFieldName = this.getProperty('ValueField');
        displayFieldName = this.getProperty('DisplayField');
        if (valueFieldName === undefined) {
            valueFieldName = displayFieldName;
        }
		var formatListBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListBackgroundStyle', 'ShuttleListBackgroundStyle'));
		var formatListItemResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemStyle', 'PTC.AccessApp.NormalTextStyle'));
		var formatListItemAlternateResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemAlternateStyle', 'DefaultListItemAlternateStyle'));
		var formatListItemHoverResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemHoverStyle', 'DefaultListItemHoverStyle'));
		var formatListItemSelectedResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemSelectedStyle', 'DefaultListItemSelectedStyle'));

		var cssListBackground = TW.getStyleCssGradientFromStyle(formatListBackgroundResult);
		var cssListBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListBackgroundResult);
		var cssListBackgroundBorder = TW.getStyleCssBorderFromStyle(formatListBackgroundResult);
		var cssListItem = TW.getStyleCssGradientFromStyle(formatListItemResult);
		var cssListItemText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemResult);
        var cssListItemTextSize = TW.getTextSize(formatListItemResult.textSize);
        var cssListItemBorder = TW.getStyleCssBorderFromStyle(formatListItemResult);
		var cssListItemAlternate = TW.getStyleCssGradientFromStyle(formatListItemAlternateResult);
		var cssListItemAlternateText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemAlternateResult);
		var cssListItemHover = TW.getStyleCssGradientFromStyle(formatListItemHoverResult);
		var cssListItemHoverText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemHoverResult);
		var cssListItemSelected = TW.getStyleCssGradientFromStyle(formatListItemSelectedResult);
		var cssListItemSelectedText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemSelectedResult);

		var styleBlock =
			'<style>' +
				//these styles are for the widget in list mode
                '#' + domElementId + ' .listshuttle-wrapper{' + cssListBackgroundBorder + '}' +
				'#' + domElementId + ' .gridbox { ' + cssListBackground + cssListBackgroundText + ' } ' +
				'#' + domElementId + ' .obj td { ' + cssListItem + cssListItemText + cssListItemTextSize + cssListItemBorder + 'border-top: none; border-left: none; border-right: none; } ' +
				'#' + domElementId + ' .obj tr.even td {'+ cssListItemAlternate + cssListItemAlternateText +'}' +
				'#' + domElementId + ' .obj tr:hover td {'+ cssListItemHover + cssListItemHoverText +'}' +
				'#' + domElementId + ' .obj tr.rowselected td {'+ cssListItemSelected + cssListItemSelectedText +'}' +
                '</style>';

		$(styleBlock).prependTo(widgetElement);

        thisWidget.jqElement.find('.leftlist-container').attr('id', domElementIdOfLeftList);
        thisWidget.jqElement.find('.rightlist-container').attr('id', domElementIdOfRightList);
        
        var colModel = [];
        var colFormat = thisWidget.getProperty('ListFormat');
        var alignment = thisWidget.getProperty('Alignment');
        
        var gridHeader = '';
        var gridInitWidths = '';
        var gridColAlign = '';
        var gridColTypes = '';
        var gridColSorting = '';
        var nColumns = 0;

        if (displayFieldName !== undefined) {
            if (colFormat === undefined) {
                var overallWidth = this.getProperty('Width');
                gridHeader += '';
                gridInitWidths += '*';
                colModel.push({ name: displayFieldName, width: 'auto', label: displayFieldName, sortable: false, formatoptions: {renderer: "DEFAULT" }});
                gridColAlign += alignment;
                gridColTypes += 'twcustom';
                gridColSorting += 'str';
                nColumns++;
            } else {
                var thisWidth = 100;
                colModel.push({ name: displayFieldName, label: '', width: thisWidth, align: alignment, sortable: false, formatoptions: colFormat });
                gridHeader += '';
                gridInitWidths += '*';
                gridColAlign += alignment;
                gridColTypes += 'twcustom';
                gridColSorting += 'str';
                nColumns++;
            }
        } else {
            gridHeader = "Must select DisplayField";
            gridInitWidths = "*";
            gridColAlign = "left";
            gridColTypes = "ro";
            gridColSorting = "str";
        }
        const timeoutForWaitingDblClickFromUser = 250;
        leftGrid = new dhtmlXGridObject(domElementIdOfLeftList);
        leftGrid.enableKeyboardSupport(true);
        leftGrid._colModel = colModel;
        leftGrid.setImagePath("/Thingworx/Common/dhtmlxgrid/codebase/imgs/");

        leftGrid.setHeader(gridHeader);
        leftGrid.setInitWidths(gridInitWidths);
        leftGrid.setColAlign(gridColAlign);
        leftGrid.setColTypes(gridColTypes);
        leftGrid.setCustomSorting(sortStringAscending);					// custom in-house sorting method
        leftGrid.setNoHeader(true);
        leftGrid.init();
        leftGrid.setAwaitedRowHeight(rowHeight);
		leftGrid.enableAlterCss('even', 'uneven');
        leftGrid.adjustColumnSize(0);
        // to avoid scroll-down step on last-in-view cell/row selection
        leftGrid.dhtmlXGridMoveToVisible = leftGrid.moveToVisible;
        leftGrid.moveToVisible = function(cell){
            leftGrid.clickTimer = setTimeout(function() { leftGrid.dhtmlXGridMoveToVisible(cell); }, timeoutForWaitingDblClickFromUser);
            return true;
        };
        leftGrid.enableMultiselect(isMultiselect);

        rightGrid = new dhtmlXGridObject(domElementIdOfRightList);
        rightGrid.enableKeyboardSupport(true);
        rightGrid._colModel = colModel;
        rightGrid.setImagePath("/Thingworx/Common/dhtmlxgrid/codebase/imgs/");

        rightGrid.setHeader(gridHeader);
        rightGrid.setInitWidths(gridInitWidths);
        rightGrid.setColAlign(gridColAlign);
        rightGrid.setColTypes(gridColTypes);
        rightGrid.setColSorting(gridColSorting);
        rightGrid.setNoHeader(true);
        rightGrid.init();
        rightGrid.setAwaitedRowHeight(rowHeight);
		rightGrid.enableAlterCss('even', 'uneven');
        rightGrid.adjustColumnSize(0);
        // to avoid scroll-down step on last-in-view cell/row selection
        rightGrid.dhtmlXGridMoveToVisible = rightGrid.moveToVisible;
        rightGrid.moveToVisible = function(cell){
            rightGrid.clickTimer = setTimeout(function() { rightGrid.dhtmlXGridMoveToVisible(cell); }, timeoutForWaitingDblClickFromUser);
            return true;
        };
        rightGrid.enableMultiselect(isMultiselect);


        disableReorderButtons(true, true);
        disableMovedButtons(true, true);
	    
	    thisWidget.jqElement.find('.shuttle-button-up').click(function() {
			var selectedId = rightGrid.getSelectedRowId();
			if(selectedId == null){
				return;
			}
			var selectedRowIndex = rightGrid.getRowIndex(selectedId);
			var selectedRow = rightRowData[selectedRowIndex];
			var oneUpIndex = selectedRowIndex-1;
			var oneUpRow = rightRowData[oneUpIndex];
			rightRowData[selectedRowIndex] = oneUpRow;
			rightRowData[oneUpIndex] = selectedRow;
			rightGrid.clearAll();
			rightGrid.parse(rightRowData, "custom_tw");
			rightGrid.selectRow(oneUpIndex,false, false, true, false);
            thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });
		});

		thisWidget.jqElement.find('.shuttle-button-down').click(function() {
			var selectedId = rightGrid.getSelectedRowId();
			if(selectedId == null){
				return;
			}
			var selectedRowIndex = rightGrid.getRowIndex(selectedId);
			var selectedRow = rightRowData[selectedRowIndex];
			var oneDownIndex = selectedRowIndex+1;
			var oneDownRow = rightRowData[oneDownIndex];
			rightRowData[selectedRowIndex] = oneDownRow;
			rightRowData[oneDownIndex] = selectedRow;
			rightGrid.clearAll();
			rightGrid.parse(rightRowData, "custom_tw");
			rightGrid.selectRow(oneDownIndex,false, false, true, false);
			thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });
			});
            
        thisWidget.jqElement.find('.shuttle-button-moveToRight').click(function() {
			var selectedId = leftGrid.getSelectedRowId();
			return moveRowFromLeftGridToRightGrid(selectedId);
		});
        
         thisWidget.jqElement.find('.shuttle-button-moveToLeft').click(function() {
			var selectedId = rightGrid.getSelectedRowId();
			return moveRowFromRightGridToLeftGrid(selectedId);
		});
        
		var leftDblClickFlag = false;									// 'semaphore' to avoid entering DblClick callback on quick multi clicks in 'available attributes' list
        leftGrid.attachEvent("onRowDblClicked", function(rId,cInd){
            clearTimeout(leftGrid.clickTimer);
            return moveRowFromLeftGridToRightGrid(rId);

        });
        
        var rightDblClickFlag = false;									// 'semaphore' to avoid entering DblClick callback on quick multi clicks in 'selected attributes' list 
		rightGrid.attachEvent("onRowDblClicked", function(rId,cInd){
            clearTimeout(rightGrid.clickTimer);
            return moveRowFromRightGridToLeftGrid(rId);
        });
        
        function moveRowFromLeftGridToRightGrid(rId){
        	if(rId<0 || rId==undefined )   // legality checks
        		return;		
			if(leftDblClickFlag == false)								// skip further operations if still handling previous dblClick 
        	{
				//the user can choose limitted number of attributes
				if (rightGrid.rowsBuffer.length < maxNumAttributes || maxNumAttributes == undefined ) { // =undefined: in apps that we don't want to limit the user
                    leftDblClickFlag = true;								// set flag up
                    var selectedRowIndicesAndIds = [[]];
                    var selectedRowIds = rId.toString().split(',');
                    // add left list selection to right list
                    for (var i = 0; i < selectedRowIds.length; i++) {
                        var rowIndex = leftGrid.getRowIndex(selectedRowIds[i]);
                        rightRowData.push(leftRowData[rowIndex]);
                        var row = rightGrid._prepareRow(selectedRowIds[i]);
                        rightGrid.rowsBuffer._dhx_insertAt(rightRowData.length - 1, processCustomTwRow(rightGrid, row, leftRowData[rowIndex]));
                        rightGrid._insertRowAt(row, rightRowData.length - 1);
                        rightGrid.selectRowById(selectedRowIds[i], true, true, true);
                        selectedRowIndicesAndIds[i] = [rowIndex, selectedRowIds[i]];
                    }

                    //remove left list selection from left list
                    deleteRemovedRows(leftGrid, leftRowData, selectedRowIndicesAndIds);

                    thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });  

					leftDblClickFlag = false;								// set flag down
					//set the length of the right list as parameter in the listShuttle
					thisWidget.setProperty('RightListLength', rightGrid.rowsBuffer.length);
                    if (maxNumAttributes != undefined && rightGrid.rowsBuffer.length >= maxNumAttributes) {
                        thisWidget.jqElement.find('.leftlist-container').addClass("disabled");
                    }

				//display an information msg to the user that he can't choose more attributes!
				} else {
					thisWidget.setProperty('RightListLength', -1);
				}

			}
		}

        function moveRowFromRightGridToLeftGrid(rId) {
        	if(rId<0 || rId==undefined)   // legality checks
        		return;
            if(rightDblClickFlag == false)								// skip further operations if still handling previous dblClick
			{
                rightDblClickFlag = true;								// set flag up
                var selectedRowIndicesAndIds = [[]];
                var selectedRowLabelsData = [];
                var selectedRowIds = rId.toString().split(',');
	        	// add right list selection to left list
                for (var i = 0; i < selectedRowIds.length; i++) {
                    var rowIndex = rightGrid.getRowIndex(selectedRowIds[i]);
                    leftRowData.push(rightRowData[rowIndex]);
                    let labelData = rightRowData[rowIndex];
                    labelData["index"] = rowIndex;
                    selectedRowLabelsData.push(labelData);
                    selectedRowIndicesAndIds[i] = [rowIndex, selectedRowIds[i]];
                }
                
	        	leftRowData.sort(sortStringAscending);
                selectedRowLabelsData.sort(sortStringAscending);
                for (var i = 0; i < selectedRowLabelsData.length; i ++) {
                    //find the index of the row that the user returned to the left Grid (the grid is sorted)
                    for (var j = 0; j < leftRowData.length; j ++) {
                        if (selectedRowLabelsData[i].label == leftRowData[j].label) {
                            var row = leftGrid._prepareRow(selectedRowIds[i]);
                            leftGrid.rowsBuffer._dhx_insertAt(j, processCustomTwRow(leftGrid, row, rightRowData[selectedRowLabelsData[i].index]));
                            leftGrid._insertRowAt(row, j);
                            leftGrid.selectRowById(selectedRowIds[i], true, true, true);
                            break;
                        }
                    }
                }
                //remove right list selection from right list
                deleteRemovedRows(rightGrid, rightRowData, selectedRowIndicesAndIds);

	            thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });
                disableMovedButtons(false, true);
                
	            rightDblClickFlag = false;								// set flag down
				//set the number of selected attributes
				thisWidget.setProperty('RightListLength', rightGrid.rowsBuffer.length);
                if (rightGrid.rowsBuffer.length < maxNumAttributes) {
                    thisWidget.jqElement.find('.leftlist-container').removeClass("disabled");
                }
			}
        }

         function deleteRemovedRows(grid, RowData, selectedRowIndicesAndIds) {
            selectedRowIndicesAndIds.sort(function(a, b) {return a[0] - b[0]});
            for (var i = selectedRowIndicesAndIds.length - 1 ; i >= 0; i--) {
                RowData.splice(selectedRowIndicesAndIds[i][0], 1);
                grid.deleteRow(selectedRowIndicesAndIds[i][1]);
                delete grid.rowsAr[selectedRowIndicesAndIds[i][1]];
            }
        }

        leftGrid.attachEvent("onKeyPress", function (code, ctrlFlag, shiftFlag, keyboardEvent) {
                return onKeyPress(code, ctrlFlag, shiftFlag, keyboardEvent, leftGrid)
        });

        rightGrid.attachEvent("onKeyPress", function (code, ctrlFlag, shiftFlag, keyboardEvent) {
                return onKeyPress(code, ctrlFlag, shiftFlag, keyboardEvent, rightGrid)
        });

        const timeForWaitingUserNextPress = 1800;
        function onKeyPress(code, ctrlFlag, shiftFlag, keyboardEvent, grid) {
            var key = keyboardEvent.key.toUpperCase();
            //only if the key isnn't one of the special keys that we have a different behaviour for them.
            if(["ARROWDOWN", "DOWN", "ARROWUP", "UP", "PAGEDOWN", "PAGEUP", "END", "HOME", "SHIFT"].indexOf(key) < 0 && !ctrlFlag ) {
                let gridId = grid.entBox.id;
                var timeStampCur = keyboardEvent.timeStamp;
                var isFound = false;
                if (timeStampCur - timeStampBefore[gridId] < timeForWaitingUserNextPress) {
                    keys[gridId] += key;
                } else {
                    keys[gridId] = key;
                }

                var rowTitle, i;
                var index = grid.getSelectedRowId().toString().split(',');
                var indexSelected = grid.getRowIndex(index[index.length - 1]);
                if (prevKey[gridId] == key && keys[gridId].length <= 2) {
                    indexSelected++;
                    keys[gridId] = key;
                }
                /*in case the grid is unoserted, we can't only jump to the next row.
                we need to look for the index of the following row starting with the key we have.*/
                i = findNextRowIndexForPrefix(grid, indexSelected, grid.rowsBuffer.length, keys[gridId]);
                if(i < 0 ) {
                    //finding if there exists a row above the selected row. 
                    i = findNextRowIndexForPrefix(grid, 0, indexSelected, keys[gridId]);
                    if (i > -1) {
                        isFound = true;
                    }
                } else {
                    isFound = true;
                }

                if(isFound) {
                    grid.selectRow(i, false, false, true, false);
                } else {
                    keys[gridId] = "";
                }
                //saving the params for the next function call.
                prevKey[gridId] = key;
                timeStampBefore[gridId] = timeStampCur;
            }
            //for saving on all the regular functionalities ('page down', 'page up', 'down', 'up', 'tab', 'home' and 'end')
            return true;
        }
        
        function findNextRowIndexForPrefix(grid, indexStart, indexEnd, prefix) {
            var index = -1;
            for(let i = indexStart ; i < indexEnd; i ++) {
                let rowTitle = grid.rowsBuffer[i].textContent.toUpperCase();
                if (rowTitle.substring(0, prefix.length) === prefix){
                    index = i;
                    break;
                }
            }
            return index;
        }

        leftGrid.attachEvent("onMouseOver", function(id,ind){
            var cell = this.cellById(id, ind);
            $(cell.cell).attr('title', cell.getValue());
        });

        rightGrid.attachEvent("onMouseOver", function(id,ind){
            var cell = this.cellById(id, ind);
            $(cell.cell).attr('title', cell.getValue());
        });

        rightGrid.attachEvent('onSelectStateChanged', function(id, ind) {
			var rowIndex = rightGrid.getRowIndex(id);
			// ignoreSelectionChanges is set to true while we're internally manipulating selected rows
			if (!thisWidget.ignoreSelectionChanges) {
				validateReorderButtons(rowIndex);
                var isDisabledMoveLeftBtn = id != null ? false : true;
                disableMovedButtons(true, isDisabledMoveLeftBtn);
                leftGrid.clearSelection();
                //updating the length of the rightGrid in case it is set to be the '-2' flag
                thisWidget.setProperty('RightListLength', rightGrid.rowsBuffer.length);
			}
		});
        
        leftGrid.attachEvent('onSelectStateChanged', function(id, ind) {
			// ignoreSelectionChanges is set to true while we're internally manipulating selected rows
			if (!thisWidget.ignoreSelectionChanges ) {
                var isDisabledMoveRightBtn = true;
                if (id != null) {
                    var selectedRowIds = id.toString().split(',');
                    isDisabledMoveRightBtn = (rightGrid.rowsBuffer.length + selectedRowIds.length <= maxNumAttributes || maxNumAttributes == undefined ) ? false : true;
                    //the '-2' is the flag for the case the user selectes in the left grid more rows than the right grid can to contained.
                    var length = !isDisabledMoveRightBtn ||  rightGrid.rowsBuffer.length >= maxNumAttributes? rightGrid.rowsBuffer.length : -2;   
                    thisWidget.setProperty('RightListLength', length);
                }
               disableMovedButtons(isDisabledMoveRightBtn, true);
               disableReorderButtons(true, true);
               rightGrid.clearSelection();
			}
		});
        
		function validateReorderButtons(rowIndex) {
			var lastRowIndex = rightGrid.getRowsNum() - 1;
			// only 1 row, disable both buttons
			if (lastRowIndex == 0) {
				disableReorderButtons(true, true);
				return;
			}
			switch (rowIndex) {
			// no row selected, disable both buttons
			case -1:
				disableReorderButtons(true, true);
				break;
			// top row selected, disable up button
			case 0:
				disableReorderButtons(true, false);
				break;
			// last row selected, disable down button
			case lastRowIndex:
				disableReorderButtons(false, true);
				break;
			default:
				disableReorderButtons(false, false);
			}
		}
		
		function disableReorderButtons(upButtonDisabled, downButtonDisabled) {
			thisWidget.jqElement.find('.shuttle-button-up').prop('disabled',
					upButtonDisabled);
			thisWidget.jqElement.find('.shuttle-button-down').prop('disabled',
					downButtonDisabled);
		}
        
        function disableMovedButtons(leftButtonDisabled, rightButtonDisabled) {
            thisWidget.jqElement.find('.shuttle-button-moveToRight').prop('disabled',
					leftButtonDisabled);
			thisWidget.jqElement.find('.shuttle-button-moveToLeft').prop('disabled',
					rightButtonDisabled);
		}
        
        // special function for parsing the data from Thingworx back-end
        leftGrid._process_custom_tw = rightGrid._process_custom_tw = function (data) {
            this._parsing = true;
            var rows = data;                  // get all row elements from data
            for (var i = 0; i < rows.length; i++) {
                var id = this.getUID();                                // XML doesn't have native ids, so custom ones will be generated
                this.rowsBuffer[i] = {                                   // store references to each row element
                    idd: id,
                    data: rows[i],
                    _parser: this._process_custom_tw_row   // cell parser method
                    //_locator: this._get_custom_tw_data        // data locator method
                };
                this.rowsAr[id] = rows[i];                             // store id reference
            }
            //set the number of selected attributes when the mashup loads.
            var len = rightGrid.rowsBuffer.length;
            thisWidget.setProperty('RightListLength', len);

			this.render_dataset();                                   // force update of grid's view after data loading
            this._parsing = false;
        }

    // special function for parsing each row of the data from Thingworx back-end
    leftGrid._process_custom_tw_row = rightGrid._process_custom_tw_row = function (r, data) {
            return processCustomTwRow(this, r,data);
        }
        };
    
    function processCustomTwRow(grid, r, data) {
        var colModel = grid._colModel;
        var strAr = [];
        var maxWidthCell = leftGrid.cellWidthPX;
        var textWidth = leftGrid.fontWidth;
        var ellipsis = "...";
        
        for (var i = 0; i < colModel.length; i++) {
            strAr.push({ Value: data[colModel[i].name], leftRowData: data, ColumnInfo: colModel[i], RowHeight: grid._srdh });
        }
        //calculating the max length of the attribute according the size their padding and the scrollBar width (assume that will be a scrollBar ..)
        var maxLengthDataLabel = (maxWidthCell - thisWidget.getScrollBarWidth() - colModel[0].padding) / textWidth;
        
        // set just a plain array as no custom attributes are needed
        r._attrs = {};
        for (let j = 0; j < r.childNodes.length; j++) {
            r.childNodes[j]._attrs = {};
            //set a tooltip for long length attributes.
            if (data.label.length > maxLengthDataLabel) {
                strAr[j].Value = data.label.substring(0, maxLengthDataLabel - ellipsis.length) + ellipsis;
            }
        }
        // finish data loading 
        grid._fillRow(r, strAr);
        r.cells[0].firstChild.title = data.label;
        return r;
    }

    this.updateProperty = function(updatePropertyInfo) {
		var thisWidget = this;
		if (updatePropertyInfo.TargetProperty === "LeftListData") {
			thisWidget.lastDatashape = updatePropertyInfo.DataShape;
			leftRowData = updatePropertyInfo.ActualDataRows;
			leftGrid.clearAll();
			if (displayFieldName !== undefined && displayFieldName.length > 0) {
				leftRowData.sort(sortStringAscending);
				leftGrid.parse(leftRowData, "custom_tw");
				if (leftInitialItems === undefined) {
					// set initial available items in property
					leftInitialItems = leftRowData.slice();
					thisWidget.setProperty('AvailableItems', {
						dataShape : {
							fieldDefinitions : thisWidget.lastDatashape
						},
						rows : leftInitialItems
					});
				}
			}
			// remove items from left list contained in right list
			removeCommonItemsFromLeftList();

            // update the 'disabled' style according the length of the right list.
            if (maxNumAttributes != undefined && rightGrid.rowsBuffer.length >= maxNumAttributes) {
                thisWidget.jqElement.find('.leftlist-container').addClass("disabled");
                len = -1;
            } else {
                thisWidget.jqElement.find('.leftlist-container').removeClass("disabled");
            }

            //select by default the first row in the list.
            leftGrid.selectRow(0 ,false, false, true, false);
		} else if (updatePropertyInfo.TargetProperty === "RightListData") {
			rightRowData = updatePropertyInfo.ActualDataRows;
			thisWidget.setProperty('SelectedItems', {
				dataShape : {
					fieldDefinitions : updatePropertyInfo.DataShape
				},
				rows : rightRowData
			});
			rightGrid.clearAll();
			if (displayFieldName !== undefined && displayFieldName.length > 0) {
				rightGrid.parse(rightRowData, "custom_tw");
			}
			// remove items from left list contained in right list
			removeCommonItemsFromLeftList();
		}
		//set the value of the maximum number of attributes the user can select.
		//(just in the apps we want to limit, otherwise, this parameter isn't binded and it stays with undefined value).
		else if (updatePropertyInfo.TargetProperty === "MaxAttributesToSelect") {
			thisWidget.setProperty('MaxAttributesToSelect', updatePropertyInfo.SinglePropertyValue);
			maxNumAttributes = thisWidget.getProperty("MaxAttributesToSelect");
		}
	};

    this.beforeDestroy = function () {
        try {
            leftRowData = null;
            rightRowData = null;
            if (leftGrid !== undefined && leftGrid !== null) {
                leftGrid.destructor();
                leftGrid = null;
            }
            if (rightGrid !== undefined && rightGrid !== null) {
            	rightGrid.destructor();
            	rightGrid = null;
            }
        }
        catch (destroyErr) {
        }
    };
    
    // characters in order for special sorting with special-signs at beginning, then digits, then abc ascending
	var  sorting_order = ',-;:!?()@*/\#`%+[]{}<>$_.^&=|~01234567989abcdefghijklmnopqrstuvwxyz';

    // custom method for sorting:
    // sort alphabetically (ignore case) in ascending order according to defined (sorting_order) order string
	function sortStringAscending(a, b) {

		// ignoring case
		var a_low = a[displayFieldName].toLowerCase();
		var b_low = b[displayFieldName].toLowerCase();

		// compare to index in 'special order' sorting
        var index_a = sorting_order.indexOf(a_low[0]);
        var index_b = sorting_order.indexOf(b_low[0]);
        
        // same first character, sort regularly (ASCII)
        if (index_a === index_b) {
            if (a_low < b_low) {
                return -1;
            } else if (a_low > b_low) {
                return 1;
            }
            return 0;
        } else {
        	return  (index_a - index_b) > 0 ? 1 : -1;
        }

	}

	function removeDuplicates(a, b) {
		b = b.filter(function(item) {
			for (var i = 0, len = a.length; i < len; i++) {
				if (a[i][valueFieldName] === item[valueFieldName]) {
					return false;
				}
			}
			return true;
		});
		return b;
	}
	
	function removeCommonItemsFromLeftList() {
		if (leftRowData != undefined && rightRowData != undefined){
			var leftListNoDuplicates = removeDuplicates(rightRowData, leftRowData);
			leftRowData = leftListNoDuplicates;
			leftGrid.clearAll();
			leftGrid.parse(leftRowData, "custom_tw");
		}
	}
       
};
// ----END: extensions/ptc-list-shuttle-widget/ui/listshuttle/listshuttle.runtime.js

// ----BEGIN: extensions/ptc-named-config-widget/ui/named-config/named-config.config.js
(function (TW) {
  let widgetName = "named-config";
  let config = {
                  //elementName control the Type property and the widget
                  // name which will be display on the composer.
                  // It must be the same as the web element name
                "elementName": "named-config",
                "htmlImports": [
                  {
                    "id": "named-config",
                    "url": "named-config/named-config.js",
                    "version": "^1.0.0"
                  }
                ],
                "properties": {
                    // Properties definitions settings.
                    "ComponentName": {
                        "baseType": "STRING",
                        "isBindingTarget": true,
                        "isEditable": true
                    },

                    "SelectedConfiguration": {
                        "baseType": "JSON",
                        "isBindingSource": true,
                        "isBindingTarget": true,
                        "isEditable": true
                    },
                    "Verified": {
                        "baseType": "BOOLEAN",
                        "isBindingSource": true,
                        "isBindingTarget": false,
                        "defaultValue": false,
                        "isEditable": false
                    }
                },
                  // Concatenating widgetName to rootPath to find the ui files
                  // Should be the same as the widget name
                "widgetName": "named-config",
                "extensionName": "ptcs-widget-ext",
                "rootPath": "/Thingworx/Common/extensions/named-config-widget/ui/",
                "imports": {
                  "named-config": "../../../extensions/named-config/named-config.js"
                }
              };

  // Temporary widgetWrapper if not initialized
  TW.Widget.widgetWrapper = TW.Widget.widgetWrapper || {
    imports: [],
    configs: {},
    loadImports: function (imports) {
      this.imports.push(imports);
    },
    config: function (name, config) {
      if (config) {
        this.configs[name] = config;
      }
      return this.configs[name];
    }
  };

  TW.Widget.widgetWrapper.config(widgetName, config);
})(TW);
// ----END: extensions/ptc-named-config-widget/ui/named-config/named-config.config.js

// ----BEGIN: extensions/ptc-named-config-widget/ui/named-config/named-config.runtime.js
(function (widgetName, isIDE) {
  let widgets = isIDE ? TW.IDE.Widgets : TW.Runtime.Widgets;
  widgets[widgetName] = function () {
    let config = TW.Widget.widgetWrapper.config(widgetName);
    TW.Widget.widgetWrapper.inject(config.elementName, this, config, isIDE);

    //[ custom code

    //]
  };

  let config = TW.Widget.widgetWrapper.config(widgetName); // = config;
  TW.Widget.widgetWrapper.loadImports(config.imports);
})("named-config", false);
// ----END: extensions/ptc-named-config-widget/ui/named-config/named-config.runtime.js

// ----BEGIN: extensions/ptc-navigate-framework-extension/ui/NavigateFramework_CssFiles/NavigateFramework_CssFiles.runtime.js
(function () {
    var addedDefaultStyles = false;

    TW.Runtime.Widgets.NavigateFramework_CssFiles = function () {
    };
}());
// ----END: extensions/ptc-navigate-framework-extension/ui/NavigateFramework_CssFiles/NavigateFramework_CssFiles.runtime.js

// ----BEGIN: extensions/PTC-Navigate-View-PLM-App-extension/ui/DynamicColumnsGrid/dynamicColumnsGrid.runtime.js
(function () {
    "use strict";
    var addedDefaultStyles = false;

	TW.Runtime.Widgets.dynamicColumnsGrid = function () {
	    var thisWidget = this,
          scrollBarWidth = null, // it holds the calculated scrollbar width
	        isAndroid = false, //TW.isAndroidDevice(),
	        currentDataInfo,
	        currentRows,
	        currentSortInfo,
		    hasBeenSorted = false,
	        colInfo = [],
	        updateCount = 0,
	        dynamicColumnsGrid,
	        currentFieldsString = '',
	        eventIds = [],
	        domElementIdOfDhxGrid,
	        showAllCols,
	        showDynamicColumns,
	        rowHeight,
	        autoWidthColumns = [],
	        gridHeader = '',
	        gridInitWidths = '',
	        gridColAlign = '',
	        gridColTypes = '',
	        gridColSorting = '',
	        nColumns = 0,
	        colModel = [],
	        isMultiselect = false,
	        selectedRowIndices = [],
	        topRow = 0,
		    expandGridToShowAllRows = false,
		    expandGridToShowAllColumns = false,
	        ignoreSelectionChanges = false,
		    isPrintLayout = false,
        	textSizeClass = undefined;
	
	    var initGrid = function () {
	        try {
	            destroyGrid();
                var formatGridHeaderResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridHeaderStyle', 'DefaultGridHeaderStyle'));
                var headerFontWidth = 7;
                if (thisWidget.getProperty('GridHeaderStyle') !== undefined) {
                    textSizeClass = TW.getTextSizeClassName(formatGridHeaderResult.textSize);
                    headerFontWidth = TW.getTextSizeFontWidth(formatGridHeaderResult.textSize);
                }
	
	            dynamicColumnsGrid = new dhtmlXGridObject(domElementIdOfDhxGrid);
                dynamicColumnsGrid.fontWidth = headerFontWidth;

	            dynamicColumnsGrid.enableKeyboardSupport(true);
	            dynamicColumnsGrid._colModel = colModel;
	            dynamicColumnsGrid.setImagePath("/Thingworx/Common/dhtmlxgrid/codebase/imgs/");
	            dynamicColumnsGrid.setHeader(gridHeader);
	            dynamicColumnsGrid.setInitWidths(gridInitWidths);
	            dynamicColumnsGrid.setColAlign(gridColAlign);
	            if (gridColTypes.length > 0) {
	                dynamicColumnsGrid.setColTypes(gridColTypes);
	            }
	            dynamicColumnsGrid.init();
	            dynamicColumnsGrid.setAwaitedRowHeight(rowHeight);
				dynamicColumnsGrid.enableAlterCss('even', 'uneven');
		        if( expandGridToShowAllRows ) {
			        if( expandGridToShowAllColumns )  {
				        dynamicColumnsGrid.enableAutoWidth(true);
			        }
			        dynamicColumnsGrid.enableAutoHeight(true);
		        }

		        if( expandGridToShowAllRows || thisWidget.getProperty("IsEditable") === true )  {
		            dynamicColumnsGrid.enableSmartRendering(false);
		        } else {
		            dynamicColumnsGrid.enableSmartRendering(true);
		        }

	            for (var i = 0; i < autoWidthColumns.length; i++) {
	                dynamicColumnsGrid.adjustColumnSize(autoWidthColumns[i]);
	            }
	
	            addCustomProcessing(dynamicColumnsGrid);
	
	            if (isAndroid) {
	                var nscrolls;
	                var changeIntervalId;
	
	                var handleScrollLeft = function () {
	                    var gridDomElem = dynamicColumnsGrid.objBox;
	                    var maxScrollPos = 0;
	                    var maxScrollAtATime = gridDomElem.clientWidth * .9;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollLeft - scrollAmt) < 0) {
	                        gridDomElem.scrollLeft = 0;
	                    } else {
	                        gridDomElem.scrollLeft = gridDomElem.scrollLeft - scrollAmt;
	                    }
	                };
	
	                var handleScrollRight = function () {
	                    var gridDomElem = dynamicColumnsGrid.objBox;
	                    var maxScrollPos = gridDomElem.scrollWidth - gridDomElem.clientWidth + 25;
	                    var maxScrollAtATime = gridDomElem.clientWidth * .9;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollLeft + scrollAmt) > maxScrollPos) {
	                        gridDomElem.scrollLeft = maxScrollPos;
	                    } else {
	                        gridDomElem.scrollLeft = gridDomElem.scrollLeft + scrollAmt;
	                    }
	                };
	
	                var handleScrollUp = function () {
	                    var gridDomElem = dynamicColumnsGrid.objBox;
	                    var maxScrollPos = 0;
	                    var maxScrollAtATime = gridDomElem.clientHeight * .9;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollTop - scrollAmt) < 0) {
	                        gridDomElem.scrollTop = 0;
	                    } else {
	                        gridDomElem.scrollTop = gridDomElem.scrollTop - scrollAmt;
	                    }
	                };
	
	                var handleScrollDown = function () {
	                    var gridDomElem = dynamicColumnsGrid.objBox;
	                    var maxScrollPos = gridDomElem.scrollHeight - gridDomElem.clientHeight + 25;
	                    var maxScrollAtATime = gridDomElem.clientHeight * .9;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollTop + scrollAmt) > maxScrollPos) {
	                        gridDomElem.scrollTop = maxScrollPos;
	                    } else {
	                        gridDomElem.scrollTop = gridDomElem.scrollTop + scrollAmt;
	                    }
	                };
	
	                thisWidget.jqElement.find('.grid-horz-left-all').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    dynamicColumnsGrid.objBox.scrollLeft = 0;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();
	                });
	
	                thisWidget.jqElement.find('.grid-vert-up-all').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    dynamicColumnsGrid.objBox.scrollTop = 0;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();
	                });
	
	                thisWidget.jqElement.find('.grid-vert-down-all').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    var gridDomElem = dynamicColumnsGrid.objBox;
	                    var maxScrollPos = gridDomElem.scrollHeight - gridDomElem.clientHeight + 25;
	                    gridDomElem.scrollTop = maxScrollPos;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();
	
	                });
	
	                thisWidget.jqElement.find('.grid-horz-right-all').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    var gridDomElem = dynamicColumnsGrid.objBox;
	                    var maxScrollPos = gridDomElem.scrollWidth - gridDomElem.clientWidth + 25;
	                    gridDomElem.scrollLeft = maxScrollPos;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();
	
	                });
	
	                thisWidget.jqElement.find('.grid-horz-left').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollLeft, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                });
	
	                thisWidget.jqElement.find('.grid-horz-right').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollRight, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                });
	
	                thisWidgetJqElem.find('.grid-vert-up').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollUp, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).click(handleScrollRight);
	
	                thisWidgetJqElem.find('.grid-vert-down').bind('touchstart.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollDown, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dynamicColumnsGridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                });
	            }


                thisWidget.jqElement.find('table.hdr td').addClass(textSizeClass);
	            dynamicColumnsGrid.setSizes();
	            updateCount = 0;
	        } catch (err) {
	            TW.log.error('Error initializing grid: "' + err + '"');
	        };
	
	    };
	
	    var addCustomProcessing = function (dynamicColumnsGrid) {
	        var evtId;
	
	        eventIds.push(dynamicColumnsGrid.attachEvent("onRowAdded", function (rid) {
	            TW.log.info('row added, rid: ' + rid.toString());
	        }));
	
	        eventIds.push(dynamicColumnsGrid.attachEvent("onRowCreated", function (rid, r) {
	            // the 6 is for padding and border
	            $(r).css({
	                'height': (rowHeight).toString() + 'px',
	                'overflow': 'hidden'
	            });
	        }));
	
	        eventIds.push(dynamicColumnsGrid.attachEvent("onRowDblClicked", function (rId, cInd) {
	            thisWidget.jqElement.triggerHandler('DoubleClicked');
	        }));
	
	        // same code in dhxlist and dynamicColumnsGrid ... update both in sync
	        eventIds.push(dynamicColumnsGrid.attachEvent("onKeyPress", function (code, cFlag, sFlag) {
	            //TW.log.info('onKeyPress, code: "' + code.toString() + '", cFlag:"' + cFlag.toString() + '", sFlag:"' + sFlag.toString() + '"');
	            switch (code) {
	                case 9: // tab
	                    return false;
	                    break;
	
	                case 36: //home
	                case 35: //end
	                    var pagingInfo = dynamicColumnsGrid.getStateOfView();
	                    var curTopRow = pagingInfo[0];
	                    var nRowsPerPage = pagingInfo[1];
	                    var nRowsTotal = pagingInfo[2];
	                    var rowToShow = curTopRow;
	
	                    if (code === 36) {
	                        rowToShow = 0;
	                    } else {
	                        rowToShow = nRowsTotal - 1;
	                    }
	                    if (rowToShow < 0) {
	                        rowToShow = 0;
	                    }
	                    if (rowToShow > (nRowsTotal - 1)) {
	                        rowToShow = (nRowsTotal - 1);
	                    }
	
	                    dynamicColumnsGrid.showRow(dynamicColumnsGrid.getRowId(rowToShow));
	
	                    return false;
	                    break;
	
	                case 33: //page up
	                case 34: //page down
	                    var pagingInfo = dynamicColumnsGrid.getStateOfView();
	                    var curTopRow = pagingInfo[0];
	                    var nRowsPerPage = pagingInfo[1]-1;
	                    var nRowsTotal = pagingInfo[2];
	                    var rowToShow = curTopRow;
		                //console.log('curTopRow: ' + curTopRow + ', nRowsPerPage: ' + nRowsPerPage + ', nRowsTotal: ' + nRowsTotal + ', rowToShow:' + rowToShow);
	                    if (rowToShow < 0) {
	                        rowToShow = 0;
	                    }
	                    if (rowToShow > (nRowsTotal - 1)) {
	                        rowToShow = (nRowsTotal - 1);
	                    }
	
	                    //TW.log.info('   curTopRow: ' + curTopRow.toString() + ', nRowsPerPage: ' + nRowsPerPage.toString() + ', nRowsTotal: ' + nRowsTotal.toString() + ', rowToShow: ' + rowToShow.toString());
	                    if (code === 33) {
	                        // page up
	                        rowToShow -= nRowsPerPage;
	                    } else {
	                        // page down
	                        rowToShow += nRowsPerPage * 2; // this is because the grid just barely scrolls the row into visibility ... it doesn't show that row
	                    }
	                    if (rowToShow < 0) {
	                        rowToShow = 0;
	                    }
	                    if (rowToShow > (nRowsTotal - 1)) {
	                        rowToShow = (nRowsTotal - 1);
	                    }
		                //console.log('     new rowToShow:' + rowToShow);
	                    dynamicColumnsGrid.showRow(dynamicColumnsGrid.getRowId(rowToShow));
	
	                    return false;
	                    break;
	
	            }
	
	            return true;
	        }));
	
	        eventIds.push(dynamicColumnsGrid.attachEvent('onSelectStateChanged', function (id, ind) {
	            if (!ignoreSelectionChanges) {
	                selectedRowIndices = [];
	                // select the rows that are selected ... if id is null, ignore this
	                if (id !== null && id !== undefined) {
	                    var selectedRowIds = id.split(',');
	                    for (var i = 0; i < selectedRowIds.length; i++) {
		                    var rowIndex = dynamicColumnsGrid.getRowIndex(selectedRowIds[i]);

		                    // look up the original row number in case we sorted this table
		                    var row = currentRows[rowIndex];
		                    var actualRowIndex = row._originalRowNumber;
	                        selectedRowIndices.push(actualRowIndex);
	                    }
	                }
	                // in case someone is working off of selected data
	                thisWidget.updateSelection('Data', selectedRowIndices);
	            }
	        }));
	
	        eventIds.push(dynamicColumnsGrid.attachEvent('onHeaderClick', onHeaderClickHandler));
	
	        eventIds.push(dynamicColumnsGrid.attachEvent("onScroll", function (sleft,stop) {
	            thisWidget.setProperty('CurrentScrollTop',dynamicColumnsGrid.getScrollTop());
	        }));
	
	        // special function for parsing the data from Thingworx back-end
	        dynamicColumnsGrid._process_custom_tw = function (data) {
	            this._parsing = true;
	            var rows = data;                  // get all row elements from data
	            for (var i = 0; i < rows.length; i++) {
	                var id = this.getUID();                                // XML doesn't have native ids, so custom ones will be generated
	                this.rowsBuffer[i] = {                                   // store references to each row element
	                    idd: id,
	                    data: rows[i],
	                    _parser: this._process_custom_tw_row   // cell parser method
	                    //_locator: this._get_custom_tw_data        // data locator method
	                };
	                this.rowsAr[id] = rows[i];                             // store id reference
	            }
	            this.render_dataset();                                   // force update of grid's view after data loading
	            this._parsing = false;
	        };
	
	        // special function for parsing each row of the data from Thingworx back-end
	        dynamicColumnsGrid._process_custom_tw_row = function (r, data,ind) {
	            var colModel = this._colModel;
	            var strAr = [];
	            for (var i = 0; i < colModel.length; i++) {
	                strAr.push({ RowIndex: ind, Value: data[colModel[i].name], RowData: data, ColumnInfo: colModel[i], RowHeight: rowHeight, RowFormat : thisWidget.getProperty('RowFormat'),RowStyle : thisWidget.getProperty('GridBackgroundStyle') });
	            }
	            // set just a plain array as no custom attributes are needed
	            r._attrs = {};
	
	            for (var j = 0; j < r.childNodes.length; j++) r.childNodes[j]._attrs = {};
	
	            // finish data loading
	            this._fillRow(r, strAr);
	            return r;
	        };
	    };
	
	    var destroyGrid = function () {
	        var i, nEventIds;
	        if (dynamicColumnsGrid !== undefined && dynamicColumnsGrid !== null) {
	            try {
	                nEventIds = eventIds.length;
	                for (i = 0; i < nEventIds; i += 1) {
	                    dynamicColumnsGrid.detachEvent(eventIds[i]);
	                }
	                if (isAndroid) { thisWidget.jqElement.find('*').unbind('.dynamicColumnsGridTouchEvents'); }
	                dynamicColumnsGrid.destructor();
	            }
	            catch (gridErr) {
	                TW.log.error('Error destroying grid ' + thisWidget.jqElementId);
	            }
	            dynamicColumnsGrid = null;
	        }
	    };
	
	    var toFieldsString = function (infoTableDataShape) {
	        var fldStr = '',
	            flds = 0;
	        for (var x in infoTableDataShape) {
	            flds += 1;
	            if (flds > 1) { fldStr += ','; }
	            fldStr += x;
	        }
	        return fldStr;
	    };
	
	    var selectGridRows = function (selectedRowIndices) {

		    // pretty easy and fast if the grid has not been sorted
		    if( !hasBeenSorted ) {
			    var nSelectedRows = selectedRowIndices.length;
			    for (var i = 0; i < nSelectedRows; i += 1) {

				    var rowToSelect = selectedRowIndices[i];

				    dynamicColumnsGrid.selectRow(rowToSelect,      // row index
					    false,                      // call onSelectChanged [seems to ignore this]
						    i === 0 ? false : true,     // preserve previously selected rows ... set to false on first call, true thereafter
						    i === 0 ? true : false);    // scroll row into view ... true on first call, false thereafter
			    }
		    } else {
			    // not so fast if we've been sorted ... the indices that come in
			    var nDataRows = currentRows.length;
			    for( var i=0; i<nDataRows; i++) {
				    var row = currentRows[i];
				    if(_.contains(selectedRowIndices,row._originalRowNumber))  {
					    // this row is selected

					    var isFirstSelection = false;
					    if( selectedRowIndices[0] === row._originalRowNumber) {
						    isFirstSelection = true;
					    }

					    dynamicColumnsGrid.selectRow(i,      // row index
						    false,                      // call onSelectChanged [seems to ignore this]
							    isFirstSelection ? false : true,     // preserve previously selected rows ... set to false on first call, true thereafter
							    isFirstSelection ? true : false);    // scroll row into view ... true on first call, false thereafter
				    }
			    }
		    }
	    };
	
	    var loadGrid = function (sortInd, updateSelection) {
	        var direction = 'asc',
	            nRows = currentRows.length,
	            row;
	        if (sortInd !== undefined) {
		        hasBeenSorted = true;
	            if (currentSortInfo !== undefined) {
	                if (currentSortInfo.ind === sortInd) {
	                    direction = (currentSortInfo.direction === 'asc' ? 'des' : 'asc');
	                    currentSortInfo = { ind: sortInd, direction: direction };
	                    currentRows.reverse();
	                } else {
	                    currentSortInfo = { ind: sortInd, direction: direction };
	                    sortCurrentRows();
	                }
	            } else {
	                currentSortInfo = { ind: sortInd, direction: direction };
                    sortCurrentRows();
	            }
	        } else {
	            if (currentSortInfo !== undefined) {
	                if (currentSortInfo.direction === 'asc') {
	                    sortCurrentRows();
	                } else {
	                    sortCurrentRows();
	                    currentRows.reverse();
	                }
	            }
	        }
	
	        dynamicColumnsGrid.clearAll();
	        dynamicColumnsGrid.parse(currentRows, "custom_tw");
	        if (currentSortInfo !== undefined) {
	            dynamicColumnsGrid.setSortImgState(true, currentSortInfo.ind, currentSortInfo.direction);
	        }
	
	        selectGridRows(selectedRowIndices);
	
	        if (updateSelection) {
	            thisWidget.updateSelection('Data', selectedRowIndices);
	        }

		    if( thisWidget.properties.ResponsiveLayout === true ) {
			    if( !(thisWidget.hasExtendColumnWaiting === true) ) {
				    thisWidget.hasExtendColumnWaiting = true;
				    setTimeout(function () {
					    try {
						    thisWidget.extendLastColum(thisWidget.jqElement.width());
						    thisWidget.hasExtendColumnWaiting = false;
					    } catch (err) {
					    }
				    }, 100);
			    }
		    }
		
	    };

	    var sortCurrentRows = function (){
	        // In case the selected column to sort by has HTML type we ovveride it with String type because the Array sort method can't handle HTML as the the base type.
	        var baseTypeForSort = colInfo[currentSortInfo.ind]['baseType'] === 'HTML' ? 'STRING' : colInfo[currentSortInfo.ind]['baseType'];
	        currentRows.sort(TW.createSorter(colInfo[currentSortInfo.ind]['name'], baseTypeForSort));
            
            // In case of HTML base type, reverse the order of the array after the sort so that the objects with HTML attribute appear at the the beginning.     
	        if (colInfo[currentSortInfo.ind]['baseType'] === 'HTML'){
	            currentRows.reverse();
	        } 
	    };
	
	    var onHeaderClickHandler = function (ind) {
	        loadGrid(ind, true /*updateSelection*/);
	        return false;
	    };
	
	    this.getUpdateCount = function () {
	        return updateCount;
	    };
	
	    this.runtimeProperties = function () {
	        return {
	            'needsDataLoadingAndError': true,
		        'supportsAutoResize': true,
	            'borderWidth': 0
	        };
	    };
	
	    this.renderHtml = function () {
	        var html = '';

		    if( $('#runtime-workspace').hasClass('print') && (this.properties.ResponsiveLayout === true)) {
			    this.setProperty('IsPrintLayout',true);
		    }

		    if( this.getProperty('IsPrintLayout') === true ) {
			    isPrintLayout = true;
			
			let CellTextWrapping = thisWidget.getProperty('CellTextWrapping');
	        if (CellTextWrapping === undefined) {
	            CellTextWrapping = false;
	        }
			
			    html = '<table cellpadding="0" cellspacing="0" class="widget-content widget-dynamicColumnsGrid ' + (CellTextWrapping === false ? '' : 'textwrap') + '">' +
				    '</table>';

			    return html;
		    }


	        html =
	            '<div class="widget-content widget-dynamicColumnsGrid data-nodata">'
					+ '<div class="dynamicColumnsGrid-wrapper">'
		                + '<div class="dhtmlxgrid-container" width="100%" height="100%">'
						+ '</div>'	
	                + '</div>'
	            + '</div>';
	        if (isAndroid) {
	            html =
	            '<div class="widget-content widget-dynamicColumnsGrid data-nodata">'
	                + '<div class="dhtmlxgrid-container-container">'
	                    + '<div class="dhtmlxgrid-container" width="100%" height="100%">'
	                    + '</div>'
	                + '</div>'
	                + '<table class="android-scrollbar" cellspacing="0" cellpadding="0">'
	                    + '<tr>'
	                        + '<td height="100%" width="15%"><span class="horz-btn grid-horz-left-all" ><span class="icon"></span></span></td>'
	                        + '<td height="100%" width="35%"><span class="horz-btn grid-horz-left" ><span class="icon"></span></span></td>'
	                        + '<td height="100%" width="35%"><span class="horz-btn grid-horz-right" ><span class="icon"></span></span></td>'
	                        + '<td height="100%" width="15%"><span class="horz-btn grid-horz-right-all"><span class="icon"></span></span></td>'
	                        + '<td><span class="grid-horz-right" width="25px"></span></td>'
	                    + '</tr>'
	                + '</table>'
	                + '<table class="android-scrollbar-vert" cellspacing="0" cellpadding="0">'
	                    + '<tr>'
	                        + '<td height="15%" valign="middle"><span class="vert-btn grid-vert-up-all"><span class="icon"></span></span></td>'
	                    + '</tr>'
	                    + '<tr>'
	                        + '<td height="35%"><span class="vert-btn grid-vert-up"><span class="icon"></span></span></td>'
	                    + '</tr>'
	                    + '<tr>'
	                        + '<td height="35%"><span class="vert-btn grid-vert-down"><span class="icon"></span></span></td>'
	                    + '</tr>'
	                    + '<tr>'
	                        + '<td height="15%"><span class="vert-btn grid-vert-down-all"><span class="icon"></span></span></td>'
	                    + '</tr>'
	
	                + '</table>'
	            + '</div>';
	
	        }
	        return html;
	    };

		this.buildHeaderRowHtml = function(infoTableDataShape) {
			var html = '';
			html +=
				'<thead>';

		    if( thisWidget.getProperty('ColumnDisplay') === 'showAllColumns' ) {
		        var renderer = TW.Renderer.DEFAULT;
                for (var fieldName in infoTableDataShape) {
					html += '<th><div class="print-header-cell">' + Encoder.htmlEncode(fieldName) + '</div></th>'
                }
		    } else {
		        var colFormat = thisWidget.getProperty('ColumnFormat');
		        if (colFormat !== undefined && colModel.length === 0) {
		            // translate our internal 'ColumnFormat' to the dhtmlxgrid's idea of a column model
		            for (var i = 0; i < colFormat.formatInfo.length; i++) {
		                var col = colFormat.formatInfo[i];
		                var thisWidth = 100;
		                if (col.Width === 'auto') {
		                    thisWidth = undefined;
		                } else {
		                    thisWidth = col.Width;
		                }
		                colModel.push({ name: col.FieldName, label: TW.Runtime.convertLocalizableString(col.Title), width: thisWidth, align: col.Align, formatoptions: col.FormatOptions, col: col });
		            }
		        }


				_.each(colModel,function(col) {
					html += '<th><div class="print-header-cell">' + Encoder.htmlEncode(col.label) + '</div></th>'
				});

		    }

			html +=
				'</thead>';

			return html;
		}

    // http://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
    // scrollbarWidth = offsetWidth - clientWidth - getComputedStyle().borderLeftWidth - getComputedStyle().borderRightWidth
    // I'm getting the approximately value here because of the complexity of the grid components we are using, should accurate enough
    this.getScrollBarWidth = function(){
        if(!scrollBarWidth){
          var inner = document.createElement('p');
          inner.style.width = "100%";
          inner.style.height = "200px";

          var outer = document.createElement('div');
          outer.style.position = "absolute";
          outer.style.top = "0px";
          outer.style.left = "0px";
          outer.style.visibility = "hidden";
          outer.style.width = "200px";
          outer.style.height = "150px";
          outer.style.overflow = "hidden";
          outer.appendChild(inner);

          document.body.appendChild(outer);
          var w1 = inner.offsetWidth;
          outer.style.overflow = 'scroll';
          var w2 = inner.offsetWidth;
          if (w1 == w2) w2 = outer.clientWidth;

          document.body.removeChild(outer);

          scrollBarWidth = w1 - w2;
        }
        return scrollBarWidth;
    };

	    this.afterRender = function () {

		    if( isPrintLayout ) {
			    return;
		    }

	        gridHeader = '';
	        gridInitWidths = '';
	        gridColAlign = '';
	        gridColTypes = '';
	        gridColSorting = '';
	        nColumns = 0;
	        colModel = [];
		    expandGridToShowAllRows = false;
		    expandGridToShowAllColumns = false;
		    if( thisWidget.getProperty('ExpandGridToShowAllRows')  === true ) {
			    expandGridToShowAllRows = true;
			    if( thisWidget.getProperty('ExpandGridToShowAllColumns')  === true ) {
				    expandGridToShowAllColumns = true;
			    }
		    }
	        showAllCols = thisWidget.getProperty('ColumnDisplay') === 'showAllColumns';
	        showDynamicColumns = thisWidget.getProperty('ColumnDisplay') === 'showDynamicColumns';
	        domElementIdOfDhxGrid = thisWidget.jqElementId + '-dynamicColumnsGrid';
	        thisWidget.jqElement.find('.dhtmlxgrid-container').attr('id', domElementIdOfDhxGrid);
	
		    thisWidget.jqElement.on('change','input.grid-cell-STRING,input.grid-cell-NUMBER,input.grid-cell-BOOLEAN,input.grid-cell-DATETIME',function(e) {
			    try {
				    var inputEl = $(e.target);
				    var cell = inputEl.closest('.widget-dynamicColumnsGrid-cell-editable');
				    var rowIndex = parseInt(cell.attr('row-index'));
				    var field = cell.attr('field-name');
                    let evalObjectScopeExpression = function(obj, expr) {
                        var introduceVarTemplate = "var $var_i$ = $val_i$;";
                        var introduceVars = "";
                        for (var key in obj)
                        {
                            introduceVars += introduceVarTemplate.replace("$var_i$", key).replace("$val_i$", "obj['"+key+"']");
                        }
                        var trenaryExpr = "(" + expr + ") ? true : false;";
                        return eval(introduceVars + trenaryExpr);
                    }

				    if( inputEl.hasClass('grid-cell-NUMBER')) {
					    var colFormat = cell.attr('col-format');
				    	try {

				    		var newNumber = parseFloat(inputEl.val());
				    		
				    		if(isNaN(newNumber))
				    			throw 'Cannot parse number ' + inputEl.val();
				    		
						    currentRows[rowIndex][field] = newNumber;
				    	}
				    	catch(err) {
						    TW.log.error(err);
				    	}
					    
					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));
							
							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}
							
					    	var validationResult = undefined;

                            validationResult = evalObjectScopeExpression(currentRows[rowIndex], validationExpression);

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;
					            
					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle + ";text-align:right;")
					            }
					            
					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;
					            
					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle + ";text-align:right;")
					            }
					            
					    		cell.attr('title',validationMessage);
					    		
		                        TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }
					    
					    inputEl.val(currentRows[rowIndex][field].format(colFormat));
				    } 
				    else if( inputEl.hasClass('grid-cell-DATETIME')) {
					    var colFormat = cell.attr('col-format');
					    
				    	try {
				    		var newDate = TW.DateUtilities.parseDate(inputEl.val(), 'yyyy-MM-dd HH:mm:ss');
				    		if (newDate == null)
				    			throw 'Cannot parse date ' + inputEl.val() + ' using format ' + colFormat;
				    		
						    currentRows[rowIndex][field] = newDate;
				    	}
				    	catch(err) {
						    TW.log.error(err);
				    	}
				    	
					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));
							
							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}
							
					    	var validationResult = undefined;

                            validationResult = evalObjectScopeExpression(currentRows[rowIndex], validationExpression);

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;
					            
					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }
					            
					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;
					            
					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }
					            
					    		cell.attr('title',validationMessage);

					    		TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }

                        inputEl.val(TW.DateUtilities.formatDate(currentRows[rowIndex][field], colFormat));
				    }
				    else if( inputEl.hasClass('grid-cell-BOOLEAN')) {
					    var colFormat = cell.attr('col-format');

					    currentRows[rowIndex][field] = inputEl.is(':checked');

					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));

							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}

					    	var validationResult = undefined;

                            validationResult = evalObjectScopeExpression(currentRows[rowIndex], validationExpression);

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title',validationMessage);

					    		TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }

				    }
				    else {
					    currentRows[rowIndex][field] = inputEl.val();
					    
					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));
							
							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}
							
					    	var validationResult = undefined;

                            validationResult = evalObjectScopeExpression(currentRows[rowIndex], validationExpression);

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;
					            
					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }
					            
					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;
					            
					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }
					            
					    		cell.attr('title',validationMessage);
					    		
		                        TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }
					    
					    
				    }
				    
				    thisWidget.setProperty('EditedTable',thisWidget.getProperty('EditedTable'));
				    
			    } catch( err ) {
				    TW.log.error('Error updating cell');
			    }
		    });


			var formatRowBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowBackgroundStyle', 'DefaultRowBackgroundStyle'));
			var formatRowAlternateBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowAlternateBackgroundStyle', 'DefaultRowAlternateBackgroundStyle'));
			var formatRowHoverResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowHoverStyle', 'DefaultRowHoverStyle'));
			var formatRowSelectedResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowSelectedStyle', 'DefaultRowSelectedStyle'));
			var formatGridHeaderResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridHeaderStyle', 'DefaultGridHeaderStyle'));
			var formatGridBackgroundResult = TW.getStyleFromStyleDefinition(this.getProperty('GridBackgroundStyle', 'DefaultGridBackgroundStyle'));
	
			var cssRowBackground = TW.getStyleCssGradientFromStyle(formatRowBackgroundResult);
			var cssRowBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowBackgroundResult);
			var cssRowAlternateBackground = TW.getStyleCssGradientFromStyle(formatRowAlternateBackgroundResult);
			var cssRowAlternateBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowAlternateBackgroundResult);
			var cssRowHover = TW.getStyleCssGradientFromStyle(formatRowHoverResult);
			var cssRowHoverText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowHoverResult);
			var cssRowSelected = TW.getStyleCssGradientFromStyle(formatRowSelectedResult);
			var cssRowSelectedText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowSelectedResult);
			var cssGridHeaderBackground = TW.getStyleCssGradientFromStyle(formatGridHeaderResult);		
			var cssGridHeaderText = TW.getStyleCssTextualNoBackgroundFromStyle(formatGridHeaderResult);
			var cssGridBackground = TW.getStyleCssGradientFromStyle(formatGridBackgroundResult);
			var textSize = TW.getTextSize(formatGridBackgroundResult.textSize);
			var cssGridBorder = TW.getStyleCssBorderFromStyle(formatGridBackgroundResult);
			var cssGridHeaderBorder = TW.getStyleCssBorderFromStyle(formatGridHeaderResult);

            if (this.getProperty('GridHeaderStyle') !== undefined) {
                textSizeClass = TW.getTextSizeClassName(formatGridHeaderResult.textSize);
            }

			
			 if (thisWidget.getProperty('RowBackgroundStyle', 'DefaultRowBackgroundStyle') === 'DefaultRowBackgroundStyle'
	                && thisWidget.getProperty('RowAlternateBackgroundStyle', 'DefaultRowAlternateBackgroundStyle') === 'DefaultRowAlternateBackgroundStyle'
	                && thisWidget.getProperty('RowHoverStyle', 'DefaultRowHoverStyle') === 'DefaultRowHoverStyle'
	                && thisWidget.getProperty('GridHeaderStyle', 'DefaultRowHoverStyle') === 'DefaultRowHoverStyle'
	                && thisWidget.getProperty('GridBackgroundStyle', 'DefaultGridBackgroundStyle') === 'DefaultGridBackgroundStyle'
	                && thisWidget.getProperty('RowSelectedStyle', 'DefaultRowSelectedStyle') === 'DefaultRowSelectedStyle') {
	                if (!addedDefaultStyles) {
	                    addedDefaultStyles = true;
	                    var defaultStyles = '.widget-dynamicColumnsGrid .gridbox {'+ cssGridBackground + '}' +
	                    					'.widget-dynamicColumnsGrid .dynamicColumnsGrid-wrapper {'+ cssGridBorder +'}' +
											'.widget-dynamicColumnsGrid .xhdr td { border: none; }' +
											' div.gridbox .xhdr {'+ cssGridHeaderBackground +'}' +
											'.widget-dynamicColumnsGrid .gridbox table.obj tr {'+ cssRowBackground + '}' +
	                 						'.widget-dynamicColumnsGrid .gridbox table.obj td {'+ cssRowBackgroundText +'}' +
	                 						'.widget-dynamicColumnsGrid .gridbox table.obj tr.even td {'+ cssRowAlternateBackground + cssRowAlternateBackgroundText +'}' +  
	                 						'.widget-dynamicColumnsGrid .gridbox table.obj tr:hover td {'+ cssRowHover + cssRowHoverText +'}' + 
	                 						'.widget-dynamicColumnsGrid .gridbox table.obj tr.rowselected td div {'+ cssRowSelected + cssRowSelectedText +'}' + 
	                 						'.widget-dynamicColumnsGrid .gridbox table.hdr td { '+ cssGridHeaderBackground + '}' +
											'.widget-dynamicColumnsGrid .gridbox table.hdr td > div { '+ cssGridHeaderText +' text-shadow: none; }';
	                    	
	                    $.rule(defaultStyles).appendTo(TW.Runtime.globalWidgetStyleEl);
	                }
	         } else {
					
				var styleBlock =
					'<style>' +
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .gridbox {'+ cssGridBackground + '}' + 
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .xhdr td { border: none; }' +
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .xhdr tr th:last-child, .xhdr tr td:last-child { padding-right:' + this.getScrollBarWidth() + 'px !important; }' +
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .xhdr { '+ cssGridBorder +' border-left:none; border-top:none; border-right:none; }' +
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .dynamicColumnsGrid-wrapper {'+ cssGridBorder +'}' +
						'#' + thisWidget.jqElementId + ' div.gridbox .xhdr {'+ cssGridHeaderBackground + cssGridHeaderBorder + ' width: auto !important;}' +
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .gridbox table.obj td {'+ cssRowBackground + cssRowBackgroundText +'}' +
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .gridbox table.obj tr.even td {'+ cssRowAlternateBackground + cssRowAlternateBackgroundText +'}' +  
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .gridbox table.obj tr:hover td {'+ cssRowHover + cssRowHoverText +'}' + 
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .gridbox table.obj tr.rowselected td {'+ cssRowSelected + cssRowSelectedText +'}' + 
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .gridbox table.hdr td { '+ cssGridHeaderBackground + ' }' +  
						'#' + thisWidget.jqElementId + '.widget-dynamicColumnsGrid .gridbox table.hdr td { '+ cssGridHeaderText +' text-shadow: none; }' +  
					'</style>';
					
				$(styleBlock).prependTo(thisWidget.jqElement);
	         }
	
	        if (isAndroid) {
	            // adjust the grid to be 25 px less in width and height for the table to fit
	            thisWidget.jqElement.find('.dhtmlxgrid-container-container').width(thisWidget.getProperty('Width') - 25).height(thisWidget.getProperty('Height') - 25);
	        }
			
	        rowHeight = thisWidget.getProperty('RowHeight') || 30;
	        if (thisWidget.getProperty('MultiSelect') === 'true' || thisWidget.getProperty('MultiSelect') === true) {
	            isMultiselect = true;
	        };
	
	        autoWidthColumns = [];
	        colModel = [];
	
	        var colFormat = thisWidget.getProperty('ColumnFormat');
	        
			var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));

	        if (colFormat !== undefined) {
	            // translate our internal 'ColumnFormat' to the dhtmlxgrid's idea of a column model
	            for (var i = 0; i < colFormat.formatInfo.length; i++) {
	                var col = colFormat.formatInfo[i];
	                var thisWidth = 100;
	                if (col.Width === 'auto') {
	                    autoWidthColumns.push(i);
	                    thisWidth = '100';
	                } else {
	                    thisWidth = col.Width;
	                }
	                
	                var allowEdit = false;
	                var validationExpression = "";
	                var validationMessage = "";
	                var editStyle = undefined;
	                
		            if(thisWidget.getProperty("IsEditable") === true) {
			            allowEdit = col.AllowEdit;
			            validationExpression = col.ValidationExpression;
			            validationMessage = col.ValidationMessage;
			            editStyle = activeEditStyle;
		            }

					
	                colModel.push({ name: col.FieldName, label: TW.Runtime.convertLocalizableString(col.Title), width: thisWidth, align: col.Align, sortable: false, allowEdit : allowEdit, validationExpression : validationExpression,  validationMessage : validationMessage, editStyle : editStyle, formatoptions: col.FormatOptions });
	
	                if (gridHeader.length > 0) {
	                    gridHeader += ',';
	                    gridInitWidths += ',';
	                    gridColAlign += ',';
	                    gridColTypes += ',';
	                    gridColSorting += ',';
	                }
	                gridHeader += Encoder.htmlEncode(TW.Runtime.convertLocalizableString(col.Title).replace(/,/g,'&#44;'));
	                gridInitWidths += thisWidth.toString();
	                gridColAlign += col.Align || 'left';
	                gridColTypes += 'twcustom';
	                gridColSorting += 'str';
	                nColumns++;
	            }
	        } else {
	            gridHeader = "Must be bound to data";
	            gridInitWidths = "*";
	            gridColAlign = "left";
	            gridColTypes = "ro";
	            gridColSorting = "str";
	        }
			
	        initGrid();
			
	
			
			
	    };
	
	    // called every time that the infotable is updated
	    this.updateProperty = function (updatePropertyInfo, localUpdate) {
	        var reInitGrid = false;
	        var infoTableDataShape;
	
	        if (updatePropertyInfo.TargetProperty === "ScrollTop") {
	        	dynamicColumnsGrid.setScrollTop(updatePropertyInfo.RawSinglePropertyValue);
	        }
	        
	        if (updatePropertyInfo.TargetProperty === "Data") {
	            updateCount += 1;
	            currentDataInfo = updatePropertyInfo,
	            currentRows = currentDataInfo.ActualDataRows;
		        if( currentRows === undefined ) {
			        currentRows = [];
		        }
	            infoTableDataShape = currentDataInfo.DataShape;
	            selectedRowIndices = updatePropertyInfo.SelectedRowIndices;

			    if( isPrintLayout ) {
				    
				    var html = '';
				    html += this.buildHeaderRowHtml(infoTableDataShape);

				    _.each(currentRows,function(row) {
				        html +=
					                '<tr>';
					    var htmlRet = '';
					    if( thisWidget.getProperty('ColumnDisplay') === 'showAllColumns' ) {
					        var renderer = TW.Renderer.DEFAULT;
	                        for (var fieldName in infoTableDataShape) {
	                            var fieldDef = infoTableDataShape[fieldName];
				                htmlRet = renderer['renderHtml']({
				                    DataRow: row,
				                    ValueFieldName: fieldName,
				                    Value: row[fieldName],
				                    ColumnInfo: {}
				                });
						        html +=
							                '<td><div class="print-cell">' +
								                htmlRet +
							                '</div></td>';
						    }
					    } else {
							_.each(colModel,function(field) {
								var fmtOptions = field.formatoptions;
						        var renderer = TW.Renderer[fmtOptions.renderer];
						        if (renderer !== undefined) {
						            if (renderer['renderHtml'] !== undefined && (typeof renderer['renderHtml']) === "function") {
						                htmlRet = renderer['renderHtml']({
						                    DataRow: row,
						                    ValueFieldName: field.name,
						                    Value: row[field.name],
						                    FormatString: fmtOptions.FormatString,
						                    StateFormatting: fmtOptions.formatInfo,
						                    ColumnInfo: {}
						                });
						            }
						        } else {
						            TW.log.error('Unrecognized renderer in dynamicColumnsGrid print: "' + renderer + '"');
						        }

						        html +=
							                '<td><div class="print-cell">' +
								                htmlRet +
							                '</div></td>';
					        });
					    }
				        html +=
					                '</tr>';

				    });
					
				    this.jqElement.html(html);
				    
					var html = '';
					
					var formatRowBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowBackgroundStyle', 'DefaultRowBackgroundStyle'));
					var formatRowAlternateBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowAlternateBackgroundStyle', 'DefaultRowAlternateBackgroundStyle'));
					var formatRowSelectedResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowSelectedStyle', 'DefaultRowSelectedStyle'));
					var formatGridBackgroundResult = TW.getStyleFromStyleDefinition(this.getProperty('GridBackgroundStyle', 'DefaultGridBackgroundStyle'));
					var formatGridHeaderResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridHeaderStyle', 'DefaultGridHeaderStyle'));
	
					var cssRowBackground = TW.getStyleCssGradientFromStyle(formatRowBackgroundResult);
					var cssRowBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowBackgroundResult);
					var cssRowAlternateBackground = TW.getStyleCssGradientFromStyle(formatRowAlternateBackgroundResult);
					var cssRowAlternateBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowAlternateBackgroundResult);
					var cssRowSelected = TW.getStyleCssGradientFromStyle(formatRowSelectedResult);
					var cssRowSelectedText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowSelectedResult);
					var cssGridHeaderBackground = TW.getStyleCssGradientFromStyle(formatGridHeaderResult);		
					var cssGridHeaderText = TW.getStyleCssTextualNoBackgroundFromStyle(formatGridHeaderResult);
					var cssGridBackground = TW.getStyleCssGradientFromStyle(formatGridBackgroundResult);
					var cssGridBorder = TW.getStyleCssBorderFromStyle(formatGridBackgroundResult);
					var textSize = TW.getTextSize(formatGridBackgroundResult.textSize);

					var printstyles = 
					'<style>' +
						'#' + thisWidget.jqElementId + ' { '+ cssGridBackground + cssGridBorder +' border-bottom: none; border-right: none; }' +	
						'#' + thisWidget.jqElementId + ' thead th { '+ cssGridHeaderText + cssGridBorder + cssGridHeaderBackground +' border-left: none; border-top: none; }' +		
						'#' + thisWidget.jqElementId + ' .print-header-cell { padding:5px; }' +	
						'#' + thisWidget.jqElementId + ' .print-cell { '+ cssRowBackground +' line-height: ' + thisWidget.getProperty('RowHeight') + 'px; min-height: ' + thisWidget.getProperty('RowHeight') + 'px; height:auto !important; height: ' + thisWidget.getProperty('RowHeight') + 'px; } ' +		
						'#' + thisWidget.jqElementId + ' td { '+ cssRowBackgroundText + cssGridBorder + textSize +' border-left:none; border-top:none; }' +				
					'</style>';
					
					$(printstyles).prependTo(thisWidget.jqElement);
					
					return;
			    }

		        // we used to only clone if the table was editable ... we clone it always now in case it has been sorted
	            var clonedTable = TW.InfoTableUtilities.CloneInfoTable({ "dataShape" : { "fieldDefinitions" : infoTableDataShape}, "rows" : currentRows });

	            if(thisWidget.getProperty("IsEditable") === true) {
		            thisWidget.setProperty('EditedTable', clonedTable);
	            }

	            currentRows = clonedTable.rows;

	            // record the initial row number in each row - when sorted, it's important to know the original row number
		        var nRows = currentRows.length;
	            for( var i=0; i<nRows; i++) {
		            currentRows[i]._originalRowNumber = i;
	            }

	            var colFormat = thisWidget.getProperty('ColumnFormat');
	            
	            var createColFormatMap = function(colFormat){
	            	var map = new Object();
	            	 if (colFormat !== undefined) {
		                    if (colInfo.length === 0) {
		                        for (var i = 0; i < colFormat.formatInfo.length; i += 1) {
		                        	map[colFormat.formatInfo[i].FieldName] = colFormat.formatInfo[i];
		                        }
		                    }
	            	 }
	            	 return map;
	            };
	
	            if (showAllCols) {
	                var newFldsString = toFieldsString(currentDataInfo.DataShape);
	                if (currentFieldsString === '' || currentFieldsString !== newFldsString) {
	                    currentFieldsString = newFldsString;
	                    reInitGrid = true;
	                }
	
	                (function () {
	                    if (reInitGrid) {
	                        if (currentDataInfo.SourceProperty !== '') {
	                            if (currentDataInfo.ActualDataRows !== undefined && currentDataInfo.ActualDataRows[0] !== undefined && currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty] !== undefined && currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty].rows !== undefined) {
	                                currentRows = currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty].rows;
	                                infoTableDataShape = currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty].dataShape.fieldDefinitions;
	                            }
	                        }
	                        currentSortInfo = undefined;
	                        gridHeader = '';
	                        gridInitWidths = '';
	                        gridColAlign = '';
	                        gridColTypes = '';
	                        gridColSorting = '';
	                        nColumns = 0;
	                        colModel = [];
	                        autoWidthColumns = [];
	                        colInfo = [];
	
	                        var overallWidth = thisWidget.getProperty('Width');
	                        var eachColumnWidth = 40;
		                    if( currentDataInfo.DataShape !== undefined )  {
			                    eachColumnWidth = overallWidth / currentDataInfo.DataShape.length;
		                    }
	                        
	                        // Create an array of the infoTableDataShape field names, sorted by their 'ordinal' values so that we can iterate them in that order.    
	                        let infoTableDataShapeFieldsArr = [];
	                        for (var fieldName in infoTableDataShape){
	                            infoTableDataShapeFieldsArr[infoTableDataShape[fieldName]['ordinal'] - 1] = fieldName;
	                        }    
	                        infoTableDataShapeFieldsArr.forEach(function(fieldName){  
	                            var fieldDef = infoTableDataShape[fieldName];
	                            if (fieldDef.ordinal === -1) {
	                                return;
	                            }
	                            if (gridHeader.length > 0) {
	                                gridHeader += ',';
	                                gridInitWidths += ',';
	                                gridColAlign += ',';
	                                gridColTypes += ',';
	                                gridColSorting += ',';
	                            }
	                            gridHeader += Encoder.htmlEncode(fieldName);
	
	                            if (gridInitWidths.length === 0) {
	                                gridInitWidths += '100';
	                            } else {
	                                gridInitWidths += '50';
	                            }
	
	                            colInfo.push({
	                                name: fieldName,
	                                baseType: fieldDef.baseType
	                            });
	                            //colModel.push({ name: col.FieldName, label: TW.Runtime.convertLocalizableString(col.Title), width: thisWidth, align: col.Align, sortable: false, formatoptions: col.FormatOptions });
	                            // if you update this, also update dynamicColumnsGrid.customdialog.ide.js to update the defaults at IDE time
	                            switch (fieldDef.baseType) {
	                            case "DATETIME":
	                            	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "DATETIME", FormatString: TW.Runtime.convertLocalizableString(TW.Renderer.DATETIME.defaultFormat) } });
	                            	break;
	                            case "LOCATION":
	                            	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "LOCATION", FormatString: '0.00' } });
	                            	break;
	                            case "TAGS":
	                            	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "TAGS", FormatString: 'plain' } });
	                            	break;
	                            case "HYPERLINK":
	                            	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "HYPERLINK", FormatString: '_blank' } });
	                            	break;
	                            case "IMAGELINK":
	                            	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "IMAGELINK" } });
	                            	break;
	                            case "HTML":
	                            	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "HTML" , FormatString: 'format' } });
	                            	break;
                                case "NUMBER":
                                	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "NUMBER" , FormatString: '0.00' } });
                                	break;
	                            default:
	                            	colModel.push({ name: fieldName, label: fieldName, sortable: false, formatoptions: { renderer: "DEFAULT" } });
	                            }
	                            gridColAlign += 'left';
	                            gridColTypes += 'twcustom';
	                            gridColSorting += 'str';
	                            nColumns++;
	                        });
	
	                        for (var i = 0; i < nColumns; i++) {
	                            autoWidthColumns.push(i);
	                        }
	
	                        initGrid();
	                    }
	                }());
	
	                // don't updateSelection here ... it's handled later in this function
		            ignoreSelectionChanges = true;
	                loadGrid(undefined, false /*updateSelection*/);
		            ignoreSelectionChanges = false;

	                for (var i = 0; i < autoWidthColumns.length; i++) {
	                    dynamicColumnsGrid.adjustColumnSize(autoWidthColumns[i]);
	                }

	                if (!updatePropertyInfo.IsBoundToSelectedRows ) {
	                    // only do this if it's bound to AllData ...
	                    dynamicColumnsGrid.enableMultiselect(isMultiselect);
	                }

	            } else if(showDynamicColumns){
	            	var newFldsString = toFieldsString(currentDataInfo.DataShape);
	                if (currentFieldsString === '' || currentFieldsString !== newFldsString) {
	                    currentFieldsString = newFldsString;
	                    reInitGrid = true;
	                }
	                gridHeader = '';
                    gridInitWidths = '';
                    gridColAlign = '';
                    gridColTypes = '';
                    gridColSorting = '';
                    nColumns = 0;
                    colModel = [];
                    autoWidthColumns = [];
                    colInfo = [];
	
	                (function () {
	                    if (reInitGrid) {
	                    	var colformatMap = createColFormatMap(colFormat);
	                    	var datashape = currentDataInfo.DataShape;
	                    	var datashapeValues = new Array();
	                    	
	                    	for(let x in datashape) {
	                    		datashapeValues.push(datashape[x]);
	                    	}
	                    	
	                    	TW.sortArrayByNumberField(datashapeValues, 'ordinal');
	                    	
            	            for (var y = 0; y < datashapeValues.length; y++){
            	            	var field = datashapeValues[y]
            	            	if(colformatMap[field.name] != null) {
	            	                var col = colformatMap[field.name];
	            	                var thisWidth = 100;
	            	                if (col.Width === 'auto') {
	            	                    autoWidthColumns.push(nColumns);
	            	                    thisWidth = '100';
	            	                } else {
	            	                    thisWidth = col.Width;
	            	                }
	            	                
	            	                var allowEdit = false;
	            	                var validationExpression = "";
	            	                var validationMessage = "";
	            	                var editStyle = undefined;
	            	                
	            		            if(thisWidget.getProperty("IsEditable") === true) {
	            			            allowEdit = col.AllowEdit;
	            			            validationExpression = col.ValidationExpression;
	            			            validationMessage = col.ValidationMessage;
	            			            editStyle = activeEditStyle;
	            		            }
	
	            					
	            	                colModel.push({ name: col.FieldName, label: TW.Runtime.convertLocalizableString(col.Title), width: thisWidth, align: col.Align, sortable: false, allowEdit : allowEdit, validationExpression : validationExpression,  validationMessage : validationMessage, editStyle : editStyle, formatoptions: col.FormatOptions });
	            	
	            	                if (gridHeader.length > 0) {
	            	                    gridHeader += ',';
	            	                    gridInitWidths += ',';
	            	                    gridColAlign += ',';
	            	                    gridColTypes += ',';
	            	                    gridColSorting += ',';
	            	                }
	            	                gridHeader +=  TW.Runtime.convertLocalizableString(col.Title).replace(/,/g,'&#44;');
	            	                gridInitWidths += thisWidth.toString();
	            	                gridColAlign += col.Align || 'left';
	            	                gridColTypes += 'twcustom';
	            	                gridColSorting += 'str';
	            	                nColumns++;
	            	                
	            	                colInfo.push({
		                                name: field.name,
		                                baseType: field.baseType
		                            });
            	            	}
            	            }
            	            initGrid();
	                    }
	                }());
	                
	                // don't updateSelection here ... it's handled later in this function
		            ignoreSelectionChanges = true;
	                loadGrid(undefined, false /*updateSelection*/);
		            ignoreSelectionChanges = false;

	                for (var i = 0; i < autoWidthColumns.length; i++) {
	                    dynamicColumnsGrid.adjustColumnSize(autoWidthColumns[i]);
	                }

	                if (!updatePropertyInfo.IsBoundToSelectedRows ) {
	                    // only do this if it's bound to AllData ...
	                    dynamicColumnsGrid.enableMultiselect(isMultiselect);
	                }
	            	
	            } else {
	                if (colFormat !== undefined) {
	                    if (colInfo.length === 0) {
	                        for (var i = 0; i < colFormat.formatInfo.length; i += 1) {
	                            colInfo.push({
	                                name: colFormat.formatInfo[i].FieldName,
	                                baseType: ((currentDataInfo.DataShape !== undefined && currentDataInfo.DataShape[colFormat.formatInfo[i].FieldName] !== undefined) ? currentDataInfo.DataShape[colFormat.formatInfo[i].FieldName].baseType : undefined)
	                            });
	                        }
	                    }
	
	                    // don't updateSelection here ... it's handled later in this function
			            ignoreSelectionChanges = true;
	                    loadGrid(undefined, false /*updateSelection*/);
			            ignoreSelectionChanges = false;
	                }
	
	                for (var i = 0; i < autoWidthColumns.length; i++) {
	                    dynamicColumnsGrid.adjustColumnSize(autoWidthColumns[i]);
	                }
	            }

		        if( expandGridToShowAllRows ) {
			        dynamicColumnsGrid.setSizes();
			        var width = dynamicColumnsGrid.entBox.style.width;
			        var height = dynamicColumnsGrid.entBox.style.height;
			        if( expandGridToShowAllColumns ) {
				        thisWidget.jqElement.css('width',width);
			        }
			        thisWidget.jqElement.css('height',height);

		        }
	
	            if (!updatePropertyInfo.IsBoundToSelectedRows) {
	                // only do this if it's bound to AllData ...
	                dynamicColumnsGrid.enableMultiselect(isMultiselect);
	
	                if (currentRows.length > 0) {
	                    if (selectedRowIndices !== undefined && selectedRowIndices.length === 0 && this.getProperty('AutoSelectFirstRow') === true) {
	                        // do this with delay ... if you have a lot of grids accessing the same data, they may not have populated and we're already telling them the row to select :)
	                        setTimeout(function () {
	                            // select the first row
	                            ignoreSelectionChanges = true;
	                            dynamicColumnsGrid.selectRow(0, false, false, true);
	                            ignoreSelectionChanges = false;
	
	                            // tell the runtime that we updated the selection
	                            thisWidget.updateSelection('Data', [0]);
	                        }, 100);
	                    } else {
	                        if (!ignoreSelectionChanges) {
	                            ignoreSelectionChanges = true;
	                            selectGridRows(selectedRowIndices);
	                            ignoreSelectionChanges = false;
	                        }
	                    }
	                    thisWidget.updateSelection('Data', selectedRowIndices);
	                } else {
	                    // mark that none are selected since we just got the data and there are no rows
	                    thisWidget.updateSelection('Data', []);
	                }
	            }
	        } else if (updatePropertyInfo.TargetProperty === "top" || updatePropertyInfo.TargetProperty === "left" || updatePropertyInfo.TargetProperty === "width" || updatePropertyInfo.TargetProperty === "height") {
	            thisWidget.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue);
	            thisWidget.jqElement.css(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue + "px");
	            // update the inner object's height and width if updated ... don't mess with top / left of inner object
	            if (updatePropertyInfo.TargetProperty === "width" || updatePropertyInfo.TargetProperty === "height") {
	                $('#' + domElementIdOfDhxGrid).css(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue);
	            }
	        }
	
	
			let  CellTextWrapping = thisWidget.getProperty('CellTextWrapping');
	        if (CellTextWrapping === undefined) {
	            CellTextWrapping = false;
	        }
			if (CellTextWrapping == true) {
				thisWidget.jqElement.addClass('CellTextWrapping');
			}
	
	    };

		this.extendLastColum = function(width) {
			var widthSoFar = 0;
			for( var i=0; i<(dynamicColumnsGrid.cellWidthPX.length-1); i++ )  {
				widthSoFar += dynamicColumnsGrid.cellWidthPX[i];
			}

			var lastColumnWidth = dynamicColumnsGrid.cellWidthPX[dynamicColumnsGrid.cellWidthPX.length-1];

			if( (widthSoFar + lastColumnWidth) < width ) {
				dynamicColumnsGrid.setColWidth(dynamicColumnsGrid.cellWidthPX.length-1,width-widthSoFar-25 /* in case of scrollbar */ );
			}
		};

		this.resize = function(width,height) {
//            thisWidget.jqElement.css('Width', width + "px");
//            thisWidget.jqElement.css('Height', height + "px");
//			console.log('dynamicColumnsGrid resize width: ' + width + ', height: ' + height);
            // update the inner object's height and width if updated ... don't mess with top / left of inner object
            //$('#' + domElementIdOfDhxGrid).css('Width', width).css('Height',height);
			dynamicColumnsGrid.setSizes();
			if( this.properties.ResponsiveLayout === true ) {
				this.extendLastColum(width);
			}
		};

	    // callback from runtime to tell us that the selection has been changed by another widget
	    this.handleSelectionUpdate = function (propertyName, selectedRows, newSelectedRowIndices) {
	        // if we're called with a selection change before we've even been loaded, no point going through the exercise
	        if (dynamicColumnsGrid !== undefined) {
	            // note that we're in the middle of selection so we don't tell the runtime what it already knows (that the selection has changed)
	            if (!ignoreSelectionChanges) {
	                ignoreSelectionChanges = true;
		            selectedRowIndices = newSelectedRowIndices;
	                if (selectedRowIndices.length === 0) {
	                    dynamicColumnsGrid.clearSelection();
	                }
	                selectGridRows(selectedRowIndices);
	                ignoreSelectionChanges = false;
		            thisWidget.setProperty('CurrentScrollTop',dynamicColumnsGrid.getScrollTop());
	            }
	        }
	    };
	
	    this.beforeDestroy = function () {
	        destroyGrid();
	        dynamicColumnsGrid = null;
	        currentDataInfo = null;
	        currentRows = null;
	    };
	
	
	};
}());
// ----END: extensions/PTC-Navigate-View-PLM-App-extension/ui/DynamicColumnsGrid/dynamicColumnsGrid.runtime.js

// ----BEGIN: extensions/PTC-Navigate-View-PLM-App-extension/ui/dynamicpropertydisplay/dynamicpropertydisplay.runtime.js
/*
    Still todo for editing:

        - maybe google location picker for LOCATION?  Or look through available widgets that have "Location Picker" in the name?
            - or maybe just two input boxes for lat and lng?
        - figure out a way to handle undefined dates for DATETIME - right now we end up passing current time as default

        Ideally it would be awesome if we didn't have to have this hack "DataForDatashapeIfNoRows" ... ideally, the runtime engine would support the ability to ask for a datashape callback so
        that if it's bound to selected rows, when the service returns it would tell the widget the datashape
 */

TW.Runtime.Widgets.dynamicpropertydisplay = function () {
    "use strict";
	var thisWidget = this;

    var locationPickerAvailable = false;

    var buildTagsPropertyHtml = function (tags, fldDef) {
        var nTags = 0,
            html = '',
            tag;
        if( tags !== undefined ) {
            nTags = tags.length;
            for (var i = 0; i < nTags; i += 1) {
                tag = tags[i];
                html += '<div class="tag-term-container"><div class="tag-vocabulary"><span>' + tag.vocabulary + '</span></div><div class="tag-term"><span>' + tag.vocabularyTerm + '</span></div></div>';
            }
        }
        return html;
    };
    
    var buildInfotableHtml = function (infotable) {
        if (infotable === undefined) {
            return '';
        }
        var rows = infotable.rows,
                fldDefs = infotable.dataShape.fieldDefinitions,
                resultsHtml = '',
                row,
                col,
                baseType,
                colInfo = {},
                infotableId,
                itemId;

        colInfo.properties = 0;
        var titles = new Array();
        if( thisWidget.showDynamicColumns == "showallcolumns" ) {
            var initialFldDefs = JSON.parse(thisWidget.getProperty('InfotableInfo'));
            _.each(initialFldDefs,function(initialFldDef) {
               TW.log.debug("dynamicpropertydisplay::initialFldDef=" + initialFldDef.name);
               if( initialFldDef.__showThisField === false ) {
                   // don't show this field
                   delete fldDefs[initialFldDef.name];
                   TW.log.debug("dynamicpropertydisplay::don't show: initialFldDef=" + initialFldDef.name);
               }
            });
        } else if( thisWidget.showDynamicColumns == "showdynamiccolumns" ) {
            var initialFldDefs = JSON.parse(thisWidget.getProperty('InfotableInfo'));
            _.each(initialFldDefs,function(initialFldDef) {
               TW.log.debug("dynamicpropertydisplay::initialFldDef=" + initialFldDef.name);
               if( initialFldDef.__showThisField === false ) {
                   // don't show this field
                   delete fldDefs[initialFldDef.name];
                   TW.log.debug("dynamicpropertydisplay::don't show: initialFldDef=" + initialFldDef.name);
               } else {
            	   titles[initialFldDef.name] = initialFldDef.Title;
               }
            });
            _.each(fldDefs, function(fldDef) {
            	// Do not display the filed that was not specified in the initial static data shape
            	if ( initialFldDefs[fldDef.name] === undefined ) {
                    delete fldDefs[fldDef.name];
                    TW.log.debug("dynamicpropertydisplay::don't show: fldDef.name=" + fldDef.name);
            	}
            });
        } else {
            fldDefs = JSON.parse(thisWidget.getProperty('InfotableInfo'));
        }

        var props = _.toArray(fldDefs);
        TW.log.debug("dynamicpropertydisplay::props=" + props);

        if( thisWidget.showDynamicColumns == "showallcolumns" ) {
            TW.sortArrayByStringField(props, 'name');
            TW.sortArrayByNumberField(props, 'ordinal');
        } else if( thisWidget.showDynamicColumns == "showdynamiccolumns" ) {
            TW.sortArrayByNumberField(props, 'ordinal');
            TW.log.debug("dynamicpropertydisplay::props=" + props);
        }

        // do we have any rows of data?
        if( rows.length === 0 ) {
            if( thisWidget.allowEditing && thisWidget.showEditorsIfNoRowData ) {
                // if allow editing and show if no data, then we go ahead and use a blank row to start with
                thisWidget.lastRows.push({});
                row = thisWidget.lastRows[0];
                if( (thisWidget.showDynamicColumns == "showallcolumns") && 
                	 thisWidget.lastDatashape !== undefined ) {
                	props = thisWidget.lastDatashape;
                }
            } else {
                return resultsHtml;
            }
        } else {
            row = rows[0];
        }
		var propNameTextSizeClass = infotable.textSizeClass.propNameTextSizeClass
		var propValueTextSizeClass = infotable.textSizeClass.propValueTextSizeClass
        resultsHtml += '<div class="table-border"><table class="component-table" cellspacing="0" cellpadding="0">';

        _.each(props,function(fld) {
            var displayThisColumn = true;
            if( fld.__showThisField === false ) {
                displayThisColumn = false;
            }

            if (displayThisColumn) {
                var row_data = row[fld.name]; // assign the name without html encoding
                col = Encoder.htmlEncode(fld.name);
                var title = col; // assume field name as title

                if (fld.Title) {
                    // The field title is specified explicitly.
                    title = TW.Runtime.convertLocalizableString(fld.Title);
                } else if (titles !== undefined && titles[fld.name]) {
                    title = TW.Runtime.convertLocalizableString(titles[fld.name]);
                }
                colInfo.properties += 1;
                baseType = fld.baseType;
                var stringValue = '';
                if( row_data !== undefined ) {
                    try {
                        stringValue = row_data.toString();
                    } catch(err) {}
                }
                if (baseType === 'DATETIME') {
                    if (row_data !== undefined && row_data !== '') {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '"  base-type="' + baseType + '">'
						+ TW.DateUtilities.formatDate(row_data, TW.Runtime.convertLocalizableString(thisWidget.getProperty('DateFormat', TW.Renderer.DATETIME.defaultFormat)))
						+ '</td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                    }
                } else if (baseType === 'TAGS') {
                    var tagType = "ModelTags";
                    try {
                        tagType = fld.aspects.tagType;
                    } catch (err) {}
                    resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '" tag-type="' + tagType + '">' + buildTagsPropertyHtml(row_data, fld) + '</td></tr>';
                } else if (baseType === 'LOCATION') {
                    if( thisWidget.allowEditing ) {
                        var latString = '';
                        var lngString = '';

                        if (row_data !== undefined) {
                            var latitude = parseFloat(row_data.latitude);
                            var longitude = parseFloat(row_data.longitude);

                            var labelFormat = TW.Renderer.LOCATION.defaultFormat;

                            latString = latitude.format(labelFormat);
                            lngString = longitude.format(labelFormat);
                        }
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><span>Lat:</span><input class="property-display-editor latitude basetype="' + baseType + '" field-name="' + col + '" type="text" value="' + latString + '"/><span>&nbsp;Lng:</span><input class="property-display-editor longitude basetype="' + baseType + '" field-name="' + col + '" type="text" value="' + lngString + '"/></td></tr>';
                    } else {
                        if (row_data !== undefined) {

                            var latitude = parseFloat(row_data.latitude);
                            var longitude = parseFloat(row_data.longitude);

                            var labelFormat = TW.Renderer.LOCATION.defaultFormat;
                            let formattedValue = latitude.format(labelFormat) + " : " + longitude.format(labelFormat);

                            resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><span class="propertydisplay-location" latitude="' + row_data.latitude + '" longitude="' + row_data.longitude + '" title="' + row_data.latitude + ', ' + row_data.longitude + '">' + formattedValue + '</span></td></tr>';
                        } else {
                            resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '">---- : ----</td></tr>';
                        }
                    }
                } else if (baseType === 'IMAGELINK') {
                    if (row_data !== undefined && row_data !== '') {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><a href="' + stringValue + '" target="_blank"><img alt="' + col + '" src="' + stringValue + '" /></a></td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                    }
                } else if (baseType === 'INFOTABLE' || baseType === 'VALUES') {
                    if (row_data !== undefined && row_data.rows.length > 0) {
                        infotableId = 'x' + '-' + col + '-' + TW.uniqueId();
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '" id="' + infotableId + '"><span class="could-be-infotable-link-eventually">Infotable</span></td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                    }
                } else if (baseType === 'HYPERLINK') {
                    if( thisWidget.allowEditing ) {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><input class="property-display-editor basetype="' + baseType + '" field-name="' + col + '" type="text" value="' + (Encoder.htmlEncode(stringValue) || '') + '"/></td></tr>';
                    } else {
                        if (row_data !== undefined && row_data !== '') {
                            var hyperLinkText = TW.Runtime.convertLocalizableString(thisWidget.getProperty('HyperLinkText'));
                            if (hyperLinkText === undefined || hyperLinkText == "") {
                                hyperLinkText = "Open";
                            }
                            resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><a href="' + stringValue + '" target="_blank">' + hyperLinkText + '</a></td></tr>';
                        } else {
                            resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                        }
                    }
                } else if (baseType === 'HTML') {
                    if (row_data !== undefined && row_data !== '') {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><div>' + row_data + '</div></td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                    }
                } else if (baseType === 'IMAGE') {
                    if (row_data !== undefined && row_data !== '') {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><img alt="' + col + '" src="data:image/png;base64,' + row_data + '"/></td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                    }
                } else if (baseType === 'PASSWORD') {
                    resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '">*****</td></tr>';
                } else if (baseType === 'XML') {
                    if (row_data !== undefined && row_data !== '') {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '">XML</td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                    }
                } else if (baseType === 'JSON') {
                    if (row_data !== undefined && row_data !== '') {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '">JSON</td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"></td></tr>';
                    }
                } else if (baseType === 'BOOLEAN') {
                    if( thisWidget.allowEditing ) {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><input class="property-display-editor basetype="' + baseType + '" field-name="' + col + '" type="checkbox" ' + (stringValue === 'true' ? ' checked="checked"' : '') + '/></td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '">' + (Encoder.htmlEncode(stringValue) || '') + '</td></tr>';
                    }
                } else {
                    if( thisWidget.allowEditing ) {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '"><input class="property-display-editor basetype="' + baseType + '" field-name="' + col + '" type="text" value="' + (Encoder.htmlEncode(stringValue) || '') + '"/></td></tr>';
                    } else {
                        resultsHtml += '<tr><td class="property-name ' + propNameTextSizeClass + '">' + title + '</td><td class="property-value ' + propValueTextSizeClass + '" field-name="' + col + '" base-type="' + baseType + '">' + (Encoder.htmlEncode(stringValue) || '') + '</td></tr>';
                    }
                }

            }
        });
        resultsHtml += '</table></div>';

        return resultsHtml;
    };

    this.runtimeProperties = function () {
        return {
            'needsDataLoadingAndError': true,
            'propertyAttributes': {
                'PostDateFormat': {
                    'isLocalizable': true
                }
            }
        };
    };

    this.renderHtml = function () {
        thisWidget.showDynamicColumns = thisWidget.getProperty('ShowDynamicColumns', 'default');
        thisWidget.allowEditing = thisWidget.getProperty('AllowEditing',false);
        thisWidget.showEditorsIfNoRowData = thisWidget.getProperty('ShowEditorsIfNoRowData',false);
        thisWidget.dataHasArrived = false;

        TW.log.debug("dynamicpropertydisplay::showDynamicColumns=" + thisWidget.showDynamicColumns);
        TW.log.debug("dynamicpropertydisplay::allowEditing=" + thisWidget.allowEditing);
        TW.log.debug("dynamicpropertydisplay::showEditorsIfNoRowData=" + thisWidget.showEditorsIfNoRowData);
        TW.log.debug("dynamicpropertydisplay::dataHasArrived=" + thisWidget.dataHasArrived);
        
        var html = '<div class="widget-content widget-dynamicpropertydisplay"></div>';

        return html;
    };
	
	this.afterRender = function() {

        var parseLocation = function(stringValueLatitude,stringValueLongitude) {
            var returnLocation = {
                latitude: 0.0,
                longitude: 0.0
            };

            if( stringValueLatitude.length === 0 || stringValueLongitude.length === undefined) {
                return undefined;
            }
            try {
                returnLocation.latitude = parseFloat(stringValueLatitude);
                returnLocation.longitude = parseFloat(stringValueLongitude);
            } catch(err) {

            }

            return returnLocation;

        };

        thisWidget.jqElement.on('change','.property-display-editor',function(e) {
            var el = $(e.target).closest('.property-display-editor');
            var colName = el.attr('field-name');
            var baseType = el.closest('.property-value').attr('base-type');
            try {
                var newValue = el.val();
                if( baseType === 'LOCATION') {
                    var tdEl = el.closest('td.property-value');

                    thisWidget.lastRows[0][colName] = parseLocation(tdEl.find('input.latitude').val(),tdEl.find('input.longitude').val());
                } else if( baseType === 'BOOLEAN') {
                    thisWidget.lastRows[0][colName] = el.is(':checked');
                } else {
                    thisWidget.lastRows[0][colName] = newValue;
                }
                thisWidget.setProperty('Data',{ dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: thisWidget.lastRows });
            } catch( err ) {
                TW.log.error('error updating column "' + colName + '"', err);
            }
        });
	};

    this.updateProperty = function (updatePropertyInfo) {
        var buildTable = function() {
            TW.emptyJqElement(thisWidget.jqElement);

            var formatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('Style', 'DefaultPropertyDisplayStyle'));
    		var propNameFormatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('PropertyNameColumnStyle', 'DefaultPropertyDisplayStyle'));
    		var propValueFormatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('PropertyValueColumnStyle', 'DefaultPropertyDisplayStyle'));
    		
    		// property table style
    		var cssPropDisplayBackground = TW.getStyleCssGradientFromStyle(formatResult);
    		var cssPropDisplayBorder = TW.getStyleCssBorderFromStyle(formatResult);
			
    		// property name column style 
    		var cssPropNameDisplayText = TW.getStyleCssTextualNoBackgroundFromStyle(propNameFormatResult);
    		var propNameTextSizeClass = TW.getTextSizeClassName(propNameFormatResult.textSize);
    		
    		// property value column style
    		var cssPropValueDisplayText = TW.getStyleCssTextualNoBackgroundFromStyle(propValueFormatResult);
            var propValueTextSizeClass = TW.getTextSizeClassName(propValueFormatResult.textSize);
    		
    		// property name column percentage width
    		var propNameColumnWidth = thisWidget.getProperty("PropertyNameWidth");
    		
    		var styleBlock = '<style>' +
				'#' + thisWidget.jqElementId + ' .component-table tbody td:first-child {width: ' + propNameColumnWidth + '%;} ' +
				'#' + thisWidget.jqElementId + ' .component-table tbody td{' + cssPropDisplayBackground + cssPropDisplayBackground +
				    cssPropDisplayBorder + ' border-left: none; border-right: none; border-top: none; border-bottom: none;}' +
				'#' + thisWidget.jqElementId + ' .property-name {' + cssPropNameDisplayText + '} ' +
				'#' + thisWidget.jqElementId + ' .property-value {' + cssPropValueDisplayText + '}' +
				'</style>';
    		
            thisWidget.lastRows = updatePropertyInfo.ActualDataRows;
            thisWidget.lastDatashape = updatePropertyInfo.DataShape;

            thisWidget.jqElement.html(styleBlock + buildInfotableHtml({
				dataShape: { 
					fieldDefinitions: updatePropertyInfo.DataShape
				},
				rows: updatePropertyInfo.ActualDataRows,
				textSizeClass: {
					propNameTextSizeClass: propNameTextSizeClass,
					propValueTextSizeClass: propValueTextSizeClass
				}
			}));
			
            if( thisWidget.allowEditing ) {
                _.each(thisWidget.jqElement.find('.property-value[base-type="NUMBER"]','.property-value[base-type="INTEGER"]','.property-value[base-type="LONG"]'),function(el) {
                    var el = $(el);
                    var colName = el.attr('field-name');
                    var baseType = el.attr('base-type');


                    el.widget({
                        widgetProperties: {
                            "Interval": 0,
                            "Top" : 0,
                            "NumericEntryFocusStyle" : "DefaultFocusStyle",
                            "Visible" : true,
                            "ValueAlign" : "right",
                            "__TypeDisplayName" : "Numeric Entry",
                            "ResponsiveLayout" : false,
                            "TabSequence" : 0,
                            "Type" : "numericentry",
                            "Maximum" : 100,
                            "Area" : "UI",
                            "Style" : "DefaultTextBoxStyle",
                            "Z-index" : 10,
                            "Height" : 24,
                            "AllowDecimals" : ((baseType === 'INTEGER' || baseType === 'LONG') ? false : true),
                            "DisplayName" : "NumericEntry-2",
                            "Left" : 0,
                            "AllowNegatives" : true,
                            "NumericEntryLabelStyle" : "DefaultWidgetLabelStyle",
                            "__supportsLabel" : true,
                            "FixedDigits" : 0,
                            "Minimum" : 0,
                            "Id" : "NumericEntry-" + TW.uniqueId(),
                            "Label" : "",
                            "Width" : 200,
                            "ConstrainValue" : false,
                            "Value": thisWidget.lastRows[0][colName] || 0
                        },
                        info: {
                            colName: colName.substring(0)
                        },
                        propertyUpdated: function (name, value, info) {
                            if (name === 'Value') {
                                thisWidget.lastRows[0][info.colName] = value;
                                thisWidget.setProperty('Data', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: thisWidget.lastRows });
                            }
                        }
                    });
                });

                _.each(thisWidget.jqElement.find('.property-value[base-type="DATETIME"]'),function(el) {
                    var el = $(el);
                    var colName = el.attr('field-name');
                    var dateTimeToUse = thisWidget.lastRows[0][colName];
                    if (dateTimeToUse === undefined || isNaN(dateTimeToUse.getTime())) {
                        dateTimeToUse = undefined;
                    }

                    el.widget({
                        widgetProperties: {
                            "Top": 0,
                            "Interval": 0,
                            "Visible": true,
                            "__TypeDisplayName": "Date Time Picker",
                            "ResponsiveLayout": false,
                            "Type": "datetimepicker",
                            "TabSequence": 0,
                            "Area": "UI",
                            "Style": "DefaultTimePickerStyle",
                            "Z-index": 10,
                            "Height": 28,
                            "DateOnly": false,
                            "DisplayName": "DateTimePicker-1",
                            "Left": 0,
                            "__supportsLabel": true,
                            "InitializeWithCurrentDateTime": true,
                            "DateTime": dateTimeToUse,
                            "IntervalType": "h",
                            "Id": "DateTimePicker-" + TW.uniqueId(),
                            "Label": "",
                            "Width": 200
                        },
                        info: {
                            colName: colName.substring(0)
                        },
                        propertyUpdated: function (name, value, info) {
                            if (name === 'DateTime') {
                                thisWidget.lastRows[0][info.colName] = value;
                                thisWidget.setProperty('Data', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: thisWidget.lastRows });
                            }
                        }
                    });
                });

                _.each(thisWidget.jqElement.find('.property-value[base-type="TAGS"]'),function(el) {
                    var el = $(el);
                    var colName = el.attr('field-name');
                    var tagsToUse = thisWidget.lastRows[0][colName];

                    el.widget({
                        widgetProperties: {
                            "Top" : 0,
                            "MultiSelect" : true,
                            "__TypeDisplayName" : "Tag Picker",
                            "Visible" : true,
                            "ResponsiveLayout" : false,
                            "Type" : "tagpicker",
                            "Area" : "UI",
                            "Height" : 24,
                            "Z-index" : 10,
                            "DisplayName" : "TagPicker-1",
                            "TagType" : el.attr('tag-type'),
                            "Left" : 0,
                            "Id" : "TagPicker-" + TW.uniqueId(),
                            "VocabularyRestriction" : "",
                            "Width" : 35,
                            "Tags": tagsToUse
                        },
                        info: {
                            colName: colName.substring(0)
                        },
                        propertyUpdated: function (name, value, info) {
                            if (name === 'Tags') {
                                thisWidget.lastRows[0][info.colName] = value;
                                thisWidget.setProperty('Data', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: thisWidget.lastRows });
                            }
                        }
                    });

                });

                _.each(thisWidget.jqElement.find('.property-value[base-type="THINGNAME"],.property-value[base-type="THINGSHAPENAME"],.property-value[base-type="THINGTEMPLATENAME"],.property-value[base-type="USERNAME"]'),function(el) {
                    var el = $(el);
                    var colName = el.attr('field-name');
                    var baseType = el.attr('base-type');
                    var entityType = "Things";

                    switch( baseType ) {
                        case 'THINGNAME':
                            entityType = "Things";
                            break;
                        case 'THINGTEMPLATENAME':
                            entityType = "ThingTemplates";
                            break;
                        case 'THINGSHAPENAME':
                            entityType = "ThingShapes";
                            break;
                        case 'USERNAME':
                            entityType = "Users";
                            break;
                    }
                    el.widget({
                        widgetProperties: {
                            "UseMostRecentlyUsed" : true,
                            "Top" : 0,
                            "FocusStyle" : "DefaultFocusStyle",
                            "Visible" : true,
                            "__TypeDisplayName" : "Entity Picker",
                            "ResponsiveLayout" : false,
                            "Type" : "entitypicker",
                            "SearchTerm" : "",
                            "TabSequence" : 0,
                            "Area" : "UI",
                            "Z-index" : 10,
                            "Height" : 30,
                            "DisplayName" : "EntityPicker-4",
                            "Left" : 0,
                            "SearchIncludesDescriptions" : true,
                            "ShowAdvanced" : true,
                            "EntityType" : entityType,
                            "Id" : "EntityPicker-" + TW.uniqueId(),
                            "Width" : 175,
                            "IncludeSystemObjects" : false,
                            Entity: thisWidget.lastRows[0][colName]
                        },
                        info: {
                            colName: colName.substring(0)
                        },
                        propertyUpdated: function (name, value, info) {
                            if (name === 'Entity') {
                                thisWidget.lastRows[0][info.colName] = value;
                                thisWidget.setProperty('Data', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: thisWidget.lastRows });
                            }
                        }
                    });

                });
            }
			
        };

        if (updatePropertyInfo.TargetProperty === 'DataForDatashapeIfNoRows') {
            if( thisWidget.lastDatashape === undefined ) {
                thisWidget.lastDatashape = updatePropertyInfo.DataShape;
            }
            if( thisWidget.dataHasArrived !== true && thisWidget.showEditorsIfNoRowData ) {
                buildTable();
            }
        } else if (updatePropertyInfo.TargetProperty === 'Data') {
            thisWidget.dataHasArrived = true;
            buildTable();
        }

    };
	
};
// ----END: extensions/PTC-Navigate-View-PLM-App-extension/ui/dynamicpropertydisplay/dynamicpropertydisplay.runtime.js

// ----BEGIN: extensions/PTC-Navigate-View-PLM-App-extension/ui/toggleButtonCheckBox/toggleButtonCheckbox.runtime.js
TW.Runtime.Widgets.toggleButtonCheckbox = function() {
    "use strict";
   var thisWidget = this,
      defaultState = undefined,
//      defaultVisible = undefined,
      defaultDisabled = undefined;

   this.runtimeProperties = function() {
      return {
         'needsDataLoadingAndError': false,
         'propertyAttributes': {
             'Prompt': {
                 'isLocalizable': true
             },
             'ToolTipField': {
                 'isLocalizable': true
             }
         }
      };
   };

    var bindToolTip = function () {
        let toolTipField = thisWidget.getProperty('ToolTipField');
        if($.trim(toolTipField) != ''){
            $("#" + thisWidget.jqElementId).tipTip({maxWidth: "auto",
                                                    edgeOffset: 10,
                                                    content: function() {
                                                       return thisWidget.getProperty('ToolTipField');
                                                    }});

        }
    }

   this.renderHtml = function() {

      var html,
      cssInfo = TW.getStyleCssTextualFromStyleDefinition(this.getProperty('Style', 'DefaultCheckboxStyle')),
      textSize = TW.getTextSizeFromStyleDefinition(this.getProperty('Style')),
      cssInfo = TW.getStyleCssTextualFromStyleDefinition(this.getProperty('Style')),
      prompt = (this.getProperty('Prompt') !== undefined ? Encoder.htmlEncode(this.getProperty('Prompt')) : ''),
      tabSequence = thisWidget.getProperty('TabSequence'),
      disabled = false;
      
      defaultState = (String(thisWidget.getProperty('State')) == "true") ? true : false;
//      defaultVisible = (String(thisWidget.getProperty('Visible')) == "false") ? false : true;
      defaultDisabled = (String(thisWidget.getProperty('Disabled')) == "true") ? true : false;
        
      if (thisWidget.getProperty('Disabled') === true && defaultState === true) {
          disabled = 'disabledON="true"';
      } else if (thisWidget.getProperty('Disabled') === true && defaultState === false){
          disabled = 'disabledOFF="true"';
      } else {
          disabled = '';
      }

      if (cssInfo.length > 0) {
         cssInfo = 'style="' + cssInfo + '"';
      }

      html = '<div class="widget-content widget-toggleButtonCheckbox ' + textSize + '" width="100%" height="100%" ' + cssInfo + '>'; 
      html += '<input type="checkbox" class="input-checkbox" id="' + this.jqElementId + '-input" ' + disabled + ' tabindex="' + tabSequence + '"></input>'; 
      html += '<label for="' + this.jqElementId + '-input"><span>' + prompt + '</span></label>'; 
      html += '</div>';
      
      return html;
   };

   this.afterRender = function() {

      var FocusStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('FocusStyle', 'DefaultFocusStyle'));
      var FocusBorder = TW.getStyleCssBorderFromStyle(FocusStyle);

      var styleBlock = '<style>' +
         '#' + this.jqElementId + '.focus label:before { ' + FocusBorder + ' }' +
      '</style>';

      $(styleBlock).prependTo(thisWidget.jqElement);

      var widgetElement = this.jqElement,
         checkboxElement = widgetElement.find('input'),
         widgetProperties = this.properties,
         widgetReference = this;

      checkboxElement.bind('change', function() {
         if (String(widgetReference.getProperty('Disabled')) == "false") {
           var newValue = checkboxElement.prop('checked');
           if (newValue === 'checked' || newValue === true) {
              widgetReference.setProperty('State', true);
           } else {
              widgetReference.setProperty('State', false);
           }
           widgetElement.triggerHandler('Changed');
         }
      });

      var curState = widgetReference.getProperty('State');
      if (String(curState) == "true") {
         checkboxElement.prop('checked', true);
         widgetReference.setProperty('State', true);
      } else {
         checkboxElement.prop('checked', false);
         widgetReference.setProperty('State', false);
      }
      
//      if (String(widgetReference.getProperty('Visible')) == "false") {
//         widgetElement.hide()
//      } else {
//         widgetElement.show();
//      }
      
      if (String(widgetReference.getProperty('Disabled')) == "true" && (String(curState) == "true")) {
         checkboxElement.prop('disabledON', true);
      } else if (String(widgetReference.getProperty('Disabled')) == "true" && (String(curState) == "false")) {
          checkboxElement.prop('disabledOFF', true);
      } else {
         checkboxElement.prop('enabled', false);
      }

      var widgetSelector = '#' + this.jqElementId + ' .input-checkbox';
      var widgetContainer = '#' + this.jqElementId;

      $(widgetSelector).on('focusin', function () {
          $(widgetContainer).addClass('focus');
      });

      $(widgetSelector).on('blur', function (e) {
          $(widgetContainer).removeClass('focus');
         
      });

      bindToolTip();

   };

   this.updateProperty = function(updatePropertyInfo) {

      if (updatePropertyInfo.TargetProperty === "Top" || 
          updatePropertyInfo.TargetProperty === "Left" || 
          updatePropertyInfo.TargetProperty === "Width" || 
          updatePropertyInfo.TargetProperty === "Height") {

         this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue);
         this.jqElement.css(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue + "px");
// To do: Need to check logic of the following line.
      } else if (updatePropertyInfo.TargetProperty === "State" && this.getProperty('Disabled') === false) {
            if (String(updatePropertyInfo.SinglePropertyValue) == "true") {
                 this.jqElement.find('input').prop('checked', true);
                this.setProperty('State', true);
             } else {
                this.jqElement.find('input').prop('checked', false);
                this.setProperty('State', false);
         }
      } else if (updatePropertyInfo.TargetProperty === "Disabled") {

        if (String(updatePropertyInfo.SinglePropertyValue) == "true") {
            if (this.getProperty('State') === true) {
                this.jqElement.find('input').attr('disabledON', true);
            } else {
                this.jqElement.find('input').attr('disabledOFF', true);
            }
            this.setProperty('Disabled', true);
         } else {
            this.jqElement.find('input').removeAttr('disabledON');
            this.jqElement.find('input').removeAttr('disabledOFF');
            this.setProperty('Disabled', false);
         }

      } else if (updatePropertyInfo.TargetProperty === 'ToolTipField') {
            thisWidget.setProperty('ToolTipField', updatePropertyInfo.SinglePropertyValue);
            bindToolTip();
      }

//      } else if (updatePropertyInfo.TargetProperty === "Visible") {
//
//         if (String(updatePropertyInfo.SinglePropertyValue) == "true") {
//            this.jqElement.show();
//            this.setProperty('Visible', true);
//         } else {
//            this.jqElement.hide();
//            this.setProperty('Visible', false);
//         }
   };

   this.resetInputToDefault = function() {
      var checkboxElement = thisWidget.jqElement.find('input');
      
      if (defaultState === true) {
         checkboxElement.prop('checked', true);
         thisWidget.setProperty('State', true);
      } else {
         checkboxElement.prop('checked', false);
         thisWidget.setProperty('State', false);
      }
      
//      if (defaultVisible === true) {
//         this.jqElement.show();
//         this.setProperty('Visible', true);
//      } else {
//         this.jqElement.hide();
//         this.setProperty('Visible', false);
//      }
      
      if (defaultDisabled === true) {
         this.jqElement.find('input').prop('disabled', true);
         this.setProperty('Disabled', true);
      } else {
         this.jqElement.find('input').prop('disabled', false);
         this.setProperty('Disabled', false);
      }
   };

   this.beforeDestroy = function() {
      try {
         var checkboxElement = this.jqElement.find('input');
         checkboxElement.unbind();
      } catch (err) {
         TW.log.error('Error in TW.Runtime.Widgets.checkbox.beforeDestroy', err);
      }
   };
};
// ----END: extensions/PTC-Navigate-View-PLM-App-extension/ui/toggleButtonCheckBox/toggleButtonCheckbox.runtime.js

// ----BEGIN: extensions/PTC-Navigate-View-PLM-App-extension/ui/listshuttle/listshuttle.runtime.js
TW.Runtime.Widgets.listshuttle = function () {
    "use strict";
    var thisWidget = this,
    	scrollBarWidth = null,
        leftGrid,
        rightGrid,
        valueFieldName = undefined,
        displayFieldName = undefined,
        leftRowData = undefined,
        rightRowData = new Array(),
        leftInitialItems = undefined,
        eventNs,
		maxNumAttributes,
		keys = {},
		timeStampBefore = {},
		prevKey = {},
        isMultiselect = false,
        domElementIdOfLeftList,
        domElementIdOfRightList
   
    this.runtimeProperties = function () {
        var props = {
            'needsDataLoadingAndError': true
        };
        return props;
    };

    this.renderHtml = function () {
        var html = '';
	        html = '<div class="widget-content widget-listshuttle data-nodata" >'
			+ '<div class="listshuttle-wrapper">'
			+ '<div class="leftlist-container">' + '</div>'
            + '<div class="shuttle-button-container">'
			+ '<button class="shuttle-button-moveToRight">' + '</button>'
			+ '<button class="shuttle-button-moveToLeft">' + '</button>' + '</div>'
			+ '<div class="rightlist-container">' + '</div>'
			+ '<div class="shuttle-button-container">'
			+ '<button class="shuttle-button-up">' + '</button>'
			+ '<button class="shuttle-button-down">' + '</button>' + '</div>'
			+ '</div>' + '</div>'; 
        return html;
    };
    
    // http://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
    // scrollbarWidth = offsetWidth - clientWidth - getComputedStyle().borderLeftWidth - getComputedStyle().borderRightWidth
    // I'm getting the approximately value here because of the complexity of the grid components we are using, should accurate enough
    this.getScrollBarWidth = function(){
        if(!scrollBarWidth){
          var inner = document.createElement('p');
          inner.style.width = "100%";
          inner.style.height = "200px";

          var outer = document.createElement('div');
          outer.style.position = "absolute";
          outer.style.top = "0px";
          outer.style.left = "0px";
          outer.style.visibility = "hidden";
          outer.style.width = "200px";
          outer.style.height = "150px";
          outer.style.overflow = "hidden";
          outer.appendChild(inner);

          document.body.appendChild(outer);
          var w1 = inner.offsetWidth;
          outer.style.overflow = 'scroll';
          var w2 = inner.offsetWidth;
          if (w1 == w2) w2 = outer.clientWidth;

          document.body.removeChild(outer);

          scrollBarWidth = w1 - w2;
        }
        return scrollBarWidth;
    };

    this.afterRender = function () {
        // dhtmlxgrid needs an ID to work off of ... we will create an ID based
		// on the ID of the widget itself and pass that to dhtmlxgrid
        var widgetElement = thisWidget.jqElement;
        var domElementId = thisWidget.jqElementId;
        eventNs = thisWidget.jqElementId;
        var ListLabelStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListLabelStyle', 'DefaultWidgetLabelStyle'));
        var ListLabel = TW.getStyleCssTextualNoBackgroundFromStyle(ListLabelStyle);
        var ListLabelSize = TW.getTextSize(ListLabelStyle.textSize);
        var ListLabelAlignment = this.getProperty('LabelAlignment', 'left');
		var ListLabelStyleBlock =
            '<style>' +
                '#' + domElementId + '-bounding-box .runtime-widget-label { '+ ListLabel + ListLabelSize + ' text-align: ' + ListLabelAlignment + ' }' +
            '</style>';

		$(ListLabelStyleBlock).prependTo(widgetElement);

        domElementIdOfLeftList = domElementId + '-leftlist';
        domElementIdOfRightList = domElementId + '-rightlist';
 
        if (thisWidget.getProperty('MultiSelect')) {
	            isMultiselect = true;
	    };
            
        var rowHeight = this.getProperty('RowHeight') || 30;

        valueFieldName = this.getProperty('ValueField');
        displayFieldName = this.getProperty('DisplayField');
        if (valueFieldName === undefined) {
            valueFieldName = displayFieldName;
        }
		var formatListBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListBackgroundStyle', 'ShuttleListBackgroundStyle'));
		var formatListItemResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemStyle', 'PTC.AccessApp.NormalTextStyle'));
		var formatListItemAlternateResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemAlternateStyle', 'DefaultListItemAlternateStyle'));
		var formatListItemHoverResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemHoverStyle', 'DefaultListItemHoverStyle'));
		var formatListItemSelectedResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ListItemSelectedStyle', 'DefaultListItemSelectedStyle'));

		var cssListBackground = TW.getStyleCssGradientFromStyle(formatListBackgroundResult);
		var cssListBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListBackgroundResult);
		var cssListBackgroundBorder = TW.getStyleCssBorderFromStyle(formatListBackgroundResult);
		var cssListItem = TW.getStyleCssGradientFromStyle(formatListItemResult);
		var cssListItemText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemResult);
        var cssListItemTextSize = TW.getTextSize(formatListItemResult.textSize);
        var cssListItemBorder = TW.getStyleCssBorderFromStyle(formatListItemResult);
		var cssListItemAlternate = TW.getStyleCssGradientFromStyle(formatListItemAlternateResult);
		var cssListItemAlternateText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemAlternateResult);
		var cssListItemHover = TW.getStyleCssGradientFromStyle(formatListItemHoverResult);
		var cssListItemHoverText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemHoverResult);
		var cssListItemSelected = TW.getStyleCssGradientFromStyle(formatListItemSelectedResult);
		var cssListItemSelectedText = TW.getStyleCssTextualNoBackgroundFromStyle(formatListItemSelectedResult);

		var styleBlock =
			'<style>' +
				//these styles are for the widget in list mode
                '#' + domElementId + ' .listshuttle-wrapper{' + cssListBackgroundBorder + '}' +
				'#' + domElementId + ' .gridbox { ' + cssListBackground + cssListBackgroundText + ' } ' +
				'#' + domElementId + ' .obj td { ' + cssListItem + cssListItemText + cssListItemTextSize + cssListItemBorder + 'border-top: none; border-left: none; border-right: none; } ' +
				'#' + domElementId + ' .obj tr.even td {'+ cssListItemAlternate + cssListItemAlternateText +'}' +
				'#' + domElementId + ' .obj tr:hover td {'+ cssListItemHover + cssListItemHoverText +'}' +
				'#' + domElementId + ' .obj tr.rowselected td {'+ cssListItemSelected + cssListItemSelectedText +'}' +
                '</style>';

		$(styleBlock).prependTo(widgetElement);

        thisWidget.jqElement.find('.leftlist-container').attr('id', domElementIdOfLeftList);
        thisWidget.jqElement.find('.rightlist-container').attr('id', domElementIdOfRightList);
        
        var colModel = [];
        var colFormat = thisWidget.getProperty('ListFormat');
        var alignment = thisWidget.getProperty('Alignment');
        
        var gridHeader = '';
        var gridInitWidths = '';
        var gridColAlign = '';
        var gridColTypes = '';
        var gridColSorting = '';
        var nColumns = 0;

        if (displayFieldName !== undefined) {
            if (colFormat === undefined) {
                var overallWidth = this.getProperty('Width');
                gridHeader += '';
                gridInitWidths += '*';
                colModel.push({ name: displayFieldName, width: 'auto', label: displayFieldName, sortable: false, formatoptions: {renderer: "DEFAULT" }});
                gridColAlign += alignment;
                gridColTypes += 'twcustom';
                gridColSorting += 'str';
                nColumns++;
            } else {
                var thisWidth = 100;
                colModel.push({ name: displayFieldName, label: '', width: thisWidth, align: alignment, sortable: false, formatoptions: colFormat });
                gridHeader += '';
                gridInitWidths += '*';
                gridColAlign += alignment;
                gridColTypes += 'twcustom';
                gridColSorting += 'str';
                nColumns++;
            }
        } else {
            gridHeader = "Must select DisplayField";
            gridInitWidths = "*";
            gridColAlign = "left";
            gridColTypes = "ro";
            gridColSorting = "str";
        }
        const timeoutForWaitingDblClickFromUser = 250;
        leftGrid = new dhtmlXGridObject(domElementIdOfLeftList);
        leftGrid.enableKeyboardSupport(true);
        leftGrid._colModel = colModel;
        leftGrid.setImagePath("/Thingworx/Common/dhtmlxgrid/codebase/imgs/");

        leftGrid.setHeader(gridHeader);
        leftGrid.setInitWidths(gridInitWidths);
        leftGrid.setColAlign(gridColAlign);
        leftGrid.setColTypes(gridColTypes);
        leftGrid.setCustomSorting(sortStringAscending);					// custom in-house sorting method
        leftGrid.setNoHeader(true);
        leftGrid.init();
        leftGrid.setAwaitedRowHeight(rowHeight);
		leftGrid.enableAlterCss('even', 'uneven');
        leftGrid.adjustColumnSize(0);
        // to avoid scroll-down step on last-in-view cell/row selection
        leftGrid.dhtmlXGridMoveToVisible = leftGrid.moveToVisible;
        leftGrid.moveToVisible = function(cell){
            leftGrid.clickTimer = setTimeout(function() { leftGrid.dhtmlXGridMoveToVisible(cell); }, timeoutForWaitingDblClickFromUser);
            return true;
        };
        leftGrid.enableMultiselect(isMultiselect);

        rightGrid = new dhtmlXGridObject(domElementIdOfRightList);
        rightGrid.enableKeyboardSupport(true);
        rightGrid._colModel = colModel;
        rightGrid.setImagePath("/Thingworx/Common/dhtmlxgrid/codebase/imgs/");

        rightGrid.setHeader(gridHeader);
        rightGrid.setInitWidths(gridInitWidths);
        rightGrid.setColAlign(gridColAlign);
        rightGrid.setColTypes(gridColTypes);
        rightGrid.setColSorting(gridColSorting);
        rightGrid.setNoHeader(true);
        rightGrid.init();
        rightGrid.setAwaitedRowHeight(rowHeight);
		rightGrid.enableAlterCss('even', 'uneven');
        rightGrid.adjustColumnSize(0);
        // to avoid scroll-down step on last-in-view cell/row selection
        rightGrid.dhtmlXGridMoveToVisible = rightGrid.moveToVisible;
        rightGrid.moveToVisible = function(cell){
            rightGrid.clickTimer = setTimeout(function() { rightGrid.dhtmlXGridMoveToVisible(cell); }, timeoutForWaitingDblClickFromUser);
            return true;
        };
        rightGrid.enableMultiselect(isMultiselect);


        disableReorderButtons(true, true);
        disableMovedButtons(true, true);
	    
	    thisWidget.jqElement.find('.shuttle-button-up').click(function() {
			var selectedId = rightGrid.getSelectedRowId();
			if(selectedId == null){
				return;
			}
			var selectedRowIndex = rightGrid.getRowIndex(selectedId);
			var selectedRow = rightRowData[selectedRowIndex];
			var oneUpIndex = selectedRowIndex-1;
			var oneUpRow = rightRowData[oneUpIndex];
			rightRowData[selectedRowIndex] = oneUpRow;
			rightRowData[oneUpIndex] = selectedRow;
			rightGrid.clearAll();
			rightGrid.parse(rightRowData, "custom_tw");
			rightGrid.selectRow(oneUpIndex,false, false, true, false);
            thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });
		});

		thisWidget.jqElement.find('.shuttle-button-down').click(function() {
			var selectedId = rightGrid.getSelectedRowId();
			if(selectedId == null){
				return;
			}
			var selectedRowIndex = rightGrid.getRowIndex(selectedId);
			var selectedRow = rightRowData[selectedRowIndex];
			var oneDownIndex = selectedRowIndex+1;
			var oneDownRow = rightRowData[oneDownIndex];
			rightRowData[selectedRowIndex] = oneDownRow;
			rightRowData[oneDownIndex] = selectedRow;
			rightGrid.clearAll();
			rightGrid.parse(rightRowData, "custom_tw");
			rightGrid.selectRow(oneDownIndex,false, false, true, false);
			thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });
			});
            
        thisWidget.jqElement.find('.shuttle-button-moveToRight').click(function() {
			var selectedId = leftGrid.getSelectedRowId();
			return moveRowFromLeftGridToRightGrid(selectedId);
		});
        
         thisWidget.jqElement.find('.shuttle-button-moveToLeft').click(function() {
			var selectedId = rightGrid.getSelectedRowId();
			return moveRowFromRightGridToLeftGrid(selectedId);
		});
        
		var leftDblClickFlag = false;									// 'semaphore' to avoid entering DblClick callback on quick multi clicks in 'available attributes' list
        leftGrid.attachEvent("onRowDblClicked", function(rId,cInd){
            clearTimeout(leftGrid.clickTimer);
            return moveRowFromLeftGridToRightGrid(rId);

        });
        
        var rightDblClickFlag = false;									// 'semaphore' to avoid entering DblClick callback on quick multi clicks in 'selected attributes' list 
		rightGrid.attachEvent("onRowDblClicked", function(rId,cInd){
            clearTimeout(rightGrid.clickTimer);
            return moveRowFromRightGridToLeftGrid(rId);
        });
        
        function moveRowFromLeftGridToRightGrid(rId){
        	if(rId<0 || rId==undefined )   // legality checks
        		return;		
			if(leftDblClickFlag == false)								// skip further operations if still handling previous dblClick 
        	{
				//the user can choose limitted number of attributes
				if (rightGrid.rowsBuffer.length < maxNumAttributes || maxNumAttributes == undefined ) { // =undefined: in apps that we don't want to limit the user
                    leftDblClickFlag = true;								// set flag up
                    var selectedRowIndicesAndIds = [[]];
                    var selectedRowIds = rId.toString().split(',');
                    // add left list selection to right list
                    for (var i = 0; i < selectedRowIds.length; i++) {
                        var rowIndex = leftGrid.getRowIndex(selectedRowIds[i]);
                        rightRowData.push(leftRowData[rowIndex]);
                        var row = rightGrid._prepareRow(selectedRowIds[i]);
                        rightGrid.rowsBuffer._dhx_insertAt(rightRowData.length - 1, processCustomTwRow(rightGrid, row, leftRowData[rowIndex]));
                        rightGrid._insertRowAt(row, rightRowData.length - 1);
                        rightGrid.selectRowById(selectedRowIds[i], true, true, true);
                        selectedRowIndicesAndIds[i] = [rowIndex, selectedRowIds[i]];
                    }

                    //remove left list selection from left list
                    deleteRemovedRows(leftGrid, leftRowData, selectedRowIndicesAndIds);

                    thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });  

					leftDblClickFlag = false;								// set flag down
					//set the length of the right list as parameter in the listShuttle
					thisWidget.setProperty('RightListLength', rightGrid.rowsBuffer.length);
                    if (maxNumAttributes != undefined && rightGrid.rowsBuffer.length >= maxNumAttributes) {
                        thisWidget.jqElement.find('.leftlist-container').addClass("disabled");
                    }

				//display an information msg to the user that he can't choose more attributes!
				} else {
					thisWidget.setProperty('RightListLength', -1);
				}

			}
		}

        function moveRowFromRightGridToLeftGrid(rId) {
        	if(rId<0 || rId==undefined)   // legality checks
        		return;
            if(rightDblClickFlag == false)								// skip further operations if still handling previous dblClick
			{
                rightDblClickFlag = true;								// set flag up
                var selectedRowIndicesAndIds = [[]];
                var selectedRowLabelsData = [];
                var selectedRowIds = rId.toString().split(',');
	        	// add right list selection to left list
                for (var i = 0; i < selectedRowIds.length; i++) {
                    var rowIndex = rightGrid.getRowIndex(selectedRowIds[i]);
                    leftRowData.push(rightRowData[rowIndex]);
                    let labelData = rightRowData[rowIndex];
                    labelData["index"] = rowIndex;
                    selectedRowLabelsData.push(labelData);
                    selectedRowIndicesAndIds[i] = [rowIndex, selectedRowIds[i]];
                }
                
	        	leftRowData.sort(sortStringAscending);
                selectedRowLabelsData.sort(sortStringAscending);
                for (var i = 0; i < selectedRowLabelsData.length; i ++) {
                    //find the index of the row that the user returned to the left Grid (the grid is sorted)
                    for (var j = 0; j < leftRowData.length; j ++) {
                        if (selectedRowLabelsData[i].label == leftRowData[j].label) {
                            var row = leftGrid._prepareRow(selectedRowIds[i]);
                            leftGrid.rowsBuffer._dhx_insertAt(j, processCustomTwRow(leftGrid, row, rightRowData[selectedRowLabelsData[i].index]));
                            leftGrid._insertRowAt(row, j);
                            leftGrid.selectRowById(selectedRowIds[i], true, true, true);
                            break;
                        }
                    }
                }
                //remove right list selection from right list
                deleteRemovedRows(rightGrid, rightRowData, selectedRowIndicesAndIds);

	            thisWidget.setProperty('SelectedItems', { dataShape: { fieldDefinitions: thisWidget.lastDatashape }, rows: rightRowData });
                disableMovedButtons(false, true);
                
	            rightDblClickFlag = false;								// set flag down
				//set the number of selected attributes
				thisWidget.setProperty('RightListLength', rightGrid.rowsBuffer.length);
                if (rightGrid.rowsBuffer.length < maxNumAttributes) {
                    thisWidget.jqElement.find('.leftlist-container').removeClass("disabled");
                }
			}
        }

         function deleteRemovedRows(grid, RowData, selectedRowIndicesAndIds) {
            selectedRowIndicesAndIds.sort(function(a, b) {return a[0] - b[0]});
            for (var i = selectedRowIndicesAndIds.length - 1 ; i >= 0; i--) {
                RowData.splice(selectedRowIndicesAndIds[i][0], 1);
                grid.deleteRow(selectedRowIndicesAndIds[i][1]);
                delete grid.rowsAr[selectedRowIndicesAndIds[i][1]];
            }
        }

        leftGrid.attachEvent("onKeyPress", function (code, ctrlFlag, shiftFlag, keyboardEvent) {
                return onKeyPress(code, ctrlFlag, shiftFlag, keyboardEvent, leftGrid)
        });

        rightGrid.attachEvent("onKeyPress", function (code, ctrlFlag, shiftFlag, keyboardEvent) {
                return onKeyPress(code, ctrlFlag, shiftFlag, keyboardEvent, rightGrid)
        });

        const timeForWaitingUserNextPress = 1800;
        function onKeyPress(code, ctrlFlag, shiftFlag, keyboardEvent, grid) {
            var key = keyboardEvent.key.toUpperCase();
            //only if the key isnn't one of the special keys that we have a different behaviour for them.
            if(["ARROWDOWN", "DOWN", "ARROWUP", "UP", "PAGEDOWN", "PAGEUP", "END", "HOME", "SHIFT"].indexOf(key) < 0 && !ctrlFlag ) {
                let gridId = grid.entBox.id;
                var timeStampCur = keyboardEvent.timeStamp;
                var isFound = false;
                if (timeStampCur - timeStampBefore[gridId] < timeForWaitingUserNextPress) {
                    keys[gridId] += key;
                } else {
                    keys[gridId] = key;
                }

                var rowTitle, i;
                var index = grid.getSelectedRowId().toString().split(',');
                var indexSelected = grid.getRowIndex(index[index.length - 1]);
                if (prevKey[gridId] == key && keys[gridId].length <= 2) {
                    indexSelected++;
                    keys[gridId] = key;
                }
                /*in case the grid is unoserted, we can't only jump to the next row.
                we need to look for the index of the following row starting with the key we have.*/
                i = findNextRowIndexForPrefix(grid, indexSelected, grid.rowsBuffer.length, keys[gridId]);
                if(i < 0 ) {
                    //finding if there exists a row above the selected row. 
                    i = findNextRowIndexForPrefix(grid, 0, indexSelected, keys[gridId]);
                    if (i > -1) {
                        isFound = true;
                    }
                } else {
                    isFound = true;
                }

                if(isFound) {
                    grid.selectRow(i, false, false, true, false);
                } else {
                    keys[gridId] = "";
                }
                //saving the params for the next function call.
                prevKey[gridId] = key;
                timeStampBefore[gridId] = timeStampCur;
            }
            //for saving on all the regular functionalities ('page down', 'page up', 'down', 'up', 'tab', 'home' and 'end')
            return true;
        }
        
        function findNextRowIndexForPrefix(grid, indexStart, indexEnd, prefix) {
            var index = -1;
            for(let i = indexStart ; i < indexEnd; i ++) {
                let rowTitle = grid.rowsBuffer[i].textContent.toUpperCase();
                if (rowTitle.substring(0, prefix.length) === prefix){
                    index = i;
                    break;
                }
            }
            return index;
        }

        leftGrid.attachEvent("onMouseOver", function(id,ind){
            var cell = this.cellById(id, ind);
            $(cell.cell).attr('title', cell.getValue());
        });

        rightGrid.attachEvent("onMouseOver", function(id,ind){
            var cell = this.cellById(id, ind);
            $(cell.cell).attr('title', cell.getValue());
        });

        rightGrid.attachEvent('onSelectStateChanged', function(id, ind) {
			var rowIndex = rightGrid.getRowIndex(id);
			// ignoreSelectionChanges is set to true while we're internally manipulating selected rows
			if (!thisWidget.ignoreSelectionChanges) {
				validateReorderButtons(rowIndex);
                var isDisabledMoveLeftBtn = id != null ? false : true;
                disableMovedButtons(true, isDisabledMoveLeftBtn);
                leftGrid.clearSelection();
                //updating the length of the rightGrid in case it is set to be the '-2' flag
                thisWidget.setProperty('RightListLength', rightGrid.rowsBuffer.length);
			}
		});
        
        leftGrid.attachEvent('onSelectStateChanged', function(id, ind) {
			// ignoreSelectionChanges is set to true while we're internally manipulating selected rows
			if (!thisWidget.ignoreSelectionChanges ) {
                var isDisabledMoveRightBtn = true;
                if (id != null) {
                    var selectedRowIds = id.toString().split(',');
                    isDisabledMoveRightBtn = (rightGrid.rowsBuffer.length + selectedRowIds.length <= maxNumAttributes || maxNumAttributes == undefined ) ? false : true;
                    //the '-2' is the flag for the case the user selectes in the left grid more rows than the right grid can to contained.
                    var length = !isDisabledMoveRightBtn ||  rightGrid.rowsBuffer.length >= maxNumAttributes? rightGrid.rowsBuffer.length : -2;   
                    thisWidget.setProperty('RightListLength', length);
                }
               disableMovedButtons(isDisabledMoveRightBtn, true);
               disableReorderButtons(true, true);
               rightGrid.clearSelection();
			}
		});
        
		function validateReorderButtons(rowIndex) {
			var lastRowIndex = rightGrid.getRowsNum() - 1;
			// only 1 row, disable both buttons
			if (lastRowIndex == 0) {
				disableReorderButtons(true, true);
				return;
			}
			switch (rowIndex) {
			// no row selected, disable both buttons
			case -1:
				disableReorderButtons(true, true);
				break;
			// top row selected, disable up button
			case 0:
				disableReorderButtons(true, false);
				break;
			// last row selected, disable down button
			case lastRowIndex:
				disableReorderButtons(false, true);
				break;
			default:
				disableReorderButtons(false, false);
			}
		}
		
		function disableReorderButtons(upButtonDisabled, downButtonDisabled) {
			thisWidget.jqElement.find('.shuttle-button-up').prop('disabled',
					upButtonDisabled);
			thisWidget.jqElement.find('.shuttle-button-down').prop('disabled',
					downButtonDisabled);
		}
        
        function disableMovedButtons(leftButtonDisabled, rightButtonDisabled) {
            thisWidget.jqElement.find('.shuttle-button-moveToRight').prop('disabled',
					leftButtonDisabled);
			thisWidget.jqElement.find('.shuttle-button-moveToLeft').prop('disabled',
					rightButtonDisabled);
		}
        
        // special function for parsing the data from Thingworx back-end
        leftGrid._process_custom_tw = rightGrid._process_custom_tw = function (data) {
            this._parsing = true;
            var rows = data;                  // get all row elements from data
            for (var i = 0; i < rows.length; i++) {
                var id = this.getUID();                                // XML doesn't have native ids, so custom ones will be generated
                this.rowsBuffer[i] = {                                   // store references to each row element
                    idd: id,
                    data: rows[i],
                    _parser: this._process_custom_tw_row   // cell parser method
                    //_locator: this._get_custom_tw_data        // data locator method
                };
                this.rowsAr[id] = rows[i];                             // store id reference
            }
            //set the number of selected attributes when the mashup loads.
            var len = rightGrid.rowsBuffer.length;
            thisWidget.setProperty('RightListLength', len);

			this.render_dataset();                                   // force update of grid's view after data loading
            this._parsing = false;
        }

    // special function for parsing each row of the data from Thingworx back-end
    leftGrid._process_custom_tw_row = rightGrid._process_custom_tw_row = function (r, data) {
            return processCustomTwRow(this, r,data);
        }
        };
    
    function processCustomTwRow(grid, r, data) {
        var colModel = grid._colModel;
        var strAr = [];
        var maxWidthCell = leftGrid.cellWidthPX;
        var textWidth = leftGrid.fontWidth;
        var ellipsis = "...";
        
        for (var i = 0; i < colModel.length; i++) {
            strAr.push({ Value: data[colModel[i].name], leftRowData: data, ColumnInfo: colModel[i], RowHeight: grid._srdh });
        }
        //calculating the max length of the attribute according the size their padding and the scrollBar width (assume that will be a scrollBar ..)
        var maxLengthDataLabel = (maxWidthCell - thisWidget.getScrollBarWidth() - colModel[0].padding) / textWidth;
        
        // set just a plain array as no custom attributes are needed
        r._attrs = {};
        for (let j = 0; j < r.childNodes.length; j++) {
            r.childNodes[j]._attrs = {};
            //set a tooltip for long length attributes.
            if (data.label.length > maxLengthDataLabel) {
                strAr[j].Value = data.label.substring(0, maxLengthDataLabel - ellipsis.length) + ellipsis;
            }
        }
        // finish data loading 
        grid._fillRow(r, strAr);
        r.cells[0].firstChild.title = data.label;
        return r;
    }

    this.updateProperty = function(updatePropertyInfo) {
		var thisWidget = this;
		if (updatePropertyInfo.TargetProperty === "LeftListData") {
			thisWidget.lastDatashape = updatePropertyInfo.DataShape;
			leftRowData = updatePropertyInfo.ActualDataRows;
			leftGrid.clearAll();
			if (displayFieldName !== undefined && displayFieldName.length > 0) {
				leftRowData.sort(sortStringAscending);
				leftGrid.parse(leftRowData, "custom_tw");
				if (leftInitialItems === undefined) {
					// set initial available items in property
					leftInitialItems = leftRowData.slice();
					thisWidget.setProperty('AvailableItems', {
						dataShape : {
							fieldDefinitions : thisWidget.lastDatashape
						},
						rows : leftInitialItems
					});
				}
			}
			// remove items from left list contained in right list
			removeCommonItemsFromLeftList();

            // update the 'disabled' style according the length of the right list.
            if (maxNumAttributes != undefined && rightGrid.rowsBuffer.length >= maxNumAttributes) {
                thisWidget.jqElement.find('.leftlist-container').addClass("disabled");
                len = -1;
            } else {
                thisWidget.jqElement.find('.leftlist-container').removeClass("disabled");
            }

            //select by default the first row in the list.
            leftGrid.selectRow(0 ,false, false, true, false);
		} else if (updatePropertyInfo.TargetProperty === "RightListData") {
			rightRowData = updatePropertyInfo.ActualDataRows;
			thisWidget.setProperty('SelectedItems', {
				dataShape : {
					fieldDefinitions : updatePropertyInfo.DataShape
				},
				rows : rightRowData
			});
			rightGrid.clearAll();
			if (displayFieldName !== undefined && displayFieldName.length > 0) {
				rightGrid.parse(rightRowData, "custom_tw");
			}
			// remove items from left list contained in right list
			removeCommonItemsFromLeftList();
		}
		//set the value of the maximum number of attributes the user can select.
		//(just in the apps we want to limit, otherwise, this parameter isn't binded and it stays with undefined value).
		else if (updatePropertyInfo.TargetProperty === "MaxAttributesToSelect") {
			thisWidget.setProperty('MaxAttributesToSelect', updatePropertyInfo.SinglePropertyValue);
			maxNumAttributes = thisWidget.getProperty("MaxAttributesToSelect");
		}
	};

    this.beforeDestroy = function () {
        try {
            leftRowData = null;
            rightRowData = null;
            if (leftGrid !== undefined && leftGrid !== null) {
                leftGrid.destructor();
                leftGrid = null;
            }
            if (rightGrid !== undefined && rightGrid !== null) {
            	rightGrid.destructor();
            	rightGrid = null;
            }
        }
        catch (destroyErr) {
        }
    };
    
    // characters in order for special sorting with special-signs at beginning, then digits, then abc ascending
	var  sorting_order = ',-;:!?()@*/\#`%+[]{}<>$_.^&=|~01234567989abcdefghijklmnopqrstuvwxyz';

    // custom method for sorting:
    // sort alphabetically (ignore case) in ascending order according to defined (sorting_order) order string
	function sortStringAscending(a, b) {

		// ignoring case
		var a_low = a[displayFieldName].toLowerCase();
		var b_low = b[displayFieldName].toLowerCase();

		// compare to index in 'special order' sorting
        var index_a = sorting_order.indexOf(a_low[0]);
        var index_b = sorting_order.indexOf(b_low[0]);
        
        // same first character, sort regularly (ASCII)
        if (index_a === index_b) {
            if (a_low < b_low) {
                return -1;
            } else if (a_low > b_low) {
                return 1;
            }
            return 0;
        } else {
        	return  (index_a - index_b) > 0 ? 1 : -1;
        }

	}

	function removeDuplicates(a, b) {
		b = b.filter(function(item) {
			for (var i = 0, len = a.length; i < len; i++) {
				if (a[i][valueFieldName] === item[valueFieldName]) {
					return false;
				}
			}
			return true;
		});
		return b;
	}
	
	function removeCommonItemsFromLeftList() {
		if (leftRowData != undefined && rightRowData != undefined){
			var leftListNoDuplicates = removeDuplicates(rightRowData, leftRowData);
			leftRowData = leftListNoDuplicates;
			leftGrid.clearAll();
			leftGrid.parse(leftRowData, "custom_tw");
		}
	}
       
};
// ----END: extensions/PTC-Navigate-View-PLM-App-extension/ui/listshuttle/listshuttle.runtime.js

// ----BEGIN: extensions/ptc-task-progress-widget/ui/task-progress-component-widget/task-progress-component-widget.config.js
(function (TW) {
  let widgetName = "task-progress-component-widget";
  let defaultValue = {};

    let config = {
                  //elementName control the Type property and the widget
                  // name which will be display on the composer.
                  // It must be the same as the web element name
                "elementName": "task-progress",
                "htmlImports": [
                  {
                    "id": "task-progress",
                    "url": "task-progress/task-progress.js",
                    "version": "^1.0.0"
                  }
                ],
                "properties": {
                    // Properties definitions settings.
                    // Can change from here the default properties values.
                    "Configuration": {
                        "baseType":"JSON",
                        "isBindingTarget":true,
                        "isVisible": false,
                        "defaultValue": JSON.stringify(defaultValue)
                    },
                    "InputData": {
                        "baseType":"STRING",
                        "isBindingTarget":true
                    }
                },
                "flags": {
                    "customEditor": "TaskProgressCustomEditor",
                    "customEditorMenuText": getLocalizedString("[[PTC.TaskProgressComponent.ConfigureTaskProgress]]"),
                    "name": getLocalizedString("[[PTC.TaskProgressComponent.Name]]"),
                    "description": getLocalizedString("[[PTC.TaskProgressComponent.ToolTip]]"),
                    "supportsAutoResize": true,
                    "category": ["Beta"]
                },

                // Concatenating widgetName to rootPath to find the ui files
                  // Should be the same as the widget name
                "widgetName": "task-progress-component-widget",
                "extensionName": "ptcs-widget-ext",
                "rootPath": "/Thingworx/Common/extensions/ptc-task-progress-widget/ui/",
                "imports": {
                  "task-progress": "../../../extensions/task-progress/task-progress.js"
                }
              };

  // Temporary widgetWrapper if not initialized
  TW.Widget.widgetWrapper = TW.Widget.widgetWrapper || {
    imports: [],
    configs: {},
    loadImports: function (imports) {
      this.imports.push(imports);
    },
    config: function (name, config) {
      if (config) {
        this.configs[name] = config;
      }
      return this.configs[name];
    }
  };

  TW.Widget.widgetWrapper.config(widgetName, config);
})(TW);

function getLocalizedString(inputString) {

    //To get the localized string for the key
    var localizedName = "";
    if ((inputString !== null) &&(inputString !== undefined)) {
        var TW = window.TW || {};
        localizedName = TW.Runtime.convertLocalizableString(inputString);
    }
    //If localized value not found, return label as is
    localizedName = (localizedName !== "" && localizedName !== "???") ? localizedName : inputString;
    return localizedName;
};
// ----END: extensions/ptc-task-progress-widget/ui/task-progress-component-widget/task-progress-component-widget.config.js

// ----BEGIN: extensions/ptc-task-progress-widget/ui/task-progress-component-widget/task-progress-component-widget.customdialog.ide.js

TW.IDE.Dialogs.TaskProgressCustomEditor = function (){

    var self = this;
    /*******************************************
    * Set the following parameters according to your Component
    ********************************************/
    this.componentName = "PTC.TaskProgress";
    this.defaultConfigurationName = "Default";
    //Set the following to something other then Configuration only for debugging
    this.configurationPropertyName = "Configuration";
    //*******************************************/

    this.initialConfiguration = {name:this.defaultConfigurationName, delta:{}};

    /**
     * Update the configuration property once "done" is clicked.
     * @param widgetObj - the widget object
     * @returns {boolean}
     */
    this.updateProperties = function(widgetObj) {
        var namedConfiguratoinComponent = $('#' + this.jqElementId + ' #named-configuration-component')[0];
        var configuration = namedConfiguratoinComponent.selectedConfiguration;

        widgetObj.setProperty(this.configurationPropertyName,
            configuration || widgetObj.getProperty(this.configurationPropertyName));

        return true;
    };

    /**
     * Calculates the HTML code for the configuration dialog.
     * @param widgetObj - the widget object
     * @returns {string}
     */
    this.renderDialogHtml = function (widgetObj) {
        var properties = widgetObj.properties;
        if (properties[this.configurationPropertyName] != null &&
            properties[this.configurationPropertyName] != undefined ){
            let configurationJson =
                (Object.prototype.toString.call(properties[this.configurationPropertyName]) === "[object String]" ?
                JSON.parse(properties[this.configurationPropertyName]) : properties[this.configurationPropertyName]);
            if (configurationJson.name != undefined){
                this.initialConfiguration.name = configurationJson.name;
                if (configurationJson.delta != undefined){
                    this.initialConfiguration.delta = configurationJson.delta;
                }
            }
        }
        var html = '<div>' +
            '<named-config id="named-configuration-component" component-name="'+this.componentName +'"' +
            '></named-config>' +
            '<div>';
        return html;
    };

    /**
     * Running after the HTML code from "renderDialogHtml" has rendered to the DOM.
     * Used to bind code to specific events pushed from the dialog HTML code.
     * @param domElementId
     */
    this.afterRender = function(domElementId) {
        this.jqElementId = domElementId;
        let jqComponent = $('#' + this.jqElementId + ' #named-configuration-component');
        jqComponent[0].selectedConfiguration = this.initialConfiguration;
        jqComponent.on('verified-changed',
            function(event){
                $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',!event.originalEvent.detail.value)
            }
        );
        $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',
            !jqComponent[0].verified);

    }
};
// ----END: extensions/ptc-task-progress-widget/ui/task-progress-component-widget/task-progress-component-widget.customdialog.ide.js

// ----BEGIN: extensions/ptc-task-progress-widget/ui/task-progress-component-widget/task-progress-component-widget.runtime.js
(function (widgetName, isIDE) {
  let widgets = isIDE ? TW.IDE.Widgets : TW.Runtime.Widgets;
  widgets[widgetName] = function () {
    let config = TW.Widget.widgetWrapper.config(widgetName);
    TW.Widget.widgetWrapper.inject(config.elementName, this, config, isIDE);

    //[ custom code

    //]
  };

  let config = TW.Widget.widgetWrapper.config(widgetName); // = config;
  TW.Widget.widgetWrapper.loadImports(config.imports);
})("task-progress-component-widget", false);
// ----END: extensions/ptc-task-progress-widget/ui/task-progress-component-widget/task-progress-component-widget.runtime.js

// ----BEGIN: extensions/ptc-thingview-extension/ui/thingview/creoview.runtime.js
/* bcwti
 *
 * Copyright (c) 2015-2019 PTC Inc.
 *
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * PTC Inc. and is subject to the terms of a software license agreement.
 * You shall not disclose such confidential information and shall use
 * it only in accordance with the terms of the license agreement.
 *
 * ecwti
 */

/* var s_runtimePluginVersion = "0.35.0-L6GCPs@master-dev"; */

TW.Runtime.Widgets.thingview = function() {
    var thisWidget = this;
    var baseUrl = './';
    var appliedFormatter = false;
    var formatter = thisWidget.getProperty('DataFormatter');
    this.BackgroundStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('BackgroundStyle', ''));
    var OccurrenceIdField = thisWidget.getProperty('OccurrenceField');
    if (!OccurrenceIdField) {
        OccurrenceIdField = 'treeId';
    }
    var app;
    var session;
    var localData;
    var dataLoadtimeoutCancelId;
    var instancesPromise = $.Deferred();
    thisWidget.selectedInstances = [];
    thisWidget.templateUrl = "";

    var selectionsIndex = [];
    var viewablesData = [];
    var firstLoad;

    thisWidget.setFormatter = function(f) {
        formatter = f;
    };

    /**
     * Creoview only accepts hex colors, this converts rgb to hex
     */
    function rgb2hex(red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1);
    }

    thisWidget.applyFormatter = function() {
        dataLoadtimeoutCancelId = null;
        if (localData && localData.length > 0 && formatter && thisWidget.modelWidget) {
            for (var i = 0; i < localData.length; i++) {
                var formatResult = TW.getStyleFromStateFormatting({DataRow: localData[i], StateFormatting: formatter});
                if (formatResult.foregroundColor) {
                    appliedFormatter = true;
                    var OccurrenceIdField = thisWidget.getProperty('OccurrenceField');
                    if (!OccurrenceIdField)
                        OccurrenceIdField = 'treeId';
                    var color = thisWidget.parseRGBA(formatResult.foregroundColor);
                    thisWidget.modelWidget.SetPartColor(localData[i][OccurrenceIdField], parseFloat(color[0]), parseFloat(color[1]), parseFloat(color[2]), parseFloat(color[3]), Module.ChildBehaviour.IGNORED, Module.InheritBehaviour.USE_DEFAULT);
                }
            }
        }
    };
    /**
     * Apply the formatter later as the model is being loaded at the same time
     */
    function applyFormatterWithDebounce() {
        if (dataLoadtimeoutCancelId) {
            clearTimeout(dataLoadtimeoutCancelId);
        }
        dataLoadtimeoutCancelId = setTimeout(thisWidget.applyFormatter, 100);
    }

    this.runtimeProperties = function() {
        return {
            'needsDataLoadingAndError': false
        };
    };


    this.renderHtml = function() {
        TW.log.info('Thing View Widget .renderHtml');
        var color = thisWidget.BackgroundStyle.backgroundColor;
        var html = '';
        html = '<div class="widget-content widget-thingview"\
                style="display:block;'
        if (color) {
            html += 'background-color: ' + color;
        }
        html += '">\
                <div class="thing-view-plugin-wrapper"></div>\
                </div>';
        return html;
    };

    this.afterRender = function() {
        if (window.MyThingView === undefined) {
            TW.log.info('Thing View Widget window.MyThingView: is undefined');
            window.MyThingView = new Object();
            window.MyThingView.thingViewEngineInitialised = false;
            window.MyThingView.thingViewEngineStarting = false;
        }
        TW.log.info('Thing View Widget window.MyThingView: ' + window.MyThingView);
        TW.log.info('Thing View Widget window.MyThingView.thingViewEngineInitialised: ' + window.MyThingView.thingViewEngineInitialised);
        TW.log.info('Thing View Widget window.MyThingView.thingViewEngineStarting: ' + window.MyThingView.thingViewEngineStarting);

        thisWidget.productToView = thisWidget.getProperty('ProductToView');
        thisWidget.baseUrl = thisWidget.getProperty('baseUrl');
        var wcDataSource = thisWidget.getProperty('WindchillSourceData');
        if (wcDataSource == true) {
            if (thisWidget.productToView.indexOf("/servlet") > 0) {
                //Set the template param to allow fetching the child files
                var baseUrl = '';
                if (!thisWidget.urlbase) {
                    baseUrl = thisWidget.productToView.substring(0, thisWidget.productToView.indexOf("/servlet"));
                }
                if (!thisWidget.templateUrl) {
                    thisWidget.templateUrl = baseUrl + '/servlet/WindchillAuthGW/com.ptc.wvs.server.util.WVSContentHelper/redirectDownload/FILENAME_KEY?HttpOperationItem=OID1_KEY&ContentHolder=OID2_KEY&u8=1';
                }
            }
        }

        thisWidget.oid = thisWidget.getProperty('oid');
        thisWidget.mapUrl = thisWidget.getProperty('mapUrl');
        thisWidget.markupUrl = thisWidget.getProperty('markupUrl');

        var infoTableValue = thisWidget.getProperty('Views');
        if (infoTableValue === undefined) {
            var dataShapeInfo = undefined;
            TW.Runtime.GetDataShapeInfo("Views", function (info) {
                dataShapeInfo = info;

                // create empty infotable
                var infoTable = {
                    'dataShape': dataShapeInfo,
                    'name': 'views',
                    'description': 'all the views from this session',
                    'rows': []
                };
                thisWidget.setProperty('Views', infoTable);
            });
        }

        var infoTableValueViews = thisWidget.getProperty('SelectedParts');
        if (infoTableValueViews === undefined) {
            var dataShapeInfoViews = undefined;
            TW.Runtime.GetDataShapeInfo("Selection", function (info) {
                dataShapeInfo = info;

                // create empty infotable
                var infoTable = {
                    'dataShape': dataShapeInfo,
                    'name': 'SelectedParts',
                    'description': 'all the selected parts in the session',
                    'rows': []
                };
                thisWidget.setProperty('SelectedParts', infoTable);
            });
        }
        thisWidget.updatePVHtml();
    };

    this.updatePVHtml = function() {
        var pluginId = thisWidget.getProperty('Id') + "-plugin";

        thisWidget.thingViewId = "ThingViewContainer-" + pluginId;
        var htmlToWrite = '<div id="';
        htmlToWrite += thisWidget.thingViewId;
        htmlToWrite += '" style="width: 100%; height: 100%; margin-left: auto; margin-right: auto;"></div>';

        if (thisWidget.getProperty('WidgetUI')) {
            htmlToWrite += ' \
            <div class="radialButton rightPaneButtons rightPaneOpener" id="rightPaneOpener" title="Zooming & Selection tools"> \
                <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_right_pane_icon.svg"/> \
            </div> \
            <div id="rightPaneContainerBG" class="rightPaneContainerBG noselect"> \
                <div id="rightPaneContainer" class="rightPaneContainer"> \
                    <div id="rightPaneCloser" class="rightPaneTrapezoidContainer"> \
                        <div class="rightPaneTrapezoid" title="Close"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_collapse.svg"/> \
                        </div> \
                    </div> \
                    <div id="rightPaneContent"> \
                        <div class="radialButton rightPaneButtons" id="rightPaneButton1" title="Hide Selected"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_hide.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton rightPaneButtons" id="rightPaneButton2" title="Isolate Selected"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_isolate.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton rightPaneButtons" id="rightPaneButton3" title="Show All"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_show_all.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton rightPaneButtons" id="rightPaneButton4" title="Zoom All"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_zoom_to_fit.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton rightPaneButtons" id="rightPaneButton5" title="Zoom Selected"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_zoom_to_selected.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton rightPaneButtons" id="rightPaneButton6" title="Zoom Window"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_zoom_to_window.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton rightPaneButtons" id="rightPaneButton7" title="Part Dragger"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_part_dragger.svg"/> \
                        </div> \
                    </div> \
                </div> \
            </div> \
            <div class="radialButton radialButtonOrient leftPaneOpener" id="leftPaneOpener" title="Orientations & View states"> \
                <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_left_pane_icon.svg"/> \
            </div> \
            <div id="leftPaneContainerBG" class="leftPaneContainerBG noselect"> \
                <div id="leftPaneContainer" class="leftPaneContainer"> \
                    <div id="leftPaneCloser" class="leftPaneTrapezoidContainer"> \
                        <div class="leftPaneTrapezoid" title="Close"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_collapse.svg"/> \
                        </div> \
                    </div> \
                    <div id="leftPaneOrientsTitle" class="leftPaneTitle" title="Toggle orientations"> \
                        <img id="leftPaneOrientsTitleMark" class="leftPaneTitleMark" \
                            src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_collapse.svg"/> \
                        <span id="leftPaneOrientsTitleText" class="leftPaneTitleText">Orientation</span> \
                    </div> \
                    <div id="leftPaneOrientsContent"> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientISO1" title="ISO 1"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_iso1.svg"/> \
                        </div> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientISO2" title="ISO 2"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_iso2.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientTop" title="Top"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_orientation_top.svg"/> \
                        </div> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientBottom" title="Bottom"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_orientation_bottom.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientLeft" title="Left"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_orientation_left.svg"/> \
                        </div> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientRight" title="Right"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_orientation_right.svg"/> \
                        </div> \
                        <br/> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientFront" title="Front"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_orientation_front.svg"/> \
                        </div> \
                        <div class="radialButton radialButtonOrient" id="widgetOrientBack" title="Back"> \
                            <img src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_orientation_back.svg"/> \
                        </div> \
                    </div> \
                    <div id="leftPaneViewstatesTitle" class="leftPaneTitle" title="Toggle view states"> \
                        <img id="leftPaneViewstatesTitleMark" class="leftPaneTitleMark" \
                            src="../Common/extensions/ptc-thingview-extension/ui/thingview/widget_collapse.svg"/> \
                        <span id="leftPaneViewstatesTitleText" class="leftPaneTitleText">View States</span> \
                    </div> \
                    <div id="leftPaneViewstatesContent" class="widgetViewstateContainer"></div> \
                    <div id="bottomBorder" style="height: 4px; width: 124px;"></div> \
                </div> \
            </div>';
        }
        thisWidget.jqElement.find('.thing-view-plugin-wrapper').html(htmlToWrite);

        if (window.MyThingView.thingViewEngineInitialised === true) {
            TW.log.info('Thing View Widget already initialised create session');
            thisWidget.CreateSession();
            thisWidget.LoadModel();
        } else if (window.MyThingView.thingViewEngineStarting !== true) {
            TW.log.info('Thing View Widget is not initialised or starting now initialise it');
            TW.log.info("window.MyThingView.thingViewEngineInitialised: " + window.MyThingView.thingViewEngineInitialised);
            window.MyThingView.thingViewEngineStarting = true;

            ThingView.init("../Common/extensions/ptc-thingview-extension/ui/thingview/js/ptc/thingview/", function () {
                window.MyThingView.thingViewEngineInitialised = true;

                var defaultPrefs = '{'+
                    '"ParseNode" : {'+
                        '"Type" : "root",'+
                        '"Name" : "",'+
                        '"Value" : "",'+
                        '"Locked" : false,'+
                        '"Children" : ['+
                            '{'+
                                '"Type" : "category",'+
                                '"Name" : "Startup",'+
                                '"Value" : "",'+
                                '"Locked" : false,'+
                                '"Children" : ['+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Enable item lists",'+
                                        '"Value" : "true",'+
                                        '"Locked" : false'+
                                    '},'+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Enable measurements",'+
                                        '"Value" : "true",'+
                                        '"Locked" : false'+
                                    '},'+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Enable construction geometry",'+
                                        '"Value" : "true",'+
                                        '"Locked" : false'+
                                    '},'+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Enable section cuts",'+
                                        '"Value" : "true",'+
                                        '"Locked" : false'+
                                    '},'+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Pvk system properties",'+
                                        '"Value" : "CalcEachTime",'+
                                        '"Locked" : false'+
                                    '},'+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Enable feature manager",'+
                                        '"Value" : "true",'+
                                        '"Locked" : false'+
                                    '}'+
                                ']'+
                            '},'+
                            '{'+
                                '"Type" : "category",'+
                                '"Name" : "Loader",'+
                                '"Value" : "",'+
                                '"Locked" : false,'+
                                '"Children" : ['+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Illustration unload parts",'+
                                        '"Value" : "true",'+
                                        '"Locked" : false'+
                                    '}'+
                                ']'+
                            '},'+
                            '{'+
                                '"Type" : "category",'+
                                '"Name" : "Shape Scene",'+
                                '"Value" : "",'+
                                '"Locked" : false,'+
                                '"Children" : ['+
                                    '{'+
                                        '"Type" : "preference",'+
                                        '"Name" : "Transition override inherit behaviour",'+
                                        '"Value" : "false",'+
                                        '"Locked" : false'+
                                    '},' +
                                    '{' +
                                        '"Type" : "preference",'+
                                        '"Name" : "Zoom on load",'+
                                        '"Value" : "true",'+
                                        '"Locked" : false'+
                                    '},' +
                                    '{' +
                                        '"Type" : "preference",' +
                                        '"Name" : "Hidden items are unpickable",' +
                                        '"Value" : "true",' +
                                        '"Locked" : false' +
                                    '},' +
                                    '{' +
                                        '"Type" : "preference",' +
                                        '"Name" : "Disable sbom selection",' +
                                        '"Value" : "false",' +
                                        '"Locked" : false' +
                                    '}' +
                                ']'+
                            '}'+
                        ']'+
                    '}'+
                '}';

                try {
                    ThingView.SetSystemPreferencesFromJson(defaultPrefs);
                } catch (e) {
                    TW.log.info('Failed to apply system preferences from json, widget probably shutdown before thingview initialization completed');
                }
                if (thisWidget) {
                    thisWidget.CreateSession();
                    thisWidget.LoadModel();
                }
            });
        } else {
            var initInterval = setInterval(function(){
                if (window.MyThingView.thingViewEngineInitialised) {
                    TW.log.info('ThingView init complete');
                    window.clearInterval(initInterval);

                    thisWidget.CreateSession();
                    thisWidget.LoadModel();
                } else {
                    TW.log.info('Waiting for ThingView init to complete');
                }
            }, 3000);
        }
    }

    function getCachedOccurrencePath(row) {
        if (!row._cachedOccurrencePath) {
            return thisWidget.constructIdPath(row);
        }
        return row._cachedOccurrencePath;
    }

    this.getIndex = function(value) {
        if (!value || !localData) {
            return undefined;
        }
        var i = localData.length;
        while (i--) {
            if (getCachedOccurrencePath(localData[i]) === value || localData[i][OccurrenceIdField] === value) {
                return i;
            }
        }
        return undefined;
    };

    this.getParentRow = function(id) {
        var parent;
        if (!localData) {
            return;
        }

        var i = localData.length;
        while (i--) {
            if (localData[i].objectId === id) {
                return localData[i];
            }
        }

        return null;
    };

    this.constructIdPath = function(row) {
        var id = row[OccurrenceIdField] + '';
        if (id.charAt(0) === '/') {
            return id;
        }
        var parent = row;
        var count = 0;
        while (parent && id.charAt(0) !== '/' && count++ < 100) {
            id = '/' + id;
            parent = this.getParentRow(parent.parentId);
            if (parent) {
                var pid = parent[OccurrenceIdField];
                if (pid !== '/' && pid) {
                    id = pid + id;
                }
            }
        }
        row._cachedOccurrencePath = id;
        return id;
    };

    this.CreateSession = function() {


        MySelectionClass = Module.SelectionEvents.extend("SelectionEvents", {
            OnSelectionBegin: function () {
                thisWidget.tmpIndexes = [];
            },
            OnSelectionChanged: function (clear, removed, added) {
                var infoTableValue = thisWidget.getProperty('SelectedParts');
                if (infoTableValue.rows == undefined)
                    infoTableValue.rows = [];

                if (clear) {
                    infoTableValue.rows = [];
                    thisWidget.setProperty('SelectedOccurrencePath', "");
                    thisWidget.selectedInstances = [];
                }
                var lastIdPath = "";
                for (var i=0;i<added.size();++i) {
                    var idPath = added.get(i);
                    lastIdPath = idPath;
                    infoTableValue.rows.push({ 'idPath': idPath });
                }
                thisWidget.setProperty('SelectedOccurrencePath', lastIdPath);

                for (var i=0;i<removed.size();++i) {
                    var idPath = removed.get(i);
                    for (var ii=0;ii<infoTableValue.rows.length;++ii) {
                        if (infoTableValue.rows[ii].idPath == idPath) {
                            infoTableValue.rows.splice(ii, 1);
                        }
                    }
                }

                if (localData !== undefined) { // Data property section
                    for (var i=0;i<removed.size();++i) {
                        var idPath = removed.get(i);
                        var idx = thisWidget.selectedInstances.indexOf(idPath);
                        if (idx !== -1)
                            thisWidget.selectedInstances.splice(idx, 1);
                    }
                    for (var i=0;i<added.size();++i) {
                        var idPath = added.get(i);
                        var index = thisWidget.getIndex(idPath);
                        thisWidget.selectedInstances.push(idPath);
                    }
                }

                for (var si=0;si<thisWidget.selectedInstances.length;++si) {
                    var index = thisWidget.getIndex(thisWidget.selectedInstances[si]);
                    if (index !== undefined)
                        thisWidget.tmpIndexes.push(index);
                }

                thisWidget.updateSelection('Data', thisWidget.tmpIndexes);
                thisWidget.setProperty('SelectedParts', infoTableValue);
                thisWidget.jqElement.triggerHandler('SelectionChanged');
            },
            OnSelectionEnd: function () {
                thisWidget.tmpIndexes = [];
                if (thisWidget.getProperty('WidgetUI')) {
                    thisWidget.updateRightPaneButtonsAvailability();
                }
            }
        });

        thisWidget.app = ThingView.CreateCVApplication(thisWidget.thingViewId);
        thisWidget.session = thisWidget.app.GetSession();
        thisWidget.shapeScene = thisWidget.session.MakeShapeScene(true);
        thisWidget.shapeView = thisWidget.shapeScene.MakeShapeView(document.getElementById(thisWidget.thingViewId).firstChild.id, true);
        thisWidget.ApplyNavigation();
        thisWidget.ApplyProjection();
        thisWidget.session.SetDragMode(Module.DragMode.NONE);
        thisWidget.session.SetDoNotRoll(false);
        var enable_part_selection = thisWidget.getProperty('EnablePartSelection');
        if (enable_part_selection) {
            thisWidget.session.SetSelectionFilter(Module.SelectionFilter.PART, Module.SelectionList.PRIMARYSELECTION);
            thisWidget.session.SetSelectionFilter(Module.SelectionFilter.PART, Module.SelectionList.PRESELECTION);
        } 
        else
        { 
            thisWidget.session.SetSelectionFilter(Module.SelectionFilter.DISABLED, Module.SelectionList.PRIMARYSELECTION);
            thisWidget.session.SetSelectionFilter(Module.SelectionFilter.DISABLED, Module.SelectionList.PRESELECTION);
        }
        thisWidget.session.ShowSpinCenter(thisWidget.getProperty('SpinCenter'));
        thisWidget.updateBackgroundColor();
        thisWidget.session.ShowGnomon(thisWidget.getProperty('Gnomon'));
        thisWidget.session.EnableCrossSiteAccess(thisWidget.getProperty('AllowCORSCredentials'));
        thisWidget.selectionObserver = new MySelectionClass();
        thisWidget.session.RegisterSelectionObserver(thisWidget.selectionObserver);
        thisWidget.cacheSize = thisWidget.getProperty('WindchillCacheSize');

        if ( (thisWidget.getProperty('EnableWindchillFileCache') == true) && (thisWidget.cacheSize != undefined) )
            thisWidget.session.EnableFileCache(thisWidget.cacheSize);
        thisWidget.session.SetShapeFilters(0x7 | 0x00300000);
    }

    this.UnloadModel = function() {
        if (thisWidget.session) {
            thisWidget.session.RemoveAllModels(true);
            thisWidget.modelWidget = null;
            if (thisWidget.getProperty('WidgetUI')) {
                thisWidget.leftWidgetPane = undefined;
                thisWidget.rightWidgetPane = undefined;
            }
        }
    }

    this.ApplyOrientation = function() {
        var orientation = thisWidget.getProperty('Orientations');
        var preset = undefined;
        if (orientation == 'ISO1')
            preset = Module.OrientPreset.ORIENT_ISO1;
        else if (orientation == 'ISO2')
            preset = Module.OrientPreset.ORIENT_ISO2;
        else if (orientation == 'Top')
            preset = Module.OrientPreset.ORIENT_TOP;
        else if (orientation == 'Bottom')
            preset = Module.OrientPreset.ORIENT_BOTTOM;
        else if (orientation == 'Left')
            preset = Module.OrientPreset.ORIENT_LEFT;
        else if (orientation == 'Right')
            preset = Module.OrientPreset.ORIENT_RIGHT;
        else if (orientation == 'Front')
            preset = Module.OrientPreset.ORIENT_FRONT;
        else if (orientation == 'Back')
            preset = Module.OrientPreset.ORIENT_BACK;
        if (preset) {
            if (thisWidget.shapeView)
                thisWidget.shapeView.ApplyOrientPreset(preset, 1000.0);
        }
    }

    this.ApplyNavigation = function() {
        var navigationMode = thisWidget.getProperty('MouseNavigation');
        var preset = undefined;
        if (navigationMode == 'CREOVIEW')
            thisWidget.session.SetNavigationMode(Module.NavMode.CREO_VIEW);
        else if (navigationMode == 'CREO')
            thisWidget.session.SetNavigationMode(Module.NavMode.CREO);
        else if (navigationMode == 'CATIAV5COMPATIBLE')
            thisWidget.session.SetNavigationMode(Module.NavMode.CATIA);
    }

    this.ApplyProjection = function() {
        var projectionMode = thisWidget.getProperty('ProjectionMode');
        if (projectionMode == 'PERSPECTIVE')
            thisWidget.session.SetPerspectiveProjection(Number(thisWidget.getProperty('PerspectiveHFOV')));
        else if (projectionMode == 'ORTHOGRAPHIC')
            thisWidget.session.SetOrthographicProjection(1.0);
    }

    this.LoadModel = function() {
        if (thisWidget.session && thisWidget.productToView) {
            function HandleSequenceStepResult(playstate, stepInfo, playpos) {
                TW.log.info("OnSequenceEvent");
                thisWidget.setProperty('sequenceStepNumber', stepInfo.number);
                if (playstate == Module.SequencePlayState.PLAYING)
                    thisWidget.playState = "playing";
                else if (playstate == Module.SequencePlayState.STOPPED)
                    thisWidget.playState = "stopped";

                thisWidget.playPosition = 'START';
                if (playpos == Module.SequencePlayPosition.MIDDLE)
                    thisWidget.playPosition = 'MIDDLE';
                else if (playpos == Module.SequencePlayPosition.END)
                    thisWidget.playPosition = 'END';

                if (stepInfo.acknowledge)
                    thisWidget.jqElement.triggerHandler('SequenceStepAcknowledge');
            }

            function getViewstateImage(type) {
                if (type == 'AlternateRep') {
                    return '../Common/extensions/ptc-thingview-extension/ui/thingview/simp_rep.png';
                } else if (type == 'ViewState') {
                    return '../Common/extensions/ptc-thingview-extension/ui/thingview/all_state.png';
                } else if (type == 'ExplodeState') {
                    return '../Common/extensions/ptc-thingview-extension/ui/thingview/preset_explode.png';
                } else if (type == 'SectionCut') {
                    return '../Common/extensions/ptc-thingview-extension/ui/thingview/sec_preset_large.png';
                } else {
                    return '../Common/extensions/ptc-thingview-extension/ui/thingview/viewables.png';
                }
            }

            function getViewstateName(name) {
                let limit = 8;
                if (name.length > limit) {
                    let res = $.trim(name.substring(0, limit)) + '...';
                    return res;
                } else {
                    return name;
                }
            }

            function GetAvailableViewStateTypes() {
                var availableTypes = {};
                availableTypes.AlternateRep = thisWidget.getProperty('DisplayAlternateRep');
                availableTypes.ViewState    = thisWidget.getProperty('DisplayViewState');
                availableTypes.ExplodeState = thisWidget.getProperty('DisplayExplodeState');
                availableTypes.SectionCut   = thisWidget.getProperty('DisplaySectionCut');

                return availableTypes;
            }

            function UpdateWidgetViewStates(widgetViewStates, availableTypes) {
                var htmlElem = '';
                if (widgetViewStates.length) {
                    var added = false;
                    for (var i=0;i<widgetViewStates.length; i++) {
                        if (availableTypes[widgetViewStates[i].type]) {
                            htmlElem += '<div id=\"ThingViewWidgetVS-';
                            htmlElem += i.toString();
                            htmlElem += '\" class=\"leftPaneViewstateItem\" title=\"';
                            htmlElem += widgetViewStates[i].name;
                            htmlElem += '\"><img src=\"';
                            htmlElem += getViewstateImage(widgetViewStates[i].type);
                            htmlElem += '\" class=\"leftPaneViewstateItemImg\"/><span>';
                            htmlElem += getViewstateName(widgetViewStates[i].name);
                            htmlElem += '</span></div>';
                            added = true;
                        }
                    }

                    if (!added) {
                        htmlElem += '<div id=\"noViewstates\"style=\"height: 40px; padding-top: 20px; color: #555; text-align: center;\">No view states</div>';
                    }
                    thisWidget.jqElement.find('#leftPaneViewstatesContent').html(htmlElem);

                    for (var i=0;i<widgetViewStates.length;i++) {
                        if (availableTypes[widgetViewStates[i].type]) {
                            var viewstateId = '#ThingViewWidgetVS-' + i.toString();
                            thisWidget.jqElement.find(viewstateId).unbind('click').click({
                                name: widgetViewStates[i].name,
                                path: widgetViewStates[i].path
                            }, function(e) {
                                thisWidget.modelWidget.LoadViewState(e.data.name, e.data.path);
                            });
                        }
                    }
                } else {
                    htmlElem += '<div id=\"noViewstates\"style=\"height: 40px; padding-top: 20px; color: #555; text-align: center;\">No view states</div>';
                    thisWidget.jqElement.find('#leftPaneViewstatesContent').html(htmlElem);
                }
            }

            function AssignWidgetButtonFunctions() {
                function setVisibility(vis, allNode) {
                    if (!thisWidget.modelWidget) return;
                    
                    if (allNode) {
                        thisWidget.modelWidget.SetPartVisibility('/', vis,
                                                                 Module.ChildBehaviour.INCLUDE,
                                                                 Module.InheritBehaviour.USE_DEFAULT);
                    } else {
                        var selectedParts = thisWidget.getProperty('SelectedParts');
                        if (selectedParts != undefined) {
                            for (var i=0; i<selectedParts.rows.length; i++) {
                                thisWidget.modelWidget.SetPartVisibility(selectedParts.rows[i].idPath, vis,
                                                                        Module.ChildBehaviour.INCLUDE,
                                                                        Module.InheritBehaviour.USE_DEFAULT);
                            }
                        }
                    }
                }

                // Right pane opener
                thisWidget.jqElement.find('#rightPaneOpener').unbind('click').click(function() {
                    if ($(this).prop('disabled')) return;

                    $(this)
                    .css({
                        cursor: 'default',
                        opacity: 0.2
                    }).prop({
                        disabled: true
                    });

                    if (thisWidget.rightWidgetPane != undefined) {
                        thisWidget.rightWidgetPane.open();
                    }
                });

                // Hide selected
                thisWidget.jqElement.find('#rightPaneButton1').unbind('click').click(function() {
                    if ($(this).prop('disabled')) return;

                    setVisibility(false, false);
                });

                // Isolate selected
                thisWidget.jqElement.find('#rightPaneButton2').unbind('click').click(function() {
                    if ($(this).prop('disabled')) return;

                    setVisibility(false, true);
                    setVisibility(true, false);
                });

                // Show all
                thisWidget.jqElement.find('#rightPaneButton3').unbind('click').click(function() {
                    setVisibility(true, true);
                });

                // Zoom all
                thisWidget.jqElement.find('#rightPaneButton4').unbind('click').click(function() {
                    thisWidget.shapeView.ZoomView(Module.ZoomMode.ZOOM_ALL, 1000.0);
                });

                // Zoom selected
                thisWidget.jqElement.find('#rightPaneButton5').unbind('click').click(function() {
                    if ($(this).prop('disabled')) return;

                    thisWidget.shapeView.ZoomView(Module.ZoomMode.ZOOM_SELECTED, 1000.0);
                });

                // Zoom window
                thisWidget.jqElement.find('#rightPaneButton6').unbind('click').click(function() {
                    thisWidget.shapeView.ZoomView(Module.ZoomMode.ZOOM_WINDOW, 1000.0);
                });

                // Part dragger
                thisWidget.jqElement.find('#rightPaneButton7').unbind('click').click(function() {
                    thisWidget.rightWidgetPane.dragSelect = !thisWidget.rightWidgetPane.dragSelect;
                    if (thisWidget.rightWidgetPane.dragSelect == true) {
                        $(this).addClass('buttonPressed');
                        thisWidget.session.SetDragMode(Module.DragMode.DRAG);
                    } else {
                        $(this).removeClass('buttonPressed');
                        thisWidget.session.SetDragMode(Module.DragMode.NONE);
                    }
                });

                thisWidget.updateRightPaneButtonsAvailability = function() {
                    function disableButton(id) {
                        thisWidget.jqElement.find('#rightPaneButton' + id)
                        .css({
                            cursor: 'default',
                            opacity: 0.2
                        }).prop({
                            disabled: true
                        });
                    }
                    function enableButton(id) {
                        thisWidget.jqElement.find('#rightPaneButton' + id)
                        .css({
                            cursor: 'pointer',
                            opacity: 1.0
                        }).prop({
                            disabled: false
                        });
                    }

                    var selectedPart = thisWidget.getProperty('SelectedOccurrencePath');
                    if (selectedPart != undefined && selectedPart.length > 0) {
                        enableButton('1');
                        enableButton('2');
                        enableButton('5');
                    } else {
                        disableButton('1');
                        disableButton('2');
                        disableButton('5');
                    }
                }

                // Right pane
                if (thisWidget.rightWidgetPane == undefined) {
                    thisWidget.rightWidgetPane = {};
                    thisWidget.rightWidgetPane.visibility = false;
                    thisWidget.rightWidgetPane.forceClosed = false;
                    thisWidget.rightWidgetPane.animating = false;
                    thisWidget.rightWidgetPane.hidingMargin = 30;
                    thisWidget.rightWidgetPane.dragSelect = false;

                    // Initialize pane
                    thisWidget.rightWidgetPane.initialisePane = function() {
                        let rightPaneContainerWidth  = thisWidget.jqElement.find('#rightPaneContainer').outerWidth();
                        thisWidget.jqElement.find('#rightPaneContainer').css({
                            right: '-' + (rightPaneContainerWidth + thisWidget.rightWidgetPane.hidingMargin).toString() + 'px',
                            visibility: 'visible'
                        });
                        thisWidget.jqElement.find("#rightPaneCloser").css({
                            right: rightPaneContainerWidth.toString() + 'px'
                        });

                        thisWidget.updateRightPaneButtonsAvailability();
                    }

                    // Resize event
                    thisWidget.rightWidgetPane.resize = function() {

                        let rightPaneContainerBGHeight = thisWidget.jqElement.find('#rightPaneContainerBG').outerHeight();
                        let rightPaneContainerHeight  =
                            10 /* Top offset */
                          + thisWidget.jqElement.find('#rightPaneContainer').outerHeight()
                          + 10 /* Bottom offset */;

                        // Width
                        let rightPaneContainerBGWidth = thisWidget.jqElement.find('#rightPaneContainerBG').outerWidth();

                        let rightPaneContainerWidth  = thisWidget.jqElement.find('#rightPaneContainer').outerWidth();

                        // Hide Zooming & Selection tools if there is not enough space (height & width)
                        if (rightPaneContainerBGHeight < rightPaneContainerHeight ||
                            (rightPaneContainerWidth + 30) > (rightPaneContainerBGWidth / 2) ) { // Hide
                            if (thisWidget.jqElement.find('#rightPaneContainer').css('right') == '0px') {
                                // It's open so close it
                                thisWidget.rightWidgetPane.forceClosed = true;
                                thisWidget.jqElement.find('#rightPaneContainer').stop().animate({
                                    right: '-' + (rightPaneContainerWidth + thisWidget.rightWidgetPane.hidingMargin).toString() + 'px'
                                }, 300, 'swing', function() {
                                    thisWidget.jqElement.find("#rightPaneOpener")
                                    .css({
                                        cursor: 'default',
                                        opacity: 0.2
                                    }).prop({
                                        disabled: true
                                    }).attr({
                                        title: 'Zooming & Selection tools (Disabled)'
                                    });
                                });
                            } else {
                                // Already closed
                                thisWidget.jqElement.find("#rightPaneOpener")
                                .css({
                                    cursor: 'default',
                                    opacity: 0.2
                                }).prop({
                                    disabled: true
                                }).attr({
                                    title: 'Zooming & Selection tools (Disabled)'
                                });
                            }

                            thisWidget.rightWidgetPane.visibility = false;
                        } else { // Show
                            if (thisWidget.rightWidgetPane.forceClosed) {
                                thisWidget.rightWidgetPane.forceClosed = false;

                                thisWidget.jqElement.find("#rightPaneOpener")
                                .css({
                                    cursor: 'default',
                                    opacity: 0.2
                                }).prop({
                                    disabled: true
                                }).attr({
                                    title: 'Zooming & Selection tools (Disabled)'
                                });

                                thisWidget.rightWidgetPane.open();
                            } else {
                                if (!thisWidget.rightWidgetPane.visibility) {
                                    if (thisWidget.rightWidgetPane.animating) return;
                                    // Closed
                                    thisWidget.jqElement.find('#rightPaneContainer').stop().css({
                                        right: '-' + (rightPaneContainerWidth + thisWidget.rightWidgetPane.hidingMargin).toString() + 'px'
                                    });

                                    thisWidget.jqElement.find("#rightPaneOpener")
                                    .css({
                                        cursor: 'pointer',
                                        opacity: 1.0
                                    }).prop({
                                        disabled: false
                                    }).attr({
                                        title: 'Zooming & Selection tools'
                                    });
                                } else {
                                    // Open
                                    thisWidget.jqElement.find('#rightPaneContainer').stop().css({
                                        right: '0px'
                                    });
                                }
                            }
                        }
                    }
                }

                // Right pane opener
                thisWidget.rightWidgetPane.open = function() {
                    thisWidget.rightWidgetPane.animating = true;
                    thisWidget.jqElement.find('#rightPaneContainer').css({
                        backgroundColor: 'rgba(231,231,231,0.9)'
                    }).stop().animate({
                        right: '0px'
                    }, 300, 'swing', function() {
                        thisWidget.rightWidgetPane.animating = false;
                    });
        
                    thisWidget.rightWidgetPane.visibility = true;
                }
                thisWidget.rightWidgetPane.close = function() {
                    thisWidget.rightWidgetPane.animating = true;
                    let rightPaneContainerWidth  = thisWidget.jqElement.find('#rightPaneContainer').outerWidth();
                    thisWidget.jqElement.find('#rightPaneContainer').stop().animate({
                        right: '-' + (rightPaneContainerWidth + thisWidget.rightWidgetPane.hidingMargin).toString() + 'px'
                    }, 300, 'swing', function() {
                        thisWidget.rightWidgetPane.animating = false;
                    });
        
                    thisWidget.rightWidgetPane.visibility = false;
                }
                thisWidget.jqElement.find('#rightPaneCloser').unbind('click').click(function() {
                    if (thisWidget.rightWidgetPane.visibility) {
                        thisWidget.rightWidgetPane.close();
                    }

                    thisWidget.jqElement.find('#rightPaneOpener')
                    .css({
                        cursor: 'pointer',
                        opacity: 1.0
                    }).prop({
                        disabled: false
                    });
                });

                // Left pane

                // Left pane opener
                thisWidget.jqElement.find('#leftPaneOpener').unbind('click').click(function() {
                    if ($(this).prop('disabled')) return;

                    $(this)
                    .css({
                        cursor: 'default',
                        opacity: 0.2
                    }).prop({
                        disabled: true
                    });

                    if (thisWidget.leftWidgetPane != undefined) {
                        thisWidget.leftWidgetPane.open();
                    }
                });

                // Left pane
                if (thisWidget.leftWidgetPane == undefined) {
                    thisWidget.leftWidgetPane = {};
                    thisWidget.leftWidgetPane.visibility = false;
                    thisWidget.leftWidgetPane.forceClosed = false;
                    thisWidget.leftWidgetPane.animating = false;
                    thisWidget.leftWidgetPane.orientsContentVis = true;
                    thisWidget.leftWidgetPane.viewstatesContentVis = true;
                    thisWidget.leftWidgetPane.hidingMargin = 30;

                    // Initialize pane
                    thisWidget.leftWidgetPane.initialisePane = function() {
                        let leftPaneContainerWidth  = thisWidget.jqElement.find('#leftPaneContainer').outerWidth();
                        thisWidget.jqElement.find('#leftPaneContainer').css({
                            left: '-' + (leftPaneContainerWidth + thisWidget.leftWidgetPane.hidingMargin).toString() + 'px',
                            visibility: 'visible'
                        });
                        thisWidget.jqElement.find("#leftPaneCloser").css({
                            right: leftPaneContainerWidth.toString() + 'px'
                        });
                    }

                    // Resize pane
                    thisWidget.leftWidgetPane.resizePane = function() {
                        // Set max height of view states
                        let leftPaneContainerBGHeight = thisWidget.jqElement.find('#leftPaneContainerBG').outerHeight();

                        let leftPaneTopOffset = 10;
                        let leftPaneOrientsTitleHeight = thisWidget.jqElement.find("#leftPaneOrientsTitle").outerHeight();
                        let leftPaneOrientsContentHeight = document.getElementById('leftPaneOrientsContent').getBoundingClientRect().height;
                        let leftPaneViewstatesTitleHeight = thisWidget.jqElement.find("#leftPaneViewstatesTitle").outerHeight();
                        let leftPaneBottomBorderHeight = thisWidget.jqElement.find('#bottomBorder').outerHeight();
                        let leftPaneBottomOffset = 12;
                        let height =
                            leftPaneTopOffset
                          + leftPaneOrientsTitleHeight
                          + leftPaneOrientsContentHeight
                          + leftPaneViewstatesTitleHeight
                          + leftPaneBottomBorderHeight
                          + leftPaneBottomOffset;

                        let viewstateMaxHeight = leftPaneContainerBGHeight - height;
                        function getViewstateMinHeight() {
                            if (thisWidget.jqElement.find('#noViewstates').length) {
                                return document.getElementById('leftPaneViewstatesContent').firstChild.getBoundingClientRect().height;
                            } else {
                                return document.getElementById('leftPaneViewstatesContent').firstChild.getBoundingClientRect().height + 8;
                            }
                        }
                        let viewstateMinHeight = getViewstateMinHeight();
                        thisWidget.jqElement.find("#leftPaneViewstatesContent").css({
                            maxHeight: Math.max(viewstateMaxHeight, viewstateMinHeight).toString() + 'px'
                        });

                        // Width
                        let leftPaneContainerBGWidth = thisWidget.jqElement.find('#leftPaneContainerBG').outerWidth();

                        // Locate left pane opener
                        let leftPaneContainerRect = document.getElementById('leftPaneContainer').getBoundingClientRect();
                        let leftPaneContainerWidth  = leftPaneContainerRect.width;

                        // Hide pane if there is not enough space (height & width)
                        if (viewstateMaxHeight < viewstateMinHeight ||
                            (leftPaneContainerWidth + 30) > (leftPaneContainerBGWidth / 2)) { // Hide
                            if (thisWidget.jqElement.find('#leftPaneContainer').css('left') == '0px') {
                                // It's open so close it
                                thisWidget.leftWidgetPane.forceClosed = true;
                                thisWidget.jqElement.find('#leftPaneContainer').stop().animate({
                                    left: '-' + (leftPaneContainerWidth + thisWidget.leftWidgetPane.hidingMargin).toString() + 'px'
                                }, 300, 'swing', function() {
                                    thisWidget.jqElement.find("#leftPaneOpener")
                                    .css({
                                        cursor: 'default',
                                        opacity: 0.2
                                    }).prop({
                                        disabled: true
                                    }).attr({
                                        title: 'Orientations & View states (Disabled)'
                                    });
                                });
                            } else {
                                // Already closed
                                thisWidget.jqElement.find("#leftPaneOpener")
                                .css({
                                    cursor: 'default',
                                    opacity: 0.2
                                }).prop({
                                    disabled: true
                                }).attr({
                                    title: 'Orientations & View states (Disabled)'
                                });
                            }
            
                            thisWidget.leftWidgetPane.visibility = false;
                        } else { // Show
                            if (thisWidget.leftWidgetPane.forceClosed) {
                                thisWidget.leftWidgetPane.forceClosed = false;

                                thisWidget.jqElement.find("#leftPaneOpener")
                                .css({
                                    cursor: 'default',
                                    opacity: 0.2
                                }).prop({
                                    disabled: true
                                }).attr({
                                    title: 'Orientations & View states (Disabled)'
                                });

                                thisWidget.leftWidgetPane.open();
                            } else {
                                if (!thisWidget.leftWidgetPane.visibility) {
                                    if (thisWidget.leftWidgetPane.animating) return;
                                    // Closed
                                    thisWidget.jqElement.find('#leftPaneContainer').stop().css({
                                        left: '-' + (leftPaneContainerWidth + thisWidget.leftWidgetPane.hidingMargin).toString() + 'px'
                                    });

                                    thisWidget.jqElement.find("#leftPaneOpener")
                                    .css({
                                        cursor: 'pointer',
                                        opacity: 1.0
                                    }).prop({
                                        disabled: false
                                    }).attr({
                                        title: 'Orientations & View states'
                                    });
                                } else {
                                    // Open
                                    thisWidget.jqElement.find('#leftPaneContainer').stop().css({
                                        left: '0px'
                                    });
                                }
                            }
                        }

                        thisWidget.jqElement.find("#leftPaneCloser").css({
                            left: leftPaneContainerWidth.toString() + 'px'
                        });

                        thisWidget.rightWidgetPane.resize();
                    }

                    $(window).bind('resize', function() {
                        thisWidget.leftWidgetPane.resizePane();
                    });

                    thisWidget.leftWidgetPane.initialisePane();
                    thisWidget.rightWidgetPane.initialisePane();
                }

                // Left pane opener
                thisWidget.leftWidgetPane.open = function() {
                    thisWidget.leftWidgetPane.animating = true;
                    thisWidget.jqElement.find('#leftPaneContainer').css({
                        backgroundColor: 'rgba(231,231,231,0.9)'
                    }).stop().animate({
                        left: '0px'
                    }, 500, 'swing', function() {
                        thisWidget.leftWidgetPane.animating = false;
                    });
        
                    thisWidget.leftWidgetPane.visibility = true;
                }
                thisWidget.leftWidgetPane.close = function() {
                    thisWidget.leftWidgetPane.animating = true;
                    let leftPaneContainerWidth  = thisWidget.jqElement.find('#leftPaneContainer').outerWidth();
                    thisWidget.jqElement.find('#leftPaneContainer').stop().animate({
                        left: '-' + (leftPaneContainerWidth + thisWidget.leftWidgetPane.hidingMargin).toString() + 'px'
                    }, 500, 'swing', function() {
                        thisWidget.leftWidgetPane.animating = false;
                    });
        
                    thisWidget.leftWidgetPane.visibility = false;
                }
                thisWidget.jqElement.find('#leftPaneCloser').unbind('click').click(function() {
                    if (thisWidget.leftWidgetPane.visibility) {
                        thisWidget.leftWidgetPane.close();
                    }

                    thisWidget.jqElement.find('#leftPaneOpener')
                    .css({
                        cursor: 'pointer',
                        opacity: 1.0
                    }).prop({
                        disabled: false
                    });
                });

                // Toggle orientation contents
                thisWidget.jqElement.find('#leftPaneOrientsTitle').unbind('click').click(function() {
                    if (thisWidget.leftWidgetPane.orientsContentVis) {
                        thisWidget.jqElement.find('#leftPaneOrientsContent').css({display: 'none'});
                        thisWidget.jqElement.find('#leftPaneOrientsTitleMark')
                        .attr({
                            src: '../Common/extensions/ptc-thingview-extension/ui/thingview/widget_expand.svg'
                        });
                        thisWidget.leftWidgetPane.orientsContentVis = false;
                    } else {
                        thisWidget.jqElement.find('#leftPaneOrientsContent').css({display: 'table'});
                        thisWidget.jqElement.find('#leftPaneOrientsTitleMark')
                        .attr({
                            src: '../Common/extensions/ptc-thingview-extension/ui/thingview/widget_collapse.svg'
                        });
                        thisWidget.leftWidgetPane.orientsContentVis = true;
                    }
                    thisWidget.leftWidgetPane.resizePane();
                });

                // Orientations
                thisWidget.jqElement.find('#widgetOrientFront').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_FRONT, 1000.0);
                });
                thisWidget.jqElement.find('#widgetOrientBack').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_BACK, 1000.0);
                });
                thisWidget.jqElement.find('#widgetOrientLeft').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_LEFT, 1000.0);
                });
                thisWidget.jqElement.find('#widgetOrientRight').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_RIGHT, 1000.0);
                });
                thisWidget.jqElement.find('#widgetOrientBottom').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_BOTTOM, 1000.0);
                });
                thisWidget.jqElement.find('#widgetOrientTop').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_TOP, 1000.0);
                });
                thisWidget.jqElement.find('#widgetOrientISO1').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_ISO1, 1000.0);
                });
                thisWidget.jqElement.find('#widgetOrientISO2').unbind('click').click(function() {
                    thisWidget.shapeView.ApplyOrientPreset(Module.OrientPreset.ORIENT_ISO2, 1000.0);
                });

                // Toggle view states contents
                thisWidget.jqElement.find('#leftPaneViewstatesTitle').unbind('click').click(function() {
                    if (thisWidget.leftWidgetPane.viewstatesContentVis) {
                        thisWidget.jqElement.find('#leftPaneViewstatesContent').css({display: 'none'});
                        thisWidget.jqElement.find('#leftPaneViewstatesTitleMark')
                        .attr({
                            src: '../Common/extensions/ptc-thingview-extension/ui/thingview/widget_expand.svg'
                        });
                        thisWidget.leftWidgetPane.viewstatesContentVis = false;
                    } else {
                        thisWidget.jqElement.find('#leftPaneViewstatesContent').css({display: 'block'});
                        thisWidget.jqElement.find('#leftPaneViewstatesTitleMark')
                        .attr({
                            src: '../Common/extensions/ptc-thingview-extension/ui/thingview/widget_collapse.svg'
                        });
                        thisWidget.leftWidgetPane.viewstatesContentVis = true;
                    }
                    thisWidget.leftWidgetPane.resizePane();
                });

                // initialize pane
                thisWidget.leftWidgetPane.resizePane();
            }

            function StructureLoadComplete() {
                TW.log.info('Structure Loaded');

                var infoTableValue = thisWidget.getProperty('Views');
                if (infoTableValue.rows == undefined)
                    infoTableValue.rows = [];

                var spinfoTableValue = thisWidget.getProperty('SelectedParts');
                if (spinfoTableValue.rows == undefined)
                    spinfoTableValue.rows = [];

                var annoSets = thisWidget.modelWidget.GetAnnotationSets();
                if (annoSets) {
                    for (var i = 0; i < annoSets.size() ; i++) {
                        var setName = annoSets.get(i).name;
                        infoTableValue.rows.push({ 'name': setName, 'type': 'annotation', 'value': setName});
                    }
                }
                var illustrations = thisWidget.modelWidget.GetIllustrations()
                if (illustrations.size() > 0) {
                    for (var i = 0; i < illustrations.size() ; i++) {
                        var illustrationName = illustrations.get(i).name;
                        infoTableValue.rows.push({ 'name': illustrationName, 'type': 'viewable', 'value': illustrationName});
                    }
                }

                var viewStates = thisWidget.modelWidget.GetViewStates();
                if (viewStates) {
                    var widgetViewStates = [];
                    for (var i = 0; i < viewStates.size(); i++) {
                        var viewState = viewStates.get(i);
                        var viewStateName = viewState.name;
                        var viewStatePath = viewState.path;
                        infoTableValue.rows.push({ 'name': viewStateName, 'type': 'viewstate', 'value': viewStatePath});

                        if (thisWidget.getProperty('WidgetUI')) {
                            if (viewStatePath == '/') {
                                widgetViewStates.push({name: viewStateName, path: viewStatePath, type: viewState.type});
                            }
                        }
                    }
                    if (thisWidget.getProperty('WidgetUI')) {
                        UpdateWidgetViewStates(widgetViewStates, GetAvailableViewStateTypes());
                        AssignWidgetButtonFunctions();
                    }
                }

                thisWidget.setProperty('Views', infoTableValue);
            }

            function ModelLoadComplete() {
                TW.log.info('Model Loaded');

                thisWidget.updateBackgroundColor();
                thisWidget.ApplyOrientation();
                var defPart = thisWidget.getProperty('DefaultPartStyle', '');
                TW.log.info("defPart: " + defPart);
                if (defPart) {
                    thisWidget.DefaultPartStyle = TW.getStyleFromStyleDefinition(defPart);
                    var color = thisWidget.parseRGBA(thisWidget.DefaultPartStyle.foregroundColor);
                    thisWidget.modelWidget.SetColor(parseFloat(color[0]), parseFloat(color[1]), parseFloat(color[2]), parseFloat(color[3]));
                }

                thisWidget.UpdateLocation();

                // Set callbacks
                thisWidget.modelWidget.SetSequenceEventCallback(function(playstate, stepNum, playpos) {
                    HandleSequenceStepResult(playstate, stepNum, playpos);
                });

                thisWidget.modelWidget.SetSelectionCallback(function(type, si, idPath, selected, selType) {
                    if (selType == Module.SelectionList.PRESELECTION) {
                        if (selected) {
                            thisWidget.setProperty("PreSelection", idPath);
                        } else {
                            thisWidget.setProperty("PreSelection", "");
                        }
                        thisWidget.jqElement.triggerHandler('PreSelectionChanged');
                    }
                });

                setTimeout(thisWidget.applyFormatter, 100);
                thisWidget.jqElement.triggerHandler('Loaded');
            }

            thisWidget.modelWidget = thisWidget.shapeScene.MakeModel();
            thisWidget.modelWidget.type = "Model";

            var wcDataSource = thisWidget.getProperty('WindchillSourceData');
            if (wcDataSource == true) {
                var widgetParams = new Module.NameValueVec();
                widgetParams.push_back({name:"sourceUrl",value:thisWidget.productToView});
                widgetParams.push_back({name:"templateUrl",value:thisWidget.templateUrl});
                widgetParams.push_back({name:"mapUrl",value:thisWidget.mapUrl});
                widgetParams.push_back({name:"oid",value:thisWidget.oid});
                widgetParams.push_back({name:"markupUrl",value:thisWidget.markupUrl});

                thisWidget.modelWidget.LoadFromWCURLWithCallback(widgetParams, true, true, function(success, isStructure, errorStack) {
                    if (success === true) {
                        if (isStructure === true) {
                            // The structure has finished loading
                            StructureLoadComplete();
                        } else {
                            // The entire model has finished loading
                            ModelLoadComplete();
                        }
                    } else {
                        TW.log.error('Failed to Load Model');
                        thisWidget.UnloadModel();
                    }
                });
            } else {
                thisWidget.modelWidget.LoadFromURLWithCallback(thisWidget.productToView, true, true, false, function(success, isStructure, errorStack) {
                    if (success === true) {
                        if (isStructure === true) {
                            // The structure has finished loading
                            StructureLoadComplete();
                        } else {
                            // The entire model has finished loading
                            ModelLoadComplete();
                        }
                    } else {
                        TW.log.error('Failed to Load Model');
                        thisWidget.UnloadModel();
                    }
                });
            }

            setTimeout(function() {
                thisWidget.session.ShowProgress(true);
            }, 500);
        }
    }

    this.UpdateLocation  = function() {
        var modelLocation = thisWidget.modelWidget.GetLocation();
        thisWidget.setProperty("Orientation", modelLocation.orientation.x + ", " + modelLocation.orientation.y + ", " + modelLocation.orientation.z);
        thisWidget.setProperty("Position", modelLocation.position.x + ", " + modelLocation.position.y + ", " + modelLocation.position.z);
        thisWidget.setProperty("Scale", modelLocation.scale.x + ", " + modelLocation.scale.y + ", " + modelLocation.scale.z);
    }

    this.handleSelectionUpdate = function (propertyName, selectedRows, selectedRowIndices) {
        switch (propertyName) {
            case 'Data': {
                if (thisWidget.session)
                    thisWidget.session.DeselectAllInstances();
                else {
                    TW.log.info("DeselectAll cannot be called as model is not loaded");
                }
                var i = selectedRowIndices.length;
                var idPathArr = new Module.VectorString();

                var lastIdPath = undefined;
                while (i--) {
                    var id = getCachedOccurrencePath(localData[selectedRowIndices[i]]);
                    idPathArr.push_back(id);
                    lastIdPath = id;
                }
                thisWidget.session.SelectInstances(idPathArr, true);
                if (lastIdPath !== undefined)
                    thisWidget.setProperty('SelectedOccurrencePath', lastIdPath);
                else
                    thisWidget.setProperty('SelectedOccurrencePath', '');
                thisWidget.jqElement.triggerHandler('SelectionChanged');
                if (thisWidget.getProperty('WidgetUI')) {
                    thisWidget.updateRightPaneButtonsAvailability();
                }
            }
            break;
            case 'Views': {
                if (selectedRows.length == 1) {
                    if (selectedRows[0].type == "annotation") {
                        if(ThingView.IsPDFSession() || ThingView.IsSVGSession()){
                            ThingView.Destroy2DCanvas();
                            ThingView.Show3DCanvas(thisWidget.session);
                        }
                        thisWidget.modelWidget.LoadAnnotationSet(selectedRows[0].value);
                    } else if (selectedRows[0].type == "viewable") {
                        if(ThingView.IsPDFSession() || ThingView.IsSVGSession()){
                            ThingView.Destroy2DCanvas();
                            ThingView.Show3DCanvas(thisWidget.session);
                        }
                        thisWidget.modelWidget.LoadIllustrationWithCallback(selectedRows[0].value, function(success, pviFile, stepInfoVec) {
                            if (success === true) {
                                TW.log.info("OnLoadIllustrationComplete");
                                if (thisWidget.modelWidget) {
                                    if (thisWidget.modelWidget.HasAnimation())
                                        thisWidget.jqElement.triggerHandler('HasAnimation');
                                    if (thisWidget.modelWidget.HasSequence())
                                        thisWidget.jqElement.triggerHandler('HasSequence');
                                }
                                thisWidget.setProperty('sequenceStepNumber', 0);
                            } else {
                                TW.log.error("OnLoadIllustrationError");
                            }
                        });
                    } else if (selectedRows[0].type == "viewstate") {
                        if(ThingView.IsPDFSession() || ThingView.IsSVGSession()){
                            ThingView.Destroy2DCanvas();
                            ThingView.Show3DCanvas(thisWidget.session);
                        }
                        thisWidget.modelWidget.LoadViewState(selectedRows[0].name, selectedRows[0].value);
                    }
                } else {
                    TW.log.info("must have only one selected row");
                }
            }
            break;
        }
    }

    this.updateProperty = function(updatePropertyInfo) {
        switch (updatePropertyInfo.TargetProperty) {
            case 'ProductToView': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                thisWidget.productToView = thisWidget.getProperty('ProductToView');

                var wcDataSource = thisWidget.getProperty('WindchillSourceData');
                if (wcDataSource == true) {
                    if (thisWidget.productToView.indexOf("/servlet") > 0) {
                        //Set the template param to allow fetching the child files
                        var baseUrl = '';
                        if (!thisWidget.urlbase) {
                            baseUrl = thisWidget.productToView.substring(0, thisWidget.productToView.indexOf("/servlet"));
                        }
                        if (!thisWidget.templateUrl) {
                            thisWidget.templateUrl = baseUrl + '/servlet/WindchillAuthGW/com.ptc.wvs.server.util.WVSContentHelper/redirectDownload/FILENAME_KEY?HttpOperationItem=OID1_KEY&ContentHolder=OID2_KEY&u8=1';
                        }
                    }
                }

                TW.log.info('ProductToView property updated unload existing model and load new one: ' + thisWidget.productToView);
                thisWidget.UnloadModel();
                thisWidget.LoadModel();
                break;
            }
            case 'Orientation': {
                TW.log.info('Orientation updated');
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                if (thisWidget.modelWidget) {
                    var orientation = thisWidget.getProperty('Orientation');
                    var orientArray = orientation.split(",");
                    thisWidget.modelWidget.SetOrientation(Number(orientArray[0]), Number(orientArray[1]), Number(orientArray[2]));
                }
                break;
            }
            case 'Orientations': {
                TW.log.info('Orientations updated');
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                thisWidget.ApplyOrientation();
                break;
            }
            case 'MouseNavigation': {
                TW.log.info('MouseNavigation updated');
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                thisWidget.ApplyNavigation();
                break;
            }
            case 'Position': {
                TW.log.info('Position updated');
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                if (thisWidget.modelWidget) {
                    var position = thisWidget.getProperty('Position');
                    var positionArray = orientation.split(",");
                    thisWidget.modelWidget.SetPosition(Number(positionArray[0]), Number(positionArray[1]), Number(positionArray[2]));
                }
                break;
            }
            case 'Scale': {
                TW.log.info('Scale updated');
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                if (thisWidget.modelWidget) {
                    var scale = thisWidget.getProperty('Scale');
                    thisWidget.modelWidget.SetScale(Number(scale));
                }
                break;
            }
            case 'BackgroundStyle': {
                TW.log.info('BackgroundStyle updated');
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                thisWidget.BackgroundStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('BackgroundStyle', ''));
                thisWidget.updateBackgroundColor();
                break;
            }


            case 'SelectedParts': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                var localSelectedParts = updatePropertyInfo.ActualDataRows;

                if (localSelectedParts.length == 0) { // Nothing selected, clear selection
                    thisWidget.selectedInstances = [];
                    thisWidget.session.DeselectAllInstances();
                    return;
                }

                var idPathArr = new Module.VectorString();
                var deselectidPathArr = new Module.VectorString();

                var selInstances = [];

                for (var i=0;i<thisWidget.selectedInstances.length;++i) {
                    var idx = -1;
                    for (var ii=0;ii<localSelectedParts.length;++ii) {
                        if (localSelectedParts[ii]['idPath'] == thisWidget.selectedInstances[i])
                            idx = 0;
                    }

                    if (idx == -1) { // Deselect currently selected parts not in new selection list
                        deselectidPathArr.push_back(thisWidget.selectedInstances[i]);
                    } else {
                        selInstances.push(thisWidget.selectedInstances[i]);
                    }
                }

                var infoTableValue = thisWidget.getProperty('SelectedParts');
                infoTableValue.rows = [];

                for (var i=0;i<localSelectedParts.length;++i) {
                    var idx = thisWidget.selectedInstances.indexOf(localSelectedParts[i]['idPath']);
                    if (idx == -1) { // If new selection list is not in current selection list select the parts
                        idPathArr.push_back(localSelectedParts[i]['idPath']);
                        selInstances.push(localSelectedParts[i]['idPath']);
                    }
                    infoTableValue.rows.push({ 'idPath': localSelectedParts[i]['idPath'] });
                }

                thisWidget.selectedInstances = selInstances.slice(0);
                thisWidget.session.SelectInstances(deselectidPathArr, false);
                thisWidget.session.SelectInstances(idPathArr, true);
                thisWidget.setProperty('SelectedParts', infoTableValue);
                break;
            }
            case 'Data': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                localData = updatePropertyInfo.ActualDataRows;
                var OccurrenceIdField = thisWidget.getProperty('OccurrenceField');
                if (!OccurrenceIdField)
                    OccurrenceIdField = 'treeId';

                if (localData && localData.length > 0) {
                    var i = localData.length;
                    while (i--) {
                        localData[i]._cachedOccurrencePath = null;
                    }
                }

                for (i in localData) {
                    var formatter = thisWidget.getProperty('DataFormatter');
                    var formatResult = TW.getStyleFromStateFormatting({DataRow: localData[i], StateFormatting: formatter});
                    if (formatResult.foregroundColor) {
                        var color = this.parseRGBA(formatResult.foregroundColor);
                        thisWidget.modelWidget.SetPartColor(localData[i][OccurrenceIdField], parseFloat(color[0]), parseFloat(color[1]), parseFloat(color[2]), parseFloat(color[3]), Module.ChildBehaviour.IGNORED, Module.InheritBehaviour.USE_DEFAULT);
                    }
                }
                break;
            }
            case 'Gnomon': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                if (thisWidget.session) {
                    var showGnomon = thisWidget.getProperty('Gnomon');
                    if (showGnomon == true) {
                        thisWidget.session.ShowGnomon(true);
                    } else if (showGnomon == false) {
                        thisWidget.session.ShowGnomon(false);
                    }
                }
                break;
            }
            case 'EnablePartSelection': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                if (thisWidget.session) {
                    var enablePartSelection = thisWidget.getProperty('EnablePartSelection');
                    if (enablePartSelection == true) {
                        thisWidget.session.SetSelectionFilter(Module.SelectionFilter.PART, Module.SelectionList.PRIMARYSELECTION);
                        thisWidget.session.SetSelectionFilter(Module.SelectionFilter.PART, Module.SelectionList.PRESELECTION);
                    } else if (enablePartSelection == false) {
                        thisWidget.session.SetSelectionFilter(Module.SelectionFilter.DISABLED, Module.SelectionList.PRIMARYSELECTION);
                        thisWidget.session.SetSelectionFilter(Module.SelectionFilter.DISABLED, Module.SelectionList.PRESELECTION);
                    }
                }
                break;
            }
            case 'SpinCenter': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                if (thisWidget.session) {
                    var showSpinCenter = thisWidget.getProperty('SpinCenter');
                    if (showSpinCenter == true) {
                        thisWidget.session.ShowSpinCenter(true);
                    } else if (showSpinCenter == false) {
                        thisWidget.session.ShowSpinCenter(false);
                    }
                }
                break;
            }
            case 'WindchillSourceData': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                break;
            }
            case 'UpDirection': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                break;
            }
            case 'FloorHeight': {
                this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                break;
            }
        }
    }

    this.parseRGBA = function(color) {

	     var colorParts;
	     var parsedColor = color.replace(/\s\s*/g,''); // Remove all spaces

	     // Checks for 6 digit hex and converts string to integer
	     if (colorParts = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(parsedColor))
	         colorParts = [parseInt(colorParts[1], 16), parseInt(colorParts[2], 16), parseInt(colorParts[3], 16)];

	     // Checks for 3 digit hex and converts string to integer
	     else if (colorParts = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(parsedColor))
	         colorParts = [parseInt(colorParts[1], 16) * 17, parseInt(colorParts[2], 16) * 17, parseInt(colorParts[3], 16) * 17];

	     // Checks for rgba and converts string to
	     // integer/float using unary + operator to save bytes
	     else if (colorParts = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(parsedColor))
	         colorParts = [+colorParts[1], +colorParts[2], +colorParts[3], +colorParts[4]];

	     // Checks for rgb and converts string to
	     // integer/float using unary + operator to save bytes
	     else if (colorParts = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(parsedColor))
	         colorParts = [+colorParts[1], +colorParts[2], +colorParts[3]];

	     // Otherwise throw an exception to make debugging easier
	     else
	    	 colorParts = [0,0,0,1];

	     // Performs RGBA conversion by default
	     isNaN(colorParts[3]) && (colorParts[3] = 1);

         if (colorParts[0] != 0)
             colorParts[0] = colorParts[0] / 255;
         if (colorParts[1] != 0)
             colorParts[1] = colorParts[1] / 255;
         if (colorParts[2] != 0)
             colorParts[2] = colorParts[2] / 255;
	     // Adds or removes 4th value based on rgba support
	     // Support is flipped twice to prevent erros if
	     // it's not defined
	     return colorParts;
	};

    this.updateBackgroundColor = function () {
        var color = thisWidget.BackgroundStyle.backgroundColor;
        if (color && color.charAt(0) === '#') {
            color = color.substring(1);
            color = '0x' + color + '00';
            thisWidget.session.SetBackgroundColor(parseInt(color));
        }
    }

    this.serviceInvoked = function (serviceName) {
        if (serviceName === 'GetCameraLocation') {
        } else if (serviceName === 'ZoomAll') {
            thisWidget.shapeView.ZoomView(Module.ZoomMode.ZOOM_ALL, 1000.0);
        } else if (serviceName === 'ZoomSelected') {
            thisWidget.shapeView.ZoomView(Module.ZoomMode.ZOOM_SELECTED, 1000.0);
        } else if (serviceName === 'ZoomWindow') {
            thisWidget.shapeView.ZoomView(Module.ZoomMode.ZOOM_WINDOW, 1000.0);
        } else if (serviceName === 'EnableDragSelect') {
            thisWidget.session.SetDragMode(Module.DragMode.DRAG);
        } else if (serviceName === 'DisableDragSelect') {
            thisWidget.session.SetDragMode(Module.DragMode.NONE);
        } else if (serviceName === 'PlaySequenceStep') {
            if (thisWidget.playPosition === 'END') {
                var currentStep = thisWidget.getProperty('sequenceStepNumber');
                thisWidget.modelWidget.GoToSequenceStep(Number(currentStep+1), Module.SequencePlayPosition.START, true);
            } else {
                thisWidget.modelWidget.PlaySequenceStep();
            }
        } else if (serviceName === 'PauseSequence') {
            thisWidget.modelWidget.PauseSequence();
        } else if (serviceName === 'StopSequence') {
            thisWidget.modelWidget.StopSequence();
        } else if (serviceName === 'RewindSequence') {
            thisWidget.modelWidget.GoToSequenceStep(0, Module.SequencePlayPosition.START, false);
        } else if (serviceName === 'NextSequenceStep') {
            var currentStep = thisWidget.getProperty('sequenceStepNumber');
            if (thisWidget.playState === "playing")
                thisWidget.modelWidget.GoToSequenceStep(Number(currentStep + 1), Module.SequencePlayPosition.START, true);
            else
                thisWidget.modelWidget.GoToSequenceStep(Number(currentStep + 1), Module.SequencePlayPosition.START, false);
        } else if (serviceName === 'PrevSequenceStep') {
            var currentStep = thisWidget.getProperty('sequenceStepNumber');
            if (thisWidget.playState === "stopped") {
                thisWidget.modelWidget.GoToSequenceStep(Number(currentStep-1), Module.SequencePlayPosition.START, false);
            } else if (thisWidget.playState === "playing") {
                thisWidget.modelWidget.GoToSequenceStep(Number(currentStep), Module.SequencePlayPosition.START, true);
            }
        } else if (serviceName === 'PlayAnimation') {
            thisWidget.modelWidget.PlayAnimation();
        } else if (serviceName === 'PauseAnimation') {
            thisWidget.modelWidget.PauseAnimation();
        } else if (serviceName === 'StopAnimation') {
            thisWidget.modelWidget.StopAnimation();
        } else if (serviceName === 'ApplyUpDirection') {
            var upDirection = thisWidget.getProperty('UpDirection');
            if (upDirection !== undefined && upDirection !== "") {
                var floorHeight = thisWidget.getProperty('FloorHeight');
                if (floorHeight !== undefined && floorHeight !== "") {
                    thisWidget.modelWidget.SetUpDirection(upDirection, Number(floorHeight));
                }
            }
        } else if (serviceName === 'GetModelLocation') {
            var location = thisWidget.modelWidget.GetLocation();
            thisWidget.setProperty("Orientation", location.orientation.x + ", " + location.orientation.y + ", " + location.orientation.z);
        } else {
            TW.log.error('thingview widget, unexpected serviceName invoked "' + serviceName + '"');
        }
    }

    this.beforeDestroy = function() {
        if (thisWidget.session !== undefined)
            thisWidget.session.UnRegisterSelectionObserver();
        thisWidget.UnloadModel();
        if (thisWidget.session !== undefined) {
            ThingView.DeleteSession(thisWidget.thingViewId);
        }
        thisWidget.session = undefined;
        TW.log.info('Thing View Widget .beforeDestroy');
        if (thisWidget.jqElement) {
            thisWidget.jqElement.find('img').unbind('click');
        }
        thisWidget.reverseidMap = null;
        localData = thisWidget = formatter = null;
    }
}
// ----END: extensions/ptc-thingview-extension/ui/thingview/creoview.runtime.js

// ----BEGIN: extensions/ptc-thingview-extension/ui/thingview/js/ptc/thingview/thingview.js
"use strict";

var Module = {
    'locateFile': function (name) {
        return ThingView.modulePath + name;
    },
    onRuntimeInitialized : function () {
        ThingView.loaded = true;
        if (!(ThingView.initCB == undefined)) {
            ThingView._completeInit();
            ThingView._setResourcePath(ThingView.resourcePath);
            ThingView.LoadPreferences(function(jsonObj, defaultPrefs) {
                if (jsonObj !== undefined) {
                    ThingView.StorePreferences(jsonObj, defaultPrefs);
                    _addPreferenceEvents();
                }
                if (ThingView.initCB) {
                    ThingView.initCB();
                }
            });
        }
    }
};

function FailedLoad()
{
    window.alert("In FailedLoad");
}
var ThingView = (function () {
    var id = 0;
    var thingView;
    var isUpdated = false;
    var _currentApp = null;
    var _currentSession = null;
    var _viewable = null;
    var _nextCanvasId = 0;
    var resourcePath = null;
    var loadedPreferences = {};
    var defaultPreferences = {};
    var s_fileversion = "0.35.0.0";
    var s_productversion = "0.35.0-L6GCPs@master-dev";
    var s_productname = "ThingView 0.35";
    var doCapture = false;
    var captureWrapper;
    var requestID = null;
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var edge = /Edge\/\d+/.test(navigator.userAgent);
    var thingView2dScript = "";

    // Preference names
    var s_pref_nav_navmode = "Nav.NavMode";
    var s_pref_gen_filecache = "Gen.FileCache";
    var s_pref_gen_filecachesize = "Gen.FileCacheSize";

    var returnObj = {
        init: function (path, initCB) {
            ThingView.resourcePath = path;
            ThingView.initCB = initCB;
            if (ThingView.loaded) {
                ThingView._completeInit();
                ThingView.LoadPreferences(function(jsonObj, defaultPrefs) {
                    if (jsonObj !== undefined) {
                        ThingView.StorePreferences(jsonObj, defaultPrefs);
                        _addPreferenceEvents();
                    }
                    if (ThingView.initCB) {
                        ThingView.initCB();
                    }
                });
            }
            else {
                var head = document.getElementsByTagName('head').item(0);
                ThingView.id = document.createElement("SCRIPT");
                var loaderLib;
                if ( (typeof(WebAssembly) == "undefined") || (iOS == true) || (edge == true))
                    loaderLib = "libthingview.js";
                else
                {
                    loaderLib = "libthingview_wasm.js";
                    ThingView.id.onerror = this.failedWasmLoad;
                }

                if (path) {
                    var idx = path.lastIndexOf('/');
                    if ((idx == -1) ||  (idx < path.length-1))
                        path += "/";
                    loaderLib = path + loaderLib;
                    ThingView.modulePath = path;
                }
                ThingView.id.src = loaderLib;
                head.appendChild(ThingView.id);
            }
        },
        failedWasmLoad: function() {
            console.log("Failed loading wasm so try asmjs");
            var head = document.getElementsByTagName('head').item(0);

            var id = document.createElement("SCRIPT");
            id.src =ThingView.modulePath + "libthingview.js";
            head.appendChild(id);

        },
        GetVersion: function() {
            return s_version;
        },

        GetDateCode: function() {
                return thingView.GetDateCode();
        },
        GetFileVersion: function() {
            return s_fileversion;
        },
        _completeInit: function () {
            thingView = Module.ThingView.GetThingView();
            if (requestID == null)
                requestID = requestAnimationFrame(_DoRender);
        },
        _setResourcePath: function(path) {
            thingView.SetResourcePath(path);
        },
        SetInitFlags: function (flags) {
            thingView.SetInitFlags(flags);
        },
        SetSystemPreferencesFromJson: function (prefstr) {
            thingView.SetSystemPreferencesFromJson(prefstr);
        },
        LoadImage: function (imagename) {
            thingView.LoadImage(imagename);
        },
        CreateTVApplication: function(parentCanvasId) {
            var app = _createTVApplication(parentCanvasId);
            if (ThingView.loadedPreferences) {
                if (Object.keys(ThingView.loadedPreferences).length > 0) {
                    _applyPreferences(session, ThingView.loadedPreferences);
                }
            }
            return app;
        },
        CreateCVApplication: function(parentCanvasId) {
            var app = _createCVApplication(parentCanvasId);
            if (ThingView.loadedPreferences) {
                if (Object.keys(ThingView.loadedPreferences).length > 0) {
                    _applyPreferences(session, ThingView.loadedPreferences);
                }
            }
            return app;
        },
        SetHighMemoryUsageValue: function (megaBytes) {
            thingView.SetHighMemoryUsageValue(megaBytes);
        },
        ClearCanvas: function (){
            _ClearCanvas();
        },
        EnableSession: function(session) {
            _enableSession(session);
        },
        DeleteSession: function(session) {
            _deleteSession(session);
        },
        Hide3DCanvas: function(session) {
            if (session) {
                _hide3DCanvas(session);  
            } else {
                _hide3DCanvas(_currentSession);
            }
        },
        Show3DCanvas: function(session) {
            if (session) {
                _show3DCanvas(session);  
            } else {
                _show3DCanvas(_currentSession);
            }
        },
        
        OpenPreferencesDialog: function() {
            window.open(ThingView.modulePath + "preferences.html", "ThingView Preferences", "width=500, height=250, status=no, toolbar=no, menubar=no, location=no");
        },
        StorePreferences: function(jsonObj, defaultPrefs) {
            try {
                if (!(jsonObj == undefined)) {
                    ThingView.loadedPreferences = jsonObj;
                }
                if (!(defaultPrefs == undefined)) {
                    ThingView.defaultPreferences = defaultPrefs;
                }
            } catch (e) {
                console.log("StorePreferences, exception: " + e);
            }
        },
        LoadPreferences: function(callbackFunc) {
            _loadPreferences(function(jsonObj, defaultPrefs) {
                callbackFunc(jsonObj, defaultPrefs);
            });
        },
        ApplyPreferences: function(jsonObj) {
            _applyPreferences(_currentSession, jsonObj);
        },
        SavePreferences: function(jsonObj) {
        },
        GetLoadedPreferences: function() {
            return _getLoadedPreferences();
        },
        CaptureCanvas: function(captureFunc) {
            doCapture = true;
            captureWrapper = captureFunc;
        },
        GetNextCanvasID: function() {
            var returnID = _nextCanvasId;
            _nextCanvasId++;
            return returnID;
        },
        LoadDocument: function(viewable, parentCanvasId, model, callback) {
            if (thingView2dScript == "") {
                thingView2dScript = document.createElement("SCRIPT");
                thingView2dScript.src = ThingView.resourcePath ? ThingView.resourcePath + "/thingview2d.js" : "thingview2d.js";
                thingView2dScript.onload = function(){
                    ThingView.LoadDocument(viewable, parentCanvasId, model, callback);
                }
                document.getElementsByTagName('head').item(0).appendChild(thingView2dScript);
            }
        },
        LoadPDF: function(parentCanvasId, buffer, callback) {
            if (thingView2dScript == "") {
                thingView2dScript = document.createElement("SCRIPT");
                thingView2dScript.src = ThingView.resourcePath ? ThingView.resourcePath + "/thingview2d.js" : "thingview2d.js";
                thingView2dScript.onload = function(){
                    ThingView.LoadPDF(parentCanvasId, buffer, callback);
                }
                document.getElementsByTagName('head').item(0).appendChild(thingView2dScript);
            }
        },
        IsPDFSession: function() {
            return false;
        },
        IsSVGSession: function() {
            return false;
        }
    };
    return returnObj;// End of public functions

    function _DoRender(timeStamp) {
        var doRender = true;
        try
        {
            if((doCapture === true) && (captureWrapper !== undefined) && (captureWrapper instanceof Function)) {
                doCapture = false;
                captureWrapper(function() {
                    thingView.DoRender(timeStamp);
                });
            } else {
                thingView.DoRender(timeStamp);
            }
        } catch (err)
        {
            console.log("Javascript caught exception "+ err);
            doRender = false;
        }
        if (doRender)
            requestID = requestAnimationFrame(_DoRender);
    }

    function _createTVApplication(parentCanvasId)
    {
        var sessionCanvas = document.createElement("canvas");
        var parent = document.getElementById(parentCanvasId);
        sessionCanvas.id = parentCanvasId + "_CreoViewCanvas" + _nextCanvasId;
        _nextCanvasId++;
        var posStyle = "position: relative; width: 100%; height: 100%;";
        var selStyle = "-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;";
        sessionCanvas.setAttribute('style', posStyle + selStyle);

        var width = parent.clientWidth;
        var height = parent.clientHeight;

        sessionCanvas.width = width;
        sessionCanvas.height = height;
        parent.insertBefore(sessionCanvas, parent.childNodes[0]);

        sessionCanvas.oncontextmenu = function (e) {
            e.preventDefault();
            return false;
        };
        _currentApp = thingView.CreateTVApplication(sessionCanvas.id);
        _currentSession = _currentApp.GetSession();
        return _currentApp;
    }
    
    function _createCVApplication(parentCanvasId) {
        var sessionCanvas = document.createElement("canvas");
        var parent = document.getElementById(parentCanvasId);
        sessionCanvas.id = parentCanvasId + "_CreoViewCanvas" + _nextCanvasId;
        _nextCanvasId++;
        var posStyle = "position: relative; width: 100%; height: 100%;";
        var selStyle = "-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;";
        sessionCanvas.setAttribute('style', posStyle + selStyle);

        var width = parent.clientWidth;
        var height = parent.clientHeight;

        sessionCanvas.width = width;
        sessionCanvas.height = height;
        parent.insertBefore(sessionCanvas, parent.childNodes[0]);

        sessionCanvas.oncontextmenu = function (e) {
            e.preventDefault();
            return false;
        };
        _currentApp = thingView.CreateCVApplication();
        _currentSession = _currentApp.GetSession();
        return _currentApp;
    }
    
    function _ClearCanvas() {
        if (_IsPDFSession()) {
            var session_html = Module.castToSession_html(_currentSession);
            var canvasId = session_html.GetCanvasName();
            var canvas = document.getElementById(canvasId);
            var context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    function _enableSession(session)
    {
        if (_currentSession != null)
        {
            _currentSession.Disable();
        }
        session.Enable();
        _currentSession = session;
    }

    function _deleteSession(session) {
        console.log("_deleteSession");
        var app = session.GetApplication();
        if (_currentSession == session) {
            _currentSession = null;
            _currentApp = null;
        }
        var session_html = Module.castToSession_html(session);
        var canvasId = session_html.GetCanvasName();
        var canvas = document.getElementById(canvasId);
        session.delete();
        session_html.delete();
        app.delete();
        if (canvas != null && canvas.parentElement != null)
            canvas.parentElement.removeChild(canvas);
    }
    
    function _loadPreferences(callback) {
        callback();
    }

    function _applyPreferences(session, jsonObj) {
        try {
        if (session == null)
            return;
        if (jsonObj !== undefined) {
            for (key in jsonObj) {
                if (ThingView.loadedPreferences === undefined)
                    ThingView.loadedPreferences = {};
                ThingView.loadedPreferences[key] = jsonObj[key];

                var fileCacheEnabled = false;
                var fileCacheSize = 0;

                if (key == s_pref_nav_navmode) {
                    if (jsonObj[key] == "CREO_VIEW") {
                        session.SetUpDirection("Y");
                        session.SetNavigationMode(Module.NavMode.CREO_VIEW);
                        if (!session.IsOrthographic())
                            session.SetOrthographicProjection(1.0);
                    }
                    else if (jsonObj[key] == "CREO") {
                        session.SetUpDirection("Y");
                        session.SetNavigationMode(Module.NavMode.CREO);
                        if (!session.IsOrthographic())
                            session.SetOrthographicProjection(1.0);
                    }
                    else if (jsonObj[key] == "CATIA") {
                        session.SetUpDirection("Y");
                        session.SetNavigationMode(Module.NavMode.CATIA);
                        if (!session.IsOrthographic())
                            session.SetOrthographicProjection(1.0);
                    }
                    else if (jsonObj[key] == "EXPLORE") {
                        session.SetUpDirection("Z");
                        session.SetNavigationMode(Module.NavMode.EXPLORE);
                        if (!session.IsPerspective())
                            session.SetPerspectiveProjection(60.0);
                    }
                    else if (jsonObj[key] == "MOCKUP")
                        session.SetNavigationMode(Module.NavMode.MOCKUP);
                    else if (jsonObj[key] == "VUFORIA")
                        session.SetNavigationMode(Module.NavMode.VUFORIA);
                    else if (jsonObj[key] == "VUFORIA_NOPICK")
                        session.SetNavigationMode(Module.NavMode.VUFORIA_NOPICK);
                } else if (key == s_pref_gen_filecache) {
                    if (jsonObj[key] === true)
                        fileCacheEnabled = true;
                } else if (key == s_pref_gen_filecachesize) {
                    fileCacheSize = jsonObj[key];
                }
                //if (fileCacheEnabled)
                  //  session.EnableFileCache(fileCacheSize);
            }
        }
        } catch (e) {
            console.log(e);
        }
    }
    
    function _hide3DCanvas(session){
        var session_html = Module.castToSession_html(session);
        var canvasId = session_html.GetCanvasName();
        if (canvasId) {
            var canvas = document.getElementById(canvasId);
            canvas.setAttribute('style', "width: 0%; height: 0%");
        }
    }
    
    function _show3DCanvas(session){
        var session_html = Module.castToSession_html(session);
        var canvasId = session_html.GetCanvasName();
        var canvas = document.getElementById(canvasId);
        canvas.setAttribute('style',"width: 100%; height: 100%");
        canvas.parentNode.style.overflow = "";
    }

    function _getLoadedPreferences() {
        if (ThingView.loadedPreferences) {
            if (Object.keys(ThingView.loadedPreferences).length > 0) {
                return ThingView.loadedPreferences;
            }
        }
        return {};
    }

})();

function _addPreferenceEvents() {
    var re = new RegExp("version\\/(\\d+).+?safari", "i");
    var safari = navigator.userAgent.match(re);
    document.addEventListener("keydown", function(event) {
        if (safari) {
            if (event.ctrlKey && event.code == 'KeyP') {
                ThingView.OpenPreferencesDialog();
            }
        } else {
            if (event.shiftKey && (event.code == 'KeyP' || event.keyCode == 80 /*P*/)) {
                ThingView.OpenPreferencesDialog();
            }
        }
    }, false);

    window.addEventListener("storage", function(event) {
        if (event.key == 'msgPref') {
            if (event.newValue) {
                var message = JSON.parse(event.newValue);
                ThingView.ApplyPreferences(message);
                ThingView.SavePreferences(ThingView.GetLoadedPreferences());
            }
        } else if (event.key == 'resetPref') {
            if (event.newValue && event.newValue == 'true') {
                ThingView.loadedPreferences = {};
                ThingView.ApplyPreferences(ThingView.defaultPreferences);
                ThingView.SavePreferences(ThingView.GetLoadedPreferences());
            }
        } else if (event.key == 'msgReady') {
            if (event.newValue && event.newValue == 'true') {
                localStorage.setItem('msgCurPref', JSON.stringify(ThingView.loadedPreferences));
                localStorage.removeItem('msgCurPref');
                localStorage.setItem('msgDefPref', JSON.stringify(ThingView.defaultPreferences));
                localStorage.removeItem('msgDefPref');
            }
        }
    }, false);
}
// ----END: extensions/ptc-thingview-extension/ui/thingview/js/ptc/thingview/thingview.js

// ----BEGIN: extensions/ptc-thingview-extension/ui/thingview/js/ptc/thingview/thingview2d.js
"use strict";

var ThingView2D = (function () {
    var _currentCanvasId = "";
    var _parentCanvasId = "";
    //SVG VARS
    var _calloutColors = [];
    var _calloutsSelected = [];
    var _partColors = [];
    var _partsSelected = [];
    var _svgCalloutCB;
    var _zoomWindow = false;
    var _zoomButton = false;
    var _zoomButtonScale;
    //PDF VARS
    var __PDF_DOC = null;
    var __CANVAS = null;
    var __CANVAS_CTX = null;
    var __CURRENT_PAGE = 0;
    var __TOTAL_PAGES = 0;
    var __ZOOMSCALE = 1;
    var _pdfCallback = null;
    var _pageMode = "Original";
    var _cursorMode = "pan";
    var _ignoreScrollEvent = false;
    var _marginSize = 26;
    var _toolbarEnabled = false;
    var _toolbarHeight = 40;
    var _miniToolbar = false;
    var _toolbarButtonsWidth = 0;
    var _toolbarGroups = {pages: true, zoom: true, cursor: true, search: true, sidebar: true, rotate: true, print: true};
    var _toolbarGroupsLoaded = {targetFull: 13, targetMini: 4, current: 0};
    var _toolbarGroupsValues = {full: [4,2,2,1,1,2,1], mini: [0,2,0,1,0,0,0]};
    var _firstLoadedPage = 0;
    var _lastLoadedPage = 0;
    var _bookmarks = [];
    var _documentLoaded = false;
    var _searchResults = [];
    var _searchTerm = "";
    var _searchResultFocus = 0;
    var _sidebarEnabled = false;
    var _navbar = {enabled: true, firstLoadedPage: 0, lastLoadedPage: 0, selectedPage: 0, bufferSize: 5};
    var _bookmarksBar = {enabled: false};
    var _sidebarResize = false;
    var _searchDrag = {enabled: false, x: 0, y: 0};
    var _pageRotation = 0;
    var _print = null;
    var _printEnabled = true;
    
    //Public Functions
    var returnObj = {
        //SHARED
        LoadDocument: function (viewable, parentCanvasId, model, callback){
          _LoadDocument(viewable, parentCanvasId, model, callback);  
        },
        LoadPDF: function (parentCanvasId, buffer, callback){
           _LoadPdfFromBuffer(parentCanvasId, buffer, callback); 
        },
        Destroy2DCanvas: function() {
            _destroy2DCanvas();
        },
        ResetTransform: function(elem){
          _resetTransform(elem);  
        },
        SetZoomOnButton: function(scale){
            if (_zoomWindow) {
                _setZoomWindow();
            }
            _setZoomOnButton(scale);
        },
        //SVG
        IsSVGSession: function() {
            return _IsSVGSession();
        },
        ResetTransformSVG: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransform(document.getElementById(_currentCanvasId).childNodes[0]);
        },
        SetZoomWindow: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _setZoomWindow();
        },
        GetCallouts: function(){
            return _getCallouts();
        },
        SelectCallout: function(callout){
            if(!(_calloutsSelected.indexOf(callout.id) != -1)){
                _selectCallout(callout);
            }
        },
        DeselectCallout: function(callout){
            if(_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            }
        },
        GetSVGParts: function(partNo){
            return _getSVGParts(partNo);
        },
        SetSVGCalloutCallback: function(callback){
            if(typeof callback === "function"){
                _svgCalloutCB = callback;
            }
        },
        //PDF
        CreatePDFSession: function(parentCanvasId, callback) {
            _createPDFSession(parentCanvasId, callback);
        },
        SetPDFCallback: function (callback) {
            if (typeof callback === "function"){
                _pdfCallback = callback;
            }
        },
        IsPDFSession: function() {
            return _IsPDFSession();
        },
        LoadPrevPage: function (callback) {
            _LoadPrevPage(callback);
        },
        LoadNextPage: function (callback) {
            _LoadNextPage(callback);
        },
        LoadPage: function (callback, pageNo) {
            _LoadPage(callback, pageNo);
        },
        GetCurrentPDFPage: function () {
            if (_IsPDFSession()){
                return __CURRENT_PAGE;
            }
        },
        GetTotalPDFPages: function () {
            if (_IsPDFSession()){
                return __TOTAL_PAGES;
            }
        },
        GetPdfBookmarks: function() {
            if(_IsPDFSession()){
                return _bookmarks;
            }
        },
        SetDocumentLoaded: function() {
            if(_IsPDFSession()){
                _documentLoaded = true;
            }
        },
        GetDocumentLoaded: function() {
            if(_IsPDFSession()){
                return _documentLoaded;
            }
        },
        ResetTransformPDF: function(){
            if(_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransformPDF();
        },
        SetPageModePDF: function(pageMode){
            if(_IsPDFSession()){
                _pageMode = pageMode;
                _setPageModePDF(__CURRENT_PAGE);
            }
        },
        SetPanModePDF: function(){
            if(_IsPDFSession()){
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                _cursorMode = "pan";
                _setUserSelect(document.getElementsByClassName("PdfPageDisplayTextLayer"));
            }
        },
        SetTextModePDF: function(){
            if(_IsPDFSession()){
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                _cursorMode = "text";
                _setUserSelect(document.getElementsByClassName("PdfPageDisplayTextLayer"));
            }
        },
        SetPdfToolbar: function(parentId, enabled, groups) {
            if(_IsPDFSession()){
                var parent = document.getElementById(parentId);
                _toolbarEnabled = enabled;
                if (groups) {
                    _toolbarGroups = groups;
                    var i = 0;
                    _toolbarGroupsLoaded.targetFull = 0;
                    _toolbarGroupsLoaded.targetMini = 1;
                    for (var value in groups) {
                        if (value) {
                            _toolbarGroupsLoaded.targetFull += _toolbarGroupsValues.full[i];
                            _toolbarGroupsLoaded.targetMini += _toolbarGroupsValues.mini[i];
                        }
                        i++;
                    }
                }
                if (enabled) {
                    _DisplayDocumentToolbar(parent, _toolbarGroups);
                    _resizeDocumentToolbar(parent, _toolbarGroups);
                } else {
                    _RemoveDocumentToolbar(parent);
                }
            }
        },
        SetPdfToolbarGroups: function (groups) {
            _toolbarGroups = groups;
        },
        ShowPdfBookmark: function(bookmarkTitle) {
            if(_IsPDFSession()){
                _ShowPdfBookmark(bookmarkTitle);
            }
        },
        SearchInPdfDocument: function(searchTerm){
            if(_IsPDFSession() && searchTerm != ""){
                _SearchInPdfDocument(searchTerm);
            }
        },
        ClearPdfDocumentSearch: function () {
            if(_IsPDFSession()){
                _searchResults = [];
                _searchTerm = "";
                _removePdfSearchResultHighlights ();
            }
        },
        FocusNextPdfDocumentSearch: function () {
            if(_IsPDFSession() && _searchResults.length > 1){
                if(_searchResultFocus == _searchResults.length-1){
                    _focusPdfSearchResult(0);
                } else {
                    _focusPdfSearchResult(_searchResultFocus+1);
                }
            }
        },
        FocusPrevPdfDocumentSearch: function () {
            if(_IsPDFSession() && _searchResults.length > 1){
                if(_searchResultFocus == 0){
                    _focusPdfSearchResult(_searchResults.length-1);
                } else {
                    _focusPdfSearchResult(_searchResultFocus-1);
                }
            }
        },
        TogglePdfSidePane: function () {
            if (_IsPDFSession()) {
                _togglePdfSidePane();
            }
        },
        RotateDocumentPages: function (clockwise) {
            if (_IsPDFSession()) {
                if (clockwise) {
                    _RotateDocumentPages(90 + _pageRotation);
                } else {
                    _RotateDocumentPages(_pageRotation - 90);
                }
            }
        },
        PrintPdf: function () {
            if (_IsPDFSession() && _printEnabled) {
                _PrintPdf(document.getElementById(_currentCanvasId).parentNode.parentNode);
            }
        }
    };
    
    extendObject(ThingView, returnObj);

    //Private Functions
    
    //SHARED
    function extendObject (obj1, obj2) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }
    
    function _LoadDocument(viewable, parentCanvasId, model, callback){
        if(viewable && model){
            if(viewable.type==Module.ViewableType.DOCUMENT && viewable.fileSource.indexOf(".pdf", viewable.fileSource.length - 4) != -1){
                if (!_IsPDFSession()){
                    _createPDFSession(parentCanvasId, function(){
                        _cursorMode = "pan";
                        _pageMode = "Original";
                        _bookmarks = [];
                        _documentLoaded = false;
                        model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                            _LoadPDF(val, callback);
                        });
                    });
                } else {
                    model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                        _LoadPDF(val, callback)
                    });
                }
            }
            else if (viewable.type==Module.ViewableType.ILLUSTRATION && viewable.fileSource.indexOf(".svg", viewable.fileSource.length - 4) != -1){
                if(!_IsSVGSession()){
                    _createSVGSession(parentCanvasId);
                }
                model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                    _LoadSVG(decodeURIComponent(escape(val)), callback);
                });
            } else callback(false);
        } else {
            callback(false);
        }
    }
    
    function _LoadPdfFromBuffer (parentCanvasId, buffer, callback){
        if (parentCanvasId && buffer) {
            if (!_IsPDFSession()){
                _createPDFSession(parentCanvasId, function(){
                    _cursorMode = "pan";
                    _pageMode = "Original";
                    _bookmarks = [];
                    _documentLoaded = false;
                    _LoadPDF(buffer, callback);
                });
            } else {
                _LoadPDF(buffer, callback);
            }
        }
    }
    
    function _resetTransform(elem){
        _setTransformMatrix(elem, 1, 0, 0, 1, 0, 0);
    }
    
    function _destroy2DCanvas(){
        _removeWindowEventListenersSVG();
        _removeWindowEventListenersPDF();
        var currentCanvas =  document.getElementById(_currentCanvasId);
        var parent = currentCanvas.parentNode;
        parent.style.cursor = "auto";
        parent.removeChild(currentCanvas);
        if(_IsPDFSession()){
            _RemoveDocumentToolbar(parent.parentNode);
            _RemovePdfSideBar (parent.parentNode);
            parent.parentNode.removeChild(document.getElementById("CreoDocumentScrollWrapper"));
        }
        _currentCanvasId = "";
    }
    
    //SVG
    function _createSVGSession(parentCanvasId){
        if(_IsPDFSession()){
            _destroy2DCanvas();
        }
        else if (!_IsSVGSession()){
            ThingView.Hide3DCanvas();
        }
        _currentCanvasId = "";
        var svgWrapper = document.createElement("div");
        var parent = document.getElementById(parentCanvasId);
        svgWrapper.id = parentCanvasId + "_CreoViewSVGDiv" + ThingView.GetNextCanvasID();
        var width = parent.clientWidth;
        var height = parent.clientHeight;
        svgWrapper.setAttribute('style',"position: relative; height: 100%; width: 100%; overflow: hidden");
        parent.style.overflow = "hidden";
        var svgHolder = document.createElement("div");
        svgHolder.setAttribute("type", "image/svg+xml");
        
        var deselect = {
            x:0,
            y:0
        };
        var drag = {
            x: 0,
            y: 0,
            state: false,
        };
        var rightClickDrag = {
            x: 0,
            y: 0,
            lastY: 0,
            state: false
        };
        var zoomDrag = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            state: false
        };
        var zoomPinch = {
            xCenter: 0,
            yCenter: 0,
            oldXs : new Object(),
            oldYs : new Object(),
            newXs : new Object(),
            newYs : new Object(),
            state: false
        };
        var twoPointDrag = {
            x: 0,
            y: 0,
            state: false,
        };
        
        var rectCanvas = document.createElement("canvas");
        rectCanvas.setAttribute('style',"position: absolute; top: 0%; left: 0%");
        rectCanvas.setAttribute('width',width);
        rectCanvas.setAttribute('height',height);
        
        svgWrapper.addEventListener("wheel", _zoomOnWheelSVG);
        svgWrapper.addEventListener("dblclick", function(){
            if(!_zoomButton){
                _resetTransform(svgHolder);
            }
        },{passive: false});
        
        svgWrapper.addEventListener("mousedown", function(e){
            e.preventDefault();
            if (_zoomWindow) {
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            } else if (_zoomButton) {
                _zoomOnButton(e);
            } else if (!drag.state && e.button==0) {
                _handlePanEvent(e, drag)
            } else if (!rightClickDrag.state && e.button==2) {
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
            deselect.x = e.pageX;
            deselect.y = e.pageY;
        },{passive: false});
        
        svgWrapper.addEventListener("mouseup", function(e){
            e.preventDefault();
            if(_zoomWindow && zoomDrag.state){
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            } else if(drag.state){
                _handlePanEvent(e, drag);
            } else if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
            var target = String(e.target.className.baseVal);
            target = target != "" ? target : String(e.target.parentNode.className.baseVal);
            if(e.pageX == deselect.x && e.pageY == deselect.y && !(e.ctrlKey || e.metaKey) && !(target.indexOf("hotspot") != -1) && !(target.indexOf("callout") != -1)){
                _deselectAllCallouts();
            }
        }, {passive: false});
        
        svgWrapper.addEventListener("mousemove", function(e){
            e.preventDefault();
            if (!_zoomWindow) {
                if(drag.state){
                    _handlePanEvent(e, drag);
                } else if(rightClickDrag.state){
                    _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper);
                }
            } else if (_zoomWindow && zoomDrag.state) {
               _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        }, {passive: false});
        
        svgWrapper.addEventListener("mouseleave", function(){
            if (_zoomWindow && zoomDrag.state){
                window.addEventListener("mouseup", function(e){
                    if(_zoomWindow && zoomDrag.state){
                        _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                    }
                });
                window.addEventListener("mousemove", function(e){
                    if (_zoomWindow && zoomDrag.state) {
                        _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                    }
                });
            } else if(drag.state){
                window.addEventListener("mouseup", function(e){
                    if(drag.state){
                        _handlePanEvent(e, drag);
                    }
                });
                window.addEventListener("mousemove", function(e){
                    e.stopPropagation();
                    if(drag.state){
                        _handlePanEvent(e, drag);
                    }
                });
            } else if (rightClickDrag.state){
                window.addEventListener("mouseup", function(e){
                    if(rightClickDrag.state){
                        _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
                    }
                });
                window.addEventListener("mousemove", function(e){
                    e.stopPropagation();
                    if(rightClickDrag.state){
                        _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
                    }
                });
            }
        },{passive: false});
        svgWrapper.addEventListener("mouseenter", function(){
            _removeWindowEventListenersSVG(drag, rightClickDrag, svgWrapper, zoomDrag);
        },{passive: false});
        
        var touchMoved = false;        
        svgWrapper.addEventListener("touchstart", function(e){
            touchMoved = false;
            if (e.touches.length <= 1) {
                if (_zoomWindow) {
                    _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                } else if (_zoomButton) {
                    _zoomOnButton(e);
                } else {
                    _handlePanEvent(e, drag);
                }
            } else {
                _handleZoomOnPinchEvent(e, zoomPinch);
                _handleTwoPointPanEvent(e, twoPointDrag);
            }
        },{passive: false});
        
        var lastTap = 0;
        svgWrapper.addEventListener("touchend", function(e){
            e.preventDefault();
            if (!zoomPinch.state) {
                var currTime = new Date().getTime();
                var tapLength = currTime - lastTap;
                if (tapLength < 200 && tapLength > 0){
                    if(!_zoomButton){
                        _resetTransform(svgHolder);
                        drag.state = false;
                    }
                } else if(_zoomWindow && zoomDrag.state){
                    _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                } else if(drag.state){
                    _handlePanEvent(e, drag);
                } else if(twoPointDrag.state) {
                    _handleTwoPointPanEvent(e, twoPointDrag);
                }
                lastTap = currTime;
                e.stopPropagation();
                if(!touchMoved && !(e.ctrlKey || e.metaKey)){
                    _deselectAllCallouts();
                }
            } else {
                _handleZoomOnPinchEvent(e, zoomPinch)
                if(drag.state){
                    _handlePanEvent(e, drag);
                } 
            }
            touchMoved = false;
        }, {passive: false});
        
        svgWrapper.addEventListener("touchmove", function(e){
            e.preventDefault();
            if (!zoomPinch.state) {
                if (!_zoomWindow) {
                    if (drag.state){
                        _handlePanEvent(e, drag);
                    }
                } else if (_zoomWindow && zoomDrag.state) {
                   _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
                }
            } else  if (zoomPinch.state && e.touches.length == 2){
                _handleZoomOnPinchEvent(e, zoomPinch);
            }
            if (twoPointDrag.state) {
                _handleTwoPointPanEvent(e, twoPointDrag);
            }
            touchMoved = true;
        }, {passive: false});
        
        svgWrapper.insertBefore(svgHolder, svgWrapper.childNodes[0]);
        svgHolder.setAttribute('style',"position: relative; height: inherit; width: inherit");
        parent.insertBefore(svgWrapper, parent.childNodes[0]);
        _currentCanvasId = svgWrapper.id;
        return;
    }
        
    function _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper){
        if (e.type == "mousedown" || e.type == "touchstart") {
            zoomDrag.x1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            zoomDrag.y1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
            zoomDrag.state = true;
            rectCanvas.getContext('2d').clearRect(0,0,rectCanvas.width,rectCanvas.height);
            svgWrapper.insertBefore(rectCanvas, svgWrapper.childNodes[1]);
        } else if (e.type == "mouseup" || e.type == "touchend") {
            _zoomOnWindowSVG(e, zoomDrag);
            svgWrapper.removeChild(rectCanvas);
            zoomDrag.state = false;
            _setZoomWindow();
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            _drawZoomWindow(rectCanvas, zoomDrag, e);
            zoomDrag.x2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            zoomDrag.y2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        }
    }
    
    function _handlePanEvent(e, drag){
        if (e.type == "mousedown" || e.type == "touchstart") {
            drag.x = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageX) : e.pageX;
            drag.y = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageY) : e.pageY;
            drag.state = true;
        } else if (e.type == "mouseup" || e.type == "touchend") {
            document.body.style.cursor = "auto";
            drag.state = false;
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panSVG(e, drag);
        }
    }
    
    function _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper){
        if (e.type == "mousedown") {
            rightClickDrag.x = e.pageX;
            rightClickDrag.y = e.pageY;
            rightClickDrag.lastY = e.pageY;
            rightClickDrag.state = true;
            svgWrapper.oncontextmenu = function(){return true;}
        } else if (e.type == "mouseup") {
            document.body.style.cursor = "auto";
            rightClickDrag.state = false;
        } else if (e.type == "mousemove") {
            svgWrapper.oncontextmenu = function(){return false;}
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            _zoomOnRightClickSVG(e, rightClickDrag);
        }        
    }
    
    function _handleZoomOnPinchEvent(e, zoomPinch){
        var lastTouch = 0;
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            zoomPinch.xCenter = touchCenter.x;
            zoomPinch.yCenter = touchCenter.y;
            zoomPinch.oldXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            zoomPinch.oldYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            zoomPinch.state = true;
        } else if (e.type == "touchend") {
            zoomPinch.state = false;
        } else if (e.type == "touchmove") {
            zoomPinch.newXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            zoomPinch.newYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            _zoomOnPinch(e, zoomPinch);
        }
    }
    
    function _handleTwoPointPanEvent(e, twoPointDrag){
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            twoPointDrag.x = touchCenter.x;
            twoPointDrag.y = touchCenter.y;
            twoPointDrag.state = true;
        } else if (e.type == "touchend") {
            twoPointDrag.state = false;
        } else if (e.type == "touchmove") {
            _panSVG(e, twoPointDrag);
        }
    }
        
    function _removeWindowEventListenersSVG(drag, rightClickDrag, svgWrapper, zoomDrag) {
        window.removeEventListener("mouseup", function(e){
            if(_zoomWindow && zoomDrag.state){
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        });
        window.removeEventListener("mousemove", function(e){
            if (_zoomWindow && zoomDrag.state) {
                _handleZoomWindowEvent(e, zoomDrag, rectCanvas, svgWrapper);
            }
        });
        window.removeEventListener("mouseup",function(){
            if(drag.state){
                _handlePanEvent(e, drag);
            }
        });
        window.removeEventListener("mousemove", function(e){
            e.stopPropagation();
            if(drag.state){
                _handlePanEvent(e, drag);
            }
        });
        window.removeEventListener("mouseup", function(){
            if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
        });
        window.removeEventListener("mousemove", function(e){
            e.stopPropagation();
            if(rightClickDrag.state){
                _handleRightClickZoomEvent(e, rightClickDrag, svgWrapper)
            }
        });
    }
        
    function _getTransformMatrix(svgHolder){
        var svgTransform = getComputedStyle(svgHolder).getPropertyValue('transform');
        if(svgTransform=="none"){
            svgTransform = "matrix(1, 0, 0, 1, 0, 0)";
        }
        var matrix = svgTransform.replace(/[^\d.,-]/g, '').split(',').map(Number);
        return matrix;
    }
    
    function _setTransformMatrix(elem, scaleX, skewX, skewY, scaleY, transX, transY){
        var newTransform = "transform: matrix(" + scaleX + "," + skewX + "," + skewY + "," + scaleY + "," + transX + "," + transY + ")";
        var currentStyle = elem.style.cssText;
        var newStyle = "";
        if(currentStyle.indexOf("transform") != -1) {
            var i = currentStyle.indexOf("transform");
            var j = currentStyle.indexOf(";", i)+1;
            newStyle = currentStyle.substr(0, i) + currentStyle.substr(j);
        } else {
            newStyle = currentStyle;
        }
        newStyle = newStyle + newTransform;
        elem.setAttribute('style',newStyle);
    }
    
    function _getTouchCenter (e){
        var sumX = 0;
        var sumY = 0;
        for (var i=0; i < e.touches.length; i++){
            sumX += e.touches[i].pageX;
            sumY += e.touches[i].pageY;
        }        
        return {x: Math.floor(sumX / i), y: Math.floor(sumY / i)};
    }
    
    function _panSVG(e, drag){
        e.preventDefault();
        var pageX = e.type.indexOf("touch") == -1 ? e.pageX : _getTouchCenter(e).x;
        var pageY = e.type.indexOf("touch") == -1 ? e.pageY : _getTouchCenter(e).y;
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var deltaX = pageX - drag.x;
        var deltaY = pageY - drag.y;
        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, matrix[0], matrix[1], matrix[2], matrix[3], (matrix[4] + deltaX), (matrix[5] + deltaY));
        drag.x = pageX;
        drag.y = pageY;
    }
    
    function _getElementCenter(elem) {
        var boundingRect = elem.getBoundingClientRect();
        var centerX = (boundingRect.left + boundingRect.right)/2;
        var centerY = (boundingRect.top + boundingRect.bottom)/2;
        return {x: centerX, y: centerY}
    }
    
    function _zoomOnWheelSVG(e){
        var ZOOMMODIFIER = 0.15
        var MAXZOOM = 10.0
        var MINZOOM = 0.15
        
        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - e.pageX) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - e.pageY) * ZOOMMODIFIER;

        var matrix = _getTransformMatrix(svgHolder);
        
        var delta = e.deltaY > 0 ? 1 : -1;
        
        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }
    
    function _setZoomOnButton(scale){
        if(!_zoomButtonScale || !(_zoomButton && _zoomButtonScale != scale)) {
            _zoomButton = !_zoomButton;
        }
        if(_zoomButton) {
            _zoomButtonScale = scale;
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            document.addEventListener('keydown', function(e){
                if (e.key == "Escape" && _zoomButton) {
                    _setZoomOnButton(scale);
                }
            });
        } else {
            document.body.style.cursor = "auto";
            document.removeEventListener('keydown', function(e){
                if (e.key == "Escape" && _zoomButton) {
                    _setZoomOnButton(scale);
                }
            });
        }
    }
    
    function _zoomOnButton(e) {
        var MAXZOOM = 10.0
        var MINZOOM = 0.15
        
        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);
        
        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        
        var mouseDeltaX = _zoomButtonScale < 1 ? (center.x - pageX) * (1 - _zoomButtonScale) : (center.x - pageX) * (_zoomButtonScale - 1);
        var mouseDeltaY = _zoomButtonScale < 1 ? (center.y - pageY) * (1 - _zoomButtonScale) : (center.y - pageY) * (_zoomButtonScale - 1);

        var matrix = _getTransformMatrix(svgHolder);
        
        var delta = _zoomButtonScale >= 1 ? 1 : -1;
        
        var newScale = matrix[0] * _zoomButtonScale; 
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }

    function _zoomOnRightClickSVG(e, drag){
        e.preventDefault();
        var ZOOMMODIFIER = 0.05
        var MAXZOOM = 10.0
        var MINZOOM = 0.15
        
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var matrix = _getTransformMatrix(svgHolder);
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - drag.x) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - drag.y) * ZOOMMODIFIER;
        
        var delta = (drag.lastY - e.pageY) > 0 ? 1 : (drag.lastY - e.pageY) < 0 ? -1 : 0;
        
        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (delta * mouseDeltaX)), (matrix[5] + (delta * mouseDeltaY)));
        }
        drag.lastY = e.pageY;
    }
    
    function _setZoomWindow(){
        _zoomWindow = !_zoomWindow;
        if (_zoomWindow) {
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/fly_rectangle.cur),auto";
            document.addEventListener('keydown', function(e){
                _zoomWindowEscapeListener(e);
            });
        } else {
            document.body.style.cursor = "auto";
            document.removeEventListener('keydown', function(e){
                _zoomWindowEscapeListener(e);
            });
        }
    }
    
    function _drawZoomWindow(rectCanvas, zoomDrag, e){
        var boundingClientRect = rectCanvas.getBoundingClientRect();
        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        var rectW = (pageX-boundingClientRect.left) - (zoomDrag.x1-boundingClientRect.left);
        var rectH = (pageY-boundingClientRect.top) - (zoomDrag.y1-boundingClientRect.top);
        var context = rectCanvas.getContext('2d');
        context.clearRect(0,0,rectCanvas.width,rectCanvas.height);
        context.strokeStyle = "#96ed14";
        context.fillStyle = "rgba(204,204,204,0.5)";
        context.lineWidth = 1;
        context.strokeRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
        context.fillRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
    }
    
    function _zoomWindowEscapeListener(e){
        if (e.key == "Escape" && _zoomWindow) {
            document.body.style.cursor = "auto";
            if(_IsSVGSession()){
                var svgWrapper = document.getElementById(_currentCanvasId);
                if(svgWrapper.childNodes.length > 1){
                    svgWrapper.removeChild(svgWrapper.childNodes[1]);
                }
            }
            _setZoomWindow();
        }
    }
    
    function _zoomOnWindowSVG(e, zoomDrag){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        
        if(zoomDrag.x1 > zoomDrag.x2){
            zoomDrag.x1 = [zoomDrag.x2, zoomDrag.x2=zoomDrag.x1][0];
        }
        if(zoomDrag.y1 > zoomDrag.y2){
            zoomDrag.y1 = [zoomDrag.y2, zoomDrag.y2=zoomDrag.y1][0];
        }
        
        var width = zoomDrag.x2 - zoomDrag.x1;
        var height = zoomDrag.y2 - zoomDrag.y1;
        var holderAspectRatio = svgHolder.clientWidth / svgHolder.clientHeight;
        var zoomAspectRatio = width / height;
        var zoomModifier = (width > height && holderAspectRatio < zoomAspectRatio) ? (svgHolder.clientWidth / width) - 1 : (svgHolder.clientHeight / height) - 1;

        var center = _getElementCenter(svgHolder);
        var newCenterX = zoomDrag.x1 + width/2;
        var newCenterY = zoomDrag.y1 + height/2;
        var deltaX = (center.x - newCenterX) * (1 + zoomModifier);
        var deltaY = (center.y - newCenterY) * (1 + zoomModifier);
        
        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, (matrix[0] * (1 + zoomModifier)), matrix[1], matrix[2], (matrix[0] * (1 + zoomModifier)), (matrix[4] + deltaX), (matrix[5] + deltaY)); 
        
    }
    
    function _zoomOnPinch(e, zoomPinch) {
        var oldHypth = Math.sqrt(Math.pow(zoomPinch.oldXs.x0 - zoomPinch.oldXs.x1,2) + Math.pow(zoomPinch.oldYs.y0 - zoomPinch.oldYs.y1,2));
        var newHypth = Math.sqrt(Math.pow(zoomPinch.newXs.x0 - zoomPinch.newXs.x1,2) + Math.pow(zoomPinch.newYs.y0 - zoomPinch.newYs.y1,2));
        var delta = (newHypth - oldHypth);
        
        if (delta!=0) {
            var ZOOMMODIFIER = 0.015 * delta;
            var MAXZOOM = 10.0;
            var MINZOOM = 0.15;
            
            var svgHolder = e.currentTarget.childNodes[0];
            var center = _getElementCenter(svgHolder);
            var mouseDeltaX = (center.x - zoomPinch.xCenter) * ZOOMMODIFIER;
            var mouseDeltaY = (center.y - zoomPinch.yCenter) * ZOOMMODIFIER;
            
            var matrix = _getTransformMatrix(svgHolder);
            var newScale = matrix[0] * (1 + ZOOMMODIFIER);
            if(newScale <= MAXZOOM && newScale >= MINZOOM){
                _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + mouseDeltaX), (matrix[5] + mouseDeltaY));                
            }
            
            zoomPinch.oldXs.x0 = zoomPinch.newXs.x0;
            zoomPinch.oldXs.x1 = zoomPinch.newXs.x1;
            zoomPinch.oldYs.y0 = zoomPinch.newYs.y0;
            zoomPinch.oldYs.y1 = zoomPinch.newYs.y1;
        }
    }
    
    function _IsSVGSession()
    {
        var retVal = false;
        if (!_currentCanvasId=="") {
            retVal = _currentCanvasId.indexOf("_CreoViewSVGDiv") != -1 ? true : false;
        }
        return retVal;
    }
    
    function _LoadSVG(val, callback){
        if(_IsSVGSession())
        {
            var canvasId = _currentCanvasId;
            var svgHolder = document.getElementById(canvasId).childNodes[0];
            _resetTransform(svgHolder);
            svgHolder.innerHTML = val;
            _setCalloutListeners(svgHolder);
            var svg = svgHolder.getElementsByTagName("svg")[0];
            svg.setAttribute('height',"100%");
            svg.setAttribute('width',"100%");
            _calloutsSelected = [];
            _partsSelected = [];
            _calloutColors = [];
            callback(true);
        }
    }
    
    function _getCallouts(){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var callouts = svgHolder.querySelectorAll('[class^="callout"]');
        return callouts;
    }
    
    function _getSVGElementColors(elem, colorsList){
        var colors = [];
        colors[0] = elem.id;
        for (var i = 1; i < elem.childNodes.length; i++){
            colors = _addNodeColor(elem.childNodes[i], colors);
        }
        colorsList.push(colors);
    }
    
    function _addNodeColor(node, colors){
        var obj = new Object();
        if(node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "text" || node.nodeName == "polyline"){
            obj['fill'] = node.getAttribute("fill") ? node.getAttribute("fill") : null;
            obj['stroke'] = node.getAttribute("stroke") ? node.getAttribute("stroke") : null;
            colors.push(obj);
        } else if(node.nodeName == "g") {
            for (var i = 0; i < node.childNodes.length; i++){
                colors = _addNodeColor(node.childNodes[i], colors);
            }
        }
        return colors;
    }
    
    function _setCalloutListeners(svgHolder){
        var hotspots = svgHolder.querySelectorAll('[class^="hotspot"]');
        if(hotspots.length==0){
            hotspots = svgHolder.querySelectorAll('[class^="callout"]');            
        }
        var startX = 0;
        var startY = 0;
        var touchMoved = false;
        for (var i=0; i < hotspots.length; i++){
            hotspots[i].addEventListener("mousedown", function(e){
                startX = e.pageX;
                startY = e.pageY;
            }, false);
            hotspots[i].addEventListener("mouseup", function(e){
                if(startX == e.pageX && startY == e.pageY){
                    if (!(e.ctrlKey || e.metaKey)) {
                        _deselectAllCallouts();
                    }
                    _toggleCalloutSelection(e);
                }
            }, false);
            hotspots[i].addEventListener("touchstart", function(e){
                touchMoved = false;
            });
            hotspots[i].addEventListener("touchmove", function(e){
                touchMoved = true;
            });
            hotspots[i].addEventListener("touchend", function(e){
                if(!touchMoved){
                    e.stopPropagation();
                    e.preventDefault();
                    if (!(e.ctrlKey || e.metaKey)) {
                        _deselectAllCallouts();
                    }
                    _toggleCalloutSelection(e);
                    touchMoved = false;
                }
            }, {passive: false});
        }
    }  
    
    function _getCalloutForToggle(e){
        var targetClass = e.currentTarget.getAttribute("class");
        if (targetClass.indexOf("callout") != -1){
            return e.currentTarget;
        } else if(targetClass.indexOf("hotspot") != -1){
            var noIndex = targetClass.indexOf("_");
            var calloutNo = targetClass.substr(noIndex);
            var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
            var callouts = svgHolder.querySelectorAll('[class^="callout"]');
            var callout;
            for (var i=0; i<callouts.length; i++){
                if(callouts[i].getAttribute('class').indexOf(calloutNo, callouts[i].getAttribute('class').length - calloutNo.length) != -1){
                    callout = callouts[i];
                }
            }
            return callout;
        } else {
            return;
        }
    }
    
    function _toggleCalloutSelection(e){
        var callout = _getCalloutForToggle(e);
        if(callout){
            if (_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            } else {
                _selectCallout(callout);
            }
            if(_svgCalloutCB){
                _svgCalloutCB(callout.id);
            }
        }
    }
    
    function _setSVGElementColors(callout, mainColor, textColor){
        _setNodeColor(callout.childNodes[0], mainColor, textColor, false);
    }
    
    function _setNodeColor(node, mainColor, textColor, background){
        if(node){
            if (node.nodeName == "path") {
                if (node.getAttribute("fill")) {
                    node.setAttribute("fill", mainColor);
                    background = true;
                }
            }
            if (node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "polyline") {
                node.setAttribute("stroke", mainColor);
            } else if (node.nodeName == "text") {
                if (background) {
                    node.setAttribute("fill", textColor);
                } else {
                    node.setAttribute("fill", mainColor);
                }
            } else if (node.nodeName == "g"){
                _setNodeColor(node.childNodes[0], mainColor, textColor, background);
                for (var i = 0; i < node.childNodes.length; i++) {
                    if (node.childNodes[i].nodeName == "path" && node.childNodes[i].getAttribute("fill")) {
                        background = true;
                    }
                }
            }
            _setNodeColor(node.nextSibling, mainColor, textColor, background)
        }
    }
    
    function _resetSVGElementColors (elem, colorsList){
        var colors = [];
        for (var i = 0; i < colorsList.length; i++){
            if (colorsList[i][0] == elem.id) {
                colors = colorsList[i];
                break;
            }
        }
        colors.shift();
        _resetNodeColor(elem.childNodes[0], colors);
        colorsList.splice(colorsList.indexOf(colors), 1);
    }
    
    function _resetNodeColor (node, colors){
        if (node) {
            if (node.nodeName == "line" || node.nodeName == "path" || node.nodeName == "text" || node.nodeName == "polyline") {
                var obj = colors.shift();
                if(obj['fill'] != null){
                    node.setAttribute('fill', obj['fill']);
                } else {
                    node.removeAttribute('fill');
                }
                if (obj['stroke'] != null){
                    node.setAttribute('stroke', obj['stroke']);
                } else {
                    node.removeAttribute('stroke');
                }
            } else if (node.nodeName == "g") {
                _resetNodeColor(node.childNodes[0], colors);
            }
            _resetNodeColor(node.nextSibling, colors);
        }
    }
    
    function _selectCallout(callout){
        _getSVGElementColors(callout, _calloutColors);
        _setSVGElementColors(callout, "rgb(102,153,255)", "rgb(255,255,255)");
        _calloutsSelected.push(callout.id);
        var parts = _getSVGParts(callout.getElementsByTagName("desc")[0].textContent);
        if(parts.length > 0){
        _selectSVGPart(parts);
        }
    }
    
    function _deselectAllCallouts(){
        for (var j=0; j<_calloutsSelected.length; j++){
            var callout = document.getElementById(_calloutsSelected[j]);
            _deselectCallout(callout);
            if(_svgCalloutCB) {
                _svgCalloutCB(callout.id);
            }
        }
        _calloutsSelected = [];
    }
    
    function _deselectCallout(callout){
        _resetSVGElementColors(callout, _calloutColors);
        var parts = _getSVGParts(callout.getElementsByTagName("desc")[0].textContent);
        if(parts.length > 0){
        _deselectSVGPart(parts);
        }
    }
    
    function _getSVGParts(partNo){
        return document.getElementsByClassName("part part_" + partNo);
    }
  
    function _selectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _getSVGElementColors(part, _partColors);
                _setSVGElementColors(part, "rgb(102,153,255)", "rgb(0,0,0)");
                _partsSelected.push(part.id);
            }
        }
    }
    
    function _deselectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _resetSVGElementColors(part, _partColors);
                var index = _partsSelected.indexOf(part.id);
                if (index !=-1){
                    _partsSelected.splice(index,1);
                }
            }
        }
    }
    
    //PDF
    function _createPDFSession(parentCanvasId, callback) {
        
        if(_IsSVGSession()){
            _destroy2DCanvas();
        }
        else if (!_IsPDFSession()){
            ThingView.Hide3DCanvas();
        }
        var head = document.getElementsByTagName('head').item(0);
        if (!document.getElementById("pdfjs")) {
            var script_pdf = document.createElement("SCRIPT");
            script_pdf.src = ThingView.modulePath + "pdfjs/pdf.js";
            script_pdf.id = "pdfjs";
            script_pdf.async = false;
            head.appendChild(script_pdf);

            script_pdf.onload = function() {
                PDFJS.workerSrc = ThingView.modulePath + "pdfjs/pdf.worker.js";
                _buildPDFSession(parentCanvasId, callback);
            }
        } else {
            _buildPDFSession(parentCanvasId, callback);
        }
        return;
    }
    
    function _buildPDFSession(parentCanvasId, callback){
        _currentCanvasId = "";
        var canvasWrapper = document.createElement("div");
        var parent = document.getElementById(parentCanvasId);
        _parentCanvasId = parentCanvasId;
        parent.style.fontSize = "12pt";
        canvasWrapper.id = parentCanvasId + "_CreoViewDocumentCanvas" + ThingView.GetNextCanvasID();
        canvasWrapper.setAttribute('style', "min-height: 100%; background-color: #80858E; position: absolute")
        
        var scrollWrapper = document.createElement("div");
        scrollWrapper.id = "CreoDocumentScrollWrapper";
        scrollWrapper.setAttribute('style', "overflow: auto; position: relative; height: 100%; -webkit-overflow-scrolling: touch");
        scrollWrapper.appendChild(canvasWrapper);
        parent.insertBefore(scrollWrapper, parent.childNodes[0]);
        parent.style.overflow = "hidden";
        _currentCanvasId = canvasWrapper.id;        
        if ((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || /android/.test(navigator.userAgent)) {
            _printEnabled = false;
            _toolbarGroups.print = false;
        } else if (_printEnabled) {
            _addPdfPrintClass(parent);
        }
        _RemoveDocumentToolbar (parent)
        if (_toolbarEnabled){
            _DisplayDocumentToolbar(parent, _toolbarGroups);
        }                
        var drag = {
            x: 0,
            y: 0,
            state: false,
        };
        
        window.addEventListener("keydown", _changePageOnKey);
        
        window.addEventListener("resize", _handleBrowserResize);
        
        scrollWrapper.addEventListener("scroll", _handlePagesOnScroll);
        
        canvasWrapper.addEventListener("wheel", _changePageOnScroll);
        
        canvasWrapper.addEventListener("mousedown", function(e){
            if (_zoomButton) {
                _zoomButtonPDF();
            } else if (_cursorMode == "pan" && e.button == 0) {
                _handlePanEventPDF(e, drag);
            }
        });
        
        canvasWrapper.addEventListener("mouseup", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        
        canvasWrapper.addEventListener("mousemove", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        
        canvasWrapper.addEventListener("mouseleave", function(e){
            if (drag.state){
                window.addEventListener("mousemove", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
                window.addEventListener("mouseup", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
            }
        });
        
        canvasWrapper.addEventListener("mouseenter", function(e){
            window.removeEventListener("mousemove", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
            window.removeEventListener("mouseup", function(e){
                    if (drag.state) {
                        _handlePanEventPDF(e, drag);
                    }
                });
        });
        
        var lastTap = 0;
        canvasWrapper.addEventListener("touchend", function(e){
            e.preventDefault();
            if (!_zoomButton) {
                var currTime = new Date().getTime();
                var tapLength = currTime - lastTap;
                if (tapLength < 200 && tapLength > 0){
                        _resetTransformPDF();
                        drag.state = false;
                    }
                lastTap = currTime;
            } else {
                _zoomButtonPDF();
            }
        });
        
        callback();
    }
    
    function _getPDFCanvas() {
        var sessionCanvas = document.createElement("canvas");
        var context = sessionCanvas.getContext('2d');
        sessionCanvas.style.display = "inline-block";
        sessionCanvas.oncontextmenu = function (e) {
            e.preventDefault();
            return false;
        };
        return sessionCanvas;
    }
    
    function _removeWindowEventListenersPDF() {
        window.removeEventListener("resize", _handleBrowserResize);
        window.removeEventListener("keydown", _changePageOnKey);
        window.removeEventListener("mousemove", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        window.removeEventListener("mouseup", function(e){
            if (drag.state) {
                _handlePanEventPDF(e, drag);
            }
        });
        if (_printEnabled) {
            window.removeEventListener('afterprint', _removePdfPrintDiv);
        }
        document.getElementById(_currentCanvasId).parentNode.removeEventListener("scroll", _changePageOnScroll);
    }
    
    function _handlePanEventPDF(e, drag) {
        if (e.type == "mousedown") {
            drag.x = e.pageX;
            drag.y = e.pageY;
            drag.state = true;
        } else if (e.type == "mousemove") {
            document.body.style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panPDF(e, drag);
        } else if (e.type == "mouseup") {
            document.body.style.cursor = "auto";
            drag.state = false;
        }
    }
    
    function _panPDF(e, drag) {
        e.preventDefault();
        var deltaX = 0 - (e.pageX - drag.x);
        var deltaY = 0 - (e.pageY - drag.y);
        var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        var scrollTop = scrollWrapper.scrollTop;
        var scrollLeft = scrollWrapper.scrollLeft;
        scrollWrapper.scrollTop = scrollTop + deltaY;
        scrollWrapper.scrollLeft = scrollLeft + deltaX;
        drag.x = e.pageX;
        drag.y = e.pageY;
    }
    
    function _changePageOnScroll() {
        if (!_ignoreScrollEvent) {
            var canvasWrapper = document.getElementById(_currentCanvasId);
            var scrollTop = canvasWrapper.parentNode.scrollTop;
            var traversedHeight = 0;
            var lineHeight = 0;
            var lineWidth = 0;
            var i = 1;
            for (i; i <= __TOTAL_PAGES; i++){
                var child = canvasWrapper.childNodes[i-1];
                if(child) {
                    var childHeight = child.height;
                    var childWidth = child.width;
                    if (_checkPageRotation()){
                        childHeight = child.width;
                        childWidth = child.height;
                    }
                    if (child.style.display == "block"){
                        lineWidth = 0;
                        traversedHeight += childHeight + _marginSize;
                        lineHeight = 0;
                    } else {
                        lineWidth += childWidth + _marginSize;
                        lineHeight = lineHeight < childHeight + _marginSize ? childHeight + _marginSize : lineHeight;
                        if (i < canvasWrapper.childNodes.length) {
                            if (_checkPageRotation()) {
                                if ((lineWidth + canvasWrapper.childNodes[i].height) > canvasWrapper.clientWidth) {
                                    lineWidth = 0;
                                    traversedHeight += lineHeight;
                                    lineHeight = 0;
                                }
                            } else {
                                if ((lineWidth + canvasWrapper.childNodes[i].width) > canvasWrapper.clientWidth) {
                                    lineWidth = 0;
                                    traversedHeight += lineHeight;
                                    lineHeight = 0;
                                }
                            }
                        }
                    }
                } else {
                    i = 1;
                    break;
                }
                if (_checkPageRotation()) {
                    if(traversedHeight >= (scrollTop + (child.width))) {
                        break;
                    }
                } else {
                    if(traversedHeight >= (scrollTop + (child.height / 2))) {
                        break;
                    }
                }
            }
            __CURRENT_PAGE = i;
            if (__CURRENT_PAGE > __TOTAL_PAGES) {
                __CURRENT_PAGE = __TOTAL_PAGES;
            }
            if (_toolbarEnabled && !_miniToolbar && _toolbarGroups.pages){
                document.getElementById("PageCounterInput").value = __CURRENT_PAGE;
            }
            if (_pdfCallback) {
                _pdfCallback(true);
            }
        }
    }
    
    function _handlePagesOnScroll() {
        if (!_ignoreScrollEvent){
            _changePageOnScroll();
            var pagesPerLine = _getNoPagesPerLine(__CURRENT_PAGE);
            var pageBufferSize = pagesPerLine < 4 ? 5 : 2*pagesPerLine - 1;
            if(!document.getElementById("PdfPageDisplayWrapper" + __CURRENT_PAGE).firstChild){
                _ignoreScrollEvent = true;
                var tempPageNo = __CURRENT_PAGE
                var pageWrappers = document.getElementsByClassName("PdfPageDisplayWrapper");
                for (var i = 0; i < pageWrappers.length; i++) {
                    while (pageWrappers[i].firstChild) {
                        pageWrappers[i].removeChild(pageWrappers[i].firstChild);
                    }
                }
                _firstLoadedPage = tempPageNo - pageBufferSize > 0 ? tempPageNo - pageBufferSize : 1;
                _lastLoadedPage = tempPageNo + pageBufferSize <= __TOTAL_PAGES ? tempPageNo + pageBufferSize : __TOTAL_PAGES;
                __CURRENT_PAGE = _firstLoadedPage;
                __PDF_DOC.getPage(__CURRENT_PAGE).then(function(page){
                    handlePages(page, function(success){
                        __CURRENT_PAGE = tempPageNo;
                        _ignoreScrollEvent = false;
                        _handlePagesOnScroll();
                    });
                });
            } else if(__CURRENT_PAGE + pagesPerLine > (_lastLoadedPage - 1) && __CURRENT_PAGE < __TOTAL_PAGES - pagesPerLine) {
                _ignoreScrollEvent = true;
                var tempPageNo = __CURRENT_PAGE;
                for (var i = _firstLoadedPage; i < __CURRENT_PAGE - pageBufferSize; i++){
                    var removePageWrapper = document.getElementById("PdfPageDisplayWrapper" + i);
                    while (removePageWrapper.firstChild){
                        removePageWrapper.removeChild(removePageWrapper.firstChild);
                    }
                }
                _firstLoadedPage = tempPageNo - pageBufferSize > 0 ? tempPageNo - pageBufferSize : 1;
                __CURRENT_PAGE = _lastLoadedPage + 1;
                _lastLoadedPage = tempPageNo + pageBufferSize + 1 <= __TOTAL_PAGES ? tempPageNo + pageBufferSize + 1 : __TOTAL_PAGES;
                __PDF_DOC.getPage(__CURRENT_PAGE).then(function(page){
                    handlePages(page, function(success){
                        __CURRENT_PAGE = tempPageNo;
                        _ignoreScrollEvent = false;
                        if (_sidebarEnabled && _navbar.enabled) {
                            _selectNavPage(document.getElementById("PdfNavPageWrapper" + __CURRENT_PAGE), __CURRENT_PAGE);
                            _scrollNavbarToPage(document.getElementById("CreoViewDocumentNavbar"), __CURRENT_PAGE);
                        }
                    });
                });
            } else if (__CURRENT_PAGE - (2*pagesPerLine - 1) < _firstLoadedPage && __CURRENT_PAGE > (2*pagesPerLine - 1)) {
                _ignoreScrollEvent = true;
                var tempPageNo = __CURRENT_PAGE;
                for (var i = _lastLoadedPage; i > __CURRENT_PAGE + pageBufferSize + 1; i--){
                    var removePageWrapper = document.getElementById("PdfPageDisplayWrapper" + i);
                    while (removePageWrapper.firstChild) {
                        removePageWrapper.removeChild(removePageWrapper.firstChild);
                    }
                    _lastLoadedPage--;
                }
                var tempLastPageNo = _lastLoadedPage;
                _firstLoadedPage = __CURRENT_PAGE - pageBufferSize > 0 ? __CURRENT_PAGE - pageBufferSize : 1;
                __CURRENT_PAGE = _firstLoadedPage;
                _lastLoadedPage = tempPageNo - pagesPerLine < __TOTAL_PAGES ? tempPageNo - pagesPerLine : __TOTAL_PAGES;
                __PDF_DOC.getPage(__CURRENT_PAGE).then(function(page){
                    handlePages(page, function(success){
                        __CURRENT_PAGE = tempPageNo;
                        _lastLoadedPage = tempLastPageNo;
                        _ignoreScrollEvent = false;
                        if (_sidebarEnabled && _navbar.enabled) {
                            _selectNavPage(document.getElementById("PdfNavPageWrapper" + __CURRENT_PAGE), __CURRENT_PAGE);
                            _scrollNavbarToPage(document.getElementById("CreoViewDocumentNavbar"), __CURRENT_PAGE);
                        }
                    });
                });
            } else if (_sidebarEnabled && _navbar.enabled) {
                _selectNavPage(document.getElementById("PdfNavPageWrapper" + __CURRENT_PAGE), __CURRENT_PAGE);
                _scrollNavbarToPage(document.getElementById("CreoViewDocumentNavbar"), __CURRENT_PAGE);
            }
        }
    }
    
    function _changePageOnKey(e) {
        var keyPressed = e.key;
        if (keyPressed == "ArrowRight") {
            _LoadNextPage(_pdfCallback);
        } else if (keyPressed == "ArrowLeft") {
            _LoadPrevPage(_pdfCallback);
        } else if (keyPressed == "Home") {
            _LoadPage(_pdfCallback, 1);
        } else if (keyPressed == "End") {
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        }
    }

    function _zoomButtonPDF() {
        if (_ignoreScrollEvent) {
            return;
        }
        var pageNo = __CURRENT_PAGE;
        __CURRENT_PAGE = _firstLoadedPage;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        if(__ZOOMSCALE * _zoomButtonScale <= 0.5) {
            return;
        }
        __ZOOMSCALE *= _zoomButtonScale;
        if(canvasWrapper.childNodes[0].style.display == "block"){
            _refreshPDF(function(success){
                for (var i=0; i < canvasWrapper.childNodes.length; i++){
                    canvasWrapper.childNodes[i].style.display = "block";
                    canvasWrapper.childNodes[i].style.margin = _marginSize + "px auto " + _marginSize + "px auto";
                }
                showPage(pageNo);
                _handlePagesOnScroll();
                if (_pdfCallback) {
                    _pdfCallback(success);
                }
            });
        } else {
            _refreshPDF(function(success){
                showPage(pageNo);
                _handlePagesOnScroll();
                if (_pdfCallback) {
                    _pdfCallback(success);
                }
            });
        }
    }
    
    function _resetTransformPDF () {
        if(_cursorMode != "text"){
            _setPageModePDF(1);
        }
    }
    
    function _refreshPDF(callback) {
        _ignoreScrollEvent = true;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        while(canvasWrapper.firstChild){
            canvasWrapper.removeChild(canvasWrapper.firstChild);
        }
        var tempPage = __CURRENT_PAGE;
        _preparePageWrapper(canvasWrapper, 1, function(){
            var pagesPerLine = _getNoPagesPerLine(__CURRENT_PAGE);
            if (pagesPerLine > 1) {
                for (var i = 1; i < pagesPerLine; i++) {
                    __CURRENT_PAGE -= 1;
                    if (__CURRENT_PAGE <= 1) {
                        __CURRENT_PAGE = 1;
                        break;
                    }
                }
            }
            __PDF_DOC.getPage(__CURRENT_PAGE).then(function(pages){
                handlePages(pages, function(){
                    _ignoreScrollEvent = false;
                    showPage(tempPage, function(){
                        callback(true);
                    })
                });
            });
        });
    }
    
    function _setPageModePDF(pageNo) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        _pageRotation = 0;
        switch (_pageMode) {
            case "Original":
                __ZOOMSCALE = 1;
                _refreshPDF(function(success){
                    showPage(pageNo, _pdfCallback);
                });
                break;
            case "FitPage":
                var wrapperHeight = canvasWrapper.parentNode.clientHeight;
                var wrapperWidth = canvasWrapper.parentNode.clientWidth;
                if (wrapperHeight <= wrapperWidth) {
                    var pageHeight = _getLargestPageHeight();
                    var heightRatio = wrapperHeight / pageHeight;
                    __ZOOMSCALE *= heightRatio;
                } else {
                    var pageWidth = _getLargestPageWidth();
                    var widthRatio = wrapperWidth / pageWidth;
                    __ZOOMSCALE *= widthRatio;
                }
                _refreshPDF(function(success){
                    if (success) {
                        for (var i=0; i < canvasWrapper.childNodes.length; i++){
                            canvasWrapper.childNodes[i].style.display = "block";
                            canvasWrapper.childNodes[i].style.margin = _marginSize + "px auto " + _marginSize + "px auto";
                        }
                        showPage(pageNo, _pdfCallback);
                    }
                });
                break;
            case "FitWidth":
                var pageWidth = _getLargestPageWidth();
                var wrapperWidth = canvasWrapper.parentNode.clientWidth;
                var widthRatio = wrapperWidth / pageWidth;
                __ZOOMSCALE *= widthRatio;
                _refreshPDF(function(success){
                    if (success) {
                        for (var i=0; i < canvasWrapper.childNodes.length; i++){
                            canvasWrapper.childNodes[i].style.display = "block";
                            canvasWrapper.childNodes[i].style.margin = _marginSize + "px auto " + _marginSize + "px auto";
                        }
                        showPage(pageNo, _pdfCallback);
                    }
                });
                break;
            case "500percent":
                __ZOOMSCALE = 5;
                _refreshPDF(function(success){
                    showPage(pageNo, _pdfCallback);
                });
                break;
            case "250percent":
                __ZOOMSCALE = 2.5;
                _refreshPDF(function(success){
                    showPage(pageNo, _pdfCallback);
                });
                break;
            case "200percent":
                __ZOOMSCALE = 2;
                _refreshPDF(function(success){
                    showPage(pageNo, _pdfCallback);
                });
                break;
            case "100percent":
                __ZOOMSCALE = 1;
                _refreshPDF(function(success){
                    showPage(pageNo, _pdfCallback);
                });
                break;
            case "75percent":
                __ZOOMSCALE = 0.75;
                _refreshPDF(function(success){
                    showPage(pageNo, _pdfCallback);
                });
                break;
            case "50percent":
                __ZOOMSCALE = 0.5;
                _refreshPDF(function(success){
                    showPage(pageNo, _pdfCallback);
                });
                break;
            default:
                console.log("Requested Page Mode is not supported");
                return;
        }
        if (_toolbarEnabled && !_miniToolbar && _toolbarGroups.zoom) {
            var pageModeSelect = document.getElementById("CreoViewDocToolbarPageModeSelect");
            if (pageModeSelect) {
                document.getElementById("CreoViewDocToolbarPageModeSelect").value = _pageMode;
            }
        }
    }
    
    function _getLargestPageWidth() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var width = 0;
        for (var i = 0; i < canvasWrapper.childNodes.length; i++){
            if (canvasWrapper.childNodes[i].width > width) {
                width = canvasWrapper.childNodes[i].width;
            }
        }
        return width;
    }
    
    function _getLargestPageHeight() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var height = 0;
        for (var i = 0; i < canvasWrapper.childNodes.length; i++){
            if (canvasWrapper.childNodes[i].height > height) {
                height = canvasWrapper.childNodes[i].height;
            }
        }
        return height;
    }
    
    function _IsPDFSession() {
        var retVal = false;
        if (!_currentCanvasId=="") {
            retVal = _currentCanvasId.indexOf("_CreoViewDocumentCanvas") != -1 ? true : false ;
        }
        return retVal;
    }
    
    function _LoadPDF(val, callback) {
        if(_IsPDFSession() && val) {
            _ignoreScrollEvent = true;
            __ZOOMSCALE = 1;
            __CURRENT_PAGE = 1;
            _pageRotation = 0;
            var canvasWrapper = document.getElementById(_currentCanvasId);
            if (_sidebarEnabled){
                _RemovePdfSideBar(canvasWrapper.parentNode.parentNode);
            }
            while(canvasWrapper.firstChild){
                canvasWrapper.removeChild(canvasWrapper.firstChild);
            }
            PDFJS.getDocument({ data: val }).then(function(pdf_doc) {
                __PDF_DOC = pdf_doc;
                __TOTAL_PAGES = __PDF_DOC.numPages;
                _firstLoadedPage = 1;
                _lastLoadedPage = __TOTAL_PAGES <= 11 ? __TOTAL_PAGES : 11;
                _preparePageWrapper(canvasWrapper, 1, function(){
                    __PDF_DOC.getPage(_firstLoadedPage).then(function(pages){
                        handlePages(pages, function(val){
                            __PDF_DOC.getOutline().then(function(outline){
                                if(outline){
                                    _bookmarks = outline;
                                } else {
                                    _bookmarksBar.enabled = false;
                                    _navbar.enabled = true;
                                }
                                if (_sidebarEnabled) {
                                    if (_navbar.enabled) {
                                        _DisplayPdfNavigationBar (_CreateSideBar(canvasWrapper.parentNode.parentNode), 1);
                                    } else if (_bookmarksBar.enabled) {
                                        _DisplayPdfBookmarksBar(_CreateSideBar(canvasWrapper.parentNode.parentNode));
                                    }
                                }
                                if (_toolbarEnabled) {
                                    _resizeDocumentToolbar(canvasWrapper.parentNode.parentNode, _toolbarGroups);
                                }
                                _ignoreScrollEvent = false;
                                if (callback) {
                                    callback(val);
                                }
                            });
                        });
                    });
                });
            }).catch(function(error) {
                console.log("Javascript caught exception in showPDF : " + error.message);
                if (typeof callback === "function") callback(false);
            });
        }
    }
    
    function _preparePageWrapper(canvasWrapper, pageNo, callback) {
        __PDF_DOC.getPage(pageNo).then(function(page){
            var viewport = page.getViewport(__ZOOMSCALE);
            var pageWrapper = document.createElement("div");
            pageWrapper.height = viewport.height;
            pageWrapper.width = viewport.width;
            pageWrapper.setAttribute('style', "width: " + viewport.width + "px; height: " + viewport.height + "px; margin: " + _marginSize/2 + "px auto; box-shadow: 0px 0px 12px rgba(0,0,0,0.5); transform: rotate(" + _pageRotation + "deg)");
            if (! (_pageMode == "FitWidth" || _pageMode == "FitPage")) {
                pageWrapper.style.display = "inline-block";
                if (_checkPageRotation()) {
                    var newTopMargin = _marginSize/2 - (Math.abs(viewport.height - viewport.width) / 2);
                    var newSideMargin = (Math.abs(viewport.width - viewport.height)/2) + _marginSize/2;
                    pageWrapper.style.margin =  newTopMargin + "px " + newSideMargin + "px";
                } else {
                    pageWrapper.style.margin = _marginSize/2 + "px";
                }
            } else {
                pageWrapper.style.display = "block";
            }
            pageWrapper.id = "PdfPageDisplayWrapper" + pageNo;
            pageWrapper.className = "PdfPageDisplayWrapper";
            canvasWrapper.appendChild(pageWrapper);
            if (pageNo < __TOTAL_PAGES) {
                _preparePageWrapper(canvasWrapper, pageNo+1, callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    }
    
    function handlePages(page, callback) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var viewport = page.getViewport(__ZOOMSCALE);
        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + __CURRENT_PAGE);
        var canvas = _getPDFCanvas();
        canvas.id = "PdfPageDisplayCanvas" + __CURRENT_PAGE;
        canvas.className = "PdfPageDisplayCanvas";
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        var context = canvas.getContext('2d', {alpha: false});
        page.render({canvasContext: canvas.getContext('2d'), viewport: viewport}).then(function(){
            pageWrapper.appendChild(canvas);     
            var textLayer = document.createElement("div");
            textLayer.id = "PdfPageDisplayTextLayer" + __CURRENT_PAGE;
            textLayer.className = "PdfPageDisplayTextLayer";
            textLayer.width = canvas.width;
            textLayer.height = canvas.height;
            textLayer.setAttribute('style', "width : " + canvas.width + "px; height: " + canvas.height + "px; position: absolute; color: transparent; z-index: 2; top: 0px; left: 0px");
            pageWrapper.appendChild(textLayer);
            
            page.getTextContent({ normalizeWhitespace: true }).then(function(textContent){
                var lineContainers = [];
                PDFJS.renderTextLayer({
                    textContent: textContent,
                    container: textLayer,
                    viewport: viewport,
                    textDivs: lineContainers,
                    enhanceTextSelection: true
                })._capability.promise.then(function(){
                    for (var i = 0; i < lineContainers.length; i++){
                        lineContainers[i].style.position = "absolute";
                        lineContainers[i].style.lineHeight = lineContainers[i].style.fontSize;
                    }
                    
                    textLayer.style.WebkitUserSelect = _cursorMode == "text" ? "text" : "none";
                    textLayer.style.msUserSelect = _cursorMode == "text" ? "text" : "none";
                    textLayer.style.MozUserSelect = _cursorMode == "text" ? "text" : "none";

                    if (__PDF_DOC !== null && __CURRENT_PAGE < __TOTAL_PAGES && __CURRENT_PAGE < _lastLoadedPage){
                        __CURRENT_PAGE += 1;
                        __PDF_DOC.getPage(__CURRENT_PAGE).then(function(newPage){
                            handlePages(newPage, callback);
                        });
                    } else if(__CURRENT_PAGE == __TOTAL_PAGES || __CURRENT_PAGE == _lastLoadedPage) {
                        __CURRENT_PAGE = 1;
                        canvasWrapper.style.minWidth = "100%"
                        if (_toolbarEnabled && !_miniToolbar && _toolbarGroups.pages){
                            _UpdateDocumentToolbar();
                        }
                        if (callback) {
                            callback(true);
                        }
                    }
                });
            });
        });
    }
    
    function showPage(page_no, callback) {
        if(!_ignoreScrollEvent) {
            _ignoreScrollEvent = true;
            var canvasWrapper = document.getElementById(_currentCanvasId);
            if (page_no > _lastLoadedPage || page_no < _firstLoadedPage) {
                var pageWrappers = document.getElementsByClassName("PdfPageDisplayWrapper");
                for (var i = 0; i < pageWrappers.length; i++){
                    while (pageWrappers[i].firstChild){
                        pageWrappers[i].removeChild(pageWrappers[i].firstChild);
                    }
                }
                var pagesPerLine = _getNoPagesPerLine(page_no);
                var pageBufferSize = pagesPerLine < 4 ? 5 : 2*pagesPerLine + 1;
                _firstLoadedPage = (page_no-pageBufferSize) > 0 ? page_no - pageBufferSize : 1;
                __CURRENT_PAGE = _firstLoadedPage;
                _lastLoadedPage = (page_no+pageBufferSize) < __TOTAL_PAGES ? page_no + pageBufferSize : __TOTAL_PAGES;
                __PDF_DOC.getPage(_firstLoadedPage).then(function(newPage){
                    handlePages(newPage, function(success){
                        _completeScrollShowPage(page_no, callback);
                    });
                });
            } else {
                _completeScrollShowPage(page_no, callback);
            }
        }
    }
    
    function _completeScrollShowPage(page_no, callback){
        __CURRENT_PAGE = page_no;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var pdfDisplays = document.getElementsByClassName("PdfPageDisplayWrapper");
        var scrollToVal = 0;
        var temp = 0;
        for (var i = 0; i < page_no - 1; i++) {
            var pagesPerLine = _getNoPagesPerLine(i+1);
            var pageHeight = pdfDisplays[i].height + _marginSize;
            if (_checkPageRotation()) {
                pageHeight = pdfDisplays[i].width + _marginSize;
            }
            if (pageHeight > temp) {
                temp = pageHeight;
            }
            if (((i+1) % pagesPerLine) == 0){
                scrollToVal += temp;
                temp = 0;
            }
        }
        if(pdfDisplays[0].style.display == "block"){
            scrollToVal += _marginSize;
        }
        canvasWrapper.parentNode.scrollTop = scrollToVal;
        if (_toolbarEnabled && !_miniToolbar && _toolbarGroups.pages){
            document.getElementById("PageCounterInput").value = __CURRENT_PAGE;
        }
        _ignoreScrollEvent = false;
        if (_sidebarEnabled && _navbar.enabled) {
            _selectNavPage(document.getElementById("PdfNavPageWrapper" + page_no), page_no);
            _scrollNavbarToPage(document.getElementById("CreoViewDocumentNavbar"), page_no);
        }
        if (callback) {
            callback(true);
        }
    }
    
    function _getNoPagesPerLine(page_no) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        if (canvasWrapper.childNodes[0].style.display == "block") {
            return 1;
        }
        var wrapperWidth = canvasWrapper.clientWidth;
        var sum = 0;
        var count = 0;
        for (var i = 0; i < page_no; i++) {
            if (_checkPageRotation()) {
                var page = canvasWrapper.childNodes[i];
                sum += page.height + _marginSize;
                count += 1;
                if (sum > wrapperWidth) {
                    sum = page.height;
                    count = 1;
                }
            } else {
                var page = canvasWrapper.childNodes[i];
                sum += page.width + _marginSize;
                count += 1;
                if (sum > wrapperWidth) {
                    sum = page.width;
                    count = 1;
                }
            }
        }
        for (var j = page_no; j < canvasWrapper.childNodes.length; j++) {
            var page = canvasWrapper.childNodes[j];
            if (_checkPageRotation()) {
                sum += page.height + _marginSize;
            } else {
                sum += page.width + _marginSize;
            }
            if (sum > wrapperWidth) {
                break;
            }
            count += 1;
        }
        return count;
    }
    
    function _setUserSelect(elems){
        for (var i = 0; i < elems.length; i++) {
            elems[i].style.WebkitUserSelect = _cursorMode == "text" ? "text" : "none";
            elems[i].style.msUserSelect = _cursorMode == "text" ? "text" : "none";
            elems[i].style.MozUserSelect = _cursorMode == "text" ? "text" : "none";
        }
    }
    
    function _LoadPrevPage(callback) {
        if (__CURRENT_PAGE != 1)
            showPage(__CURRENT_PAGE - 1, callback);
    }
    
    function _LoadNextPage(callback) {
        if (__CURRENT_PAGE != __TOTAL_PAGES)
            showPage(__CURRENT_PAGE + 1, callback);
    }
    
    function _LoadPage(callback, pageNo) {
        if ((pageNo > 0) && (pageNo <=__TOTAL_PAGES))
            showPage(pageNo, callback);
    }
    
    //PDF TOOLBAR
    
    function _DisplayDocumentToolbar (parent, groups) {
        if (document.getElementById("CreoViewDocumentToolbar") == null) {
            _buildToolbarCover(parent);
            var toolbarDiv = document.createElement("div");
            toolbarDiv.id = "CreoViewDocumentToolbar";
            toolbarDiv.setAttribute('style',"color: #FFFFFF; background-color: #44474B; height: " + _toolbarHeight + "px; text-align: left; padding-top:1px; zIndex: 1; -webkit-user-select: none; -ms-user-select: none; -moz-user-select: none;");
            _BuildDocumentToolbarContent(toolbarDiv, groups, parent);
            parent.insertBefore(toolbarDiv, parent.childNodes[0]);
            document.getElementById(_currentCanvasId).parentNode.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
            if (_sidebarEnabled) {
                var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
                if (sidebarDiv) {
                    sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
                }
            }
        }
    }
    
    function _RemoveDocumentToolbar (parent) {
        var toolbarCover = document.getElementById("PdfToolbarCover");
        if (toolbarCover) {
            _toolbarGroupsLoaded.current = 0;
            parent.removeChild(toolbarCover);
        }
        var toolbarDiv = document.getElementById("CreoViewDocumentToolbar");
        if (toolbarDiv){
            parent.removeChild(toolbarDiv);
        }
        var currentCanvas = document.getElementById(_currentCanvasId);
        if (currentCanvas) {
            currentCanvas.parentNode.style.height = "100%";
        }
        if (_sidebarEnabled) {
            var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
            if (sidebarDiv) {
                sidebarDiv.style.height = "100%";
                sidebarDiv.childNodes[1].style.height = (parseInt(sidebarDiv.childNodes[1].style.height) + _toolbarHeight) + "px";
            }
        }
        if (_searchDrag.enabled){
            _searchDrag.enabled = false;
        }
        parent.removeEventListener("mousemove", function(e){
            _dragSearchBox(parent, e);
        });
        parent.removeEventListener("mouseleave", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });
        parent.removeEventListener("mouseup", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });
    }
    
    function _BuildDocumentToolbarContent (toolbarDiv, groups, parent) {
        _miniToolbar = false;
        while(toolbarDiv.firstChild){
            toolbarDiv.removeChild(toolbarDiv.firstChild);
        }
        
        var leftContainer = document.createElement("div");
        leftContainer.setAttribute('style',"float: left; height: 100%");
        var rightContainer = document.createElement("div");
        rightContainer.setAttribute('style',"float: right; height: 100%");
        var midContainer = document.createElement("div");
        midContainer.setAttribute('style',"height: " + _toolbarHeight + "px; overflow: hidden; white-space: nowrap");
        toolbarDiv.appendChild(leftContainer);
        toolbarDiv.appendChild(rightContainer);
        toolbarDiv.appendChild(midContainer);
        if (groups.sidebar) {
            leftContainer.appendChild(_buildNavbarGroup());
        }
        if (groups.pages) {
            var pagesGroup = _buildPagesGroup();
            leftContainer.appendChild(pagesGroup);
        }
        if (groups.rotate) {
            var rotateGroup = _buildRotateGroup();
            midContainer.appendChild(rotateGroup);
        }
        if (groups.zoom) {
            var zoomGroup = _buildZoomGroup();
            midContainer.appendChild(zoomGroup);
        }
        if (groups.cursor) {
            var cursorModeGroup = _buildCursorModeGroup();
            midContainer.appendChild(cursorModeGroup);
        }        
        if (groups.search) {
            var searchGroup = _BuildDocumentSearchToolbar(parent);
            searchGroup.style.float = "right";
            searchGroup.className = "CreoToolbarGroup";
            rightContainer.appendChild(searchGroup);
        }
        if (groups.print) {
            var printGroup = _buildPrintGroup(parent);
            printGroup.style.float = "right";
            rightContainer.appendChild(printGroup);
        }
    }
    
    function _buildNavbarGroup() {
        var navbarGroup = _BuildDocumentToolbarButton('/icons/pdf_sidebar.svg', true);
        navbarGroup.id = "CreoToolbarSidebarGroup";
        navbarGroup.style.margin = "auto 5px";
        if(_sidebarEnabled){
            navbarGroup.style.backgroundColor = "#232B2D";
        }
        navbarGroup.addEventListener("click", function(e){
            e.stopPropagation();
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = "#232B2D";
            } else {
                navbarGroup.style.backgroundColor = "inherit";
            }
            _togglePdfSidePane();
        });
        navbarGroup.addEventListener("mouseenter", function(){
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = "#232B2D";
            }
        });
        navbarGroup.addEventListener("mouseleave", function(){
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = "inherit";
            }
        });
        return navbarGroup;
    }
    
    function _buildPagesGroup() {
        var pagesGroup = document.createElement("div");
        pagesGroup.id = "CreoToolbarPagesGroup";
        pagesGroup.className = "CreoToolbarGroup";
        pagesGroup.setAttribute('style', "display: inline-block; margin-left: 15px; height: " + _toolbarHeight + "px");
        var firstPageButton = _BuildDocumentToolbarButton("/icons/pdf_first_page.svg", true);
        _AddToolbarButtonMouseOver(firstPageButton);
        firstPageButton.addEventListener("click", function(){
            _LoadPage(_pdfCallback, 1);
        });
        pagesGroup.appendChild(firstPageButton);
        var prevPageButton = _BuildDocumentToolbarButton("/icons/pdf_previous_page.svg", true);
        _AddToolbarButtonMouseOver(prevPageButton);
        prevPageButton.addEventListener("click", function(){
            _LoadPrevPage(_pdfCallback);
        });
        pagesGroup.appendChild(prevPageButton);
        
        var pageCounterSpan = _buildPagesCounter();
        pagesGroup.appendChild(pageCounterSpan);
        
        var nextPageButton = _BuildDocumentToolbarButton("/icons/pdf_next_page.svg", true);
        nextPageButton.id = "CreoToolbarPagesGroupNextPage";
        _AddToolbarButtonMouseOver(nextPageButton);
        nextPageButton.addEventListener("click", function(){
            _LoadNextPage(_pdfCallback);
        });
        pagesGroup.appendChild(nextPageButton);
        var lastPageButton = _BuildDocumentToolbarButton("/icons/pdf_last_page.svg", true);
        _AddToolbarButtonMouseOver(lastPageButton);
        lastPageButton.addEventListener("click", function(){
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        });
        pagesGroup.appendChild(lastPageButton);
        return pagesGroup;
    }
    
    function _buildRotateGroup () {
        var rotateGroup = document.createElement("div");
        rotateGroup.id = "CreoToolbarRotateGroup";
        rotateGroup.setAttribute('style', "display: inline-block; margin: auto 7px");
        rotateGroup.className = "CreoToolbarGroup";
        
        var rotateClockwiseButton = _BuildDocumentToolbarButton("/icons/pdf_rotate_clockwise.svg", true);
        rotateClockwiseButton.addEventListener("click", function(){
            _RotateDocumentPages(_pageRotation + 90);
        });
        _AddToolbarButtonMouseOver(rotateClockwiseButton);
        rotateGroup.appendChild(rotateClockwiseButton);
        
        var rotateAntiClockwiseButton = _BuildDocumentToolbarButton("/icons/pdf_rotate_anti_clockwise.svg", true);
        rotateAntiClockwiseButton.addEventListener("click", function(){
            _RotateDocumentPages(_pageRotation - 90);
        });
        _AddToolbarButtonMouseOver(rotateAntiClockwiseButton);
        rotateGroup.appendChild(rotateAntiClockwiseButton);
        
        return rotateGroup;
    }
    
    function _buildPagesCounter () {
        var pageCounterSpan = document.createElement("div");
        pageCounterSpan.id = "PageCounterSpan";
        pageCounterSpan.innerHTML = "  /  " + __TOTAL_PAGES;
        pageCounterSpan.setAttribute('style', "display: inline-block; position: absolute; margin: 10px");
        var pageCounterInput = document.createElement("input");
        pageCounterInput.id = "PageCounterInput";
        pageCounterInput.type = "text";
        pageCounterInput.pattern = "[0-9]+";
        pageCounterInput.size = "3";
        pageCounterInput.value = "1";
        pageCounterInput.addEventListener("keypress", function(e){
            if (!(e.key == "Enter" || /^\d*$/.test(e.key))) {
                e.preventDefault();
            }
        });
        pageCounterInput.addEventListener("change", function(e){
            var pageNo = parseInt(e.target.value);
            if (pageNo) {
                _LoadPage(_pdfCallback, pageNo);
            }
        });
        pageCounterSpan.insertBefore(pageCounterInput, pageCounterSpan.childNodes[0]);     
        return pageCounterSpan;
    }
    
    function _buildZoomGroup () {
        var zoomGroup = document.createElement("div");
        zoomGroup.id = "CreoToolbarZoomGroup";
        zoomGroup.className = "CreoToolbarGroup";
        zoomGroup.setAttribute('style', "display: inline-block; margin: auto 7px;");
        var zoomInButton = _BuildDocumentToolbarButton("./icons/pdf_zoom_in.svg", true);
        _AddToolbarButtonMouseOver(zoomInButton);
        zoomInButton.addEventListener("click", function(){
            _zoomButtonScale = 1.2;
            _zoomButtonPDF();
        });
        zoomGroup.appendChild(zoomInButton);
        var zoomOutButton = _BuildDocumentToolbarButton("./icons/pdf_zoom_out.svg", true);
        _AddToolbarButtonMouseOver(zoomOutButton);
        zoomOutButton.addEventListener("click", function(){
            _zoomButtonScale = 0.8;
            _zoomButtonPDF();
        });
        zoomGroup.appendChild(zoomOutButton);
        
        var pageModeSpan = document.createElement("span");
        pageModeSpan.setAttribute('style', "display: inline-block; position: relative; margin-left: 5px; margin-right: 5px; top: -3px");
        
        var pageModeInput = document.createElement("select");
        pageModeInput.id = "CreoViewDocToolbarPageModeSelect";
        var pageModeTexts = ["Original", "Fit Page", "Fit Width", "500%", "250%", "200%", "100%", "75%", "50%"];
        var pageModeValues = ["Original", "FitPage", "FitWidth", "500percent", "250percent", "200percent", "100percent", "75percent", "50percent"];
        for(var i=0; i < pageModeTexts.length; i++){
            var option = document.createElement("option");
            option.text = pageModeTexts[i];
            option.value = pageModeValues[i];
            pageModeInput.appendChild(option);
        }
        pageModeInput.value = _pageMode;
        pageModeInput.addEventListener("change", function(e){
            _pageMode = e.target.options[e.target.selectedIndex].value;
            _setPageModePDF(__CURRENT_PAGE);
        });
        
        pageModeSpan.appendChild(pageModeInput);
        zoomGroup.appendChild(pageModeSpan);
        return zoomGroup;
    }
    
    function _buildCursorModeGroup(){
        var cursorModeGroup = document.createElement("div");
        cursorModeGroup.id = "CreoToolbarCursorGroup";
        cursorModeGroup.className = "CreoToolbarGroup";
        cursorModeGroup.setAttribute('style', "display: inline-block; margin: auto 7px");
        
        var panModeButton = _BuildDocumentToolbarButton("/icons/pdf_pan_view.svg", true);
        panModeButton.addEventListener("mouseenter", function(){
            if (_cursorMode != "pan") {
                panModeButton.style.backgroundColor = "#232B2D";
            }
        });
        panModeButton.addEventListener("mouseleave", function(){
            if (_cursorMode != "pan") {
                panModeButton.style.backgroundColor = "inherit";
            }
        });
        var textModeButton = _BuildDocumentToolbarButton("/icons/pdf_text_select.svg", true);
        textModeButton.addEventListener("mouseenter", function(){
            if (_cursorMode != "text") {
                textModeButton.style.backgroundColor = "#232B2D";
            }
        });
        textModeButton.addEventListener("mouseleave", function(){
            if (_cursorMode != "text") {
                textModeButton.style.backgroundColor = "inherit";
            }
        });
        
        if (_cursorMode == "pan") {
            panModeButton.style.backgroundColor = "#232B2D";
        } else if (_cursorMode == "text") {
            textModeButton.style.backgroundColor = "#232B2D";
        }
        
        panModeButton.addEventListener("mousedown", function(e){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursorMode = "pan";
            _setUserSelect(document.getElementsByClassName("PdfPageDisplayTextLayer"));
            panModeButton.style.backgroundColor = "#232B2D";
            textModeButton.style.backgroundColor = "inherit";
        });
        cursorModeGroup.appendChild(panModeButton);
        
        textModeButton.addEventListener("mousedown", function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursorMode = "text";
            _setUserSelect(document.getElementsByClassName("PdfPageDisplayTextLayer"));
            textModeButton.style.backgroundColor = "#232B2D";
            panModeButton.style.backgroundColor = "inherit";
        });
        cursorModeGroup.appendChild(textModeButton);
        
        return cursorModeGroup;
    }
    
    function _buildPrintGroup (parent) {
        var printGroup = document.createElement("div");
        printGroup.id = "CreoToolbarPrintGroup";
        printGroup.setAttribute('style', "display: inline-block; margin: auto 7px");
        printGroup.className = "CreoToolbarGroup";
        
        var printButton = _BuildDocumentToolbarButton("/icons/pdf_print.svg", true);
        printButton.addEventListener("click", function(){
            _PrintPdf(parent);
        });
        _AddToolbarButtonMouseOver(printButton);
        printGroup.appendChild(printButton);
        
        return printGroup;
    }
    
    function _UpdateDocumentToolbar(){
        var pageCounterSpan = document.getElementById("PageCounterSpan");
        var pageCounterInput = document.getElementById("PageCounterInput");
        pageCounterSpan.textContent = " / " + __TOTAL_PAGES;
        pageCounterSpan.insertBefore(pageCounterInput, pageCounterSpan.childNodes[0]);
        if (!_miniToolbar) {
            pageCounterSpan.nextSibling.style.marginLeft = (((__TOTAL_PAGES.toString() + " / ").length + 4) * 10.5) + "px";
        }
    }
    
    function _resizeDocumentToolbar(parent, groups){
        var toolbarDiv = document.getElementById("CreoViewDocumentToolbar");
        document.getElementById(_currentCanvasId).parentNode.style.height = (parseInt(parent.clientHeight) - _toolbarHeight) + "px";
        if (_sidebarEnabled){
            var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
            if (sidebarDiv) {
                sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
                sidebarDiv.childNodes[1].style.height = parseInt(parent.clientHeight) - (_toolbarHeight*2) + "px";
            }
        }
        if (!_miniToolbar) {   
            var buttonsWidth = 0;
            var toolbarGroups = document.getElementsByClassName("CreoToolbarGroup");
            for (var i = 0; i < toolbarGroups.length; i++){
                buttonsWidth += parseInt(toolbarGroups[i].clientWidth) + 10;
            }
            _toolbarButtonsWidth = buttonsWidth + 282;
            if(parent.clientWidth <= _toolbarButtonsWidth){
                _toggleToolbarCover("block");
                _BuildDocumentToolbarMenu(toolbarDiv, groups, parent);
            }
        } else {
            if (parent.clientWidth > _toolbarButtonsWidth + 1){
                _toggleToolbarCover("block");
                _BuildDocumentToolbarContent(toolbarDiv, groups, parent);
                document.getElementById("PageCounterInput").value = __CURRENT_PAGE;
            }
        }
        if (!_miniToolbar) {
            var midContainer = toolbarDiv.childNodes[2];
            midContainer.style.position = "absolute";
            midContainer.style.marginLeft = (parseInt(toolbarDiv.clientWidth) - (parseInt(midContainer.clientWidth) + 65))/2 + "px";
            midContainer.style.marginRight = (parseInt(toolbarDiv.clientWidth) - (parseInt(midContainer.clientWidth) + 65))/2 + "px";
            if(_toolbarGroups.pages) {
                var nextPageButton = document.getElementById("CreoToolbarPagesGroupNextPage");
                nextPageButton.style.marginLeft = (parseInt(document.getElementById("PageCounterSpan").clientWidth) + 20) + "px";
            }
        } else {
            var pageModeOptions = document.getElementById("PdfToolbarMiniMenuPageModeOptions");
            pageModeOptions.style.display = "none";
            pageModeOptions.parentNode.style.backgroundColor = "inherit";
            var midContainer = toolbarDiv.childNodes[2];
            midContainer.style.marginLeft = (parseInt(toolbarDiv.clientWidth) - 57)/2 + "px";
            var miniMenuDiv = document.getElementById("PdfToolbarMiniMenuButton").childNodes[1];
            miniMenuDiv.style.maxHeight = (parseInt(parent.clientHeight) - (_toolbarHeight + 15)) + "px";
            _toggleMenuScrollIndicator(miniMenuDiv, parent);;
        }
    }
    
    function _BuildDocumentToolbarMenu(toolbarDiv, groups, parent){
        _miniToolbar = true;        
        while(toolbarDiv.firstChild){
            toolbarDiv.removeChild(toolbarDiv.firstChild);
        }
        parent.removeEventListener("mousemove", function(e){
            _dragSearchBox(parent, e);
        });
        parent.removeEventListener("mouseleave", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });
        parent.removeEventListener("mouseup", function(){
            if (_searchDrag.enabled) {
                _searchDrag.enabled = false;
            }
        });
        
        var leftContainer = document.createElement("div");
        leftContainer.setAttribute('style',"float: left");
        var rightContainer = document.createElement("div");
        rightContainer.setAttribute('style',"float: right");
        var midContainer = document.createElement("div");
        midContainer.setAttribute('style',"margin-left: " + (parseInt(toolbarDiv.clientWidth) - 57)/2 + "px");
        toolbarDiv.appendChild(leftContainer);
        toolbarDiv.appendChild(rightContainer);
        toolbarDiv.appendChild(midContainer);
        
        var menuButton = document.createElement("span");
            menuButton.id = "PdfToolbarMiniMenuButton";
            var menuImage = document.createElement("img");
            _AddToolbarButtonLoad(menuImage);
            menuImage.src = ThingView.resourcePath + '/icons/pdf_more_menu.svg';
            menuButton.appendChild(menuImage);
            menuButton.setAttribute('style', "position: absolute; margin: 6px; padding: 6px; -webkit-user-select: none; -ms-user-select: none; -moz-user-select: none; cursor: pointer");
            var menuDiv = document.createElement("div");
            menuDiv.id = "PdfToolbarMiniMenuDiv";
            menuDiv.setAttribute('style', "display: none; background-color: #4D5055; position: absolute; z-index: 5; padding: 5px; margin-top: 12.5px; margin-left: -6px; cursor: auto; color: #FFFFFF; white-space: nowrap; max-height: " + (parseInt(parent.clientHeight) - (_toolbarHeight + 15)) + "px; overflow-y: auto; overflow-x: visible; scrollbar-width: none; -ms-overflow-style: none");
            var newStyle = "#PdfToolbarMiniMenuDiv::-webkit-scrollbar {display: none}";
            if (document.querySelector('style') && 
                document.querySelector('style').textContent.search(newStyle) == -1) {
                document.querySelector('style').textContent += newStyle;
            } else if (!document.querySelector('style')) {
                var style = document.createElement('style');
                style.textContent = newStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
            }
            if (groups.sidebar) {
                _buildMiniSidebarGroup(menuDiv);
            }       
            if (groups.pages) {
                _buildMiniPagesGroup(menuDiv);
                var pagesCounter = _buildPagesCounter();
                pagesCounter.style.marginLeft = "42px";
                leftContainer.appendChild(pagesCounter);
            }
            if (groups.rotate) {
                _buildMiniRotateGroup(menuDiv);
            }
            if (groups.zoom) {
                _buildMiniZoomGroup(menuDiv);
                var zoomGroup = document.createElement("div");
                zoomGroup.setAttribute('style', "display: inline-block; white-space: nowrap");
                var zoomInButton = _BuildDocumentToolbarButton("/icons/pdf_zoom_in.svg", true);
                _AddToolbarButtonMouseOver(zoomInButton);
                zoomInButton.addEventListener("click", function(){
                    _zoomButtonScale = 1.2;
                    _zoomButtonPDF();
                });
                zoomGroup.appendChild(zoomInButton);
                var zoomOutButton = _BuildDocumentToolbarButton("/icons/pdf_zoom_out.svg", true);
                _AddToolbarButtonMouseOver(zoomOutButton);
                zoomOutButton.addEventListener("click", function(){
                    _zoomButtonScale = 0.8;
                    _zoomButtonPDF();
                });
                zoomGroup.appendChild(zoomOutButton);
                midContainer.appendChild(zoomGroup);
            }            
            if (groups.cursor) {
                _buildMiniCursorGroup(menuDiv);
            }
            if (groups.print && _printEnabled) {
                _buildMiniPrintGroup(parent, menuDiv);
            }
            
            menuDiv.addEventListener("scroll", function(){
                _toggleMenuScrollIndicator(menuDiv);
            });
            
            menuButton.appendChild(menuDiv);
            menuButton.addEventListener("click", function(){
                if(menuDiv.style.display == "none"){
                    menuDiv.style.display = "block";
                    menuButton.style.backgroundColor = "#232B2D";
                    _toggleMenuScrollIndicator(menuDiv, parent);
                } else {
                    menuDiv.style.display = "none";
                    menuButton.style.backgroundColor = "inherit";
                }
            });
            menuButton.addEventListener("mouseenter", function(){
                if (menuDiv.style.display == "none") {
                    menuButton.style.backgroundColor = "#232B2D";
                }
            });
            menuButton.addEventListener("mouseleave", function(){
                if (menuDiv.style.display == "none") {
                    menuButton.style.backgroundColor = "inherit";
                }
            });
        
        if (groups.search) {
            var searchButton = _BuildDocumentSearchToolbar(parent);
            rightContainer.appendChild(searchButton);
        }        
        leftContainer.appendChild(menuButton);
    }
    
    function _buildMenuHr () {
        var hr = document.createElement("hr");
        hr.setAttribute('style', "margin-top: 4px; margin-bottom: 4px; color: #44474B; border-style: solid");
        return hr;
    }
    
    function _buildMiniPagesGroup (menuDiv) {
        var firstPageDiv = _createMiniMenuItem("First Page", "/icons/pdf_first_page.svg");
        firstPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadPage(_pdfCallback, 1);
        });
        _AddMiniToolbarEvents(firstPageDiv);
        menuDiv.appendChild(firstPageDiv);
        
        var prevPageDiv = _createMiniMenuItem("Previous Page", "/icons/pdf_previous_page.svg");
        prevPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadPrevPage(_pdfCallback);
        });
        _AddMiniToolbarEvents(prevPageDiv);
        menuDiv.appendChild(prevPageDiv);
        
        var nextPageDiv = _createMiniMenuItem("Next Page", "/icons/pdf_next_page.svg");
        nextPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadNextPage(_pdfCallback);
        });
        _AddMiniToolbarEvents(nextPageDiv);
        menuDiv.appendChild(nextPageDiv);
        
        var lastPageDiv = _createMiniMenuItem("Last Page", "/icons/pdf_last_page.svg");
        lastPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        });
        _AddMiniToolbarEvents(lastPageDiv);
        menuDiv.appendChild(lastPageDiv);
        
        menuDiv.appendChild(_buildMenuHr());
    }
    
    function _buildMiniRotateGroup (menuDiv) {
        var rotateClockwiseDiv = _createMiniMenuItem("Rotate Clockwise", "/icons/pdf_rotate_clockwise.svg");
        rotateClockwiseDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _RotateDocumentPages(_pageRotation + 90);
        });
        _AddMiniToolbarEvents(rotateClockwiseDiv);
        menuDiv.appendChild(rotateClockwiseDiv);
        
        var rotateAntiClockwiseDiv = _createMiniMenuItem("Rotate Anti-clockwise", "/icons/pdf_rotate_anti_clockwise.svg");
        rotateAntiClockwiseDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _RotateDocumentPages(_pageRotation - 90);
        });
        _AddMiniToolbarEvents(rotateAntiClockwiseDiv);
        menuDiv.appendChild(rotateAntiClockwiseDiv);
        _bookmarks.length > 0
        menuDiv.appendChild(_buildMenuHr());
    }
    
    function _buildMiniZoomGroup (menuDiv) {
        var zoomInDiv = _createMiniMenuItem("Zoom In", "/icons/pdf_zoom_in.svg");
        zoomInDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _zoomButtonScale = 1.2;
            _zoomButtonPDF();
        });
        _AddMiniToolbarEvents(zoomInDiv);
        menuDiv.appendChild(zoomInDiv); 
        
        var zoomOutDiv = _createMiniMenuItem("Zoom Out", "/icons/pdf_zoom_out.svg");
        zoomOutDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _zoomButtonScale = 0.8;
            _zoomButtonPDF();
        });
        _AddMiniToolbarEvents(zoomOutDiv);
        menuDiv.appendChild(zoomOutDiv);
        
        menuDiv.appendChild(_buildMenuHr());
        
        var pageModeOptionsDiv = document.createElement("div");
        pageModeOptionsDiv.id = "PdfToolbarMiniMenuPageModeOptions";
        pageModeOptionsDiv.setAttribute('style', "display: none; position: fixed; background-color: #4D5055; padding: 2px auto; overflow-y: scroll; scrollbar-width: none; -ms-overflow-style: none");
        var newStyle = "#PdfToolbarMiniMenuPageModeOptions::-webkit-scrollbar {display: none}";
        if (document.querySelector('style') && 
            document.querySelector('style').textContent.search(newStyle) == -1) {
            document.querySelector('style').textContent += newStyle;
        } else if (!document.querySelector('style')) {
            var style = document.createElement('style');
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        var pageModeButton = _createMiniMenuItem("Page Mode", null);
        var pageModeArrow = document.createElement("img");
        pageModeArrow.src = ThingView.resourcePath + "/icons/pdf_next_find.svg";
        pageModeArrow.setAttribute('style', "transform: rotate(90deg); float: right; overflow: visible");
        pageModeButton.appendChild(pageModeArrow);
        pageModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            if (pageModeOptionsDiv.style.display == "none") {
                pageModeOptionsDiv.style.left = (parseInt(pageModeButton.getBoundingClientRect().right) + 5) + "px";
                pageModeOptionsDiv.style.top = (parseInt(pageModeButton.getBoundingClientRect().top) + 1) + "px";
                pageModeOptionsDiv.style.maxHeight = (menuDiv.clientHeight - (pageModeButton.getBoundingClientRect().top - menuDiv.getBoundingClientRect().top) - 1) + "px";
                pageModeOptionsDiv.style.display = "block";
                pageModeButton.style.backgroundColor = "#232B2D";
            } else {
                pageModeOptionsDiv.style.display = "none";
                pageModeButton.style.backgroundColor = "inherit";
            }
        });
        pageModeButton.addEventListener("mouseenter", function(){
            if (pageModeOptionsDiv.style.display == "none") {
                pageModeButton.style.backgroundColor = "#232B2D";
            }
        });
        pageModeButton.addEventListener("mouseleave", function(){
            if (pageModeOptionsDiv.style.display == "none") {
                pageModeButton.style.backgroundColor = "inherit";
            }
        });
        pageModeButton.appendChild(pageModeOptionsDiv);
        menuDiv.appendChild(pageModeButton);
        
        var pageModeTexts = ["Original", "Fit Page", "Fit Width", "500%", "250%", "200%", "100%", "75%", "50%"];
        for (var i = 0; i < pageModeTexts.length; i++) {
            var optionDiv = document.createElement("div");
            optionDiv.setAttribute('style', "white-space: nowrap; padding: 2px 5px");
            optionDiv.textContent = pageModeTexts[i];
            optionDiv.addEventListener("click", function(e){
                e.stopPropagation();
                var processedPageMode = e.target.innerHTML.replace(" ", "").replace("%", "percent");
                _pageMode = processedPageMode;
                _setPageModePDF(__CURRENT_PAGE);
                for (var j = 0; j < e.target.parentNode.childNodes.length; j++) {
                    e.target.parentNode.childNodes[j].style.backgroundColor = "inherit";
                }
                e.target.style.backgroundColor = "#232B2D";
            });
            optionDiv.addEventListener("mouseenter", function(e){
                e.target.style.backgroundColor = "#232B2D";
            });
            optionDiv.addEventListener("mouseleave", function(e){
                var processedPageMode = e.target.innerHTML.replace(" ", "").replace("%", "percent");
                if (_pageMode != processedPageMode) {
                    e.target.style.backgroundColor = "inherit";
                }
            });
            pageModeOptionsDiv.appendChild(optionDiv);
        }
        menuDiv.appendChild(_buildMenuHr());
    }
    
    function _buildMiniCursorGroup (menuDiv) {
        var panModeButton = _createMiniMenuItem("Pan Mode", "/icons/pdf_pan_view.svg");
        menuDiv.appendChild(panModeButton);
        var textModeButton = _createMiniMenuItem("Text Select Mode", "/icons/pdf_text_select.svg");
        menuDiv.appendChild(textModeButton);        
        if (_cursorMode == "pan") {
            panModeButton.style.backgroundColor = "#232B2D";
        } else if (_cursorMode == "text") {
            textModeButton.style.backgroundColor = "#232B2D";
        }
        
        panModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursorMode = "pan";
            _setUserSelect(document.getElementsByClassName("PdfPageDisplayTextLayer"));
            panModeButton.style.backgroundColor = "#232B2D";
            textModeButton.style.backgroundColor = "inherit";
        });
        textModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursorMode = "text";
            _setUserSelect(document.getElementsByClassName("PdfPageDisplayTextLayer"));
            textModeButton.style.backgroundColor = "#232B2D";
            panModeButton.style.backgroundColor = "inherit";
        });
        
        panModeButton.addEventListener("mouseenter", function(){
            if (_cursorMode != "pan") {
                panModeButton.style.backgroundColor = "#232B2D";
            }
        });
        panModeButton.addEventListener("mouseleave", function(){
            if (_cursorMode != "pan") {
                panModeButton.style.backgroundColor = "inherit";
            }
        });
        textModeButton.addEventListener("mouseenter", function(){
            if (_cursorMode != "text") {
                textModeButton.style.backgroundColor = "#232B2D";
            }
        });
        textModeButton.addEventListener("mouseleave", function(){
            if (_cursorMode != "text") {
                textModeButton.style.backgroundColor = "inherit";
            }
        });
        
        menuDiv.appendChild(_buildMenuHr());
    }
    
    function _buildMiniSidebarGroup (menuDiv) {
        var sidebarToggleDiv = _createMiniMenuItem("Display Sidebar", "/icons/pdf_sidebar.svg");
        if (_sidebarEnabled){
            sidebarToggleDiv.style.backgroundColor = "#232B2D";
        }
        sidebarToggleDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _togglePdfSidePane();
            if (_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = "#232B2D";
            } else {
                sidebarToggleDiv.style.backgroundColor = "inherit";
            }
        });
        sidebarToggleDiv.addEventListener("mouseenter", function(){
            if(!_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = "#232B2D";
            }
        });
        sidebarToggleDiv.addEventListener("mouseleave", function(){
            if(!_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = "inherit";
            }
        });
        menuDiv.appendChild(sidebarToggleDiv);
        menuDiv.appendChild(_buildMenuHr());
    }
    
    function _buildMiniPrintGroup (parent, menuDiv) {
        var printDiv = _createMiniMenuItem("Print PDF", "/icons/pdf_print.svg");
        _AddMiniToolbarEvents(printDiv);
        printDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _PrintPdf(parent);
        });
        menuDiv.appendChild(printDiv);
    }
    
    function _createMiniMenuItem (text, imgURL) {
        var item = document.createElement("div");
        item.setAttribute('style', "background-color: #4D5055; color: #FFFFFF; cursor: pointer; height: 23px; padding-right: 10px; padding-top: 7px");
        item.textContent = text;
        if (imgURL) {
            var itemIcon = document.createElement("img");
            itemIcon.src = ThingView.resourcePath + imgURL;
            itemIcon.setAttribute('style', "margin: 0px 18px 0px 12px");
            item.insertBefore(itemIcon, item.childNodes[0]);
        } else {
            item.style.paddingLeft = "46px";
        }
        return item;
    }
    
    function _AddMiniToolbarEvents (button) {
        button.addEventListener("mouseenter", function(){
            button.style.backgroundColor = "#232B2D";
        });
        button.addEventListener("mouseleave", function(){
            button.style.backgroundColor = "inherit";
        });
    }
    
    function _setDocumentMenuUnderline (target) {
        if (_toolbarEnabled && _miniToolbar) {
            var options = target.parentNode.childNodes;
            for (var i = 0; i < options.length; i++) {
                options[i].style.textDecoration = "none";
            }
            target.style.textDecoration = "underline";
        }
    }
    
    function _BuildDocumentSearchToolbar (parent) {
        var searchButton = document.createElement("div");
            searchButton.id = "CreoToolbarSearchGroup";
            searchButton.setAttribute('style', "display: inline-block; margin: 6px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none");
            var searchIcon = document.createElement("img");
            _AddToolbarButtonLoad(searchIcon);
            searchIcon.alt = 'Search...';
            searchIcon.src = ThingView.resourcePath + '/icons/pdf_find.svg';
            searchButton.style.padding = "5px";
            searchButton.appendChild(searchIcon);
            searchButton.style.cursor = "pointer";
            
            var searchGroup = document.createElement("div");
            searchGroup.setAttribute('style', "display: none; color: #FFFFFF; background-color: #44474B; position: absolute; z-index: 1; padding: 0px 5px 5px; marginTop: 7.5px; top: 80px; right: 30px; cursor: move");
            searchGroup.id = "PdfToolbarSearchBox";
            _searchDrag.y = 80;
            _searchDrag.x = _toolbarHeight;
            
            var searchTextWrapper = document.createElement("span");
            searchTextWrapper.setAttribute('style', "margin-right: 2px; margin-top: 5px; display: inline-block; vertical-align: middle");
            
            var searchTextBox = document.createElement("input");
            searchTextBox.id = "PdfToolbarSearchTextBox";
            searchTextBox.type = "text";
            searchTextBox.setAttribute('style', "cursor: auto");
            searchTextBox.addEventListener("click", function(e){
                e.stopPropagation();
            });
            searchTextBox.addEventListener("mousedown", function(e){
                e.stopPropagation();
            });
            searchTextBox.addEventListener("keydown", function(e){
                if (e.key == "Enter") {
                    if (_searchTerm != searchTextBox.value) {
                        _SearchInPdfDocument(searchTextBox.value);
                    } else if (_searchResults.length > 1){
                        if(_searchResultFocus == _searchResults.length-1){
                            _focusPdfSearchResult(0);
                        } else {
                            _focusPdfSearchResult(_searchResultFocus+1);
                        }
                    }
                }
            });
            searchTextWrapper.appendChild(searchTextBox);
            searchGroup.appendChild(searchTextWrapper);
            
            var searchQueryButton =_BuildDocumentToolbarButton('/icons/pdf_find.svg', false);
            searchQueryButton.style.verticalAlign = "middle";
            _AddToolbarButtonMouseOver(searchQueryButton);
            searchQueryButton.addEventListener("click", function(e){
                e.stopPropagation();
                _SearchInPdfDocument(searchTextBox.value);
            });
            searchGroup.appendChild(searchQueryButton);
            
            var searchClearButton = _BuildDocumentToolbarButton('/icons/pdf_clear.svg', false);
            searchClearButton.style.backgroundColor = "transparent";
            searchClearButton.style.verticalAlign = "middle";
            searchClearButton.style.position = "absolute";
            searchClearButton.style.float = "right";
            searchClearButton.style.margin = "-1px 0px auto -20px";
            searchClearButton.addEventListener("click", function(e){
                e.stopPropagation();
                _searchResults = [];
                _searchTerm = "";
                searchTextBox.value = "";
                _removePdfSearchResultHighlights ();
            });
            searchTextWrapper.appendChild(searchClearButton);
            
            var searchNextButton = _BuildDocumentToolbarButton('/icons/pdf_previous_find.svg', false);
            searchNextButton.style.verticalAlign = "middle";
            _AddToolbarButtonMouseOver(searchNextButton);
            searchNextButton.addEventListener("click", function(e){
                e.stopPropagation();
                if(_searchResults.length > 1){
                    if(_searchResultFocus == _searchResults.length-1){
                        _focusPdfSearchResult(0);
                    } else {
                        _focusPdfSearchResult(_searchResultFocus+1);
                    }
                }
            });
            searchGroup.appendChild(searchNextButton);
            
            var searchPrevButton = _BuildDocumentToolbarButton('/icons/pdf_next_find.svg', false);
            searchPrevButton.style.verticalAlign = "middle";
            _AddToolbarButtonMouseOver(searchPrevButton);
            searchPrevButton.addEventListener("click", function(e){
                e.stopPropagation();
                if(_searchResults.length > 1){
                    if(_searchResultFocus == 0){
                        _focusPdfSearchResult(_searchResults.length-1);
                    } else {
                        _focusPdfSearchResult(_searchResultFocus-1);
                    }
                }
            });
            searchGroup.appendChild(searchPrevButton);
            
            var searchCloseButton = _BuildDocumentToolbarButton('/icons/pdf_close.svg', false);
            searchCloseButton.style.margin = "0px 0px -20px 12px";
            searchCloseButton.style.padding = "0px";
            _AddToolbarButtonMouseOver(searchCloseButton);
            searchCloseButton.addEventListener("click", function(e){
                e.stopPropagation();
                searchGroup.style.display = "none";
                searchButton.style.backgroundColor = "inherit";
                searchButton.style.color = "inherit";
                _searchResults = [];
                _searchTerm = "";
                _removePdfSearchResultHighlights ();
            });
            searchGroup.appendChild(searchCloseButton);
            
            var searchResultsDiv = document.createElement("div");
            searchResultsDiv.id = "PdfToolbarSearchResultsDiv";
            searchResultsDiv.setAttribute('style', "text-align: center; margin-top: 1px");
            searchResultsDiv.textContent = "Enter a search term";
            searchGroup.appendChild(searchResultsDiv);
            
            searchButton.appendChild(searchGroup);
            
            searchButton.addEventListener("click", function(e){
                e.stopPropagation();
                _toggleSearchBox();
            });
            searchGroup.addEventListener("click", function(e){
                e.stopPropagation();
            });
            searchGroup.addEventListener("mousedown", function(e){
                if (!_searchDrag.enabled) {
                    _searchDrag.enabled = true;
                    _searchDrag.x = e.clientX;
                    _searchDrag.y = e.clientY;
                }
            });
            parent.addEventListener("mousemove", function(e){
                _dragSearchBox(parent, e);
            });
            parent.addEventListener("mouseleave", function(){
                if (_searchDrag.enabled) {
                    _searchDrag.enabled = false;
                }
            });
            parent.addEventListener("mouseup", function(){
                if (_searchDrag.enabled) {
                    _searchDrag.enabled = false;
                }
            });
            searchButton.addEventListener("mouseenter", function(){
                if (searchGroup.style.display == "none") {
                    searchButton.style.backgroundColor = "#232B2D";
                }
            });
            searchButton.addEventListener("mouseleave", function(){
                if (searchGroup.style.display == "none") {
                    searchButton.style.backgroundColor = "inherit";
                }
            });
            
        return searchButton;
    }
    
    function _toggleSearchBox () {
        if (!_IsPDFSession() || !_toolbarEnabled || !_toolbarGroups.search) {
            return;
        }
        _searchDrag.enabled = false;
        var searchGroup = document.getElementById("PdfToolbarSearchBox");
        var searchButton = document.getElementById("CreoToolbarSearchGroup");
        if(searchGroup.style.display == "none"){
            searchGroup.style.display = "block";
            document.getElementById("PdfToolbarSearchTextBox").value = "";
            document.getElementById("PdfToolbarSearchResultsDiv").textContent = "Enter a search term";
            searchButton.style.backgroundColor = "#232B2D";
            searchButton.style.color = "#000000";
        } else {
            searchGroup.style.display = "none";
            searchButton.style.backgroundColor = "inherit";
            searchButton.style.color = "inherit";
        }
    }
    
    function _dragSearchBox (parent, e) {
        if (_searchDrag.enabled) {
            var parentRect = parent.getBoundingClientRect();
            var searchBox = document.getElementById("PdfToolbarSearchBox");
            var searchRect = searchBox.getBoundingClientRect();
            if (!(parentRect.left > searchRect.left - (_searchDrag.x - e.clientX)
                || parentRect.right - 20 < searchRect.right - (_searchDrag.x - e.clientX)
                || parentRect.top + 35 > searchRect.top - (_searchDrag.y - e.clientY)
                || parentRect.bottom - 20 < searchRect.bottom - (_searchDrag.y - e.clientY))) {
                    searchBox.style.right = (parseInt(searchBox.style.right) + (_searchDrag.x - e.clientX)) + "px";
                    searchBox.style.top = (parseInt(searchBox.style.top) - (_searchDrag.y - e.clientY)) + "px";
            }
            _searchDrag.x = e.clientX;
            _searchDrag.y = e.clientY;
        }
    }
    
    function _toggleMenuScrollIndicator (menuDiv, parent) {
        if (!document.getElementById("PdfToolbarMiniMenuScrollIndicator") && !(menuDiv.scrollTop == (menuDiv.scrollHeight - menuDiv.offsetHeight))) {
            var scrollIndicator = document.createElement("div");
            scrollIndicator.id = "PdfToolbarMiniMenuScrollIndicator";
            scrollIndicator.setAttribute('style', "background-color: #4D5055; box-shadow: 0px -7px 6px 0px #4D5055; width: " + (parseInt(menuDiv.clientWidth) - 10) + "px; height: 20px; position: fixed; bottom: " + (window.innerHeight - parseInt(menuDiv.getBoundingClientRect().bottom)) + "px; left: " + (parseInt(menuDiv.getBoundingClientRect().left) + 5) + "px");
            var scrollArrow = document.createElement("img");
            scrollArrow.src = ThingView.resourcePath + "icons/pdf_previous_find.svg";
            scrollArrow.setAttribute('style',"left: " + (parseInt(scrollIndicator.style.width)/2 - 8) + "px; top: 2px; position: absolute");
            scrollIndicator.appendChild(scrollArrow);
            menuDiv.appendChild(scrollIndicator);
        } else if (document.getElementById("PdfToolbarMiniMenuScrollIndicator") && (menuDiv.scrollTop == (menuDiv.scrollHeight - menuDiv.offsetHeight))){
            menuDiv.removeChild(document.getElementById("PdfToolbarMiniMenuScrollIndicator"));
        }
    }
    
    function _buildToolbarCover (parent) {
        var toolbarCover = document.createElement('div');
        toolbarCover.id = "PdfToolbarCover";
        toolbarCover.setAttribute('style', "display: block; z-index: 4; background-color: #44474B; width:" + parseInt(parent.clientWidth) + "px; height: " + _toolbarHeight + "px; position: fixed; top: " + (parseInt(parent.getBoundingClientRect().top) + 2) + "px");
        parent.appendChild(toolbarCover);
    }
    
    function _toggleToolbarCover (state) {
        if (!state) {
            return;
        }
        if (state == "none") {
            _toolbarGroupsLoaded.current += 1;
            if (_toolbarGroupsLoaded.targetFull == 0 || 
               (!_miniToolbar && _toolbarGroupsLoaded.current == _toolbarGroupsLoaded.targetFull) ||
               (_miniToolbar && _toolbarGroupsLoaded.current == _toolbarGroupsLoaded.targetMini)) {
                    document.getElementById("PdfToolbarCover").style.display = state;
            }
        } else if (state == "block"){
            _toolbarGroupsLoaded.current = 0;
             document.getElementById("PdfToolbarCover").style.display = state;
        }
    }
    
    //PDF BOOKMARKS
    
    function _ShowPdfBookmark (bookmarkTitle) {
        var bookmarkData = _GetPdfBookmark(bookmarkTitle, _bookmarks);
        if(!bookmarkData){
            return;
        }
        __PDF_DOC.getDestination(bookmarkData.dest).then(function(val){
            var destination = val ? val : bookmarkData.dest;
            __PDF_DOC.getPageIndex(destination[0]).then(function(pageIndex){
                if(destination[1].name == "FitB") {
                    _pageMode = "FitPage";
                    _setPageModePDF(pageIndex+1);
                } else {
                    _LoadPage(function(success){
                        if (success) {
                            if (destination[1].name == "XYZ" && !_checkPageRotation()) {
                                var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
                                var scrollTopAdjustment = document.getElementById("PdfPageDisplayCanvas" + (pageIndex + 1)).clientHeight - (destination[3] * __ZOOMSCALE);
                                scrollWrapper.scrollTop += scrollTopAdjustment;
                                scrollWrapper.scrollLeft += destination[2] * __ZOOMSCALE;
                            }
                        }
                        if (_pdfCallback) {
                            _pdfCallback(success);
                        }
                    }, pageIndex+1);
                }
            });
        });
    }
    
    function _GetPdfBookmark(bookmarkTitle, bookmarkList) {
        var returnBookmark = null;
        for(var i = 0; i < bookmarkList.length; i++) {
            if (bookmarkList[i].title == bookmarkTitle) {
                returnBookmark = bookmarkList[i];
            } else if (bookmarkList[i].items.length > 0){
                returnBookmark = _GetPdfBookmark(bookmarkTitle, bookmarkList[i].items);
            }
            if (returnBookmark){
                break;
            }
        }
        return returnBookmark;
    }
    
    //PDF SEARCH
    
    function _SearchInPdfDocument(searchTerm) {
        if(searchTerm == ""){
            return;
        }
        var resultsDisplay = document.getElementById("PdfToolbarSearchResultsDiv");
        _removePdfSearchResultHighlights();
        _searchResults = [];
        _searchTerm = searchTerm;
        _DisplayPdfSearchResultsDialogue(resultsDisplay)
        _BuildPdfSearchTermResults(searchTerm.toLowerCase(), [], 1, function(results){;
            if(results.length == 0){
                console.log("Search Term '" + searchTerm + "' not found");
            } else {
                _searchResults = results;
                _focusPdfSearchResult(_getFirstSearchResultForPage(__CURRENT_PAGE));
            }
            _UpdatePdfSearchResultsDialogue(resultsDisplay);
        });
    }
    
    function _BuildPdfSearchTermResults(searchTerm, results, i, callback) {
        if (i <= __TOTAL_PAGES){
            __PDF_DOC.getPage(i).then(function(page){return page.getTextContent();})
                .then (function(textContent){
                    for(var j = 0 ; j<textContent.items.length; j++){
                        if(textContent.items[j].str.toLowerCase().indexOf(searchTerm) != -1){
                            var resultObject = {pageNo: i, textItem: textContent.items[j]};
                            results.push(resultObject);
                        } else {
                            var count = _CheckForPartialSearchTerm(searchTerm, textContent.items, j, results, i);
                            if (count) {
                                j += count == 0 ? 0 : count-1;
                            }
                        }
                    }
                    _BuildPdfSearchTermResults(searchTerm, results, i+1, callback);
                });
        } else {
            if (callback) {
                callback(results);
            }
        }
    }
    
    function _DisplayPdfSearchResultsDialogue (resultsDisplay) {
        if (!resultsDisplay){
            return;
        }
        resultsDisplay.textContent = "Searching for results...";
    }
    
    function _UpdatePdfSearchResultsDialogue(resultsDisplay) {
        if (!resultsDisplay){
            return;
        }
        if(_searchResults.length == 0) {
            resultsDisplay.textContent = "No results found.";
        } else if (_searchResults.length == 1) {
            resultsDisplay.textContent = "1 result found.";
        } else {
            resultsDisplay.textContent = _searchResults.length + " results found.";
        }
    }
    
    function _CheckForPartialSearchTerm(remainingSearchTerm, items, j, results, page){
        if (j == items.length) {
            return 0;
        } else if (items[j].str == " ") {
            var returnValue = _CheckForPartialSearchTerm(remainingSearchTerm, items, j+1, results, page);
            return returnValue == 0 ? 0 : 1+returnValue;
        }
        if (items[j].str.indexOf(remainingSearchTerm) == 0) {
            var resultObject = {pageNo: page, textItem: items[j]};
            results.push(resultObject);
            return 1;
        } else {
            var splitSearchTerm = remainingSearchTerm.split(" ");
            var compositeSearchTerm = "";
            for (var i = 0; i < splitSearchTerm.length; i++){
                compositeSearchTerm += splitSearchTerm[i];
                var position = items[j].str.indexOf(compositeSearchTerm);
                if (position == -1) {
                    return 0;
                } else if (position + compositeSearchTerm.length == items[j].str.length){
                    var resultObject = {pageNo: page, textItem: items[j]};
                    results.push(resultObject);
                    var newSearchTerm = "";
                    for (var k = i+1; k < splitSearchTerm.length-1; k++) {
                        newSearchTerm += splitSearchTerm[k] + " ";
                    }
                    newSearchTerm += splitSearchTerm[splitSearchTerm.length-1];
                    var returnValue = _CheckForPartialSearchTerm(newSearchTerm, items, j+1, results, page);
                    if (returnValue == 0) {
                        results.pop();
                    }
                    return returnValue == 0 ? 0 : 1+returnValue;
                } else {
                    compositeSearchTerm += " ";
                }
            }
            return 0;
        }
    }
    
    function _HighlightPdfSearchResult (result, searchTerm) {
        if(result.pageNo >= _firstLoadedPage && result.pageNo <= _lastLoadedPage) {
            var textLayer = document.getElementById("PdfPageDisplayTextLayer" + result.pageNo);
            var textElement = null;
            for (var i = 0; i<textLayer.childNodes.length; i++){
                var childNode = textLayer.childNodes[i];
                if(childNode.textContent == result.textItem.str
                   && parseInt(childNode.style.left) == parseInt(result.textItem.transform[4]*__ZOOMSCALE)
                   && parseInt(childNode.style.top) >= parseInt(textLayer.clientHeight - (result.textItem.transform[5]*__ZOOMSCALE))-(result.textItem.height*__ZOOMSCALE)
                   && parseInt(childNode.style.top) <= parseInt(textLayer.clientHeight - (result.textItem.transform[5]*__ZOOMSCALE))+(result.textItem.height*__ZOOMSCALE)) {
                    textElement = textLayer.childNodes[i];
                    break;
                }
            }
            if (!textElement) {
                return;
            }
            var highlightedTextElement = textElement.cloneNode(true);
            var regEx = new RegExp(searchTerm.toLowerCase(), 'g');
            highlightedTextElement.className = "PdfSearchResultHighlight";
            highlightedTextElement.style.fontSize = parseInt(highlightedTextElement.style.fontSize) + 1;
            var partialMatch = _HighlightPartialSearchResult(highlightedTextElement.innerHTML.toLowerCase(), searchTerm.toLowerCase());
            if (partialMatch) {
                highlightedTextElement.innerHTML = partialMatch;
            }
            highlightedTextElement.innerHTML = highlightedTextElement.innerHTML.toLowerCase().replace(regEx, "<span style='background-color: yellow; opacity: 0.5'>" + searchTerm + "</span>");
            textLayer.appendChild(highlightedTextElement);
        }
    }
    
    function _HighlightPartialSearchResult(innerHTML, remainingSearchTerm){
        var splitSearchTerm = remainingSearchTerm.split(" ");
        var compositeSearchTerm = "";
        for (var i = 0; i < splitSearchTerm.length; i++){
            compositeSearchTerm += splitSearchTerm[i];
            var position = innerHTML.indexOf(compositeSearchTerm);
            var checkIndex = 0;
            var found = position != innerHTML.indexOf(remainingSearchTerm, checkIndex);
            while(!found){
                checkIndex = position + 1;
                if (checkIndex >= innerHTML.length){
                    return null;
                }
                position = innerHTML.indexOf(compositeSearchTerm, checkIndex);
                if (position != innerHTML.indexOf(remainingSearchTerm, checkIndex) || position == -1){
                    found = true;
                }
            }
            if (position == -1) {
                if (compositeSearchTerm.indexOf(" ") != -1) {
                    return null;
                } else {
                    compositeSearchTerm = "";
                }
            } else if (position + compositeSearchTerm.length == innerHTML.length){
                innerHTML = innerHTML.substr(0,position) + "<span style='background-color: yellow; opacity: 0.5'>" + compositeSearchTerm + "</span>";
                return innerHTML;
            } else if (i < splitSearchTerm.length-1){
                compositeSearchTerm += " ";
            }
        }
        if(compositeSearchTerm != "" && innerHTML.indexOf(compositeSearchTerm) == 0){
            innerHTML = innerHTML.replace(compositeSearchTerm, "<span style='background-color: yellow; opacity: 0.5'>" + compositeSearchTerm + "</span>");
            return innerHTML;
        }
        return null;
    }
    
    function _removePdfSearchResultHighlights () {
        var textLayers = document.getElementsByClassName("PdfPageDisplayTextLayer");
        for (var i = 0; i < textLayers.length; i++) {
            var j = 0;
            while (j < textLayers[i].childNodes.length){
                if(textLayers[i].childNodes[j].className == "PdfSearchResultHighlight") {
                    textLayers[i].removeChild(textLayers[i].childNodes[j]);
                } else {
                    j++;
                }
            }
        }
        var resultsDisplay = document.getElementById("PdfToolbarSearchResultsDiv");
        if (resultsDisplay) {
            resultsDisplay.textContent = "Enter a search term";
        }
    }
    
    function _focusPdfSearchResult (resultNumber) {
        if(resultNumber < 0 || resultNumber > _searchResults.length || _searchResults.length == 0){
            return;
        }
        _searchResultFocus = resultNumber;
        _removePdfSearchResultHighlights();
        _LoadPage(function(success){
            _HighlightPdfSearchResult(_searchResults[resultNumber], _searchTerm);
            var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
            _ignoreScrollEvent = true;
            scrollWrapper.scrollLeft = (_searchResults[resultNumber].textItem.transform[4]*__ZOOMSCALE)-(_searchResults[resultNumber].textItem.height*__ZOOMSCALE);
            scrollWrapper.scrollTop += document.getElementById("PdfPageDisplayTextLayer" + _searchResults[resultNumber].pageNo).clientHeight - (_searchResults[resultNumber].textItem.transform[5]*__ZOOMSCALE) - (_searchResults[resultNumber].textItem.height*__ZOOMSCALE);
            _ignoreScrollEvent = false;
            if (_pdfCallback) {
                _pdfCallback(success);
            }
        }, _searchResults[resultNumber].pageNo);
    }
    
    function _getFirstSearchResultForPage (pageNo) {
        for (var i = 0; i < _searchResults.length; i++) {
            if (_searchResults[i].pageNo >= pageNo){
                return i;
            }
        }
        return 0;
    }
    
    //PDF SIDEBAR
    
    function _DisplayPdfNavigationBar (parent, pageNo) {
        var navDiv = document.getElementById("CreoViewDocumentNavbar");
        _clearNavPages(navDiv);
        if (!navDiv) {
            navDiv = document.createElement("div");
            navDiv.id = "CreoViewDocumentNavbar";
            navDiv.setAttribute('style', "background-color: #656872; height: " + (parseInt(parent.clientHeight) - parseInt(parent.firstChild.clientHeight)) + "px; width: 100%; overflow-y: scroll; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none");
            var newStyle = "#CreoViewDocumentNavbar::-webkit-scrollbar {display: none}";
            if (document.querySelector('style') &&
                document.querySelector('style').textContent.search(newStyle) == -1) {
                document.querySelector('style').textContent += newStyle;
            } else if (!document.querySelector('style')) {
                var style = document.createElement('style');
                style.textContent = newStyle;
                document.getElementsByTagName('head')[0].appendChild(style);
            }
            navDiv.addEventListener("scroll", function(){
                _handleNavOnScroll(navDiv);
            });
            parent.appendChild(navDiv);
        }
        _PopulatePdfNavigationBar(navDiv, pageNo);
    }
    
    function _PopulatePdfNavigationBar (navDiv, pageNo) {
        _prepareNavWrapper(1, navDiv, function(){
            var pageLimit = 11 > __TOTAL_PAGES ? __TOTAL_PAGES : 11;
            _displayNavPages(1, pageLimit, function(){
                _navbar.firstLoadedPage = 1;
                _selectNavPage(document.getElementById("PdfNavPageWrapper" + pageNo), pageNo);
                _scrollNavbarToPage(navDiv, pageNo);
            });
        });
    }
    
    function _prepareNavWrapper (pageNo, navDiv, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var viewport = page.getViewport(0.2);
            var navWrapper = document.createElement("div");
            navWrapper.height = viewport.height;
            navWrapper.width = viewport.width;
            if (parseInt(navDiv.parentNode.clientWidth) > 300) {
                navWrapper.setAttribute('style', "width: " + viewport.width + "px; height: " + viewport.height + "px; margin: 10px 15px; display: inline-block; box-shadow: 3px 3px 12px rgba(0,0,0,0.5); cursor: pointer; transform: rotate(" + _pageRotation + "deg)");
                navDiv.style.textAlign = "left";
            } else {
                navWrapper.setAttribute('style', "width: " + viewport.width + "px; height: " + viewport.height + "px; margin: 10px auto; box-shadow: 3px 3px 12px rgba(0,0,0,0.5); cursor: pointer; transform: rotate(" + _pageRotation + "deg)");
                navDiv.style.textAlign = "center";
            }
            if (_checkPageRotation()) {
                var newTopMargin = 10 - (Math.abs(viewport.height - viewport.width)/2);
                var newBottomMargin = 10 - (Math.abs(viewport.height - viewport.width));
                if (parseInt(navDiv.parentNode.clientWidth) > 300) {
                    var newSideMargin = (Math.abs(viewport.width - viewport.height)/2) + 15;
                    navWrapper.style.margin =  newTopMargin + "px " + newSideMargin + "px " + newBottomMargin + "px";
                } else {
                    navWrapper.style.margin =  newTopMargin + "px auto " + newBottomMargin + "px";
                }
            }
            navWrapper.id = "PdfNavPageWrapper" + pageNo;
            navWrapper.addEventListener("click", function(){
                _selectNavPage(navWrapper, pageNo);
                _LoadPage(_pdfCallback, pageNo);
            });
            navWrapper.addEventListener("mouseenter", function(){
                document.body.style.cursor = "pointer";
            });
            navWrapper.addEventListener("mouseleave", function(){
                document.body.style.cursor = "auto";
            });
            navDiv.appendChild(navWrapper);
            if (pageNo < __TOTAL_PAGES) {
                _prepareNavWrapper(pageNo+1, navDiv, callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    }
    
    function _displayNavPages (pageNo, maxPageNo, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var navWrapper = document.getElementById("PdfNavPageWrapper" + pageNo);
            var viewport = page.getViewport(0.2);
            var canvas = document.createElement("canvas");
            canvas.id = "PdfNavPageCanvas" + pageNo;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var context = canvas.getContext('2d', {alpha: false});
            page.render({canvasContext: canvas.getContext('2d'), viewport: viewport}).then(function(){
                navWrapper.appendChild(canvas);
                if (pageNo < maxPageNo && pageNo < __TOTAL_PAGES){
                    _displayNavPages(pageNo+1, maxPageNo, callback);
                } else {
                    _ignoreScrollEvent = false;
                    _navbar.lastLoadedPage = maxPageNo;
                    if (callback) {
                        callback();
                    }
                }
            });
        });
    }
    
    function _RemovePdfSideBar (parent){
        if (_sidebarEnabled) {
            var sideBar = document.getElementById("CreoViewDocumentSidebar");
            if (sideBar) {
                parent.removeChild(sideBar);
                var currentCanvas = document.getElementById(_currentCanvasId);
                if (currentCanvas) {
                    currentCanvas.parentNode.style.marginLeft = "auto";
                }
                parent.removeEventListener("mousemove", function(e){
                    _ResizePdfSideBar(e, parent, sidebarDiv, scrollWrapper);
                });
                parent.removeEventListener("mouseup", function(e){
                    if (_sidebarResize) {
                        parent.style.cursor = "auto";
                        sidebarDiv.style.cursor = "auto";
                        _sidebarResize = false;
                        if (_navbar.enabled) {
                            var navDiv = document.getElementById("CreoViewDocumentNavbar");
                            if ((parseInt(sidebarDiv.clientWidth) > 300 && navDiv.style.textAlign == "center")
                                || (parseInt(sidebarDiv.clientWidth) <= 300 && navDiv.style.textAlign == "left")) {
                                _clearNavPages(navDiv);
                                _PopulatePdfNavigationBar(navDiv, _navbar.selectedPage);
                            }
                        }
                    }
                });
                _sidebarResize = false;
            }
        }
    }
    
    function _RemovePdfNavigationBar (parent){
        if (_sidebarEnabled && _navbar.enabled){
            parent.removeChild(document.getElementById("CreoViewDocumentNavbar"));
        }
    }
    
    function _clearNavPages (navDiv) {
        if (_navbar.enabled && navDiv){
            while (navDiv.firstChild) {
                navDiv.removeChild(navDiv.firstChild);
            }
        }
    }
    
    function _handleNavOnScroll(navDiv) {
        if (_ignoreScrollEvent) {
            return;
        }
        var currentLoadedHeight = _getNavPagesHeight(navDiv, _navbar.firstLoadedPage, _navbar.lastLoadedPage);
        if (currentLoadedHeight < navDiv.clientHeight) {
            if (_navbar._firstLoadedPage == 1 && _navbar._lastLoadedPage == __TOTAL_PAGES) {
                return;
            }                
            _ignoreScrollEvent = true;
            for (var i = _navbar.firstLoadedPage; i <= _navbar.lastLoadedPage; i++){
                var navWrapper = document.getElementById("PdfNavPageWrapper" + i);
                while (navWrapper && navWrapper.firstChild) {
                    navWrapper.removeChild(navWrapper.firstChild);
                }
            }
            var j = _navbar.firstLoadedPage - 1;
            if (_navbar.firstLoadedPage > 1 && document.getElementById("PdfNavPageWrapper" + _navbar.firstLoadedPage).getBoundingClientRect().top > navDiv.scrollTop) {
                var top = document.getElementById("PdfNavPageWrapper" + _navbar.firstLoadedPage).getBoundingClientRect().top;
                for (j; j > 0; j--) {
                    top -= document.getElementById("PdfNavPageWrapper" + j).height;
                    if (top < navDiv.scrollTop) {
                        break;
                    }
                }
            }
            var i = _navbar.lastLoadedPage + 1;
            if (_navbar.lastLoadedPage < __TOTAL_PAGES && document.getElementById("PdfNavPageWrapper" + _navbar.lastLoadedPage).getBoundingClientRect().bottom < navDiv.scrollTop + navDiv.clientHeight) {
                var bottom  = currentLoadedHeight;
                for (i; i < __TOTAL_PAGES; i++) {
                    bottom += document.getElementById("PdfNavPageWrapper" + i).height;
                    if (bottom > navDiv.clientHeight) {
                        break;
                    }
                }
            }
            _navbar.bufferSize = _navbar.firstLoadedPage - j > i - _navbar.lastLoadedPage ? (_navbar.firstLoadedPage - j) + 5 : (i - _navbar.lastLoadedPage) + 5;
            var newFirstPage = _navbar.firstLoadedPage - _navbar.bufferSize > 0 ? _navbar.firstLoadedPage - _navbar.bufferSize : 1;
            var newLastPage = _navbar.lastLoadedPage + _navbar.bufferSize < __TOTAL_PAGES ? _navbar.lastLoadedPage + _navbar.bufferSize : __TOTAL_PAGES;
            _displayNavPages(newFirstPage, newLastPage, function(){
                _ignoreScrollEvent = false;
            });
        } else if (navDiv.scrollTop+navDiv.clientHeight - _getNavPagesHeight(navDiv, 1, _navbar.lastLoadedPage) > navDiv.clientHeight
              || _getNavPagesHeight(navDiv, 1, _navbar.firstLoadedPage) - navDiv.scrollTop > navDiv.clientHeight) {
            _ignoreScrollEvent = true;
            for (var i = _navbar.firstLoadedPage; i <= _navbar.lastLoadedPage; i++){
                var navWrapper = document.getElementById("PdfNavPageWrapper" + i);
                while (navWrapper && navWrapper.firstChild) {
                    navWrapper.removeChild(navWrapper.firstChild);
                }
            }
            var currentNavPage = _getCurrentNavPage(navDiv);
            var newFirstPage = currentNavPage-_navbar.bufferSize > 0 ? currentNavPage-_navbar.bufferSize : 1;
            var newLastPage = currentNavPage+_navbar.bufferSize <= __TOTAL_PAGES ? currentNavPage+_navbar.bufferSize : __TOTAL_PAGES;
            _displayNavPages(newFirstPage, newLastPage, function(){
                _navbar.firstLoadedPage = newFirstPage;
                _ignoreScrollEvent = false;
                _handleNavOnScroll(navDiv);
            });
        } else if (_navbar.lastLoadedPage < __TOTAL_PAGES && _getNavPagesHeight(navDiv, 1, _navbar.lastLoadedPage) < navDiv.scrollTop+navDiv.clientHeight) {
            _ignoreScrollEvent = true;
            for (var i = 0; i < _navbar.bufferSize; i++){
                if (_navbar.firstLoadedPage > __TOTAL_PAGES || _navbar.firstLoadedPage < 1) {
                    break;
                }
                var navWrapper = document.getElementById("PdfNavPageWrapper" + _navbar.firstLoadedPage);
                while (navWrapper.firstChild) {
                    navWrapper.removeChild(navWrapper.firstChild);
                }
                _navbar.firstLoadedPage += 1;
            }
            var newFirstPage = _navbar.lastLoadedPage+1 <= __TOTAL_PAGES ? _navbar.lastLoadedPage+1 : __TOTAL_PAGES;
            var newLastPage = _navbar.lastLoadedPage+_navbar.bufferSize <= __TOTAL_PAGES ? _navbar.lastLoadedPage+_navbar.bufferSize : __TOTAL_PAGES;
            _displayNavPages(newFirstPage, newLastPage, function(){
                _ignoreScrollEvent = false;
            });
        } else if (_navbar.firstLoadedPage > 1 && _getNavPagesHeight(navDiv, 1, _navbar.firstLoadedPage) + (navDiv.clientHeight/2) > navDiv.scrollTop) {
            _ignoreScrollEvent = true;
            for (var i = 0; i < _navbar.bufferSize; i++){
                if (_navbar.lastLoadedPage < 1 || _navbar.lastLoadedPage > __TOTAL_PAGES) {
                    break;
                }
                var navWrapper = document.getElementById("PdfNavPageWrapper" + _navbar.lastLoadedPage);
                while (navWrapper.firstChild) {
                    navWrapper.removeChild(navWrapper.firstChild);
                }
                _navbar.lastLoadedPage -= 1;
            }
            var lastPageTemp = _navbar.lastLoadedPage;
            var newFirstPage = _navbar.firstLoadedPage-_navbar.bufferSize > 0 ? _navbar.firstLoadedPage-_navbar.bufferSize : 1;
            var newLastPage = _navbar.firstLoadedPage-1 > 0 ? _navbar.firstLoadedPage-1 : 1;
            _displayNavPages(newFirstPage, newLastPage, function(){
                _navbar.lastLoadedPage = lastPageTemp;
                _navbar.firstLoadedPage = newFirstPage;
                _ignoreScrollEvent = false;
            });
        }
    }
    
    function _getNavPagesHeight (navDiv, firstPage, lastPage) {
        if (firstPage > lastPage || firstPage == 0 || lastPage == 0) {
            return 0;
        }
        var height = 0;
        for (var i = firstPage; i < lastPage; i++) {
            var navWrapper = document.getElementById("PdfNavPageWrapper" + i);
            if (_checkPageRotation()) {
                height += parseInt(navWrapper.style.width) + 10;
            } else {
                height += parseInt(navWrapper.style.height) + 10;
            }
        }
        return height;
    }
    
    function _getCurrentNavPage (navDiv) {
        var scrollHeight = navDiv.scrollTop + (navDiv.clientHeight/2);
        var height = 0;
        var i = 1;
        for (i; i < __TOTAL_PAGES; i++) {
            var navWrapper = document.getElementById("PdfNavPageWrapper" + i);
            if (_checkPageRotation()) {
                height += parseInt(navWrapper.style.width) + 10;
            } else {
                height += parseInt(navWrapper.style.height) + 10;
            }
            if (height > scrollHeight) {
                break;
            }
        }
        i = i > 1 ? i-1 : 1;
        return i;
    }
    
    function _selectNavPage(navWrapper, pageNo) {
        if (pageNo < 1 || pageNo > __TOTAL_PAGES || !navWrapper) {
            return;
        }
        if (_navbar.selectedPage > 0 && _navbar.selectedPage <= __TOTAL_PAGES) {
            document.getElementById("PdfNavPageWrapper" + _navbar.selectedPage).style.border = "none";
        }
        navWrapper.style.border = "8px solid #80858E";
        _navbar.selectedPage = pageNo;
    }
    
    function _scrollNavbarToPage (navDiv, pageNo) {
        if (pageNo > __TOTAL_PAGES || pageNo < 1 || !navDiv || (pageNo == 1 && __TOTAL_PAGES == 1)) {
            return;
        }
        if (pageNo <= __TOTAL_PAGES) {
            if (_getNavPagesHeight(navDiv, 1, pageNo+1) > navDiv.scrollTop + navDiv.clientHeight || _getNavPagesHeight(navDiv, 1, pageNo) < navDiv.scrollTop) {
                navDiv.scrollTop = _getNavPagesHeight(navDiv, 1, pageNo);
            }
        } else {
            navDiv.scrollTop = _getNavPagesHeight(navDiv, 1, pageNo);
        }
        _handleNavOnScroll(navDiv);
    }
    
    function _togglePdfSidePane () {
        var currentCanvas = document.getElementById(_currentCanvasId);
        if (!currentCanvas){
            return;
        }
        var parentNode = document.getElementById(_currentCanvasId).parentNode.parentNode;
        if (!parentNode){
            return;
        }
        if (_sidebarEnabled){
            _RemovePdfSideBar(parentNode);
            _sidebarEnabled = false;
        } else {
            _sidebarEnabled = true;
            var tempPageNo = __CURRENT_PAGE;
            if (_bookmarks.length <= 0) {
                _bookmarksBar.enabled = false;
                _navbar.enabled = true;
            }
            if (_navbar.enabled){
                _DisplayPdfNavigationBar(_CreateSideBar(parentNode), tempPageNo);
            } else if (_bookmarksBar.enabled){
                _DisplayPdfBookmarksBar(_CreateSideBar(parentNode));
            }
        }
    }
    
    function _CreateSideBar (parent) {
        if (document.getElementById("CreoViewDocumentSidebar")) {
            return;
        }
        var sidebarDiv = document.createElement("div");
        sidebarDiv.id = "CreoViewDocumentSidebar";
        sidebarDiv.style.float = "left";
        sidebarDiv.style.width = "25%";
        sidebarDiv.setAttribute('style', "float: left; width: 300px")
        if (_toolbarEnabled) {
            sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
        } else {
            sidebarDiv.style.height = "100%";
        }
        var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        parent.insertBefore(sidebarDiv, scrollWrapper);
        scrollWrapper.style.marginLeft = "300px";
        var scrollWrapperTop = scrollWrapper.scrollTop;
        var scrollWrapperLeft = scrollWrapper.scrollLeft;
        _refreshPDF(function(){
            scrollWrapper.scrollTop = scrollWrapperTop;
            scrollWrapper.scrollLeft = scrollWrapperLeft;
        });
        
        var tabsDiv = document.createElement("div");
        tabsDiv.setAttribute('style', "width: 100%; height: " + _toolbarHeight + "px; background-color: #656872; position: relative; text-align: left");
        _PopulateSideBarTabs(tabsDiv);
        sidebarDiv.appendChild(tabsDiv);
        
        sidebarDiv.addEventListener("mouseover", function(e){
            if (!_sidebarResize 
                && e.clientX - parent.getBoundingClientRect().left > parseInt(sidebarDiv.style.width) - 5){
                sidebarDiv.style.cursor = "e-resize";
            }
        });
        
        sidebarDiv.addEventListener("mousemove", function(e){
            if (!_sidebarResize 
                && sidebarDiv.style.cursor == "e-resize" 
                && e.clientX - parent.getBoundingClientRect().left <= parseInt(sidebarDiv.style.width) - 5){
                    sidebarDiv.style.cursor = "auto";
            }
        });
        
        sidebarDiv.addEventListener("mousedown", function(e){
            if (!_sidebarResize 
                && e.clientX - parent.getBoundingClientRect().left > parseInt(sidebarDiv.style.width) - 5) {
                parent.style.cursor = "e-resize";
                _sidebarResize = true;
            }
        });
        
        parent.addEventListener("mouseup", function(e){
            if (_sidebarResize) {
                parent.style.cursor = "auto";
                sidebarDiv.style.cursor = "auto";
                _sidebarResize = false;
                if (_navbar.enabled) {
                    var navDiv = document.getElementById("CreoViewDocumentNavbar");
                    if ((parseInt(sidebarDiv.clientWidth) > 300 && navDiv.style.textAlign == "center")
                        || (parseInt(sidebarDiv.clientWidth) <= 300 && navDiv.style.textAlign == "left")) {
                        _clearNavPages(navDiv);
                        _PopulatePdfNavigationBar(navDiv, _navbar.selectedPage);
                    }
                }
            }
        });
        
        parent.addEventListener("mousemove", function(e){
            _ResizePdfSideBar(e, parent, sidebarDiv, scrollWrapper);
        });
        
        return sidebarDiv;
    }
    
    function _ResizePdfSideBar (e, parent, sidebarDiv, scrollWrapper) {
        if (_sidebarResize) {
                var newWidth = e.clientX - parent.getBoundingClientRect().left;
                if (newWidth > 200 && newWidth < parseInt(parent.clientWidth) - 200) {
                    sidebarDiv.style.width = newWidth + "px";
                    scrollWrapper.style.marginLeft = newWidth + "px";
                }
            }
    }
    
    function _PopulateSideBarTabs (tabsDiv) {
        var navbarTab = _BuildDocumentToolbarButton('/icons/pdf_nav_pane.svg', false);
        navbarTab.id = "CreoSidebarNavbarButton";
        navbarTab.style.position = "absolute";
        navbarTab.style.bottom = "6px";
        navbarTab.style.left = "6px";
        navbarTab.style.backgroundColor = "inherit";
        if (_navbar.enabled) {
            navbarTab.style.backgroundColor = "#3B4550";
        }
        tabsDiv.appendChild(navbarTab);
        
        var bookmarksTab = _BuildDocumentToolbarButton('/icons/pdf_bookmark.svg', false);
        bookmarksTab.id = "CreoSidebarBookmarksButton"
        bookmarksTab.style.position = "absolute";
        bookmarksTab.style.bottom = "6px";
        bookmarksTab.style.left = "38px";
        bookmarksTab.style.backgroundColor = "inherit";
        if (_bookmarksBar.enabled && _bookmarks.length > 0) {
            bookmarksTab.style.backgroundColor = "#3B4550";
        }
        if (_bookmarks.length <= 0) {
            bookmarksTab.style.opacity = 0.5;
            bookmarksTab.style.cursor = "auto";
        }
        tabsDiv.appendChild(bookmarksTab);
        
        navbarTab.addEventListener("click", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = "#3B4550";
                bookmarksTab.style.backgroundColor = "#656872";
                _RemovePdfBookmarksBar(tabsDiv.parentNode);
                _navbar.enabled = true;
                _bookmarksBar.enabled = false;
                _DisplayPdfNavigationBar(tabsDiv.parentNode);
            }
        });
        if (_bookmarks.length > 0) {
            bookmarksTab.addEventListener("click", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = "#3B4550";
                    navbarTab.style.backgroundColor = "#656872";
                    _RemovePdfNavigationBar(tabsDiv.parentNode);
                    _navbar.enabled = false;
                    _bookmarksBar.enabled = true;
                    _DisplayPdfBookmarksBar(tabsDiv.parentNode);
                }
            });
        }
        
        navbarTab.addEventListener("mouseenter", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = "#3B4550";
            }
        });
        navbarTab.addEventListener("mouseleave", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = "#656872";
            }
        });
        if (_bookmarks.length > 0) {
            bookmarksTab.addEventListener("mouseenter", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = "#3B4550";
                }
            });
            bookmarksTab.addEventListener("mouseleave", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = "#656872";
                }
            });
        }        
    }
    
    function _DisplayPdfBookmarksBar (parent) {
        var bookmarksDiv = document.createElement("div");
        bookmarksDiv.id = "CreoViewDocumentBookmarksBar";
        bookmarksDiv.setAttribute('style', "background-color: #656872; width: 100%; overflow-y: scroll; overflow-x: hidden; color: #FFFFFF; line-height: 30px; scrollbar-width: none; -ms-overflow-style: none");
        var newStyle = "#CreoViewDocumentBookmarksBar::-webkit-scrollbar {display: none}";
        if (document.querySelector('style') &&
            document.querySelector('style').textContent.search(newStyle) == -1) {
            document.querySelector('style').textContent += newStyle;
        } else if (!document.querySelector('style')) {
            var style = document.createElement('style');
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        bookmarksDiv.style.height = (parseInt(parent.clientHeight) - parseInt(parent.firstChild.clientHeight)) + "px";
        parent.appendChild(bookmarksDiv);
        _PopulatePdfBookmarksBar(bookmarksDiv);
    }
    
    function _PopulatePdfBookmarksBar (bookmarksDiv) {
        var bookmarksContent = document.createElement("div");
        bookmarksContent.id = "CreoViewDocumentBookmarksTreeWrapper";
        bookmarksContent.style.paddingTop = "5px";
        if(_bookmarks.length == 0){
            return;
        } else {
            _BuildDocumentBookmarksTree(bookmarksContent);
        }
        bookmarksDiv.appendChild(bookmarksContent);
    }
    
    function _BuildDocumentBookmarksTree(container) {
        var bookmarksTree = document.createElement("ul");
        bookmarksTree.id = "CreoViewDocumentBookmarksTree";
        bookmarksTree.setAttribute('style',"-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; text-align: left; margin-left: -40px");
        for(var i = 0; i<_bookmarks.length; i++){
            _BuildDocumentBookmarksTreeContent(_bookmarks[i], bookmarksTree, 40);
        }
        container.appendChild(bookmarksTree);
    }
    
    function _BuildDocumentBookmarksTreeContent(bookmark, bookmarksTree, marginCul) {
        var liElem = document.createElement("li");
        liElem.className = "CreoBookmarkElement";
        liElem.setAttribute('style',"color: #FFFFFF; background-color: transparent; position: relative; display: block");
        var highlightDiv = document.createElement("div");
        highlightDiv.setAttribute('style', "background-color: inherit; height: 30px; width: 100%; position: absolute; top: 0px; z-index: 1");
        liElem.appendChild(highlightDiv);
        if (bookmark.items.length == 0) {
            var spanElem = document.createElement("span");
            spanElem.textContent = bookmark.title;
            spanElem.setAttribute('style', "cursor: pointer; margin-left: " + (marginCul + 31) + "px; z-index: 2; position: relative; display: block; word-wrap: break-word");
            spanElem.addEventListener("click", function(){
                _ShowPdfBookmark(bookmark.title);
            });
            spanElem.addEventListener("mouseenter", function(){
                highlightDiv.style.height = spanElem.clientHeight;
                highlightDiv.style.backgroundColor = "#3B4550";
            });
            spanElem.addEventListener("mouseleave", function(){
                highlightDiv.style.backgroundColor = "inherit";
            });
            liElem.appendChild(spanElem);
        } else {
            var caretElem = document.createElement("span");
            caretElem.setAttribute('style', "cursor: pointer; z-index: 2; position: absolute; margin-left: " + marginCul + "px;");
            var caretImg = document.createElement("img");
            caretImg.src = ThingView.resourcePath + "icons/pdf_previous_find.svg";
            caretImg.setAttribute('style', "transform: rotate(-90deg); margin-top: 7px");
            caretElem.appendChild(caretImg);
            caretElem.addEventListener("click", function(){
                if(liElem.childNodes[3].style.display == "none"){
                    liElem.childNodes[3].style.display = "block";
                    caretImg.style.transform = "none";
                } else {
                    liElem.childNodes[3].style.display = "none";
                    caretImg.style.transform = "rotate(-90deg)";
                }
            });
            
            var spanElem = document.createElement("span");
            spanElem.setAttribute('style', "cursor: pointer; margin-left: " + (marginCul + 31) + "px; z-index: 2; position: relative; display: block; word-wrap: break-word");
            spanElem.textContent = bookmark.title;
            spanElem.addEventListener("click", function(){
                _ShowPdfBookmark(bookmark.title);
            });
            spanElem.addEventListener("mouseenter", function(){
                highlightDiv.style.height = spanElem.clientHeight;
                highlightDiv.style.backgroundColor = "#3B4550";
            });
            spanElem.addEventListener("mouseleave", function(){
                highlightDiv.style.backgroundColor = "inherit";
            });
            liElem.appendChild(caretElem);
            liElem.appendChild(spanElem);
            var ulElem = document.createElement("ul");
            ulElem.setAttribute('style', "display: none; margin-left: " + (0 - marginCul) + "px");
            liElem.appendChild(ulElem);
            for (var i = 0; i<bookmark.items.length; i++){
                _BuildDocumentBookmarksTreeContent(bookmark.items[i], ulElem, marginCul*2);
            }
        }
        bookmarksTree.appendChild(liElem);
    }
    
    function _ClearPdfBookmarksBar (bookmarksDiv) {
        if (_sidebarEnabled && _bookmarksBar.enabled) {
            while (bookmarksDiv.firstChild) {
                bookmarksDiv.removeChild(bookmarksDiv.firstChild);
            }
        }
    }
    
    function _RemovePdfBookmarksBar (parent) {
        if (_sidebarEnabled && _bookmarksBar.enabled){
            parent.removeChild(document.getElementById("CreoViewDocumentBookmarksBar"));
        }
    }
    
    function _BuildDocumentToolbarButton (imgURL, onLoadEvent) {
        var buttonDiv = document.createElement("div");
        buttonDiv.setAttribute('style', "-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; background-color: #44474B; margin-top: 6px; padding: 6px; cursor: pointer; display: inline-block; width: 16px; height: 16px");
        var buttonImage = document.createElement("img");
        if (onLoadEvent) {
            _AddToolbarButtonLoad(buttonImage);
        }
        buttonImage.src = ThingView.resourcePath + imgURL;
        buttonDiv.appendChild(buttonImage);
        return buttonDiv;
    }
    
    function _AddToolbarButtonMouseOver (button) {
        button.addEventListener("mouseenter", function(){
            button.style.backgroundColor = "#232B2D";
        });
        button.addEventListener("mouseleave", function(){
            button.style.backgroundColor = "#44474B";
        });
    }
    
    function _AddToolbarButtonLoad (buttonImage) {
        buttonImage.onload = function(){
            _toggleToolbarCover("none");
        }
    }
    
    // PDF ROTATE
    
    function _RotateDocumentPages (degrees) {
        if (degrees >= 360 || degrees <= -360) {
            degrees = degrees % 360;
        }
        _pageRotation = degrees;
        _refreshPDF(function(){
            if (_sidebarEnabled && _navbar.enabled) {
                _DisplayPdfNavigationBar (document.getElementById(_currentCanvasId).parentNode.parentNode, __CURRENT_PAGE);
            }
            _pdfCallback();
        });
    }
    
    function _checkPageRotation () {
        if ((_pageRotation >= 45 && _pageRotation <= 135)
            || (_pageRotation >= 225 && _pageRotation <= 315)
            || (_pageRotation >= -135 && _pageRotation <= -45)
            || (_pageRotation >= -315 && _pageRotation <= -225)) {
                return true;
            }
        return false;
    }
    
    // PDF PRINT
    
    function _PrintPdf (parent) {
        if (!_printEnabled || (_print && _print.running)) {
            return;
        }
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var scrollWrapper = canvasWrapper.parentNode;
        _print = {running: true};
        _preparePrintStyling();
        var printDiv = document.createElement("div");
        printDiv.id = "PdfPrintDiv";
        printDiv.className = "PdfPrintElement";
        printDiv.setAttribute('style', "display: none");
        parent.appendChild(printDiv);
        window.addEventListener('afterprint', _removePdfPrintDiv);
        var docCursor = document.body.style.cursor != "" ? document.body.style.cursor : "auto";
        document.body.style.cursor = "wait";
        _populatePrintDiv(printDiv, function(){
            document.body.style.cursor = docCursor;
            window.print();
        });
    }
    
    function _populatePrintDiv (printDiv, callback) {
        var zoomScale = 150/72;
        _preparePrintWrapper(1, printDiv, zoomScale, function(){
            _preparePrintPage (1, zoomScale, function(){
                callback();
            });
        });
    }
    
    function  _preparePrintWrapper (pageNo, printDiv, zoomScale, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var viewport = page.getViewport(zoomScale);
            var printWrapper = document.createElement("div");
            printWrapper.id = "PdfPrintWrapper" + pageNo;
            printWrapper.className = "PdfPrintElement";
            printWrapper.height = viewport.height;
            printWrapper.width = viewport.width;
            printDiv.appendChild(printWrapper);
            if (pageNo >= __TOTAL_PAGES) {
                if (callback) {
                    callback();
                }
            } else {
                _preparePrintWrapper(pageNo+1, printDiv, zoomScale, callback);
            }
        });
    }
    
    function _preparePrintPage (pageNo, zoomScale, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            var printWrapper = document.getElementById("PdfPrintWrapper" + pageNo);
            var viewport = page.getViewport(zoomScale);
            var canvas = document.createElement("canvas");
            canvas.className = "PdfPrintElement";
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var context = canvas.getContext('2d', {alpha: false});
            page.render({canvasContext: canvas.getContext('2d'), viewport: viewport, intent: 'print'}).then(function(){
                printWrapper.appendChild(canvas);
                if (pageNo < __TOTAL_PAGES){
                    _preparePrintPage(pageNo+1, zoomScale, callback);
                } else {
                    if (callback) {
                        callback();
                    }
                }
            });
        });
    }
    
    function _preparePrintStyling () {
        //We don't need to remove a users @media print styling because the rules of precedence say the last in wins
        var newStyle = "@media print{ body :not(.PdfPrintElement){ display: none} .PdfPrintElement{ border: none !important; margin: 0px !important; padding: 0px !important; width: 100% !important; height: 100% !important; overflow: visible !important; box-shadow: none !important; display: block !important} @page{ margin: 0px} *{ float: none !important}}";
        if (!document.querySelector('style')) {
            var style = document.createElement('style');
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        } else {
            document.querySelector('style').textContent += newStyle;
        }
    }
    
    function _removePrintStyling () {
        document.querySelector('style').textContent.replace("@media print{ body :not(.PdfPrintElement){ display: none} .PdfPrintElement{ border: none !important; margin: 0px !important; padding: 0px !important; width: 100% !important; height: 100% !important; overflow: visible !important; box-shadow: none !important; display: block !important} @page{ margin: 0px} *{ float: none !important}}", "");
    }
    
    function _addPdfPrintClass (element) {
        if (element.className != "") {
            element.className += " ";
        }
        element.className += "PdfPrintElement";
        if (element.parentNode && element.parentNode != document.body) {
            _addPdfPrintClass(element.parentNode);
        }
    }
    
    function _removePdfPrintDiv () {
        window.removeEventListener("afterprint", _removePdfPrintDiv);
        if (!_printEnabled || !_print || !_print.running) {
            return;
        }
        _print = null;
        _removePrintStyling();
        var printDiv = document.getElementById("PdfPrintDiv");
        printDiv.parentNode.removeChild(printDiv);
    }
    
    // MISC
    
    function _handleBrowserResize () {
        if(_toolbarEnabled){
            _resizeDocumentToolbar(document.getElementById(_parentCanvasId), _toolbarGroups);
        }
    }
        
})();
// ----END: extensions/ptc-thingview-extension/ui/thingview/js/ptc/thingview/thingview2d.js

// ----BEGIN: extensions/ptc-tile-widget/ui/tile-attribute-widget/tile-attribute-widget.config.js
(function (TW) {
    let widgetName = "tile-attribute-widget";

    let config = {
        //elementName control the Type property and the widget
        // name which will be display on the composer.
        // It must be the same as the web element name
        "elementName": "tile-attribute",
        "htmlImports": [
            {
                "id": "tile-attribute",
                "url": "tile-attribute/tile-attribute.js",
                "version": "^1.0.0"
            }
        ],
        "properties": {
            // Properties definitions settings.
            // Can change from here the default properties values.
            "Label": {
                "baseType": "STRING",
                "isBindingTarget": true
            },
            "Hidden": {
                "baseType": "BOOLEAN",
                "isBindingTarget": false,
                "defaultValue": false
            },
            // Properties definitions settings.
            // Can change from here the default properties values.
            "Configuration": {
                "baseType":"JSON",
                "isEditable":true,
                "isVisible": false
            },
            "InputData": {
                "baseType":"STRING",
                "isBindingTarget":true
            }
        },
        "flags": {
            "name": getLocalizedString("[[PTC.TileAttributeComponent.Name]]"),
            "description": getLocalizedString("[[PTC.TileAttribute.ToolTip]]"),
            "supportsAutoResize": true,
            "category": ["Beta"],
            "customEditor": "TileCustomEditor",
            "customEditorMenuText": getLocalizedString("[[PTC.TileAttribute.ConfigureTiles]]")
        },
        // Concatenating widgetName to rootPath to find the ui files
        // Should be the same as the widget name
        "widgetName": "tile-attribute-widget",
        "extensionName": "ptcs-widget-ext",
        "rootPath": "/Thingworx/Common/extensions/ptc-tile-widget/ui/",
        "imports": {
            "tile-attribute": "../../../extensions/tile-attribute/tile-attribute.js"
        }
    };

    // Temporary widgetWrapper if not initialized
    TW.Widget.widgetWrapper = TW.Widget.widgetWrapper || {
        imports: [],
        configs: {},
        loadImports: function (imports) {
            this.imports.push(imports);
        },
        config: function (name, config) {
            if (config) {
                this.configs[name] = config;
            }
            return this.configs[name];
        }
    };

    TW.Widget.widgetWrapper.config(widgetName, config);
})(TW);

function getLocalizedString(inputString) {

    //To get the localized string for the key
    var localizedName = "";
    if ((inputString !== null) &&(inputString !== undefined)) {
        var TW = window.TW || {};
        localizedName = TW.Runtime.convertLocalizableString(inputString);
    }
    //If localized value not found, return label as is
    localizedName = (localizedName !== "" && localizedName !== "???") ? localizedName : inputString;
    return localizedName;
};
// ----END: extensions/ptc-tile-widget/ui/tile-attribute-widget/tile-attribute-widget.config.js

// ----BEGIN: extensions/ptc-tile-widget/ui/tile-attribute-widget/tile-attribute-widget.runtime.js
(function (widgetName, isIDE) {
  let widgets = isIDE ? TW.IDE.Widgets : TW.Runtime.Widgets;
  widgets[widgetName] = function () {
    let config = TW.Widget.widgetWrapper.config(widgetName);
    TW.Widget.widgetWrapper.inject(config.elementName, this, config, isIDE);

    //[ custom code

    //]
  };

  let config = TW.Widget.widgetWrapper.config(widgetName); // = config;
  TW.Widget.widgetWrapper.loadImports(config.imports);
})("tile-attribute-widget", false);
// ----END: extensions/ptc-tile-widget/ui/tile-attribute-widget/tile-attribute-widget.runtime.js

// ----BEGIN: extensions/ptc-tile-widget/ui/tile-attribute-widget/tile-attribute-widget.customdialog.ide.js
// this will be instantiated with
//     new TW.IDE.Dialogs.TileCustomEditor()

TW.IDE.Dialogs.TileCustomEditor = function (){

    var self = this;
    /*******************************************
     * Set the following parameters according to your Component
     ********************************************/
    this.componentName = "PTC.Tile";
    this.defaultConfigurationName = "Default";
    //Set the following to something other then Configuration only for debugging
    this.configurationPropertyName = "Configuration";
    //*******************************************/

    this.initialConfiguration = {name:this.defaultConfigurationName, delta:{}};

    /**
     * Update the configuration property once "done" is clicked.
     * @param widgetObj - the widget object
     * @returns {boolean}
     */
    this.updateProperties = function(widgetObj) {
        var namedConfiguratoinComponent = $('#' + this.jqElementId + ' #named-configuration-component')[0];
        var configuration = namedConfiguratoinComponent.selectedConfiguration;

        widgetObj.setProperty(this.configurationPropertyName,
            configuration || widgetObj.getProperty(this.configurationPropertyName));

        return true;
    };

    /**
     * Calculates the HTML code for the configuration dialog.
     * @param widgetObj - the widget object
     * @returns {string}
     */
    this.renderDialogHtml = function (widgetObj) {
        var properties = widgetObj.properties;
        if (properties[this.configurationPropertyName] != null &&
            properties[this.configurationPropertyName] != undefined ){
            let configurationJson =
                (Object.prototype.toString.call(properties[this.configurationPropertyName]) === "[object String]" ?
                    JSON.parse(properties[this.configurationPropertyName]) : properties[this.configurationPropertyName]);
            if (configurationJson.name != undefined){
                this.initialConfiguration.name = configurationJson.name;
                if (configurationJson.delta != undefined){
                    this.initialConfiguration.delta = configurationJson.delta;
                }
            }
        }
        var html = '<div>' +
            '<named-config id="named-configuration-component" component-name="'+this.componentName +'"' +
            '></named-config>' +
            '<div>';
        return html;
    };

    /**
     * Running after the HTML code from "renderDialogHtml" has rendered to the DOM.
     * Used to bind code to specific events pushed from the dialog HTML code.
     * @param domElementId
     */
    this.afterRender = function(domElementId) {
        this.jqElementId = domElementId;
        let jqComponent = $('#' + this.jqElementId + ' #named-configuration-component');
        jqComponent[0].selectedConfiguration = this.initialConfiguration;
        jqComponent.on('verified-changed',
            function(event){
                $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',!event.originalEvent.detail.value)
            }
        );
        $('.ui-dialog-buttonpane').find('.btn-primary').prop('disabled',
            !jqComponent[0].verified);

    }
};
// ----END: extensions/ptc-tile-widget/ui/tile-attribute-widget/tile-attribute-widget.customdialog.ide.js

// ----BEGIN: extensions/textboxValidate_ExtensionPackage/ui/textboxValidate/textbox.runtime.js
(function () {

    // ensure validation only occurs on button click event and not other property change events
    var clickCheck;
    var addedDefaultStyles = false;
    var border;
    var isValidationMode = false;
    var cssTextboxFocusBorder;
    var validBorder;
    var background;
    var validBackground;
    var invalidBorder;
    var invalidBackground;
    var internalPath = "../Common/extensions/textboxValidate_ExtensionPackage/ui/textboxValidate/";

    function setToolTips(widget) {
        var tooltipPosition = widget.getProperty('ToolTipPosition').split(",");
        var toolTipDuration = widget.getProperty('ToolTipDuration') * 1000;
        $("#" + widget.jqElementId).qtip({
            style: {
                classes: widget.getProperty('ToolTipStyles'),
                def: false
            },
            position: {
                my: tooltipPosition[0],
                at: tooltipPosition[1]
            },
            show: {
                solo: true
            },
            hide: {
                inactive: toolTipDuration
            }
        });
    }

    TW.Runtime.Widgets.textboxValidate = function () {
        var thisWidget = this;
        var defaultValue = undefined;
        var onInputChange = function () {
            thisWidget.setProperty('Text', thisWidget.jqElement.find('input').val());
            // fire my bindable event so listeners know something happened
            thisWidget.jqElement.triggerHandler('Changed');
        };

        this.runtimeProperties = function () {
            return {
                'needsError': true,
                'propertyAttributes': {
                    'ToolTip': {
                        'isLocalizable': true
                    },
                    'ValidationHint': {
                        'isLocalizable': true
                    }
                }
            };
        };

        this.renderHtml = function () {
            defaultValue = thisWidget.getProperty('Text');
            var formatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('Style', 'DefaultTextBoxStyle'));
            border = TW.getStyleCssBorderFromStyle(formatResult);

            var textSizeClass = 'textsize-normal ';
            var textAlignClass = thisWidget.getProperty('TextAlign');
            if (thisWidget.getProperty('Style') !== undefined) {
                textSizeClass = TW.getTextSizeClassName(formatResult.textSize);
            }
            var cssInfo = TW.getStyleCssTextualFromStyle(formatResult);
            var cssTextBoxText = TW.getStyleCssTextualNoBackgroundFromStyle(formatResult);

            var inputType = 'text';
            if (this.getProperty('MaskInputCharacters') === true) {
                inputType = 'password';
            }

            //not in scope for SFW: replace maxchars with pattern to include a minChars equivalent method
            /*    if (this.getProperty('MaxChars')>0) {
             pattern = ' required pattern=".{,'+this.getProperty('MaxChars')+'}" title="'+this.getProperty('MaxChars')+' characters maximum" ';
             }

             if (this.getProperty('MinChars') > 0) {
             pattern = ' required pattern=".{' + this.getProperty('MinChars') + ',}" title="' + this.getProperty('MinChars') + ' characters minimum" ';
             }
             if (this.getProperty('MinChars') > 0 && this.getProperty('MaxChars') > 0) {
             pattern = ' required pattern=".{' + this.getProperty('MinChars') + ','+this.getProperty('MaxChars')+'}"title="Enter between ' + this.getProperty('MinChars')+' and '+this.getProperty('MaxChars')+' characters." ';
             }
             */
            var pattern = ' maxlength="' + this.getProperty('MaxChars') + '"';
            var placeholderText = thisWidget.getProperty('PlaceholderText');

            var html =
                '<div class="widget-content widget-textbox" ' +
                'title="' + (this.getProperty('ToolTip') === undefined ? 'Input Text' :
                Encoder.htmlEncode(this.getProperty('ToolTip'))) + '">' +
                '<table class="shadow inputTable" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" style="' + cssInfo + '">' +
                '<tr><td valign="middle">' +
                '<input' + pattern + 'type="' + inputType + '" class="widget-textbox-box ' + textSizeClass + ' ' + textAlignClass + '" tabindex="' + thisWidget.getProperty('TabSequence') + '" style="' + cssTextBoxText + '" ' + (thisWidget.getProperty('ReadOnly') === true ?
                'disabled="disabled" ' : '') + ' value="' + (thisWidget.getProperty('Text') === undefined ? '' :
                thisWidget.getProperty('Text').replace(/"/g, "&quot;")) + '" placeholder="' + (placeholderText === undefined ?
                '' : placeholderText) + '">' +
                '</input>' +
                '</td></tr>' +
                '</table>' +
                '</div>';
            return html;
        };

        this.afterRender = function () {
            // notice when "text" changes and update the 'Text' property
            var TextboxLabelStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('TextboxLabelStyle', 'DefaultWidgetLabelStyle'));
            var textboxFocusStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('DefaultTextboxFocusStyle', 'DefaultFocusStyle'));

            var TextboxLabel = TW.getStyleCssTextualNoBackgroundFromStyle(TextboxLabelStyle);
            var TextboxLabelSize = TW.getTextSize(TextboxLabelStyle.textSize);
            var TextboxLabelAlignment = this.getProperty('LabelAlignment', 'left');

            cssTextboxFocusBorder = TW.getStyleCssBorderFromStyle(textboxFocusStyle);
            var TextboxHeight = thisWidget.getProperty('Height');

            var formatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('Style', 'DefaultTextBoxStyle'));
            border = TW.getStyleCssBorderFromStyle(formatResult);
            background = TW.getStyleCssGradientFromStyle(formatResult);
            var validFormatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('ValidInputStyle', 'DefaultTextBoxStyle'));
            validBorder = TW.getStyleCssBorderFromStyle(validFormatResult);
            validBackground = TW.getStyleCssGradientFromStyle(validFormatResult);
            var invalidFormatResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('InvalidInputStyle', 'DefaultTextBoxStyle'));
            invalidBorder = TW.getStyleCssBorderFromStyle(invalidFormatResult);
            invalidBackground = TW.getStyleCssGradientFromStyle(invalidFormatResult);

            if (thisWidget.getProperty('TextboxLabelStyle', 'DefaultWidgetLabelStyle') === 'DefaultWidgetLabelStyle'
                && thisWidget.getProperty('DefaultTextboxFocusStyle', 'DefaultFocusStyle') === 'DefaultFocusStyle') {
                if (!addedDefaultStyles) {
                    addedDefaultStyles = true;
                    var defaultStyles = ' .runtime-widget-label { ' + TextboxLabel + TextboxLabelSize + ' text-align: ' + TextboxLabelAlignment + '; }' +
                        ' .widget-textbox table { ' + border + ' }' +
                        ' .widget-textbox.focus table { ' + cssTextboxFocusBorder + ' }' +
                        ' .widget-textbox-box { height: ' + TextboxHeight + 'px; }';
                    $.rule(defaultStyles).appendTo(TW.Runtime.globalWidgetStyleEl);
                }
            }
            else {
                var styleBlock =
                    '<style>' +
                    '#' + thisWidget.jqElementId + ' { ' + TextboxLabel + ' }' +
                    '#' + thisWidget.jqElementId + '-bounding-box .runtime-widget-label { ' + TextboxLabel + TextboxLabelSize + ' text-align: ' + TextboxLabelAlignment + '; }' +
                    '#' + thisWidget.jqElementId + ' table { ' + border + ' }' +
                    '#' + thisWidget.jqElementId + '.focus table { ' + cssTextboxFocusBorder + ' }' +
                    '</style>';

                $(styleBlock).prependTo(thisWidget.jqElement);
            }

            var textboxSelector = '#' + thisWidget.jqElementId + ' .widget-textbox-box';
            var textboxContainer = '#' + thisWidget.jqElementId + '.widget-textbox';

            $(textboxSelector).on('focus', function () {
                //$(textboxContainer).addClass('focus');
                thisWidget.setFocusStyle();
            });


            var inBlurHandlingInIe8 = false;
            $(textboxSelector).on('blur', function (e) {
                //$(textboxContainer).removeClass('focus');
                thisWidget.setBlurStyle();
                try {
                    if (e.target.selectionStart !== undefined) {
                        thisWidget.setProperty('CursorPosition', e.target.selectionStart);
                    }
                    else {
                        // ie8
                        if (inBlurHandlingInIe8) {
                            return;
                        }
                        inBlurHandlingInIe8 = true;
                        e.target.focus();
                        var el = e.target;
                        var range = document.selection.createRange();

                        if (range && range.parentElement() == el) {
                            var len = el.value.length;
                            var normalizedValue = el.value.replace(/\r\n/g, "\n");

                            // Create a working TextRange that lives only in the input
                            var textInputRange = el.createTextRange();
                            textInputRange.moveToBookmark(range.getBookmark());

                            // Check if the start and end of the selection are at the very end
                            // of the input, since moveStart/moveEnd doesn't return what we want
                            // in those cases
                            var endRange = el.createTextRange();
                            endRange.collapse(false);

                            var start, end;
                            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                                start = end = len;
                            }
                            else {
                                start = -textInputRange.moveStart("character", -len);
                                start += normalizedValue.slice(0, start).split("\n").length - 1;

                                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                                    end = len;
                                }
                                else {
                                    end = -textInputRange.moveEnd("character", -len);
                                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                                }
                            }
                            thisWidget.setProperty('CursorPosition', start);
                        }
                        e.target.blur();
                        setTimeout(function () {
                            // keep ie8 from infinite loop
                            inBlurHandlingInIe8 = false;
                        }, 1);
                    }
                }
                catch (err) {
                    TW.log.error('error trying to get cursor position on blur', err);
                }
            });
            window.setTimeout(setToolTips(thisWidget), 1000);
            thisWidget.jqElement.find('input').on('change', onInputChange);
        };

        this.updateProperty = function (updatePropertyInfo) {
            var widgetReference = this;
            var widgetElement = this.jqElement;

            if (updatePropertyInfo.TargetProperty === 'Text') {
                thisWidget.jqElement.find('input').val(updatePropertyInfo.SinglePropertyValue);
                thisWidget.setProperty('Text', updatePropertyInfo.SinglePropertyValue);
            }
            else if (updatePropertyInfo.TargetProperty === 'ToolTip') {
                widgetElement.qtip('destroy');
                widgetReference.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
                widgetElement.attr("title", widgetReference.getProperty('ToolTip'));
                window.setTimeout(setToolTips(widgetReference), 500);
            }
            // set ValidStyle to
            else if (updatePropertyInfo.TargetProperty === 'isValid' && this.clickCheck === "defined") {
                this.isValidationMode = true;
                if (updatePropertyInfo.SinglePropertyValue === "true") {
                    this.resetStyle(validBorder, validBackground, "green");
                }
                else {
                    this.resetStyle(invalidBorder, invalidBackground, "red");
                }
            }
            else {
                this.clickCheck = "defined";
            }
        };

        this.resetStyle = function (border, background, color) {
            var widgetReference = this;
            var widgetElement = this.jqElement;
            var borderColor = border.substr((border.indexOf("border-color:") + 13), 7);
            var borderWidth = border.substr((border.indexOf("border-width:") + 13), 3);
            var backgroundColor = background.substr((border.indexOf("background-color:") + 13), 7);
            var qtipStyle = "qtip-" + color;

            widgetElement.find('.inputTable').css("border-color", borderColor);
            widgetElement.find('.inputTable').css("border-width", borderWidth);
            widgetElement.find('.inputTable').css("background-color", backgroundColor);
            widgetElement.find('.inputTable').css("background-size", "18px,18px");
            // set the icon in the field (would use icon in style but no accessor property is offered)
            //widgetElement.find('.inputTable').css('background-image', 'url('+iconUrl+')');
            //widgetElement.find('.inputTable').css('background-repeat', 'no-repeat');
            //widgetElement.find('.inputTable').css('background-position', 'right');

            if (widgetReference.getProperty('ValidationHinting')) {
                // required field hint
                widgetElement.qtip('destroy');
                var toolTip = widgetReference.getProperty('ToolTip') + "  " + Encoder.htmlEncode(widgetReference.getProperty('ValidationHint'));
                widgetElement.attr("title", toolTip);
                window.setTimeout(setToolTips(widgetReference), 500);
            }

            widgetElement.qtip({
                style: {
                    classes: qtipStyle,
                    def: false
                },
                show: {
                    solo: false
                }
            });
        };

        this.resetInputToDefault = function () {
            var widgetReference = this;
            var widgetElement = this.jqElement;
            thisWidget.jqElement.find('input').val(defaultValue === undefined ? '' : defaultValue);
            thisWidget.setProperty('Text', defaultValue);
            //reset validation style to none
            this.resetStyle(border, background, "reset");
            widgetElement.qtip('destroy');
            widgetElement.attr("title", widgetReference.getProperty('ToolTip'));
            window.setTimeout(setToolTips(widgetReference), 500);
            this.isValidationMode = false;
        };

        this.setFocusStyle = function () {
            var widgetElement = this.jqElement;
            // if widget is not displaying validation styling, apply the focus border style
            if (!this.isValidationMode) {
                var borderColor = cssTextboxFocusBorder.substr((cssTextboxFocusBorder.indexOf("border-color:") + 13), 7);
                widgetElement.find('.inputTable').css("border-color", borderColor);
            }
        };

        this.setBlurStyle = function () {
            var widgetElement = this.jqElement;
            if (!this.isValidationMode) {
                var borderColor = border.substr((border.indexOf("border-color:") + 13), 7);
                widgetElement.find('.inputTable').css("border-color", borderColor);
            }
        };

        this.getProperty_Text = function () {
            if (thisWidget.jqElement !== undefined) {
                return thisWidget.jqElement.find('input').val();
            }
            else {
                return this.properties['Text'];
            }
        };

        this.beforeDestroy = function () {
            thisWidget.jqElement.find('input').off();
        };
    };
}());
// ----END: extensions/textboxValidate_ExtensionPackage/ui/textboxValidate/textbox.runtime.js

// ----BEGIN: extensions/TWX_Converge_Core_ExtensionPackage/ui/converge-accordion-menu/converge-accordion-menu.runtime.js
var twaccordionContext = new Array();

(function () {
    TW.Runtime.Widgets["converge-accordion-menu"] = function () {

        var thisWidget = this;

        this.ignoreSelectionEvent = false;
        this.firstChild = undefined;
        this.selectedValue = "";
        this.currentOpen = '';
        this.currentOpenMashup = '';
        this.definitionRows;

        this.menuToMashupMap;
        this.mashupParams;

        this.runtimeProperties = function () {
            return {
                'needsDataLoadingAndError': true
            };
        };

        this.setUpMapping = function() {
            var data = this.getProperty('_DataToParamMappings');
            if (data && data.length > 0) {
                // reset map obj
                this.menuToMashupMap = {};
                this.mashupParams = [];
                var menuDataKey, mashupParamKey;
                for(var i=0,l=data.length;i<l;i++) {
                    menuDataKey = data[i]['menuDataField'];
                    mashupParamKey = data[i]['mashupParam'] || menuDataKey;
                    this.menuToMashupMap[menuDataKey] = mashupParamKey;
                    this.mashupParams.push(mashupParamKey);
                }
            }
        };

        this.openCurrentMenuIfNeeded = function (useDefault) {
            var uri = window.location.href;
            var el = thisWidget.jqElement;
            if (el) {
                var foundItem;
                var mashup = uri.match(new RegExp('mashup=([^&|#]*)'));
                if (mashup) {
                    foundItem = el.find('[data-mashup="' + mashup[1] + '"]');
                    if (foundItem.length > 0) {
                        if (this.mashupParams && this.mashupParams.length > 0) {
                            var urlParam;
                            for (var i=0,l=this.mashupParams.length;i<l;i++) {
                                urlParam = uri.match(new RegExp(this.mashupParams[i]+ '=([^&|#]*)'));
                                if (urlParam) {
                                    foundItem = foundItem.filter('[data-'+ this.mashupParams[i].toLowerCase()
                                            + '="' + urlParam[1] + '"]');
                                }
                            }
                        }
                    }
                }
                if ((!foundItem || foundItem.length === 0) && useDefault) {
                    foundItem = foundItem.find('[data-dflt="true"]');
                } else if (foundItem.length > 1 && useDefault) {
                    foundItem = foundItem.filter('[data-dflt="true"]');
                }
                if (foundItem) {
                    foundItem = foundItem.first();
                    var parentMenu = foundItem.data('parent');
                    if (parentMenu !== thisWidget.currentOpen) {
                        thisWidget.currentOpen = parentMenu;
                        el.find(".down").removeClass("down");
                        el.find(".accordion-child").slideUp();
                        el.find("." + parentMenu).slideDown();
                        el.find("#" + parentMenu).addClass("down");
                    }
                    el.find(".AChildSClass").removeClass("AChildSClass");
                    foundItem.addClass("AChildSClass");
                }
            }
        };

        this.renderHtml = function () {
            var html = '<div class="widget-content widget-accordion" style="padding:'
                    + this.getProperty('Padding') + '"></div>';

            this.setUpMapping();

            var fn = this.openCurrentMenuIfNeeded;
            $(window).on('hashchange', function () {
                fn();
            });
            if (this.getProperty('ConfiguredOrDataDriven') === 'configured') {
                this.updateMenu(this.getProperty('Menu'));
            }
            return html;
        };

        this.redirectFromItemClick = function (itemClicked, asHash) {
            var mashup = itemClicked.data("mashup");
            var params = this.generateUrlParams(itemClicked);
            var target = (itemClicked.data("linkTarget") || 'self').toLowerCase();
            switch (target) {
                case 'new':
                    window.open(this.generateNewUrl(mashup, params), '_blank');
                    break;
                case 'popup':
                case 'modalpopup':
                    if (mashup) {
                        var fn;
                        thisWidget.showPopup(mashup, params, fn, fn,
                                (target === 'modalpopup'), '', 0, 0, 0.5,
                                false, "accordionMenuDialog-" + TW.createUUID(), true, true);
                    }
                    break;
                default:
                    if (asHash) {
                        window.location.hash = this.generateNewUrl(mashup, params, true);
                    } else {
                        window.location.href = this.generateNewUrl(mashup, params);
                    }
                    break;
            }
        };

        this.generateUrlParams = function(el) {
            if (el && this.mashupParams) {
                var params = [];
                for (var i=0,l=this.mashupParams.length;i<l;i++) {
                    params.push({
                        key: this.mashupParams[i],
                        value: el.data(this.mashupParams[i].toLowerCase())
                    });
                }
                return params;
            }
            return null;
        };

        this.generateNewUrl = function (mashup, params, asHash) {
            var url = window.location.href;
            var separator = url.indexOf('#') !== -1 ? "&" : "#";
            var key, re;
            if (mashup) {
                key = "mashup";
                re = new RegExp("([?&|#])" + key + "=.*?(&|$)", "i");
                if (url.match(re)) {
                    url = url.replace(re, '$1' + key + "=" + mashup + '$2');
                } else {
                    url += separator + key + "=" + mashup;
                    separator = "&";
                }
            }
            if (params) {
                var value, keyMatch;
                for (var i = 0, l = params.length; i < l; i++) {
                    key = params[i].key;
                    value = params[i].value;
                    if (value) {
                        re = new RegExp("([?&|#])" + key + "=.*?(&|$)", "i");
                        if (url.match(re)) {
                            url = url.replace(re, '$1' + key + "=" + value + '$2');
                        } else {
                            url += separator + key + "=" + value;
                            separator = "&";
                        }
                    } else {
                        keyMatch = url.match(new RegExp(key + '=([^&|#]*)'));
                        if (keyMatch) {
                            url = url.replace(keyMatch[1], "");
                        }
                    }
                }
            }
            if (asHash) {
                url = url.substring(url.indexOf('#'));
            }
            return url;
        };

        this.updateMenu = function (menuName) {
            if (menuName === undefined || menuName === null || menuName.length === 0) {
                return;
            }

            var invoker = new ThingworxInvoker({
                entityType: 'Menus',
                entityName: menuName,
                characteristic: 'Services',
                target: 'GetEffectiveMenu',
                apiMethod: 'post'
            });

            invoker.invokeService(function (invoker) {
                thisWidget.buildMenu(invoker.result.rows);
            });
        };

        this.buildMenu = function (rows) {
            var el = thisWidget.jqElement;
            if (!el) {
                return;
            }
            var html = "";
            var baseId = "";
            var lastGroup = "";
            var index = 0;
            var areaClass = thisWidget.getProperty('AreaStyle', 'DefaultLabelStyle');
            var titleClass = thisWidget.getProperty('TitleStyle', 'DefaultLabelStyle');
            var titleHoverClass = thisWidget.getProperty('TitleHoverStyle', 'DefaultLabelStyle');
            var childClass = thisWidget.getProperty('ChildStyle', 'DefaultLabelStyle');
            var childHoverClass = thisWidget.getProperty('ChildHoverStyle', 'DefaultLabelStyle');
            var childSelectedClass = thisWidget.getProperty('ChildSelectedStyle', 'DefaultLabelStyle');

            var areaStyle = TW.getStyleCssTextualFromStyleDefinition(areaClass);
            var titleStyle = TW.getStyleCssTextualFromStyleDefinition(titleClass);
            var titleHoverStyle = TW.getStyleCssTextualFromStyleDefinition(titleHoverClass);
            var childStyle = TW.getStyleCssTextualFromStyleDefinition(childClass);
            var childHoverStyle = TW.getStyleCssTextualFromStyleDefinition(childHoverClass);
            var childSelectedStyle = TW.getStyleCssTextualFromStyleDefinition(childSelectedClass);

            var areaSize = TW.getStyleFromStyleDefinition(areaClass).textSize;
            var titleSize = TW.getStyleFromStyleDefinition(titleClass).textSize;
            var childSize = TW.getStyleFromStyleDefinition(childClass).textSize;

            html += '<style>\n\n';
            html += '.AAreaClass { ' + areaStyle + ' }\n\n';
            html += '.ATitleClass { ' + titleStyle + ' }\n\n';
            html += '.ATitleHClass { ' + titleHoverStyle + ' }\n\n';
            html += '.AChildClass { ' + childStyle + ' }\n\n';
            html += '.AChildHClass { ' + childHoverStyle + ' }\n\n';
            html += '.AChildSClass { ' + childSelectedStyle + ' }\n\n';
            html += '</style>\n\n';

            var groupOption = this.getProperty('Groupings'),
                    groupField = this.getProperty('GroupField'),
                    titleSeparator = this.getProperty('TitleSeparator'),
                    group, titleItems;

            for (var i = 0, l = rows.length; i < l; i++) {
                var row = rows[i];
                if (row["parentMenuId"]) {
                    var title = TW.Runtime.convertLocalizableString(row["title"]);
                    if (baseId === row["parentMenuId"]) {
                        index++;
                        switch (groupOption) {
                            case 'field':
                                group = row[groupField] ?
                                        TW.Runtime.convertLocalizableString(row[groupField]) : "";
                                break;
                            case 'separator':
                                if (title.indexOf(titleSeparator) !== -1) {
                                    titleItems = title.split(titleSeparator);
                                    group = titleItems[0];
                                    title = "";
                                    for (var j = 1, tl = titleItems.length; j < tl; j++) {
                                        title += ((j > 1 ? titleSeparator : "") + titleItems[j]);
                                    }
                                }
                                break;
                            default:
                                group = "";
                                break;
                        }
                        if (group && group != lastGroup) {
                            lastGroup = group;
                            html += '<div class="accordion-area AAreaClass textsize-' + areaSize + '">'
                                    + group + '</div>';
                        }
                        var noChildClass = row["linkType"] == 'Mashup' ? 'accordion-parent-nochild ' : "";
                        html += '<div id="' + thisWidget.jqElementId + '_' + index
                                + '" class="accordion-parent '
                                + noChildClass + 'ATitleClass textsize-' + titleSize
                                + '" data-mashup="' + (row['linkDestination'] ? row['linkDestination'] : "") + '"'
                                + this.genMashupParamDataString(row)
                                + (row['isDefault'] ? ' data-dflt="' + row['isDefault'] + '"' : "")
                                + ' data-link-target="' + (row['linkTarget'] ? row['linkTarget'] : "Self") + '"'
                                + '>' + title;
                        var icon = row['imageURL'];
                        if (icon) {
                            html += '<div class="icon" style="pointer-events:none"><img src="'
                                    + TW.convertImageLink(icon) + '" style="pointer-events:none" width="30" height="30"/></div>';
                        }
                        html += '</div>';
                    } else {
                        html += '<div class="accordion-child ' + thisWidget.jqElementId
                                + '_' + index + ' AChildClass textsize-' + childSize
                                + '" style="display:none;"'
                                + ' data-mashup="' + row['linkDestination'] + '"'
                                + this.genMashupParamDataString(row)
                                + (row['isDefault'] ? ' data-dflt="' + row['isDefault'] + '"' : '')
                                + ' data-link-target="' + (row['linkTarget'] ? row['linkTarget'] : "Self") + '"'
                                + ' data-parent="' + thisWidget.jqElementId + '_' + index + '"'
                                + '>' + title + '</div>';
                    }
                } else {
                    baseId = row["menuId"];
                }
            }

            el.html(html);

            el.off('click', '.accordion-parent');
            el.on('click', '.accordion-parent', function (e) {
                e.stopPropagation();
                var itemClicked = $(e.target);
                if (!itemClicked.is('.accordion-parent-nochild')) {
                    if (!$("." + itemClicked.attr("id")).is(":visible")) {
                        $(".down").removeClass("down");
                        $(".accordion-child").slideUp();
                        $("." + itemClicked.attr("id")).slideDown();
                        $("#" + itemClicked.attr("id")).addClass("down");
                    } else {
                        $("." + itemClicked.attr("id")).slideUp();
                        $(".down").removeClass("down");
                    }
                } else {
                    thisWidget.redirectFromItemClick(itemClicked);
                }
            });
            el.off('mouseover', '.accordion-parent');
            el.on('mouseover', '.accordion-parent', function (e) {
                e.stopPropagation();
                var itemOver = $(e.target);
                itemOver.removeClass("ATitleClass");
                itemOver.addClass("ATitleHClass");
            });
            el.off('mouseout', '.accordion-parent');
            el.on('mouseout', '.accordion-parent', function (e) {
                e.stopPropagation();
                var itemOver = $(e.target);
                itemOver.removeClass("ATitleHClass");
                itemOver.addClass("ATitleClass");
            });

            el.off('mouseover', '.accordion-child');
            el.on('mouseover', '.accordion-child', function (e) {
                e.stopPropagation();
                var itemOver = $(e.target);
                itemOver.removeClass("AChildClass");
                itemOver.addClass("AChildHClass");
            });
            el.off('mouseout', '.accordion-child');
            el.on('mouseout', '.accordion-child', function (e) {
                e.stopPropagation();
                var itemOver = $(e.target);
                itemOver.removeClass("AChildHClass");
                itemOver.addClass("AChildClass");
            });

            el.off('click', '.accordion-child');
            el.on('click', '.accordion-child', function (e) {
                e.stopPropagation();
                $(".AChildSClass").removeClass("AChildSClass");
                var itemClicked = $(e.target);
                //thisWidget.jqElement.triggerHandler('Clicked');
                itemClicked.addClass("AChildSClass");
                thisWidget.currentOpen = itemClicked.data('parent');
                thisWidget.redirectFromItemClick(itemClicked, true);
            });

            this.openCurrentMenuIfNeeded(true);
        };

        this.genMashupParamDataString = function(rowData) {
            var str = "";
            if (this.menuToMashupMap) {
                for (var key in this.menuToMashupMap) {
                    if (this.menuToMashupMap.hasOwnProperty(key)) {
                        // jquery will convert camelcase,
                        // so just force lowercase attribute name
                        str += ' data-' + this.menuToMashupMap[key].toLowerCase() +
                             '="' + (rowData[key] ? rowData[key] : "") + '"';
                    }
                }
            }

            return str;
        };

        this.selectItem = function () {
        };

        this.afterRender = function () {
            this.jqElement.html('');
        };

        this.updateProperty = function (info) {
            if (info.TargetProperty === 'MenuData' &&
                    this.getProperty('ConfiguredOrDataDriven') === 'datadriven') {
                this.definitionRows = info.ActualDataRows;
                this.buildMenu(this.definitionRows);
            }
        };

        this.beforeDestroy = function () {
            var widgetElement = this.jqElement;

            try {
                widgetElement.unbind();
            } catch (destroyErr) {
            }

            try {
                widgetElement.empty();
            } catch (destroyErr) {
            }
        };
    };
}());
// ----END: extensions/TWX_Converge_Core_ExtensionPackage/ui/converge-accordion-menu/converge-accordion-menu.runtime.js

// ----BEGIN: extensions/TWX_Converge_Core_ExtensionPackage/ui/converge-datafilter/converge-datafilter.runtime.js
/*global TW */

TW.Runtime.Widgets["converge-datafilter"] = function () {

    var widgetReference = this;
    var expire = 200, moveFiltersTimeout,
        liveFiltering = false;

    this.runtimeProperties = function () {
        return {
            'needsDataLoadingAndError': false
        };
    };

    this.renderHtml = function () {

        this.lastFieldDefinitions = undefined;

        //        var cssInfo = TW.getStyleCssTextualFromStyleDefinition(this.getProperty('Style'));

        //        if (cssInfo.length > 0) {
        //            cssInfo = 'style="' + cssInfo + '"';
        //        }

        var containerClass = 'active-filter-bar-container';

        if (widgetReference.getProperty('Horizontal')) {
            // Add a styling class to the filter's drop-down/status/add control.
            containerClass += ' active-filter-bar-container-horizontal';
        }

        var dateFormatToken = widgetReference.getProperty("DateFormatToken", '');
        var dateFormatAttr = (dateFormatToken !== '' ? "date-format-token=" + dateFormatToken : '');
        var html =
            '<div class="widget-content widget-datafilter" ' + dateFormatAttr +
            ' tabindex="' + widgetReference.getProperty('TabSequence') + '" width="100%" height="100%" ' +
            'style="z-index:9000;" show-advanced-options="' + widgetReference.getProperty("ShowAdvancedOptions") + '">' +
            '<div class="focusDisplay">' +
            '<div class="' + containerClass + '" style="z-index:9000;">' +
            // content from twActiveFiltersBar.js goes here
            '</div>' +
            '</div>' +
            '</div>';
        return html;
    };

    this.buildFiltersFromFieldDefinitions = function (fieldDefinitions) {
        var thisWidget = this;
        var shouldUpdateFilters = false;
        liveFiltering = thisWidget.getProperty("LiveFiltering");

        var nFields = 0;
        for (var field in fieldDefinitions) {
            nFields++;
        }
        if (nFields === 0) {
            // if no fields are in the shape definition, ignore this
            shouldUpdateFilters = false;
        } else if (this.lastFieldDefinitions === undefined) {
            shouldUpdateFilters = true;
        } else {
            if (JSON.stringify(this.lastFieldDefinitions) === JSON.stringify(fieldDefinitions)) {
                shouldUpdateFilters = false;
            } else {
                // since datashape from metadata and datashape from actual return data can be different we need to compare field by field
                for (var prop in this.lastFieldDefinitions) {
                    if (fieldDefinitions[prop] === undefined) {
                        shouldUpdateFilters = true;
                        break;
                    } else if (fieldDefinitions[prop].baseType !== this.lastFieldDefinitions[prop].baseType) {
                        shouldUpdateFilters = true;
                        break;
                    }
                }

                // now we know that every field in lastFieldDefinitions is in the latest fieldDefinitions and the definition
                // is the same

                // now go through fieldDefinitions and make sure none were added
                for (var prop in fieldDefinitions) {
                    if (this.lastFieldDefinitions[prop] === undefined) {
                        var propInfo = fieldDefinitions[prop];
                        var baseType = propInfo.baseType;
                        if (baseType === 'TAGS') {
                            if (propInfo.aspects !== undefined && propInfo.aspects.tagType !== undefined) {
                                if (propInfo.aspects.tagType === 'DataTags') {
                                    baseType = 'TAGS.Data';
                                } else if (propInfo.aspects.tagType === 'ModelTags') {
                                    baseType = 'TAGS.Model';
                                }
                            }
                        }
                        widgetReference.filterBar.twActiveFiltersBar('addPotentialFilter', baseType, propInfo.name, propInfo.description, false/*inFilterListNow*/, undefined /*currentFilter*/, false /*isSystemFilter*/, true /*editable*/, undefined /*showEdit*/, TW.Runtime.convertLocalizableString(propInfo.Title), liveFiltering);
                    }
                }
            }
            this.lastFieldDefinitions = fieldDefinitions;
        }


        // only update the filters if the data structure has changed
        if (shouldUpdateFilters) {

            this.lastFieldDefinitions = fieldDefinitions;

            // make sure we're above all the other widgets
            this.jqElement.closest('.widget-bounding-box').css('z-index', 9999);

            widgetReference.filterBar = this.jqElement.find('.active-filter-bar-container');
            widgetReference.filterBar.twActiveFiltersBar('destroy');
            widgetReference.filterBar.empty().unbind();

            var formatResult = TW.getStyleFromStyleDefinition(this.getProperty('BarStyle', 'DefaultDataFilterStyle'));
            var formatAddBtnResult = TW.getStyleFromStyleDefinition(this.getProperty('AddButtonStyle', 'DefaultDataFilterAddButtonStyle'));

            var cssInfo = TW.getStyleCssTextualNoBackgroundFromStyle(formatResult);
            var cssDataFilterBackground = TW.getStyleCssGradientFromStyle(formatResult);
            var cssDataFilterBorder = TW.getStyleCssBorderFromStyle(formatResult);

            var cssDataFilterAddButtonText = TW.getStyleCssTextualNoBackgroundFromStyle(formatAddBtnResult);
            var cssDataFilterAddButtonBackground = TW.getStyleCssGradientFromStyle(formatAddBtnResult);

            widgetReference.filterBar.twActiveFiltersBar({
                dataFilterId: widgetReference.jqElementId,
                customCssInfo: {
                    cssInfo: cssInfo,
                    cssDataFilterBackground: cssDataFilterBackground,
                    cssDataFilterBorder: cssDataFilterBorder,
                    cssDataFilterAddButtonText: cssDataFilterAddButtonText,
                    cssDataFilterAddButtonBackground: cssDataFilterAddButtonBackground
                }
            });

            for (var field in fieldDefinitions) {
                var propInfo = fieldDefinitions[field];
                if (propInfo.__showThisField !== false) {
                    var baseType = propInfo.baseType;
                    if (baseType === 'TAGS') {
                        if (propInfo.aspects !== undefined && propInfo.aspects.tagType !== undefined) {
                            if (propInfo.aspects.tagType === 'DataTags') {
                                baseType = 'TAGS.Data';
                            } else if (propInfo.aspects.tagType === 'ModelTags') {
                                baseType = 'TAGS.Model';
                            }
                        }
                    }
                    widgetReference.filterBar.twActiveFiltersBar('addPotentialFilter', baseType, propInfo.name, propInfo.description, false/*inFilterListNow*/, undefined /*currentFilter*/, false /*isSystemFilter*/, true /*editable*/, undefined /*showEdit*/, TW.Runtime.convertLocalizableString(propInfo.Title), liveFiltering);
                }
            }

            //                    widgetReference.filterBar.twActiveFiltersBar('addPotentialFilter', 'STRING', 'source', 'Driver Name', false/*inFilterListNow*/, undefined /*currentFilter*/, false /*isSystemFilter*/, true /*editable*/);
            //                    widgetReference.filterBar.twActiveFiltersBar('addPotentialFilter', 'TAGS', 'tags', 'Tags to filter by', false/*inFilterListNow*/, undefined /*currentFilter*/, false /*isSystemFilter*/, true /*editable*/);

            widgetReference.filterBar.bind('filtersUpdated', function (e, filters) {
                //TW.log.info('results updated filters: "' + JSON.stringify(filters) + '"');

                var activeFilterInformation = [];

                // go through each filter specified and extract model and data tags to their proper place, put the others into activeFilterInformation
                var filters = widgetReference.filterBar.twActiveFiltersBar('getProperty', 'currentActiveFilters');
                var filterType = widgetReference.filterBar.twActiveFiltersBar('getProperty', 'filterType', 'And');

                for (var i = 0; i < filters.length; i++) {
                    var filter = filters[i];
                    activeFilterInformation.push(filter.currentFilter);
                }

                var queryImplementingThingsFilter = undefined;
                if (activeFilterInformation.length > 0) {
                    // we have some filters ... need to do special work here

                    var filters = activeFilterInformation;

                    if (filters.length === 1) {
                        queryImplementingThingsFilter =
                        {
                            filters: filters[0]
                        };
                    } else {
                        queryImplementingThingsFilter =
                        {
                            filters: {
                                type: filterType,
                                filters: filters
                            }
                        };
                    }
                }
                widgetReference.setProperty('Query', queryImplementingThingsFilter);

                widgetReference.jqElement.triggerHandler('Changed');
            });
        }
    };


    // Phil: I'm keeping this around as reference for if we ever want to have this information retrieved before receiving any data...

    //    this.updateFilterBar = function () {


    //        var entityName = this.getProperty('EntityName');
    //        var entityType = this.getProperty('StreamOrDataTable');
    //        if (entityName !== undefined && entityName.length > 0) {
    //            $.ajax({ url: '/Thingworx/Things/' + entityName + '/Metadata/?Accept=application%2Fjson&method=get',
    //                type: "GET",
    //                datatype: "json",
    //                cache: false,
    //                async: false,
    //                error: function (xhr, status) {
    //                    TW.log.error('datafilter.runtime.js: could not load Metadata for  "' + entityName + '", xhr: "' + JSON.stringify(xhr) + '"');
    //                },
    //                success: function (data) {
    //                    var method = undefined;
    //                    switch (entityType) {
    //                        case 'Stream':
    //                            method = 'QueryStreamEntriesWithData';
    //                            break;
    //                        case 'DataTable':
    //                            method = 'QueryDataTableEntries';
    //                            break;
    //                        default:
    //                            TW.log.error('datafilter.runtime.js: Unknown entityType "' + entityType + '"');
    //                            return;
    //                    }

    //                    var fieldDefinitions = data.serviceDefinitions[method].Outputs.fieldDefinitions;

    //                    widgetReference.buildFiltersFromFieldDefinitions(fieldDefinitions);

    //                }
    //            });
    //        }
    //    };

    this.afterRender = function () {
        var buttonFocusStyle = TW.getStyleFromStyleDefinition(widgetReference.getProperty('FocusStyle', 'DefaultButtonFocusStyle'));
        var cssDataFilterFocusBorder = TW.getStyleCssBorderFromStyle(buttonFocusStyle); // border-width:3px;border-color:#3399ff;border-style:solid;
        cssDataFilterFocusBorder += 'margin: -' + cssDataFilterFocusBorder.match(/border-width:([0-9]+px;)/)[1];

        var styleBlock = '<style>' +
            '#' + widgetReference.jqElementId + ' .focus {' + cssDataFilterFocusBorder + '} ' +
            '</style>';
        $(styleBlock).prependTo(widgetReference.jqElement);

        var widgetSelector = '#' + widgetReference.jqElementId;
        var widgetContainer = '#' + widgetReference.jqElementId + ' .focusDisplay';
        var moveFilterFlag = false;

        $(widgetSelector).on('focusin', function () {
            $(widgetContainer).removeClass('cssDataFilterBorder');
            $(widgetContainer).addClass('focus');

        });

        $(widgetSelector).on('focusout', function (e) {
            $(widgetContainer).removeClass('focus');
            $(widgetContainer).addClass('cssDataFilterBorder');
        });

        // put popup persistent elements into their respective widgets so they move with them
        // scroll and resize are momentary (use timeout), folding panel and collapsing layout panel until expanded again
        $(widgetSelector).on('moveFilters', function (e, momentary) {
            var dataFilterElem = $("#" + widgetReference.jqElementId).parent();
            var filters = $('body').children('div[data-filter-id="' + widgetReference.jqElementId + '"]');
            var filtersInStack = filters.find('.results-filter-item').length;
            //do filters extend below window bottom edge?
            // get bottom of lowest filter plus buffer to prevent thrashing
            var filtersBottom = filters.height() + dataFilterElem.offset().top + 20;
            var isFilterHanging = window.innerHeight < filtersBottom;
            widgetReference.wasfilterHanging = false;
            // wasFilterHanging tells us to bypass the timeout when recovering from filters extending beyond window bottom
            if (isFilterHanging === true) {
                widgetReference.wasFilterHanging = true;
            }
            // keep incrementing expiration amount to reduce flickering of overlapping elements
            expire += 200;

            // flag to prevent multiple executions (important if momentary)
            if (!isFilterHanging && moveFilterFlag === false) {
                // only move filter elem if it has filters in it - FF, IE fire window resize on load
                if (filtersInStack > 0) {
                    var widgetHeight = widgetReference.jqElement.outerHeight();
                    filters.appendTo('.widget-content' + widgetSelector);
                    filters.css({
                        left : 0,
                        top : widgetHeight
                    });
                    // filters were outside window bounds last time this ran, don't use timeout
                    if (widgetReference.wasFilterHanging === true) {
                        widgetReference.jqElement.trigger('popFilters');
                        widgetReference.wasfilterHanging = false;
                        moveFilterFlag = false;
                    } else if (momentary) {
                        //only exercise once per event
                        moveFilterFlag = true;
                        moveFiltersTimeout = setTimeout(function () {
                            widgetReference.jqElement.trigger('popFilters');
                            moveFilterFlag = false;
                        }, expire);
                    }
                }
            } else if (isFilterHanging === true) {
                var filterLeft = widgetReference.jqElement.offset().left;
                if (filters.width() === 690 && filterLeft + 690 - window.innerWidth > 0) {
                    filterLeft -= (filterLeft + 714 - window.innerWidth);
                }
                filters.css({
                    left : filterLeft
                });
            }
        });

        // put filters back in popup attached to body root in DOM
        $(widgetSelector).on('popFilters', function (e) {
            clearTimeout(moveFiltersTimeout);
            var widgetOffset = widgetReference.jqElement.offset();
            var widgetHeight = widgetReference.jqElement.outerHeight();
            var filterEditingLeft = widgetOffset.left;
            var filters = widgetReference.jqElement.find('.twActiveFiltersBar.active-filters-bar');
            filters.appendTo('body');
            // when filter is in editing mode. 714 is to include scrollbar in IE
            if (filters.width() === 690 && widgetOffset.left + 690 - $(window).width() > 0) {
                filterEditingLeft = widgetOffset.left - (widgetOffset.left + 714 - window.innerWidth);
            }

            //move filter to updated location on body
            filters.css({
                left : filterEditingLeft,
                top : widgetHeight + widgetOffset.top
            });

            // reset expire value to starting value
            expire = 200;
        });

        // make sure we're above all the other widgets
        this.jqElement.closest('.widget-bounding-box').css('z-index', 9999);
        var columnFormatString = this.getProperty('ColumnFormat');
        if (columnFormatString !== undefined && columnFormatString.length > 0) {
            try {
                var dataShape = JSON.parse(columnFormatString);
                this.buildFiltersFromFieldDefinitions(dataShape);
            } catch (err) {
            }
        }

    };

    this.updateProperty = function (updatePropertyInfo) {
        if (updatePropertyInfo.TargetProperty === "Top" || updatePropertyInfo.TargetProperty === "Left" || updatePropertyInfo.TargetProperty === "Width" || updatePropertyInfo.TargetProperty === "Height") {
            this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue);
            this.jqElement.css(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue + "px");
        } else if (updatePropertyInfo.TargetProperty === "Data") {
            this.buildFiltersFromFieldDefinitions(updatePropertyInfo.DataShape);
        } else if (updatePropertyInfo.TargetProperty === "ColumnFormat") {
            this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
            var dataShape = JSON.parse(updatePropertyInfo.RawSinglePropertyValue);
            this.buildFiltersFromFieldDefinitions(dataShape);
        } else if (updatePropertyInfo.TargetProperty === "Query") {
            widgetReference.filterBar.twActiveFiltersBar('updateActiveFilters', updatePropertyInfo.RawSinglePropertyValue);
            widgetReference.jqElement.trigger('moveFilters',[true]);
	    }
        if (updatePropertyInfo.TargetProperty === "CustomClass") {
            widgetReference.jqElement.trigger('moveFilters',[true]);
        }
    };

    this.beforeDestroy = function () {
        $("body").find(".cancel-filter").click();
        this.lastFieldDefinitions = null;
        widgetReference.filterBar = this.jqElement.find('.active-filter-bar-container');
        widgetReference.filterBar.twActiveFiltersBar('destroy');
        widgetReference.filterBar.empty().unbind();
        widgetReference = null;
    };

};
// ----END: extensions/TWX_Converge_Core_ExtensionPackage/ui/converge-datafilter/converge-datafilter.runtime.js

// ----BEGIN: extensions/TWX_Converge_Core_ExtensionPackage/ui/converge-dhxgrid/converge-dhxgrid.runtime.js
(function () {
    var addedDefaultStyles = false;

    TW.Runtime.Widgets["converge-dhxgrid"] = function () {
        var thisWidget = this,
            scrollBarWidth = null, // it holds the calculated scrollbar width
            isAndroid = false, //TW.isAndroidDevice(),
            currentDataInfo,
            currentRows,
            currentSortInfo,
            hasBeenSorted = false,
            nColumns = 0,
            colModel = [], colInfo = [], colFormat,
            updateCount = 0,
            dhxGrid,
            currentFieldsString = '',
            eventIds = [],
            domElementIdOfDhxGrid,
            autoWidthColumns = [],
            gridHeader = '',
            gridInitWidths = '',
            gridColAlign = '',
            gridHeaderColAlign = [],
            gridColTypes = '',
            gridColSorting = '',
            isMultiselect = false,
            selectedRowIndices = [],
            expandGridToShowAllRows = false,
            expandGridToShowAllColumns = false,
            ignoreSelectionChanges = false,
            textSizeClass,
            isPrintLayout = false,
            rowFormat, rowHeight,
            maxScrollPos, showAllColumns, isEditable, isCellTextWrapping;

	    var initGrid = function () {
	        rowFormat = thisWidget.getProperty("RowFormat");
            rowHeight = thisWidget.getProperty('RowHeight') || 30;
            showAllColumns = thisWidget.getProperty('ShowAllColumns', false);
			colFormat = thisWidget.getProperty('ColumnFormat');

	        try {
	            destroyGrid();
                var formatGridHeaderResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridHeaderStyle', 'DefaultGridHeaderStyle'));
                var headerFontWidth = 7;
                if (thisWidget.getProperty('GridHeaderStyle') !== undefined) {
                    textSizeClass = TW.getTextSizeClassName(formatGridHeaderResult.textSize);
                    headerFontWidth = TW.getTextSizeFontWidth(formatGridHeaderResult.textSize);
                }

		dhxGrid = new dhtmlXGridObject(domElementIdOfDhxGrid);
                dhxGrid.fontWidth = headerFontWidth;

	        dhxGrid.enableKeyboardSupport(true);
	        dhxGrid._colModel = colModel;
	        dhxGrid.setImagePath("/Thingworx/Common/dhtmlxgrid/codebase/imgs/");

				// MRD-346: Header doesn't count the width of a column correctly when it contains CKJ characters
				// This will check each header column for the number of these characters they contain
				// Then pad the string with the number of spaces equal to the number of CKJ characters divided by 2
				// Codes are based on codes here: http://www.rikai.com/library/kanjitables/kanji_codes.unicode.shtml
				gridHeader = gridHeader.split(',')
					.map(function(value){
						var count = 0;
						var chars;
						if (chars = value.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf\u3400-\u4dbf]/g)){
							chars.forEach(function(char){
								count++;
							});
							value += Array(Math.ceil(count*.8)).join(' ');
						}
						return value
					})
					.join(',');

	            dhxGrid.setHeader(gridHeader,null,gridHeaderColAlign);
	            dhxGrid.setInitWidths(gridInitWidths);
	            dhxGrid.setColAlign(gridColAlign);
	            if (gridColTypes.length > 0) {
	                dhxGrid.setColTypes(gridColTypes);
	            }
	            dhxGrid.init();
	            dhxGrid.setAwaitedRowHeight(rowHeight);
				dhxGrid.enableAlterCss('even', 'uneven');
		        if( expandGridToShowAllRows ) {
			        if( expandGridToShowAllColumns )  {
				        dhxGrid.enableAutoWidth(true);
			        }
			        dhxGrid.enableAutoHeight(true);
		        }

		        if( expandGridToShowAllRows || isEditable === true)  {
		            dhxGrid.enableSmartRendering(false);
		        } else {
                dhxGrid.enableSmartRendering(true);
                dhxGrid.enablePreRendering();
                dhxGrid.enableMultiline(isCellTextWrapping);
		        }

	            for (var i = 0; i < autoWidthColumns.length; i++) {
	                dhxGrid.adjustColumnSize(autoWidthColumns[i]);
	            }
                // this calls customCellRendering eXcell_twCustom eventually
	            addCustomProcessing(dhxGrid);

	            if (isAndroid) {
	                var nscrolls;
	                var changeIntervalId;

	                var handleScrollLeft = function () {
	                    var gridDomElem = dhxGrid.objBox;
	                    maxScrollPos = 0;
	                    var maxScrollAtATime = gridDomElem.clientWidth * .9;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollLeft - scrollAmt) < 0) {
	                        gridDomElem.scrollLeft = 0;
	                    } else {
	                        gridDomElem.scrollLeft = gridDomElem.scrollLeft - scrollAmt;
	                    }
	                };

	                var handleScrollRight = function () {
	                    var gridDomElem = dhxGrid.objBox;
	                    maxScrollPos = gridDomElem.scrollWidth - gridDomElem.clientWidth + 25;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollLeft + scrollAmt) > maxScrollPos) {
	                        gridDomElem.scrollLeft = maxScrollPos;
	                    } else {
	                        gridDomElem.scrollLeft = gridDomElem.scrollLeft + scrollAmt;
	                    }
	                };

	                var handleScrollUp = function () {
	                    var gridDomElem = dhxGrid.objBox;
	                    maxScrollPos = 0;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollTop - scrollAmt) < 0) {
	                        gridDomElem.scrollTop = 0;
	                    } else {
	                        gridDomElem.scrollTop = gridDomElem.scrollTop - scrollAmt;
	                    }
	                };

	                var handleScrollDown = function () {
	                    var gridDomElem = dhxGrid.objBox;
	                    maxScrollPos = gridDomElem.scrollHeight - gridDomElem.clientHeight + 25;
	                    var scrollAmt = 20;
	                    if ((gridDomElem.scrollTop + scrollAmt) > maxScrollPos) {
	                        gridDomElem.scrollTop = maxScrollPos;
	                    } else {
	                        gridDomElem.scrollTop = gridDomElem.scrollTop + scrollAmt;
	                    }
	                };

	                thisWidget.jqElement.find('.grid-horz-left-all').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    dhxGrid.objBox.scrollLeft = 0;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();
	                });

	                thisWidget.jqElement.find('.grid-vert-up-all').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    dhxGrid.objBox.scrollTop = 0;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();
	                });

	                thisWidget.jqElement.find('.grid-vert-down-all').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    var gridDomElem = dhxGrid.objBox;
	                    maxScrollPos = gridDomElem.scrollHeight - gridDomElem.clientHeight + 25;
	                    gridDomElem.scrollTop = maxScrollPos;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();

	                });

	                thisWidget.jqElement.find('.grid-horz-right-all').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    var gridDomElem = dhxGrid.objBox;
	                    maxScrollPos = gridDomElem.scrollWidth - gridDomElem.clientWidth + 25;
	                    gridDomElem.scrollLeft = maxScrollPos;
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    e.stopPropagation();
	                    e.preventDefault();

	                });

	                thisWidget.jqElement.find('.grid-horz-left').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollLeft, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                });

	                thisWidget.jqElement.find('.grid-horz-right').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollRight, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                });

	                thisWidgetJqElem.find('.grid-vert-up').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollUp, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).click(handleScrollRight);

	                thisWidgetJqElem.find('.grid-vert-down').bind('touchstart.dhxgridTouchEvents', function (e) {
	                    $(e.target).addClass('active');
	                    nscrolls = 0;
	                    changeIntervalId = window.setInterval(handleScrollDown, 100);
	                    e.stopPropagation();
	                    e.preventDefault();
	                }).bind('touchend.dhxgridTouchEvents', function (e) {
	                    $(e.target).removeClass('active');
	                    window.clearInterval(changeIntervalId);
	                    e.stopPropagation();
	                    e.preventDefault();
	                });
	            }

                thisWidget.jqElement.find('table.hdr td').addClass(textSizeClass);
	            dhxGrid.setSizes();
	            updateCount = 0;
	        } catch (err) {
	            TW.log.error('Error initializing grid: "' + err + '"');
	        }
	    };

	    var addCustomProcessing = function (dhxGrid) {

	        eventIds.push(dhxGrid.attachEvent("onRowAdded", function (rid) {
	            TW.log.info('row added, rid: ' + rid.toString());
	        }));

	        eventIds.push(dhxGrid.attachEvent("onRowCreated", function (rid, r) {
	            // the 6 is for padding and border
	            $(r).css({
	                'height': (rowHeight).toString() + 'px',
	                'overflow': 'hidden'
	            });
	        }));

	        eventIds.push(dhxGrid.attachEvent("onRowDblClicked", function (rId, cInd) {
	            thisWidget.jqElement.triggerHandler('DoubleClicked');
	        }));

	        // same code in dhxlist and dhxgrid ... update both in sync
	        eventIds.push(dhxGrid.attachEvent("onKeyPress", function (code, cFlag, sFlag) {
	            //TW.log.info('onKeyPress, code: "' + code.toString() + '", cFlag:"' + cFlag.toString() + '", sFlag:"' + sFlag.toString() + '"');
	            switch (code) {
	                case 9: // tab
	                    return false;
	                    break;

	                case 36: //home
	                case 35: //end
	                    var pagingInfo = dhxGrid.getStateOfView();
	                    var curTopRow = pagingInfo[0];
	                    var nRowsTotal = pagingInfo[2];
	                    var rowToShow = curTopRow;

	                    if (code === 36) {
	                        rowToShow = 0;
	                    } else {
	                        rowToShow = nRowsTotal - 1;
	                    }
	                    if (rowToShow < 0) {
	                        rowToShow = 0;
	                    }
	                    if (rowToShow > (nRowsTotal - 1)) {
	                        rowToShow = (nRowsTotal - 1);
	                    }

	                    dhxGrid.showRow(dhxGrid.getRowId(rowToShow));

	                    return false;
	                    break;

	                case 33: //page up
	                case 34: //page down
	                    var pagingInfo = dhxGrid.getStateOfView();
	                    var curTopRow = pagingInfo[0];
	                    var nRowsPerPage = pagingInfo[1]-1;
	                    var nRowsTotal = pagingInfo[2];
	                    var rowToShow = curTopRow;
	                    if (rowToShow < 0) {
	                        rowToShow = 0;
	                    }
	                    if (rowToShow > (nRowsTotal - 1)) {
	                        rowToShow = (nRowsTotal - 1);
	                    }

	                    //TW.log.info('   curTopRow: ' + curTopRow.toString() + ', nRowsPerPage: ' + nRowsPerPage.toString() + ', nRowsTotal: ' + nRowsTotal.toString() + ', rowToShow: ' + rowToShow.toString());
	                    if (code === 33) {
	                        // page up
	                        rowToShow -= nRowsPerPage;
	                    } else {
	                        // page down
	                        rowToShow += nRowsPerPage * 2; // this is because the grid just barely scrolls the row into visibility ... it doesn't show that row
	                    }
	                    if (rowToShow < 0) {
	                        rowToShow = 0;
	                    }
	                    if (rowToShow > (nRowsTotal - 1)) {
	                        rowToShow = (nRowsTotal - 1);
	                    }
	                    dhxGrid.showRow(dhxGrid.getRowId(rowToShow));

	                    return false;
	                    break;

	            }

	            return true;
	        }));

	        eventIds.push(dhxGrid.attachEvent('onSelectStateChanged', function (id, ind) {
	            if (!ignoreSelectionChanges) {
	                selectedRowIndices = [];
	                // select the rows that are selected ... if id is null, ignore this
	                if (id !== null && id !== undefined) {
	                    var selectedRowIds = id.split(',');
	                    for (var i = 0; i < selectedRowIds.length; i++) {
		                    var rowIndex = dhxGrid.getRowIndex(selectedRowIds[i]);

		                    // look up the original row number in case we sorted this table
		                    var row = currentRows[rowIndex];
		                    var actualRowIndex = row._originalRowNumber;
	                        selectedRowIndices.push(actualRowIndex);
	                    }
	                }
	                // in case someone is working off of selected data
	                thisWidget.updateSelection('Data', selectedRowIndices);
	            }
	        }));

	        eventIds.push(dhxGrid.attachEvent('onHeaderClick', onHeaderClickHandler));

            eventIds.push(dhxGrid.attachEvent("onScroll", function (sleft,stop) {
                clearTimeout($.data(this, 'scrollTimer'));
                thisWidget.setProperty('CurrentScrollTop',dhxGrid.getScrollTop());
                dhxGrid.enableMultiline(true);
                $.data(this, 'scrollTimer', setTimeout(function() {
                    dhxGrid.enableMultiline(isCellTextWrapping);
                }, 250));
            }));

	        // special function for parsing the data from Thingworx back-end
	        dhxGrid._process_custom_tw = function (data) {
	            this._parsing = true;
	            var rows = data;                  // get all row elements from data
	            for (var i = 0; i < rows.length; i++) {
	                var id = this.getUID();                                // XML doesn't have native ids, so custom ones will be generated
	                this.rowsBuffer[i] = {                                   // store references to each row element
	                    idd: id,
	                    data: rows[i],
	                    _parser: this._process_custom_tw_row   // cell parser method
	                    //_locator: this._get_custom_tw_data        // data locator method
	                };
	                this.rowsAr[id] = rows[i];                             // store id reference
	            }
	            this.render_dataset();                                   // force update of grid's view after data loading
	            this._parsing = false;
	        };

	        // special function for parsing each row of the data from Thingworx back-end
	        dhxGrid._process_custom_tw_row = function (r, data, ind) {
	            var colModel = this._colModel,
	            strAr = [], i, j, value;

	            var rowStyle = thisWidget.getProperty('GridBackgroundStyle');
	            var rowFormat = thisWidget.getProperty('RowFormat');
	            var defaultRowFormat;
	            if(rowFormat){
		            var formatResult = TW.getStyleFromStateFormatting({DataRow: data, StateFormatting: rowFormat})
		            if(formatResult.styleDefinitionName) {
	                    rowStyle = formatResult.styleDefinitionName;
	                    var tableStyle = TW.getStyleCssTextualFromStyle(formatResult);
	                    var tableStyleBG = TW.getStyleCssGradientFromStyle(formatResult);
	                    var textSizeClass = TW.getTextSizeClassName(formatResult.textSize);
	                    defaultRowFormat = tableStyle + tableStyleBG + textSizeClass;
	                    $(r).attr("style", defaultRowFormat);
		            }
	            }

	            for (i = 0; i < colModel.length; i++) {
	                value = data[colModel[i].name];
	                if ((typeof value === "string") && !value.trim()) {
	                    value = " ";
	                }
	                strAr.push({ RowIndex: ind, Value: value, RowData: data, ColumnInfo: colModel[i], RowHeight: rowHeight, RowFormat : rowFormat, RowStyle : rowStyle, DefaultFormat: defaultRowFormat });
	            }
	            // set just a plain array as no custom attributes are needed
	            r._attrs = {};

	            for (j = 0; j < r.childNodes.length; j++){
                    r.childNodes[j]._attrs = {};
                }

	            // finish data loading this calls customCellRendering
	            this._fillRow(r, strAr);

	            return r;

	        };

	    };

	    var destroyGrid = function () {
	        var i, nEventIds;
	        if (dhxGrid !== undefined && dhxGrid !== null) {
	            try {
	                nEventIds = eventIds.length;
	                for (i = 0; i < nEventIds; i += 1) {
	                    dhxGrid.detachEvent(eventIds[i]);
	                }
	                if (isAndroid) { thisWidget.jqElement.find('*').unbind('.dhxgridTouchEvents'); }
	                dhxGrid.destructor();
	            }
	            catch (gridErr) {
	                TW.log.error('Error destroying grid ' + thisWidget.jqElementId);
	            }
	            dhxGrid = null;
	        }
	    };

	    var toFieldsString = function (infoTableDataShape) {
	        var fldStr = '',
	            flds = 0;
	        for (var x in infoTableDataShape) {
	            flds += 1;
	            if (flds > 1) { fldStr += ','; }
	            fldStr += x;
	        }
	        return fldStr;
	    };

	    var selectGridRows = function (selectedRowIndices, sortChanged) {

		    // pretty easy and fast if the grid has not been sorted
		    if( !hasBeenSorted ) {
			    var nSelectedRows = selectedRowIndices ? selectedRowIndices.length : 0;
			    for (var i = 0; i < nSelectedRows; i += 1) {

				    var rowToSelect = selectedRowIndices[i];

				    dhxGrid.selectRow(rowToSelect,      // row index
					    false,                      // call onSelectChanged [seems to ignore this]
						    i === 0 ? false : true,     // preserve previously selected rows ... set to false on first call, true thereafter
						    i === 0 ? true : false, // scroll row into view ... true on first call, false thereafter
						    		sortChanged);  // was this for a header sort? .. if true we don't want to fire row changed event
			    }
		    } else {
			    // not so fast if we've been sorted ... the indices that come in
			    var nDataRows = currentRows.length;
			    for( var i=0; i<nDataRows; i++) {
				    var row = currentRows[i];
				    if(_.includes(selectedRowIndices,row._originalRowNumber))  {
					    // this row is selected

					    var isFirstSelection = false;
					    if( selectedRowIndices[0] === row._originalRowNumber) {
						    isFirstSelection = true;
					    }

					    dhxGrid.selectRow(i,      // row index
						    false,                      // call onSelectChanged [seems to ignore this]
							    isFirstSelection ? false : true,     // preserve previously selected rows ... set to false on first call, true thereafter
							    isFirstSelection ? true : false,     // scroll row into view ... true on first call, false thereafter
							    sortChanged);  		// was this for a header sort? .. if true we don't want to fire row changed event
				    }
			    }
		    }
	    };

	    var loadGrid = function (sortInd, updateSelection) {
	        var direction = 'asc',
	            nRows = currentRows.length,
	            row;
	        var sortChanged;
	        if (sortInd !== undefined) {
	            sortChanged = true;
		        hasBeenSorted = true;
	            if (currentSortInfo !== undefined) {
	                if (currentSortInfo.ind === sortInd) {
	                    direction = (currentSortInfo.direction === 'asc' ? 'des' : 'asc');
	                    currentSortInfo = { ind: sortInd, direction: direction };
	                    currentRows.reverse();
	                } else {
	                    currentSortInfo = { ind: sortInd, direction: direction };
	                    currentRows.sort(TW.createSorter(colInfo[currentSortInfo.ind]['name'], colInfo[currentSortInfo.ind]['baseType']));
	                }
	            } else {
	                currentSortInfo = { ind: sortInd, direction: direction };
	                currentRows.sort(TW.createSorter(colInfo[currentSortInfo.ind]['name'], colInfo[currentSortInfo.ind]['baseType']));
	            }
	        } else {
	            if (currentSortInfo !== undefined) {
	                if (currentSortInfo.direction === 'asc') {
	                    currentRows.sort(TW.createSorter(colInfo[currentSortInfo.ind]['name'], colInfo[currentSortInfo.ind]['baseType']));
	                } else {
	                    currentRows.sort(TW.createSorter(colInfo[currentSortInfo.ind]['name'], colInfo[currentSortInfo.ind]['baseType']));
	                    currentRows.reverse();
	                }
	            }
	        }

	        dhxGrid.clearAll();
	        dhxGrid.parse(currentRows, "custom_tw");
	        if (currentSortInfo !== undefined) {
	            dhxGrid.setSortImgState(true, currentSortInfo.ind, currentSortInfo.direction);
	        }

	        selectGridRows(selectedRowIndices, sortChanged);

	        if (updateSelection && !sortChanged) {
	            thisWidget.updateSelection('Data', selectedRowIndices);
	        }
	    };

	    var onHeaderClickHandler = function (ind) {
	        loadGrid(ind, true, true /*updateSelection*/);
	        return false;
	    };

	    this.getUpdateCount = function () {
	        return updateCount;
	    };

	    this.runtimeProperties = function () {
	        return {
	            'needsDataLoadingAndError': true,
		        'supportsAutoResize': true,
	            'borderWidth': 0
	        };
	    };

	    this.renderHtml = function () {
			isEditable = thisWidget.getProperty("IsEditable", false);
			isCellTextWrapping = thisWidget.getProperty("CellTextWrapping", false);
	        var html = '';

		    if( $('#runtime-workspace').hasClass('print') && (this.properties.ResponsiveLayout === true)) {
			    this.setProperty('IsPrintLayout',true);
		    }

		    if( this.getProperty('IsPrintLayout') === true ) {
			    isPrintLayout = true;

			    html = '<table cellpadding="0" cellspacing="0" class="widget-content widget-dhxgrid ' + (isCellTextWrapping ? 'textwrap' : '') + '">' +
				    '</table>';
			    return html;
		    }

	        html =
	            '<div class="widget-content widget-dhxgrid data-nodata">'
					+ '<div class="dhxgrid-wrapper">'
		                + '<div class="dhtmlxgrid-container" width="100%" height="100%" tabindex="' + thisWidget.getProperty('TabSequence') + '">'
						+ '</div>'
	                + '</div>'
	            + '</div>';
	        if (isAndroid) {
	            html =
	            '<div class="widget-content widget-dhxgrid data-nodata">'
	                + '<div class="dhtmlxgrid-container-container">'
	                    + '<div class="dhtmlxgrid-container" width="100%" height="100%">'
	                    + '</div>'
	                + '</div>'
	                + '<table class="android-scrollbar" cellspacing="0" cellpadding="0">'
	                    + '<tr>'
	                        + '<td height="100%" width="15%"><span class="horz-btn grid-horz-left-all" ><span class="icon"></span></span></td>'
	                        + '<td height="100%" width="35%"><span class="horz-btn grid-horz-left" ><span class="icon"></span></span></td>'
	                        + '<td height="100%" width="35%"><span class="horz-btn grid-horz-right" ><span class="icon"></span></span></td>'
	                        + '<td height="100%" width="15%"><span class="horz-btn grid-horz-right-all"><span class="icon"></span></span></td>'
	                        + '<td><span class="grid-horz-right" width="25px"></span></td>'
	                    + '</tr>'
	                + '</table>'
	                + '<table class="android-scrollbar-vert" cellspacing="0" cellpadding="0">'
	                    + '<tr>'
	                        + '<td height="15%" valign="middle"><span class="vert-btn grid-vert-up-all"><span class="icon"></span></span></td>'
	                    + '</tr>'
	                    + '<tr>'
	                        + '<td height="35%"><span class="vert-btn grid-vert-up"><span class="icon"></span></span></td>'
	                    + '</tr>'
	                    + '<tr>'
	                        + '<td height="35%"><span class="vert-btn grid-vert-down"><span class="icon"></span></span></td>'
	                    + '</tr>'
	                    + '<tr>'
	                        + '<td height="15%"><span class="vert-btn grid-vert-down-all"><span class="icon"></span></span></td>'
	                    + '</tr>'

	                + '</table>'
	            + '</div>';

	        }
	        return html;
	    };

		this.buildHeaderRowHtml = function(infoTableDataShape) {
			var html = '';
			html +=
				'<thead>';

		    if( showAllColumns === true ) {
                for (var fieldName in infoTableDataShape) {
					html += '<th><div class="print-header-cell">' + Encoder.htmlEncode(fieldName) + '</div></th>'
                }
		    } else {
		        colFormat = thisWidget.getProperty('ColumnFormat');
		        if (colFormat !== undefined && colModel.length === 0) {
		            // translate our internal 'ColumnFormat' to the dhtmlxgrid's idea of a column model
		            for (var i = 0; i < colFormat.formatInfo.length; i++) {
		                var col = colFormat.formatInfo[i];
		                var thisWidth = 100;
		                if (col.Width === 'auto') {
		                    thisWidth = undefined;
		                } else {
		                    thisWidth = col.Width;
		                }
		                colModel.push({ name: col.FieldName, label: TW.Runtime.convertLocalizableString(col.Title), width: thisWidth, align: col.Align, formatoptions: col.FormatOptions, col: col });
		            }
		        }


				_.each(colModel,function(col) {
					html += '<th><div class="print-header-cell">' + Encoder.htmlEncode(col.label) + '</div></th>'
				});

		    }

			html +=
				'</thead>';

			return html;
		}

    // http://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
    // scrollbarWidth = offsetWidth - clientWidth - getComputedStyle().borderLeftWidth - getComputedStyle().borderRightWidth
    // I'm getting the approximately value here because of the complexity of the grid components we are using, should accurate enough
    this.getScrollBarWidth = function(){
        if(!scrollBarWidth){
          var inner = document.createElement('p');
          inner.style.width = "100%";
          inner.style.height = "200px";

          var outer = document.createElement('div');
          outer.style.position = "absolute";
          outer.style.top = "0px";
          outer.style.left = "0px";
          outer.style.visibility = "hidden";
          outer.style.width = "200px";
          outer.style.height = "150px";
          outer.style.overflow = "hidden";
          outer.appendChild(inner);

          document.body.appendChild(outer);
          var w1 = inner.offsetWidth;
          outer.style.overflow = 'scroll';
          var w2 = inner.offsetWidth;
          if (w1 == w2) w2 = outer.clientWidth;

          document.body.removeChild(outer);

          scrollBarWidth = w1 - w2;
        }
        return scrollBarWidth;
    };

    this.constructColumnFormats = function(colFormat) {
        gridHeader = '';
        gridInitWidths = '';
        gridColAlign = '';
        gridHeaderColAlign = [];
        gridColTypes = '';
        gridColSorting = '';
        nColumns = 0;
        autoWidthColumns = [];
        colModel = [];
        colInfo = [];
        if (colFormat && colFormat.formatInfo) {
            for (var i = 0; i < colFormat.formatInfo.length; i++) {
                var col = colFormat.formatInfo[i];
                var thisWidth = 100;
                if (col.Width === 'auto') {
                    autoWidthColumns.push(i);
                    thisWidth = '100';
                } else {
                    thisWidth = col.Width;
                }

                var allowEdit = false;
                var validationExpression = "";
                var validationMessage = "";
                var editStyle = undefined;

                if(isEditable === true) {
                    allowEdit = col.AllowEdit;
                    validationExpression = col.ValidationExpression;
                    validationMessage = col.ValidationMessage;
                    editStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));;
                }

                colModel.push({ name: col.FieldName, label: TW.Runtime.convertLocalizableString(col.Title), width: thisWidth, align: col.Align, sortable: false, allowEdit : allowEdit, validationExpression : validationExpression,  validationMessage : validationMessage, editStyle : editStyle, formatoptions: col.FormatOptions });

                if (i > 0) {
                    gridHeader += ',';
                    gridInitWidths += ',';
                    gridColAlign += ',';
                    gridColTypes += ',';
                    gridColSorting += ',';
                }
                gridHeader +=  TW.Runtime.convertLocalizableString(Encoder.htmlEncode(col.Title)).replace(/,/g,'&#44;');
                gridInitWidths += thisWidth.toString();
                gridColAlign += col.Align || 'left';
                if(thisWidget.getProperty('AlignHeader')){
                    gridHeaderColAlign.push('text-align:'+(col.Align || 'left')+';');
                }
                gridColTypes += 'twcustom';
                gridColSorting += 'str';
                nColumns++;
            }
        } else {
            gridHeader = TW.Runtime.convertLocalizableString("[[mustBeBoundToData]]");
            gridInitWidths = "*";
            gridColAlign = "left";
            gridColTypes = "ro";
            gridColSorting = "str";
        }
    };

	    this.afterRender = function () {

		    if( isPrintLayout ) {
			    return;
		    }

	        //gridHeader = '';
	        //gridInitWidths = '';
	        //gridColAlign = '';
	        //gridHeaderColAlign = [];
	        //gridColTypes = '';
	        //gridColSorting = '';
	        //nColumns = 0;
		    expandGridToShowAllRows = false;
		    expandGridToShowAllColumns = false;
		    if( thisWidget.getProperty('ExpandGridToShowAllRows')  === true ) {
			    expandGridToShowAllRows = true;
			    if( thisWidget.getProperty('ExpandGridToShowAllColumns')  === true ) {
				    expandGridToShowAllColumns = true;
			    }
		    }
	        domElementIdOfDhxGrid = thisWidget.jqElementId + '-dhxgrid';
	        thisWidget.jqElement.find('.dhtmlxgrid-container').attr('id', domElementIdOfDhxGrid);

		    thisWidget.jqElement.on('change','input.grid-cell-STRING,input.grid-cell-NUMBER,input.grid-cell-BOOLEAN,input.grid-cell-DATETIME,input.grid-cell-LOCATION',function(e) {
			    try {
				    var inputEl = $(e.target);
				    var cell = inputEl.closest('.widget-dhxgrid-cell-editable');
				    var rowIndex = parseInt(cell.attr('row-index'));
				    var field = cell.attr('field-name');

				    if( inputEl.hasClass('grid-cell-NUMBER')) {
					    var colFormat = cell.attr('col-format');
				    	try {

				    		var newNumber = parseFloat(inputEl.val());

				    		if(isNaN(newNumber))
				    			throw 'Cannot parse number ' + inputEl.val();

						    currentRows[rowIndex][field] = newNumber;
				    	}
				    	catch(err) {
						    TW.log.error(err);
				    	}

					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));

							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}

					    	var validationResult = undefined;

					    	with(currentRows[rowIndex]) { validationResult = eval(validationExpression); };

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle + ";text-align:right;")
					            }

					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle + ";text-align:right;")
					            }

					    		cell.attr('title',validationMessage);

		                        TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }

					    inputEl.val(currentRows[rowIndex][field].format(colFormat));
				    }
				    else if( inputEl.hasClass('grid-cell-DATETIME')) {
					    var colFormat = cell.attr('col-format');

				    	try {
				    		var newDate = TW.DateUtilities.parseDate(inputEl.val(), 'yyyy-MM-dd HH:mm:ss');
				    		if (newDate == null)
				    			throw 'Cannot parse date ' + inputEl.val() + ' using format ' + colFormat;

						    currentRows[rowIndex][field] = newDate;
				    	}
				    	catch(err) {
						    TW.log.error(err);
				    	}

					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));

							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}

					    	var validationResult = undefined;

					    	with(currentRows[rowIndex]) { validationResult = eval(validationExpression); };

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title',validationMessage);

					    		TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }

                        inputEl.val(TW.DateUtilities.formatDate(currentRows[rowIndex][field], colFormat));
				    }
				    else if( inputEl.hasClass('grid-cell-BOOLEAN')) {
					    var colFormat = cell.attr('col-format');

					    currentRows[rowIndex][field] = inputEl.is(':checked');

					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));

							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}

					    	var validationResult = undefined;

					    	with(currentRows[rowIndex]) { validationResult = eval(validationExpression); };

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title',validationMessage);

					    		TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }

                    } else if (inputEl.hasClass('grid-cell-LOCATION')) {
                        var colFormat = cell.attr('col-format');
                        try {
                            var validLoc = false;
                            var locationValues = inputEl.val().split(":");
                            if (locationValues && locationValues.length == 2) {
                                var latVal = locationValues[0];
                                var longVal = locationValues[1];
                                var locationEntry = {};
                                if (!isNaN(latVal) && !isNaN(longVal)) {
                                    validLoc = true;
                                    locationEntry.latitude = parseFloat(latVal);
                                    locationEntry.longitude = parseFloat(longVal);
                                    if (currentRows[rowIndex][field]) {
                                        locationEntry.elevation = currentRows[rowIndex][field].elevation;
                                    }
                                }
                            }

                            if (!validLoc) {
                                throw 'Cannot parse location ' + inputEl.val();
                            }
                            currentRows[rowIndex][field] = locationEntry;
                        }
                        catch (err) {
                            TW.log.error(err);
                        }

					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));

							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}

					    	var validationResult = undefined;

					    	with(currentRows[rowIndex]) { validationResult = eval(validationExpression); };

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle + ";text-align:right;")
					            }

					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle + ";text-align:right;")
					            }

					    		cell.attr('title',validationMessage);

		                        TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }

					    inputEl.val(currentRows[rowIndex][field].latitude + " : " + currentRows[rowIndex][field].longitude);
				    }
				    else {
					    currentRows[rowIndex][field] = inputEl.val();

					    var validationExpression = cell.attr('validation-expr');

					    if(validationExpression !== undefined && validationExpression != '' && validationExpression != 'undefined') {
							var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));
							var activeInvalidStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridInvalidFieldStyle', 'DefaultGridInvalidFieldStyle'));

							var validationMessage = cell.attr('validation-msg');

							if(validationMessage === undefined || validationMessage == '') {
								validationMessage = "Invalid Input";
							}

					    	var validationResult = undefined;

					    	with(currentRows[rowIndex]) { validationResult = eval(validationExpression); };

					    	if(validationResult == true) {
					            var styleDefinition = activeEditStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title','Valid');
					    	}
					    	else {
					            var styleDefinition = activeInvalidStyle;

					            if (styleDefinition !== undefined && styleDefinition.styleDefinitionName !== undefined) {
					                var tableStyle = TW.getStyleCssTextualFromStyle(styleDefinition);
					                inputEl.attr('style',tableStyle)
					            }

					    		cell.attr('title',validationMessage);

		                        TW.Runtime.showStatusText('error', TW.Runtime.convertLocalizableString(validationMessage));
					    	}
					    }


				    }
				    // update the hidden element and then adjust the column size
					if($(this).parent().children('div:hidden').text($(this).val()).length > 0){
						// find the row, find the index of this column, then adjust only this column.
						var columnIndex = $(this).closest('tr').children('td').index($(this).closest('td'));
						if(autoWidthColumns.indexOf(columnIndex) > -1){
							dhxGrid.adjustColumnSize(columnIndex);
						}
					}

				    thisWidget.setProperty('EditedTable',thisWidget.getProperty('EditedTable'));

			    } catch( err ) {
				    TW.log.error('Error updating cell');
			    }
		    });


			var formatRowBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowBackgroundStyle', 'DefaultRowBackgroundStyle'));
			var formatRowAlternateBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowAlternateBackgroundStyle', 'DefaultRowAlternateBackgroundStyle'));
			var formatRowHoverResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowHoverStyle', 'DefaultRowHoverStyle'));
			var formatRowSelectedResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowSelectedStyle', 'DefaultRowSelectedStyle'));
			var formatGridFocusResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('FocusStyle', 'DefaultFocusStyle'));
			var formatGridHeaderResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridHeaderStyle', 'DefaultGridHeaderStyle'));
			var formatGridBackgroundResult = TW.getStyleFromStyleDefinition(this.getProperty('GridBackgroundStyle', 'DefaultGridBackgroundStyle'));

			var cssRowBackground = TW.getStyleCssGradientFromStyle(formatRowBackgroundResult);
			var cssRowBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowBackgroundResult);
			var cssRowAlternateBackground = TW.getStyleCssGradientFromStyle(formatRowAlternateBackgroundResult);
			var cssRowAlternateBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowAlternateBackgroundResult);
			var cssRowHover = TW.getStyleCssGradientFromStyle(formatRowHoverResult, true);
			var cssRowHoverText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowHoverResult, true);
			var cssRowSelected = TW.getStyleCssGradientFromStyle(formatRowSelectedResult, true);
			var cssRowSelectedText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowSelectedResult, true);
			var cssGridHeaderBackground = TW.getStyleCssGradientFromStyle(formatGridHeaderResult);
			var cssGridHeaderText = TW.getStyleCssTextualNoBackgroundFromStyle(formatGridHeaderResult);
			var cssGridFocus = TW.getStyleCssBorderFromStyle(formatGridFocusResult);
			var cssGridBackground = TW.getStyleCssGradientFromStyle(formatGridBackgroundResult);
			var cssGridBorder = TW.getStyleCssBorderFromStyle(formatGridBackgroundResult);
			var cssGridHeaderBorder = TW.getStyleCssBorderFromStyle(formatGridHeaderResult);

            if (this.getProperty('GridHeaderStyle') !== undefined) {
                textSizeClass = TW.getTextSizeClassName(formatGridHeaderResult.textSize);
            }

			if (thisWidget.getProperty('RowBackgroundStyle', 'DefaultRowBackgroundStyle') === 'DefaultRowBackgroundStyle'
	                && thisWidget.getProperty('RowAlternateBackgroundStyle', 'DefaultRowAlternateBackgroundStyle') === 'DefaultRowAlternateBackgroundStyle'
	                && thisWidget.getProperty('RowHoverStyle', 'DefaultRowHoverStyle') === 'DefaultRowHoverStyle'
	                && thisWidget.getProperty('GridHeaderStyle', 'DefaultGridHeaderStyle') === 'DefaultGridHeaderStyle'
	                && thisWidget.getProperty('GridBackgroundStyle', 'DefaultGridBackgroundStyle') === 'DefaultGridBackgroundStyle'
	                && thisWidget.getProperty('RowSelectedStyle', 'DefaultRowSelectedStyle') === 'DefaultRowSelectedStyle'
	                && thisWidget.getProperty('FocusStyle', 'DefaultFocusStyle') === 'DefaultFocusStyle') {
	                if (!addedDefaultStyles) {
	                    addedDefaultStyles = true;
	                    var defaultStyles = '.widget-dhxgrid .gridbox {'+ cssGridBackground + '}' +
	                    					' .widget-dhxgrid .dhxgrid-wrapper {'+ cssGridBorder +'}' +
	                    					' .widget-dhxgrid .dhxgrid-wrapper.focus {'+ cssGridFocus +'}' +
											'.widget-dhxgrid .xhdr .twdhtmlxcell { border: none; }' +
											' div.gridbox .xhdr {'+ cssGridHeaderBackground +'}' +
											'.widget-dhxgrid .gridbox table.obj tr {'+ cssRowBackground + '}' +
	                 						'.widget-dhxgrid .gridbox table.obj td {'+ cssRowBackgroundText +'}' +
	                 						'.widget-dhxgrid .gridbox table.obj tr.uneven {'+ cssRowBackground + cssRowBackgroundText +'}' +
	                 						'.widget-dhxgrid .gridbox table.obj tr.even {'+ cssRowAlternateBackground + cssRowAlternateBackgroundText +'}' +
	                 						'.widget-dhxgrid .gridbox table.obj tr:hover td {'+ cssRowHover + cssRowHoverText +'}' +
	                 						'.widget-dhxgrid .gridbox table.obj tr:hover td div {'+ cssRowHover + cssRowHoverText +'}' +
	                 						'.widget-dhxgrid .gridbox table.obj tr.rowselected td {'+ cssRowSelected + cssRowSelectedText +'}' +
	                 						'.widget-dhxgrid .gridbox table.obj tr.rowselected td div {'+ cssRowSelected + cssRowSelectedText +'}' +
	                 						'.widget-dhxgrid .gridbox table.hdr td { '+ cssGridHeaderBackground + '}' +
											'.widget-dhxgrid .gridbox table.hdr td > div { '+ cssGridHeaderText +'text-transform:'+thisWidget.getProperty("GridHeaderTextCase")+'; text-shadow: none; }';

	                    $.rule(defaultStyles).appendTo(TW.Runtime.globalWidgetStyleEl);
	                }
	        } else {

				var styleBlock =
					'<style>' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox {'+ cssGridBackground + '}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .xhdr tr th:last-child, .xhdr tr td:last-child { padding-right:' + this.getScrollBarWidth() + 'px !important; }' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .xhdr td { '+ cssGridBorder +' border-left:none; border-top:none; border-bottom: none;}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .dhxgrid-wrapper {'+ cssGridBorder +'}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .dhxgrid-wrapper.focus {'+ cssGridFocus +'}' +
						'#' + thisWidget.jqElementId + ' div.gridbox .xhdr {'+ cssGridHeaderBackground + cssGridHeaderBorder + ' width: auto !important;}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.obj tr.uneven {'+ cssRowBackground + cssRowBackgroundText +'}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.obj tr.even {'+ cssRowAlternateBackground + cssRowAlternateBackgroundText +'}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.obj tr:hover td {'+ cssRowHover + cssRowHoverText +'}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.obj tr:hover td div {'+ cssRowHover + cssRowHoverText +'}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.obj tr.rowselected td {'+ cssRowSelected + cssRowSelectedText +'}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.obj tr.rowselected td div {'+ cssRowSelected + cssRowSelectedText +'}' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.hdr td { '+ cssGridHeaderBackground + ' }' +
						'#' + thisWidget.jqElementId + '.widget-dhxgrid .gridbox table.hdr td > div { '+ cssGridHeaderText +'text-transform:'+thisWidget.getProperty("GridHeaderTextCase")+'; text-shadow:none; }' +
					'</style>';

				$(styleBlock).prependTo(thisWidget.jqElement);
	        }

	        if (isAndroid) {
	            // adjust the grid to be 25 px less in width and height for the table to fit
	            thisWidget.jqElement.find('.dhtmlxgrid-container-container').width(thisWidget.getProperty('Width') - 25).height(thisWidget.getProperty('Height') - 25);
	        }

            isMultiselect = thisWidget.getProperty('MultiSelect', false);
	        colFormat = thisWidget.getProperty('ColumnFormat');

			var activeEditStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridEditableFieldStyle', 'DefaultGridEditableFieldStyle'));

	        this.constructColumnFormats(colFormat);

            thisWidget.jqElement.find('.dhtmlxgrid-container').on('focus', function (e) {
               thisWidget.jqElement.find('.dhxgrid-wrapper').addClass('focus');
            });

            thisWidget.jqElement.find('.dhtmlxgrid-container').on('blur', function (e) {
                thisWidget.jqElement.find('.dhxgrid-wrapper').removeClass('focus');
            });

            initGrid();
            dhxGrid.enableTooltips(colModel);

	    };

	    // called every time that the infotable is updated
	    this.updateProperty = function (updatePropertyInfo, localUpdate) {
	        var reInitGrid = false;
	        var infoTableDataShape;

	        if (updatePropertyInfo.TargetProperty === "ScrollTop") {
	        	dhxGrid.setScrollTop(updatePropertyInfo.RawSinglePropertyValue);
	        }

            if (updatePropertyInfo.TargetProperty === "ColumnFormat") {
                colFormat = updatePropertyInfo.RawDataFromInvoke;
                this.setProperty(updatePropertyInfo.TargetProperty, colFormat);
                this.constructColumnFormats(colFormat);
                initGrid();
                if (currentDataInfo) { // rebuild
                    this.updateProperty(currentDataInfo, true);
                }
            }

	        if (updatePropertyInfo.TargetProperty === "Data") {
	            updateCount += 1;
	            currentDataInfo = updatePropertyInfo,
	            currentRows = currentDataInfo.ActualDataRows;
		        if( currentRows === undefined ) {
			        currentRows = [];
		        }
	            infoTableDataShape = currentDataInfo.DataShape;
	            selectedRowIndices = updatePropertyInfo.SelectedRowIndices;

			    if( isPrintLayout ) {

				    var html = '';
				    html += this.buildHeaderRowHtml(infoTableDataShape);

				    _.each(currentRows,function(row) {
				        html += '<tr>';
					    var htmlRet = '';
					    if(showAllColumns === true ) {
					        var renderer = TW.Renderer.DEFAULT;
	                        for (var fieldName in infoTableDataShape) {
	                            //var fieldDef = infoTableDataShape[fieldName];
				                htmlRet = renderer['renderHtml']({
				                    DataRow: row,
				                    ValueFieldName: fieldName,
				                    Value: row[fieldName],
				                    ColumnInfo: {}
				                });
						        html += '<td><div class="print-cell">' + htmlRet + '</div></td>';
						    }
					    } else {
							_.each(colModel,function(field) {
								var fmtOptions = field.formatoptions;
						        var renderer = TW.Renderer[fmtOptions.renderer];
						        if (renderer !== undefined) {
						            if (renderer['renderHtml'] !== undefined && (typeof renderer['renderHtml']) === "function") {
						                htmlRet = renderer['renderHtml']({
						                    DataRow: row,
						                    ValueFieldName: field.name,
						                    Value: row[field.name],
						                    FormatString: fmtOptions.FormatString,
						                    StateFormatting: fmtOptions.formatInfo,
						                    ColumnInfo: {}
						                });
						            }
						        } else {
						            TW.log.error('Unrecognized renderer in dhxgrid print: "' + renderer + '"');
                                }

                                html += '<td><div class="print-cell">' + htmlRet + '</div></td>';
                            });
                        }
                        html += '</tr>';

                    });

				    this.jqElement.html(html);

					var formatRowBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowBackgroundStyle', 'DefaultRowBackgroundStyle'));
					var formatRowAlternateBackgroundResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowAlternateBackgroundStyle', 'DefaultRowAlternateBackgroundStyle'));
					var formatRowSelectedResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('RowSelectedStyle', 'DefaultRowSelectedStyle'));
					var formatGridBackgroundResult = TW.getStyleFromStyleDefinition(this.getProperty('GridBackgroundStyle', 'DefaultGridBackgroundStyle'));
					var formatGridHeaderResult = TW.getStyleFromStyleDefinition(thisWidget.getProperty('GridHeaderStyle', 'DefaultGridHeaderStyle'));

					var cssRowBackground = TW.getStyleCssGradientFromStyle(formatRowBackgroundResult);
					var cssRowBackgroundText = TW.getStyleCssTextualNoBackgroundFromStyle(formatRowBackgroundResult);
					var cssGridHeaderBackground = TW.getStyleCssGradientFromStyle(formatGridHeaderResult);
					var cssGridHeaderText = TW.getStyleCssTextualNoBackgroundFromStyle(formatGridHeaderResult);
					var cssGridBackground = TW.getStyleCssGradientFromStyle(formatGridBackgroundResult);
					var cssGridBorder = TW.getStyleCssBorderFromStyle(formatGridBackgroundResult);
					var textSize = TW.getTextSize(formatGridBackgroundResult.textSize);

					var printstyles =
					'<style>' +
						'#' + thisWidget.jqElementId + ' { '+ cssGridBackground + cssGridBorder +' border-bottom: none; border-right: none; }' +
						'#' + thisWidget.jqElementId + ' thead th { '+ cssGridHeaderText + cssGridBorder + cssGridHeaderBackground +'text-transform:'+thisWidget.getProperty("GridHeaderTextCase")+'; border-left: none; border-top: none; }' +
						'#' + thisWidget.jqElementId + ' .print-header-cell { padding:5px; }' +
						'#' + thisWidget.jqElementId + ' .print-cell { '+ cssRowBackground +' line-height: ' + rowHeight + 'px; min-height: ' + rowHeight + 'px; height:auto !important; height: ' + rowHeight + 'px; } ' +
						'#' + thisWidget.jqElementId + ' td { '+ cssRowBackgroundText + cssGridBorder + textSize +' border-left:none; border-top:none; }' +
					'</style>';

					$(printstyles).prependTo(thisWidget.jqElement);

					return;
			    }

		        // we used to only clone if the table was editable ... we clone it always now in case it has been sorted
	            var clonedTable = TW.InfoTableUtilities.CloneInfoTable({ "dataShape" : { "fieldDefinitions" : infoTableDataShape}, "rows" : currentRows });

	            if(isEditable === true) {
		            thisWidget.setProperty('EditedTable', clonedTable);
	            }

	            currentRows = clonedTable.rows;

	            // record the initial row number in each row - when sorted, it's important to know the original row number
		        var nRows = currentRows.length;
	            for( var i=0; i<nRows; i++) {
		            currentRows[i]._originalRowNumber = i;
	            }

	            colFormat = thisWidget.getProperty('ColumnFormat');

	            if (showAllColumns) {
	                var newFldsString = toFieldsString(currentDataInfo.DataShape);
	                if (currentFieldsString === '' || currentFieldsString !== newFldsString) {
	                    currentFieldsString = newFldsString;
	                    reInitGrid = true;
	                }

	                (function () {
	                    if (reInitGrid) {
	                        if (currentDataInfo.SourceProperty !== '') {
	                            if (currentDataInfo.ActualDataRows !== undefined && currentDataInfo.ActualDataRows[0] !== undefined && currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty] !== undefined && currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty].rows !== undefined) {
	                                currentRows = currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty].rows;
	                                infoTableDataShape = currentDataInfo.ActualDataRows[0][currentDataInfo.SourceProperty].dataShape.fieldDefinitions;
	                            }
	                        }
	                        currentSortInfo = undefined;
	                        gridHeader = '';
	                        gridInitWidths = '';
	                        gridColTypes = '';
	                        gridColSorting = '';
	                        nColumns = 0;
	                        colModel = [];
	                        autoWidthColumns = [];
	                        colInfo = [];

	                        for (var x in infoTableDataShape) {
	                            var fieldDef = infoTableDataShape[x];
	                            if (gridHeader.length > 0) {
	                                gridHeader += ',';
	                                gridInitWidths += ',';
	                                gridColTypes += ',';
	                                gridColSorting += ',';
	                            }
	                            gridHeader += Encoder.htmlEncode(x);

	                            if (gridInitWidths.length === 0) {
	                                gridInitWidths += '100';
	                            } else {
	                                gridInitWidths += '50';
	                            }

	                            colInfo.push({
	                                name: x,
	                                baseType: fieldDef.baseType
	                            });
	                            //colModel.push({ name: col.FieldName, label: TW.Runtime.convertLocalizableString(col.Title), width: thisWidth, align: col.Align, sortable: false, formatoptions: col.FormatOptions });
	                            // if you update this, also update dhxgrid.customdialog.ide.js to update the defaults at IDE time
	                            switch (fieldDef.baseType) {
	                                case "DATETIME":
	                                    colModel.push({ name: x, label: x, sortable: false, formatoptions: { renderer: "DATETIME", FormatString: TW.Runtime.convertLocalizableString(TW.Renderer.DATETIME.defaultFormat) } });
	                                    break;
	                                case "LOCATION":
	                                    colModel.push({ name: x, label: x, sortable: false, formatoptions: { renderer: "LOCATION", FormatString: '0.00' } });
	                                    break;
	                                case "TAGS":
	                                    colModel.push({ name: x, label: x, sortable: false, formatoptions: { renderer: "TAGS", FormatString: 'plain' } });
	                                    break;
	                                case "HYPERLINK":
	                                    colModel.push({ name: x, label: x, sortable: false, formatoptions: { renderer: "HYPERLINK", FormatString: '_blank' } });
	                                    break;
	                                case "IMAGELINK":
	                                    colModel.push({ name: x, label: x, sortable: false, formatoptions: { renderer: "IMAGELINK" } });
	                                    break;
	                                default:
	                                    colModel.push({ name: x, label: x, sortable: false, formatoptions: { renderer: "DEFAULT" } });
	                            }
	                            gridColTypes += 'twcustom';
	                            gridColSorting += 'str';
	                            nColumns++;
	                        }

	                        for (var i = 0; i < nColumns; i++) {
	                            autoWidthColumns.push(i);
	                        }

	                        initGrid();
	                    }
	                }());

	                // don't updateSelection here ... it's handled later in this function
		            ignoreSelectionChanges = true;
	                loadGrid(undefined, false /*updateSelection*/);
		            ignoreSelectionChanges = false;

	                for (var i = 0; i < autoWidthColumns.length; i++) {
	                    dhxGrid.adjustColumnSize(autoWidthColumns[i]);
	                }

	                if (!updatePropertyInfo.IsBoundToSelectedRows ) {
	                    // only do this if it's bound to AllData ...
	                    dhxGrid.enableMultiselect(isMultiselect);
	                }

	            } else {
	                if (colFormat !== undefined) {
	                    if (colInfo.length === 0) {
	                        for (var i = 0; i < colFormat.formatInfo.length; i += 1) {
	                            colInfo.push({
	                                name: colFormat.formatInfo[i].FieldName,
	                                baseType: ((currentDataInfo.DataShape !== undefined && currentDataInfo.DataShape[colFormat.formatInfo[i].FieldName] !== undefined) ? currentDataInfo.DataShape[colFormat.formatInfo[i].FieldName].baseType : undefined)
	                            });
	                        }
	                    }

	                    // don't updateSelection here ... it's handled later in this function
			            ignoreSelectionChanges = true;
	                    loadGrid(undefined, false /*updateSelection*/);
			            ignoreSelectionChanges = false;
	                }

	                for (var i = 0; i < autoWidthColumns.length; i++) {
	                    dhxGrid.adjustColumnSize(autoWidthColumns[i]);
	                }
	            }

				if( thisWidget.properties.ResponsiveLayout === true ) {
					try {
						thisWidget.extendLastColumn(thisWidget.jqElement.width());
					} catch (err) {
					}
				}

		        if( expandGridToShowAllRows ) {
			        dhxGrid.setSizes();
			        var width = dhxGrid.entBox.style.width;
			        var height = dhxGrid.entBox.style.height;
			        if( expandGridToShowAllColumns ) {
				        thisWidget.jqElement.css('width',width);
			        }
			        thisWidget.jqElement.css('height',height);

		        }

	            if (!updatePropertyInfo.IsBoundToSelectedRows) {
	                // only do this if it's bound to AllData ...
	                dhxGrid.enableMultiselect(isMultiselect);

	                if (currentRows.length > 0) {
                        if (selectedRowIndices !== undefined && selectedRowIndices.length === 0 && this.getProperty('AutoSelectFirstRow') === true) {
	                        // do this with delay ... if you have a lot of grids accessing the same data, they may not have populated and we're already telling them the row to select :)
	                        setTimeout(function () {
	                            // select the first row
	                            ignoreSelectionChanges = true;
	                            dhxGrid.selectRow(0, false, false, true);
	                            ignoreSelectionChanges = false;

	                            // tell the runtime that we updated the selection
	                            thisWidget.updateSelection('Data', [0]);
	                        }, 100);
	                    } else {
	                        if (!ignoreSelectionChanges) {
	                            ignoreSelectionChanges = true;
	                            selectGridRows(selectedRowIndices);
	                            ignoreSelectionChanges = false;
	                        }
	                    }
	                    thisWidget.updateSelection('Data', selectedRowIndices);
	                } else {
	                    // mark that none are selected since we just got the data and there are no rows
	                    thisWidget.updateSelection('Data', []);
	                }
	            }
	        } else if (updatePropertyInfo.TargetProperty === "top" || updatePropertyInfo.TargetProperty === "left" || updatePropertyInfo.TargetProperty === "width" || updatePropertyInfo.TargetProperty === "height") {
	            thisWidget.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue);
	            thisWidget.jqElement.css(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue + "px");
	            // update the inner object's height and width if updated ... don't mess with top / left of inner object
	            if (updatePropertyInfo.TargetProperty === "width" || updatePropertyInfo.TargetProperty === "height") {
	                $('#' + domElementIdOfDhxGrid).css(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue);
	            }
	        }

			if (isCellTextWrapping === true) {
				thisWidget.jqElement.addClass('CellTextWrapping');
			}

	    };

		this.extendLastColumn = function(width) {
			var widthSoFar = 0;
			for( var i=0; i<(dhxGrid.cellWidthPX.length-1); i++ )  {
				widthSoFar += dhxGrid.cellWidthPX[i];
			}

			var lastColumnWidth = dhxGrid.cellWidthPX[dhxGrid.cellWidthPX.length-1];

			if( (widthSoFar + lastColumnWidth) < width ) {
				dhxGrid.setColWidth(dhxGrid.cellWidthPX.length-1,width-widthSoFar-25 /* in case of scrollbar */ );
			}
		};

		this.resize = function(width,height) {
//            thisWidget.jqElement.css('Width', width + "px");
//            thisWidget.jqElement.css('Height', height + "px");
            // update the inner object's height and width if updated ... don't mess with top / left of inner object
            //$('#' + domElementIdOfDhxGrid).css('Width', width).css('Height',height);
			dhxGrid.setSizes();
			if( this.properties.ResponsiveLayout === true ) {
				for (var i = 0; i < autoWidthColumns.length; i++) {
					dhxGrid.adjustColumnSize(autoWidthColumns[i]);
				}
				this.extendLastColumn(width);
			}
		};

	    // callback from runtime to tell us that the selection has been changed by another widget
	    this.handleSelectionUpdate = function (propertyName, selectedRows, newSelectedRowIndices) {
	        // if we're called with a selection change before we've even been loaded, no point going through the exercise
	        if (dhxGrid !== undefined) {
	            // note that we're in the middle of selection so we don't tell the runtime what it already knows (that the selection has changed)
	            if (!ignoreSelectionChanges) {
	                ignoreSelectionChanges = true;
		            selectedRowIndices = newSelectedRowIndices;
	                if (selectedRowIndices.length === 0) {
	                    dhxGrid.clearSelection();
	                }
	                selectGridRows(selectedRowIndices);
	                ignoreSelectionChanges = false;
		            thisWidget.setProperty('CurrentScrollTop',dhxGrid.getScrollTop());
	            }
	        }
	    };

        // will check or uncheck all rows based on parameter
        this.checkOrUncheckAllRows = function(checkAllRows) {
            var fn = function(evt) {
                evt.stopPropagation();
            };
            thisWidget.jqElement.find('div.dhtmlxgrid-container input:checkbox').on("click", fn).each(
                function(index, element) {
                    if (checkAllRows) {
                        // ensure only clicking rows that are not already checked
                        if (element.checked === false) {
                            element.click();
                        }
                    } else {
                        // ensure only clicking rows that are already checked
                        if (element.checked === true) {
                            element.click();
                        }
                    }
                }).off("click", fn);
        };

        this.serviceInvoked = function (serviceName) {
            var widgetReference = this;
            if (serviceName === 'ClearData') {
                setTimeout(function () {
                    widgetReference.updateProperty({TargetProperty: 'Data'});
                }, 100);
            } else if (serviceName === 'CheckAll') {
                widgetReference.checkOrUncheckAllRows(true);
            } else if (serviceName === 'UncheckAll') {
                widgetReference.checkOrUncheckAllRows(false);
            } else {
                TW.log.error('TWX Utilities Grid, unexpected serviceName invoked "' + serviceName + '"');
            }
        };

	    this.beforeDestroy = function () {
	        destroyGrid();
	        dhxGrid = null;
	        currentDataInfo = null;
	        currentRows = null;
	    };
	};
}());
// ----END: extensions/TWX_Converge_Core_ExtensionPackage/ui/converge-dhxgrid/converge-dhxgrid.runtime.js

// ----BEGIN: extensions/TWX_Converge_Core_ExtensionPackage/ui/twx-utl-debouncer/twx-utl-debouncer.runtime.js
TW.Runtime.Widgets["twx-utl-debouncer"] = function () {
    var thisWidget = this;
    var timer;

    this.runtimeProperties = function () {
        return {
            'needsDataLoadingAndError': false
        };
    };

    this.renderHtml = function () {
        var html = '';
        html = '<div class="widget-content widget-twx-utl-debouncer"></div>';
        return html;
    };

    this.afterRender = function () {
        this.jqElement.hide();
        this.jqElement.closest('.widget-bounding-box').hide();
    };

    this.serviceInvoked = function (serviceName) {
        switch (serviceName) {
            case "Debounce":
                this.startTimer();
                break;
            case "FireImmediately":
                this.fireAndClearTimer();
                break;
            case "Cancel":
                this.clearTimer();
                break;
            default:
                TW.log.error('twx-utl-debouncer widget, unexpected serviceName invoked "' + serviceName + '"');
                break;
        }
    };

    this.startTimer = function() {
        this.clearTimer();
        timer = setTimeout(function() {
            thisWidget.fireAndClearTimer();
        }, this.getProperty('TimerDuration', 500));
    };

    this.clearTimer = function () {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    this.fireAndClearTimer = function() {
        this.clearTimer();
        thisWidget.jqElement.triggerHandler("Fired");
    };

    this.beforeDestroy = function () {
        try {
            this.clearTimer();
        } catch (err) {
            TW.log.error('Error in TW.Runtime.Widgets["twx-utl-debouncer"].beforeDestroy', err);
        }
        thisWidget = null;
    };
};


// ----END: extensions/TWX_Converge_Core_ExtensionPackage/ui/twx-utl-debouncer/twx-utl-debouncer.runtime.js

// ----BEGIN: extensions/TWX_Converge_Styles_ExtensionPackage/ui/twx-utl-logout-link/link.runtime.js
(function () {
  var addedDefaultStyles = false;

  TW.Runtime.Widgets["twx-utl-logout-link"] = function () {

    var thisWidget = this,
        formatResult;

    var bindToolTip = function () {
      toolTipField = thisWidget.getProperty('ToolTipField');
      if ($.trim(toolTipField) != '') {
        $("#" + thisWidget.jqElementId).tipTip({maxWidth: "auto",
          edgeOffset: 10,
          content: function () {
            return thisWidget.getProperty('ToolTipField');
          }});
      }
    };

    var bindClickHandler = function () {
      var destination = thisWidget.getProperty('RedirectURL');
      $('#' + thisWidget.jqElementId + ' a').on('click', function () {
        // call logout service
        var logoutInvoker = new ThingworxInvoker({
          entityType: "Server",
          entityName: "*",
          apiMethod: "POST",
          characteristic: "Services",
          target: "Logout"
        });
        logoutInvoker.invokeService(function () {
          window.location.href = destination;
        }, function () {
          alert('Failed to log out');
        });

        // return false fron click handler to stop event propagation (navigation)
        return false;
      });
    };

    this.runtimeProperties = function () {
      return {
        'needsError': true,
        'propertyAttributes': {
          'Text': {
            'isLocalizable': true
          },
          'ToolTipField': {
            'isLocalizable': true
          }
        }
      };
    };

    this.renderHtml = function () {
      formatResult = TW.getStyleFromStyleDefinition(this.getProperty('LinkStyle', 'DefaultLinkStyle'));
      var textSizeClass = 'textsize-normal';
      if (this.getProperty('LinkStyle') !== undefined) {
        textSizeClass = TW.getTextSizeClassName(formatResult.textSize);
      }
      var linkDisplay = thisWidget.getProperty('LinkDisplay', 'textOnly');
      var html = '';

      if (linkDisplay === 'textOnly') {
        html += '<div class="widget-content widget-utl-logout-link-container">' +
                '<a class="widget-utl-logout-link ' + textSizeClass + ' ' + linkDisplay + '" href="' + this.getProperty('RedirectURL') + '" tabindex="' + thisWidget.getProperty('TabSequence') + '" style="text-align:' + this.getProperty('Alignment') + '">'
                + '<span class="utl-logout-link-content-container">'
                + '<span class="image-text-container">'
                + '<span class="utl-logout-link-text">' + (this.getProperty('Text') === undefined ? 'Unspecified' : this.getProperty('Text')) + '</span>'
                + '</span>'
                + '</span>'
                + '</a>'
                + '</div>';
      } else if (linkDisplay === 'imageRight') {
        html += '<div class="widget-content widget-utl-logout-link-container">' +
                '<a class="widget-utl-logout-link ' + textSizeClass + ' ' + linkDisplay + '" href="' + this.getProperty('RedirectURL') + '" tabindex="' + thisWidget.getProperty('TabSequence') + '" style="text-align:' + this.getProperty('Alignment') + '">' +
                '<span class="utl-logout-link-content-container">' +
                '<span class="image-text-container">'
                + '<span class="utl-logout-link-text">' + (this.getProperty('Text') === undefined ? 'Unspecified' : this.getProperty('Text')) + '</span>'
                + ((formatResult.image !== undefined && formatResult.image.length > 0) ? '<img class="default" src="' + formatResult.image + '"/>' : '') +
                '</span>' +
                '</span>' +
                '</a>' +
                '</div>';
      } else if (linkDisplay === 'imageLeft') {
        html += '<div class="widget-content widget-utl-logout-link-container">' +
                '<a class="widget-utl-logout-link ' + textSizeClass + ' ' + linkDisplay + '" href="' + this.getProperty('RedirectURL') + '" tabindex="' + thisWidget.getProperty('TabSequence') + '" style="text-align:' + this.getProperty('Alignment') + '">'
                + '<span class="utl-logout-link-content-container">' +
                '<span class="image-text-container">' +
                ((formatResult.image !== undefined && formatResult.image.length > 0) ? '<img class="default" src="' + formatResult.image + '"/> ' : '')
                + '<span class="utl-logout-link-text">' + (this.getProperty('Text') === undefined ? 'Unspecified' : this.getProperty('Text')) + '</span>'
                + '</span>'
                + '</span>'
                + '</a>'
                + '</div>';
      } else if (linkDisplay === 'imageTop') {
        html += '<div class="widget-content widget-utl-logout-link-container">' +
                '<a class="widget-utl-logout-link ' + textSizeClass + ' ' + linkDisplay + '" href="' + this.getProperty('RedirectURL') + '" tabindex="' + thisWidget.getProperty('TabSequence') + '" style="text-align:' + this.getProperty('Alignment') + '">' +
                '<span class="utl-logout-link-content-container">' +
                '<span class="image-text-container">' +
                ((formatResult.image !== undefined && formatResult.image.length > 0) ? '<img class="default" src="' + formatResult.image + '"/> ' : '') +
                '<span class="utl-logout-link-text">' + (this.getProperty('Text') === undefined ? 'Unspecified' : this.getProperty('Text')) + '</span>' +
                '</span>' +
                '</span>' +
                '</a>' +
                '</div>';
      } else if (linkDisplay === 'imageBottom') {
        html += '<div class="widget-content widget-utl-logout-link-container">' +
                '<a class="widget-utl-logout-link ' + textSizeClass + ' ' + linkDisplay + '" href="' + this.getProperty('RedirectURL') + '" tabindex="' + thisWidget.getProperty('TabSequence') + '" style="text-align:' + this.getProperty('Alignment') + '">' +
                '<span class="utl-logout-link-content-container">' +
                '<span class="image-text-container">' +
                '<span class="utl-logout-link-text">' + (this.getProperty('Text') === undefined ? 'Unspecified' : this.getProperty('Text')) + '</span>' +
                ((formatResult.image !== undefined && formatResult.image.length > 0) ? '<img class="default" src="' + formatResult.image + '"/> ' : '') +
                '</span>' +
                '</span>' +
                '</a>' +
                '</div>';
      } else if (linkDisplay === 'noText') {
        html += '<div class="widget-content widget-utl-logout-link-container">' +
                '<a class="widget-utl-logout-link ' + textSizeClass + ' ' + linkDisplay + '" href="' + this.getProperty('RedirectURL') + '" tabindex="' + thisWidget.getProperty('TabSequence') + '" style="text-align:' + this.getProperty('Alignment') + '">' +
                '<span class="utl-logout-link-content-container">' +
                '<span class="image-text-container">'
                + '<span class="utl-logout-link-text" style="display: none;">' + (this.getProperty('Text') === undefined ? 'Unspecified' : this.getProperty('Text')) + '</span>'
                + ((formatResult.image !== undefined && formatResult.image.length > 0) ? '<img class="default" src="' + formatResult.image + '"/>' : '') +
                '</span>' +
                '</span>' +
                '</a>' +
                '</div>';
      }

      return html;

    };

    this.renderStyles = function () {
      var LinkStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('LinkStyle', 'DefaultLinkStyle'));
      var LinkHoverStyle = TW.getStyleFromStyleDefinition(thisWidget.getProperty('LinkHoverStyle', 'DefaultLinkHoverStyle'));

      var LinkStyleBG = TW.getStyleCssGradientFromStyle(LinkStyle);
      var LinkBorder = TW.getStyleCssBorderFromStyle(LinkStyle);
      var LinkStyleText = TW.getStyleCssTextualNoBackgroundFromStyle(LinkStyle);

      var LinkHoverStyleBG = TW.getStyleCssGradientFromStyle(LinkHoverStyle);
      var LinkHoverStyleText = TW.getStyleCssTextualNoBackgroundFromStyle(LinkHoverStyle);
      var styleBlock = '';

      if (thisWidget.getProperty('LinkStyle', 'DefaultLinkStyle') === 'DefaultLinkStyle'
              && thisWidget.getProperty('LinkHoverStyle', 'DefaultLinkHoverStyle') === 'DefaultLinkHoverStyle') {
        if (!addedDefaultStyles) {
          addedDefaultStyles = true;
          var defaultStyles = ' .widget-utl-logout-link { ' + LinkStyleBG + LinkBorder + ' }' +
                  ' .widget-utl-logout-link { ' + LinkStyleText + ' }' +
                  ' .widget-utl-logout-link:hover { ' + LinkHoverStyleBG + ' ' + LinkHoverStyleText + ' }';
          $.rule(defaultStyles).appendTo(TW.Runtime.globalWidgetStyleEl);
        }
      } else {

        styleBlock = '#' + thisWidget.jqElementId + ' { ' + LinkStyleBG + LinkBorder + ' }' +
                '#' + thisWidget.jqElementId + ' .widget-utl-logout-link { ' + LinkStyleText + ' }' +
                '#' + thisWidget.jqElementId + ' .widget-utl-logout-link:hover { ' + LinkHoverStyleBG + ' ' + LinkHoverStyleText + ' }';
      }
      return styleBlock;
    };

    this.afterRender = function () {
      bindToolTip();
      bindClickHandler();
    };

    this.updateProperty = function (updatePropertyInfo) {
      var domElementId = this.jqElementId;
      var widgetElement = this.jqElement;
      var widgetProperties = this.properties;
      var widgetReference = this;

      if (updatePropertyInfo.TargetProperty === 'RedirectURL') {
        widgetReference.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
        widgetElement.find('.widget-utl-logout-link').attr('href', updatePropertyInfo.RawSinglePropertyValue);
        return;
      } else if (updatePropertyInfo.TargetProperty === 'Text') {
        widgetReference.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
        widgetElement.find('.widget-utl-logout-link').text(widgetReference.getProperty('Text'));
      } else if (updatePropertyInfo.TargetProperty === 'ToolTipField') {
        thisWidget.setProperty('ToolTipField', updatePropertyInfo.SinglePropertyValue);
        bindToolTip();
      }
    };

    this.serviceInvoked = function (serviceName) {
      var widgetElement = this.jqElement;
      var widgetReference = this;

      if (serviceName === 'Navigate') {
        setTimeout(function () {

        }, 100);
      } else {
        TW.log.error('Link widget, unexpected serviceName invoked "' + serviceName + '"');
      }
    };

    this.beforeDestroy = function () {
      var domElementId = this.jqElementId;
      var widgetElement = this.jqElement;
      var widgetProperties = this.properties;
      var widgetReference = this;

      try {
        $("#tiptip_holder").remove();
        widgetElement.unbind();
      } catch (destroyErr) {
      }
    };
  };
}());
// ----END: extensions/TWX_Converge_Styles_ExtensionPackage/ui/twx-utl-logout-link/link.runtime.js

// ----BEGIN: extensions/UiLogger_ExtensionPackage/ui/UiLogger/UiLogger.runtime.js
TW.Runtime.Widgets.UiLogger = function() {

    var thisWidget = this;

    this.runtimeProperties = function() {
        return {
            'needsDataLoadingAndError': true
        };
    };

    centralLoggerCreateIfDoesntExist();

    this.numberOfStates = 0;
    this.stateDefinitions = undefined;
    this.isNumeric = false;
    this.labelOrientation = undefined;
    this.rowNum = -1;
    this.log = TW.logger.central;
    this.mapWidgets = {};
    this.mapBindings = {};
    this.transferRate = 10000;
    this.replaceLink = "";
    this._replaceLink = this.replaceLink;
    this.replaceNavigation = undefined;
    let progReplaceEvent = false;
    let menuElem = undefined;
    let refIdToMashupIdMap = {};
    let loggerBindingMap = {};
    let itemsPushed = 0;
    let redirectEvent = undefined;

    Object.defineProperty(thisWidget, 'replaceLink', {
        get: function() {
            return thisWidget._replaceLink;
        },
        set: function(link) {
            //debugger;
            thisWidget._replaceLink = link;
        }
    });

    function getMashupReferenceStableIdAndType() {
        let rootName = thisWidget.mashup.rootName;

        if (rootName.substr(0, 4) == "root") {
            id = rootName;
            if (rootName == "root") {
                type = "Top";
            } else {
                type = "Sub";
            }
        } else if (rootName.substr(0, 6) == "Mashup") { // Temporary mashup ID
            let stop = false;
            let parents = thisWidget.jqElement.closest(".repeater-item");
            if (parents.length == 1) {
                // Repeater case.
                let repId = parents[0].id.match(/[Rr]epeater-[\d]+-row-[\d]+$/);
                type = "Repeater";
                id = repId + "-" + thisWidget.idOfThisElement;
            }

            parents = thisWidget.jqElement.closest(".gadget");
            if (parents.length == 1) {
                // Gadget case.
                type = "Gadget";
                id = parents.attr("ref-id");
            }
        }

        return { id: id, type: type };
    }

    this.getMashupIdFromReferenceAndType = function(refId, type) {
        refIdToMashupIdMap[refId];
    }

    function logAppend(eventType, sourceId, value, property, options) {
        let stable = getMashupReferenceStableIdAndType();

        thisWidget.log.push({
            event: eventType,
            mashup: thisWidget.mashup.mashupName,
            timestamp: new Date().getTime(),
            elementId: sourceId,
            id: TW.uniqueId(),
            value: value,
            property: property,
            option: options,
            refId: stable.id,
            mashupType: stable.type,
            loggerId: thisWidget.idOfThisElement
        });
    }

    function insertFakeBinding(binding) {
        const wMapName = "v" + fakeWidgetBindCounter;
        let bindingId = {
            widget: binding.SourceId,
            field: binding.PropertyMaps[0].TargetProperty
        };
        let strBindId = JSON.stringify(bindingId);

        fakeBindingDataMap[strBindId] = wMapName;
        reverseFakeBindingDataMap[wMapName] = strBindId;
    }

    function getBindingFakeId(binding) {
        return binding.SourceId + '&' + binding.PropertyMaps[0].SourceProperty;
    }

    this.renderHtml = function() {
        var tooltip = thisWidget.getProperty('tooltip');
        var text = thisWidget.getProperty('text');
        var html = "<div class=\"widget-content\" title=\"" + tooltip + "\">" + text + "</div>";

        return html;
    };

    this.dataSources = new Object();
    this.values = new Object();
    this.indexes = new Object();

    function isWidgetBound(mashup, widgetId) {
        let dataBindings = mashup.DataBindings;

        let found = false;
        let nBindings = dataBindings.length;

        for (let iBind = 0; found == false && iBind < nBindings; iBind++) {
            if (dataBindings[iBind].SourceId == widgetId)
                found = true;
        }

        return found;
    }



    function getWidgetTypename(widget) {
        return widget.idOfThisElement.split("-", 1)[0];
    }

    function getWidgetnameTypename(widgetName) {
        return widgetName.split("-", 1)[0];
    }

    function isWidgetClickable(widget) {
        let w = widget.jqElement[0].clientWidth;
        let h = widget.jqElement[0].clientHeight;

        if (w != undefined && w != null && w > 0 &&
            h != undefined && h != null && h > 0)
            return true;

        return false;
    }

    function mapWidgets(widget, map) {
        try {
            //console.log(widget);
            thisWidget.mapWidgets[widget.idOfThisElement] = widget;
            widget.getWidgets().forEach(function(w) {
                mapWidgets(w, thisWidget.mapWidgets);
            });
        } catch (err) {
            console.log(err);
            console.log("Error mapping " + widget.idOfThisElement);
        }
    }

    function prepareThisWidgetProperties(binding, widget) {
        let propId = getBindingFakeId(binding);
        let newBinding = createLogBindingFromBinding(binding, false, false);
        newBinding.TargetId = binding.SourceId;
        newBinding.SourceId = thisWidget.idOfThisElement;
        newBinding.PropertyMaps[0].TargetProperty = binding.PropertyMaps[0].SourceProperty;
        newBinding.PropertyMaps[0].SourceProperty = propId;
        newBinding.targetRef = widget;

        function subscription() {
            let targetWidget = this.binding.targetRef;
            let updatePropertyInfo = thisWidget.mashup.dataMgr.getUpdatePropertyInfoFromBindingSource(this.binding);

            let stateFormatterName = TW.Runtime.checkStylingPropertyUpdate(thisWidget, this.binding.PropertyMaps[0].TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
            if (stateFormatterName != undefined) {
                updatePropertyInfo.TargetProperty = stateFormatterName;
            }

            // for mashup widget, see if the widget itself processes the update
            if (targetWidget !== undefined) {
                if (thisWidget.handleUpdateProperty === undefined || !targetWidget.handleUpdateProperty(updatePropertyInfo)) {
                    targetWidget.standardUpdateProperty(updatePropertyInfo)
                }
            } else {
                targetWidget.standardUpdateProperty(updatePropertyInfo);
            }
        }

        thisWidget.mashup.dataMgr.addDataChangeSubscriber(newBinding, subscription);
    }

    function getSourceWidgetFromBinding(binding) {
        return thisWidget.mapWidgets[binding.SourceId];
    }

    function bindRootWidgets() {
        let widgets = TW.Runtime.Workspace.Mashups.Current.rootWidget.getWidgets();
        // console.log(widgets);
        // console.log(thisWidget.mashup.DataBindings);
        let subscribers = thisWidget.mashup.dataMgr.subscribers;
        // console.log(subscribers);

        mapWidgets(TW.Runtime.Workspace.Mashups.Current.rootWidget, this.mapWidgets);
        // console.log(subscribers);
        try {
            widgets.forEach(function(widget, index) {
                bindWidgets(widget, subscribers);
            });
        } catch (error) {
            console.error("Process widgets error");
            console.error(error);
        }

        try {
            thisWidget.mashup.DataBindings.forEach(function(db) {
                processBinding(db, subscribers);
            });
        } catch (error) {
            console.error("Process bindings error");
            console.error(error);
        }

        //console.log(thisWidget);
        thisWidget.intervalId = setInterval(function()  {
            // console.log(thisWidget.log);
            if (thisWidget.log.length > 0) {
                // console.log(thisWidget.log);
                serverUpdate();
            }
        }, thisWidget.transferRate);

        // this.mapWidgets = {}
    }

    function getKeyFromBinding(binding) {
        return binding.SourceId + "&" + binding.PropertyMaps[0].SourceProperty;
    }

    function createLogBindingFromBinding(binding, useCache, selection) {
        let uiLogBinding = new Object();
        for (let p in binding) {
            if (p != 'PropertyMaps') {
                uiLogBinding[p] = binding[p];
            } else {
                uiLogBinding[p] = [];
                uiLogBinding[p][0] = new Object();
                for (let pmap in binding[p][0]) {
                    uiLogBinding[p][0][pmap] = binding[p][0][pmap];
                }
            }
        }

        if (selection == true) {
            uiLogBinding.PropertyMaps[0].TargetProperty = binding.SourceId + "&" + binding.PropertyMaps[0].TargetProperty;
        }

        uiLogBinding.Id = TW.uniqueId();
        uiLogBinding.TargetId = thisWidget.idOfThisElement;
        uiLogBinding.SourceRef = getSourceWidgetFromBinding(binding);

        if (useCache == true) {
            let key = getKeyFromBinding(uiLogBinding);
            if (loggerBindingMap.hasOwnProperty(key)) {
                loggerBindingMap[key]++;
            } else {
                loggerBindingMap[key] = 1;
            }
        }

        return uiLogBinding;
    }

    function isLoggerBindingDuplicate(binding) {
        let key = getKeyFromBinding(binding);
        if (loggerBindingMap.hasOwnProperty(key) && loggerBindingMap[key] > 1) {
            return true;
        }

        return false;
    }

    function skipBinding(binding) {
        let widgetTypename = getWidgetnameTypename(binding.SourceId);

        if (widgetTypename == "ContainedMashup" ||
            widgetTypename == "mashupcontainer" ||
            widgetTypename == "Expression" || widgetTypename == "expression" ||
            widgetTypename == "Validator" || widgetTypename == "validator") {
            return true;
        }

        return false;
    }

    function processBinding(binding, subscribers) {
        // console.log(binding);
        let isBoundToSelectedRows = TW.Runtime.isBindingBoundToSelectedRows(binding);
        let loggerSource = (getWidgetnameTypename(binding.SourceId) == getWidgetnameTypename(thisWidget.idOfThisElement)) ? true : false;
        let skip = skipBinding(binding);

        function toWidgetSubscription() {
            let widget = this.binding.SourceRef;
            let propertyName = this.binding.PropertyMaps[0].SourceProperty;
            let option = this.binding.PropertyMaps[0].SourcePropertyBaseType;

            let value = widget.getProperty(propertyName);
            // console.log({ widget: widget.idOfThisElement, value: value });
            logAppend('Click', widget.idOfThisElement, value, propertyName, option);
        }

        if (binding != null && !isBoundToSelectedRows && binding.PropertyMaps[0].TargetPropertyBaseType === 'INFOTABLE' &&
            binding.SourceArea == "Data" && binding.TargetArea == "UI") {

            let loggerBinding = createLogBindingFromBinding(binding, true, true);

            if (!isLoggerBindingDuplicate(loggerBinding)) {
                thisWidget.mashup.DataBindings.push(loggerBinding);
                thisWidget.mashup.dataMgr.addSelectedRowsForWidgetHandleSelectionUpdateSubscription(loggerBinding,
                    function(sourceId, selectedRows, selectedRowIndices) {
                        logAppend('Selection', sourceId, selectedRowIndices, this.binding.PropertyMaps[0].TargetProperty);
                    });
            }
        } else if (binding != null && !loggerSource && !skip) {
            //console.log(tokenArray);
            let widgetSubscriberUi = subscribers['UI'];
            let widgetSubscriberProperies = widgetSubscriberUi[binding.SourceId];
            let sourceWidget = getSourceWidgetFromBinding(binding);
            let uiLogBinding = undefined;
            if (widgetSubscriberProperies == undefined) {
                //console.log(binding);
                if (binding.SourceArea == "UI") {

                    prepareThisWidgetProperties(binding, sourceWidget);
                    let loggerBinding = createLogBindingFromBinding(binding, true, false);
                    if (!isLoggerBindingDuplicate(loggerBinding)) {
                        thisWidget.mashup.dataMgr.addDataChangeSubscriber(loggerBinding, toWidgetSubscription);
                    }
                }
            } else if (isWidgetClickable(sourceWidget)) {
                prepareThisWidgetProperties(binding, sourceWidget);
                let loggerBinding = createLogBindingFromBinding(binding, true, false);
                if (!isLoggerBindingDuplicate(loggerBinding)) {
                    thisWidget.mashup.dataMgr.addDataChangeSubscriber(loggerBinding, toWidgetSubscription);
                }
            }
        }
    }

    function triggerButton(widget, widgetTypename) {
        let triggered = false;
        if (widgetTypename != 'button' && widgetTypename != 'Button') {
            return false;
        }

        let events = thisWidget.mashup.Events;

        const n_events = events.length;
        for (let i_event = 0; i_event < n_events && triggered == false; i_event++) {
            triggered = (widget.idOfThisElement == events[i_event].EventTriggerId);
        }

        return triggered;
    }

    function bindWidgets(widget, subscribers) {
        if (typeof widget == "undefined") {
            return;
        }
        let widgetTypename = getWidgetTypename(widget);

        if (triggerButton(widget, widgetTypename) ||
            widgetTypename == 'valuedisplay' || widgetTypename == 'Valuedisplay' ||
            widgetTypename == 'tabs' || widgetTypename == 'Tabs' ||
            widgetTypename == 'tabsResponsive' || widgetTypename == 'TabsResponsive' ||
            // widgetTypename == 'repeater' || widgetTypename == 'Repeater' ||
            widgetTypename == 'dataexport' || widgetTypename == 'Dataexport') {
            widget.jqElement.on('click', widget, function(e)  {
                let value = undefined;
                let pushImmediate = false;
                if (widgetTypename == 'menu' || widgetTypename == 'Menu') {
                    value = widget.getProperty('Mashup');
                } else if (widgetTypename == 'tabs' || widgetTypename == 'Tabs' ||
                    widgetTypename == 'tabsResponsive' || widgetTypename == 'TabsResponsive') {
                    value = widget.getProperty('CurrentTab').toFixed(0);
                }
                logAppend('Click', e.data.idOfThisElement, value);
            });
        } else if (widgetTypename == 'link' || widgetTypename == 'Link') {
            let pushImmediate = false;
            widget.jqElement.on('click', widget, function(e) {
                let value = widget.getProperty('SourceURL');
                let option = widget.getProperty('TargetWindow');
                logAppend('Click', e.data.idOfThisElement, value, undefined, option);

                if (option == "replace") {
                    e.preventDefault();
                    thisWidget.replaceLink = value;
                    pushImmediate = true;
                }

                if (pushImmediate == true) {
                    serverUpdate();
                }
            });
        } else if (widgetTypename == 'navigation' || widgetTypename == 'Navigation') {
            let value = undefined;
            let pushImmediate = false;
            let option = "";

            $(widget.jqElement).get(0).addEventListener("mouseup", function(e) {
                value = widget.getProperty('MashupName');
                option = widget.getProperty('TargetWindow');
                //console.log(option + " " + progReplaceEvent);

                if (progReplaceEvent == false) {
                    logAppend('Click', widget.idOfThisElement, value, undefined, option);
                }

                if (option == "replace" && progReplaceEvent == false) {
                    e.stopPropagation();
                    thisWidget.replaceNavigation = widget;
                    pushImmediate = true;
                }

                if (pushImmediate == true) {
                    serverUpdate();
                }

                progReplaceEvent = false;
            }, true);
        } else if (widgetTypename == 'menu' || widgetTypename == 'Menu') {
            setTimeout(function(widget) {
                let allListElements = $("li");
                let lis = $(widget.jqElement).find(allListElements);
                lis.each(function(a, b, c) {
                    let elem = b;
                    $(b).get(0).addEventListener('click', function(e) {
                        let li = $(e.target).closest('li');
                        let target = li.attr('link-target');
                        let value = $(elem).attr('menu-id');

                        if (progReplaceEvent == false) {
                            logAppend('Click', widget.idOfThisElement, value, undefined, target);
                        }

                        if (target == "Self" && progReplaceEvent == false) {
                            e.stopPropagation();
                            e.preventDefault();
                            menuElem = elem;
                            serverUpdate();
                        }

                        progReplaceEvent = false;
                    }, true);
                });

            }, 1500, widget);
        }

        widget.getWidgets().forEach(function(widget, index) {
            bindWidgets(widget, subscribers);
        });
    }

    function centralLoggerCreateIfDoesntExist() {
        if (TW.logger == undefined) {
            TW.logger = new Object({
                repeater: {},
                central: []
            })
        }
    }

    function setLoggerToReference(id, type) {
        if (type == "Gadget") {
            $("div[ref-id='" + id + "']").data('logger', thisWidget);
        } else if (type == "Repeater") {
            TW.logger.repeater[id] = thisWidget;
        }
    }

    function getRootUrl() {
        let mashupParameters = [];
        for (let p in thisWidget.mashup.mashupParameterDefinitions) {
            mashupParameters.push(p);
        }

        mashupParameters.sort(function(a, b) {
            a.ordinal - b.ordinal;
        });

        let path = thisWidget.mashup.mashupName;

        mashupParameters.forEach(function(p) {
            path += "&" + p + "=" + thisWidget.mashup.rootWidget.getProperty(p);
        });

        return path;
    }

    function createEventRedirection(event) {
        let uiLogEvent = new Object();

        for (let p in event) {
            uiLogEvent[p] = event[p];
        }

        uiLogEvent.Id = TW.uniqueId();

        // Change trigger in the copied event
        uiLogEvent.EventTriggerArea = "UI";
        uiLogEvent.EventTriggerEvent = "RedirectTo_" + event.EventHandlerId;
        uiLogEvent.EventTriggerId = thisWidget.idOfThisElement;

        // Change handler in the original event
        event.EventHandlerArea = uiLogEvent.EventTriggerArea;
        event.EventHandlerId = uiLogEvent.EventTriggerId;
        event.EventHandlerService = uiLogEvent.EventTriggerEvent;
        return uiLogEvent;
    }

    function redirectNavigations() {
        let events = thisWidget.mashup.Events;
        let len = events.length;
        for (let i_event = 0; i_event < len; i_event++) {
            let event = events[i_event];
            if (event.EventHandlerService == "Navigate") {
                events.push(createEventRedirection(event));
            }
        }
    }

    this.afterRender = function() {
        TW.log.info('UiLogger::afterRender');

        if (thisWidget.mashup.rootName == 'root') {
            $(document).click(function(e) {
                console.log(e);
            });
        }
        // console.log(thisWidget);
        thisWidget.transferRate = thisWidget.getProperty('DataTransferRate');
        try {
            let reference = getMashupReferenceStableIdAndType();
            refIdToMashupIdMap[reference.id] = thisWidget.mashup;
            setLoggerToReference(reference.id, reference.type);

            redirectNavigations(); // May be transferred to Composer time
        } catch (err) {
            console.error(err);
        }
    };

    this.beforeDestroy = function() {
        clearInterval(thisWidget.intervalId);
        if (thisWidget.mashup.rootName == "root") {
            $(window).off("blur focus");
        }
    }

    function serverUpdate() {
        itemsPushed = thisWidget.log.length;
        /* thisWidget.log.forEach((e) => {
            console.log("ID: " + e.elementId + "  Value: " + e.value);
        }); */
        thisWidget.setProperty("MashupDataLog", JSON.stringify(thisWidget.log));
        thisWidget.jqElement.triggerHandler('Clicked');
    }

    function isTopMashup() {
        return thisWidget.mashup.rootName == "root" && thisWidget.mashup.rootWidget.getProperty('Type') != "targetmashup";
    }

    function isSubMasterMashup() {
        let root = thisWidget.mashup.rootWidget;

        if (root.getProperty('Master') != undefined && thisWidget.mashup.rootName.substr(0, 4) == "root" &&
            /ContainedMashup/.test(thisWidget.mashup.rootName) == false) {
            return true;
        }

        return false;
    }

    function registerMashupLoad() {
        try {
            let value = thisWidget.mashup.mashupName;
            let option = undefined;
            if (isTopMashup() ||
                (isSubMasterMashup() == true)) {
                value = getRootUrl();
                option = "root";
            }
            logAppend('Loaded', thisWidget.mashup.mashupName, value, undefined, option);

            if (thisWidget.mashup.rootName == "root") {
                $(window).on("blur focus onbeforeunload", thisWidget, function(e) {
                    var prevType = $(this).data("prevType");
                    thisWidget = e.data;
                    if (prevType != e.type) { //  reduce double fire issues
                        switch (e.type) {
                            case "blur":
                                logAppend('TabBlur', thisWidget.mashup.mashupName);
                                break;
                            case "focus":
                                logAppend('TabFocus', thisWidget.mashup.mashupName);
                                break;
                        }
                    }

                    $(this).data("prevType", e.type);
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    this.serviceInvoked = function(serviceName) {
        if (serviceName === 'Purge') {
            thisWidget.log.splice(0, itemsPushed);

            if (thisWidget.replaceLink != undefined && thisWidget.replaceLink != "") {
                window.location = thisWidget.replaceLink;
                //progReplaceEvent = true;
                thisWidget.replaceLink = undefined;
            } else if (thisWidget.replaceNavigation != undefined) {
                progReplaceEvent = true;
                thisWidget.replaceNavigation.serviceInvoked('Navigate');
            } else if (menuElem != undefined) {
                $(menuElem).trigger('click');
                menuElem = undefined;
                progReplaceEvent = true;
            } else if (redirectEvent != undefined) {
                thisWidget.jqElement.triggerHandler(redirectEvent);
                redirectEvent = undefined;
            }
        } else if (serviceName == 'Trigger') {
            registerMashupLoad();
            mapWidgets(thisWidget.mashup.rootWidget, thisWidget.mapWidgets);
            bindRootWidgets();
        } else if (/^RedirectTo_/.test(serviceName) == true) {
            redirectEvent = serviceName;
            setTimeout(serverUpdate, 250);
        } else {
            TW.log.error('validator widget, unexpected serviceName invoked "' + serviceName + '"');
        };
    };

    this.updateProperty = function(updatePropertyInfo) {
        conosle.log(updatePropertyInfo);

        // You can explore 'TW.Runtime.Widgets.UiLogger.debug1' in F12 Console
        TW.Runtime.Widgets.UiLogger.debug1 = updatePropertyInfo;

        if (updatePropertyInfo.TargetProperty.substring(0, "DataSource".length) == "DataSource")
            this.dataSources[updatePropertyInfo.TargetProperty] = updatePropertyInfo.ActualDataRows;
        else if (updatePropertyInfo.TargetProperty.substring(0, "value".length) == "value") {
            this.values[updatePropertyInfo.TargetProperty] = updatePropertyInfo.SinglePropertyValue;
        } else if (updatePropertyInfo.TargetProperty.substring(0, "rowNum".length) == "rowNum") {
            this.indexes[updatePropertyInfo.TargetProperty] = updatePropertyInfo.SinglePropertyValue;
        }
    }
};
// ----END: extensions/UiLogger_ExtensionPackage/ui/UiLogger/UiLogger.runtime.js

