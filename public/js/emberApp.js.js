
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-jquery/index.js", function(exports, require, module){
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				// Try to fetch any internally stored data first
				return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
			}

			this.each(function() {
				jQuery.data( this, key, value );
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, notxml, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			// In IE9+, Flash objects don't have .getAttribute (#12945)
			// Support: IE9+
			if ( typeof elem.getAttribute !== core_strundefined ) {
				ret =  elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( rboolean.test( name ) ) {
					// Set corresponding property to false for boolean attributes
					// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
					if ( !getSetAttribute && ruseDefault.test( name ) ) {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					} else {
						elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		var
			// Use .prop to determine if this attribute is understood as boolean
			prop = jQuery.prop( elem, name ),

			// Fetch it accordingly
			attr = typeof prop === "boolean" && elem.getAttribute( name ),
			detail = typeof prop === "boolean" ?

				getSetInput && getSetAttribute ?
					attr != null :
					// oldIE fabricates an empty string for missing boolean attributes
					// and conflates checked/selected into attroperties
					ruseDefault.test( name ) ?
						elem[ jQuery.camelCase( "default-" + name ) ] :
						!!attr :

				// fetch an attribute node for properties not recognized as boolean
				elem.getAttributeNode( name );

		return detail && detail.value !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return jQuery.nodeName( elem, "input" ) ?

				// Ignore the value *property* by using defaultValue
				elem.defaultValue :

				ret && ret.specified ? ret.value : undefined;
		},
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret == null ? undefined : ret;
			}
		});
	});

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		event.isTrigger = true;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur != this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			}
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== document.activeElement && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === document.activeElement && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	hasDuplicate,
	outermostContext,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsXML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,
	sortOrder,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},


	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rsibling = /[\x20\t\r\n\f]*[+~]/,

	rnative = /^[^{]+\{\s*\[native code/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,
	rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Use a stripped-down slice if we can't use a native one
try {
	slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		while ( (elem = this[i++]) ) {
			results.push( elem );
		}
		return results;
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return fn( div );
	} catch (e) {
		return false;
	} finally {
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !documentIsXML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && !rbuggyQSA.test(selector) ) {
			old = true;
			nid = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results, slice.call( newContext.querySelectorAll(
						newSelector
					), 0 ) );
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsXML = isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.tagNameNoComments = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if attributes should be retrieved by attribute nodes
	support.attributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	});

	// Check if getElementsByClassName can be trusted
	support.getByClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	});

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	support.getByName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = doc.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			doc.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			doc.getElementsByName( expando + 0 ).length;
		support.getIdNotName = !doc.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

	// IE6/7 return modified attributes
	Expr.attrHandle = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}) ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		};

	// ID find and filter
	if ( support.getIdNotName ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.tagNameNoComments ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Name
	Expr.find["NAME"] = support.getByName && function( tag, context ) {
		if ( typeof context.getElementsByName !== strundefined ) {
			return context.getElementsByName( name );
		}
	};

	// Class
	Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21),
	// no need to also add to buggyMatches since matches checks buggyQSA
	// A support test would require too much code (would include document ready)
	rbuggyQSA = [ ":focus" ];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE8 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<input type='hidden' i=''/>";
			if ( div.querySelectorAll("[i^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.webkitMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		var compare;

		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
			if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
				if ( a === doc || contains( preferredDoc, a ) ) {
					return -1;
				}
				if ( b === doc || contains( preferredDoc, b ) ) {
					return 1;
				}
				return 0;
			}
			return compare & 4 ? -1 : 1;
		}

		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	// Always assume the presence of duplicates if sort doesn't
	// pass them to our comparison function (as in Google Chrome).
	hasDuplicate = false;
	[0, 0].sort( sortOrder );
	support.detectDuplicates = hasDuplicate;

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	var val;

	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( !documentIsXML ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( documentIsXML || support.attributes ) {
		return elem.getAttribute( name );
	}
	return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
		name :
		val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}

			nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifider
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsXML ?
						elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
						elem.lang) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !documentIsXML &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		documentIsXML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( getAll( elem ) );
				}

				if ( elem.parentNode ) {
					if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
						setGlobalEval( getAll( elem, "script" ) );
					}
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		var isFunc = jQuery.isFunction( value );

		// Make sure that the elements are removed from the DOM before they are inserted
		// this can help fix replacing a parent with child elements
		if ( !isFunc && typeof value !== "string" ) {
			value = jQuery( value ).not( this ).detach();
		}

		return this.domManip( [ value ], true, function( elem ) {
			var next = this.nextSibling,
				parent = this.parentNode;

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		});
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, table ? self.html() : undefined );
				}
				self.domManip( args, table, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						node,
						i
					);
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery.ajax({
									url: node.src,
									type: "GET",
									dataType: "script",
									async: false,
									global: false,
									"throws": true
								});
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	var attr = elem.getAttributeNode("type");
	elem.type = ( attr && attr.specified ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.hover = function( fnOver, fnOut ) {
	return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					isSuccess = true;
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					isSuccess = true;
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	}
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
	var conv2, current, conv, tmp,
		converters = {},
		i = 0,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ];

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var value, name, index, easing, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/*jshint validthis:true */
	var prop, index, length,
		value, dataShow, toggle,
		tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();

// Expose for component
module.exports = jQuery;

// Expose jQuery to the global object
//window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

});
require.register("kelonye-ember/index.js", function(exports, require, module){
window.jQuery = window.$ = require('jquery');
// require('./lib/jquery.js');
require('./lib/handlebars.js');
require('./lib/ember.js');
});
require.register("kelonye-ember/lib/ember.js", function(exports, require, module){
(function(){(function(){if("undefined"===typeof Ember){Ember={};if("undefined"!==typeof window){window.Em=window.Ember=Em=Ember}}Ember.ENV="undefined"===typeof ENV?{}:ENV;if(!("MANDATORY_SETTER"in Ember.ENV)){Ember.ENV.MANDATORY_SETTER=true}Ember.assert=function(desc,test){if(!test)throw new Error("assertion failed: "+desc)};Ember.warn=function(message,test){if(!test){Ember.Logger.warn("WARNING: "+message);if("trace"in Ember.Logger)Ember.Logger.trace()}};Ember.debug=function(message){Ember.Logger.debug("DEBUG: "+message)};Ember.deprecate=function(message,test){if(Ember&&Ember.TESTING_DEPRECATION){return}if(arguments.length===1){test=false}if(test){return}if(Ember&&Ember.ENV.RAISE_ON_DEPRECATION){throw new Error(message)}var error;try{__fail__.fail()}catch(e){error=e}if(Ember.LOG_STACKTRACE_ON_DEPRECATION&&error.stack){var stack,stackStr="";if(error["arguments"]){stack=error.stack.replace(/^\s+at\s+/gm,"").replace(/^([^\(]+?)([\n$])/gm,"{anonymous}($1)$2").replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm,"{anonymous}($1)").split("\n");stack.shift()}else{stack=error.stack.replace(/(?:\n@:0)?\s+$/m,"").replace(/^\(/gm,"{anonymous}(").split("\n")}stackStr="\n    "+stack.slice(2).join("\n    ");message=message+stackStr}Ember.Logger.warn("DEPRECATION: "+message)};Ember.deprecateFunc=function(message,func){return function(){Ember.deprecate(message);return func.apply(this,arguments)}}})();(function(){var define,requireModule;(function(){var registry={},seen={};define=function(name,deps,callback){registry[name]={deps:deps,callback:callback}};requireModule=function(name){if(seen[name]){return seen[name]}seen[name]={};var mod=registry[name],deps=mod.deps,callback=mod.callback,reified=[],exports;for(var i=0,l=deps.length;i<l;i++){if(deps[i]==="exports"){reified.push(exports={})}else{reified.push(requireModule(deps[i]))}}var value=callback.apply(this,reified);return seen[name]=exports||value}})();(function(){if("undefined"===typeof Ember){Ember={}}var imports=Ember.imports=Ember.imports||this;var exports=Ember.exports=Ember.exports||this;var lookup=Ember.lookup=Ember.lookup||this;exports.Em=exports.Ember=Em=Ember;Ember.isNamespace=true;Ember.toString=function(){return"Ember"};Ember.VERSION="1.0.0-rc.1";Ember.ENV=Ember.ENV||("undefined"===typeof ENV?{}:ENV);Ember.config=Ember.config||{};Ember.EXTEND_PROTOTYPES=Ember.ENV.EXTEND_PROTOTYPES;if(typeof Ember.EXTEND_PROTOTYPES==="undefined"){Ember.EXTEND_PROTOTYPES=true}Ember.LOG_STACKTRACE_ON_DEPRECATION=Ember.ENV.LOG_STACKTRACE_ON_DEPRECATION!==false;Ember.SHIM_ES5=Ember.ENV.SHIM_ES5===false?false:Ember.EXTEND_PROTOTYPES;Ember.LOG_VERSION=Ember.ENV.LOG_VERSION===false?false:true;Ember.K=function(){return this};if("undefined"===typeof Ember.assert){Ember.assert=Ember.K}if("undefined"===typeof Ember.warn){Ember.warn=Ember.K}if("undefined"===typeof Ember.debug){Ember.debug=Ember.K}if("undefined"===typeof Ember.deprecate){Ember.deprecate=Ember.K}if("undefined"===typeof Ember.deprecateFunc){Ember.deprecateFunc=function(_,func){return func}}Ember.uuid=0;function consoleMethod(name){if(imports.console&&imports.console[name]){if(imports.console[name].apply){return function(){imports.console[name].apply(imports.console,arguments)}}else{return function(){var message=Array.prototype.join.call(arguments,", ");imports.console[name](message)}}}}Ember.Logger={log:consoleMethod("log")||Ember.K,warn:consoleMethod("warn")||Ember.K,error:consoleMethod("error")||Ember.K,info:consoleMethod("info")||Ember.K,debug:consoleMethod("debug")||consoleMethod("info")||Ember.K};Ember.onerror=null;Ember.handleErrors=function(func,context){if("function"===typeof Ember.onerror){try{return func.apply(context||this)}catch(error){Ember.onerror(error)}}else{return func.apply(context||this)}};Ember.merge=function(original,updates){for(var prop in updates){if(!updates.hasOwnProperty(prop)){continue}original[prop]=updates[prop]}};Ember.isNone=function(obj){return obj===null||obj===undefined};Ember.none=Ember.deprecateFunc("Ember.none is deprecated. Please use Ember.isNone instead.",Ember.isNone);Ember.isEmpty=function(obj){return obj===null||obj===undefined||obj.length===0&&typeof obj!=="function"||typeof obj==="object"&&Ember.get(obj,"length")===0};Ember.empty=Ember.deprecateFunc("Ember.empty is deprecated. Please use Ember.isEmpty instead.",Ember.isEmpty)})();(function(){var platform=Ember.platform={};Ember.create=Object.create;if(!Ember.create||Ember.ENV.STUB_OBJECT_CREATE){var K=function(){};Ember.create=function(obj,props){K.prototype=obj;obj=new K;if(props){K.prototype=obj;for(var prop in props){K.prototype[prop]=props[prop].value}obj=new K}K.prototype=null;return obj};Ember.create.isSimulated=true}var defineProperty=Object.defineProperty;var canRedefineProperties,canDefinePropertyOnDOM;if(defineProperty){try{defineProperty({},"a",{get:function(){}})}catch(e){defineProperty=null}}if(defineProperty){canRedefineProperties=function(){var obj={};defineProperty(obj,"a",{configurable:true,enumerable:true,get:function(){},set:function(){}});defineProperty(obj,"a",{configurable:true,enumerable:true,writable:true,value:true});return obj.a===true}();canDefinePropertyOnDOM=function(){try{defineProperty(document.createElement("div"),"definePropertyOnDOM",{});return true}catch(e){}return false}();if(!canRedefineProperties){defineProperty=null}else if(!canDefinePropertyOnDOM){defineProperty=function(obj,keyName,desc){var isNode;if(typeof Node==="object"){isNode=obj instanceof Node}else{isNode=typeof obj==="object"&&typeof obj.nodeType==="number"&&typeof obj.nodeName==="string"}if(isNode){return obj[keyName]=desc.value}else{return Object.defineProperty(obj,keyName,desc)}}}}platform.defineProperty=defineProperty;platform.hasPropertyAccessors=true;if(!platform.defineProperty){platform.hasPropertyAccessors=false;platform.defineProperty=function(obj,keyName,desc){if(!desc.get){obj[keyName]=desc.value}};platform.defineProperty.isSimulated=true}if(Ember.ENV.MANDATORY_SETTER&&!platform.hasPropertyAccessors){Ember.ENV.MANDATORY_SETTER=false}})();(function(){var o_defineProperty=Ember.platform.defineProperty,o_create=Ember.create,GUID_KEY="__ember"+ +new Date,uuid=0,numberCache=[],stringCache={};var MANDATORY_SETTER=Ember.ENV.MANDATORY_SETTER;Ember.GUID_KEY=GUID_KEY;var GUID_DESC={writable:false,configurable:false,enumerable:false,value:null};Ember.generateGuid=function generateGuid(obj,prefix){if(!prefix)prefix="ember";var ret=prefix+uuid++;if(obj){GUID_DESC.value=ret;o_defineProperty(obj,GUID_KEY,GUID_DESC)}return ret};Ember.guidFor=function guidFor(obj){if(obj===undefined)return"(undefined)";if(obj===null)return"(null)";var cache,ret;var type=typeof obj;switch(type){case"number":ret=numberCache[obj];if(!ret)ret=numberCache[obj]="nu"+obj;return ret;case"string":ret=stringCache[obj];if(!ret)ret=stringCache[obj]="st"+uuid++;return ret;case"boolean":return obj?"(true)":"(false)";default:if(obj[GUID_KEY])return obj[GUID_KEY];if(obj===Object)return"(Object)";if(obj===Array)return"(Array)";ret="ember"+uuid++;GUID_DESC.value=ret;o_defineProperty(obj,GUID_KEY,GUID_DESC);return ret}};var META_DESC={writable:true,configurable:false,enumerable:false,value:null};var META_KEY=Ember.GUID_KEY+"_meta";Ember.META_KEY=META_KEY;var EMPTY_META={descs:{},watching:{}};if(MANDATORY_SETTER){EMPTY_META.values={}}Ember.EMPTY_META=EMPTY_META;if(Object.freeze)Object.freeze(EMPTY_META);var isDefinePropertySimulated=Ember.platform.defineProperty.isSimulated;function Meta(obj){this.descs={};this.watching={};this.cache={};this.source=obj}if(isDefinePropertySimulated){Meta.prototype.__preventPlainObject__=true;Meta.prototype.toJSON=function(){}}Ember.meta=function meta(obj,writable){var ret=obj[META_KEY];if(writable===false)return ret||EMPTY_META;if(!ret){if(!isDefinePropertySimulated)o_defineProperty(obj,META_KEY,META_DESC);ret=new Meta(obj);if(MANDATORY_SETTER){ret.values={}}obj[META_KEY]=ret;ret.descs.constructor=null}else if(ret.source!==obj){if(!isDefinePropertySimulated)o_defineProperty(obj,META_KEY,META_DESC);ret=o_create(ret);ret.descs=o_create(ret.descs);ret.watching=o_create(ret.watching);ret.cache={};ret.source=obj;if(MANDATORY_SETTER){ret.values=o_create(ret.values)}obj[META_KEY]=ret}return ret};Ember.getMeta=function getMeta(obj,property){var meta=Ember.meta(obj,false);return meta[property]};Ember.setMeta=function setMeta(obj,property,value){var meta=Ember.meta(obj,true);meta[property]=value;return value};Ember.metaPath=function metaPath(obj,path,writable){var meta=Ember.meta(obj,writable),keyName,value;for(var i=0,l=path.length;i<l;i++){keyName=path[i];value=meta[keyName];if(!value){if(!writable){return undefined}value=meta[keyName]={__ember_source__:obj}}else if(value.__ember_source__!==obj){if(!writable){return undefined}value=meta[keyName]=o_create(value);value.__ember_source__=obj}meta=value}return value};Ember.wrap=function(func,superFunc){function K(){}function superWrapper(){var ret,sup=this._super;this._super=superFunc||K;ret=func.apply(this,arguments);this._super=sup;return ret}superWrapper.wrappedFunction=func;superWrapper.__ember_observes__=func.__ember_observes__;superWrapper.__ember_observesBefore__=func.__ember_observesBefore__;return superWrapper};Ember.isArray=function(obj){if(!obj||obj.setInterval){return false}if(Array.isArray&&Array.isArray(obj)){return true}if(Ember.Array&&Ember.Array.detect(obj)){return true}if(obj.length!==undefined&&"object"===typeof obj){return true}return false};Ember.makeArray=function(obj){if(obj===null||obj===undefined){return[]}return Ember.isArray(obj)?obj:[obj]};function canInvoke(obj,methodName){return!!(obj&&typeof obj[methodName]==="function")}Ember.canInvoke=canInvoke;Ember.tryInvoke=function(obj,methodName,args){if(canInvoke(obj,methodName)){return obj[methodName].apply(obj,args||[])}};var needsFinallyFix=function(){var count=0;try{try{}finally{count++;throw new Error("needsFinallyFixTest")}}catch(e){}return count!==1}();if(needsFinallyFix){Ember.tryFinally=function(tryable,finalizer,binding){var result,finalResult,finalError;binding=binding||this;try{result=tryable.call(binding)}finally{try{finalResult=finalizer.call(binding)}catch(e){finalError=e}}if(finalError){throw finalError}return finalResult===undefined?result:finalResult}}else{Ember.tryFinally=function(tryable,finalizer,binding){var result,finalResult;binding=binding||this;try{result=tryable.call(binding)}finally{finalResult=finalizer.call(binding)}return finalResult===undefined?result:finalResult}}if(needsFinallyFix){Ember.tryCatchFinally=function(tryable,catchable,finalizer,binding){var result,finalResult,finalError,finalReturn;binding=binding||this;try{result=tryable.call(binding)}catch(error){result=catchable.call(binding,error)}finally{try{finalResult=finalizer.call(binding)}catch(e){finalError=e}}if(finalError){throw finalError}return finalResult===undefined?result:finalResult}}else{Ember.tryCatchFinally=function(tryable,catchable,finalizer,binding){var result,finalResult;binding=binding||this;try{result=tryable.call(binding)}catch(error){result=catchable.call(binding,error)}finally{finalResult=finalizer.call(binding)}return finalResult===undefined?result:finalResult}}})();(function(){Ember.Instrumentation={};var subscribers=[],cache={};var populateListeners=function(name){var listeners=[],subscriber;for(var i=0,l=subscribers.length;i<l;i++){subscriber=subscribers[i];if(subscriber.regex.test(name)){listeners.push(subscriber.object)}}cache[name]=listeners;return listeners};var time=function(){var perf="undefined"!==typeof window?window.performance||{}:{};var fn=perf.now||perf.mozNow||perf.webkitNow||perf.msNow||perf.oNow;return fn?fn.bind(perf):function(){return+new Date}}();Ember.Instrumentation.instrument=function(name,payload,callback,binding){var listeners=cache[name],timeName,ret;if(Ember.STRUCTURED_PROFILE){timeName=name+": "+payload.object;console.time(timeName)}if(!listeners){listeners=populateListeners(name)}if(listeners.length===0){ret=callback.call(binding);if(Ember.STRUCTURED_PROFILE){console.timeEnd(timeName)}return ret}var beforeValues=[],listener,i,l;function tryable(){for(i=0,l=listeners.length;i<l;i++){listener=listeners[i];beforeValues[i]=listener.before(name,time(),payload)}return callback.call(binding)}function catchable(e){payload=payload||{};payload.exception=e}function finalizer(){for(i=0,l=listeners.length;i<l;i++){listener=listeners[i];listener.after(name,time(),payload,beforeValues[i])}if(Ember.STRUCTURED_PROFILE){console.timeEnd(timeName)}}return Ember.tryCatchFinally(tryable,catchable,finalizer)};Ember.Instrumentation.subscribe=function(pattern,object){var paths=pattern.split("."),path,regex=[];for(var i=0,l=paths.length;i<l;i++){path=paths[i];if(path==="*"){regex.push("[^\\.]*")}else{regex.push(path)}}regex=regex.join("\\.");regex=regex+"(\\..*)?";var subscriber={pattern:pattern,regex:new RegExp("^"+regex+"$"),object:object};subscribers.push(subscriber);cache={};return subscriber};Ember.Instrumentation.unsubscribe=function(subscriber){var index;for(var i=0,l=subscribers.length;i<l;i++){if(subscribers[i]===subscriber){index=i}}subscribers.splice(index,1);cache={}};Ember.Instrumentation.reset=function(){subscribers=[];cache={}};Ember.instrument=Ember.Instrumentation.instrument;Ember.subscribe=Ember.Instrumentation.subscribe})();(function(){var utils=Ember.EnumerableUtils={map:function(obj,callback,thisArg){return obj.map?obj.map.call(obj,callback,thisArg):Array.prototype.map.call(obj,callback,thisArg)},forEach:function(obj,callback,thisArg){return obj.forEach?obj.forEach.call(obj,callback,thisArg):Array.prototype.forEach.call(obj,callback,thisArg)},indexOf:function(obj,element,index){return obj.indexOf?obj.indexOf.call(obj,element,index):Array.prototype.indexOf.call(obj,element,index)},indexesOf:function(obj,elements){return elements===undefined?[]:utils.map(elements,function(item){return utils.indexOf(obj,item)})},addObject:function(array,item){var index=utils.indexOf(array,item);if(index===-1){array.push(item)}},removeObject:function(array,item){var index=utils.indexOf(array,item);if(index!==-1){array.splice(index,1)}},replace:function(array,idx,amt,objects){if(array.replace){return array.replace(idx,amt,objects)}else{var args=Array.prototype.concat.apply([idx,amt],objects);return array.splice.apply(array,args)}},intersection:function(array1,array2){var intersection=[];array1.forEach(function(element){if(array2.indexOf(element)>=0){intersection.push(element)}});return intersection}}})();(function(){var isNativeFunc=function(func){return func&&Function.prototype.toString.call(func).indexOf("[native code]")>-1};var arrayMap=isNativeFunc(Array.prototype.map)?Array.prototype.map:function(fun){if(this===void 0||this===null){throw new TypeError}var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function"){throw new TypeError}var res=new Array(len);var thisp=arguments[1];for(var i=0;i<len;i++){if(i in t){res[i]=fun.call(thisp,t[i],i,t)}}return res};var arrayForEach=isNativeFunc(Array.prototype.forEach)?Array.prototype.forEach:function(fun){if(this===void 0||this===null){throw new TypeError}var t=Object(this);var len=t.length>>>0;if(typeof fun!=="function"){throw new TypeError}var thisp=arguments[1];for(var i=0;i<len;i++){if(i in t){fun.call(thisp,t[i],i,t)}}};var arrayIndexOf=isNativeFunc(Array.prototype.indexOf)?Array.prototype.indexOf:function(obj,fromIndex){if(fromIndex===null||fromIndex===undefined){fromIndex=0}else if(fromIndex<0){fromIndex=Math.max(0,this.length+fromIndex)}for(var i=fromIndex,j=this.length;i<j;i++){if(this[i]===obj){return i}}return-1};Ember.ArrayPolyfills={map:arrayMap,forEach:arrayForEach,indexOf:arrayIndexOf};if(Ember.SHIM_ES5){if(!Array.prototype.map){Array.prototype.map=arrayMap}if(!Array.prototype.forEach){Array.prototype.forEach=arrayForEach}if(!Array.prototype.indexOf){Array.prototype.indexOf=arrayIndexOf}}})();(function(){var guidFor=Ember.guidFor,indexOf=Ember.ArrayPolyfills.indexOf;var copy=function(obj){var output={};for(var prop in obj){if(obj.hasOwnProperty(prop)){output[prop]=obj[prop]}}return output};var copyMap=function(original,newObject){var keys=original.keys.copy(),values=copy(original.values);newObject.keys=keys;newObject.values=values;return newObject};var OrderedSet=Ember.OrderedSet=function(){this.clear()};OrderedSet.create=function(){return new OrderedSet};OrderedSet.prototype={clear:function(){this.presenceSet={};this.list=[]},add:function(obj){var guid=guidFor(obj),presenceSet=this.presenceSet,list=this.list;if(guid in presenceSet){return}presenceSet[guid]=true;list.push(obj)},remove:function(obj){var guid=guidFor(obj),presenceSet=this.presenceSet,list=this.list;delete presenceSet[guid];var index=indexOf.call(list,obj);if(index>-1){list.splice(index,1)}},isEmpty:function(){return this.list.length===0},has:function(obj){var guid=guidFor(obj),presenceSet=this.presenceSet;return guid in presenceSet},forEach:function(fn,self){var list=this.list.slice();for(var i=0,j=list.length;i<j;i++){fn.call(self,list[i])}},toArray:function(){return this.list.slice()},copy:function(){var set=new OrderedSet;set.presenceSet=copy(this.presenceSet);set.list=this.list.slice();return set}};var Map=Ember.Map=function(){this.keys=Ember.OrderedSet.create();this.values={}};Map.create=function(){return new Map};Map.prototype={get:function(key){var values=this.values,guid=guidFor(key);return values[guid]},set:function(key,value){var keys=this.keys,values=this.values,guid=guidFor(key);keys.add(key);values[guid]=value},remove:function(key){var keys=this.keys,values=this.values,guid=guidFor(key),value;if(values.hasOwnProperty(guid)){keys.remove(key);value=values[guid];delete values[guid];return true}else{return false}},has:function(key){var values=this.values,guid=guidFor(key);return values.hasOwnProperty(guid)},forEach:function(callback,self){var keys=this.keys,values=this.values;keys.forEach(function(key){var guid=guidFor(key);callback.call(self,key,values[guid])})},copy:function(){return copyMap(this,new Map)}};var MapWithDefault=Ember.MapWithDefault=function(options){Map.call(this);this.defaultValue=options.defaultValue};MapWithDefault.create=function(options){if(options){return new MapWithDefault(options)}else{return new Map}};MapWithDefault.prototype=Ember.create(Map.prototype);MapWithDefault.prototype.get=function(key){var hasValue=this.has(key);if(hasValue){return Map.prototype.get.call(this,key)}else{var defaultValue=this.defaultValue(key);this.set(key,defaultValue);return defaultValue}};MapWithDefault.prototype.copy=function(){return copyMap(this,new MapWithDefault({defaultValue:this.defaultValue}))}})();(function(){var META_KEY=Ember.META_KEY,get,set;var MANDATORY_SETTER=Ember.ENV.MANDATORY_SETTER;var IS_GLOBAL=/^([A-Z$]|([0-9][A-Z$]))/;var IS_GLOBAL_PATH=/^([A-Z$]|([0-9][A-Z$])).*[\.\*]/;var HAS_THIS=/^this[\.\*]/;var FIRST_KEY=/^([^\.\*]+)/;get=function get(obj,keyName){if(keyName===""){return obj}if(!keyName&&"string"===typeof obj){keyName=obj;obj=null}if(!obj||keyName.indexOf(".")!==-1){Ember.assert("Cannot call get with '"+keyName+"' on an undefined object.",obj!==undefined);return getPath(obj,keyName)}Ember.assert("You need to provide an object and key to `get`.",!!obj&&keyName);var meta=obj[META_KEY],desc=meta&&meta.descs[keyName],ret;if(desc){return desc.get(obj,keyName)}else{if(MANDATORY_SETTER&&meta&&meta.watching[keyName]>0){ret=meta.values[keyName]}else{ret=obj[keyName]}if(ret===undefined&&"object"===typeof obj&&!(keyName in obj)&&"function"===typeof obj.unknownProperty){return obj.unknownProperty(keyName)}return ret}};set=function set(obj,keyName,value,tolerant){if(typeof obj==="string"){Ember.assert("Path '"+obj+"' must be global if no obj is given.",IS_GLOBAL.test(obj));value=keyName;keyName=obj;obj=null}if(!obj||keyName.indexOf(".")!==-1){return setPath(obj,keyName,value,tolerant)}Ember.assert("You need to provide an object and key to `set`.",!!obj&&keyName!==undefined);Ember.assert("calling set on destroyed object",!obj.isDestroyed);var meta=obj[META_KEY],desc=meta&&meta.descs[keyName],isUnknown,currentValue;if(desc){desc.set(obj,keyName,value)}else{isUnknown="object"===typeof obj&&!(keyName in obj);if(isUnknown&&"function"===typeof obj.setUnknownProperty){obj.setUnknownProperty(keyName,value)}else if(meta&&meta.watching[keyName]>0){if(MANDATORY_SETTER){currentValue=meta.values[keyName]}else{currentValue=obj[keyName]}if(value!==currentValue){Ember.propertyWillChange(obj,keyName);if(MANDATORY_SETTER){if(currentValue===undefined&&!(keyName in obj)){Ember.defineProperty(obj,keyName,null,value)}else{meta.values[keyName]=value}}else{obj[keyName]=value}Ember.propertyDidChange(obj,keyName)}}else{obj[keyName]=value}}return value};if(Ember.config.overrideAccessors){Ember.get=get;Ember.set=set;Ember.config.overrideAccessors();get=Ember.get;set=Ember.set}function firstKey(path){return path.match(FIRST_KEY)[0]}function normalizeTuple(target,path){var hasThis=HAS_THIS.test(path),isGlobal=!hasThis&&IS_GLOBAL_PATH.test(path),key;if(!target||isGlobal)target=Ember.lookup;if(hasThis)path=path.slice(5);if(target===Ember.lookup){key=firstKey(path);target=get(target,key);path=path.slice(key.length+1)}if(!path||path.length===0)throw new Error("Invalid Path");return[target,path]}function getPath(root,path){var hasThis,parts,tuple,idx,len;if(root===null&&path.indexOf(".")===-1){return get(Ember.lookup,path)}hasThis=HAS_THIS.test(path);if(!root||hasThis){tuple=normalizeTuple(root,path);root=tuple[0];path=tuple[1];tuple.length=0}parts=path.split(".");len=parts.length;for(idx=0;root&&idx<len;idx++){root=get(root,parts[idx],true);if(root&&root.isDestroyed){return undefined}}return root}function setPath(root,path,value,tolerant){var keyName;keyName=path.slice(path.lastIndexOf(".")+1);path=path.slice(0,path.length-(keyName.length+1));if(path!=="this"){root=getPath(root,path)}if(!keyName||keyName.length===0){throw new Error("You passed an empty path")}if(!root){if(tolerant){return}else{throw new Error("Object in path "+path+" could not be found or was destroyed.")}}return set(root,keyName,value)}Ember.normalizeTuple=function(target,path){return normalizeTuple(target,path)};Ember.getWithDefault=function(root,key,defaultValue){var value=get(root,key);if(value===undefined){return defaultValue}return value};Ember.get=get;Ember.getPath=Ember.deprecateFunc("getPath is deprecated since get now supports paths",Ember.get);Ember.set=set;Ember.setPath=Ember.deprecateFunc("setPath is deprecated since set now supports paths",Ember.set);Ember.trySet=function(root,path,value){return set(root,path,value,true)};Ember.trySetPath=Ember.deprecateFunc("trySetPath has been renamed to trySet",Ember.trySet);Ember.isGlobalPath=function(path){return IS_GLOBAL.test(path)}})();(function(){var META_KEY=Ember.META_KEY,metaFor=Ember.meta,objectDefineProperty=Ember.platform.defineProperty;var MANDATORY_SETTER=Ember.ENV.MANDATORY_SETTER;var Descriptor=Ember.Descriptor=function(){};var MANDATORY_SETTER_FUNCTION=Ember.MANDATORY_SETTER_FUNCTION=function(value){Ember.assert("You must use Ember.set() to access this property (of "+this+")",false)};var DEFAULT_GETTER_FUNCTION=Ember.DEFAULT_GETTER_FUNCTION=function(name){return function(){var meta=this[META_KEY];return meta&&meta.values[name]}};Ember.defineProperty=function(obj,keyName,desc,data,meta){var descs,existingDesc,watching,value;if(!meta)meta=metaFor(obj);descs=meta.descs;existingDesc=meta.descs[keyName];watching=meta.watching[keyName]>0;if(existingDesc instanceof Ember.Descriptor){existingDesc.teardown(obj,keyName)}if(desc instanceof Ember.Descriptor){value=desc;descs[keyName]=desc;if(MANDATORY_SETTER&&watching){objectDefineProperty(obj,keyName,{configurable:true,enumerable:true,writable:true,value:undefined})}else{obj[keyName]=undefined}desc.setup(obj,keyName)}else{descs[keyName]=undefined;if(desc==null){value=data;if(MANDATORY_SETTER&&watching){meta.values[keyName]=data;objectDefineProperty(obj,keyName,{configurable:true,enumerable:true,set:MANDATORY_SETTER_FUNCTION,get:DEFAULT_GETTER_FUNCTION(keyName)})}else{obj[keyName]=data}}else{value=desc;objectDefineProperty(obj,keyName,desc)}}if(watching){Ember.overrideChains(obj,keyName,meta)}if(obj.didDefineProperty){obj.didDefineProperty(obj,keyName,value)}return this}})();(function(){var AFTER_OBSERVERS=":change";var BEFORE_OBSERVERS=":before";var guidFor=Ember.guidFor;var deferred=0;function ObserverSet(){this.clear()}ObserverSet.prototype.add=function(sender,keyName,eventName){var observerSet=this.observerSet,observers=this.observers,senderGuid=Ember.guidFor(sender),keySet=observerSet[senderGuid],index;if(!keySet){observerSet[senderGuid]=keySet={}}index=keySet[keyName];if(index===undefined){index=observers.push({sender:sender,keyName:keyName,eventName:eventName,listeners:[]})-1;keySet[keyName]=index}return observers[index].listeners};ObserverSet.prototype.flush=function(){var observers=this.observers,i,len,observer,sender;this.clear();for(i=0,len=observers.length;i<len;++i){observer=observers[i];sender=observer.sender;if(sender.isDestroying||sender.isDestroyed){continue}Ember.sendEvent(sender,observer.eventName,[sender,observer.keyName],observer.listeners)}};ObserverSet.prototype.clear=function(){this.observerSet={};this.observers=[]};var beforeObserverSet=new ObserverSet,observerSet=new ObserverSet;Ember.beginPropertyChanges=function(){deferred++};Ember.endPropertyChanges=function(){deferred--;if(deferred<=0){beforeObserverSet.clear();observerSet.flush()}};Ember.changeProperties=function(cb,binding){Ember.beginPropertyChanges();Ember.tryFinally(cb,Ember.endPropertyChanges,binding)};Ember.setProperties=function(self,hash){Ember.changeProperties(function(){for(var prop in hash){if(hash.hasOwnProperty(prop))Ember.set(self,prop,hash[prop])}});return self};function changeEvent(keyName){return keyName+AFTER_OBSERVERS}function beforeEvent(keyName){return keyName+BEFORE_OBSERVERS}Ember.addObserver=function(obj,path,target,method){Ember.addListener(obj,changeEvent(path),target,method);Ember.watch(obj,path);return this};Ember.observersFor=function(obj,path){return Ember.listenersFor(obj,changeEvent(path))};Ember.removeObserver=function(obj,path,target,method){Ember.unwatch(obj,path);Ember.removeListener(obj,changeEvent(path),target,method);return this};Ember.addBeforeObserver=function(obj,path,target,method){Ember.addListener(obj,beforeEvent(path),target,method);Ember.watch(obj,path);return this};Ember._suspendBeforeObserver=function(obj,path,target,method,callback){return Ember._suspendListener(obj,beforeEvent(path),target,method,callback)};Ember._suspendObserver=function(obj,path,target,method,callback){return Ember._suspendListener(obj,changeEvent(path),target,method,callback)};var map=Ember.ArrayPolyfills.map;Ember._suspendBeforeObservers=function(obj,paths,target,method,callback){var events=map.call(paths,beforeEvent);return Ember._suspendListeners(obj,events,target,method,callback)};Ember._suspendObservers=function(obj,paths,target,method,callback){var events=map.call(paths,changeEvent);return Ember._suspendListeners(obj,events,target,method,callback)};Ember.beforeObserversFor=function(obj,path){return Ember.listenersFor(obj,beforeEvent(path))};Ember.removeBeforeObserver=function(obj,path,target,method){Ember.unwatch(obj,path);Ember.removeListener(obj,beforeEvent(path),target,method);return this};Ember.notifyBeforeObservers=function(obj,keyName){if(obj.isDestroying){return}var eventName=beforeEvent(keyName),listeners,listenersDiff;if(deferred){listeners=beforeObserverSet.add(obj,keyName,eventName);listenersDiff=Ember.listenersDiff(obj,eventName,listeners);Ember.sendEvent(obj,eventName,[obj,keyName],listenersDiff)}else{Ember.sendEvent(obj,eventName,[obj,keyName])}};Ember.notifyObservers=function(obj,keyName){if(obj.isDestroying){return}var eventName=changeEvent(keyName),listeners;if(deferred){listeners=observerSet.add(obj,keyName,eventName);Ember.listenersUnion(obj,eventName,listeners)}else{Ember.sendEvent(obj,eventName,[obj,keyName])}}})();(function(){var guidFor=Ember.guidFor,metaFor=Ember.meta,get=Ember.get,set=Ember.set,normalizeTuple=Ember.normalizeTuple,GUID_KEY=Ember.GUID_KEY,META_KEY=Ember.META_KEY,forEach=Ember.ArrayPolyfills.forEach,FIRST_KEY=/^([^\.\*]+)/,IS_PATH=/[\.\*]/;var MANDATORY_SETTER=Ember.ENV.MANDATORY_SETTER,o_defineProperty=Ember.platform.defineProperty;function firstKey(path){return path.match(FIRST_KEY)[0]}function isKeyName(path){return path==="*"||!IS_PATH.test(path)}function iterDeps(method,obj,depKey,seen,meta){var guid=guidFor(obj);if(!seen[guid])seen[guid]={};if(seen[guid][depKey])return;seen[guid][depKey]=true;var deps=meta.deps;deps=deps&&deps[depKey];if(deps){for(var key in deps){var desc=meta.descs[key];if(desc&&desc._suspended===obj)continue;method(obj,key)}}}var WILL_SEEN,DID_SEEN;function dependentKeysWillChange(obj,depKey,meta){if(obj.isDestroying){return}var seen=WILL_SEEN,top=!seen;if(top){seen=WILL_SEEN={}}iterDeps(propertyWillChange,obj,depKey,seen,meta);if(top){WILL_SEEN=null}}function dependentKeysDidChange(obj,depKey,meta){if(obj.isDestroying){return}var seen=DID_SEEN,top=!seen;if(top){seen=DID_SEEN={}}iterDeps(propertyDidChange,obj,depKey,seen,meta);if(top){DID_SEEN=null}}function addChainWatcher(obj,keyName,node){if(!obj||"object"!==typeof obj){return}var m=metaFor(obj),nodes=m.chainWatchers;if(!m.hasOwnProperty("chainWatchers")){nodes=m.chainWatchers={}}if(!nodes[keyName]){nodes[keyName]=[]}nodes[keyName].push(node);Ember.watch(obj,keyName)}function removeChainWatcher(obj,keyName,node){if(!obj||"object"!==typeof obj){return}var m=metaFor(obj,false);if(!m.hasOwnProperty("chainWatchers")){return}var nodes=m.chainWatchers;if(nodes[keyName]){nodes=nodes[keyName];for(var i=0,l=nodes.length;i<l;i++){if(nodes[i]===node){nodes.splice(i,1)}}}Ember.unwatch(obj,keyName)}var pendingQueue=[];function flushPendingChains(){if(pendingQueue.length===0){return}var queue=pendingQueue;pendingQueue=[];forEach.call(queue,function(q){q[0].add(q[1])});Ember.warn("Watching an undefined global, Ember expects watched globals to be setup by the time the run loop is flushed, check for typos",pendingQueue.length===0)}function isProto(pvalue){return metaFor(pvalue,false).proto===pvalue}var ChainNode=function(parent,key,value){var obj;this._parent=parent;this._key=key;this._watching=value===undefined;this._value=value;this._paths={};if(this._watching){this._object=parent.value();if(this._object){addChainWatcher(this._object,this._key,this)}}if(this._parent&&this._parent._key==="@each"){this.value()}};var ChainNodePrototype=ChainNode.prototype;ChainNodePrototype.value=function(){if(this._value===undefined&&this._watching){var obj=this._parent.value();this._value=obj&&!isProto(obj)?get(obj,this._key):undefined}return this._value};ChainNodePrototype.destroy=function(){if(this._watching){var obj=this._object;if(obj){removeChainWatcher(obj,this._key,this)}this._watching=false}};ChainNodePrototype.copy=function(obj){var ret=new ChainNode(null,null,obj),paths=this._paths,path;for(path in paths){if(paths[path]<=0){continue}ret.add(path)}return ret};ChainNodePrototype.add=function(path){var obj,tuple,key,src,paths;paths=this._paths;paths[path]=(paths[path]||0)+1;obj=this.value();tuple=normalizeTuple(obj,path);if(tuple[0]&&tuple[0]===obj){path=tuple[1];key=firstKey(path);path=path.slice(key.length+1)}else if(!tuple[0]){pendingQueue.push([this,path]);tuple.length=0;return}else{src=tuple[0];key=path.slice(0,0-(tuple[1].length+1));path=tuple[1]}tuple.length=0;this.chain(key,path,src)};ChainNodePrototype.remove=function(path){var obj,tuple,key,src,paths;paths=this._paths;if(paths[path]>0){paths[path]--}obj=this.value();tuple=normalizeTuple(obj,path);if(tuple[0]===obj){path=tuple[1];key=firstKey(path);path=path.slice(key.length+1)}else{src=tuple[0];key=path.slice(0,0-(tuple[1].length+1));path=tuple[1]}tuple.length=0;this.unchain(key,path)};ChainNodePrototype.count=0;ChainNodePrototype.chain=function(key,path,src){var chains=this._chains,node;if(!chains){chains=this._chains={}}node=chains[key];if(!node){node=chains[key]=new ChainNode(this,key,src)
}node.count++;if(path&&path.length>0){key=firstKey(path);path=path.slice(key.length+1);node.chain(key,path)}};ChainNodePrototype.unchain=function(key,path){var chains=this._chains,node=chains[key];if(path&&path.length>1){key=firstKey(path);path=path.slice(key.length+1);node.unchain(key,path)}node.count--;if(node.count<=0){delete chains[node._key];node.destroy()}};ChainNodePrototype.willChange=function(){var chains=this._chains;if(chains){for(var key in chains){if(!chains.hasOwnProperty(key)){continue}chains[key].willChange()}}if(this._parent){this._parent.chainWillChange(this,this._key,1)}};ChainNodePrototype.chainWillChange=function(chain,path,depth){if(this._key){path=this._key+"."+path}if(this._parent){this._parent.chainWillChange(this,path,depth+1)}else{if(depth>1){Ember.propertyWillChange(this.value(),path)}path="this."+path;if(this._paths[path]>0){Ember.propertyWillChange(this.value(),path)}}};ChainNodePrototype.chainDidChange=function(chain,path,depth){if(this._key){path=this._key+"."+path}if(this._parent){this._parent.chainDidChange(this,path,depth+1)}else{if(depth>1){Ember.propertyDidChange(this.value(),path)}path="this."+path;if(this._paths[path]>0){Ember.propertyDidChange(this.value(),path)}}};ChainNodePrototype.didChange=function(suppressEvent){if(this._watching){var obj=this._parent.value();if(obj!==this._object){removeChainWatcher(this._object,this._key,this);this._object=obj;addChainWatcher(obj,this._key,this)}this._value=undefined;if(this._parent&&this._parent._key==="@each")this.value()}var chains=this._chains;if(chains){for(var key in chains){if(!chains.hasOwnProperty(key)){continue}chains[key].didChange(suppressEvent)}}if(suppressEvent){return}if(this._parent){this._parent.chainDidChange(this,this._key,1)}};function chainsFor(obj){var m=metaFor(obj),ret=m.chains;if(!ret){ret=m.chains=new ChainNode(null,null,obj)}else if(ret.value()!==obj){ret=m.chains=ret.copy(obj)}return ret}Ember.overrideChains=function(obj,keyName,m){chainsDidChange(obj,keyName,m,true)};function chainsWillChange(obj,keyName,m,arg){if(!m.hasOwnProperty("chainWatchers")){return}var nodes=m.chainWatchers;nodes=nodes[keyName];if(!nodes){return}for(var i=0,l=nodes.length;i<l;i++){nodes[i].willChange(arg)}}function chainsDidChange(obj,keyName,m,arg){if(!m.hasOwnProperty("chainWatchers")){return}var nodes=m.chainWatchers;nodes=nodes[keyName];if(!nodes){return}for(var i=nodes.length-1;i>=0;i--){nodes[i].didChange(arg)}}Ember.watch=function(obj,keyName){if(keyName==="length"&&Ember.typeOf(obj)==="array"){return this}var m=metaFor(obj),watching=m.watching,desc;if(!watching[keyName]){watching[keyName]=1;if(isKeyName(keyName)){desc=m.descs[keyName];if(desc&&desc.willWatch){desc.willWatch(obj,keyName)}if("function"===typeof obj.willWatchProperty){obj.willWatchProperty(keyName)}if(MANDATORY_SETTER&&keyName in obj){m.values[keyName]=obj[keyName];o_defineProperty(obj,keyName,{configurable:true,enumerable:true,set:Ember.MANDATORY_SETTER_FUNCTION,get:Ember.DEFAULT_GETTER_FUNCTION(keyName)})}}else{chainsFor(obj).add(keyName)}}else{watching[keyName]=(watching[keyName]||0)+1}return this};Ember.isWatching=function isWatching(obj,key){var meta=obj[META_KEY];return(meta&&meta.watching[key])>0};Ember.watch.flushPending=flushPendingChains;Ember.unwatch=function(obj,keyName){if(keyName==="length"&&Ember.typeOf(obj)==="array"){return this}var m=metaFor(obj),watching=m.watching,desc;if(watching[keyName]===1){watching[keyName]=0;if(isKeyName(keyName)){desc=m.descs[keyName];if(desc&&desc.didUnwatch){desc.didUnwatch(obj,keyName)}if("function"===typeof obj.didUnwatchProperty){obj.didUnwatchProperty(keyName)}if(MANDATORY_SETTER&&keyName in obj){o_defineProperty(obj,keyName,{configurable:true,enumerable:true,writable:true,value:m.values[keyName]});delete m.values[keyName]}}else{chainsFor(obj).remove(keyName)}}else if(watching[keyName]>1){watching[keyName]--}return this};Ember.rewatch=function(obj){var m=metaFor(obj,false),chains=m.chains;if(GUID_KEY in obj&&!obj.hasOwnProperty(GUID_KEY)){Ember.generateGuid(obj,"ember")}if(chains&&chains.value()!==obj){m.chains=chains.copy(obj)}return this};Ember.finishChains=function(obj){var m=metaFor(obj,false),chains=m.chains;if(chains){if(chains.value()!==obj){m.chains=chains=chains.copy(obj)}chains.didChange(true)}};function propertyWillChange(obj,keyName){var m=metaFor(obj,false),watching=m.watching[keyName]>0||keyName==="length",proto=m.proto,desc=m.descs[keyName];if(!watching){return}if(proto===obj){return}if(desc&&desc.willChange){desc.willChange(obj,keyName)}dependentKeysWillChange(obj,keyName,m);chainsWillChange(obj,keyName,m);Ember.notifyBeforeObservers(obj,keyName)}Ember.propertyWillChange=propertyWillChange;function propertyDidChange(obj,keyName){var m=metaFor(obj,false),watching=m.watching[keyName]>0||keyName==="length",proto=m.proto,desc=m.descs[keyName];if(proto===obj){return}if(desc&&desc.didChange){desc.didChange(obj,keyName)}if(!watching&&keyName!=="length"){return}dependentKeysDidChange(obj,keyName,m);chainsDidChange(obj,keyName,m);Ember.notifyObservers(obj,keyName)}Ember.propertyDidChange=propertyDidChange;var NODE_STACK=[];Ember.destroy=function(obj){var meta=obj[META_KEY],node,nodes,key,nodeObject;if(meta){obj[META_KEY]=null;node=meta.chains;if(node){NODE_STACK.push(node);while(NODE_STACK.length>0){node=NODE_STACK.pop();nodes=node._chains;if(nodes){for(key in nodes){if(nodes.hasOwnProperty(key)){NODE_STACK.push(nodes[key])}}}if(node._watching){nodeObject=node._object;if(nodeObject){removeChainWatcher(nodeObject,node._key,node)}}}}}}})();(function(){Ember.warn("The CP_DEFAULT_CACHEABLE flag has been removed and computed properties are always cached by default. Use `volatile` if you don't want caching.",Ember.ENV.CP_DEFAULT_CACHEABLE!==false);var get=Ember.get,set=Ember.set,metaFor=Ember.meta,a_slice=[].slice,o_create=Ember.create,META_KEY=Ember.META_KEY,watch=Ember.watch,unwatch=Ember.unwatch;function keysForDep(obj,depsMeta,depKey){var keys=depsMeta[depKey];if(!keys){keys=depsMeta[depKey]={}}else if(!depsMeta.hasOwnProperty(depKey)){keys=depsMeta[depKey]=o_create(keys)}return keys}function metaForDeps(obj,meta){return keysForDep(obj,meta,"deps")}function addDependentKeys(desc,obj,keyName,meta){var depKeys=desc._dependentKeys,depsMeta,idx,len,depKey,keys;if(!depKeys)return;depsMeta=metaForDeps(obj,meta);for(idx=0,len=depKeys.length;idx<len;idx++){depKey=depKeys[idx];keys=keysForDep(obj,depsMeta,depKey);keys[keyName]=(keys[keyName]||0)+1;watch(obj,depKey)}}function removeDependentKeys(desc,obj,keyName,meta){var depKeys=desc._dependentKeys,depsMeta,idx,len,depKey,keys;if(!depKeys)return;depsMeta=metaForDeps(obj,meta);for(idx=0,len=depKeys.length;idx<len;idx++){depKey=depKeys[idx];keys=keysForDep(obj,depsMeta,depKey);keys[keyName]=(keys[keyName]||0)-1;unwatch(obj,depKey)}}function ComputedProperty(func,opts){this.func=func;this._cacheable=opts&&opts.cacheable!==undefined?opts.cacheable:true;this._dependentKeys=opts&&opts.dependentKeys;this._readOnly=opts&&(opts.readOnly!==undefined||!!opts.readOnly)}Ember.ComputedProperty=ComputedProperty;ComputedProperty.prototype=new Ember.Descriptor;var ComputedPropertyPrototype=ComputedProperty.prototype;ComputedPropertyPrototype.cacheable=function(aFlag){this._cacheable=aFlag!==false;return this};ComputedPropertyPrototype.volatile=function(){return this.cacheable(false)};ComputedPropertyPrototype.readOnly=function(readOnly){this._readOnly=readOnly===undefined||!!readOnly;return this};ComputedPropertyPrototype.property=function(){var args=[];for(var i=0,l=arguments.length;i<l;i++){args.push(arguments[i])}this._dependentKeys=args;return this};ComputedPropertyPrototype.meta=function(meta){if(arguments.length===0){return this._meta||{}}else{this._meta=meta;return this}};ComputedPropertyPrototype.willWatch=function(obj,keyName){var meta=obj[META_KEY];Ember.assert("watch should have setup meta to be writable",meta.source===obj);if(!(keyName in meta.cache)){addDependentKeys(this,obj,keyName,meta)}};ComputedPropertyPrototype.didUnwatch=function(obj,keyName){var meta=obj[META_KEY];Ember.assert("unwatch should have setup meta to be writable",meta.source===obj);if(!(keyName in meta.cache)){removeDependentKeys(this,obj,keyName,meta)}};ComputedPropertyPrototype.didChange=function(obj,keyName){if(this._cacheable&&this._suspended!==obj){var meta=metaFor(obj);if(keyName in meta.cache){delete meta.cache[keyName];if(!meta.watching[keyName]){removeDependentKeys(this,obj,keyName,meta)}}}};ComputedPropertyPrototype.get=function(obj,keyName){var ret,cache,meta;if(this._cacheable){meta=metaFor(obj);cache=meta.cache;if(keyName in cache){return cache[keyName]}ret=cache[keyName]=this.func.call(obj,keyName);if(!meta.watching[keyName]){addDependentKeys(this,obj,keyName,meta)}}else{ret=this.func.call(obj,keyName)}return ret};ComputedPropertyPrototype.set=function(obj,keyName,value){var cacheable=this._cacheable,func=this.func,meta=metaFor(obj,cacheable),watched=meta.watching[keyName],oldSuspended=this._suspended,hadCachedValue=false,cache=meta.cache,cachedValue,ret;if(this._readOnly){throw new Error("Cannot Set: "+keyName+" on: "+obj.toString())}this._suspended=obj;try{if(cacheable&&cache.hasOwnProperty(keyName)){cachedValue=cache[keyName];hadCachedValue=true}if(func.wrappedFunction){func=func.wrappedFunction}if(func.length===3){ret=func.call(obj,keyName,value,cachedValue)}else if(func.length===2){ret=func.call(obj,keyName,value)}else{Ember.defineProperty(obj,keyName,null,cachedValue);Ember.set(obj,keyName,value);return}if(hadCachedValue&&cachedValue===ret){return}if(watched){Ember.propertyWillChange(obj,keyName)}if(hadCachedValue){delete cache[keyName]}if(cacheable){if(!watched&&!hadCachedValue){addDependentKeys(this,obj,keyName,meta)}cache[keyName]=ret}if(watched){Ember.propertyDidChange(obj,keyName)}}finally{this._suspended=oldSuspended}return ret};ComputedPropertyPrototype.setup=function(obj,keyName){var meta=obj[META_KEY];if(meta&&meta.watching[keyName]){addDependentKeys(this,obj,keyName,metaFor(obj))}};ComputedPropertyPrototype.teardown=function(obj,keyName){var meta=metaFor(obj);if(meta.watching[keyName]||keyName in meta.cache){removeDependentKeys(this,obj,keyName,meta)}if(this._cacheable){delete meta.cache[keyName]}return null};Ember.computed=function(func){var args;if(arguments.length>1){args=a_slice.call(arguments,0,-1);func=a_slice.call(arguments,-1)[0]}if(typeof func!=="function"){throw new Error("Computed Property declared without a property function")}var cp=new ComputedProperty(func);if(args){cp.property.apply(cp,args)}return cp};Ember.cacheFor=function cacheFor(obj,key){var cache=metaFor(obj,false).cache;if(cache&&key in cache){return cache[key]}};Ember.computed.not=function(dependentKey){return Ember.computed(dependentKey,function(key){return!get(this,dependentKey)})};Ember.computed.none=function(dependentKey){return Ember.computed(dependentKey,function(key){var val=get(this,dependentKey);return Ember.isNone(val)})};Ember.computed.empty=function(dependentKey){return Ember.computed(dependentKey,function(key){var val=get(this,dependentKey);return Ember.isEmpty(val)})};Ember.computed.bool=function(dependentKey){return Ember.computed(dependentKey,function(key){return!!get(this,dependentKey)})};Ember.computed.alias=function(dependentKey){return Ember.computed(dependentKey,function(key,value){if(arguments.length>1){set(this,dependentKey,value);return value}else{return get(this,dependentKey)}})}})();(function(){var o_create=Ember.create,metaFor=Ember.meta,META_KEY=Ember.META_KEY;function indexOf(array,target,method){var index=-1;for(var i=0,l=array.length;i<l;i++){if(target===array[i][0]&&method===array[i][1]){index=i;break}}return index}function actionsFor(obj,eventName){var meta=metaFor(obj,true),actions;if(!meta.listeners){meta.listeners={}}if(!meta.hasOwnProperty("listeners")){meta.listeners=o_create(meta.listeners)}actions=meta.listeners[eventName];if(actions&&!meta.listeners.hasOwnProperty(eventName)){actions=meta.listeners[eventName]=meta.listeners[eventName].slice()}else if(!actions){actions=meta.listeners[eventName]=[]}return actions}function actionsUnion(obj,eventName,otherActions){var meta=obj[META_KEY],actions=meta&&meta.listeners&&meta.listeners[eventName];if(!actions){return}for(var i=actions.length-1;i>=0;i--){var target=actions[i][0],method=actions[i][1],once=actions[i][2],suspended=actions[i][3],actionIndex=indexOf(otherActions,target,method);if(actionIndex===-1){otherActions.push([target,method,once,suspended])}}}function actionsDiff(obj,eventName,otherActions){var meta=obj[META_KEY],actions=meta&&meta.listeners&&meta.listeners[eventName],diffActions=[];if(!actions){return}for(var i=actions.length-1;i>=0;i--){var target=actions[i][0],method=actions[i][1],once=actions[i][2],suspended=actions[i][3],actionIndex=indexOf(otherActions,target,method);if(actionIndex!==-1){continue}otherActions.push([target,method,once,suspended]);diffActions.push([target,method,once,suspended])}return diffActions}function addListener(obj,eventName,target,method,once){Ember.assert("You must pass at least an object and event name to Ember.addListener",!!obj&&!!eventName);if(!method&&"function"===typeof target){method=target;target=null}var actions=actionsFor(obj,eventName),actionIndex=indexOf(actions,target,method);if(actionIndex!==-1){return}actions.push([target,method,once,undefined]);if("function"===typeof obj.didAddListener){obj.didAddListener(eventName,target,method)}}function removeListener(obj,eventName,target,method){Ember.assert("You must pass at least an object and event name to Ember.removeListener",!!obj&&!!eventName);if(!method&&"function"===typeof target){method=target;target=null}function _removeListener(target,method,once){var actions=actionsFor(obj,eventName),actionIndex=indexOf(actions,target,method);if(actionIndex===-1){return}actions.splice(actionIndex,1);if("function"===typeof obj.didRemoveListener){obj.didRemoveListener(eventName,target,method)}}if(method){_removeListener(target,method)}else{var meta=obj[META_KEY],actions=meta&&meta.listeners&&meta.listeners[eventName];if(!actions){return}for(var i=actions.length-1;i>=0;i--){_removeListener(actions[i][0],actions[i][1])}}}function suspendListener(obj,eventName,target,method,callback){if(!method&&"function"===typeof target){method=target;target=null}var actions=actionsFor(obj,eventName),actionIndex=indexOf(actions,target,method),action;if(actionIndex!==-1){action=actions[actionIndex].slice();action[3]=true;actions[actionIndex]=action}function tryable(){return callback.call(target)}function finalizer(){if(action){action[3]=undefined}}return Ember.tryFinally(tryable,finalizer)}function suspendListeners(obj,eventNames,target,method,callback){if(!method&&"function"===typeof target){method=target;target=null}var suspendedActions=[],eventName,actions,action,i,l;for(i=0,l=eventNames.length;i<l;i++){eventName=eventNames[i];actions=actionsFor(obj,eventName);var actionIndex=indexOf(actions,target,method);if(actionIndex!==-1){action=actions[actionIndex].slice();action[3]=true;actions[actionIndex]=action;suspendedActions.push(action)}}function tryable(){return callback.call(target)}function finalizer(){for(i=0,l=suspendedActions.length;i<l;i++){suspendedActions[i][3]=undefined}}return Ember.tryFinally(tryable,finalizer)}function watchedEvents(obj){var listeners=obj[META_KEY].listeners,ret=[];if(listeners){for(var eventName in listeners){if(listeners[eventName]){ret.push(eventName)}}}return ret}function sendEvent(obj,eventName,params,actions){if(obj!==Ember&&"function"===typeof obj.sendEvent){obj.sendEvent(eventName,params)}if(!actions){var meta=obj[META_KEY];actions=meta&&meta.listeners&&meta.listeners[eventName]}if(!actions){return}for(var i=actions.length-1;i>=0;i--){if(!actions[i]||actions[i][3]===true){continue}var target=actions[i][0],method=actions[i][1],once=actions[i][2];if(once){removeListener(obj,eventName,target,method)}if(!target){target=obj}if("string"===typeof method){method=target[method]}if(params){method.apply(target,params)}else{method.apply(target)}}return true}function hasListeners(obj,eventName){var meta=obj[META_KEY],actions=meta&&meta.listeners&&meta.listeners[eventName];return!!(actions&&actions.length)}function listenersFor(obj,eventName){var ret=[];var meta=obj[META_KEY],actions=meta&&meta.listeners&&meta.listeners[eventName];if(!actions){return ret}for(var i=0,l=actions.length;i<l;i++){var target=actions[i][0],method=actions[i][1];ret.push([target,method])}return ret}Ember.addListener=addListener;Ember.removeListener=removeListener;Ember._suspendListener=suspendListener;Ember._suspendListeners=suspendListeners;Ember.sendEvent=sendEvent;Ember.hasListeners=hasListeners;Ember.watchedEvents=watchedEvents;Ember.listenersFor=listenersFor;Ember.listenersDiff=actionsDiff;Ember.listenersUnion=actionsUnion})();(function(){var slice=[].slice,forEach=Ember.ArrayPolyfills.forEach;function invoke(target,method,args,ignore){if(method===undefined){method=target;target=undefined}if("string"===typeof method){method=target[method]}if(args&&ignore>0){args=args.length>ignore?slice.call(args,ignore):null}return Ember.handleErrors(function(){return method.apply(target||this,args||[])},this)}var timerMark;var RunLoop=function(prev){this._prev=prev||null;this.onceTimers={}};RunLoop.prototype={end:function(){this.flush()},prev:function(){return this._prev},schedule:function(queueName,target,method){var queues=this._queues,queue;if(!queues){queues=this._queues={}}queue=queues[queueName];if(!queue){queue=queues[queueName]=[]}var args=arguments.length>3?slice.call(arguments,3):null;queue.push({target:target,method:method,args:args});return this},flush:function(queueName){var queueNames,idx,len,queue,log;if(!this._queues){return this}function iter(item){invoke(item.target,item.method,item.args)}function tryable(){forEach.call(queue,iter)}Ember.watch.flushPending();if(queueName){while(this._queues&&(queue=this._queues[queueName])){this._queues[queueName]=null;if(queueName==="sync"){log=Ember.LOG_BINDINGS;if(log){Ember.Logger.log("Begin: Flush Sync Queue")}Ember.beginPropertyChanges();Ember.tryFinally(tryable,Ember.endPropertyChanges);if(log){Ember.Logger.log("End: Flush Sync Queue")}}else{forEach.call(queue,iter)}}}else{queueNames=Ember.run.queues;len=queueNames.length;idx=0;outerloop:while(idx<len){queueName=queueNames[idx];queue=this._queues&&this._queues[queueName];delete this._queues[queueName];if(queue){if(queueName==="sync"){log=Ember.LOG_BINDINGS;if(log){Ember.Logger.log("Begin: Flush Sync Queue")}Ember.beginPropertyChanges();Ember.tryFinally(tryable,Ember.endPropertyChanges);if(log){Ember.Logger.log("End: Flush Sync Queue")}}else{forEach.call(queue,iter)}}for(var i=0;i<=idx;i++){if(this._queues&&this._queues[queueNames[i]]){idx=i;continue outerloop}}idx++}}timerMark=null;return this}};Ember.RunLoop=RunLoop;Ember.run=function(target,method){var args=arguments;run.begin();function tryable(){if(target||method){return invoke(target,method,args,2)}}return Ember.tryFinally(tryable,run.end)};var run=Ember.run;Ember.run.begin=function(){run.currentRunLoop=new RunLoop(run.currentRunLoop)};Ember.run.end=function(){Ember.assert("must have a current run loop",run.currentRunLoop);function tryable(){run.currentRunLoop.end()}function finalizer(){run.currentRunLoop=run.currentRunLoop.prev()}Ember.tryFinally(tryable,finalizer)};Ember.run.queues=["sync","actions","destroy"];Ember.run.schedule=function(queue,target,method){var loop=run.autorun();loop.schedule.apply(loop,arguments)};var scheduledAutorun;function autorun(){scheduledAutorun=null;if(run.currentRunLoop){run.end()}}Ember.run.hasScheduledTimers=function(){return!!(scheduledAutorun||scheduledLater)};Ember.run.cancelTimers=function(){if(scheduledAutorun){clearTimeout(scheduledAutorun);scheduledAutorun=null}if(scheduledLater){clearTimeout(scheduledLater);scheduledLater=null}timers={}};Ember.run.autorun=function(){if(!run.currentRunLoop){Ember.assert("You have turned on testing mode, which disabled the run-loop's autorun. You will need to wrap any code with asynchronous side-effects in an Ember.run",!Ember.testing);run.begin();if(!scheduledAutorun){scheduledAutorun=setTimeout(autorun,1)}}return run.currentRunLoop};Ember.run.sync=function(){run.autorun();run.currentRunLoop.flush("sync")};var timers={};var scheduledLater,scheduledLaterExpires;function invokeLaterTimers(){scheduledLater=null;run(function(){var now=+new Date,earliest=-1;for(var key in timers){if(!timers.hasOwnProperty(key)){continue}var timer=timers[key];if(timer&&timer.expires){if(now>=timer.expires){delete timers[key];invoke(timer.target,timer.method,timer.args,2)}else{if(earliest<0||timer.expires<earliest){earliest=timer.expires}}}}if(earliest>0){scheduledLater=setTimeout(invokeLaterTimers,earliest-now);scheduledLaterExpires=earliest}})}Ember.run.later=function(target,method){var args,expires,timer,guid,wait;if(arguments.length===2&&"function"===typeof target){wait=method;method=target;target=undefined;args=[target,method]}else{args=slice.call(arguments);wait=args.pop()}expires=+new Date+wait;timer={target:target,method:method,expires:expires,args:args};guid=Ember.guidFor(timer);timers[guid]=timer;if(scheduledLater&&expires<scheduledLaterExpires){clearTimeout(scheduledLater);scheduledLater=null}if(!scheduledLater){scheduledLater=setTimeout(invokeLaterTimers,wait);scheduledLaterExpires=expires}return guid};function invokeOnceTimer(guid,onceTimers){if(onceTimers[this.tguid]){delete onceTimers[this.tguid][this.mguid]}if(timers[guid]){invoke(this.target,this.method,this.args)}delete timers[guid]}function scheduleOnce(queue,target,method,args){var tguid=Ember.guidFor(target),mguid=Ember.guidFor(method),onceTimers=run.autorun().onceTimers,guid=onceTimers[tguid]&&onceTimers[tguid][mguid],timer;if(guid&&timers[guid]){timers[guid].args=args}else{timer={target:target,method:method,args:args,tguid:tguid,mguid:mguid};guid=Ember.guidFor(timer);timers[guid]=timer;if(!onceTimers[tguid]){onceTimers[tguid]={}}onceTimers[tguid][mguid]=guid;run.schedule(queue,timer,invokeOnceTimer,guid,onceTimers)}return guid}Ember.run.once=function(target,method){return scheduleOnce("actions",target,method,slice.call(arguments,2))};Ember.run.scheduleOnce=function(queue,target,method,args){return scheduleOnce(queue,target,method,slice.call(arguments,3))};Ember.run.next=function(){var args=slice.call(arguments);args.push(1);return run.later.apply(this,args)};Ember.run.cancel=function(timer){delete timers[timer]}})();(function(){Ember.LOG_BINDINGS=false||!!Ember.ENV.LOG_BINDINGS;var get=Ember.get,set=Ember.set,guidFor=Ember.guidFor,isGlobalPath=Ember.isGlobalPath;function getWithGlobals(obj,path){return get(isGlobalPath(path)?Ember.lookup:obj,path)}var Binding=function(toPath,fromPath){this._direction="fwd";this._from=fromPath;this._to=toPath;this._directionMap=Ember.Map.create()};Binding.prototype={copy:function(){var copy=new Binding(this._to,this._from);if(this._oneWay){copy._oneWay=true}return copy},from:function(path){this._from=path;return this},to:function(path){this._to=path;return this},oneWay:function(){this._oneWay=true;return this},toString:function(){var oneWay=this._oneWay?"[oneWay]":"";return"Ember.Binding<"+guidFor(this)+">("+this._from+" -> "+this._to+")"+oneWay},connect:function(obj){Ember.assert("Must pass a valid object to Ember.Binding.connect()",!!obj);var fromPath=this._from,toPath=this._to;Ember.trySet(obj,toPath,getWithGlobals(obj,fromPath));Ember.addObserver(obj,fromPath,this,this.fromDidChange);if(!this._oneWay){Ember.addObserver(obj,toPath,this,this.toDidChange)}this._readyToSync=true;return this},disconnect:function(obj){Ember.assert("Must pass a valid object to Ember.Binding.disconnect()",!!obj);var twoWay=!this._oneWay;Ember.removeObserver(obj,this._from,this,this.fromDidChange);if(twoWay){Ember.removeObserver(obj,this._to,this,this.toDidChange)}this._readyToSync=false;return this},fromDidChange:function(target){this._scheduleSync(target,"fwd")},toDidChange:function(target){this._scheduleSync(target,"back")},_scheduleSync:function(obj,dir){var directionMap=this._directionMap;var existingDir=directionMap.get(obj);if(!existingDir){Ember.run.schedule("sync",this,this._sync,obj);directionMap.set(obj,dir)}if(existingDir==="back"&&dir==="fwd"){directionMap.set(obj,"fwd")}},_sync:function(obj){var log=Ember.LOG_BINDINGS;if(obj.isDestroyed||!this._readyToSync){return}var directionMap=this._directionMap;var direction=directionMap.get(obj);var fromPath=this._from,toPath=this._to;directionMap.remove(obj);if(direction==="fwd"){var fromValue=getWithGlobals(obj,this._from);if(log){Ember.Logger.log(" ",this.toString(),"->",fromValue,obj)}if(this._oneWay){Ember.trySet(obj,toPath,fromValue)}else{Ember._suspendObserver(obj,toPath,this,this.toDidChange,function(){Ember.trySet(obj,toPath,fromValue)})}}else if(direction==="back"){var toValue=get(obj,this._to);if(log){Ember.Logger.log(" ",this.toString(),"<-",toValue,obj)}Ember._suspendObserver(obj,fromPath,this,this.fromDidChange,function(){Ember.trySet(Ember.isGlobalPath(fromPath)?Ember.lookup:obj,fromPath,toValue)})}}};function mixinProperties(to,from){for(var key in from){if(from.hasOwnProperty(key)){to[key]=from[key]}}}mixinProperties(Binding,{from:function(){var C=this,binding=new C;return binding.from.apply(binding,arguments)},to:function(){var C=this,binding=new C;return binding.to.apply(binding,arguments)},oneWay:function(from,flag){var C=this,binding=new C(null,from);return binding.oneWay(flag)}});Ember.Binding=Binding;Ember.bind=function(obj,to,from){return new Ember.Binding(to,from).connect(obj)};Ember.oneWay=function(obj,to,from){return new Ember.Binding(to,from).oneWay().connect(obj)}})();(function(){var Mixin,REQUIRED,Alias,a_map=Ember.ArrayPolyfills.map,a_indexOf=Ember.ArrayPolyfills.indexOf,a_forEach=Ember.ArrayPolyfills.forEach,a_slice=[].slice,o_create=Ember.create,defineProperty=Ember.defineProperty,guidFor=Ember.guidFor;function mixinsMeta(obj){var m=Ember.meta(obj,true),ret=m.mixins;if(!ret){ret=m.mixins={}}else if(!m.hasOwnProperty("mixins")){ret=m.mixins=o_create(ret)}return ret}function initMixin(mixin,args){if(args&&args.length>0){mixin.mixins=a_map.call(args,function(x){if(x instanceof Mixin){return x}var mixin=new Mixin;mixin.properties=x;return mixin})}return mixin}function isMethod(obj){return"function"===typeof obj&&obj.isMethod!==false&&obj!==Boolean&&obj!==Object&&obj!==Number&&obj!==Array&&obj!==Date&&obj!==String}var CONTINUE={};function mixinProperties(mixinsMeta,mixin){var guid;if(mixin instanceof Mixin){guid=guidFor(mixin);if(mixinsMeta[guid]){return CONTINUE}mixinsMeta[guid]=mixin;return mixin.properties}else{return mixin}}function concatenatedProperties(props,values,base){var concats;concats=values.concatenatedProperties||base.concatenatedProperties;if(props.concatenatedProperties){concats=concats?concats.concat(props.concatenatedProperties):props.concatenatedProperties}return concats}function giveDescriptorSuper(meta,key,property,values,descs){var superProperty;if(values[key]===undefined){superProperty=descs[key]}superProperty=superProperty||meta.descs[key];if(!superProperty||!(superProperty instanceof Ember.ComputedProperty)){return property}property=o_create(property);property.func=Ember.wrap(property.func,superProperty.func);return property}function giveMethodSuper(obj,key,method,values,descs){var superMethod;if(descs[key]===undefined){superMethod=values[key]}superMethod=superMethod||obj[key];if("function"!==typeof superMethod){return method}return Ember.wrap(method,superMethod)}function applyConcatenatedProperties(obj,key,value,values){var baseValue=values[key]||obj[key];if(baseValue){if("function"===typeof baseValue.concat){return baseValue.concat(value)}else{return Ember.makeArray(baseValue).concat(value)}}else{return Ember.makeArray(value)}}function addNormalizedProperty(base,key,value,meta,descs,values,concats){if(value instanceof Ember.Descriptor){if(value===REQUIRED&&descs[key]){return CONTINUE}if(value.func){value=giveDescriptorSuper(meta,key,value,values,descs)}descs[key]=value;values[key]=undefined}else{if(isMethod(value)){value=giveMethodSuper(base,key,value,values,descs)}else if(concats&&a_indexOf.call(concats,key)>=0||key==="concatenatedProperties"){value=applyConcatenatedProperties(base,key,value,values)}descs[key]=undefined;values[key]=value}}function mergeMixins(mixins,m,descs,values,base){var mixin,props,key,concats,meta;function removeKeys(keyName){delete descs[keyName];delete values[keyName]}for(var i=0,l=mixins.length;i<l;i++){mixin=mixins[i];Ember.assert("Expected hash or Mixin instance, got "+Object.prototype.toString.call(mixin),typeof mixin==="object"&&mixin!==null&&Object.prototype.toString.call(mixin)!=="[object Array]");props=mixinProperties(m,mixin);if(props===CONTINUE){continue}if(props){meta=Ember.meta(base);concats=concatenatedProperties(props,values,base);for(key in props){if(!props.hasOwnProperty(key)){continue}addNormalizedProperty(base,key,props[key],meta,descs,values,concats)}if(props.hasOwnProperty("toString")){base.toString=props.toString}}else if(mixin.mixins){mergeMixins(mixin.mixins,m,descs,values,base);if(mixin._without){a_forEach.call(mixin._without,removeKeys)}}}}function writableReq(obj){var m=Ember.meta(obj),req=m.required;if(!req||!m.hasOwnProperty("required")){req=m.required=req?o_create(req):{}}return req}var IS_BINDING=Ember.IS_BINDING=/^.+Binding$/;function detectBinding(obj,key,value,m){if(IS_BINDING.test(key)){var bindings=m.bindings;if(!bindings){bindings=m.bindings={}}else if(!m.hasOwnProperty("bindings")){bindings=m.bindings=o_create(m.bindings)}bindings[key]=value}}function connectBindings(obj,m){var bindings=m.bindings,key,binding,to;if(bindings){for(key in bindings){binding=bindings[key];if(binding){to=key.slice(0,-7);if(binding instanceof Ember.Binding){binding=binding.copy();binding.to(to)}else{binding=new Ember.Binding(to,binding)}binding.connect(obj);obj[key]=binding}}m.bindings={}}}function finishPartial(obj,m){connectBindings(obj,m||Ember.meta(obj));return obj}function followAlias(obj,desc,m,descs,values){var altKey=desc.methodName,value;if(descs[altKey]||values[altKey]){value=values[altKey];desc=descs[altKey]}else if(m.descs[altKey]){desc=m.descs[altKey];value=undefined}else{desc=undefined;value=obj[altKey]}return{desc:desc,value:value}}function updateObservers(obj,key,observer,observerKey,method){if("function"!==typeof observer){return}var paths=observer[observerKey];if(paths){for(var i=0,l=paths.length;i<l;i++){Ember[method](obj,paths[i],null,key)}}}function replaceObservers(obj,key,observer){var prevObserver=obj[key];updateObservers(obj,key,prevObserver,"__ember_observesBefore__","removeBeforeObserver");updateObservers(obj,key,prevObserver,"__ember_observes__","removeObserver");updateObservers(obj,key,observer,"__ember_observesBefore__","addBeforeObserver");updateObservers(obj,key,observer,"__ember_observes__","addObserver")}function applyMixin(obj,mixins,partial){var descs={},values={},m=Ember.meta(obj),key,value,desc;mergeMixins(mixins,mixinsMeta(obj),descs,values,obj);for(key in values){if(key==="contructor"||!values.hasOwnProperty(key)){continue}desc=descs[key];value=values[key];if(desc===REQUIRED){continue}while(desc&&desc instanceof Alias){var followed=followAlias(obj,desc,m,descs,values);desc=followed.desc;value=followed.value}if(desc===undefined&&value===undefined){continue}replaceObservers(obj,key,value);detectBinding(obj,key,value,m);defineProperty(obj,key,desc,value,m)}if(!partial){finishPartial(obj,m)}return obj}Ember.mixin=function(obj){var args=a_slice.call(arguments,1);applyMixin(obj,args,false);return obj};Ember.Mixin=function(){return initMixin(this,arguments)};Mixin=Ember.Mixin;Mixin._apply=applyMixin;Mixin.applyPartial=function(obj){var args=a_slice.call(arguments,1);return applyMixin(obj,args,true)};Mixin.finishPartial=finishPartial;Ember.anyUnprocessedMixins=false;Mixin.create=function(){Ember.anyUnprocessedMixins=true;var M=this;return initMixin(new M,arguments)
};var MixinPrototype=Mixin.prototype;MixinPrototype.reopen=function(){var mixin,tmp;if(this.properties){mixin=Mixin.create();mixin.properties=this.properties;delete this.properties;this.mixins=[mixin]}else if(!this.mixins){this.mixins=[]}var len=arguments.length,mixins=this.mixins,idx;for(idx=0;idx<len;idx++){mixin=arguments[idx];Ember.assert("Expected hash or Mixin instance, got "+Object.prototype.toString.call(mixin),typeof mixin==="object"&&mixin!==null&&Object.prototype.toString.call(mixin)!=="[object Array]");if(mixin instanceof Mixin){mixins.push(mixin)}else{tmp=Mixin.create();tmp.properties=mixin;mixins.push(tmp)}}return this};MixinPrototype.apply=function(obj){return applyMixin(obj,[this],false)};MixinPrototype.applyPartial=function(obj){return applyMixin(obj,[this],true)};function _detect(curMixin,targetMixin,seen){var guid=guidFor(curMixin);if(seen[guid]){return false}seen[guid]=true;if(curMixin===targetMixin){return true}var mixins=curMixin.mixins,loc=mixins?mixins.length:0;while(--loc>=0){if(_detect(mixins[loc],targetMixin,seen)){return true}}return false}MixinPrototype.detect=function(obj){if(!obj){return false}if(obj instanceof Mixin){return _detect(obj,this,{})}var mixins=Ember.meta(obj,false).mixins;if(mixins){return!!mixins[guidFor(this)]}return false};MixinPrototype.without=function(){var ret=new Mixin(this);ret._without=a_slice.call(arguments);return ret};function _keys(ret,mixin,seen){if(seen[guidFor(mixin)]){return}seen[guidFor(mixin)]=true;if(mixin.properties){var props=mixin.properties;for(var key in props){if(props.hasOwnProperty(key)){ret[key]=true}}}else if(mixin.mixins){a_forEach.call(mixin.mixins,function(x){_keys(ret,x,seen)})}}MixinPrototype.keys=function(){var keys={},seen={},ret=[];_keys(keys,this,seen);for(var key in keys){if(keys.hasOwnProperty(key)){ret.push(key)}}return ret};Mixin.mixins=function(obj){var mixins=Ember.meta(obj,false).mixins,ret=[];if(!mixins){return ret}for(var key in mixins){var mixin=mixins[key];if(!mixin.properties){ret.push(mixin)}}return ret};REQUIRED=new Ember.Descriptor;REQUIRED.toString=function(){return"(Required Property)"};Ember.required=function(){return REQUIRED};Alias=function(methodName){this.methodName=methodName};Alias.prototype=new Ember.Descriptor;Ember.alias=function(methodName){return new Alias(methodName)};Ember.deprecateFunc("Ember.alias is deprecated. Please use Ember.aliasMethod or Ember.computed.alias instead.",Ember.alias);Ember.aliasMethod=function(methodName){return new Alias(methodName)};Ember.observer=function(func){var paths=a_slice.call(arguments,1);func.__ember_observes__=paths;return func};Ember.immediateObserver=function(){for(var i=0,l=arguments.length;i<l;i++){var arg=arguments[i];Ember.assert("Immediate observers must observe internal properties only, not properties on other objects.",typeof arg!=="string"||arg.indexOf(".")===-1)}return Ember.observer.apply(this,arguments)};Ember.beforeObserver=function(func){var paths=a_slice.call(arguments,1);func.__ember_observesBefore__=paths;return func}})();(function(){})();(function(){define("rsvp",[],function(){"use strict";var browserGlobal=typeof window!=="undefined"?window:{};var MutationObserver=browserGlobal.MutationObserver||browserGlobal.WebKitMutationObserver;var RSVP,async;if(typeof process!=="undefined"&&{}.toString.call(process)==="[object process]"){async=function(callback,binding){process.nextTick(function(){callback.call(binding)})}}else if(MutationObserver){var queue=[];var observer=new MutationObserver(function(){var toProcess=queue.slice();queue=[];toProcess.forEach(function(tuple){var callback=tuple[0],binding=tuple[1];callback.call(binding)})});var element=document.createElement("div");observer.observe(element,{attributes:true});window.addEventListener("unload",function(){observer.disconnect();observer=null});async=function(callback,binding){queue.push([callback,binding]);element.setAttribute("drainQueue","drainQueue")}}else{async=function(callback,binding){setTimeout(function(){callback.call(binding)},1)}}var Event=function(type,options){this.type=type;for(var option in options){if(!options.hasOwnProperty(option)){continue}this[option]=options[option]}};var indexOf=function(callbacks,callback){for(var i=0,l=callbacks.length;i<l;i++){if(callbacks[i][0]===callback){return i}}return-1};var callbacksFor=function(object){var callbacks=object._promiseCallbacks;if(!callbacks){callbacks=object._promiseCallbacks={}}return callbacks};var EventTarget={mixin:function(object){object.on=this.on;object.off=this.off;object.trigger=this.trigger;return object},on:function(eventNames,callback,binding){var allCallbacks=callbacksFor(this),callbacks,eventName;eventNames=eventNames.split(/\s+/);binding=binding||this;while(eventName=eventNames.shift()){callbacks=allCallbacks[eventName];if(!callbacks){callbacks=allCallbacks[eventName]=[]}if(indexOf(callbacks,callback)===-1){callbacks.push([callback,binding])}}},off:function(eventNames,callback){var allCallbacks=callbacksFor(this),callbacks,eventName,index;eventNames=eventNames.split(/\s+/);while(eventName=eventNames.shift()){if(!callback){allCallbacks[eventName]=[];continue}callbacks=allCallbacks[eventName];index=indexOf(callbacks,callback);if(index!==-1){callbacks.splice(index,1)}}},trigger:function(eventName,options){var allCallbacks=callbacksFor(this),callbacks,callbackTuple,callback,binding,event;if(callbacks=allCallbacks[eventName]){for(var i=0;i<callbacks.length;i++){callbackTuple=callbacks[i];callback=callbackTuple[0];binding=callbackTuple[1];if(typeof options!=="object"){options={detail:options}}event=new Event(eventName,options);callback.call(binding,event)}}}};var Promise=function(){this.on("promise:resolved",function(event){this.trigger("success",{detail:event.detail})},this);this.on("promise:failed",function(event){this.trigger("error",{detail:event.detail})},this)};var noop=function(){};var invokeCallback=function(type,promise,callback,event){var hasCallback=typeof callback==="function",value,error,succeeded,failed;if(hasCallback){try{value=callback(event.detail);succeeded=true}catch(e){failed=true;error=e}}else{value=event.detail;succeeded=true}if(value&&typeof value.then==="function"){value.then(function(value){promise.resolve(value)},function(error){promise.reject(error)})}else if(hasCallback&&succeeded){promise.resolve(value)}else if(failed){promise.reject(error)}else{promise[type](value)}};Promise.prototype={then:function(done,fail){var thenPromise=new Promise;if(this.isResolved){RSVP.async(function(){invokeCallback("resolve",thenPromise,done,{detail:this.resolvedValue})},this)}if(this.isRejected){RSVP.async(function(){invokeCallback("reject",thenPromise,fail,{detail:this.rejectedValue})},this)}this.on("promise:resolved",function(event){invokeCallback("resolve",thenPromise,done,event)});this.on("promise:failed",function(event){invokeCallback("reject",thenPromise,fail,event)});return thenPromise},resolve:function(value){resolve(this,value);this.resolve=noop;this.reject=noop},reject:function(value){reject(this,value);this.resolve=noop;this.reject=noop}};function resolve(promise,value){RSVP.async(function(){promise.trigger("promise:resolved",{detail:value});promise.isResolved=true;promise.resolvedValue=value})}function reject(promise,value){RSVP.async(function(){promise.trigger("promise:failed",{detail:value});promise.isRejected=true;promise.rejectedValue=value})}function all(promises){var i,results=[];var allPromise=new Promise;var remaining=promises.length;if(remaining===0){allPromise.resolve([])}var resolver=function(index){return function(value){resolve(index,value)}};var resolve=function(index,value){results[index]=value;if(--remaining===0){allPromise.resolve(results)}};var reject=function(error){allPromise.reject(error)};for(i=0;i<remaining;i++){promises[i].then(resolver(i),reject)}return allPromise}EventTarget.mixin(Promise.prototype);RSVP={async:async,Promise:Promise,Event:Event,EventTarget:EventTarget,all:all,raiseOnUncaughtExceptions:true};return RSVP})})();(function(){define("container",[],function(){function InheritingDict(parent){this.parent=parent;this.dict={}}InheritingDict.prototype={get:function(key){var dict=this.dict;if(dict.hasOwnProperty(key)){return dict[key]}if(this.parent){return this.parent.get(key)}},set:function(key,value){this.dict[key]=value},has:function(key){var dict=this.dict;if(dict.hasOwnProperty(key)){return true}if(this.parent){return this.parent.has(key)}return false},eachLocal:function(callback,binding){var dict=this.dict;for(var prop in dict){if(dict.hasOwnProperty(prop)){callback.call(binding,prop,dict[prop])}}}};function Container(parent){this.parent=parent;this.children=[];this.resolver=parent&&parent.resolver||function(){};this.registry=new InheritingDict(parent&&parent.registry);this.cache=new InheritingDict(parent&&parent.cache);this.typeInjections=new InheritingDict(parent&&parent.typeInjections);this.injections={};this._options=new InheritingDict(parent&&parent._options);this._typeOptions=new InheritingDict(parent&&parent._typeOptions)}Container.prototype={child:function(){var container=new Container(this);this.children.push(container);return container},set:function(object,key,value){object[key]=value},register:function(type,name,factory,options){var fullName;if(type.indexOf(":")!==-1){options=factory;factory=name;fullName=type}else{Ember.deprecate('register("'+type+'", "'+name+'") is now deprecated in-favour of register("'+type+":"+name+'");',true);fullName=type+":"+name}var normalizedName=this.normalize(fullName);this.registry.set(normalizedName,factory);this._options.set(normalizedName,options||{})},resolve:function(fullName){return this.resolver(fullName)||this.registry.get(fullName)},normalize:function(fullName){return fullName},lookup:function(fullName,options){fullName=this.normalize(fullName);options=options||{};if(this.cache.has(fullName)&&options.singleton!==false){return this.cache.get(fullName)}var value=instantiate(this,fullName);if(!value){return}if(isSingleton(this,fullName)&&options.singleton!==false){this.cache.set(fullName,value)}return value},has:function(fullName){if(this.cache.has(fullName)){return true}return!!factoryFor(this,fullName)},optionsForType:function(type,options){if(this.parent){illegalChildOperation("optionsForType")}this._typeOptions.set(type,options)},options:function(type,options){this.optionsForType(type,options)},typeInjection:function(type,property,fullName){if(this.parent){illegalChildOperation("typeInjection")}var injections=this.typeInjections.get(type);if(!injections){injections=[];this.typeInjections.set(type,injections)}injections.push({property:property,fullName:fullName})},injection:function(factoryName,property,injectionName){if(this.parent){illegalChildOperation("injection")}if(factoryName.indexOf(":")===-1){return this.typeInjection(factoryName,property,injectionName)}var injections=this.injections[factoryName]=this.injections[factoryName]||[];injections.push({property:property,fullName:injectionName})},destroy:function(){this.isDestroyed=true;for(var i=0,l=this.children.length;i<l;i++){this.children[i].destroy()}this.children=[];eachDestroyable(this,function(item){item.isDestroying=true});eachDestroyable(this,function(item){item.destroy()});delete this.parent;this.isDestroyed=true},reset:function(){for(var i=0,l=this.children.length;i<l;i++){resetCache(this.children[i])}resetCache(this)}};function illegalChildOperation(operation){throw new Error(operation+" is not currently supported on child containers")}function isSingleton(container,fullName){var singleton=option(container,fullName,"singleton");return singleton!==false}function buildInjections(container,injections){var hash={};if(!injections){return hash}var injection,lookup;for(var i=0,l=injections.length;i<l;i++){injection=injections[i];lookup=container.lookup(injection.fullName);hash[injection.property]=lookup}return hash}function option(container,fullName,optionName){var options=container._options.get(fullName);if(options&&options[optionName]!==undefined){return options[optionName]}var type=fullName.split(":")[0];options=container._typeOptions.get(type);if(options){return options[optionName]}}function factoryFor(container,fullName){var name=container.normalize(fullName);return container.resolve(name)}function instantiate(container,fullName){var factory=factoryFor(container,fullName);var splitName=fullName.split(":"),type=splitName[0],name=splitName[1],value;if(option(container,fullName,"instantiate")===false){return factory}if(factory){var injections=[];injections=injections.concat(container.typeInjections.get(type)||[]);injections=injections.concat(container.injections[fullName]||[]);var hash=buildInjections(container,injections);hash.container=container;hash._debugContainerKey=fullName;value=factory.create(hash);return value}}function eachDestroyable(container,callback){container.cache.eachLocal(function(key,value){if(option(container,key,"instantiate")===false){return}callback(value)})}function resetCache(container){container.cache.eachLocal(function(key,value){if(option(container,key,"instantiate")===false){return}value.destroy()});container.cache.dict={}}return Container})})();(function(){var indexOf=Ember.EnumerableUtils.indexOf;var TYPE_MAP={};var t="Boolean Number String Function Array Date RegExp Object".split(" ");Ember.ArrayPolyfills.forEach.call(t,function(name){TYPE_MAP["[object "+name+"]"]=name.toLowerCase()});var toString=Object.prototype.toString;Ember.typeOf=function(item){var ret;ret=item===null||item===undefined?String(item):TYPE_MAP[toString.call(item)]||"object";if(ret==="function"){if(Ember.Object&&Ember.Object.detect(item))ret="class"}else if(ret==="object"){if(item instanceof Error)ret="error";else if(Ember.Object&&item instanceof Ember.Object)ret="instance";else ret="object"}return ret};Ember.compare=function compare(v,w){if(v===w){return 0}var type1=Ember.typeOf(v);var type2=Ember.typeOf(w);var Comparable=Ember.Comparable;if(Comparable){if(type1==="instance"&&Comparable.detect(v.constructor)){return v.constructor.compare(v,w)}if(type2==="instance"&&Comparable.detect(w.constructor)){return 1-w.constructor.compare(w,v)}}var mapping=Ember.ORDER_DEFINITION_MAPPING;if(!mapping){var order=Ember.ORDER_DEFINITION;mapping=Ember.ORDER_DEFINITION_MAPPING={};var idx,len;for(idx=0,len=order.length;idx<len;++idx){mapping[order[idx]]=idx}delete Ember.ORDER_DEFINITION}var type1Index=mapping[type1];var type2Index=mapping[type2];if(type1Index<type2Index){return-1}if(type1Index>type2Index){return 1}switch(type1){case"boolean":case"number":if(v<w){return-1}if(v>w){return 1}return 0;case"string":var comp=v.localeCompare(w);if(comp<0){return-1}if(comp>0){return 1}return 0;case"array":var vLen=v.length;var wLen=w.length;var l=Math.min(vLen,wLen);var r=0;var i=0;while(r===0&&i<l){r=compare(v[i],w[i]);i++}if(r!==0){return r}if(vLen<wLen){return-1}if(vLen>wLen){return 1}return 0;case"instance":if(Ember.Comparable&&Ember.Comparable.detect(v)){return v.compare(v,w)}return 0;case"date":var vNum=v.getTime();var wNum=w.getTime();if(vNum<wNum){return-1}if(vNum>wNum){return 1}return 0;default:return 0}};function _copy(obj,deep,seen,copies){var ret,loc,key;if("object"!==typeof obj||obj===null)return obj;if(deep&&(loc=indexOf(seen,obj))>=0)return copies[loc];Ember.assert("Cannot clone an Ember.Object that does not implement Ember.Copyable",!(obj instanceof Ember.Object)||Ember.Copyable&&Ember.Copyable.detect(obj));if(Ember.typeOf(obj)==="array"){ret=obj.slice();if(deep){loc=ret.length;while(--loc>=0)ret[loc]=_copy(ret[loc],deep,seen,copies)}}else if(Ember.Copyable&&Ember.Copyable.detect(obj)){ret=obj.copy(deep,seen,copies)}else{ret={};for(key in obj){if(!obj.hasOwnProperty(key))continue;if(key.substring(0,2)==="__")continue;ret[key]=deep?_copy(obj[key],deep,seen,copies):obj[key]}}if(deep){seen.push(obj);copies.push(ret)}return ret}Ember.copy=function(obj,deep){if("object"!==typeof obj||obj===null)return obj;if(Ember.Copyable&&Ember.Copyable.detect(obj))return obj.copy(deep);return _copy(obj,deep,deep?[]:null,deep?[]:null)};Ember.inspect=function(obj){if(typeof obj!=="object"||obj===null){return obj+""}var v,ret=[];for(var key in obj){if(obj.hasOwnProperty(key)){v=obj[key];if(v==="toString"){continue}if(Ember.typeOf(v)==="function"){v="function() { ... }"}ret.push(key+": "+v)}}return"{"+ret.join(", ")+"}"};Ember.isEqual=function(a,b){if(a&&"function"===typeof a.isEqual)return a.isEqual(b);return a===b};Ember.ORDER_DEFINITION=Ember.ENV.ORDER_DEFINITION||["undefined","null","boolean","number","string","array","object","instance","function","class","date"];Ember.keys=Object.keys;if(!Ember.keys){Ember.keys=function(obj){var ret=[];for(var key in obj){if(obj.hasOwnProperty(key)){ret.push(key)}}return ret}}var errorProps=["description","fileName","lineNumber","message","name","number","stack"];Ember.Error=function(){var tmp=Error.prototype.constructor.apply(this,arguments);for(var idx=0;idx<errorProps.length;idx++){this[errorProps[idx]]=tmp[errorProps[idx]]}};Ember.Error.prototype=Ember.create(Error.prototype)})();(function(){Ember.RSVP=requireModule("rsvp")})();(function(){var STRING_DASHERIZE_REGEXP=/[ _]/g;var STRING_DASHERIZE_CACHE={};var STRING_DECAMELIZE_REGEXP=/([a-z])([A-Z])/g;var STRING_CAMELIZE_REGEXP=/(\-|_|\.|\s)+(.)?/g;var STRING_UNDERSCORE_REGEXP_1=/([a-z\d])([A-Z]+)/g;var STRING_UNDERSCORE_REGEXP_2=/\-|\s+/g;Ember.STRINGS={};Ember.String={fmt:function(str,formats){var idx=0;return str.replace(/%@([0-9]+)?/g,function(s,argIndex){argIndex=argIndex?parseInt(argIndex,0)-1:idx++;s=formats[argIndex];return(s===null?"(null)":s===undefined?"":s).toString()})},loc:function(str,formats){str=Ember.STRINGS[str]||str;return Ember.String.fmt(str,formats)},w:function(str){return str.split(/\s+/)},decamelize:function(str){return str.replace(STRING_DECAMELIZE_REGEXP,"$1_$2").toLowerCase()},dasherize:function(str){var cache=STRING_DASHERIZE_CACHE,hit=cache.hasOwnProperty(str),ret;if(hit){return cache[str]}else{ret=Ember.String.decamelize(str).replace(STRING_DASHERIZE_REGEXP,"-");cache[str]=ret}return ret},camelize:function(str){return str.replace(STRING_CAMELIZE_REGEXP,function(match,separator,chr){return chr?chr.toUpperCase():""}).replace(/^([A-Z])/,function(match,separator,chr){return match.toLowerCase()})},classify:function(str){var parts=str.split("."),out=[];for(var i=0,l=parts.length;i<l;i++){var camelized=Ember.String.camelize(parts[i]);out.push(camelized.charAt(0).toUpperCase()+camelized.substr(1))}return out.join(".")},underscore:function(str){return str.replace(STRING_UNDERSCORE_REGEXP_1,"$1_$2").replace(STRING_UNDERSCORE_REGEXP_2,"_").toLowerCase()},capitalize:function(str){return str.charAt(0).toUpperCase()+str.substr(1)}}})();(function(){var fmt=Ember.String.fmt,w=Ember.String.w,loc=Ember.String.loc,camelize=Ember.String.camelize,decamelize=Ember.String.decamelize,dasherize=Ember.String.dasherize,underscore=Ember.String.underscore,capitalize=Ember.String.capitalize,classify=Ember.String.classify;if(Ember.EXTEND_PROTOTYPES===true||Ember.EXTEND_PROTOTYPES.String){String.prototype.fmt=function(){return fmt(this,arguments)};String.prototype.w=function(){return w(this)};String.prototype.loc=function(){return loc(this,arguments)};String.prototype.camelize=function(){return camelize(this)};String.prototype.decamelize=function(){return decamelize(this)};String.prototype.dasherize=function(){return dasherize(this)};String.prototype.underscore=function(){return underscore(this)};String.prototype.classify=function(){return classify(this)};String.prototype.capitalize=function(){return capitalize(this)}}})();(function(){var a_slice=Array.prototype.slice;if(Ember.EXTEND_PROTOTYPES===true||Ember.EXTEND_PROTOTYPES.Function){Function.prototype.property=function(){var ret=Ember.computed(this);return ret.property.apply(ret,arguments)};Function.prototype.observes=function(){this.__ember_observes__=a_slice.call(arguments);return this};Function.prototype.observesBefore=function(){this.__ember_observesBefore__=a_slice.call(arguments);return this}}})();(function(){})();(function(){var get=Ember.get,set=Ember.set;var a_slice=Array.prototype.slice;var a_indexOf=Ember.EnumerableUtils.indexOf;var contexts=[];function popCtx(){return contexts.length===0?{}:contexts.pop()}function pushCtx(ctx){contexts.push(ctx);return null}function iter(key,value){var valueProvided=arguments.length===2;function i(item){var cur=get(item,key);return valueProvided?value===cur:!!cur}return i}Ember.Enumerable=Ember.Mixin.create({isEnumerable:true,nextObject:Ember.required(Function),firstObject:Ember.computed(function(){if(get(this,"length")===0)return undefined;var context=popCtx(),ret;ret=this.nextObject(0,null,context);pushCtx(context);return ret}).property("[]"),lastObject:Ember.computed(function(){var len=get(this,"length");if(len===0)return undefined;var context=popCtx(),idx=0,cur,last=null;do{last=cur;cur=this.nextObject(idx++,last,context)}while(cur!==undefined);pushCtx(context);return last}).property("[]"),contains:function(obj){return this.find(function(item){return item===obj})!==undefined},forEach:function(callback,target){if(typeof callback!=="function")throw new TypeError;var len=get(this,"length"),last=null,context=popCtx();if(target===undefined)target=null;for(var idx=0;idx<len;idx++){var next=this.nextObject(idx,last,context);callback.call(target,next,idx,this);last=next}last=null;context=pushCtx(context);return this},getEach:function(key){return this.mapProperty(key)},setEach:function(key,value){return this.forEach(function(item){set(item,key,value)})},map:function(callback,target){var ret=Ember.A([]);this.forEach(function(x,idx,i){ret[idx]=callback.call(target,x,idx,i)});return ret},mapProperty:function(key){return this.map(function(next){return get(next,key)})},filter:function(callback,target){var ret=Ember.A([]);this.forEach(function(x,idx,i){if(callback.call(target,x,idx,i))ret.push(x)});return ret},reject:function(callback,target){return this.filter(function(){return!callback.apply(target,arguments)})},filterProperty:function(key,value){return this.filter(iter.apply(this,arguments))},rejectProperty:function(key,value){var exactValue=function(item){return get(item,key)===value},hasValue=function(item){return!!get(item,key)},use=arguments.length===2?exactValue:hasValue;return this.reject(use)},find:function(callback,target){var len=get(this,"length");if(target===undefined)target=null;var last=null,next,found=false,ret;var context=popCtx();for(var idx=0;idx<len&&!found;idx++){next=this.nextObject(idx,last,context);if(found=callback.call(target,next,idx,this))ret=next;last=next}next=last=null;context=pushCtx(context);return ret},findProperty:function(key,value){return this.find(iter.apply(this,arguments))},every:function(callback,target){return!this.find(function(x,idx,i){return!callback.call(target,x,idx,i)})},everyProperty:function(key,value){return this.every(iter.apply(this,arguments))},some:function(callback,target){return!!this.find(function(x,idx,i){return!!callback.call(target,x,idx,i)})},someProperty:function(key,value){return this.some(iter.apply(this,arguments))},reduce:function(callback,initialValue,reducerProperty){if(typeof callback!=="function"){throw new TypeError}var ret=initialValue;this.forEach(function(item,i){ret=callback.call(null,ret,item,i,this,reducerProperty)},this);return ret},invoke:function(methodName){var args,ret=Ember.A([]);if(arguments.length>1)args=a_slice.call(arguments,1);this.forEach(function(x,idx){var method=x&&x[methodName];if("function"===typeof method){ret[idx]=args?method.apply(x,args):method.call(x)}},this);return ret},toArray:function(){var ret=Ember.A([]);this.forEach(function(o,idx){ret[idx]=o});return ret},compact:function(){return this.without(null)},without:function(value){if(!this.contains(value))return this;var ret=Ember.A([]);this.forEach(function(k){if(k!==value)ret[ret.length]=k});return ret},uniq:function(){var ret=Ember.A([]);this.forEach(function(k){if(a_indexOf(ret,k)<0)ret.push(k)});return ret},"[]":Ember.computed(function(key,value){return this}),addEnumerableObserver:function(target,opts){var willChange=opts&&opts.willChange||"enumerableWillChange",didChange=opts&&opts.didChange||"enumerableDidChange";var hasObservers=get(this,"hasEnumerableObservers");if(!hasObservers)Ember.propertyWillChange(this,"hasEnumerableObservers");Ember.addListener(this,"@enumerable:before",target,willChange);Ember.addListener(this,"@enumerable:change",target,didChange);if(!hasObservers)Ember.propertyDidChange(this,"hasEnumerableObservers");return this},removeEnumerableObserver:function(target,opts){var willChange=opts&&opts.willChange||"enumerableWillChange",didChange=opts&&opts.didChange||"enumerableDidChange";var hasObservers=get(this,"hasEnumerableObservers");if(hasObservers)Ember.propertyWillChange(this,"hasEnumerableObservers");Ember.removeListener(this,"@enumerable:before",target,willChange);Ember.removeListener(this,"@enumerable:change",target,didChange);if(hasObservers)Ember.propertyDidChange(this,"hasEnumerableObservers");return this},hasEnumerableObservers:Ember.computed(function(){return Ember.hasListeners(this,"@enumerable:change")||Ember.hasListeners(this,"@enumerable:before")}),enumerableContentWillChange:function(removing,adding){var removeCnt,addCnt,hasDelta;if("number"===typeof removing)removeCnt=removing;else if(removing)removeCnt=get(removing,"length");else removeCnt=removing=-1;if("number"===typeof adding)addCnt=adding;else if(adding)addCnt=get(adding,"length");else addCnt=adding=-1;hasDelta=addCnt<0||removeCnt<0||addCnt-removeCnt!==0;if(removing===-1)removing=null;if(adding===-1)adding=null;Ember.propertyWillChange(this,"[]");if(hasDelta)Ember.propertyWillChange(this,"length");Ember.sendEvent(this,"@enumerable:before",[this,removing,adding]);return this},enumerableContentDidChange:function(removing,adding){var removeCnt,addCnt,hasDelta;if("number"===typeof removing)removeCnt=removing;else if(removing)removeCnt=get(removing,"length");else removeCnt=removing=-1;if("number"===typeof adding)addCnt=adding;else if(adding)addCnt=get(adding,"length");else addCnt=adding=-1;hasDelta=addCnt<0||removeCnt<0||addCnt-removeCnt!==0;if(removing===-1)removing=null;if(adding===-1)adding=null;Ember.sendEvent(this,"@enumerable:change",[this,removing,adding]);if(hasDelta)Ember.propertyDidChange(this,"length");Ember.propertyDidChange(this,"[]");return this}})})();(function(){var get=Ember.get,set=Ember.set,map=Ember.EnumerableUtils.map,cacheFor=Ember.cacheFor;function none(obj){return obj===null||obj===undefined}Ember.Array=Ember.Mixin.create(Ember.Enumerable,{isSCArray:true,length:Ember.required(),objectAt:function(idx){if(idx<0||idx>=get(this,"length"))return undefined;return get(this,idx)},objectsAt:function(indexes){var self=this;return map(indexes,function(idx){return self.objectAt(idx)})},nextObject:function(idx){return this.objectAt(idx)},"[]":Ember.computed(function(key,value){if(value!==undefined)this.replace(0,get(this,"length"),value);return this}),firstObject:Ember.computed(function(){return this.objectAt(0)}),lastObject:Ember.computed(function(){return this.objectAt(get(this,"length")-1)}),contains:function(obj){return this.indexOf(obj)>=0},slice:function(beginIndex,endIndex){var ret=Ember.A([]);var length=get(this,"length");if(none(beginIndex))beginIndex=0;if(none(endIndex)||endIndex>length)endIndex=length;if(beginIndex<0)beginIndex=length+beginIndex;if(endIndex<0)endIndex=length+endIndex;while(beginIndex<endIndex){ret[ret.length]=this.objectAt(beginIndex++)}return ret},indexOf:function(object,startAt){var idx,len=get(this,"length");if(startAt===undefined)startAt=0;if(startAt<0)startAt+=len;for(idx=startAt;idx<len;idx++){if(this.objectAt(idx,true)===object)return idx}return-1},lastIndexOf:function(object,startAt){var idx,len=get(this,"length");if(startAt===undefined||startAt>=len)startAt=len-1;if(startAt<0)startAt+=len;for(idx=startAt;idx>=0;idx--){if(this.objectAt(idx)===object)return idx}return-1},addArrayObserver:function(target,opts){var willChange=opts&&opts.willChange||"arrayWillChange",didChange=opts&&opts.didChange||"arrayDidChange";var hasObservers=get(this,"hasArrayObservers");if(!hasObservers)Ember.propertyWillChange(this,"hasArrayObservers");Ember.addListener(this,"@array:before",target,willChange);Ember.addListener(this,"@array:change",target,didChange);if(!hasObservers)Ember.propertyDidChange(this,"hasArrayObservers");return this},removeArrayObserver:function(target,opts){var willChange=opts&&opts.willChange||"arrayWillChange",didChange=opts&&opts.didChange||"arrayDidChange";var hasObservers=get(this,"hasArrayObservers");if(hasObservers)Ember.propertyWillChange(this,"hasArrayObservers");Ember.removeListener(this,"@array:before",target,willChange);Ember.removeListener(this,"@array:change",target,didChange);if(hasObservers)Ember.propertyDidChange(this,"hasArrayObservers");return this},hasArrayObservers:Ember.computed(function(){return Ember.hasListeners(this,"@array:change")||Ember.hasListeners(this,"@array:before")}),arrayContentWillChange:function(startIdx,removeAmt,addAmt){if(startIdx===undefined){startIdx=0;removeAmt=addAmt=-1}else{if(removeAmt===undefined)removeAmt=-1;if(addAmt===undefined)addAmt=-1}if(Ember.isWatching(this,"@each")){get(this,"@each")}Ember.sendEvent(this,"@array:before",[this,startIdx,removeAmt,addAmt]);var removing,lim;if(startIdx>=0&&removeAmt>=0&&get(this,"hasEnumerableObservers")){removing=[];lim=startIdx+removeAmt;for(var idx=startIdx;idx<lim;idx++)removing.push(this.objectAt(idx))}else{removing=removeAmt}this.enumerableContentWillChange(removing,addAmt);return this},arrayContentDidChange:function(startIdx,removeAmt,addAmt){if(startIdx===undefined){startIdx=0;removeAmt=addAmt=-1}else{if(removeAmt===undefined)removeAmt=-1;if(addAmt===undefined)addAmt=-1}var adding,lim;if(startIdx>=0&&addAmt>=0&&get(this,"hasEnumerableObservers")){adding=[];lim=startIdx+addAmt;for(var idx=startIdx;idx<lim;idx++)adding.push(this.objectAt(idx))}else{adding=addAmt}this.enumerableContentDidChange(removeAmt,adding);Ember.sendEvent(this,"@array:change",[this,startIdx,removeAmt,addAmt]);var length=get(this,"length"),cachedFirst=cacheFor(this,"firstObject"),cachedLast=cacheFor(this,"lastObject");if(this.objectAt(0)!==cachedFirst){Ember.propertyWillChange(this,"firstObject");Ember.propertyDidChange(this,"firstObject")}if(this.objectAt(length-1)!==cachedLast){Ember.propertyWillChange(this,"lastObject");Ember.propertyDidChange(this,"lastObject")}return this},"@each":Ember.computed(function(){if(!this.__each)this.__each=new Ember.EachProxy(this);return this.__each})})})();(function(){Ember.Comparable=Ember.Mixin.create({isComparable:true,compare:Ember.required(Function)})})();(function(){var get=Ember.get,set=Ember.set;Ember.Copyable=Ember.Mixin.create({copy:Ember.required(Function),frozenCopy:function(){if(Ember.Freezable&&Ember.Freezable.detect(this)){return get(this,"isFrozen")?this:this.copy().freeze()}else{throw new Error(Ember.String.fmt("%@ does not support freezing",[this]))}}})})();(function(){var get=Ember.get,set=Ember.set;Ember.Freezable=Ember.Mixin.create({isFrozen:false,freeze:function(){if(get(this,"isFrozen"))return this;set(this,"isFrozen",true);return this}});Ember.FROZEN_ERROR="Frozen object cannot be modified."})();(function(){var forEach=Ember.EnumerableUtils.forEach;Ember.MutableEnumerable=Ember.Mixin.create(Ember.Enumerable,{addObject:Ember.required(Function),addObjects:function(objects){Ember.beginPropertyChanges(this);forEach(objects,function(obj){this.addObject(obj)},this);Ember.endPropertyChanges(this);return this},removeObject:Ember.required(Function),removeObjects:function(objects){Ember.beginPropertyChanges(this);forEach(objects,function(obj){this.removeObject(obj)},this);Ember.endPropertyChanges(this);return this}})})();(function(){var OUT_OF_RANGE_EXCEPTION="Index out of range";var EMPTY=[];var get=Ember.get,set=Ember.set;Ember.MutableArray=Ember.Mixin.create(Ember.Array,Ember.MutableEnumerable,{replace:Ember.required(),clear:function(){var len=get(this,"length");
if(len===0)return this;this.replace(0,len,EMPTY);return this},insertAt:function(idx,object){if(idx>get(this,"length"))throw new Error(OUT_OF_RANGE_EXCEPTION);this.replace(idx,0,[object]);return this},removeAt:function(start,len){if("number"===typeof start){if(start<0||start>=get(this,"length")){throw new Error(OUT_OF_RANGE_EXCEPTION)}if(len===undefined)len=1;this.replace(start,len,EMPTY)}return this},pushObject:function(obj){this.insertAt(get(this,"length"),obj);return obj},pushObjects:function(objects){this.replace(get(this,"length"),0,objects);return this},popObject:function(){var len=get(this,"length");if(len===0)return null;var ret=this.objectAt(len-1);this.removeAt(len-1,1);return ret},shiftObject:function(){if(get(this,"length")===0)return null;var ret=this.objectAt(0);this.removeAt(0);return ret},unshiftObject:function(obj){this.insertAt(0,obj);return obj},unshiftObjects:function(objects){this.replace(0,0,objects);return this},reverseObjects:function(){var len=get(this,"length");if(len===0)return this;var objects=this.toArray().reverse();this.replace(0,len,objects);return this},setObjects:function(objects){if(objects.length===0)return this.clear();var len=get(this,"length");this.replace(0,len,objects);return this},removeObject:function(obj){var loc=get(this,"length")||0;while(--loc>=0){var curObject=this.objectAt(loc);if(curObject===obj)this.removeAt(loc)}return this},addObject:function(obj){if(!this.contains(obj))this.pushObject(obj);return this}})})();(function(){var get=Ember.get,set=Ember.set;Ember.Observable=Ember.Mixin.create({get:function(keyName){return get(this,keyName)},getProperties:function(){var ret={};var propertyNames=arguments;if(arguments.length===1&&Ember.typeOf(arguments[0])==="array"){propertyNames=arguments[0]}for(var i=0;i<propertyNames.length;i++){ret[propertyNames[i]]=get(this,propertyNames[i])}return ret},set:function(keyName,value){set(this,keyName,value);return this},setProperties:function(hash){return Ember.setProperties(this,hash)},beginPropertyChanges:function(){Ember.beginPropertyChanges();return this},endPropertyChanges:function(){Ember.endPropertyChanges();return this},propertyWillChange:function(keyName){Ember.propertyWillChange(this,keyName);return this},propertyDidChange:function(keyName){Ember.propertyDidChange(this,keyName);return this},notifyPropertyChange:function(keyName){this.propertyWillChange(keyName);this.propertyDidChange(keyName);return this},addBeforeObserver:function(key,target,method){Ember.addBeforeObserver(this,key,target,method)},addObserver:function(key,target,method){Ember.addObserver(this,key,target,method)},removeObserver:function(key,target,method){Ember.removeObserver(this,key,target,method)},hasObserverFor:function(key){return Ember.hasListeners(this,key+":change")},getPath:function(path){Ember.deprecate("getPath is deprecated since get now supports paths");return this.get(path)},setPath:function(path,value){Ember.deprecate("setPath is deprecated since set now supports paths");return this.set(path,value)},getWithDefault:function(keyName,defaultValue){return Ember.getWithDefault(this,keyName,defaultValue)},incrementProperty:function(keyName,increment){if(!increment){increment=1}set(this,keyName,(get(this,keyName)||0)+increment);return get(this,keyName)},decrementProperty:function(keyName,increment){if(!increment){increment=1}set(this,keyName,(get(this,keyName)||0)-increment);return get(this,keyName)},toggleProperty:function(keyName){set(this,keyName,!get(this,keyName));return get(this,keyName)},cacheFor:function(keyName){return Ember.cacheFor(this,keyName)},observersForKey:function(keyName){return Ember.observersFor(this,keyName)}})})();(function(){var get=Ember.get,set=Ember.set;Ember.TargetActionSupport=Ember.Mixin.create({target:null,action:null,targetObject:Ember.computed(function(){var target=get(this,"target");if(Ember.typeOf(target)==="string"){var value=get(this,target);if(value===undefined){value=get(Ember.lookup,target)}return value}else{return target}}).property("target"),triggerAction:function(){var action=get(this,"action"),target=get(this,"targetObject");if(target&&action){var ret;if(typeof target.send==="function"){ret=target.send(action,this)}else{if(typeof action==="string"){action=target[action]}ret=action.call(target,this)}if(ret!==false)ret=true;return ret}else{return false}}})})();(function(){Ember.Evented=Ember.Mixin.create({on:function(name,target,method){Ember.addListener(this,name,target,method);return this},one:function(name,target,method){if(!method){method=target;target=null}Ember.addListener(this,name,target,method,true);return this},trigger:function(name){var args=[],i,l;for(i=1,l=arguments.length;i<l;i++){args.push(arguments[i])}Ember.sendEvent(this,name,args)},fire:function(name){Ember.deprecate("Ember.Evented#fire() has been deprecated in favor of trigger() for compatibility with jQuery. It will be removed in 1.0. Please update your code to call trigger() instead.");this.trigger.apply(this,arguments)},off:function(name,target,method){Ember.removeListener(this,name,target,method);return this},has:function(name){return Ember.hasListeners(this,name)}})})();(function(){var RSVP=requireModule("rsvp");RSVP.async=function(callback,binding){Ember.run.schedule("actions",binding,callback)};var get=Ember.get;Ember.DeferredMixin=Ember.Mixin.create({then:function(doneCallback,failCallback){var promise=get(this,"promise");return promise.then.apply(promise,arguments)},resolve:function(value){get(this,"promise").resolve(value)},reject:function(value){get(this,"promise").reject(value)},promise:Ember.computed(function(){return new RSVP.Promise})})})();(function(){})();(function(){Ember.Container=requireModule("container");Ember.Container.set=Ember.set})();(function(){var set=Ember.set,get=Ember.get,o_create=Ember.create,o_defineProperty=Ember.platform.defineProperty,GUID_KEY=Ember.GUID_KEY,guidFor=Ember.guidFor,generateGuid=Ember.generateGuid,meta=Ember.meta,rewatch=Ember.rewatch,finishChains=Ember.finishChains,destroy=Ember.destroy,schedule=Ember.run.schedule,Mixin=Ember.Mixin,applyMixin=Mixin._apply,finishPartial=Mixin.finishPartial,reopen=Mixin.prototype.reopen,MANDATORY_SETTER=Ember.ENV.MANDATORY_SETTER,indexOf=Ember.EnumerableUtils.indexOf;var undefinedDescriptor={configurable:true,writable:true,enumerable:false,value:undefined};function makeCtor(){var wasApplied=false,initMixins,initProperties;var Class=function(){if(!wasApplied){Class.proto()}o_defineProperty(this,GUID_KEY,undefinedDescriptor);o_defineProperty(this,"_super",undefinedDescriptor);var m=meta(this);m.proto=this;if(initMixins){var mixins=initMixins;initMixins=null;this.reopen.apply(this,mixins)}if(initProperties){var props=initProperties;initProperties=null;var concatenatedProperties=this.concatenatedProperties;for(var i=0,l=props.length;i<l;i++){var properties=props[i];for(var keyName in properties){if(!properties.hasOwnProperty(keyName)){continue}var value=properties[keyName],IS_BINDING=Ember.IS_BINDING;if(IS_BINDING.test(keyName)){var bindings=m.bindings;if(!bindings){bindings=m.bindings={}}else if(!m.hasOwnProperty("bindings")){bindings=m.bindings=o_create(m.bindings)}bindings[keyName]=value}var desc=m.descs[keyName];Ember.assert("Ember.Object.create no longer supports defining computed properties.",!(value instanceof Ember.ComputedProperty));Ember.assert("Ember.Object.create no longer supports defining methods that call _super.",!(typeof value==="function"&&value.toString().indexOf("._super")!==-1));if(concatenatedProperties&&indexOf(concatenatedProperties,keyName)>=0){var baseValue=this[keyName];if(baseValue){if("function"===typeof baseValue.concat){value=baseValue.concat(value)}else{value=Ember.makeArray(baseValue).concat(value)}}else{value=Ember.makeArray(value)}}if(desc){desc.set(this,keyName,value)}else{if(typeof this.setUnknownProperty==="function"&&!(keyName in this)){this.setUnknownProperty(keyName,value)}else if(MANDATORY_SETTER){Ember.defineProperty(this,keyName,null,value)}else{this[keyName]=value}}}}}finishPartial(this,m);delete m.proto;finishChains(this);this.init.apply(this,arguments)};Class.toString=Mixin.prototype.toString;Class.willReopen=function(){if(wasApplied){Class.PrototypeMixin=Mixin.create(Class.PrototypeMixin)}wasApplied=false};Class._initMixins=function(args){initMixins=args};Class._initProperties=function(args){initProperties=args};Class.proto=function(){var superclass=Class.superclass;if(superclass){superclass.proto()}if(!wasApplied){wasApplied=true;Class.PrototypeMixin.applyPartial(Class.prototype);rewatch(Class.prototype)}return this.prototype};return Class}var CoreObject=makeCtor();CoreObject.toString=function(){return"Ember.CoreObject"};CoreObject.PrototypeMixin=Mixin.create({reopen:function(){applyMixin(this,arguments,true);return this},isInstance:true,init:function(){},concatenatedProperties:null,isDestroyed:false,isDestroying:false,destroy:function(){if(this._didCallDestroy){return}this.isDestroying=true;this._didCallDestroy=true;if(this.willDestroy){this.willDestroy()}schedule("destroy",this,this._scheduledDestroy);return this},_scheduledDestroy:function(){destroy(this);set(this,"isDestroyed",true);if(this.didDestroy){this.didDestroy()}},bind:function(to,from){if(!(from instanceof Ember.Binding)){from=Ember.Binding.from(from)}from.to(to).connect(this);return from},toString:function toString(){var hasToStringExtension=typeof this.toStringExtension==="function",extension=hasToStringExtension?":"+this.toStringExtension():"";var ret="<"+this.constructor.toString()+":"+guidFor(this)+extension+">";this.toString=makeToString(ret);return ret}});CoreObject.PrototypeMixin.ownerConstructor=CoreObject;function makeToString(ret){return function(){return ret}}if(Ember.config.overridePrototypeMixin){Ember.config.overridePrototypeMixin(CoreObject.PrototypeMixin)}CoreObject.__super__=null;var ClassMixin=Mixin.create({ClassMixin:Ember.required(),PrototypeMixin:Ember.required(),isClass:true,isMethod:false,extend:function(){var Class=makeCtor(),proto;Class.ClassMixin=Mixin.create(this.ClassMixin);Class.PrototypeMixin=Mixin.create(this.PrototypeMixin);Class.ClassMixin.ownerConstructor=Class;Class.PrototypeMixin.ownerConstructor=Class;reopen.apply(Class.PrototypeMixin,arguments);Class.superclass=this;Class.__super__=this.prototype;proto=Class.prototype=o_create(this.prototype);proto.constructor=Class;generateGuid(proto,"ember");meta(proto).proto=proto;Class.ClassMixin.apply(Class);return Class},createWithMixins:function(){var C=this;if(arguments.length>0){this._initMixins(arguments)}return new C},create:function(){var C=this;if(arguments.length>0){this._initProperties(arguments)}return new C},reopen:function(){this.willReopen();reopen.apply(this.PrototypeMixin,arguments);return this},reopenClass:function(){reopen.apply(this.ClassMixin,arguments);applyMixin(this,arguments,false);return this},detect:function(obj){if("function"!==typeof obj){return false}while(obj){if(obj===this){return true}obj=obj.superclass}return false},detectInstance:function(obj){return obj instanceof this},metaForProperty:function(key){var desc=meta(this.proto(),false).descs[key];Ember.assert("metaForProperty() could not find a computed property with key '"+key+"'.",!!desc&&desc instanceof Ember.ComputedProperty);return desc._meta||{}},eachComputedProperty:function(callback,binding){var proto=this.proto(),descs=meta(proto).descs,empty={},property;for(var name in descs){property=descs[name];if(property instanceof Ember.ComputedProperty){callback.call(binding||this,name,property._meta||empty)}}}});ClassMixin.ownerConstructor=CoreObject;if(Ember.config.overrideClassMixin){Ember.config.overrideClassMixin(ClassMixin)}CoreObject.ClassMixin=ClassMixin;ClassMixin.apply(CoreObject);Ember.CoreObject=CoreObject})();(function(){Ember.Object=Ember.CoreObject.extend(Ember.Observable);Ember.Object.toString=function(){return"Ember.Object"}})();(function(){var get=Ember.get,indexOf=Ember.ArrayPolyfills.indexOf;var Namespace=Ember.Namespace=Ember.Object.extend({isNamespace:true,init:function(){Ember.Namespace.NAMESPACES.push(this);Ember.Namespace.PROCESSED=false},toString:function(){var name=get(this,"name");if(name){return name}findNamespaces();return this[Ember.GUID_KEY+"_name"]},nameClasses:function(){processNamespace([this.toString()],this,{})},destroy:function(){var namespaces=Ember.Namespace.NAMESPACES;Ember.lookup[this.toString()]=undefined;namespaces.splice(indexOf.call(namespaces,this),1);this._super()}});Namespace.reopenClass({NAMESPACES:[Ember],NAMESPACES_BY_ID:{},PROCESSED:false,processAll:processAllNamespaces,byName:function(name){if(!Ember.BOOTED){processAllNamespaces()}return NAMESPACES_BY_ID[name]}});var NAMESPACES_BY_ID=Namespace.NAMESPACES_BY_ID;var hasOwnProp={}.hasOwnProperty,guidFor=Ember.guidFor;function processNamespace(paths,root,seen){var idx=paths.length;NAMESPACES_BY_ID[paths.join(".")]=root;for(var key in root){if(!hasOwnProp.call(root,key)){continue}var obj=root[key];paths[idx]=key;if(obj&&obj.toString===classToString){obj.toString=makeToString(paths.join("."));obj[NAME_KEY]=paths.join(".")}else if(obj&&obj.isNamespace){if(seen[guidFor(obj)]){continue}seen[guidFor(obj)]=true;processNamespace(paths,obj,seen)}}paths.length=idx}function findNamespaces(){var Namespace=Ember.Namespace,lookup=Ember.lookup,obj,isNamespace;if(Namespace.PROCESSED){return}for(var prop in lookup){if(prop==="parent"||prop==="top"||prop==="frameElement"){continue}if(prop==="globalStorage"&&lookup.StorageList&&lookup.globalStorage instanceof lookup.StorageList){continue}if(lookup.hasOwnProperty&&!lookup.hasOwnProperty(prop)){continue}try{obj=Ember.lookup[prop];isNamespace=obj&&obj.isNamespace}catch(e){continue}if(isNamespace){Ember.deprecate("Namespaces should not begin with lowercase.",/^[A-Z]/.test(prop));obj[NAME_KEY]=prop}}}var NAME_KEY=Ember.NAME_KEY=Ember.GUID_KEY+"_name";function superClassString(mixin){var superclass=mixin.superclass;if(superclass){if(superclass[NAME_KEY]){return superclass[NAME_KEY]}else{return superClassString(superclass)}}else{return}}function classToString(){if(!Ember.BOOTED&&!this[NAME_KEY]){processAllNamespaces()}var ret;if(this[NAME_KEY]){ret=this[NAME_KEY]}else{var str=superClassString(this);if(str){ret="(subclass of "+str+")"}else{ret="(unknown mixin)"}this.toString=makeToString(ret)}return ret}function processAllNamespaces(){var unprocessedNamespaces=!Namespace.PROCESSED,unprocessedMixins=Ember.anyUnprocessedMixins;if(unprocessedNamespaces){findNamespaces();Namespace.PROCESSED=true}if(unprocessedNamespaces||unprocessedMixins){var namespaces=Namespace.NAMESPACES,namespace;for(var i=0,l=namespaces.length;i<l;i++){namespace=namespaces[i];processNamespace([namespace.toString()],namespace,{})}Ember.anyUnprocessedMixins=false}}function makeToString(ret){return function(){return ret}}Ember.Mixin.prototype.toString=classToString})();(function(){Ember.Application=Ember.Namespace.extend()})();(function(){var OUT_OF_RANGE_EXCEPTION="Index out of range";var EMPTY=[];var get=Ember.get,set=Ember.set;Ember.ArrayProxy=Ember.Object.extend(Ember.MutableArray,{content:null,arrangedContent:Ember.computed.alias("content"),objectAtContent:function(idx){return get(this,"arrangedContent").objectAt(idx)},replaceContent:function(idx,amt,objects){get(this,"content").replace(idx,amt,objects)},_contentWillChange:Ember.beforeObserver(function(){this._teardownContent()},"content"),_teardownContent:function(){var content=get(this,"content");if(content){content.removeArrayObserver(this,{willChange:"contentArrayWillChange",didChange:"contentArrayDidChange"})}},contentArrayWillChange:Ember.K,contentArrayDidChange:Ember.K,_contentDidChange:Ember.observer(function(){var content=get(this,"content");Ember.assert("Can't set ArrayProxy's content to itself",content!==this);this._setupContent()},"content"),_setupContent:function(){var content=get(this,"content");if(content){content.addArrayObserver(this,{willChange:"contentArrayWillChange",didChange:"contentArrayDidChange"})}},_arrangedContentWillChange:Ember.beforeObserver(function(){var arrangedContent=get(this,"arrangedContent"),len=arrangedContent?get(arrangedContent,"length"):0;this.arrangedContentArrayWillChange(this,0,len,undefined);this.arrangedContentWillChange(this);this._teardownArrangedContent(arrangedContent)},"arrangedContent"),_arrangedContentDidChange:Ember.observer(function(){var arrangedContent=get(this,"arrangedContent"),len=arrangedContent?get(arrangedContent,"length"):0;Ember.assert("Can't set ArrayProxy's content to itself",arrangedContent!==this);this._setupArrangedContent();this.arrangedContentDidChange(this);this.arrangedContentArrayDidChange(this,0,undefined,len)},"arrangedContent"),_setupArrangedContent:function(){var arrangedContent=get(this,"arrangedContent");if(arrangedContent){arrangedContent.addArrayObserver(this,{willChange:"arrangedContentArrayWillChange",didChange:"arrangedContentArrayDidChange"})}},_teardownArrangedContent:function(){var arrangedContent=get(this,"arrangedContent");if(arrangedContent){arrangedContent.removeArrayObserver(this,{willChange:"arrangedContentArrayWillChange",didChange:"arrangedContentArrayDidChange"})}},arrangedContentWillChange:Ember.K,arrangedContentDidChange:Ember.K,objectAt:function(idx){return get(this,"content")&&this.objectAtContent(idx)},length:Ember.computed(function(){var arrangedContent=get(this,"arrangedContent");return arrangedContent?get(arrangedContent,"length"):0}),_replace:function(idx,amt,objects){var content=get(this,"content");Ember.assert("The content property of "+this.constructor+" should be set before modifying it",content);if(content)this.replaceContent(idx,amt,objects);return this},replace:function(){if(get(this,"arrangedContent")===get(this,"content")){this._replace.apply(this,arguments)}else{throw new Ember.Error("Using replace on an arranged ArrayProxy is not allowed.")}},_insertAt:function(idx,object){if(idx>get(this,"content.length"))throw new Error(OUT_OF_RANGE_EXCEPTION);this._replace(idx,0,[object]);return this},insertAt:function(idx,object){if(get(this,"arrangedContent")===get(this,"content")){return this._insertAt(idx,object)}else{throw new Ember.Error("Using insertAt on an arranged ArrayProxy is not allowed.")}},removeAt:function(start,len){if("number"===typeof start){var content=get(this,"content"),arrangedContent=get(this,"arrangedContent"),indices=[],i;if(start<0||start>=get(this,"length")){throw new Error(OUT_OF_RANGE_EXCEPTION)}if(len===undefined)len=1;for(i=start;i<start+len;i++){indices.push(content.indexOf(arrangedContent.objectAt(i)))}indices.sort(function(a,b){return b-a});Ember.beginPropertyChanges();for(i=0;i<indices.length;i++){this._replace(indices[i],1,EMPTY)}Ember.endPropertyChanges()}return this},pushObject:function(obj){this._insertAt(get(this,"content.length"),obj);return obj},pushObjects:function(objects){this._replace(get(this,"length"),0,objects);return this},setObjects:function(objects){if(objects.length===0)return this.clear();var len=get(this,"length");this._replace(0,len,objects);return this},unshiftObject:function(obj){this._insertAt(0,obj);return obj},unshiftObjects:function(objects){this._replace(0,0,objects);return this},slice:function(){var arr=this.toArray();return arr.slice.apply(arr,arguments)},arrangedContentArrayWillChange:function(item,idx,removedCnt,addedCnt){this.arrayContentWillChange(idx,removedCnt,addedCnt)},arrangedContentArrayDidChange:function(item,idx,removedCnt,addedCnt){this.arrayContentDidChange(idx,removedCnt,addedCnt)},init:function(){this._super();this._setupContent();this._setupArrangedContent()},willDestroy:function(){this._teardownArrangedContent();this._teardownContent()}})})();(function(){var get=Ember.get,set=Ember.set,fmt=Ember.String.fmt,addBeforeObserver=Ember.addBeforeObserver,addObserver=Ember.addObserver,removeBeforeObserver=Ember.removeBeforeObserver,removeObserver=Ember.removeObserver,propertyWillChange=Ember.propertyWillChange,propertyDidChange=Ember.propertyDidChange;function contentPropertyWillChange(content,contentKey){var key=contentKey.slice(8);if(key in this){return}propertyWillChange(this,key)}function contentPropertyDidChange(content,contentKey){var key=contentKey.slice(8);if(key in this){return}propertyDidChange(this,key)}Ember.ObjectProxy=Ember.Object.extend({content:null,_contentDidChange:Ember.observer(function(){Ember.assert("Can't set ObjectProxy's content to itself",this.get("content")!==this)},"content"),isTruthy:Ember.computed.bool("content"),_debugContainerKey:null,willWatchProperty:function(key){var contentKey="content."+key;addBeforeObserver(this,contentKey,null,contentPropertyWillChange);addObserver(this,contentKey,null,contentPropertyDidChange)},didUnwatchProperty:function(key){var contentKey="content."+key;removeBeforeObserver(this,contentKey,null,contentPropertyWillChange);removeObserver(this,contentKey,null,contentPropertyDidChange)},unknownProperty:function(key){var content=get(this,"content");if(content){return get(content,key)}},setUnknownProperty:function(key,value){var content=get(this,"content");Ember.assert(fmt("Cannot delegate set('%@', %@) to the 'content' property of object proxy %@: its 'content' is undefined.",[key,value,this]),content);return set(content,key,value)}});Ember.ObjectProxy.reopenClass({create:function(){var mixin,prototype,i,l,properties,keyName;if(arguments.length){prototype=this.proto();for(i=0,l=arguments.length;i<l;i++){properties=arguments[i];for(keyName in properties){if(!properties.hasOwnProperty(keyName)||keyName in prototype){continue}if(!mixin)mixin={};mixin[keyName]=null}}if(mixin)this._initMixins([mixin])}return this._super.apply(this,arguments)}})})();(function(){var set=Ember.set,get=Ember.get,guidFor=Ember.guidFor;var forEach=Ember.EnumerableUtils.forEach;var EachArray=Ember.Object.extend(Ember.Array,{init:function(content,keyName,owner){this._super();this._keyName=keyName;this._owner=owner;this._content=content},objectAt:function(idx){var item=this._content.objectAt(idx);return item&&get(item,this._keyName)},length:Ember.computed(function(){var content=this._content;return content?get(content,"length"):0})});var IS_OBSERVER=/^.+:(before|change)$/;function addObserverForContentKey(content,keyName,proxy,idx,loc){var objects=proxy._objects,guid;if(!objects)objects=proxy._objects={};while(--loc>=idx){var item=content.objectAt(loc);if(item){Ember.addBeforeObserver(item,keyName,proxy,"contentKeyWillChange");Ember.addObserver(item,keyName,proxy,"contentKeyDidChange");guid=guidFor(item);if(!objects[guid])objects[guid]=[];objects[guid].push(loc)}}}function removeObserverForContentKey(content,keyName,proxy,idx,loc){var objects=proxy._objects;if(!objects)objects=proxy._objects={};var indicies,guid;while(--loc>=idx){var item=content.objectAt(loc);if(item){Ember.removeBeforeObserver(item,keyName,proxy,"contentKeyWillChange");Ember.removeObserver(item,keyName,proxy,"contentKeyDidChange");guid=guidFor(item);indicies=objects[guid];indicies[indicies.indexOf(loc)]=null}}}Ember.EachProxy=Ember.Object.extend({init:function(content){this._super();this._content=content;content.addArrayObserver(this);forEach(Ember.watchedEvents(this),function(eventName){this.didAddListener(eventName)},this)},unknownProperty:function(keyName,value){var ret;ret=new EachArray(this._content,keyName,this);Ember.defineProperty(this,keyName,null,ret);this.beginObservingContentKey(keyName);return ret},arrayWillChange:function(content,idx,removedCnt,addedCnt){var keys=this._keys,key,lim;lim=removedCnt>0?idx+removedCnt:-1;Ember.beginPropertyChanges(this);for(key in keys){if(!keys.hasOwnProperty(key)){continue}if(lim>0)removeObserverForContentKey(content,key,this,idx,lim);Ember.propertyWillChange(this,key)}Ember.propertyWillChange(this._content,"@each");Ember.endPropertyChanges(this)},arrayDidChange:function(content,idx,removedCnt,addedCnt){var keys=this._keys,key,lim;lim=addedCnt>0?idx+addedCnt:-1;Ember.beginPropertyChanges(this);for(key in keys){if(!keys.hasOwnProperty(key)){continue}if(lim>0)addObserverForContentKey(content,key,this,idx,lim);Ember.propertyDidChange(this,key)}Ember.propertyDidChange(this._content,"@each");Ember.endPropertyChanges(this)},didAddListener:function(eventName){if(IS_OBSERVER.test(eventName)){this.beginObservingContentKey(eventName.slice(0,-7))}},didRemoveListener:function(eventName){if(IS_OBSERVER.test(eventName)){this.stopObservingContentKey(eventName.slice(0,-7))}},beginObservingContentKey:function(keyName){var keys=this._keys;if(!keys)keys=this._keys={};if(!keys[keyName]){keys[keyName]=1;var content=this._content,len=get(content,"length");addObserverForContentKey(content,keyName,this,0,len)}else{keys[keyName]++}},stopObservingContentKey:function(keyName){var keys=this._keys;if(keys&&keys[keyName]>0&&--keys[keyName]<=0){var content=this._content,len=get(content,"length");removeObserverForContentKey(content,keyName,this,0,len)}},contentKeyWillChange:function(obj,keyName){Ember.propertyWillChange(this,keyName)},contentKeyDidChange:function(obj,keyName){Ember.propertyDidChange(this,keyName)}})})();(function(){var get=Ember.get,set=Ember.set;var NativeArray=Ember.Mixin.create(Ember.MutableArray,Ember.Observable,Ember.Copyable,{get:function(key){if(key==="length")return this.length;else if("number"===typeof key)return this[key];else return this._super(key)},objectAt:function(idx){return this[idx]},replace:function(idx,amt,objects){if(this.isFrozen)throw Ember.FROZEN_ERROR;var len=objects?get(objects,"length"):0;this.arrayContentWillChange(idx,amt,len);if(!objects||objects.length===0){this.splice(idx,amt)}else{var args=[idx,amt].concat(objects);this.splice.apply(this,args)}this.arrayContentDidChange(idx,amt,len);return this},unknownProperty:function(key,value){var ret;if(value!==undefined&&ret===undefined){ret=this[key]=value}return ret},indexOf:function(object,startAt){var idx,len=this.length;if(startAt===undefined)startAt=0;else startAt=startAt<0?Math.ceil(startAt):Math.floor(startAt);if(startAt<0)startAt+=len;for(idx=startAt;idx<len;idx++){if(this[idx]===object)return idx}return-1},lastIndexOf:function(object,startAt){var idx,len=this.length;if(startAt===undefined)startAt=len-1;else startAt=startAt<0?Math.ceil(startAt):Math.floor(startAt);if(startAt<0)startAt+=len;for(idx=startAt;idx>=0;idx--){if(this[idx]===object)return idx}return-1},copy:function(deep){if(deep){return this.map(function(item){return Ember.copy(item,true)})}return this.slice()}});var ignore=["length"];Ember.EnumerableUtils.forEach(NativeArray.keys(),function(methodName){if(Array.prototype[methodName])ignore.push(methodName)});if(ignore.length>0){NativeArray=NativeArray.without.apply(NativeArray,ignore)}Ember.NativeArray=NativeArray;Ember.A=function(arr){if(arr===undefined){arr=[]}return Ember.Array.detect(arr)?arr:Ember.NativeArray.apply(arr)};Ember.NativeArray.activate=function(){NativeArray.apply(Array.prototype);Ember.A=function(arr){return arr||[]}};if(Ember.EXTEND_PROTOTYPES===true||Ember.EXTEND_PROTOTYPES.Array){Ember.NativeArray.activate()}})();(function(){var get=Ember.get,set=Ember.set,guidFor=Ember.guidFor,none=Ember.isNone,fmt=Ember.String.fmt;Ember.Set=Ember.CoreObject.extend(Ember.MutableEnumerable,Ember.Copyable,Ember.Freezable,{length:0,clear:function(){if(this.isFrozen){throw new Error(Ember.FROZEN_ERROR)}var len=get(this,"length");if(len===0){return this}var guid;this.enumerableContentWillChange(len,0);Ember.propertyWillChange(this,"firstObject");Ember.propertyWillChange(this,"lastObject");for(var i=0;i<len;i++){guid=guidFor(this[i]);delete this[guid];delete this[i]}set(this,"length",0);Ember.propertyDidChange(this,"firstObject");Ember.propertyDidChange(this,"lastObject");this.enumerableContentDidChange(len,0);return this},isEqual:function(obj){if(!Ember.Enumerable.detect(obj))return false;var loc=get(this,"length");if(get(obj,"length")!==loc)return false;while(--loc>=0){if(!obj.contains(this[loc]))return false}return true},add:Ember.aliasMethod("addObject"),remove:Ember.aliasMethod("removeObject"),pop:function(){if(get(this,"isFrozen"))throw new Error(Ember.FROZEN_ERROR);var obj=this.length>0?this[this.length-1]:null;this.remove(obj);return obj},push:Ember.aliasMethod("addObject"),shift:Ember.aliasMethod("pop"),unshift:Ember.aliasMethod("push"),addEach:Ember.aliasMethod("addObjects"),removeEach:Ember.aliasMethod("removeObjects"),init:function(items){this._super();if(items)this.addObjects(items)},nextObject:function(idx){return this[idx]},firstObject:Ember.computed(function(){return this.length>0?this[0]:undefined}),lastObject:Ember.computed(function(){return this.length>0?this[this.length-1]:undefined}),addObject:function(obj){if(get(this,"isFrozen"))throw new Error(Ember.FROZEN_ERROR);if(none(obj))return this;var guid=guidFor(obj),idx=this[guid],len=get(this,"length"),added;if(idx>=0&&idx<len&&this[idx]===obj)return this;added=[obj];this.enumerableContentWillChange(null,added);Ember.propertyWillChange(this,"lastObject");len=get(this,"length");this[guid]=len;this[len]=obj;set(this,"length",len+1);Ember.propertyDidChange(this,"lastObject");this.enumerableContentDidChange(null,added);return this},removeObject:function(obj){if(get(this,"isFrozen"))throw new Error(Ember.FROZEN_ERROR);if(none(obj))return this;var guid=guidFor(obj),idx=this[guid],len=get(this,"length"),isFirst=idx===0,isLast=idx===len-1,last,removed;if(idx>=0&&idx<len&&this[idx]===obj){removed=[obj];this.enumerableContentWillChange(removed,null);if(isFirst){Ember.propertyWillChange(this,"firstObject")}if(isLast){Ember.propertyWillChange(this,"lastObject")}if(idx<len-1){last=this[len-1];this[idx]=last;this[guidFor(last)]=idx}delete this[guid];delete this[len-1];set(this,"length",len-1);if(isFirst){Ember.propertyDidChange(this,"firstObject")}if(isLast){Ember.propertyDidChange(this,"lastObject")}this.enumerableContentDidChange(removed,null)}return this},contains:function(obj){return this[guidFor(obj)]>=0},copy:function(){var C=this.constructor,ret=new C,loc=get(this,"length");set(ret,"length",loc);while(--loc>=0){ret[loc]=this[loc];ret[guidFor(this[loc])]=loc}return ret},toString:function(){var len=this.length,idx,array=[];for(idx=0;idx<len;idx++){array[idx]=this[idx]}return fmt("Ember.Set<%@>",[array.join(",")])}})})();(function(){var DeferredMixin=Ember.DeferredMixin,get=Ember.get;var Deferred=Ember.Object.extend(DeferredMixin);Deferred.reopenClass({promise:function(callback,binding){var deferred=Deferred.create();callback.call(binding,deferred);return get(deferred,"promise")}});Ember.Deferred=Deferred})();(function(){var loadHooks=Ember.ENV.EMBER_LOAD_HOOKS||{};var loaded={};Ember.onLoad=function(name,callback){var object;loadHooks[name]=loadHooks[name]||Ember.A();loadHooks[name].pushObject(callback);if(object=loaded[name]){callback(object)}};Ember.runLoadHooks=function(name,object){var hooks;loaded[name]=object;if(hooks=loadHooks[name]){loadHooks[name].forEach(function(callback){callback(object)})}}})();(function(){})();(function(){var get=Ember.get;Ember.ControllerMixin=Ember.Mixin.create({isController:true,target:null,container:null,store:null,model:Ember.computed.alias("content"),send:function(actionName){var args=[].slice.call(arguments,1),target;if(this[actionName]){Ember.assert("The controller "+this+" does not have the action "+actionName,typeof this[actionName]==="function");this[actionName].apply(this,args)}else if(target=get(this,"target")){Ember.assert("The target for controller "+this+" ("+target+") did not define a `send` method",typeof target.send==="function");target.send.apply(target,arguments)}}});Ember.Controller=Ember.Object.extend(Ember.ControllerMixin)})();(function(){var get=Ember.get,set=Ember.set,forEach=Ember.EnumerableUtils.forEach;Ember.SortableMixin=Ember.Mixin.create(Ember.MutableEnumerable,{sortProperties:null,sortAscending:true,orderBy:function(item1,item2){var result=0,sortProperties=get(this,"sortProperties"),sortAscending=get(this,"sortAscending");Ember.assert("you need to define `sortProperties`",!!sortProperties);forEach(sortProperties,function(propertyName){if(result===0){result=Ember.compare(get(item1,propertyName),get(item2,propertyName));
if(result!==0&&!sortAscending){result=-1*result}}});return result},destroy:function(){var content=get(this,"content"),sortProperties=get(this,"sortProperties");if(content&&sortProperties){forEach(content,function(item){forEach(sortProperties,function(sortProperty){Ember.removeObserver(item,sortProperty,this,"contentItemSortPropertyDidChange")},this)},this)}return this._super()},isSorted:Ember.computed.bool("sortProperties"),arrangedContent:Ember.computed("content","sortProperties.@each",function(key,value){var content=get(this,"content"),isSorted=get(this,"isSorted"),sortProperties=get(this,"sortProperties"),self=this;if(content&&isSorted){content=content.slice();content.sort(function(item1,item2){return self.orderBy(item1,item2)});forEach(content,function(item){forEach(sortProperties,function(sortProperty){Ember.addObserver(item,sortProperty,this,"contentItemSortPropertyDidChange")},this)},this);return Ember.A(content)}return content}),_contentWillChange:Ember.beforeObserver(function(){var content=get(this,"content"),sortProperties=get(this,"sortProperties");if(content&&sortProperties){forEach(content,function(item){forEach(sortProperties,function(sortProperty){Ember.removeObserver(item,sortProperty,this,"contentItemSortPropertyDidChange")},this)},this)}this._super()},"content"),sortAscendingWillChange:Ember.beforeObserver(function(){this._lastSortAscending=get(this,"sortAscending")},"sortAscending"),sortAscendingDidChange:Ember.observer(function(){if(get(this,"sortAscending")!==this._lastSortAscending){var arrangedContent=get(this,"arrangedContent");arrangedContent.reverseObjects()}},"sortAscending"),contentArrayWillChange:function(array,idx,removedCount,addedCount){var isSorted=get(this,"isSorted");if(isSorted){var arrangedContent=get(this,"arrangedContent");var removedObjects=array.slice(idx,idx+removedCount);var sortProperties=get(this,"sortProperties");forEach(removedObjects,function(item){arrangedContent.removeObject(item);forEach(sortProperties,function(sortProperty){Ember.removeObserver(item,sortProperty,this,"contentItemSortPropertyDidChange")},this)},this)}return this._super(array,idx,removedCount,addedCount)},contentArrayDidChange:function(array,idx,removedCount,addedCount){var isSorted=get(this,"isSorted"),sortProperties=get(this,"sortProperties");if(isSorted){var addedObjects=array.slice(idx,idx+addedCount);forEach(addedObjects,function(item){this.insertItemSorted(item);forEach(sortProperties,function(sortProperty){Ember.addObserver(item,sortProperty,this,"contentItemSortPropertyDidChange")},this)},this)}return this._super(array,idx,removedCount,addedCount)},insertItemSorted:function(item){var arrangedContent=get(this,"arrangedContent");var length=get(arrangedContent,"length");var idx=this._binarySearch(item,0,length);arrangedContent.insertAt(idx,item)},contentItemSortPropertyDidChange:function(item){var arrangedContent=get(this,"arrangedContent"),oldIndex=arrangedContent.indexOf(item),leftItem=arrangedContent.objectAt(oldIndex-1),rightItem=arrangedContent.objectAt(oldIndex+1),leftResult=leftItem&&this.orderBy(item,leftItem),rightResult=rightItem&&this.orderBy(item,rightItem);if(leftResult<0||rightResult>0){arrangedContent.removeObject(item);this.insertItemSorted(item)}},_binarySearch:function(item,low,high){var mid,midItem,res,arrangedContent;if(low===high){return low}arrangedContent=get(this,"arrangedContent");mid=low+Math.floor((high-low)/2);midItem=arrangedContent.objectAt(mid);res=this.orderBy(midItem,item);if(res<0){return this._binarySearch(item,mid+1,high)}else if(res>0){return this._binarySearch(item,low,mid)}return mid}})})();(function(){var get=Ember.get,set=Ember.set,forEach=Ember.EnumerableUtils.forEach,replace=Ember.EnumerableUtils.replace;Ember.ArrayController=Ember.ArrayProxy.extend(Ember.ControllerMixin,Ember.SortableMixin,{itemController:null,lookupItemController:function(object){return get(this,"itemController")},objectAtContent:function(idx){var length=get(this,"length"),arrangedContent=get(this,"arrangedContent"),object=arrangedContent&&arrangedContent.objectAt(idx);if(idx>=0&&idx<length){var controllerClass=this.lookupItemController(object);if(controllerClass){return this.controllerAt(idx,object,controllerClass)}}return object},arrangedContentDidChange:function(){this._super();this._resetSubControllers()},arrayContentDidChange:function(idx,removedCnt,addedCnt){var subControllers=get(this,"_subControllers"),subControllersToRemove=subControllers.slice(idx,idx+removedCnt);forEach(subControllersToRemove,function(subController){if(subController){subController.destroy()}});replace(subControllers,idx,removedCnt,new Array(addedCnt));this._super(idx,removedCnt,addedCnt)},init:function(){this._super();if(!this.get("content")){Ember.defineProperty(this,"content",undefined,Ember.A())}this.set("_subControllers",Ember.A())},controllerAt:function(idx,object,controllerClass){var container=get(this,"container"),subControllers=get(this,"_subControllers"),subController=subControllers[idx];if(!subController){subController=container.lookup("controller:"+controllerClass,{singleton:false});subControllers[idx]=subController}if(!subController){throw new Error('Could not resolve itemController: "'+controllerClass+'"')}subController.set("target",this);subController.set("content",object);return subController},_subControllers:null,_resetSubControllers:function(){var subControllers=get(this,"_subControllers");forEach(subControllers,function(subController){if(subController){subController.destroy()}});this.set("_subControllers",Ember.A())}})})();(function(){Ember.ObjectController=Ember.ObjectProxy.extend(Ember.ControllerMixin)})();(function(){})();(function(){})();(function(){var jQuery=Ember.imports.jQuery;Ember.assert("Ember Views require jQuery 1.8 or 1.9",jQuery&&(jQuery().jquery.match(/^1\.(8|9)(\.\d+)?(pre|rc\d?)?/)||Ember.ENV.FORCE_JQUERY));Ember.$=jQuery})();(function(){if(Ember.$){var dragEvents=Ember.String.w("dragstart drag dragenter dragleave dragover drop dragend");Ember.EnumerableUtils.forEach(dragEvents,function(eventName){Ember.$.event.fixHooks[eventName]={props:["dataTransfer"]}})}})();(function(){var needsShy=this.document&&function(){var testEl=document.createElement("div");testEl.innerHTML="<div></div>";testEl.firstChild.innerHTML="<script></script>";return testEl.firstChild.innerHTML===""}();var movesWhitespace=this.document&&function(){var testEl=document.createElement("div");testEl.innerHTML="Test: <script type='text/x-placeholder'></script>Value";return testEl.childNodes[0].nodeValue==="Test:"&&testEl.childNodes[2].nodeValue===" Value"}();var findChildById=function(element,id){if(element.getAttribute("id")===id){return element}var len=element.childNodes.length,idx,node,found;for(idx=0;idx<len;idx++){node=element.childNodes[idx];found=node.nodeType===1&&findChildById(node,id);if(found){return found}}};var setInnerHTMLWithoutFix=function(element,html){if(needsShy){html="&shy;"+html}var matches=[];if(movesWhitespace){html=html.replace(/(\s+)(<script id='([^']+)')/g,function(match,spaces,tag,id){matches.push([id,spaces]);return tag})}element.innerHTML=html;if(matches.length>0){var len=matches.length,idx;for(idx=0;idx<len;idx++){var script=findChildById(element,matches[idx][0]),node=document.createTextNode(matches[idx][1]);script.parentNode.insertBefore(node,script)}}if(needsShy){var shyElement=element.firstChild;while(shyElement.nodeType===1&&!shyElement.nodeName){shyElement=shyElement.firstChild}if(shyElement.nodeType===3&&shyElement.nodeValue.charAt(0)==="­"){shyElement.nodeValue=shyElement.nodeValue.slice(1)}}};var innerHTMLTags={};var canSetInnerHTML=function(tagName){if(innerHTMLTags[tagName]!==undefined){return innerHTMLTags[tagName]}var canSet=true;if(tagName.toLowerCase()==="select"){var el=document.createElement("select");setInnerHTMLWithoutFix(el,'<option value="test">Test</option>');canSet=el.options.length===1}innerHTMLTags[tagName]=canSet;return canSet};var setInnerHTML=function(element,html){var tagName=element.tagName;if(canSetInnerHTML(tagName)){setInnerHTMLWithoutFix(element,html)}else{Ember.assert("Can't set innerHTML on "+element.tagName+" in this browser",element.outerHTML);var startTag=element.outerHTML.match(new RegExp("<"+tagName+"([^>]*)>","i"))[0],endTag="</"+tagName+">";var wrapper=document.createElement("div");setInnerHTMLWithoutFix(wrapper,startTag+html+endTag);element=wrapper.firstChild;while(element.tagName!==tagName){element=element.nextSibling}}return element};function isSimpleClick(event){var modifier=event.shiftKey||event.metaKey||event.altKey||event.ctrlKey,secondaryClick=event.which>1;return!modifier&&!secondaryClick}Ember.ViewUtils={setInnerHTML:setInnerHTML,isSimpleClick:isSimpleClick}})();(function(){var get=Ember.get,set=Ember.set;var ClassSet=function(){this.seen={};this.list=[]};ClassSet.prototype={add:function(string){if(string in this.seen){return}this.seen[string]=true;this.list.push(string)},toDOM:function(){return this.list.join(" ")}};Ember.RenderBuffer=function(tagName){return new Ember._RenderBuffer(tagName)};Ember._RenderBuffer=function(tagName){this.tagNames=[tagName||null];this.buffer=[]};Ember._RenderBuffer.prototype={_element:null,elementClasses:null,classes:null,elementId:null,elementAttributes:null,elementProperties:null,elementTag:null,elementStyle:null,parentBuffer:null,push:function(string){this.buffer.push(string);return this},addClass:function(className){this.elementClasses=this.elementClasses||new ClassSet;this.elementClasses.add(className);this.classes=this.elementClasses.list;return this},setClasses:function(classNames){this.classes=classNames},id:function(id){this.elementId=id;return this},attr:function(name,value){var attributes=this.elementAttributes=this.elementAttributes||{};if(arguments.length===1){return attributes[name]}else{attributes[name]=value}return this},removeAttr:function(name){var attributes=this.elementAttributes;if(attributes){delete attributes[name]}return this},prop:function(name,value){var properties=this.elementProperties=this.elementProperties||{};if(arguments.length===1){return properties[name]}else{properties[name]=value}return this},removeProp:function(name){var properties=this.elementProperties;if(properties){delete properties[name]}return this},style:function(name,value){this.elementStyle=this.elementStyle||{};this.elementStyle[name]=value;return this},begin:function(tagName){this.tagNames.push(tagName||null);return this},pushOpeningTag:function(){var tagName=this.currentTagName();if(!tagName){return}if(!this._element&&this.buffer.length===0){this._element=this.generateElement();return}var buffer=this.buffer,id=this.elementId,classes=this.classes,attrs=this.elementAttributes,props=this.elementProperties,style=this.elementStyle,attr,prop;buffer.push("<"+tagName);if(id){buffer.push(' id="'+this._escapeAttribute(id)+'"');this.elementId=null}if(classes){buffer.push(' class="'+this._escapeAttribute(classes.join(" "))+'"');this.classes=null}if(style){buffer.push(' style="');for(prop in style){if(style.hasOwnProperty(prop)){buffer.push(prop+":"+this._escapeAttribute(style[prop])+";")}}buffer.push('"');this.elementStyle=null}if(attrs){for(attr in attrs){if(attrs.hasOwnProperty(attr)){buffer.push(" "+attr+'="'+this._escapeAttribute(attrs[attr])+'"')}}this.elementAttributes=null}if(props){for(prop in props){if(props.hasOwnProperty(prop)){var value=props[prop];if(value||typeof value==="number"){if(value===true){buffer.push(" "+prop+'="'+prop+'"')}else{buffer.push(" "+prop+'="'+this._escapeAttribute(props[prop])+'"')}}}}this.elementProperties=null}buffer.push(">")},pushClosingTag:function(){var tagName=this.tagNames.pop();if(tagName){this.buffer.push("</"+tagName+">")}},currentTagName:function(){return this.tagNames[this.tagNames.length-1]},generateElement:function(){var tagName=this.tagNames.pop(),element=document.createElement(tagName),$element=Ember.$(element),id=this.elementId,classes=this.classes,attrs=this.elementAttributes,props=this.elementProperties,style=this.elementStyle,styleBuffer="",attr,prop;if(id){$element.attr("id",id);this.elementId=null}if(classes){$element.attr("class",classes.join(" "));this.classes=null}if(style){for(prop in style){if(style.hasOwnProperty(prop)){styleBuffer+=prop+":"+style[prop]+";"}}$element.attr("style",styleBuffer);this.elementStyle=null}if(attrs){for(attr in attrs){if(attrs.hasOwnProperty(attr)){$element.attr(attr,attrs[attr])}}this.elementAttributes=null}if(props){for(prop in props){if(props.hasOwnProperty(prop)){$element.prop(prop,props[prop])}}this.elementProperties=null}return element},element:function(){var html=this.innerString();if(html){this._element=Ember.ViewUtils.setInnerHTML(this._element,html)}return this._element},string:function(){if(this._element){return this.element().outerHTML}else{return this.innerString()}},innerString:function(){return this.buffer.join("")},_escapeAttribute:function(value){var escape={"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};var badChars=/&(?!\w+;)|[<>"'`]/g;var possible=/[&<>"'`]/;var escapeChar=function(chr){return escape[chr]||"&amp;"};var string=value.toString();if(!possible.test(string)){return string}return string.replace(badChars,escapeChar)}}})();(function(){var get=Ember.get,set=Ember.set,fmt=Ember.String.fmt;Ember.EventDispatcher=Ember.Object.extend({rootElement:"body",setup:function(addedEvents){var event,events={touchstart:"touchStart",touchmove:"touchMove",touchend:"touchEnd",touchcancel:"touchCancel",keydown:"keyDown",keyup:"keyUp",keypress:"keyPress",mousedown:"mouseDown",mouseup:"mouseUp",contextmenu:"contextMenu",click:"click",dblclick:"doubleClick",mousemove:"mouseMove",focusin:"focusIn",focusout:"focusOut",mouseenter:"mouseEnter",mouseleave:"mouseLeave",submit:"submit",input:"input",change:"change",dragstart:"dragStart",drag:"drag",dragenter:"dragEnter",dragleave:"dragLeave",dragover:"dragOver",drop:"drop",dragend:"dragEnd"};Ember.$.extend(events,addedEvents||{});var rootElement=Ember.$(get(this,"rootElement"));Ember.assert(fmt("You cannot use the same root element (%@) multiple times in an Ember.Application",[rootElement.selector||rootElement[0].tagName]),!rootElement.is(".ember-application"));Ember.assert("You cannot make a new Ember.Application using a root element that is a descendent of an existing Ember.Application",!rootElement.closest(".ember-application").length);Ember.assert("You cannot make a new Ember.Application using a root element that is an ancestor of an existing Ember.Application",!rootElement.find(".ember-application").length);rootElement.addClass("ember-application");Ember.assert('Unable to add "ember-application" class to rootElement. Make sure you set rootElement to the body or an element in the body.',rootElement.is(".ember-application"));for(event in events){if(events.hasOwnProperty(event)){this.setupHandler(rootElement,event,events[event])}}},setupHandler:function(rootElement,event,eventName){var self=this;rootElement.delegate(".ember-view",event+".ember",function(evt,triggeringManager){return Ember.handleErrors(function(){var view=Ember.View.views[this.id],result=true,manager=null;manager=self._findNearestEventManager(view,eventName);if(manager&&manager!==triggeringManager){result=self._dispatchEvent(manager,evt,eventName,view)}else if(view){result=self._bubbleEvent(view,evt,eventName)}else{evt.stopPropagation()}return result},this)});rootElement.delegate("[data-ember-action]",event+".ember",function(evt){return Ember.handleErrors(function(){var actionId=Ember.$(evt.currentTarget).attr("data-ember-action"),action=Ember.Handlebars.ActionHelper.registeredActions[actionId];if(action&&action.eventName===eventName){return action.handler(evt)}},this)})},_findNearestEventManager:function(view,eventName){var manager=null;while(view){manager=get(view,"eventManager");if(manager&&manager[eventName]){break}view=get(view,"parentView")}return manager},_dispatchEvent:function(object,evt,eventName,view){var result=true;var handler=object[eventName];if(Ember.typeOf(handler)==="function"){result=handler.call(object,evt,view);evt.stopPropagation()}else{result=this._bubbleEvent(view,evt,eventName)}return result},_bubbleEvent:function(view,evt,eventName){return Ember.run(function(){return view.handleEvent(eventName,evt)})},destroy:function(){var rootElement=get(this,"rootElement");Ember.$(rootElement).undelegate(".ember").removeClass("ember-application");return this._super()}})})();(function(){var queues=Ember.run.queues,indexOf=Ember.ArrayPolyfills.indexOf;queues.splice(indexOf.call(queues,"actions")+1,0,"render","afterRender")})();(function(){var get=Ember.get,set=Ember.set;Ember.ControllerMixin.reopen({target:null,namespace:null,view:null,container:null,_childContainers:null,init:function(){this._super();set(this,"_childContainers",{})},_modelDidChange:Ember.observer(function(){var containers=get(this,"_childContainers");for(var prop in containers){if(!containers.hasOwnProperty(prop)){continue}containers[prop].destroy()}set(this,"_childContainers",{})},"model")})})();(function(){})();(function(){var states={};var get=Ember.get,set=Ember.set;var guidFor=Ember.guidFor;var a_forEach=Ember.EnumerableUtils.forEach;var a_addObject=Ember.EnumerableUtils.addObject;var childViewsProperty=Ember.computed(function(){var childViews=this._childViews,ret=Ember.A(),view=this;a_forEach(childViews,function(view){if(view.isVirtual){ret.pushObjects(get(view,"childViews"))}else{ret.push(view)}});ret.replace=function(idx,removedCount,addedViews){if(view instanceof Ember.ContainerView){Ember.deprecate("Manipulating an Ember.ContainerView through its childViews property is deprecated. Please use the ContainerView instance itself as an Ember.MutableArray.");return view.replace(idx,removedCount,addedViews)}throw new Error("childViews is immutable")};return ret});Ember.warn("The VIEW_PRESERVES_CONTEXT flag has been removed and the functionality can no longer be disabled.",Ember.ENV.VIEW_PRESERVES_CONTEXT!==false);Ember.TEMPLATES={};Ember.CoreView=Ember.Object.extend(Ember.Evented,{isView:true,states:states,init:function(){this._super();if(!this.isVirtual){Ember.assert("Attempted to register a view with an id already in use: "+this.elementId,!Ember.View.views[this.elementId]);Ember.View.views[this.elementId]=this}this.addBeforeObserver("elementId",function(){throw new Error("Changing a view's elementId after creation is not allowed")});this.transitionTo("preRender")},parentView:Ember.computed(function(){var parent=this._parentView;if(parent&&parent.isVirtual){return get(parent,"parentView")}else{return parent}}).property("_parentView"),state:null,_parentView:null,concreteView:Ember.computed(function(){if(!this.isVirtual){return this}else{return get(this,"parentView")}}).property("parentView").volatile(),instrumentName:"core_view",instrumentDetails:function(hash){hash.object=this.toString()},renderToBuffer:function(parentBuffer,bufferOperation){var name="render."+this.instrumentName,details={};this.instrumentDetails(details);return Ember.instrument(name,details,function(){return this._renderToBuffer(parentBuffer,bufferOperation)},this)},_renderToBuffer:function(parentBuffer,bufferOperation){Ember.run.sync();var tagName=this.tagName;if(tagName===null||tagName===undefined){tagName="div"}var buffer=this.buffer=parentBuffer&&parentBuffer.begin(tagName)||Ember.RenderBuffer(tagName);this.transitionTo("inBuffer",false);this.beforeRender(buffer);this.render(buffer);this.afterRender(buffer);return buffer},trigger:function(name){this._super.apply(this,arguments);var method=this[name];if(method){var args=[],i,l;for(i=1,l=arguments.length;i<l;i++){args.push(arguments[i])}return method.apply(this,args)}},has:function(name){return Ember.typeOf(this[name])==="function"||this._super(name)},willDestroy:function(){var parent=this._parentView;if(!this.removedFromDOM){this.destroyElement()}if(parent){parent.removeChild(this)}this.transitionTo("destroyed");if(!this.isVirtual)delete Ember.View.views[this.elementId]},clearRenderedChildren:Ember.K,triggerRecursively:Ember.K,invokeRecursively:Ember.K,transitionTo:Ember.K,destroyElement:Ember.K});Ember.View=Ember.CoreView.extend({concatenatedProperties:["classNames","classNameBindings","attributeBindings"],isView:true,templateName:null,layoutName:null,templates:Ember.TEMPLATES,template:Ember.computed(function(key,value){if(value!==undefined){return value}var templateName=get(this,"templateName"),template=this.templateForName(templateName,"template");Ember.assert("You specified the templateName "+templateName+" for "+this+", but it did not exist.",!templateName||template);return template||get(this,"defaultTemplate")}).property("templateName"),container:Ember.computed(function(){var parentView=get(this,"_parentView");if(parentView){return get(parentView,"container")}return Ember.Container&&Ember.Container.defaultContainer}),controller:Ember.computed(function(key){var parentView=get(this,"_parentView");return parentView?get(parentView,"controller"):null}).property("_parentView"),layout:Ember.computed(function(key){var layoutName=get(this,"layoutName"),layout=this.templateForName(layoutName,"layout");Ember.assert("You specified the layoutName "+layoutName+" for "+this+", but it did not exist.",!layoutName||layout);return layout||get(this,"defaultLayout")}).property("layoutName"),templateForName:function(name,type){if(!name){return}Ember.assert("templateNames are not allowed to contain periods: "+name,name.indexOf(".")===-1);var container=get(this,"container");if(container){return container.lookup("template:"+name)}},context:Ember.computed(function(key,value){if(arguments.length===2){set(this,"_context",value);return value}else{return get(this,"_context")}}).volatile(),_context:Ember.computed(function(key){var parentView,controller;if(controller=get(this,"controller")){return controller}parentView=this._parentView;if(parentView){return get(parentView,"_context")}return null}),_contextDidChange:Ember.observer(function(){this.rerender()},"context"),isVisible:true,childViews:childViewsProperty,_childViews:[],_childViewsWillChange:Ember.beforeObserver(function(){if(this.isVirtual){var parentView=get(this,"parentView");if(parentView){Ember.propertyWillChange(parentView,"childViews")}}},"childViews"),_childViewsDidChange:Ember.observer(function(){if(this.isVirtual){var parentView=get(this,"parentView");if(parentView){Ember.propertyDidChange(parentView,"childViews")}}},"childViews"),nearestInstanceOf:function(klass){Ember.deprecate("nearestInstanceOf is deprecated and will be removed from future releases. Use nearestOfType.");var view=get(this,"parentView");while(view){if(view instanceof klass){return view}view=get(view,"parentView")}},nearestOfType:function(klass){var view=get(this,"parentView"),isOfType=klass instanceof Ember.Mixin?function(view){return klass.detect(view)}:function(view){return klass.detect(view.constructor)};while(view){if(isOfType(view)){return view}view=get(view,"parentView")}},nearestWithProperty:function(property){var view=get(this,"parentView");while(view){if(property in view){return view}view=get(view,"parentView")}},nearestChildOf:function(klass){var view=get(this,"parentView");while(view){if(get(view,"parentView")instanceof klass){return view}view=get(view,"parentView")}},_parentViewDidChange:Ember.observer(function(){if(this.isDestroying){return}if(get(this,"parentView.controller")&&!get(this,"controller")){this.notifyPropertyChange("controller")}},"_parentView"),_controllerDidChange:Ember.observer(function(){if(this.isDestroying){return}this.rerender();this.forEachChildView(function(view){view.propertyDidChange("controller")})},"controller"),cloneKeywords:function(){var templateData=get(this,"templateData");var keywords=templateData?Ember.copy(templateData.keywords):{};set(keywords,"view",get(this,"concreteView"));set(keywords,"_view",this);set(keywords,"controller",get(this,"controller"));return keywords},render:function(buffer){var template=get(this,"layout")||get(this,"template");if(template){var context=get(this,"context");var keywords=this.cloneKeywords();var output;var data={view:this,buffer:buffer,isRenderData:true,keywords:keywords,insideGroup:get(this,"templateData.insideGroup")};Ember.assert('template must be a function. Did you mean to call Ember.Handlebars.compile("...") or specify templateName instead?',typeof template==="function");output=template(context,{data:data});if(output!==undefined){buffer.push(output)}}},rerender:function(){return this.currentState.rerender(this)},clearRenderedChildren:function(){var lengthBefore=this.lengthBeforeRender,lengthAfter=this.lengthAfterRender;var childViews=this._childViews;for(var i=lengthAfter-1;i>=lengthBefore;i--){if(childViews[i]){childViews[i].destroy()}}},_applyClassNameBindings:function(classBindings){var classNames=this.classNames,elem,newClass,dasherizedClass;a_forEach(classBindings,function(binding){var oldClass;var parsedPath=Ember.View._parsePropertyPath(binding);var observer=function(){newClass=this._classStringForProperty(binding);elem=this.$();if(oldClass){elem.removeClass(oldClass);classNames.removeObject(oldClass)}if(newClass){elem.addClass(newClass);oldClass=newClass}else{oldClass=null}};dasherizedClass=this._classStringForProperty(binding);if(dasherizedClass){a_addObject(classNames,dasherizedClass);oldClass=dasherizedClass}this.registerObserver(this,parsedPath.path,observer);this.one("willClearRender",function(){if(oldClass){classNames.removeObject(oldClass);oldClass=null}})},this)},_applyAttributeBindings:function(buffer,attributeBindings){var attributeValue,elem,type;a_forEach(attributeBindings,function(binding){var split=binding.split(":"),property=split[0],attributeName=split[1]||property;var observer=function(){elem=this.$();attributeValue=get(this,property);Ember.View.applyAttributeBindings(elem,attributeName,attributeValue)};this.registerObserver(this,property,observer);attributeValue=get(this,property);Ember.View.applyAttributeBindings(buffer,attributeName,attributeValue)},this)},_classStringForProperty:function(property){var parsedPath=Ember.View._parsePropertyPath(property);var path=parsedPath.path;var val=get(this,path);if(val===undefined&&Ember.isGlobalPath(path)){val=get(Ember.lookup,path)}return Ember.View._classStringForValue(path,val,parsedPath.className,parsedPath.falsyClassName)},element:Ember.computed(function(key,value){if(value!==undefined){return this.currentState.setElement(this,value)}else{return this.currentState.getElement(this)}}).property("_parentView"),$:function(sel){return this.currentState.$(this,sel)},mutateChildViews:function(callback){var childViews=this._childViews,idx=childViews.length,view;while(--idx>=0){view=childViews[idx];callback.call(this,view,idx)}return this},forEachChildView:function(callback){var childViews=this._childViews;if(!childViews){return this}var len=childViews.length,view,idx;for(idx=0;idx<len;idx++){view=childViews[idx];callback.call(this,view)}return this},appendTo:function(target){this._insertElementLater(function(){Ember.assert("You cannot append to an existing Ember.View. Consider using Ember.ContainerView instead.",!Ember.$(target).is(".ember-view")&&!Ember.$(target).parents().is(".ember-view"));this.$().appendTo(target)});return this},replaceIn:function(target){Ember.assert("You cannot replace an existing Ember.View. Consider using Ember.ContainerView instead.",!Ember.$(target).is(".ember-view")&&!Ember.$(target).parents().is(".ember-view"));this._insertElementLater(function(){Ember.$(target).empty();this.$().appendTo(target)});return this},_insertElementLater:function(fn){this._scheduledInsert=Ember.run.scheduleOnce("render",this,"_insertElement",fn)},_insertElement:function(fn){this._scheduledInsert=null;this.currentState.insertElement(this,fn)},append:function(){return this.appendTo(document.body)},remove:function(){if(!this.removedFromDOM){this.destroyElement()}this.invokeRecursively(function(view){if(view.clearRenderedChildren){view.clearRenderedChildren()}})},elementId:null,findElementInParentElement:function(parentElem){var id="#"+this.elementId;return Ember.$(id)[0]||Ember.$(id,parentElem)[0]},createElement:function(){if(get(this,"element")){return this}var buffer=this.renderToBuffer();set(this,"element",buffer.element());return this},willInsertElement:Ember.K,didInsertElement:Ember.K,willClearRender:Ember.K,invokeRecursively:function(fn){var childViews=[this],currentViews,view;while(childViews.length){currentViews=childViews.slice();childViews=[];for(var i=0,l=currentViews.length;i<l;i++){view=currentViews[i];fn.call(view,view);if(view._childViews){childViews.push.apply(childViews,view._childViews)}}}},triggerRecursively:function(eventName){var childViews=[this],currentViews,view;while(childViews.length){currentViews=childViews.slice();childViews=[];for(var i=0,l=currentViews.length;i<l;i++){view=currentViews[i];if(view.trigger){view.trigger(eventName)}if(view._childViews){childViews.push.apply(childViews,view._childViews)}}}},destroyElement:function(){return this.currentState.destroyElement(this)},willDestroyElement:function(){},_notifyWillDestroyElement:function(){this.triggerRecursively("willClearRender");this.triggerRecursively("willDestroyElement")},_elementWillChange:Ember.beforeObserver(function(){this.forEachChildView(function(view){Ember.propertyWillChange(view,"element")})},"element"),_elementDidChange:Ember.observer(function(){this.forEachChildView(function(view){Ember.propertyDidChange(view,"element")})},"element"),parentViewDidChange:Ember.K,instrumentName:"view",instrumentDetails:function(hash){hash.template=get(this,"templateName");this._super(hash)},_renderToBuffer:function(parentBuffer,bufferOperation){this.lengthBeforeRender=this._childViews.length;var buffer=this._super(parentBuffer,bufferOperation);this.lengthAfterRender=this._childViews.length;return buffer},renderToBufferIfNeeded:function(){return this.currentState.renderToBufferIfNeeded(this,this)},beforeRender:function(buffer){this.applyAttributesToBuffer(buffer);buffer.pushOpeningTag()},afterRender:function(buffer){buffer.pushClosingTag()},applyAttributesToBuffer:function(buffer){var classNameBindings=get(this,"classNameBindings");if(classNameBindings.length){this._applyClassNameBindings(classNameBindings)}var attributeBindings=get(this,"attributeBindings");if(attributeBindings.length){this._applyAttributeBindings(buffer,attributeBindings)}buffer.setClasses(this.classNames);buffer.id(this.elementId);var role=get(this,"ariaRole");if(role){buffer.attr("role",role)}if(get(this,"isVisible")===false){buffer.style("display","none")}},tagName:null,ariaRole:null,classNames:["ember-view"],classNameBindings:[],attributeBindings:[],init:function(){this.elementId=this.elementId||guidFor(this);this._super();this._childViews=this._childViews.slice();Ember.assert("Only arrays are allowed for 'classNameBindings'",Ember.typeOf(this.classNameBindings)==="array");this.classNameBindings=Ember.A(this.classNameBindings.slice());Ember.assert("Only arrays are allowed for 'classNames'",Ember.typeOf(this.classNames)==="array");this.classNames=Ember.A(this.classNames.slice());var viewController=get(this,"viewController");if(viewController){viewController=get(viewController);if(viewController){set(viewController,"view",this)}}},appendChild:function(view,options){return this.currentState.appendChild(this,view,options)},removeChild:function(view){if(this.isDestroying){return}set(view,"_parentView",null);var childViews=this._childViews;Ember.EnumerableUtils.removeObject(childViews,view);this.propertyDidChange("childViews");return this},removeAllChildren:function(){return this.mutateChildViews(function(view){this.removeChild(view)})},destroyAllChildren:function(){return this.mutateChildViews(function(view){view.destroy()})},removeFromParent:function(){var parent=this._parentView;this.remove();if(parent){parent.removeChild(this)}return this},willDestroy:function(){var childViews=this._childViews,parent=this._parentView,childLen,i;if(!this.removedFromDOM){this.destroyElement()
}childLen=childViews.length;for(i=childLen-1;i>=0;i--){childViews[i].removedFromDOM=true}if(this.viewName){var nonVirtualParentView=get(this,"parentView");if(nonVirtualParentView){set(nonVirtualParentView,this.viewName,null)}}if(parent){parent.removeChild(this)}this.transitionTo("destroyed");childLen=childViews.length;for(i=childLen-1;i>=0;i--){childViews[i].destroy()}if(!this.isVirtual)delete Ember.View.views[get(this,"elementId")]},createChildView:function(view,attrs){if(view.isView&&view._parentView===this){return view}if(Ember.CoreView.detect(view)){attrs=attrs||{};attrs._parentView=this;attrs.templateData=attrs.templateData||get(this,"templateData");view=view.create(attrs);if(view.viewName){set(get(this,"concreteView"),view.viewName,view)}}else{Ember.assert("You must pass instance or subclass of View",view.isView);if(attrs){view.setProperties(attrs)}if(!get(view,"templateData")){set(view,"templateData",get(this,"templateData"))}set(view,"_parentView",this)}return view},becameVisible:Ember.K,becameHidden:Ember.K,_isVisibleDidChange:Ember.observer(function(){var $el=this.$();if(!$el){return}var isVisible=get(this,"isVisible");$el.toggle(isVisible);if(this._isAncestorHidden()){return}if(isVisible){this._notifyBecameVisible()}else{this._notifyBecameHidden()}},"isVisible"),_notifyBecameVisible:function(){this.trigger("becameVisible");this.forEachChildView(function(view){var isVisible=get(view,"isVisible");if(isVisible||isVisible===null){view._notifyBecameVisible()}})},_notifyBecameHidden:function(){this.trigger("becameHidden");this.forEachChildView(function(view){var isVisible=get(view,"isVisible");if(isVisible||isVisible===null){view._notifyBecameHidden()}})},_isAncestorHidden:function(){var parent=get(this,"parentView");while(parent){if(get(parent,"isVisible")===false){return true}parent=get(parent,"parentView")}return false},clearBuffer:function(){this.invokeRecursively(function(view){view.buffer=null})},transitionTo:function(state,children){this.currentState=this.states[state];this.state=state;if(children!==false){this.forEachChildView(function(view){view.transitionTo(state)})}},handleEvent:function(eventName,evt){return this.currentState.handleEvent(this,eventName,evt)},registerObserver:function(root,path,target,observer){if(!observer&&"function"===typeof target){observer=target;target=null}var view=this,stateCheckedObserver=function(){view.currentState.invokeObserver(this,observer)};Ember.addObserver(root,path,target,stateCheckedObserver);this.one("willClearRender",function(){Ember.removeObserver(root,path,target,stateCheckedObserver)})}});function notifyMutationListeners(){Ember.run.once(Ember.View,"notifyMutationListeners")}var DOMManager={prepend:function(view,html){view.$().prepend(html);notifyMutationListeners()},after:function(view,html){view.$().after(html);notifyMutationListeners()},html:function(view,html){view.$().html(html);notifyMutationListeners()},replace:function(view){var element=get(view,"element");set(view,"element",null);view._insertElementLater(function(){Ember.$(element).replaceWith(get(view,"element"));notifyMutationListeners()})},remove:function(view){view.$().remove();notifyMutationListeners()},empty:function(view){view.$().empty();notifyMutationListeners()}};Ember.View.reopen({domManager:DOMManager});Ember.View.reopenClass({_parsePropertyPath:function(path){var split=path.split(":"),propertyPath=split[0],classNames="",className,falsyClassName;if(split.length>1){className=split[1];if(split.length===3){falsyClassName=split[2]}classNames=":"+className;if(falsyClassName){classNames+=":"+falsyClassName}}return{path:propertyPath,classNames:classNames,className:className===""?undefined:className,falsyClassName:falsyClassName}},_classStringForValue:function(path,val,className,falsyClassName){if(className||falsyClassName){if(className&&!!val){return className}else if(falsyClassName&&!val){return falsyClassName}else{return null}}else if(val===true){var parts=path.split(".");return Ember.String.dasherize(parts[parts.length-1])}else if(val!==false&&val!==undefined&&val!==null){return val}else{return null}}});var mutation=Ember.Object.extend(Ember.Evented).create();Ember.View.addMutationListener=function(callback){mutation.on("change",callback)};Ember.View.removeMutationListener=function(callback){mutation.off("change",callback)};Ember.View.notifyMutationListeners=function(){mutation.trigger("change")};Ember.View.views={};Ember.View.childViewsProperty=childViewsProperty;Ember.View.applyAttributeBindings=function(elem,name,value){var type=Ember.typeOf(value);if(name!=="value"&&(type==="string"||type==="number"&&!isNaN(value))){if(value!==elem.attr(name)){elem.attr(name,value)}}else if(name==="value"||type==="boolean"){if(value===undefined){value=null}if(value!==elem.prop(name)){elem.prop(name,value)}}else if(!value){elem.removeAttr(name)}};Ember.View.states=states})();(function(){var get=Ember.get,set=Ember.set;Ember.View.states._default={appendChild:function(){throw"You can't use appendChild outside of the rendering process"},$:function(){return undefined},getElement:function(){return null},handleEvent:function(){return true},destroyElement:function(view){set(view,"element",null);if(view._scheduledInsert){Ember.run.cancel(view._scheduledInsert);view._scheduledInsert=null}return view},renderToBufferIfNeeded:function(){return false},rerender:Ember.K,invokeObserver:Ember.K}})();(function(){var preRender=Ember.View.states.preRender=Ember.create(Ember.View.states._default);Ember.merge(preRender,{insertElement:function(view,fn){view.createElement();view.triggerRecursively("willInsertElement");fn.call(view);view.transitionTo("inDOM");view.triggerRecursively("didInsertElement")},renderToBufferIfNeeded:function(view){return view.renderToBuffer()},empty:Ember.K,setElement:function(view,value){if(value!==null){view.transitionTo("hasElement")}return value}})})();(function(){var get=Ember.get,set=Ember.set;var inBuffer=Ember.View.states.inBuffer=Ember.create(Ember.View.states._default);Ember.merge(inBuffer,{$:function(view,sel){view.rerender();return Ember.$()},rerender:function(view){throw new Ember.Error("Something you did caused a view to re-render after it rendered but before it was inserted into the DOM.")},appendChild:function(view,childView,options){var buffer=view.buffer;childView=view.createChildView(childView,options);view._childViews.push(childView);childView.renderToBuffer(buffer);view.propertyDidChange("childViews");return childView},destroyElement:function(view){view.clearBuffer();view._notifyWillDestroyElement();view.transitionTo("preRender");return view},empty:function(){Ember.assert("Emptying a view in the inBuffer state is not allowed and should not happen under normal circumstances. Most likely there is a bug in your application. This may be due to excessive property change notifications.")},renderToBufferIfNeeded:function(view){return view.buffer},insertElement:function(){throw"You can't insert an element that has already been rendered"},setElement:function(view,value){if(value===null){view.transitionTo("preRender")}else{view.clearBuffer();view.transitionTo("hasElement")}return value},invokeObserver:function(target,observer){observer.call(target)}})})();(function(){var get=Ember.get,set=Ember.set;var hasElement=Ember.View.states.hasElement=Ember.create(Ember.View.states._default);Ember.merge(hasElement,{$:function(view,sel){var elem=get(view,"element");return sel?Ember.$(sel,elem):Ember.$(elem)},getElement:function(view){var parent=get(view,"parentView");if(parent){parent=get(parent,"element")}if(parent){return view.findElementInParentElement(parent)}return Ember.$("#"+get(view,"elementId"))[0]},setElement:function(view,value){if(value===null){view.transitionTo("preRender")}else{throw"You cannot set an element to a non-null value when the element is already in the DOM."}return value},rerender:function(view){view.triggerRecursively("willClearRender");view.clearRenderedChildren();view.domManager.replace(view);return view},destroyElement:function(view){view._notifyWillDestroyElement();view.domManager.remove(view);set(view,"element",null);if(view._scheduledInsert){Ember.run.cancel(view._scheduledInsert);view._scheduledInsert=null}return view},empty:function(view){var _childViews=view._childViews,len,idx;if(_childViews){len=_childViews.length;for(idx=0;idx<len;idx++){_childViews[idx]._notifyWillDestroyElement()}}view.domManager.empty(view)},handleEvent:function(view,eventName,evt){if(view.has(eventName)){return view.trigger(eventName,evt)}else{return true}},invokeObserver:function(target,observer){observer.call(target)}});var inDOM=Ember.View.states.inDOM=Ember.create(hasElement);Ember.merge(inDOM,{insertElement:function(view,fn){throw"You can't insert an element into the DOM that has already been inserted"}})})();(function(){var destroyedError="You can't call %@ on a destroyed view",fmt=Ember.String.fmt;var destroyed=Ember.View.states.destroyed=Ember.create(Ember.View.states._default);Ember.merge(destroyed,{appendChild:function(){throw fmt(destroyedError,["appendChild"])},rerender:function(){throw fmt(destroyedError,["rerender"])},destroyElement:function(){throw fmt(destroyedError,["destroyElement"])},empty:function(){throw fmt(destroyedError,["empty"])},setElement:function(){throw fmt(destroyedError,["set('element', ...)"])},renderToBufferIfNeeded:function(){throw fmt(destroyedError,["renderToBufferIfNeeded"])},insertElement:Ember.K})})();(function(){Ember.View.cloneStates=function(from){var into={};into._default={};into.preRender=Ember.create(into._default);into.destroyed=Ember.create(into._default);into.inBuffer=Ember.create(into._default);into.hasElement=Ember.create(into._default);into.inDOM=Ember.create(into.hasElement);for(var stateName in from){if(!from.hasOwnProperty(stateName)){continue}Ember.merge(into[stateName],from[stateName])}return into}})();(function(){var states=Ember.View.cloneStates(Ember.View.states);var get=Ember.get,set=Ember.set;var forEach=Ember.EnumerableUtils.forEach;Ember.ContainerView=Ember.View.extend(Ember.MutableArray,{states:states,init:function(){this._super();var childViews=get(this,"childViews");Ember.defineProperty(this,"childViews",Ember.View.childViewsProperty);var _childViews=this._childViews;forEach(childViews,function(viewName,idx){var view;if("string"===typeof viewName){view=get(this,viewName);view=this.createChildView(view);set(this,viewName,view)}else{view=this.createChildView(viewName)}_childViews[idx]=view},this);var currentView=get(this,"currentView");if(currentView){_childViews.push(this.createChildView(currentView))}},replace:function(idx,removedCount,addedViews){var addedCount=addedViews?get(addedViews,"length"):0;this.arrayContentWillChange(idx,removedCount,addedCount);this.childViewsWillChange(this._childViews,idx,removedCount);if(addedCount===0){this._childViews.splice(idx,removedCount)}else{var args=[idx,removedCount].concat(addedViews);this._childViews.splice.apply(this._childViews,args)}this.arrayContentDidChange(idx,removedCount,addedCount);this.childViewsDidChange(this._childViews,idx,removedCount,addedCount);return this},objectAt:function(idx){return this._childViews[idx]},length:Ember.computed(function(){return this._childViews.length}),render:function(buffer){this.forEachChildView(function(view){view.renderToBuffer(buffer)})},instrumentName:"render.container",childViewsWillChange:function(views,start,removed){this.propertyWillChange("childViews");if(removed>0){var changedViews=views.slice(start,start+removed);this.currentState.childViewsWillChange(this,views,start,removed);this.initializeViews(changedViews,null,null)}},removeChild:function(child){this.removeObject(child);return this},childViewsDidChange:function(views,start,removed,added){if(added>0){var changedViews=views.slice(start,start+added);this.initializeViews(changedViews,this,get(this,"templateData"));this.currentState.childViewsDidChange(this,views,start,added)}this.propertyDidChange("childViews")},initializeViews:function(views,parentView,templateData){forEach(views,function(view){set(view,"_parentView",parentView);if(!get(view,"templateData")){set(view,"templateData",templateData)}})},currentView:null,_currentViewWillChange:Ember.beforeObserver(function(){var currentView=get(this,"currentView");if(currentView){currentView.destroy()}},"currentView"),_currentViewDidChange:Ember.observer(function(){var currentView=get(this,"currentView");if(currentView){this.pushObject(currentView)}},"currentView"),_ensureChildrenAreInDOM:function(){this.currentState.ensureChildrenAreInDOM(this)}});Ember.merge(states._default,{childViewsWillChange:Ember.K,childViewsDidChange:Ember.K,ensureChildrenAreInDOM:Ember.K});Ember.merge(states.inBuffer,{childViewsDidChange:function(parentView,views,start,added){throw new Error("You cannot modify child views while in the inBuffer state")}});Ember.merge(states.hasElement,{childViewsWillChange:function(view,views,start,removed){for(var i=start;i<start+removed;i++){views[i].remove()}},childViewsDidChange:function(view,views,start,added){Ember.run.scheduleOnce("render",view,"_ensureChildrenAreInDOM")},ensureChildrenAreInDOM:function(view){var childViews=view._childViews,i,len,childView,previous,buffer;for(i=0,len=childViews.length;i<len;i++){childView=childViews[i];buffer=childView.renderToBufferIfNeeded();if(buffer){childView.triggerRecursively("willInsertElement");if(previous){previous.domManager.after(previous,buffer.string())}else{view.domManager.prepend(view,buffer.string())}childView.transitionTo("inDOM");childView.propertyDidChange("element");childView.triggerRecursively("didInsertElement")}previous=childView}}})})();(function(){var get=Ember.get,set=Ember.set,fmt=Ember.String.fmt;Ember.CollectionView=Ember.ContainerView.extend({content:null,emptyViewClass:Ember.View,emptyView:null,itemViewClass:Ember.View,init:function(){var ret=this._super();this._contentDidChange();return ret},_contentWillChange:Ember.beforeObserver(function(){var content=this.get("content");if(content){content.removeArrayObserver(this)}var len=content?get(content,"length"):0;this.arrayWillChange(content,0,len)},"content"),_contentDidChange:Ember.observer(function(){var content=get(this,"content");if(content){Ember.assert(fmt("an Ember.CollectionView's content must implement Ember.Array. You passed %@",[content]),Ember.Array.detect(content));content.addArrayObserver(this)}var len=content?get(content,"length"):0;this.arrayDidChange(content,0,null,len)},"content"),willDestroy:function(){var content=get(this,"content");if(content){content.removeArrayObserver(this)}this._super();if(this._createdEmptyView){this._createdEmptyView.destroy()}},arrayWillChange:function(content,start,removedCount){var emptyView=get(this,"emptyView");if(emptyView&&emptyView instanceof Ember.View){emptyView.removeFromParent()}var childViews=this._childViews,childView,idx,len;len=this._childViews.length;var removingAll=removedCount===len;if(removingAll){this.currentState.empty(this)}for(idx=start+removedCount-1;idx>=start;idx--){childView=childViews[idx];if(removingAll){childView.removedFromDOM=true}childView.destroy()}},arrayDidChange:function(content,start,removed,added){var itemViewClass=get(this,"itemViewClass"),addedViews=[],view,item,idx,len;if("string"===typeof itemViewClass){itemViewClass=get(itemViewClass)}Ember.assert(fmt("itemViewClass must be a subclass of Ember.View, not %@",[itemViewClass]),Ember.View.detect(itemViewClass));len=content?get(content,"length"):0;if(len){for(idx=start;idx<start+added;idx++){item=content.objectAt(idx);view=this.createChildView(itemViewClass,{content:item,contentIndex:idx});addedViews.push(view)}}else{var emptyView=get(this,"emptyView");if(!emptyView){return}var isClass=Ember.CoreView.detect(emptyView);emptyView=this.createChildView(emptyView);addedViews.push(emptyView);set(this,"emptyView",emptyView);if(isClass){this._createdEmptyView=emptyView}}this.replace(start,0,addedViews)},createChildView:function(view,attrs){view=this._super(view,attrs);var itemTagName=get(view,"tagName");var tagName=itemTagName===null||itemTagName===undefined?Ember.CollectionView.CONTAINER_MAP[get(this,"tagName")]:itemTagName;set(view,"tagName",tagName);return view}});Ember.CollectionView.CONTAINER_MAP={ul:"li",ol:"li",table:"tr",thead:"tr",tbody:"tr",tfoot:"tr",tr:"td",select:"option"}})();(function(){})();(function(){})();(function(){define("metamorph",[],function(){"use strict";var K=function(){},guid=0,document=this.document,supportsRange=document&&"createRange"in document&&typeof Range!=="undefined"&&Range.prototype.createContextualFragment,needsShy=document&&function(){var testEl=document.createElement("div");testEl.innerHTML="<div></div>";testEl.firstChild.innerHTML="<script></script>";return testEl.firstChild.innerHTML===""}(),movesWhitespace=document&&function(){var testEl=document.createElement("div");testEl.innerHTML="Test: <script type='text/x-placeholder'></script>Value";return testEl.childNodes[0].nodeValue==="Test:"&&testEl.childNodes[2].nodeValue===" Value"}();var Metamorph=function(html){var self;if(this instanceof Metamorph){self=this}else{self=new K}self.innerHTML=html;var myGuid="metamorph-"+guid++;self.start=myGuid+"-start";self.end=myGuid+"-end";return self};K.prototype=Metamorph.prototype;var rangeFor,htmlFunc,removeFunc,outerHTMLFunc,appendToFunc,afterFunc,prependFunc,startTagFunc,endTagFunc;outerHTMLFunc=function(){return this.startTag()+this.innerHTML+this.endTag()};startTagFunc=function(){return"<script id='"+this.start+"' type='text/x-placeholder'></script>"};endTagFunc=function(){return"<script id='"+this.end+"' type='text/x-placeholder'></script>"};if(supportsRange){rangeFor=function(morph,outerToo){var range=document.createRange();var before=document.getElementById(morph.start);var after=document.getElementById(morph.end);if(outerToo){range.setStartBefore(before);range.setEndAfter(after)}else{range.setStartAfter(before);range.setEndBefore(after)}return range};htmlFunc=function(html,outerToo){var range=rangeFor(this,outerToo);range.deleteContents();var fragment=range.createContextualFragment(html);range.insertNode(fragment)};removeFunc=function(){var range=rangeFor(this,true);range.deleteContents()};appendToFunc=function(node){var range=document.createRange();range.setStart(node);range.collapse(false);var frag=range.createContextualFragment(this.outerHTML());node.appendChild(frag)};afterFunc=function(html){var range=document.createRange();var after=document.getElementById(this.end);range.setStartAfter(after);range.setEndAfter(after);var fragment=range.createContextualFragment(html);range.insertNode(fragment)};prependFunc=function(html){var range=document.createRange();var start=document.getElementById(this.start);range.setStartAfter(start);range.setEndAfter(start);var fragment=range.createContextualFragment(html);range.insertNode(fragment)}}else{var wrapMap={select:[1,"<select multiple='multiple'>","</select>"],fieldset:[1,"<fieldset>","</fieldset>"],table:[1,"<table>","</table>"],tbody:[2,"<table><tbody>","</tbody></table>"],tr:[3,"<table><tbody><tr>","</tr></tbody></table>"],colgroup:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],map:[1,"<map>","</map>"],_default:[0,"",""]};var findChildById=function(element,id){if(element.getAttribute("id")===id){return element}var len=element.childNodes.length,idx,node,found;for(idx=0;idx<len;idx++){node=element.childNodes[idx];found=node.nodeType===1&&findChildById(node,id);if(found){return found}}};var setInnerHTML=function(element,html){var matches=[];if(movesWhitespace){html=html.replace(/(\s+)(<script id='([^']+)')/g,function(match,spaces,tag,id){matches.push([id,spaces]);return tag})}element.innerHTML=html;if(matches.length>0){var len=matches.length,idx;for(idx=0;idx<len;idx++){var script=findChildById(element,matches[idx][0]),node=document.createTextNode(matches[idx][1]);script.parentNode.insertBefore(node,script)}}};var firstNodeFor=function(parentNode,html){var arr=wrapMap[parentNode.tagName.toLowerCase()]||wrapMap._default;var depth=arr[0],start=arr[1],end=arr[2];if(needsShy){html="&shy;"+html}var element=document.createElement("div");setInnerHTML(element,start+html+end);for(var i=0;i<=depth;i++){element=element.firstChild}if(needsShy){var shyElement=element;while(shyElement.nodeType===1&&!shyElement.nodeName){shyElement=shyElement.firstChild}if(shyElement.nodeType===3&&shyElement.nodeValue.charAt(0)==="­"){shyElement.nodeValue=shyElement.nodeValue.slice(1)}}return element};var realNode=function(start){while(start.parentNode.tagName===""){start=start.parentNode}return start};var fixParentage=function(start,end){if(start.parentNode!==end.parentNode){end.parentNode.insertBefore(start,end.parentNode.firstChild)}};htmlFunc=function(html,outerToo){var start=realNode(document.getElementById(this.start));var end=document.getElementById(this.end);var parentNode=end.parentNode;var node,nextSibling,last;fixParentage(start,end);node=start.nextSibling;while(node){nextSibling=node.nextSibling;last=node===end;if(last){if(outerToo){end=node.nextSibling}else{break}}node.parentNode.removeChild(node);if(last){break}node=nextSibling}node=firstNodeFor(start.parentNode,html);while(node){nextSibling=node.nextSibling;parentNode.insertBefore(node,end);node=nextSibling}};removeFunc=function(){var start=realNode(document.getElementById(this.start));var end=document.getElementById(this.end);this.html("");start.parentNode.removeChild(start);end.parentNode.removeChild(end)};appendToFunc=function(parentNode){var node=firstNodeFor(parentNode,this.outerHTML());var nextSibling;while(node){nextSibling=node.nextSibling;parentNode.appendChild(node);node=nextSibling}};afterFunc=function(html){var end=document.getElementById(this.end);var insertBefore=end.nextSibling;var parentNode=end.parentNode;var nextSibling;var node;node=firstNodeFor(parentNode,html);while(node){nextSibling=node.nextSibling;parentNode.insertBefore(node,insertBefore);node=nextSibling}};prependFunc=function(html){var start=document.getElementById(this.start);var parentNode=start.parentNode;var nextSibling;var node;node=firstNodeFor(parentNode,html);var insertBefore=start.nextSibling;while(node){nextSibling=node.nextSibling;parentNode.insertBefore(node,insertBefore);node=nextSibling}}}Metamorph.prototype.html=function(html){this.checkRemoved();if(html===undefined){return this.innerHTML}htmlFunc.call(this,html);this.innerHTML=html};Metamorph.prototype.replaceWith=function(html){this.checkRemoved();htmlFunc.call(this,html,true)};Metamorph.prototype.remove=removeFunc;Metamorph.prototype.outerHTML=outerHTMLFunc;Metamorph.prototype.appendTo=appendToFunc;Metamorph.prototype.after=afterFunc;Metamorph.prototype.prepend=prependFunc;Metamorph.prototype.startTag=startTagFunc;Metamorph.prototype.endTag=endTagFunc;Metamorph.prototype.isRemoved=function(){var before=document.getElementById(this.start);var after=document.getElementById(this.end);return!before||!after};Metamorph.prototype.checkRemoved=function(){if(this.isRemoved()){throw new Error("Cannot perform operations on a Metamorph that is not in the DOM.")}};return Metamorph})})();(function(){var objectCreate=Object.create||function(parent){function F(){}F.prototype=parent;return new F};var Handlebars=this.Handlebars||Ember.imports&&Ember.imports.Handlebars;if(!Handlebars&&typeof require==="function"){Handlebars=require("handlebars")}Ember.assert("Ember Handlebars requires Handlebars 1.0.0-rc.3 or greater",Handlebars&&Handlebars.VERSION.match(/^1\.0\.[0-9](\.rc\.[23456789]+)?/));Ember.Handlebars=objectCreate(Handlebars);Ember.Handlebars.helpers=objectCreate(Handlebars.helpers);Ember.Handlebars.Compiler=function(){};if(Handlebars.Compiler){Ember.Handlebars.Compiler.prototype=objectCreate(Handlebars.Compiler.prototype)}Ember.Handlebars.Compiler.prototype.compiler=Ember.Handlebars.Compiler;Ember.Handlebars.JavaScriptCompiler=function(){};if(Handlebars.JavaScriptCompiler){Ember.Handlebars.JavaScriptCompiler.prototype=objectCreate(Handlebars.JavaScriptCompiler.prototype);Ember.Handlebars.JavaScriptCompiler.prototype.compiler=Ember.Handlebars.JavaScriptCompiler}Ember.Handlebars.JavaScriptCompiler.prototype.namespace="Ember.Handlebars";Ember.Handlebars.JavaScriptCompiler.prototype.initializeBuffer=function(){return"''"};Ember.Handlebars.JavaScriptCompiler.prototype.appendToBuffer=function(string){return"data.buffer.push("+string+");"};var prefix="ember"+ +new Date,incr=1;Ember.Handlebars.Compiler.prototype.mustache=function(mustache){if(mustache.isHelper&&mustache.id.string==="control"){mustache.hash=mustache.hash||new Handlebars.AST.HashNode([]);mustache.hash.pairs.push(["controlID",new Handlebars.AST.StringNode(prefix+incr++)])}else if(mustache.params.length||mustache.hash){}else{var id=new Handlebars.AST.IdNode(["_triageMustache"]);if(!mustache.escaped){mustache.hash=mustache.hash||new Handlebars.AST.HashNode([]);mustache.hash.pairs.push(["unescaped",new Handlebars.AST.StringNode("true")])}mustache=new Handlebars.AST.MustacheNode([id].concat([mustache.id]),mustache.hash,!mustache.escaped)}return Handlebars.Compiler.prototype.mustache.call(this,mustache)};Ember.Handlebars.precompile=function(string){var ast=Handlebars.parse(string);var options={knownHelpers:{action:true,unbound:true,bindAttr:true,template:true,view:true,_triageMustache:true},data:true,stringParams:true};var environment=(new Ember.Handlebars.Compiler).compile(ast,options);return(new Ember.Handlebars.JavaScriptCompiler).compile(environment,options,undefined,true)};if(Handlebars.compile){Ember.Handlebars.compile=function(string){var ast=Handlebars.parse(string);var options={data:true,stringParams:true};var environment=(new Ember.Handlebars.Compiler).compile(ast,options);var templateSpec=(new Ember.Handlebars.JavaScriptCompiler).compile(environment,options,undefined,true);return Ember.Handlebars.template(templateSpec)}}})();(function(){var slice=Array.prototype.slice;var normalizePath=Ember.Handlebars.normalizePath=function(root,path,data){var keywords=data&&data.keywords||{},keyword,isKeyword;keyword=path.split(".",1)[0];if(keywords.hasOwnProperty(keyword)){root=keywords[keyword];isKeyword=true;if(path===keyword){path=""}else{path=path.substr(keyword.length+1)}}return{root:root,path:path,isKeyword:isKeyword}};var handlebarsGet=Ember.Handlebars.get=function(root,path,options){var data=options&&options.data,normalizedPath=normalizePath(root,path,data),value;root=normalizedPath.root;path=normalizedPath.path;value=Ember.get(root,path);if(value===undefined&&root!==Ember.lookup&&Ember.isGlobalPath(path)){value=Ember.get(Ember.lookup,path)}return value};Ember.Handlebars.getPath=Ember.deprecateFunc("`Ember.Handlebars.getPath` has been changed to `Ember.Handlebars.get` for consistency.",Ember.Handlebars.get);Ember.Handlebars.resolveParams=function(context,params,options){var resolvedParams=[],types=options.types,param,type;for(var i=0,l=params.length;i<l;i++){param=params[i];type=types[i];if(type==="ID"){resolvedParams.push(handlebarsGet(context,param,options))}else{resolvedParams.push(param)}}return resolvedParams};Ember.Handlebars.resolveHash=function(context,hash,options){var resolvedHash={},types=options.hashTypes,type;for(var key in hash){if(!hash.hasOwnProperty(key)){continue}type=types[key];if(type==="ID"){resolvedHash[key]=handlebarsGet(context,hash[key],options)}else{resolvedHash[key]=hash[key]}}return resolvedHash};Ember.Handlebars.registerHelper("helperMissing",function(path,options){var error,view="";error="%@ Handlebars error: Could not find property '%@' on object %@.";if(options.data){view=options.data.view}throw new Ember.Error(Ember.String.fmt(error,[view,path,this]))});Ember.Handlebars.registerBoundHelper=function(name,fn){var dependentKeys=slice.call(arguments,2);function helper(){var properties=slice.call(arguments,0,-1),numProperties=properties.length,options=arguments[arguments.length-1],normalizedProperties=[],data=options.data,hash=options.hash,view=data.view,currentContext=options.contexts&&options.contexts[0]||this,normalized,pathRoot,path,loc,hashOption;hash.boundOptions={};for(hashOption in hash){if(!hash.hasOwnProperty(hashOption)){continue}if(Ember.IS_BINDING.test(hashOption)&&typeof hash[hashOption]==="string"){hash.boundOptions[hashOption.slice(0,-7)]=hash[hashOption]}}data.properties=[];for(loc=0;loc<numProperties;++loc){data.properties.push(properties[loc]);normalizedProperties.push(normalizePath(currentContext,properties[loc],data))}if(data.isUnbound){return evaluateUnboundHelper(this,fn,normalizedProperties,options)}if(dependentKeys.length===0){return evaluateMultiPropertyBoundHelper(currentContext,fn,normalizedProperties,options)}Ember.assert("Dependent keys can only be used with single-property helpers.",properties.length===1);normalized=normalizedProperties[0];pathRoot=normalized.root;path=normalized.path;var bindView=new Ember._SimpleHandlebarsView(path,pathRoot,!options.hash.unescaped,options.data);bindView.normalizedValue=function(){var value=Ember._SimpleHandlebarsView.prototype.normalizedValue.call(bindView);return fn.call(view,value,options)};view.appendChild(bindView);view.registerObserver(pathRoot,path,bindView,rerenderBoundHelperView);for(var i=0,l=dependentKeys.length;i<l;i++){view.registerObserver(pathRoot,path+"."+dependentKeys[i],bindView,rerenderBoundHelperView)}}helper._rawFunction=fn;Ember.Handlebars.registerHelper(name,helper)};function evaluateMultiPropertyBoundHelper(context,fn,normalizedProperties,options){var numProperties=normalizedProperties.length,self=this,data=options.data,view=data.view,hash=options.hash,boundOptions=hash.boundOptions,watchedProperties,boundOption,bindView,loc,property,len;bindView=new Ember._SimpleHandlebarsView(null,null,!hash.unescaped,data);bindView.normalizedValue=function(){var args=[],value,boundOption;for(boundOption in boundOptions){if(!boundOptions.hasOwnProperty(boundOption)){continue}property=normalizePath(context,boundOptions[boundOption],data);bindView.path=property.path;bindView.pathRoot=property.root;hash[boundOption]=Ember._SimpleHandlebarsView.prototype.normalizedValue.call(bindView)}for(loc=0;loc<numProperties;++loc){property=normalizedProperties[loc];bindView.path=property.path;bindView.pathRoot=property.root;args.push(Ember._SimpleHandlebarsView.prototype.normalizedValue.call(bindView))}args.push(options);return fn.apply(context,args)};view.appendChild(bindView);watchedProperties=[];for(boundOption in boundOptions){if(boundOptions.hasOwnProperty(boundOption)){watchedProperties.push(normalizePath(context,boundOptions[boundOption],data))}}watchedProperties=watchedProperties.concat(normalizedProperties);for(loc=0,len=watchedProperties.length;loc<len;++loc){property=watchedProperties[loc];view.registerObserver(property.root,property.path,bindView,rerenderBoundHelperView)}}function rerenderBoundHelperView(){Ember.run.scheduleOnce("render",this,"rerender")}function evaluateUnboundHelper(context,fn,normalizedProperties,options){var args=[],hash=options.hash,boundOptions=hash.boundOptions,loc,len,property,boundOption;for(boundOption in boundOptions){if(!boundOptions.hasOwnProperty(boundOption)){continue}hash[boundOption]=Ember.Handlebars.get(context,boundOptions[boundOption],options)}for(loc=0,len=normalizedProperties.length;loc<len;++loc){property=normalizedProperties[loc];args.push(Ember.Handlebars.get(context,property.path,options))}args.push(options);return fn.apply(context,args)}Ember.Handlebars.template=function(spec){var t=Handlebars.template(spec);t.isTop=true;return t}})();(function(){Ember.String.htmlSafe=function(str){return new Handlebars.SafeString(str)};var htmlSafe=Ember.String.htmlSafe;if(Ember.EXTEND_PROTOTYPES===true||Ember.EXTEND_PROTOTYPES.String){String.prototype.htmlSafe=function(){return htmlSafe(this)}}})();(function(){Ember.Handlebars.resolvePaths=function(options){var ret=[],contexts=options.contexts,roots=options.roots,data=options.data;for(var i=0,l=contexts.length;i<l;i++){ret.push(Ember.Handlebars.get(roots[i],contexts[i],{data:data}))
}return ret}})();(function(){var set=Ember.set,get=Ember.get;var Metamorph=requireModule("metamorph");function notifyMutationListeners(){Ember.run.once(Ember.View,"notifyMutationListeners")}var DOMManager={remove:function(view){view.morph.remove();notifyMutationListeners()},prepend:function(view,html){view.morph.prepend(html);notifyMutationListeners()},after:function(view,html){view.morph.after(html);notifyMutationListeners()},html:function(view,html){view.morph.html(html);notifyMutationListeners()},replace:function(view){var morph=view.morph;view.transitionTo("preRender");Ember.run.schedule("render",this,function(){if(view.isDestroying){return}view.clearRenderedChildren();var buffer=view.renderToBuffer();view.invokeRecursively(function(view){view.propertyDidChange("element")});view.triggerRecursively("willInsertElement");morph.replaceWith(buffer.string());view.transitionTo("inDOM");view.triggerRecursively("didInsertElement");notifyMutationListeners()})},empty:function(view){view.morph.html("");notifyMutationListeners()}};Ember._Metamorph=Ember.Mixin.create({isVirtual:true,tagName:"",instrumentName:"render.metamorph",init:function(){this._super();this.morph=Metamorph();Ember.deprecate("Supplying a tagName to Metamorph views is unreliable and is deprecated. You may be setting the tagName on a Handlebars helper that creates a Metamorph.",!this.tagName)},beforeRender:function(buffer){buffer.push(this.morph.startTag());buffer.pushOpeningTag()},afterRender:function(buffer){buffer.pushClosingTag();buffer.push(this.morph.endTag())},createElement:function(){var buffer=this.renderToBuffer();this.outerHTML=buffer.string();this.clearBuffer()},domManager:DOMManager});Ember._MetamorphView=Ember.View.extend(Ember._Metamorph);Ember._SimpleMetamorphView=Ember.CoreView.extend(Ember._Metamorph)})();(function(){var get=Ember.get,set=Ember.set,handlebarsGet=Ember.Handlebars.get;var Metamorph=requireModule("metamorph");function SimpleHandlebarsView(path,pathRoot,isEscaped,templateData){this.path=path;this.pathRoot=pathRoot;this.isEscaped=isEscaped;this.templateData=templateData;this.morph=Metamorph();this.state="preRender";this.updateId=null}Ember._SimpleHandlebarsView=SimpleHandlebarsView;SimpleHandlebarsView.prototype={isVirtual:true,isView:true,destroy:function(){if(this.updateId){Ember.run.cancel(this.updateId);this.updateId=null}this.morph=null},propertyDidChange:Ember.K,normalizedValue:function(){var path=this.path,pathRoot=this.pathRoot,result,templateData;if(path===""){result=pathRoot}else{templateData=this.templateData;result=handlebarsGet(pathRoot,path,{data:templateData})}return result},renderToBuffer:function(buffer){var string="";string+=this.morph.startTag();string+=this.render();string+=this.morph.endTag();buffer.push(string)},render:function(){var escape=this.isEscaped;var result=this.normalizedValue();if(result===null||result===undefined){result=""}else if(!(result instanceof Handlebars.SafeString)){result=String(result)}if(escape){result=Handlebars.Utils.escapeExpression(result)}return result},rerender:function(){switch(this.state){case"preRender":case"destroyed":break;case"inBuffer":throw new Ember.Error("Something you did tried to replace an {{expression}} before it was inserted into the DOM.");case"hasElement":case"inDOM":this.updateId=Ember.run.scheduleOnce("render",this,"update");break}return this},update:function(){this.updateId=null;this.morph.html(this.render())},transitionTo:function(state){this.state=state}};var states=Ember.View.cloneStates(Ember.View.states),merge=Ember.merge;merge(states._default,{rerenderIfNeeded:Ember.K});merge(states.inDOM,{rerenderIfNeeded:function(view){if(get(view,"normalizedValue")!==view._lastNormalizedValue){view.rerender()}}});Ember._HandlebarsBoundView=Ember._MetamorphView.extend({instrumentName:"render.boundHandlebars",states:states,shouldDisplayFunc:null,preserveContext:false,previousContext:null,displayTemplate:null,inverseTemplate:null,path:null,pathRoot:null,normalizedValue:Ember.computed(function(){var path=get(this,"path"),pathRoot=get(this,"pathRoot"),valueNormalizer=get(this,"valueNormalizerFunc"),result,templateData;if(path===""){result=pathRoot}else{templateData=get(this,"templateData");result=handlebarsGet(pathRoot,path,{data:templateData})}return valueNormalizer?valueNormalizer(result):result}).property("path","pathRoot","valueNormalizerFunc").volatile(),rerenderIfNeeded:function(){this.currentState.rerenderIfNeeded(this)},render:function(buffer){var escape=get(this,"isEscaped");var shouldDisplay=get(this,"shouldDisplayFunc"),preserveContext=get(this,"preserveContext"),context=get(this,"previousContext");var inverseTemplate=get(this,"inverseTemplate"),displayTemplate=get(this,"displayTemplate");var result=get(this,"normalizedValue");this._lastNormalizedValue=result;if(shouldDisplay(result)){set(this,"template",displayTemplate);if(preserveContext){set(this,"_context",context)}else{if(displayTemplate){set(this,"_context",result)}else{if(result===null||result===undefined){result=""}else if(!(result instanceof Handlebars.SafeString)){result=String(result)}if(escape){result=Handlebars.Utils.escapeExpression(result)}buffer.push(result);return}}}else if(inverseTemplate){set(this,"template",inverseTemplate);if(preserveContext){set(this,"_context",context)}else{set(this,"_context",result)}}else{set(this,"template",function(){return""})}return this._super(buffer)}})})();(function(){var get=Ember.get,set=Ember.set,fmt=Ember.String.fmt;var handlebarsGet=Ember.Handlebars.get,normalizePath=Ember.Handlebars.normalizePath;var forEach=Ember.ArrayPolyfills.forEach;var EmberHandlebars=Ember.Handlebars,helpers=EmberHandlebars.helpers;function bind(property,options,preserveContext,shouldDisplay,valueNormalizer,childProperties){var data=options.data,fn=options.fn,inverse=options.inverse,view=data.view,currentContext=this,normalized,observer,i;normalized=normalizePath(currentContext,property,data);if("object"===typeof this){if(data.insideGroup){observer=function(){Ember.run.once(view,"rerender")};var template,context,result=handlebarsGet(currentContext,property,options);result=valueNormalizer(result);context=preserveContext?currentContext:result;if(shouldDisplay(result)){template=fn}else if(inverse){template=inverse}template(context,{data:options.data})}else{var bindView=view.createChildView(Ember._HandlebarsBoundView,{preserveContext:preserveContext,shouldDisplayFunc:shouldDisplay,valueNormalizerFunc:valueNormalizer,displayTemplate:fn,inverseTemplate:inverse,path:property,pathRoot:currentContext,previousContext:currentContext,isEscaped:!options.hash.unescaped,templateData:options.data});view.appendChild(bindView);observer=function(){Ember.run.scheduleOnce("render",bindView,"rerenderIfNeeded")}}if(normalized.path!==""){view.registerObserver(normalized.root,normalized.path,observer);if(childProperties){for(i=0;i<childProperties.length;i++){view.registerObserver(normalized.root,normalized.path+"."+childProperties[i],observer)}}}}else{data.buffer.push(handlebarsGet(currentContext,property,options))}}function simpleBind(property,options){var data=options.data,view=data.view,currentContext=this,normalized,observer;normalized=normalizePath(currentContext,property,data);if("object"===typeof this){if(data.insideGroup){observer=function(){Ember.run.once(view,"rerender")};var result=handlebarsGet(currentContext,property,options);if(result===null||result===undefined){result=""}data.buffer.push(result)}else{var bindView=new Ember._SimpleHandlebarsView(property,currentContext,!options.hash.unescaped,options.data);bindView._parentView=view;view.appendChild(bindView);observer=function(){Ember.run.scheduleOnce("render",bindView,"rerender")}}if(normalized.path!==""){view.registerObserver(normalized.root,normalized.path,observer)}}else{data.buffer.push(handlebarsGet(currentContext,property,options))}}EmberHandlebars.registerHelper("_triageMustache",function(property,fn){Ember.assert("You cannot pass more than one argument to the _triageMustache helper",arguments.length<=2);if(helpers[property]){return helpers[property].call(this,fn)}else{return helpers.bind.apply(this,arguments)}});EmberHandlebars.registerHelper("bind",function(property,options){Ember.assert("You cannot pass more than one argument to the bind helper",arguments.length<=2);var context=options.contexts&&options.contexts[0]||this;if(!options.fn){return simpleBind.call(context,property,options)}return bind.call(context,property,options,false,function(result){return!Ember.isNone(result)})});EmberHandlebars.registerHelper("boundIf",function(property,fn){var context=fn.contexts&&fn.contexts[0]||this;var func=function(result){var truthy=result&&get(result,"isTruthy");if(typeof truthy==="boolean"){return truthy}if(Ember.isArray(result)){return get(result,"length")!==0}else{return!!result}};return bind.call(context,property,fn,true,func,func,["isTruthy","length"])});EmberHandlebars.registerHelper("with",function(context,options){if(arguments.length===4){var keywordName,path,rootPath,normalized;Ember.assert("If you pass more than one argument to the with helper, it must be in the form #with foo as bar",arguments[1]==="as");options=arguments[3];keywordName=arguments[2];path=arguments[0];Ember.assert("You must pass a block to the with helper",options.fn&&options.fn!==Handlebars.VM.noop);if(Ember.isGlobalPath(path)){Ember.bind(options.data.keywords,keywordName,path)}else{normalized=normalizePath(this,path,options.data);path=normalized.path;rootPath=normalized.root;var contextKey=Ember.$.expando+Ember.guidFor(rootPath);options.data.keywords[contextKey]=rootPath;var contextPath=path?contextKey+"."+path:contextKey;Ember.bind(options.data.keywords,keywordName,contextPath)}return bind.call(this,path,options,true,function(result){return!Ember.isNone(result)})}else{Ember.assert("You must pass exactly one argument to the with helper",arguments.length===2);Ember.assert("You must pass a block to the with helper",options.fn&&options.fn!==Handlebars.VM.noop);return helpers.bind.call(options.contexts[0],context,options)}});EmberHandlebars.registerHelper("if",function(context,options){Ember.assert("You must pass exactly one argument to the if helper",arguments.length===2);Ember.assert("You must pass a block to the if helper",options.fn&&options.fn!==Handlebars.VM.noop);return helpers.boundIf.call(options.contexts[0],context,options)});EmberHandlebars.registerHelper("unless",function(context,options){Ember.assert("You must pass exactly one argument to the unless helper",arguments.length===2);Ember.assert("You must pass a block to the unless helper",options.fn&&options.fn!==Handlebars.VM.noop);var fn=options.fn,inverse=options.inverse;options.fn=inverse;options.inverse=fn;return helpers.boundIf.call(options.contexts[0],context,options)});EmberHandlebars.registerHelper("bindAttr",function(options){var attrs=options.hash;Ember.assert("You must specify at least one hash argument to bindAttr",!!Ember.keys(attrs).length);var view=options.data.view;var ret=[];var ctx=this;var dataId=++Ember.uuid;var classBindings=attrs["class"];if(classBindings!==null&&classBindings!==undefined){var classResults=EmberHandlebars.bindClasses(this,classBindings,view,dataId,options);ret.push('class="'+Handlebars.Utils.escapeExpression(classResults.join(" "))+'"');delete attrs["class"]}var attrKeys=Ember.keys(attrs);forEach.call(attrKeys,function(attr){var path=attrs[attr],normalized;Ember.assert(fmt("You must provide a String for a bound attribute, not %@",[path]),typeof path==="string");normalized=normalizePath(ctx,path,options.data);var value=path==="this"?normalized.root:handlebarsGet(ctx,path,options),type=Ember.typeOf(value);Ember.assert(fmt("Attributes must be numbers, strings or booleans, not %@",[value]),value===null||value===undefined||type==="number"||type==="string"||type==="boolean");var observer,invoker;observer=function observer(){var result=handlebarsGet(ctx,path,options);Ember.assert(fmt("Attributes must be numbers, strings or booleans, not %@",[result]),result===null||result===undefined||typeof result==="number"||typeof result==="string"||typeof result==="boolean");var elem=view.$("[data-bindattr-"+dataId+"='"+dataId+"']");if(!elem||elem.length===0){Ember.removeObserver(normalized.root,normalized.path,invoker);return}Ember.View.applyAttributeBindings(elem,attr,result)};invoker=function(){Ember.run.scheduleOnce("render",observer)};if(path!=="this"&&!(normalized.isKeyword&&normalized.path==="")){view.registerObserver(normalized.root,normalized.path,invoker)}if(type==="string"||type==="number"&&!isNaN(value)){ret.push(attr+'="'+Handlebars.Utils.escapeExpression(value)+'"')}else if(value&&type==="boolean"){ret.push(attr+'="'+attr+'"')}},this);ret.push("data-bindattr-"+dataId+'="'+dataId+'"');return new EmberHandlebars.SafeString(ret.join(" "))});EmberHandlebars.bindClasses=function(context,classBindings,view,bindAttrId,options){var ret=[],newClass,value,elem;var classStringForPath=function(root,parsedPath,options){var val,path=parsedPath.path;if(path==="this"){val=root}else if(path===""){val=true}else{val=handlebarsGet(root,path,options)}return Ember.View._classStringForValue(path,val,parsedPath.className,parsedPath.falsyClassName)};forEach.call(classBindings.split(" "),function(binding){var oldClass;var observer,invoker;var parsedPath=Ember.View._parsePropertyPath(binding),path=parsedPath.path,pathRoot=context,normalized;if(path!==""&&path!=="this"){normalized=normalizePath(context,path,options.data);pathRoot=normalized.root;path=normalized.path}observer=function(){newClass=classStringForPath(context,parsedPath,options);elem=bindAttrId?view.$("[data-bindattr-"+bindAttrId+"='"+bindAttrId+"']"):view.$();if(!elem||elem.length===0){Ember.removeObserver(pathRoot,path,invoker)}else{if(oldClass){elem.removeClass(oldClass)}if(newClass){elem.addClass(newClass);oldClass=newClass}else{oldClass=null}}};invoker=function(){Ember.run.scheduleOnce("render",observer)};if(path!==""&&path!=="this"){view.registerObserver(pathRoot,path,invoker)}value=classStringForPath(context,parsedPath,options);if(value){ret.push(value);oldClass=value}});return ret}})();(function(){var get=Ember.get,set=Ember.set;var PARENT_VIEW_PATH=/^parentView\./;var EmberHandlebars=Ember.Handlebars;EmberHandlebars.ViewHelper=Ember.Object.create({propertiesFromHTMLOptions:function(options,thisContext){var hash=options.hash,data=options.data;var extensions={},classes=hash["class"],dup=false;if(hash.id){extensions.elementId=hash.id;dup=true}if(hash.tag){extensions.tagName=hash.tag;dup=true}if(classes){classes=classes.split(" ");extensions.classNames=classes;dup=true}if(hash.classBinding){extensions.classNameBindings=hash.classBinding.split(" ");dup=true}if(hash.classNameBindings){if(extensions.classNameBindings===undefined)extensions.classNameBindings=[];extensions.classNameBindings=extensions.classNameBindings.concat(hash.classNameBindings.split(" "));dup=true}if(hash.attributeBindings){Ember.assert("Setting 'attributeBindings' via Handlebars is not allowed. Please subclass Ember.View and set it there instead.");extensions.attributeBindings=null;dup=true}if(dup){hash=Ember.$.extend({},hash);delete hash.id;delete hash.tag;delete hash["class"];delete hash.classBinding}var path;for(var prop in hash){if(!hash.hasOwnProperty(prop)){continue}if(Ember.IS_BINDING.test(prop)&&typeof hash[prop]==="string"){path=this.contextualizeBindingPath(hash[prop],data);if(path){hash[prop]=path}}}if(extensions.classNameBindings){for(var b in extensions.classNameBindings){var full=extensions.classNameBindings[b];if(typeof full==="string"){var parsedPath=Ember.View._parsePropertyPath(full);path=this.contextualizeBindingPath(parsedPath.path,data);if(path){extensions.classNameBindings[b]=path+parsedPath.classNames}}}}return Ember.$.extend(hash,extensions)},contextualizeBindingPath:function(path,data){var normalized=Ember.Handlebars.normalizePath(null,path,data);if(normalized.isKeyword){return"templateData.keywords."+path}else if(Ember.isGlobalPath(path)){return null}else if(path==="this"){return"_parentView.context"}else{return"_parentView.context."+path}},helper:function(thisContext,path,options){var inverse=options.inverse,data=options.data,view=data.view,fn=options.fn,hash=options.hash,newView;if("string"===typeof path){newView=EmberHandlebars.get(thisContext,path,options);Ember.assert("Unable to find view at path '"+path+"'",!!newView)}else{newView=path}Ember.assert(Ember.String.fmt("You must pass a view to the #view helper, not %@ (%@)",[path,newView]),Ember.View.detect(newView)||Ember.View.detectInstance(newView));var viewOptions=this.propertiesFromHTMLOptions(options,thisContext);var currentView=data.view;viewOptions.templateData=options.data;var newViewProto=newView.proto?newView.proto():newView;if(fn){Ember.assert("You cannot provide a template block if you also specified a templateName",!get(viewOptions,"templateName")&&!get(newViewProto,"templateName"));viewOptions.template=fn}if(!newViewProto.controller&&!newViewProto.controllerBinding&&!viewOptions.controller&&!viewOptions.controllerBinding){viewOptions._context=thisContext}currentView.appendChild(newView,viewOptions)}});EmberHandlebars.registerHelper("view",function(path,options){Ember.assert("The view helper only takes a single argument",arguments.length<=2);if(path&&path.data&&path.data.isRenderData){options=path;path="Ember.View"}return EmberHandlebars.ViewHelper.helper(this,path,options)})})();(function(){var get=Ember.get,handlebarsGet=Ember.Handlebars.get,fmt=Ember.String.fmt;Ember.Handlebars.registerHelper("collection",function(path,options){Ember.deprecate("Using the {{collection}} helper without specifying a class has been deprecated as the {{each}} helper now supports the same functionality.",path!=="collection");if(path&&path.data&&path.data.isRenderData){options=path;path=undefined;Ember.assert("You cannot pass more than one argument to the collection helper",arguments.length===1)}else{Ember.assert("You cannot pass more than one argument to the collection helper",arguments.length===2)}var fn=options.fn;var data=options.data;var inverse=options.inverse;var view=options.data.view;var collectionClass;collectionClass=path?handlebarsGet(this,path,options):Ember.CollectionView;Ember.assert(fmt("%@ #collection: Could not find collection class %@",[data.view,path]),!!collectionClass);var hash=options.hash,itemHash={},match;var itemViewClass,itemViewPath=hash.itemViewClass;var collectionPrototype=collectionClass.proto();delete hash.itemViewClass;itemViewClass=itemViewPath?handlebarsGet(collectionPrototype,itemViewPath,options):collectionPrototype.itemViewClass;Ember.assert(fmt("%@ #collection: Could not find itemViewClass %@",[data.view,itemViewPath]),!!itemViewClass);for(var prop in hash){if(hash.hasOwnProperty(prop)){match=prop.match(/^item(.)(.*)$/);if(match&&prop!=="itemController"){itemHash[match[1].toLowerCase()+match[2]]=hash[prop];delete hash[prop]}}}var tagName=hash.tagName||collectionPrototype.tagName;if(fn){itemHash.template=fn;delete options.fn}var emptyViewClass;if(inverse&&inverse!==Handlebars.VM.noop){emptyViewClass=get(collectionPrototype,"emptyViewClass");emptyViewClass=emptyViewClass.extend({template:inverse,tagName:itemHash.tagName})}else if(hash.emptyViewClass){emptyViewClass=handlebarsGet(this,hash.emptyViewClass,options)}if(emptyViewClass){hash.emptyView=emptyViewClass}if(!hash.keyword){itemHash._context=Ember.computed.alias("content")}var viewString=view.toString();var viewOptions=Ember.Handlebars.ViewHelper.propertiesFromHTMLOptions({data:data,hash:itemHash},this);hash.itemViewClass=itemViewClass.extend(viewOptions);return Ember.Handlebars.helpers.view.call(this,collectionClass,options)})})();(function(){var handlebarsGet=Ember.Handlebars.get;Ember.Handlebars.registerHelper("unbound",function(property,fn){var options=arguments[arguments.length-1],helper,context,out;if(arguments.length>2){options.data.isUnbound=true;helper=Ember.Handlebars.helpers[arguments[0]]||Ember.Handlebars.helperMissing;out=helper.apply(this,Array.prototype.slice.call(arguments,1));delete options.data.isUnbound;return out}context=fn.contexts&&fn.contexts[0]||this;return handlebarsGet(context,property,fn)})})();(function(){var handlebarsGet=Ember.Handlebars.get,normalizePath=Ember.Handlebars.normalizePath;Ember.Handlebars.registerHelper("log",function(property,options){var context=options.contexts&&options.contexts[0]||this,normalized=normalizePath(context,property,options.data),pathRoot=normalized.root,path=normalized.path,value=path==="this"?pathRoot:handlebarsGet(pathRoot,path,options);Ember.Logger.log(value)});Ember.Handlebars.registerHelper("debugger",function(){debugger})})();(function(){var get=Ember.get,set=Ember.set;Ember.Handlebars.EachView=Ember.CollectionView.extend(Ember._Metamorph,{init:function(){var itemController=get(this,"itemController");var binding;if(itemController){var controller=Ember.ArrayController.create();set(controller,"itemController",itemController);set(controller,"container",get(this,"controller.container"));set(controller,"_eachView",this);set(controller,"target",get(this,"controller"));this.disableContentObservers(function(){set(this,"content",controller);binding=new Ember.Binding("content","_eachView.dataSource").oneWay();binding.connect(controller)});set(this,"_arrayController",controller)}else{this.disableContentObservers(function(){binding=new Ember.Binding("content","dataSource").oneWay();binding.connect(this)})}return this._super()},disableContentObservers:function(callback){Ember.removeBeforeObserver(this,"content",null,"_contentWillChange");Ember.removeObserver(this,"content",null,"_contentDidChange");callback.apply(this);Ember.addBeforeObserver(this,"content",null,"_contentWillChange");Ember.addObserver(this,"content",null,"_contentDidChange")},itemViewClass:Ember._MetamorphView,emptyViewClass:Ember._MetamorphView,createChildView:function(view,attrs){view=this._super(view,attrs);var keyword=get(this,"keyword");var content=get(view,"content");if(keyword){var data=get(view,"templateData");data=Ember.copy(data);data.keywords=view.cloneKeywords();set(view,"templateData",data);data.keywords[keyword]=content}if(content&&get(content,"isController")){set(view,"controller",content)}return view},willDestroy:function(){var arrayController=get(this,"_arrayController");if(arrayController){arrayController.destroy()}return this._super()}});var GroupedEach=Ember.Handlebars.GroupedEach=function(context,path,options){var self=this,normalized=Ember.Handlebars.normalizePath(context,path,options.data);this.context=context;this.path=path;this.options=options;this.template=options.fn;this.containingView=options.data.view;this.normalizedRoot=normalized.root;this.normalizedPath=normalized.path;this.content=this.lookupContent();this.addContentObservers();this.addArrayObservers();this.containingView.on("willClearRender",function(){self.destroy()})};GroupedEach.prototype={contentWillChange:function(){this.removeArrayObservers()},contentDidChange:function(){this.content=this.lookupContent();this.addArrayObservers();this.rerenderContainingView()},contentArrayWillChange:Ember.K,contentArrayDidChange:function(){this.rerenderContainingView()},lookupContent:function(){return Ember.Handlebars.get(this.normalizedRoot,this.normalizedPath,this.options)},addArrayObservers:function(){this.content.addArrayObserver(this,{willChange:"contentArrayWillChange",didChange:"contentArrayDidChange"})},removeArrayObservers:function(){this.content.removeArrayObserver(this,{willChange:"contentArrayWillChange",didChange:"contentArrayDidChange"})},addContentObservers:function(){Ember.addBeforeObserver(this.normalizedRoot,this.normalizedPath,this,this.contentWillChange);Ember.addObserver(this.normalizedRoot,this.normalizedPath,this,this.contentDidChange)},removeContentObservers:function(){Ember.removeBeforeObserver(this.normalizedRoot,this.normalizedPath,this.contentWillChange);Ember.removeObserver(this.normalizedRoot,this.normalizedPath,this.contentDidChange)},render:function(){var content=this.content,contentLength=get(content,"length"),data=this.options.data,template=this.template;data.insideEach=true;for(var i=0;i<contentLength;i++){template(content.objectAt(i),{data:data})}},rerenderContainingView:function(){Ember.run.scheduleOnce("render",this.containingView,"rerender")},destroy:function(){this.removeContentObservers();this.removeArrayObservers()}};Ember.Handlebars.registerHelper("each",function(path,options){if(arguments.length===4){Ember.assert("If you pass more than one argument to the each helper, it must be in the form #each foo in bar",arguments[1]==="in");var keywordName=arguments[0];options=arguments[3];path=arguments[2];if(path===""){path="this"}options.hash.keyword=keywordName}options.hash.dataSourceBinding=path;if(options.data.insideGroup&&!options.hash.groupedRows&&!options.hash.itemViewClass){new Ember.Handlebars.GroupedEach(this,path,options).render()}else{return Ember.Handlebars.helpers.collection.call(this,"Ember.Handlebars.EachView",options)}})})();(function(){Ember.Handlebars.registerHelper("template",function(name,options){var template=Ember.TEMPLATES[name];Ember.assert("Unable to find template with name '"+name+"'.",!!template);Ember.TEMPLATES[name](this,{data:options.data})})})();(function(){Ember.Handlebars.registerHelper("partial",function(name,options){var nameParts=name.split("/"),lastPart=nameParts[nameParts.length-1];nameParts[nameParts.length-1]="_"+lastPart;var underscoredName=nameParts.join("/");var template=Ember.TEMPLATES[underscoredName],deprecatedTemplate=Ember.TEMPLATES[name];Ember.deprecate("You tried to render the partial "+name+", which should be at '"+underscoredName+"', but Ember found '"+name+"'. Please use a leading underscore in your partials",template);Ember.assert("Unable to find partial with name '"+name+"'.",template||deprecatedTemplate);template=template||deprecatedTemplate;template(this,{data:options.data})})})();(function(){var get=Ember.get,set=Ember.set;Ember.Handlebars.registerHelper("yield",function(options){var view=options.data.view,template;while(view&&!get(view,"layout")){view=get(view,"parentView")}Ember.assert("You called yield in a template that was not a layout",!!view);template=get(view,"template");if(template){template(this,options)}})})();(function(){})();(function(){})();(function(){var set=Ember.set,get=Ember.get;Ember.Checkbox=Ember.View.extend({classNames:["ember-checkbox"],tagName:"input",attributeBindings:["type","checked","disabled","tabindex"],type:"checkbox",checked:false,disabled:false,init:function(){this._super();this.on("change",this,this._updateElementValue)},_updateElementValue:function(){set(this,"checked",this.$().prop("checked"))}})})();(function(){var get=Ember.get,set=Ember.set;Ember.TextSupport=Ember.Mixin.create({value:"",attributeBindings:["placeholder","disabled","maxlength","tabindex"],placeholder:null,disabled:false,maxlength:null,insertNewline:Ember.K,cancel:Ember.K,init:function(){this._super();this.on("focusOut",this,this._elementValueDidChange);this.on("change",this,this._elementValueDidChange);this.on("paste",this,this._elementValueDidChange);this.on("cut",this,this._elementValueDidChange);this.on("input",this,this._elementValueDidChange);this.on("keyUp",this,this.interpretKeyEvents)},interpretKeyEvents:function(event){var map=Ember.TextSupport.KEY_EVENTS;var method=map[event.keyCode];this._elementValueDidChange();if(method){return this[method](event)}},_elementValueDidChange:function(){set(this,"value",this.$().val())}});Ember.TextSupport.KEY_EVENTS={13:"insertNewline",27:"cancel"}})();(function(){var get=Ember.get,set=Ember.set;Ember.TextField=Ember.View.extend(Ember.TextSupport,{classNames:["ember-text-field"],tagName:"input",attributeBindings:["type","value","size","pattern"],value:"",type:"text",size:null,pattern:null,action:null,bubbles:false,insertNewline:function(event){var controller=get(this,"controller"),action=get(this,"action");if(action){controller.send(action,get(this,"value"),this);if(!get(this,"bubbles")){event.stopPropagation()}}}})})();(function(){var get=Ember.get,set=Ember.set;Ember.Button=Ember.View.extend(Ember.TargetActionSupport,{classNames:["ember-button"],classNameBindings:["isActive"],tagName:"button",propagateEvents:false,attributeBindings:["type","disabled","href","tabindex"],targetObject:Ember.computed(function(){var target=get(this,"target"),root=get(this,"context"),data=get(this,"templateData");if(typeof target!=="string"){return target}return Ember.Handlebars.get(root,target,{data:data})}).property("target"),type:Ember.computed(function(key){var tagName=this.tagName;if(tagName==="input"||tagName==="button"){return"button"}}),disabled:false,href:Ember.computed(function(){return this.tagName==="a"?"#":null}),mouseDown:function(){if(!get(this,"disabled")){set(this,"isActive",true);this._mouseDown=true;this._mouseEntered=true}return get(this,"propagateEvents")},mouseLeave:function(){if(this._mouseDown){set(this,"isActive",false);this._mouseEntered=false}},mouseEnter:function(){if(this._mouseDown){set(this,"isActive",true);this._mouseEntered=true}},mouseUp:function(event){if(get(this,"isActive")){this.triggerAction();set(this,"isActive",false)}this._mouseDown=false;this._mouseEntered=false;return get(this,"propagateEvents")},keyDown:function(event){if(event.keyCode===13||event.keyCode===32){this.mouseDown()}},keyUp:function(event){if(event.keyCode===13||event.keyCode===32){this.mouseUp()}},touchStart:function(touch){return this.mouseDown(touch)},touchEnd:function(touch){return this.mouseUp(touch)},init:function(){Ember.deprecate("Ember.Button is deprecated and will be removed from future releases. Consider using the `{{action}}` helper.");this._super()}})})();(function(){var get=Ember.get,set=Ember.set;Ember.TextArea=Ember.View.extend(Ember.TextSupport,{classNames:["ember-text-area"],tagName:"textarea",attributeBindings:["rows","cols"],rows:null,cols:null,_updateElementValue:Ember.observer(function(){var value=get(this,"value"),$el=this.$();if($el&&value!==$el.val()){$el.val(value)}},"value"),init:function(){this._super();this.on("didInsertElement",this,this._updateElementValue)}})})();(function(){var set=Ember.set,get=Ember.get,indexOf=Ember.EnumerableUtils.indexOf,indexesOf=Ember.EnumerableUtils.indexesOf,replace=Ember.EnumerableUtils.replace,isArray=Ember.isArray,precompileTemplate=Ember.Handlebars.compile;Ember.Select=Ember.View.extend({tagName:"select",classNames:["ember-select"],defaultTemplate:Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data){this.compilerInfo=[2,">= 1.0.rc.3"];helpers=helpers||Ember.Handlebars.helpers;data=data||{};var buffer="",stack1,hashTypes,escapeExpression=this.escapeExpression,self=this;function program1(depth0,data){var buffer="",hashTypes;data.buffer.push('<option value="">');hashTypes={};data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0,"view.prompt",{hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));data.buffer.push("</option>");return buffer}function program3(depth0,data){var hashTypes;hashTypes={contentBinding:"STRING"};data.buffer.push(escapeExpression(helpers.view.call(depth0,"Ember.SelectOption",{hash:{contentBinding:"this"},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})))}hashTypes={};stack1=helpers["if"].call(depth0,"view.prompt",{hash:{},inverse:self.noop,fn:self.program(1,program1,data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});if(stack1||stack1===0){data.buffer.push(stack1)}hashTypes={};stack1=helpers.each.call(depth0,"view.content",{hash:{},inverse:self.noop,fn:self.program(3,program3,data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});if(stack1||stack1===0){data.buffer.push(stack1)}return buffer}),attributeBindings:["multiple","disabled","tabindex"],multiple:false,disabled:false,content:null,selection:null,value:Ember.computed(function(key,value){if(arguments.length===2){return value
}var valuePath=get(this,"optionValuePath").replace(/^content\.?/,"");return valuePath?get(this,"selection."+valuePath):get(this,"selection")}).property("selection"),prompt:null,optionLabelPath:"content",optionValuePath:"content",_change:function(){if(get(this,"multiple")){this._changeMultiple()}else{this._changeSingle()}},selectionDidChange:Ember.observer(function(){var selection=get(this,"selection");if(get(this,"multiple")){if(!isArray(selection)){set(this,"selection",Ember.A([selection]));return}this._selectionDidChangeMultiple()}else{this._selectionDidChangeSingle()}},"selection.@each"),valueDidChange:Ember.observer(function(){var content=get(this,"content"),value=get(this,"value"),valuePath=get(this,"optionValuePath").replace(/^content\.?/,""),selectedValue=valuePath?get(this,"selection."+valuePath):get(this,"selection"),selection;if(value!==selectedValue){selection=content.find(function(obj){return value===(valuePath?get(obj,valuePath):obj)});this.set("selection",selection)}},"value"),_triggerChange:function(){var selection=get(this,"selection");var value=get(this,"value");if(selection){this.selectionDidChange()}if(value){this.valueDidChange()}this._change()},_changeSingle:function(){var selectedIndex=this.$()[0].selectedIndex,content=get(this,"content"),prompt=get(this,"prompt");if(!get(content,"length")){return}if(prompt&&selectedIndex===0){set(this,"selection",null);return}if(prompt){selectedIndex-=1}set(this,"selection",content.objectAt(selectedIndex))},_changeMultiple:function(){var options=this.$("option:selected"),prompt=get(this,"prompt"),offset=prompt?1:0,content=get(this,"content"),selection=get(this,"selection");if(!content){return}if(options){var selectedIndexes=options.map(function(){return this.index-offset}).toArray();var newSelection=content.objectsAt(selectedIndexes);if(isArray(selection)){replace(selection,0,get(selection,"length"),newSelection)}else{set(this,"selection",newSelection)}}},_selectionDidChangeSingle:function(){var el=this.get("element");if(!el){return}var content=get(this,"content"),selection=get(this,"selection"),selectionIndex=content?indexOf(content,selection):-1,prompt=get(this,"prompt");if(prompt){selectionIndex+=1}if(el){el.selectedIndex=selectionIndex}},_selectionDidChangeMultiple:function(){var content=get(this,"content"),selection=get(this,"selection"),selectedIndexes=content?indexesOf(content,selection):[-1],prompt=get(this,"prompt"),offset=prompt?1:0,options=this.$("option"),adjusted;if(options){options.each(function(){adjusted=this.index>-1?this.index-offset:-1;this.selected=indexOf(selectedIndexes,adjusted)>-1})}},init:function(){this._super();this.on("didInsertElement",this,this._triggerChange);this.on("change",this,this._change)}});Ember.SelectOption=Ember.View.extend({tagName:"option",attributeBindings:["value","selected"],defaultTemplate:function(context,options){options={data:options.data,hash:{}};Ember.Handlebars.helpers.bind.call(context,"view.label",options)},init:function(){this.labelPathDidChange();this.valuePathDidChange();this._super()},selected:Ember.computed(function(){var content=get(this,"content"),selection=get(this,"parentView.selection");if(get(this,"parentView.multiple")){return selection&&indexOf(selection,content.valueOf())>-1}else{return content==selection}}).property("content","parentView.selection").volatile(),labelPathDidChange:Ember.observer(function(){var labelPath=get(this,"parentView.optionLabelPath");if(!labelPath){return}Ember.defineProperty(this,"label",Ember.computed(function(){return get(this,labelPath)}).property(labelPath))},"parentView.optionLabelPath"),valuePathDidChange:Ember.observer(function(){var valuePath=get(this,"parentView.optionValuePath");if(!valuePath){return}Ember.defineProperty(this,"value",Ember.computed(function(){return get(this,valuePath)}).property(valuePath))},"parentView.optionValuePath")})})();(function(){})();(function(){Ember.Handlebars.bootstrap=function(ctx){var selectors='script[type="text/x-handlebars"], script[type="text/x-raw-handlebars"]';Ember.$(selectors,ctx).each(function(){var script=Ember.$(this);var compile=script.attr("type")==="text/x-raw-handlebars"?Ember.$.proxy(Handlebars.compile,Handlebars):Ember.$.proxy(Ember.Handlebars.compile,Ember.Handlebars),templateName=script.attr("data-template-name")||script.attr("id")||"application",template=compile(script.html());Ember.TEMPLATES[templateName]=template;script.remove()})};function bootstrap(){Ember.Handlebars.bootstrap(Ember.$(document))}Ember.onLoad("application",bootstrap)})();(function(){Ember.runLoadHooks("Ember.Handlebars",Ember.Handlebars)})();(function(){define("route-recognizer",[],function(){"use strict";var specials=["/",".","*","+","?","|","(",")","[","]","{","}","\\"];var escapeRegex=new RegExp("(\\"+specials.join("|\\")+")","g");function StaticSegment(string){this.string=string}StaticSegment.prototype={eachChar:function(callback){var string=this.string,char;for(var i=0,l=string.length;i<l;i++){char=string.charAt(i);callback({validChars:char})}},regex:function(){return this.string.replace(escapeRegex,"\\$1")},generate:function(){return this.string}};function DynamicSegment(name){this.name=name}DynamicSegment.prototype={eachChar:function(callback){callback({invalidChars:"/",repeat:true})},regex:function(){return"([^/]+)"},generate:function(params){return params[this.name]}};function StarSegment(name){this.name=name}StarSegment.prototype={eachChar:function(callback){callback({invalidChars:"",repeat:true})},regex:function(){return"(.+)"},generate:function(params){return params[this.name]}};function EpsilonSegment(){}EpsilonSegment.prototype={eachChar:function(){},regex:function(){return""},generate:function(){return""}};function parse(route,names,types){if(route.charAt(0)==="/"){route=route.substr(1)}var segments=route.split("/"),results=[];for(var i=0,l=segments.length;i<l;i++){var segment=segments[i],match;if(match=segment.match(/^:([^\/]+)$/)){results.push(new DynamicSegment(match[1]));names.push(match[1]);types.dynamics++}else if(match=segment.match(/^\*([^\/]+)$/)){results.push(new StarSegment(match[1]));names.push(match[1]);types.stars++}else if(segment===""){results.push(new EpsilonSegment)}else{results.push(new StaticSegment(segment));types.statics++}}return results}function State(charSpec){this.charSpec=charSpec;this.nextStates=[]}State.prototype={get:function(charSpec){var nextStates=this.nextStates;for(var i=0,l=nextStates.length;i<l;i++){var child=nextStates[i];var isEqual=child.charSpec.validChars===charSpec.validChars;isEqual=isEqual&&child.charSpec.invalidChars===charSpec.invalidChars;if(isEqual){return child}}},put:function(charSpec){var state;if(state=this.get(charSpec)){return state}state=new State(charSpec);this.nextStates.push(state);if(charSpec.repeat){state.nextStates.push(state)}return state},match:function(char){var nextStates=this.nextStates,child,charSpec,chars;var returned=[];for(var i=0,l=nextStates.length;i<l;i++){child=nextStates[i];charSpec=child.charSpec;if(typeof(chars=charSpec.validChars)!=="undefined"){if(chars.indexOf(char)!==-1){returned.push(child)}}else if(typeof(chars=charSpec.invalidChars)!=="undefined"){if(chars.indexOf(char)===-1){returned.push(child)}}}return returned}};function sortSolutions(states){return states.sort(function(a,b){if(a.types.stars!==b.types.stars){return a.types.stars-b.types.stars}if(a.types.dynamics!==b.types.dynamics){return a.types.dynamics-b.types.dynamics}if(a.types.statics!==b.types.statics){return a.types.statics-b.types.statics}return 0})}function recognizeChar(states,char){var nextStates=[];for(var i=0,l=states.length;i<l;i++){var state=states[i];nextStates=nextStates.concat(state.match(char))}return nextStates}function findHandler(state,path){var handlers=state.handlers,regex=state.regex;var captures=path.match(regex),currentCapture=1;var result=[];for(var i=0,l=handlers.length;i<l;i++){var handler=handlers[i],names=handler.names,params={};for(var j=0,m=names.length;j<m;j++){params[names[j]]=captures[currentCapture++]}result.push({handler:handler.handler,params:params,isDynamic:!!names.length})}return result}function addSegment(currentState,segment){segment.eachChar(function(char){var state;currentState=currentState.put(char)});return currentState}var RouteRecognizer=function(){this.rootState=new State;this.names={}};RouteRecognizer.prototype={add:function(routes,options){var currentState=this.rootState,regex="^",types={statics:0,dynamics:0,stars:0},handlers=[],allSegments=[],name;var isEmpty=true;for(var i=0,l=routes.length;i<l;i++){var route=routes[i],names=[];var segments=parse(route.path,names,types);allSegments=allSegments.concat(segments);for(var j=0,m=segments.length;j<m;j++){var segment=segments[j];if(segment instanceof EpsilonSegment){continue}isEmpty=false;currentState=currentState.put({validChars:"/"});regex+="/";currentState=addSegment(currentState,segment);regex+=segment.regex()}handlers.push({handler:route.handler,names:names})}if(isEmpty){currentState=currentState.put({validChars:"/"});regex+="/"}currentState.handlers=handlers;currentState.regex=new RegExp(regex+"$");currentState.types=types;if(name=options&&options.as){this.names[name]={segments:allSegments,handlers:handlers}}},handlersFor:function(name){var route=this.names[name],result=[];if(!route){throw new Error("There is no route named "+name)}for(var i=0,l=route.handlers.length;i<l;i++){result.push(route.handlers[i])}return result},hasRoute:function(name){return!!this.names[name]},generate:function(name,params){var route=this.names[name],output="";if(!route){throw new Error("There is no route named "+name)}var segments=route.segments;for(var i=0,l=segments.length;i<l;i++){var segment=segments[i];if(segment instanceof EpsilonSegment){continue}output+="/";output+=segment.generate(params)}if(output.charAt(0)!=="/"){output="/"+output}return output},recognize:function(path){var states=[this.rootState],i,l;var pathLen=path.length;if(path.charAt(0)!=="/"){path="/"+path}if(pathLen>1&&path.charAt(pathLen-1)==="/"){path=path.substr(0,pathLen-1)}for(i=0,l=path.length;i<l;i++){states=recognizeChar(states,path.charAt(i));if(!states.length){break}}var solutions=[];for(i=0,l=states.length;i<l;i++){if(states[i].handlers){solutions.push(states[i])}}states=sortSolutions(solutions);var state=solutions[0];if(state&&state.handlers){return findHandler(state,path)}}};function Target(path,matcher,delegate){this.path=path;this.matcher=matcher;this.delegate=delegate}Target.prototype={to:function(target,callback){var delegate=this.delegate;if(delegate&&delegate.willAddRoute){target=delegate.willAddRoute(this.matcher.target,target)}this.matcher.add(this.path,target);if(callback){if(callback.length===0){throw new Error("You must have an argument in the function passed to `to`")}this.matcher.addChild(this.path,target,callback,this.delegate)}}};function Matcher(target){this.routes={};this.children={};this.target=target}Matcher.prototype={add:function(path,handler){this.routes[path]=handler},addChild:function(path,target,callback,delegate){var matcher=new Matcher(target);this.children[path]=matcher;var match=generateMatch(path,matcher,delegate);if(delegate&&delegate.contextEntered){delegate.contextEntered(target,match)}callback(match)}};function generateMatch(startingPath,matcher,delegate){return function(path,nestedCallback){var fullPath=startingPath+path;if(nestedCallback){nestedCallback(generateMatch(fullPath,matcher,delegate))}else{return new Target(startingPath+path,matcher,delegate)}}}function addRoute(routeArray,path,handler){var len=0;for(var i=0,l=routeArray.length;i<l;i++){len+=routeArray[i].path.length}path=path.substr(len);routeArray.push({path:path,handler:handler})}function eachRoute(baseRoute,matcher,callback,binding){var routes=matcher.routes;for(var path in routes){if(routes.hasOwnProperty(path)){var routeArray=baseRoute.slice();addRoute(routeArray,path,routes[path]);if(matcher.children[path]){eachRoute(routeArray,matcher.children[path],callback,binding)}else{callback.call(binding,routeArray)}}}}RouteRecognizer.prototype.map=function(callback,addRouteCallback){var matcher=new Matcher;callback(generateMatch("",matcher,this.delegate));eachRoute([],matcher,function(route){if(addRouteCallback){addRouteCallback(this,route)}else{this.add(route)}},this)};return RouteRecognizer})})();(function(){define("router",["route-recognizer"],function(RouteRecognizer){"use strict";function Router(){this.recognizer=new RouteRecognizer}Router.prototype={map:function(callback){this.recognizer.delegate=this.delegate;this.recognizer.map(callback,function(recognizer,route){var lastHandler=route[route.length-1].handler;var args=[route,{as:lastHandler}];recognizer.add.apply(recognizer,args)})},hasRoute:function(route){return this.recognizer.hasRoute(route)},handleURL:function(url){var results=this.recognizer.recognize(url),objects=[];if(!results){throw new Error("No route matched the URL '"+url+"'")}collectObjects(this,results,0,[])},updateURL:function(){throw"updateURL is not implemented"},replaceURL:function(url){this.updateURL(url)},transitionTo:function(name){var args=Array.prototype.slice.call(arguments,1);doTransition(this,name,this.updateURL,args)},replaceWith:function(name){var args=Array.prototype.slice.call(arguments,1);doTransition(this,name,this.replaceURL,args)},paramsForHandler:function(handlerName,callback){var output=this._paramsForHandler(handlerName,[].slice.call(arguments,1));return output.params},generate:function(handlerName){var params=this.paramsForHandler.apply(this,arguments);return this.recognizer.generate(handlerName,params)},_paramsForHandler:function(handlerName,objects,doUpdate){var handlers=this.recognizer.handlersFor(handlerName),params={},toSetup=[],startIdx=handlers.length,objectsToMatch=objects.length,object,objectChanged,handlerObj,handler,names,i,len;for(i=handlers.length-1;i>=0&&objectsToMatch>0;i--){if(handlers[i].names.length){objectsToMatch--;startIdx=i}}if(objectsToMatch>0){throw"More objects were passed than dynamic segments"}for(i=0,len=handlers.length;i<len;i++){handlerObj=handlers[i];handler=this.getHandler(handlerObj.handler);names=handlerObj.names;objectChanged=false;if(names.length){if(i>=startIdx){object=objects.shift();objectChanged=true}else{object=handler.context}if(handler.serialize){merge(params,handler.serialize(object,names))}}else if(doUpdate){if(i>startIdx||!handler.hasOwnProperty("context")){if(handler.deserialize){object=handler.deserialize({});objectChanged=true}}else{object=handler.context}}if(doUpdate&&objectChanged){setContext(handler,object)}toSetup.push({isDynamic:!!handlerObj.names.length,handler:handlerObj.handler,name:handlerObj.name,context:object})}return{params:params,toSetup:toSetup}},isActive:function(handlerName){var contexts=[].slice.call(arguments,1);var currentHandlerInfos=this.currentHandlerInfos,found=false,names,object,handlerInfo,handlerObj;for(var i=currentHandlerInfos.length-1;i>=0;i--){handlerInfo=currentHandlerInfos[i];if(handlerInfo.name===handlerName){found=true}if(found){if(contexts.length===0){break}if(handlerInfo.isDynamic){object=contexts.pop();if(handlerInfo.context!==object){return false}}}}return contexts.length===0&&found},trigger:function(name){var args=[].slice.call(arguments);trigger(this,args)}};function merge(hash,other){for(var prop in other){if(other.hasOwnProperty(prop)){hash[prop]=other[prop]}}}function isCurrent(currentHandlerInfos,handlerName){return currentHandlerInfos[currentHandlerInfos.length-1].name===handlerName}function loading(router){if(!router.isLoading){router.isLoading=true;var handler=router.getHandler("loading");if(handler){if(handler.enter){handler.enter()}if(handler.setup){handler.setup()}}}}function loaded(router){router.isLoading=false;var handler=router.getHandler("loading");if(handler&&handler.exit){handler.exit()}}function failure(router,error){loaded(router);var handler=router.getHandler("failure");if(handler&&handler.setup){handler.setup(error)}}function doTransition(router,name,method,args){var output=router._paramsForHandler(name,args,true);var params=output.params,toSetup=output.toSetup;var url=router.recognizer.generate(name,params);method.call(router,url);setupContexts(router,toSetup)}function collectObjects(router,results,index,objects){if(results.length===index){loaded(router);setupContexts(router,objects);return}var result=results[index];var handler=router.getHandler(result.handler);var object=handler.deserialize&&handler.deserialize(result.params);if(object&&typeof object.then==="function"){loading(router);object.then(proceed).then(null,function(error){failure(router,error)})}else{proceed(object)}function proceed(value){if(handler.context!==object){setContext(handler,object)}var updatedObjects=objects.concat([{context:value,handler:result.handler,isDynamic:result.isDynamic}]);collectObjects(router,results,index+1,updatedObjects)}}function setupContexts(router,handlerInfos){resolveHandlers(router,handlerInfos);var partition=partitionHandlers(router.currentHandlerInfos||[],handlerInfos);router.currentHandlerInfos=handlerInfos;eachHandler(partition.exited,function(handler,context){delete handler.context;if(handler.exit){handler.exit()}});eachHandler(partition.updatedContext,function(handler,context){setContext(handler,context);if(handler.setup){handler.setup(context)}});var aborted=false;eachHandler(partition.entered,function(handler,context){if(aborted){return}if(handler.enter){handler.enter()}setContext(handler,context);if(handler.setup){if(false===handler.setup(context)){aborted=true}}});if(router.didTransition){router.didTransition(handlerInfos)}}function eachHandler(handlerInfos,callback){for(var i=0,l=handlerInfos.length;i<l;i++){var handlerInfo=handlerInfos[i],handler=handlerInfo.handler,context=handlerInfo.context;callback(handler,context)}}function resolveHandlers(router,handlerInfos){var handlerInfo;for(var i=0,l=handlerInfos.length;i<l;i++){handlerInfo=handlerInfos[i];handlerInfo.name=handlerInfo.handler;handlerInfo.handler=router.getHandler(handlerInfo.handler)}}function partitionHandlers(oldHandlers,newHandlers){var handlers={updatedContext:[],exited:[],entered:[]};var handlerChanged,contextChanged,i,l;for(i=0,l=newHandlers.length;i<l;i++){var oldHandler=oldHandlers[i],newHandler=newHandlers[i];if(!oldHandler||oldHandler.handler!==newHandler.handler){handlerChanged=true}if(handlerChanged){handlers.entered.push(newHandler);if(oldHandler){handlers.exited.unshift(oldHandler)}}else if(contextChanged||oldHandler.context!==newHandler.context){contextChanged=true;handlers.updatedContext.push(newHandler)}}for(i=newHandlers.length,l=oldHandlers.length;i<l;i++){handlers.exited.unshift(oldHandlers[i])}return handlers}function trigger(router,args){var currentHandlerInfos=router.currentHandlerInfos;var name=args.shift();if(!currentHandlerInfos){throw new Error("Could not trigger event '"+name+"'. There are no active handlers")}for(var i=currentHandlerInfos.length-1;i>=0;i--){var handlerInfo=currentHandlerInfos[i],handler=handlerInfo.handler;if(handler.events&&handler.events[name]){handler.events[name].apply(handler,args);return}}throw new Error("Nothing handled the event '"+name+"'.")}function setContext(handler,context){handler.context=context;if(handler.contextDidChange){handler.contextDidChange()}}return Router})})();(function(){function DSL(name){this.parent=name;this.matches=[]}DSL.prototype={resource:function(name,options,callback){if(arguments.length===2&&typeof options==="function"){callback=options;options={}}if(arguments.length===1){options={}}if(typeof options.path!=="string"){options.path="/"+name}if(callback){var dsl=new DSL(name);callback.call(dsl);this.push(options.path,name,dsl.generate())}else{this.push(options.path,name)}},push:function(url,name,callback){if(url===""||url==="/"){this.explicitIndex=true}this.matches.push([url,name,callback])},route:function(name,options){Ember.assert("You must use `this.resource` to nest",typeof options!=="function");options=options||{};if(typeof options.path!=="string"){options.path="/"+name}if(this.parent&&this.parent!=="application"){name=this.parent+"."+name}this.push(options.path,name)},generate:function(){var dslMatches=this.matches;if(!this.explicitIndex){this.route("index",{path:"/"})}return function(match){for(var i=0,l=dslMatches.length;i<l;i++){var dslMatch=dslMatches[i];match(dslMatch[0]).to(dslMatch[1],dslMatch[2])}}}};DSL.map=function(callback){var dsl=new DSL;callback.call(dsl);return dsl};Ember.RouterDSL=DSL})();(function(){Ember.controllerFor=function(container,controllerName,context,lookupOptions){return container.lookup("controller:"+controllerName,lookupOptions)||Ember.generateController(container,controllerName,context)};Ember.generateController=function(container,controllerName,context){var controller,DefaultController;if(context&&Ember.isArray(context)){DefaultController=container.resolve("controller:array");controller=DefaultController.extend({content:context})}else if(context){DefaultController=container.resolve("controller:object");controller=DefaultController.extend({content:context})}else{DefaultController=container.resolve("controller:basic");controller=DefaultController.extend()}controller.toString=function(){return"(generated "+controllerName+" controller)"};container.register("controller",controllerName,controller);return container.lookup("controller:"+controllerName)}})();(function(){var Router=requireModule("router");var get=Ember.get,set=Ember.set;var DefaultView=Ember._MetamorphView;function setupLocation(router){var location=get(router,"location"),rootURL=get(router,"rootURL");if("string"===typeof location){location=set(router,"location",Ember.Location.create({implementation:location}));if(typeof rootURL==="string"){set(location,"rootURL",rootURL)}}}Ember.Router=Ember.Object.extend({location:"hash",init:function(){this.router=this.constructor.router;this._activeViews={};setupLocation(this)},url:Ember.computed(function(){return get(this,"location").getURL()}),startRouting:function(){this.router=this.router||this.constructor.map(Ember.K);var router=this.router,location=get(this,"location"),container=this.container,self=this;setupRouter(this,router,location);container.register("view","default",DefaultView);container.register("view","toplevel",Ember.View.extend());location.onUpdateURL(function(url){self.handleURL(url)});this.handleURL(location.getURL())},didTransition:function(infos){for(var i=0,l=infos.length;i<l;i++){if(infos[i].handler.redirected){return}}var appController=this.container.lookup("controller:application"),path=routePath(infos);set(appController,"currentPath",path);this.notifyPropertyChange("url");if(get(this,"namespace").LOG_TRANSITIONS){Ember.Logger.log("Transitioned into '"+path+"'")}},handleURL:function(url){this.router.handleURL(url);this.notifyPropertyChange("url")},transitionTo:function(name){var args=[].slice.call(arguments);doTransition(this,"transitionTo",args)},replaceWith:function(){var args=[].slice.call(arguments);doTransition(this,"replaceWith",args)},generate:function(){var url=this.router.generate.apply(this.router,arguments);return this.location.formatURL(url)},isActive:function(routeName){var router=this.router;return router.isActive.apply(router,arguments)},send:function(name,context){this.router.trigger.apply(this.router,arguments)},hasRoute:function(route){return this.router.hasRoute(route)},_lookupActiveView:function(templateName){var active=this._activeViews[templateName];return active&&active[0]},_connectActiveView:function(templateName,view){var existing=this._activeViews[templateName];if(existing){existing[0].off("willDestroyElement",this,existing[1])}var disconnect=function(){delete this._activeViews[templateName]};this._activeViews[templateName]=[view,disconnect];view.one("willDestroyElement",this,disconnect)}});Ember.Router.reopenClass({defaultFailureHandler:{setup:function(error){Ember.Logger.error("Error while loading route:",error);setTimeout(function(){throw error})}}});function getHandlerFunction(router){var seen={},container=router.container,DefaultRoute=container.resolve("route:basic");return function(name){var handler=container.lookup("route:"+name);if(seen[name]){return handler}seen[name]=true;if(!handler){if(name==="loading"){return{}}if(name==="failure"){return router.constructor.defaultFailureHandler}container.register("route",name,DefaultRoute.extend());handler=container.lookup("route:"+name)}handler.routeName=name;return handler}}function handlerIsActive(router,handlerName){var handler=router.container.lookup("route:"+handlerName),currentHandlerInfos=router.router.currentHandlerInfos,handlerInfo;for(var i=0,l=currentHandlerInfos.length;i<l;i++){handlerInfo=currentHandlerInfos[i];if(handlerInfo.handler===handler){return true}}return false}function routePath(handlerInfos){var path=[];for(var i=1,l=handlerInfos.length;i<l;i++){var name=handlerInfos[i].name,nameParts=name.split(".");path.push(nameParts[nameParts.length-1])}return path.join(".")}function setupRouter(emberRouter,router,location){var lastURL;router.getHandler=getHandlerFunction(emberRouter);var doUpdateURL=function(){location.setURL(lastURL)};router.updateURL=function(path){lastURL=path;Ember.run.once(doUpdateURL)};if(location.replaceURL){var doReplaceURL=function(){location.replaceURL(lastURL)};router.replaceURL=function(path){lastURL=path;Ember.run.once(doReplaceURL)}}router.didTransition=function(infos){emberRouter.didTransition(infos)}}function doTransition(router,method,args){var passedName=args[0],name;if(!router.router.hasRoute(args[0])){name=args[0]=passedName+".index"}else{name=passedName}Ember.assert("The route "+passedName+" was not found",router.router.hasRoute(name));router.router[method].apply(router.router,args);router.notifyPropertyChange("url")}Ember.Router.reopenClass({map:function(callback){var router=this.router=new Router;var dsl=Ember.RouterDSL.map(function(){this.resource("application",{path:"/"},function(){callback.call(this)})});router.map(dsl.generate());return router}})})();(function(){var get=Ember.get,set=Ember.set,classify=Ember.String.classify;Ember.Route=Ember.Object.extend({exit:function(){this.deactivate();teardownView(this)},enter:function(){this.activate()},events:null,deactivate:Ember.K,activate:Ember.K,transitionTo:function(){if(this._checkingRedirect){this.redirected=true}return this.router.transitionTo.apply(this.router,arguments)},replaceWith:function(){if(this._checkingRedirect){this.redirected=true}return this.router.replaceWith.apply(this.router,arguments)},send:function(){return this.router.send.apply(this.router,arguments)},setup:function(context){this.redirected=false;this._checkingRedirect=true;this.redirect(context);this._checkingRedirect=false;if(this.redirected){return false}var controller=this.controllerFor(this.routeName,context);if(controller){this.controller=controller;set(controller,"model",context)}if(this.setupControllers){Ember.deprecate("Ember.Route.setupControllers is deprecated. Please use Ember.Route.setupController(controller, model) instead.");this.setupControllers(controller,context)}else{this.setupController(controller,context)}if(this.renderTemplates){Ember.deprecate("Ember.Route.renderTemplates is deprecated. Please use Ember.Route.renderTemplate(controller, model) instead.");this.renderTemplates(context)}else{this.renderTemplate(controller,context)}},redirect:Ember.K,deserialize:function(params){var model=this.model(params);return this.currentModel=model},contextDidChange:function(){this.currentModel=this.context},model:function(params){var match,name,sawParams,value;for(var prop in params){if(match=prop.match(/^(.*)_id$/)){name=match[1];value=params[prop]}sawParams=true}if(!name&&sawParams){return params}else if(!name){return}var className=classify(name),namespace=this.router.namespace,modelClass=namespace[className];Ember.assert("You used the dynamic segment "+name+"_id in your router, but "+namespace+"."+className+" did not exist and you did not override your route's `model` hook.",modelClass);return modelClass.find(value)},serialize:function(model,params){if(params.length!==1){return}var name=params[0],object={};if(/_id$/.test(name)){object[name]=get(model,"id")}else{object[name]=model}return object},setupController:Ember.K,controllerFor:function(name,model){var container=this.router.container,controller=container.lookup("controller:"+name);if(!controller){model=model||this.modelFor(name);Ember.assert("You are trying to look up a controller that you did not define, and for which Ember does not know the model.\n\nThis is not a controller for a route, so you must explicitly define the controller ("+this.router.namespace.toString()+"."+Ember.String.capitalize(Ember.String.camelize(name))+"Controller) or pass a model as the second parameter to `controllerFor`, so that Ember knows which type of controller to create for you.",model||this.container.lookup("route:"+name));controller=Ember.generateController(container,name,model)}return controller},modelFor:function(name){var route=this.container.lookup("route:"+name);return route&&route.currentModel},renderTemplate:function(controller,model){this.render()},render:function(name,options){Ember.assert("The name in the given arguments is undefined",arguments.length>0?!Ember.isNone(arguments[0]):true);if(typeof name==="object"&&!options){options=name;name=this.routeName}name=name?name.replace(/\//g,"."):this.routeName;var container=this.container,view=container.lookup("view:"+name),template=container.lookup("template:"+name);if(!view&&!template){return}options=normalizeOptions(this,name,template,options);view=setupView(view,container,options);if(options.outlet==="main"){this.lastRenderedTemplate=name}appendView(this,view,options)},willDestroy:function(){teardownView(this)}});function parentRoute(route){var handlerInfos=route.router.router.currentHandlerInfos;var parent,current;for(var i=0,l=handlerInfos.length;i<l;i++){current=handlerInfos[i].handler;if(current===route){return parent}parent=current}}function parentTemplate(route,isRecursive){var parent=parentRoute(route),template;if(!parent){return}Ember.warn("The immediate parent route did not render into the main outlet and the default 'into' option may not be expected",!isRecursive);if(template=parent.lastRenderedTemplate){return template}else{return parentTemplate(parent,true)}}function normalizeOptions(route,name,template,options){options=options||{};options.into=options.into?options.into.replace(/\//g,"."):parentTemplate(route);options.outlet=options.outlet||"main";options.name=name;options.template=template;Ember.assert("An outlet ("+options.outlet+") was specified but this view will render at the root level.",options.outlet==="main"||options.into);var controller=options.controller,namedController;if(options.controller){controller=options.controller}else if(namedController=route.container.lookup("controller:"+name)){controller=namedController}else{controller=route.routeName}if(typeof controller==="string"){controller=route.container.lookup("controller:"+controller)}options.controller=controller;return options}function setupView(view,container,options){var defaultView=options.into?"view:default":"view:toplevel";view=view||container.lookup(defaultView);if(!get(view,"templateName")){set(view,"template",options.template);set(view,"_debugTemplateName",options.name)}set(view,"renderedName",options.name);set(view,"controller",options.controller);return view}function appendView(route,view,options){if(options.into){var parentView=route.router._lookupActiveView(options.into);route.teardownView=teardownOutlet(parentView,options.outlet);parentView.connectOutlet(options.outlet,view)}else{var rootElement=get(route,"router.namespace.rootElement");route.router._connectActiveView(options.name,view);route.teardownView=teardownTopLevel(view);view.appendTo(rootElement)}}function teardownTopLevel(view){return function(){view.destroy()}}function teardownOutlet(parentView,outlet){return function(){parentView.disconnectOutlet(outlet)
}}function teardownView(route){if(route.teardownView){route.teardownView()}delete route.teardownView;delete route.lastRenderedTemplate}})();(function(){})();(function(){Ember.onLoad("Ember.Handlebars",function(){var handlebarsResolve=Ember.Handlebars.resolveParams,map=Ember.ArrayPolyfills.map,get=Ember.get;function resolveParams(context,params,options){var resolved=handlebarsResolve(context,params,options);return map.call(resolved,unwrap);function unwrap(object,i){if(params[i]==="controller"){return object}if(Ember.ControllerMixin.detect(object)){return unwrap(get(object,"model"))}else{return object}}}Ember.Router.resolveParams=resolveParams})})();(function(){var get=Ember.get,set=Ember.set;Ember.onLoad("Ember.Handlebars",function(Handlebars){var resolveParams=Ember.Router.resolveParams,isSimpleClick=Ember.ViewUtils.isSimpleClick;function fullRouteName(router,name){if(!router.hasRoute(name)){name=name+".index"}return name}function resolvedPaths(options){var types=options.options.types.slice(1),data=options.options.data;return resolveParams(options.context,options.params,{types:types,data:data})}function args(linkView,router,route){var passedRouteName=route||linkView.namedRoute,routeName;routeName=fullRouteName(router,passedRouteName);Ember.assert("The route "+passedRouteName+" was not found",router.hasRoute(routeName));var ret=[routeName];return ret.concat(resolvedPaths(linkView.parameters))}var LinkView=Ember.View.extend({tagName:"a",namedRoute:null,currentWhen:null,title:null,activeClass:"active",replace:false,attributeBindings:["href","title"],classNameBindings:"active",concreteView:Ember.computed(function(){return get(this,"parentView")}).property("parentView").volatile(),active:Ember.computed(function(){var router=this.get("router"),params=resolvedPaths(this.parameters),currentWithIndex=this.currentWhen+".index",isActive=router.isActive.apply(router,[this.currentWhen].concat(params))||router.isActive.apply(router,[currentWithIndex].concat(params));if(isActive){return get(this,"activeClass")}}).property("namedRoute","router.url"),router:Ember.computed(function(){return this.get("controller").container.lookup("router:main")}),click:function(event){if(!isSimpleClick(event)){return true}event.preventDefault();if(this.bubbles===false){event.stopPropagation()}var router=this.get("router");if(this.get("replace")){router.replaceWith.apply(router,args(this,router))}else{router.transitionTo.apply(router,args(this,router))}},href:Ember.computed(function(){var router=this.get("router");return router.generate.apply(router,args(this,router))})});LinkView.toString=function(){return"LinkView"};Ember.Handlebars.registerHelper("linkTo",function(name){var options=[].slice.call(arguments,-1)[0];var params=[].slice.call(arguments,1,-1);var hash=options.hash;hash.namedRoute=name;hash.currentWhen=hash.currentWhen||name;hash.parameters={context:this,options:options,params:params};return Ember.Handlebars.helpers.view.call(this,LinkView,options)})})})();(function(){var get=Ember.get,set=Ember.set;Ember.onLoad("Ember.Handlebars",function(Handlebars){Handlebars.OutletView=Ember.ContainerView.extend(Ember._Metamorph);Handlebars.registerHelper("outlet",function(property,options){var outletSource;if(property&&property.data&&property.data.isRenderData){options=property;property="main"}outletSource=options.data.view;while(!outletSource.get("template.isTop")){outletSource=outletSource.get("_parentView")}options.data.view.set("outletSource",outletSource);options.hash.currentViewBinding="_view.outletSource._outlets."+property;return Handlebars.helpers.view.call(this,Handlebars.OutletView,options)})})})();(function(){var get=Ember.get,set=Ember.set;Ember.onLoad("Ember.Handlebars",function(Handlebars){Ember.Handlebars.registerHelper("render",function(name,contextString,options){Ember.assert("You must pass a template to render",arguments.length>=2);var container,router,controller,view,context,lookupOptions;if(arguments.length===2){options=contextString;contextString=undefined}if(typeof contextString==="string"){context=Ember.Handlebars.get(options.contexts[1],contextString,options);lookupOptions={singleton:false}}name=name.replace(/\//g,".");container=options.data.keywords.controller.container;router=container.lookup("router:main");Ember.assert("This view is already rendered",!router||!router._lookupActiveView(name));view=container.lookup("view:"+name)||container.lookup("view:default");if(controller=options.hash.controller){controller=container.lookup("controller:"+controller,lookupOptions)}else{controller=Ember.controllerFor(container,name,context,lookupOptions)}if(controller&&context){controller.set("model",context)}var root=options.contexts[1];if(root){view.registerObserver(root,contextString,function(){controller.set("model",Ember.Handlebars.get(root,contextString,options))})}controller.set("target",options.data.keywords.controller);options.hash.viewName=Ember.String.camelize(name);options.hash.template=container.lookup("template:"+name);options.hash.controller=controller;if(router){router._connectActiveView(name,view)}Ember.Handlebars.helpers.view.call(this,view,options)})})})();(function(){Ember.onLoad("Ember.Handlebars",function(Handlebars){var resolveParams=Ember.Router.resolveParams,isSimpleClick=Ember.ViewUtils.isSimpleClick;var EmberHandlebars=Ember.Handlebars,handlebarsGet=EmberHandlebars.get,SafeString=EmberHandlebars.SafeString,get=Ember.get,a_slice=Array.prototype.slice;function args(options,actionName){var ret=[];if(actionName){ret.push(actionName)}var types=options.options.types.slice(1),data=options.options.data;return ret.concat(resolveParams(options.context,options.params,{types:types,data:data}))}var ActionHelper=EmberHandlebars.ActionHelper={registeredActions:{}};var keys=["alt","shift","meta","ctrl"];var isAllowedClick=function(event,allowedKeys){if(typeof allowedKeys==="undefined"){return isSimpleClick(event)}var allowed=true;keys.forEach(function(key){if(event[key+"Key"]&&allowedKeys.indexOf(key)===-1){allowed=false}});return allowed};ActionHelper.registerAction=function(actionName,options,allowedKeys){var actionId=(++Ember.uuid).toString();ActionHelper.registeredActions[actionId]={eventName:options.eventName,handler:function(event){if(!isAllowedClick(event,allowedKeys)){return true}event.preventDefault();if(options.bubbles===false){event.stopPropagation()}var target=options.target;if(target.target){target=handlebarsGet(target.root,target.target,target.options)}else{target=target.root}Ember.run(function(){if(target.send){target.send.apply(target,args(options.parameters,actionName))}else{Ember.assert("The action '"+actionName+"' did not exist on "+target,typeof target[actionName]==="function");target[actionName].apply(target,args(options.parameters))}})}};options.view.on("willClearRender",function(){delete ActionHelper.registeredActions[actionId]});return actionId};EmberHandlebars.registerHelper("action",function(actionName){var options=arguments[arguments.length-1],contexts=a_slice.call(arguments,1,-1);var hash=options.hash,view=options.data.view,controller;var action={eventName:hash.on||"click"};action.parameters={context:this,options:options,params:contexts};action.view=view=get(view,"concreteView");var root,target;if(hash.target){root=this;target=hash.target}else if(controller=options.data.keywords.controller){root=controller}action.target={root:root,target:target,options:options};action.bubbles=hash.bubbles;var actionId=ActionHelper.registerAction(actionName,action,hash.allowedKeys);return new SafeString('data-ember-action="'+actionId+'"')})})})();(function(){if(Ember.ENV.EXPERIMENTAL_CONTROL_HELPER){var get=Ember.get,set=Ember.set;Ember.Handlebars.registerHelper("control",function(path,modelPath,options){if(arguments.length===2){options=modelPath;modelPath=undefined}var model;if(modelPath){model=Ember.Handlebars.get(this,modelPath,options)}var controller=options.data.keywords.controller,view=options.data.keywords.view,children=get(controller,"_childContainers"),controlID=options.hash.controlID,container,subContainer;if(children.hasOwnProperty(controlID)){subContainer=children[controlID]}else{container=get(controller,"container"),subContainer=container.child();children[controlID]=subContainer}var normalizedPath=path.replace(/\//g,".");var childView=subContainer.lookup("view:"+normalizedPath)||subContainer.lookup("view:default"),childController=subContainer.lookup("controller:"+normalizedPath),childTemplate=subContainer.lookup("template:"+path);Ember.assert("Could not find controller for path: "+normalizedPath,childController);Ember.assert("Could not find view for path: "+normalizedPath,childView);set(childController,"target",controller);set(childController,"model",model);options.hash.template=childTemplate;options.hash.controller=childController;function observer(){var model=Ember.Handlebars.get(this,modelPath,options);set(childController,"model",model);childView.rerender()}Ember.addObserver(this,modelPath,observer);childView.one("willDestroyElement",this,function(){Ember.removeObserver(this,modelPath,observer)});Ember.Handlebars.helpers.view.call(this,childView,options)})}})();(function(){})();(function(){var get=Ember.get,set=Ember.set;Ember.ControllerMixin.reopen({transitionToRoute:function(){var target=get(this,"target"),method=target.transitionToRoute||target.transitionTo;return method.apply(target,arguments)},transitionTo:function(){Ember.deprecate("transitionTo is deprecated. Please use transitionToRoute.");return this.transitionToRoute.apply(this,arguments)},replaceRoute:function(){var target=get(this,"target"),method=target.replaceRoute||target.replaceWith;return method.apply(target,arguments)},replaceWith:function(){Ember.deprecate("replaceWith is deprecated. Please use replaceRoute.");return this.replaceRoute.apply(this,arguments)}})})();(function(){var get=Ember.get,set=Ember.set;Ember.View.reopen({init:function(){set(this,"_outlets",{});this._super()},connectOutlet:function(outletName,view){var outlets=get(this,"_outlets"),container=get(this,"container"),router=container&&container.lookup("router:main"),renderedName=get(view,"renderedName");set(outlets,outletName,view);if(router&&renderedName){router._connectActiveView(renderedName,view)}},disconnectOutlet:function(outletName){var outlets=get(this,"_outlets");set(outlets,outletName,null)}})})();(function(){})();(function(){var get=Ember.get,set=Ember.set;Ember.Location={create:function(options){var implementation=options&&options.implementation;Ember.assert("Ember.Location.create: you must specify a 'implementation' option",!!implementation);var implementationClass=this.implementations[implementation];Ember.assert("Ember.Location.create: "+implementation+" is not a valid implementation",!!implementationClass);return implementationClass.create.apply(implementationClass,arguments)},registerImplementation:function(name,implementation){this.implementations[name]=implementation},implementations:{}}})();(function(){var get=Ember.get,set=Ember.set;Ember.NoneLocation=Ember.Object.extend({path:"",getURL:function(){return get(this,"path")},setURL:function(path){set(this,"path",path)},onUpdateURL:function(callback){this.updateCallback=callback},handleURL:function(url){set(this,"path",url);this.updateCallback(url)},formatURL:function(url){return url}});Ember.Location.registerImplementation("none",Ember.NoneLocation)})();(function(){var get=Ember.get,set=Ember.set;Ember.HashLocation=Ember.Object.extend({init:function(){set(this,"location",get(this,"location")||window.location)},getURL:function(){return get(this,"location").hash.substr(1)},setURL:function(path){get(this,"location").hash=path;set(this,"lastSetURL",path)},onUpdateURL:function(callback){var self=this;var guid=Ember.guidFor(this);Ember.$(window).bind("hashchange.ember-location-"+guid,function(){Ember.run(function(){var path=location.hash.substr(1);if(get(self,"lastSetURL")===path){return}set(self,"lastSetURL",null);callback(path)})})},formatURL:function(url){return"#"+url},willDestroy:function(){var guid=Ember.guidFor(this);Ember.$(window).unbind("hashchange.ember-location-"+guid)}});Ember.Location.registerImplementation("hash",Ember.HashLocation)})();(function(){var get=Ember.get,set=Ember.set;var popstateFired=false;Ember.HistoryLocation=Ember.Object.extend({init:function(){set(this,"location",get(this,"location")||window.location);this._initialUrl=this.getURL();this.initState()},initState:function(){this.replaceState(this.formatURL(this.getURL()));set(this,"history",window.history)},rootURL:"/",getURL:function(){var rootURL=get(this,"rootURL"),url=get(this,"location").pathname;rootURL=rootURL.replace(/\/$/,"");url=url.replace(rootURL,"");return url},setURL:function(path){path=this.formatURL(path);if(this.getState()&&this.getState().path!==path){this.pushState(path)}},replaceURL:function(path){path=this.formatURL(path);if(this.getState()&&this.getState().path!==path){this.replaceState(path)}},getState:function(){return get(this,"history").state},pushState:function(path){window.history.pushState({path:path},null,path)},replaceState:function(path){window.history.replaceState({path:path},null,path)},onUpdateURL:function(callback){var guid=Ember.guidFor(this),self=this;Ember.$(window).bind("popstate.ember-location-"+guid,function(e){if(!popstateFired){popstateFired=true;if(self.getURL()===self._initialUrl){return}}callback(self.getURL())})},formatURL:function(url){var rootURL=get(this,"rootURL");if(url!==""){rootURL=rootURL.replace(/\/$/,"")}return rootURL+url},willDestroy:function(){var guid=Ember.guidFor(this);Ember.$(window).unbind("popstate.ember-location-"+guid)}});Ember.Location.registerImplementation("history",Ember.HistoryLocation)})();(function(){})();(function(){})();(function(){function visit(vertex,fn,visited,path){var name=vertex.name,vertices=vertex.incoming,names=vertex.incomingNames,len=names.length,i;if(!visited){visited={}}if(!path){path=[]}if(visited.hasOwnProperty(name)){return}path.push(name);visited[name]=true;for(i=0;i<len;i++){visit(vertices[names[i]],fn,visited,path)}fn(vertex,path);path.pop()}function DAG(){this.names=[];this.vertices={}}DAG.prototype.add=function(name){if(!name){return}if(this.vertices.hasOwnProperty(name)){return this.vertices[name]}var vertex={name:name,incoming:{},incomingNames:[],hasOutgoing:false,value:null};this.vertices[name]=vertex;this.names.push(name);return vertex};DAG.prototype.map=function(name,value){this.add(name).value=value};DAG.prototype.addEdge=function(fromName,toName){if(!fromName||!toName||fromName===toName){return}var from=this.add(fromName),to=this.add(toName);if(to.incoming.hasOwnProperty(fromName)){return}function checkCycle(vertex,path){if(vertex.name===toName){throw new Error("cycle detected: "+toName+" <- "+path.join(" <- "))}}visit(from,checkCycle);from.hasOutgoing=true;to.incoming[fromName]=from;to.incomingNames.push(fromName)};DAG.prototype.topsort=function(fn){var visited={},vertices=this.vertices,names=this.names,len=names.length,i,vertex;for(i=0;i<len;i++){vertex=vertices[names[i]];if(!vertex.hasOutgoing){visit(vertex,fn,visited)}}};DAG.prototype.addEdges=function(name,value,before,after){var i;this.map(name,value);if(before){if(typeof before==="string"){this.addEdge(name,before)}else{for(i=0;i<before.length;i++){this.addEdge(name,before[i])}}}if(after){if(typeof after==="string"){this.addEdge(after,name)}else{for(i=0;i<after.length;i++){this.addEdge(after[i],name)}}}};Ember.DAG=DAG})();(function(){var get=Ember.get,set=Ember.set,classify=Ember.String.classify,capitalize=Ember.String.capitalize,decamelize=Ember.String.decamelize;var Application=Ember.Application=Ember.Namespace.extend({rootElement:"body",eventDispatcher:null,customEvents:null,isInitialized:false,_readinessDeferrals:1,init:function(){if(!this.$){this.$=Ember.$}this.__container__=this.buildContainer();this.Router=this.Router||this.defaultRouter();if(this.Router){this.Router.namespace=this}this._super();if(!Ember.testing||Ember.testingDeferred){this.scheduleInitialize()}if(Ember.LOG_VERSION){Ember.LOG_VERSION=false;Ember.debug("-------------------------------");Ember.debug("Ember.VERSION : "+Ember.VERSION);Ember.debug("Handlebars.VERSION : "+Ember.Handlebars.VERSION);Ember.debug("jQuery.VERSION : "+Ember.$().jquery);Ember.debug("-------------------------------")}},buildContainer:function(){var container=this.__container__=Application.buildContainer(this);return container},defaultRouter:function(){if(this.router===undefined){return Ember.Router.extend()}},scheduleInitialize:function(){var self=this;this.$().ready(function(){if(self.isDestroyed||self.isInitialized){return}Ember.run.schedule("actions",self,"initialize")})},deferReadiness:function(){Ember.assert("You cannot defer readiness since the `ready()` hook has already been called.",this._readinessDeferrals>0);this._readinessDeferrals++},advanceReadiness:function(){this._readinessDeferrals--;if(this._readinessDeferrals===0){Ember.run.once(this,this.didBecomeReady)}},register:function(){var container=this.__container__;container.register.apply(container,arguments)},inject:function(){var container=this.__container__;container.injection.apply(container,arguments)},initialize:function(){Ember.assert("Application initialize may only be called once",!this.isInitialized);Ember.assert("Cannot initialize a destroyed application",!this.isDestroyed);this.isInitialized=true;this.register("router","main",this.Router);this.runInitializers();Ember.runLoadHooks("application",this);this.advanceReadiness();return this},reset:function(){get(this,"__container__").destroy();this.buildContainer();this.isInitialized=false;this.initialize();this.startRouting()},runInitializers:function(){var initializers=get(this.constructor,"initializers"),container=this.__container__,graph=new Ember.DAG,namespace=this,i,initializer;for(i=0;i<initializers.length;i++){initializer=initializers[i];graph.addEdges(initializer.name,initializer.initialize,initializer.before,initializer.after)}graph.topsort(function(vertex){var initializer=vertex.value;Ember.assert("No application initializer named '"+vertex.name+"'",initializer);initializer(container,namespace)})},didBecomeReady:function(){this.setupEventDispatcher();this.ready();this.startRouting();if(!Ember.testing){Ember.Namespace.processAll();Ember.BOOTED=true}},setupEventDispatcher:function(){var eventDispatcher=this.createEventDispatcher(),customEvents=get(this,"customEvents");eventDispatcher.setup(customEvents)},createEventDispatcher:function(){var rootElement=get(this,"rootElement"),eventDispatcher=Ember.EventDispatcher.create({rootElement:rootElement});set(this,"eventDispatcher",eventDispatcher);return eventDispatcher},startRouting:function(){var router=this.__container__.lookup("router:main");if(!router){return}router.startRouting()},handleURL:function(url){var router=this.__container__.lookup("router:main");router.handleURL(url)},ready:Ember.K,willDestroy:function(){Ember.BOOTED=false;var eventDispatcher=get(this,"eventDispatcher");if(eventDispatcher){eventDispatcher.destroy()}get(this,"__container__").destroy()},initializer:function(options){this.constructor.initializer(options)}});Ember.Application.reopenClass({concatenatedProperties:["initializers"],initializers:Ember.A(),initializer:function(initializer){var initializers=get(this,"initializers");Ember.assert("The initializer '"+initializer.name+"' has already been registered",!initializers.findProperty("name",initializers.name));Ember.assert("An injection cannot be registered with both a before and an after",!(initializer.before&&initializer.after));Ember.assert("An injection cannot be registered without an injection function",Ember.canInvoke(initializer,"initialize"));initializers.push(initializer)},buildContainer:function(namespace){var container=new Ember.Container;Ember.Container.defaultContainer=Ember.Container.defaultContainer||container;container.set=Ember.set;container.normalize=normalize;container.resolver=resolverFor(namespace);container.optionsForType("view",{singleton:false});container.optionsForType("template",{instantiate:false});container.register("application","main",namespace,{instantiate:false});container.register("controller:basic",Ember.Controller,{instantiate:false});container.register("controller:object",Ember.ObjectController,{instantiate:false});container.register("controller:array",Ember.ArrayController,{instantiate:false});container.register("route:basic",Ember.Route,{instantiate:false});container.injection("router:main","namespace","application:main");container.typeInjection("controller","target","router:main");container.typeInjection("controller","namespace","application:main");container.typeInjection("route","router","router:main");return container}});function resolverFor(namespace){return function(fullName){var nameParts=fullName.split(":"),type=nameParts[0],name=nameParts[1],root=namespace;if(type==="template"){var templateName=name.replace(/\./g,"/");if(Ember.TEMPLATES[templateName]){return Ember.TEMPLATES[templateName]}templateName=decamelize(templateName);if(Ember.TEMPLATES[templateName]){return Ember.TEMPLATES[templateName]}}if(type==="controller"||type==="route"||type==="view"){name=name.replace(/\./g,"_");if(name==="basic"){name=""}}if(type!=="template"&&name.indexOf("/")!==-1){var parts=name.split("/");name=parts[parts.length-1];var namespaceName=capitalize(parts.slice(0,-1).join("."));root=Ember.Namespace.byName(namespaceName);Ember.assert("You are looking for a "+name+" "+type+" in the "+namespaceName+" namespace, but it could not be found",root)}var className=classify(name)+classify(type);var factory=get(root,className);if(factory){return factory}}}function normalize(fullName){var split=fullName.split(":"),type=split[0],name=split[1];if(type!=="template"){var result=name;if(result.indexOf(".")>-1){result=result.replace(/\.(.)/g,function(m){return m.charAt(1).toUpperCase()})}if(name.indexOf("_")>-1){result=result.replace(/_(.)/g,function(m){return m.charAt(1).toUpperCase()})}return type+":"+result}else{return fullName}}Ember.runLoadHooks("Ember.Application",Ember.Application)})();(function(){})();(function(){var get=Ember.get,set=Ember.set;var ControllersProxy=Ember.Object.extend({controller:null,unknownProperty:function(controllerName){var controller=get(this,"controller"),needs=get(controller,"needs"),container=controller.get("container"),dependency;for(var i=0,l=needs.length;i<l;i++){dependency=needs[i];if(dependency===controllerName){return container.lookup("controller:"+controllerName)}}}});function verifyDependencies(controller){var needs=get(controller,"needs"),container=get(controller,"container"),dependency,satisfied=true;for(var i=0,l=needs.length;i<l;i++){dependency=needs[i];if(dependency.indexOf(":")===-1){dependency="controller:"+dependency}if(!container.has(dependency)){satisfied=false;Ember.assert(controller+" needs "+dependency+" but it does not exist",false)}}return satisfied}Ember.ControllerMixin.reopen({concatenatedProperties:["needs"],needs:[],init:function(){this._super.apply(this,arguments);if(!verifyDependencies(this)){Ember.assert("Missing dependencies",false)}},controllerFor:function(controllerName){Ember.deprecate("Controller#controllerFor is deprecated, please use Controller#needs instead");var container=get(this,"container");return container.lookup("controller:"+controllerName)},controllers:Ember.computed(function(){return ControllersProxy.create({controller:this})})})})();(function(){})();(function(){})();(function(){var get=Ember.get,set=Ember.set;Ember.State=Ember.Object.extend(Ember.Evented,{isState:true,parentState:null,start:null,name:null,path:Ember.computed(function(){var parentPath=get(this,"parentState.path"),path=get(this,"name");if(parentPath){path=parentPath+"."+path}return path}),trigger:function(name){if(this[name]){this[name].apply(this,[].slice.call(arguments,1))}this._super.apply(this,arguments)},init:function(){var states=get(this,"states");set(this,"childStates",Ember.A());set(this,"eventTransitions",get(this,"eventTransitions")||{});var name,value,transitionTarget;if(!states){states={};for(name in this){if(name==="constructor"){continue}if(value=this[name]){if(transitionTarget=value.transitionTarget){this.eventTransitions[name]=transitionTarget}this.setupChild(states,name,value)}}set(this,"states",states)}else{for(name in states){this.setupChild(states,name,states[name])}}set(this,"pathsCache",{});set(this,"pathsCacheNoContext",{})},setupChild:function(states,name,value){if(!value){return false}if(value.isState){set(value,"name",name)}else if(Ember.State.detect(value)){value=value.create({name:name})}if(value.isState){set(value,"parentState",this);get(this,"childStates").pushObject(value);states[name]=value;return value}},lookupEventTransition:function(name){var path,state=this;while(state&&!path){path=state.eventTransitions[name];state=state.get("parentState")}return path},isLeaf:Ember.computed(function(){return!get(this,"childStates").length}),hasContext:true,setup:Ember.K,enter:Ember.K,exit:Ember.K});Ember.State.reopenClass({transitionTo:function(target){var transitionFunction=function(stateManager,contextOrEvent){var contexts=[],Event=Ember.$&&Ember.$.Event;if(contextOrEvent&&Event&&contextOrEvent instanceof Event){if(contextOrEvent.hasOwnProperty("contexts")){contexts=contextOrEvent.contexts.slice()}}else{contexts=[].slice.call(arguments,1)}contexts.unshift(target);stateManager.transitionTo.apply(stateManager,contexts)};transitionFunction.transitionTarget=target;return transitionFunction}})})();(function(){var get=Ember.get,set=Ember.set,fmt=Ember.String.fmt;var arrayForEach=Ember.ArrayPolyfills.forEach;var Transition=function(raw){this.enterStates=raw.enterStates.slice();this.exitStates=raw.exitStates.slice();this.resolveState=raw.resolveState;this.finalState=raw.enterStates[raw.enterStates.length-1]||raw.resolveState};Transition.prototype={normalize:function(manager,contexts){this.matchContextsToStates(contexts);this.addInitialStates();this.removeUnchangedContexts(manager);return this},matchContextsToStates:function(contexts){var stateIdx=this.enterStates.length-1,matchedContexts=[],state,context;while(contexts.length>0){if(stateIdx>=0){state=this.enterStates[stateIdx--]}else{if(this.enterStates.length){state=get(this.enterStates[0],"parentState");if(!state){throw"Cannot match all contexts to states"}}else{state=this.resolveState}this.enterStates.unshift(state);this.exitStates.unshift(state)}if(get(state,"hasContext")){context=contexts.pop()}else{context=null}matchedContexts.unshift(context)}this.contexts=matchedContexts},addInitialStates:function(){var finalState=this.finalState,initialState;while(true){initialState=get(finalState,"initialState")||"start";finalState=get(finalState,"states."+initialState);if(!finalState){break}this.finalState=finalState;this.enterStates.push(finalState);this.contexts.push(undefined)}},removeUnchangedContexts:function(manager){while(this.enterStates.length>0){if(this.enterStates[0]!==this.exitStates[0]){break}if(this.enterStates.length===this.contexts.length){if(manager.getStateMeta(this.enterStates[0],"context")!==this.contexts[0]){break}this.contexts.shift()}this.resolveState=this.enterStates.shift();this.exitStates.shift()}}};var sendRecursively=function(event,currentState,isUnhandledPass){var log=this.enableLogging,eventName=isUnhandledPass?"unhandledEvent":event,action=currentState[eventName],contexts,sendRecursiveArguments,actionArguments;contexts=[].slice.call(arguments,3);if(typeof action==="function"){if(log){if(isUnhandledPass){Ember.Logger.log(fmt("STATEMANAGER: Unhandled event '%@' being sent to state %@.",[event,get(currentState,"path")]))}else{Ember.Logger.log(fmt("STATEMANAGER: Sending event '%@' to state %@.",[event,get(currentState,"path")]))}}actionArguments=contexts;if(isUnhandledPass){actionArguments.unshift(event)}actionArguments.unshift(this);return action.apply(currentState,actionArguments)}else{var parentState=get(currentState,"parentState");if(parentState){sendRecursiveArguments=contexts;sendRecursiveArguments.unshift(event,parentState,isUnhandledPass);return sendRecursively.apply(this,sendRecursiveArguments)}else if(!isUnhandledPass){return sendEvent.call(this,event,contexts,true)}}};var sendEvent=function(eventName,sendRecursiveArguments,isUnhandledPass){sendRecursiveArguments.unshift(eventName,get(this,"currentState"),isUnhandledPass);return sendRecursively.apply(this,sendRecursiveArguments)};Ember.StateManager=Ember.State.extend({init:function(){this._super();set(this,"stateMeta",Ember.Map.create());var initialState=get(this,"initialState");if(!initialState&&get(this,"states.start")){initialState="start"}if(initialState){this.transitionTo(initialState);Ember.assert('Failed to transition to initial state "'+initialState+'"',!!get(this,"currentState"))}},stateMetaFor:function(state){var meta=get(this,"stateMeta"),stateMeta=meta.get(state);if(!stateMeta){stateMeta={};meta.set(state,stateMeta)}return stateMeta},setStateMeta:function(state,key,value){return set(this.stateMetaFor(state),key,value)},getStateMeta:function(state,key){return get(this.stateMetaFor(state),key)},currentState:null,currentPath:Ember.computed.alias("currentState.path"),transitionEvent:"setup",errorOnUnhandledEvent:true,send:function(event){var contexts=[].slice.call(arguments,1);Ember.assert('Cannot send event "'+event+'" while currentState is '+get(this,"currentState"),get(this,"currentState"));return sendEvent.call(this,event,contexts,false)},unhandledEvent:function(manager,event){if(get(this,"errorOnUnhandledEvent")){throw new Ember.Error(this.toString()+" could not respond to event "+event+" in state "+get(this,"currentState.path")+".")}},getStateByPath:function(root,path){var parts=path.split("."),state=root;for(var i=0,len=parts.length;i<len;i++){state=get(get(state,"states"),parts[i]);if(!state){break}}return state},findStateByPath:function(state,path){var possible;while(!possible&&state){possible=this.getStateByPath(state,path);state=get(state,"parentState")}return possible},getStatesInPath:function(root,path){if(!path||path===""){return undefined}var parts=path.split("."),result=[],states,state;for(var i=0,len=parts.length;i<len;i++){states=get(root,"states");if(!states){return undefined}state=get(states,parts[i]);if(state){root=state;result.push(state)}else{return undefined}}return result},goToState:function(){return this.transitionTo.apply(this,arguments)},transitionTo:function(path,context){if(Ember.isEmpty(path)){return}var contexts=context?Array.prototype.slice.call(arguments,1):[],currentState=get(this,"currentState")||this;var hash=this.contextFreeTransition(currentState,path);var transition=new Transition(hash).normalize(this,contexts);this.enterState(transition);this.triggerSetupContext(transition)},contextFreeTransition:function(currentState,path){var cache=currentState.pathsCache[path];if(cache){return cache}var enterStates=this.getStatesInPath(currentState,path),exitStates=[],resolveState=currentState;while(resolveState&&!enterStates){exitStates.unshift(resolveState);resolveState=get(resolveState,"parentState");if(!resolveState){enterStates=this.getStatesInPath(this,path);if(!enterStates){Ember.assert('Could not find state for path: "'+path+'"');return}}enterStates=this.getStatesInPath(resolveState,path)}while(enterStates.length>0&&enterStates[0]===exitStates[0]){resolveState=enterStates.shift();exitStates.shift()}var transitions=currentState.pathsCache[path]={exitStates:exitStates,enterStates:enterStates,resolveState:resolveState};return transitions},triggerSetupContext:function(transitions){var contexts=transitions.contexts,offset=transitions.enterStates.length-contexts.length,enterStates=transitions.enterStates,transitionEvent=get(this,"transitionEvent");Ember.assert("More contexts provided than states",offset>=0);arrayForEach.call(enterStates,function(state,idx){state.trigger(transitionEvent,this,contexts[idx-offset])},this)},getState:function(name){var state=get(this,name),parentState=get(this,"parentState");
if(state){return state}else if(parentState){return parentState.getState(name)}},enterState:function(transition){var log=this.enableLogging;var exitStates=transition.exitStates.slice(0).reverse();arrayForEach.call(exitStates,function(state){state.trigger("exit",this)},this);arrayForEach.call(transition.enterStates,function(state){if(log){Ember.Logger.log("STATEMANAGER: Entering "+get(state,"path"))}state.trigger("enter",this)},this);set(this,"currentState",transition.finalState)}})})();(function(){})()})();(function(){})()})();
});
require.register("kelonye-ember/lib/handlebars.js", function(exports, require, module){
this.Handlebars={},function(e){e.VERSION="1.0.0-rc.3",e.COMPILER_REVISION=2,e.REVISION_CHANGES={1:"<= 1.0.rc.2",2:">= 1.0.0-rc.3"},e.helpers={},e.partials={},e.registerHelper=function(e,t,n){n&&(t.not=n),this.helpers[e]=t},e.registerPartial=function(e,t){this.partials[e]=t},e.registerHelper("helperMissing",function(e){if(arguments.length===2)return undefined;throw new Error("Could not find property '"+e+"'")});var t=Object.prototype.toString,n="[object Function]";e.registerHelper("blockHelperMissing",function(r,i){var s=i.inverse||function(){},o=i.fn,u="",a=t.call(r);return a===n&&(r=r.call(this)),r===!0?o(this):r===!1||r==null?s(this):a==="[object Array]"?r.length>0?e.helpers.each(r,i):s(this):o(r)}),e.K=function(){},e.createFrame=Object.create||function(t){e.K.prototype=t;var n=new e.K;return e.K.prototype=null,n},e.logger={DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,methodMap:{0:"debug",1:"info",2:"warn",3:"error"},log:function(t,n){if(e.logger.level<=t){var r=e.logger.methodMap[t];typeof console!="undefined"&&console[r]&&console[r].call(console,n)}}},e.log=function(t,n){e.logger.log(t,n)},e.registerHelper("each",function(t,n){var r=n.fn,i=n.inverse,s=0,o="",u;n.data&&(u=e.createFrame(n.data));if(t&&typeof t=="object")if(t instanceof Array)for(var a=t.length;s<a;s++)u&&(u.index=s),o+=r(t[s],{data:u});else for(var f in t)t.hasOwnProperty(f)&&(u&&(u.key=f),o+=r(t[f],{data:u}),s++);return s===0&&(o=i(this)),o}),e.registerHelper("if",function(r,i){var s=t.call(r);return s===n&&(r=r.call(this)),!r||e.Utils.isEmpty(r)?i.inverse(this):i.fn(this)}),e.registerHelper("unless",function(t,n){var r=n.fn,i=n.inverse;return n.fn=i,n.inverse=r,e.helpers["if"].call(this,t,n)}),e.registerHelper("with",function(e,t){return t.fn(e)}),e.registerHelper("log",function(t,n){var r=n.data&&n.data.level!=null?parseInt(n.data.level,10):1;e.log(r,t)})}(this.Handlebars);var handlebars=function(){function n(){this.yy={}}var e={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,simpleInverse:6,statements:7,statement:8,openInverse:9,closeBlock:10,openBlock:11,mustache:12,partial:13,CONTENT:14,COMMENT:15,OPEN_BLOCK:16,inMustache:17,CLOSE:18,OPEN_INVERSE:19,OPEN_ENDBLOCK:20,path:21,OPEN:22,OPEN_UNESCAPED:23,OPEN_PARTIAL:24,partialName:25,params:26,hash:27,DATA:28,param:29,STRING:30,INTEGER:31,BOOLEAN:32,hashSegments:33,hashSegment:34,ID:35,EQUALS:36,PARTIAL_NAME:37,pathSegments:38,SEP:39,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"OPEN_PARTIAL",28:"DATA",30:"STRING",31:"INTEGER",32:"BOOLEAN",35:"ID",36:"EQUALS",37:"PARTIAL_NAME",39:"SEP"},productions_:[0,[3,2],[4,2],[4,3],[4,2],[4,1],[4,1],[4,0],[7,1],[7,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[6,2],[17,3],[17,2],[17,2],[17,1],[17,1],[26,2],[26,1],[29,1],[29,1],[29,1],[29,1],[29,1],[27,1],[33,2],[33,1],[34,3],[34,3],[34,3],[34,3],[34,3],[25,1],[21,1],[38,3],[38,1]],performAction:function(t,n,r,i,s,o,u){var a=o.length-1;switch(s){case 1:return o[a-1];case 2:this.$=new i.ProgramNode([],o[a]);break;case 3:this.$=new i.ProgramNode(o[a-2],o[a]);break;case 4:this.$=new i.ProgramNode(o[a-1],[]);break;case 5:this.$=new i.ProgramNode(o[a]);break;case 6:this.$=new i.ProgramNode([],[]);break;case 7:this.$=new i.ProgramNode([]);break;case 8:this.$=[o[a]];break;case 9:o[a-1].push(o[a]),this.$=o[a-1];break;case 10:this.$=new i.BlockNode(o[a-2],o[a-1].inverse,o[a-1],o[a]);break;case 11:this.$=new i.BlockNode(o[a-2],o[a-1],o[a-1].inverse,o[a]);break;case 12:this.$=o[a];break;case 13:this.$=o[a];break;case 14:this.$=new i.ContentNode(o[a]);break;case 15:this.$=new i.CommentNode(o[a]);break;case 16:this.$=new i.MustacheNode(o[a-1][0],o[a-1][1]);break;case 17:this.$=new i.MustacheNode(o[a-1][0],o[a-1][1]);break;case 18:this.$=o[a-1];break;case 19:this.$=new i.MustacheNode(o[a-1][0],o[a-1][1]);break;case 20:this.$=new i.MustacheNode(o[a-1][0],o[a-1][1],!0);break;case 21:this.$=new i.PartialNode(o[a-1]);break;case 22:this.$=new i.PartialNode(o[a-2],o[a-1]);break;case 23:break;case 24:this.$=[[o[a-2]].concat(o[a-1]),o[a]];break;case 25:this.$=[[o[a-1]].concat(o[a]),null];break;case 26:this.$=[[o[a-1]],o[a]];break;case 27:this.$=[[o[a]],null];break;case 28:this.$=[[new i.DataNode(o[a])],null];break;case 29:o[a-1].push(o[a]),this.$=o[a-1];break;case 30:this.$=[o[a]];break;case 31:this.$=o[a];break;case 32:this.$=new i.StringNode(o[a]);break;case 33:this.$=new i.IntegerNode(o[a]);break;case 34:this.$=new i.BooleanNode(o[a]);break;case 35:this.$=new i.DataNode(o[a]);break;case 36:this.$=new i.HashNode(o[a]);break;case 37:o[a-1].push(o[a]),this.$=o[a-1];break;case 38:this.$=[o[a]];break;case 39:this.$=[o[a-2],o[a]];break;case 40:this.$=[o[a-2],new i.StringNode(o[a])];break;case 41:this.$=[o[a-2],new i.IntegerNode(o[a])];break;case 42:this.$=[o[a-2],new i.BooleanNode(o[a])];break;case 43:this.$=[o[a-2],new i.DataNode(o[a])];break;case 44:this.$=new i.PartialNameNode(o[a]);break;case 45:this.$=new i.IdNode(o[a]);break;case 46:o[a-2].push(o[a]),this.$=o[a-2];break;case 47:this.$=[o[a]]}},table:[{3:1,4:2,5:[2,7],6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],22:[1,14],23:[1,15],24:[1,16]},{1:[3]},{5:[1,17]},{5:[2,6],7:18,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,6],22:[1,14],23:[1,15],24:[1,16]},{5:[2,5],6:20,8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,5],22:[1,14],23:[1,15],24:[1,16]},{17:23,18:[1,22],21:24,28:[1,25],35:[1,27],38:26},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{4:28,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{4:29,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15]},{17:30,21:24,28:[1,25],35:[1,27],38:26},{17:31,21:24,28:[1,25],35:[1,27],38:26},{17:32,21:24,28:[1,25],35:[1,27],38:26},{25:33,37:[1,34]},{1:[2,1]},{5:[2,2],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,2],22:[1,14],23:[1,15],24:[1,16]},{17:23,21:24,28:[1,25],35:[1,27],38:26},{5:[2,4],7:35,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,4],22:[1,14],23:[1,15],24:[1,16]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,23],14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],24:[2,23]},{18:[1,36]},{18:[2,27],21:41,26:37,27:38,28:[1,45],29:39,30:[1,42],31:[1,43],32:[1,44],33:40,34:46,35:[1,47],38:26},{18:[2,28]},{18:[2,45],28:[2,45],30:[2,45],31:[2,45],32:[2,45],35:[2,45],39:[1,48]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],39:[2,47]},{10:49,20:[1,50]},{10:51,20:[1,50]},{18:[1,52]},{18:[1,53]},{18:[1,54]},{18:[1,55],21:56,35:[1,27],38:26},{18:[2,44],35:[2,44]},{5:[2,3],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,3],22:[1,14],23:[1,15],24:[1,16]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17]},{18:[2,25],21:41,27:57,28:[1,45],29:58,30:[1,42],31:[1,43],32:[1,44],33:40,34:46,35:[1,47],38:26},{18:[2,26]},{18:[2,30],28:[2,30],30:[2,30],31:[2,30],32:[2,30],35:[2,30]},{18:[2,36],34:59,35:[1,60]},{18:[2,31],28:[2,31],30:[2,31],31:[2,31],32:[2,31],35:[2,31]},{18:[2,32],28:[2,32],30:[2,32],31:[2,32],32:[2,32],35:[2,32]},{18:[2,33],28:[2,33],30:[2,33],31:[2,33],32:[2,33],35:[2,33]},{18:[2,34],28:[2,34],30:[2,34],31:[2,34],32:[2,34],35:[2,34]},{18:[2,35],28:[2,35],30:[2,35],31:[2,35],32:[2,35],35:[2,35]},{18:[2,38],35:[2,38]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],36:[1,61],39:[2,47]},{35:[1,62]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{21:63,35:[1,27],38:26},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],24:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],24:[2,21]},{18:[1,64]},{18:[2,24]},{18:[2,29],28:[2,29],30:[2,29],31:[2,29],32:[2,29],35:[2,29]},{18:[2,37],35:[2,37]},{36:[1,61]},{21:65,28:[1,69],30:[1,66],31:[1,67],32:[1,68],35:[1,27],38:26},{18:[2,46],28:[2,46],30:[2,46],31:[2,46],32:[2,46],35:[2,46],39:[2,46]},{18:[1,70]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],24:[2,22]},{18:[2,39],35:[2,39]},{18:[2,40],35:[2,40]},{18:[2,41],35:[2,41]},{18:[2,42],35:[2,42]},{18:[2,43],35:[2,43]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18]}],defaultActions:{17:[2,1],25:[2,28],38:[2,26],57:[2,24]},parseError:function(t,n){throw new Error(t)},parse:function(t){function v(e){r.length=r.length-2*e,i.length=i.length-e,s.length=s.length-e}function m(){var e;return e=n.lexer.lex()||1,typeof e!="number"&&(e=n.symbols_[e]||e),e}var n=this,r=[0],i=[null],s=[],o=this.table,u="",a=0,f=0,l=0,c=2,h=1;this.lexer.setInput(t),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,typeof this.lexer.yylloc=="undefined"&&(this.lexer.yylloc={});var p=this.lexer.yylloc;s.push(p);var d=this.lexer.options&&this.lexer.options.ranges;typeof this.yy.parseError=="function"&&(this.parseError=this.yy.parseError);var g,y,b,w,E,S,x={},T,N,C,k;for(;;){b=r[r.length-1];if(this.defaultActions[b])w=this.defaultActions[b];else{if(g===null||typeof g=="undefined")g=m();w=o[b]&&o[b][g]}if(typeof w=="undefined"||!w.length||!w[0]){var L="";if(!l){k=[];for(T in o[b])this.terminals_[T]&&T>2&&k.push("'"+this.terminals_[T]+"'");this.lexer.showPosition?L="Parse error on line "+(a+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+k.join(", ")+", got '"+(this.terminals_[g]||g)+"'":L="Parse error on line "+(a+1)+": Unexpected "+(g==1?"end of input":"'"+(this.terminals_[g]||g)+"'"),this.parseError(L,{text:this.lexer.match,token:this.terminals_[g]||g,line:this.lexer.yylineno,loc:p,expected:k})}}if(w[0]instanceof Array&&w.length>1)throw new Error("Parse Error: multiple actions possible at state: "+b+", token: "+g);switch(w[0]){case 1:r.push(g),i.push(this.lexer.yytext),s.push(this.lexer.yylloc),r.push(w[1]),g=null,y?(g=y,y=null):(f=this.lexer.yyleng,u=this.lexer.yytext,a=this.lexer.yylineno,p=this.lexer.yylloc,l>0&&l--);break;case 2:N=this.productions_[w[1]][1],x.$=i[i.length-N],x._$={first_line:s[s.length-(N||1)].first_line,last_line:s[s.length-1].last_line,first_column:s[s.length-(N||1)].first_column,last_column:s[s.length-1].last_column},d&&(x._$.range=[s[s.length-(N||1)].range[0],s[s.length-1].range[1]]),S=this.performAction.call(x,u,f,a,this.yy,w[1],i,s);if(typeof S!="undefined")return S;N&&(r=r.slice(0,-1*N*2),i=i.slice(0,-1*N),s=s.slice(0,-1*N)),r.push(this.productions_[w[1]][0]),i.push(x.$),s.push(x._$),C=o[r[r.length-2]][r[r.length-1]],r.push(C);break;case 3:return!0}}return!0}},t=function(){var e={EOF:1,parseError:function(t,n){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,n)},setInput:function(e){return this._input=e,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var e=this._input[0];this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e;var t=e.match(/(?:\r\n?|\n).*/g);return t?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},unput:function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t-1),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this},more:function(){return this._more=!0,this},less:function(e){this.unput(this.match.slice(e))},pastInput:function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?"...":"")+e.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var e=this.pastInput(),t=new Array(e.length+1).join("-");return e+this.upcomingInput()+"\n"+t+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r,i,s;this._more||(this.yytext="",this.match="");var o=this._currentRules();for(var u=0;u<o.length;u++){n=this._input.match(this.rules[o[u]]);if(n&&(!t||n[0].length>t[0].length)){t=n,r=u;if(!this.options.flex)break}}if(t){s=t[0].match(/(?:\r\n?|\n).*/g),s&&(this.yylineno+=s.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:s?s[s.length-1].length-s[s.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+t[0].length},this.yytext+=t[0],this.match+=t[0],this.matches=t,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(t[0].length),this.matched+=t[0],e=this.performAction.call(this,this.yy,this,o[r],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1);if(e)return e;return}return this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return typeof t!="undefined"?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(t){this.begin(t)}};return e.options={},e.performAction=function(t,n,r,i){var s=i;switch(r){case 0:n.yytext.slice(-1)!=="\\"&&this.begin("mu"),n.yytext.slice(-1)==="\\"&&(n.yytext=n.yytext.substr(0,n.yyleng-1),this.begin("emu"));if(n.yytext)return 14;break;case 1:return 14;case 2:return n.yytext.slice(-1)!=="\\"&&this.popState(),n.yytext.slice(-1)==="\\"&&(n.yytext=n.yytext.substr(0,n.yyleng-1)),14;case 3:return n.yytext=n.yytext.substr(0,n.yyleng-4),this.popState(),15;case 4:return this.begin("par"),24;case 5:return 16;case 6:return 20;case 7:return 19;case 8:return 19;case 9:return 23;case 10:return 23;case 11:this.popState(),this.begin("com");break;case 12:return n.yytext=n.yytext.substr(3,n.yyleng-5),this.popState(),15;case 13:return 22;case 14:return 36;case 15:return 35;case 16:return 35;case 17:return 39;case 18:break;case 19:return this.popState(),18;case 20:return this.popState(),18;case 21:return n.yytext=n.yytext.substr(1,n.yyleng-2).replace(/\\"/g,'"'),30;case 22:return n.yytext=n.yytext.substr(1,n.yyleng-2).replace(/\\'/g,"'"),30;case 23:return n.yytext=n.yytext.substr(1),28;case 24:return 32;case 25:return 32;case 26:return 31;case 27:return 35;case 28:return n.yytext=n.yytext.substr(1,n.yyleng-2),35;case 29:return"INVALID";case 30:break;case 31:return this.popState(),37;case 32:return 5}},e.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\{\{>)/,/^(?:\{\{#)/,/^(?:\{\{\/)/,/^(?:\{\{\^)/,/^(?:\{\{\s*else\b)/,/^(?:\{\{\{)/,/^(?:\{\{&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{)/,/^(?:=)/,/^(?:\.(?=[} ]))/,/^(?:\.\.)/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}\}\})/,/^(?:\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@[a-zA-Z]+)/,/^(?:true(?=[}\s]))/,/^(?:false(?=[}\s]))/,/^(?:[0-9]+(?=[}\s]))/,/^(?:[a-zA-Z0-9_$-]+(?=[=}\s\/.]))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:\s+)/,/^(?:[a-zA-Z0-9_$-/]+)/,/^(?:$)/],e.conditions={mu:{rules:[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,32],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[3],inclusive:!1},par:{rules:[30,31],inclusive:!1},INITIAL:{rules:[0,1,32],inclusive:!0}},e}();return e.lexer=t,n.prototype=e,e.Parser=n,new n}();Handlebars.Parser=handlebars,Handlebars.parse=function(e){return e.constructor===Handlebars.AST.ProgramNode?e:(Handlebars.Parser.yy=Handlebars.AST,Handlebars.Parser.parse(e))},Handlebars.print=function(e){return(new Handlebars.PrintVisitor).accept(e)},function(){Handlebars.AST={},Handlebars.AST.ProgramNode=function(e,t){this.type="program",this.statements=e,t&&(this.inverse=new Handlebars.AST.ProgramNode(t))},Handlebars.AST.MustacheNode=function(e,t,n){this.type="mustache",this.escaped=!n,this.hash=t;var r=this.id=e[0],i=this.params=e.slice(1),s=this.eligibleHelper=r.isSimple;this.isHelper=s&&(i.length||t)},Handlebars.AST.PartialNode=function(e,t){this.type="partial",this.partialName=e,this.context=t};var e=function(e,t){if(e.original!==t.original)throw new Handlebars.Exception(e.original+" doesn't match "+t.original)};Handlebars.AST.BlockNode=function(t,n,r,i){e(t.id,i),this.type="block",this.mustache=t,this.program=n,this.inverse=r,this.inverse&&!this.program&&(this.isInverse=!0)},Handlebars.AST.ContentNode=function(e){this.type="content",this.string=e},Handlebars.AST.HashNode=function(e){this.type="hash",this.pairs=e},Handlebars.AST.IdNode=function(e){this.type="ID",this.original=e.join(".");var t=[],n=0;for(var r=0,i=e.length;r<i;r++){var s=e[r];if(s===".."||s==="."||s==="this"){if(t.length>0)throw new Handlebars.Exception("Invalid path: "+this.original);s===".."?n++:this.isScoped=!0}else t.push(s)}this.parts=t,this.string=t.join("."),this.depth=n,this.isSimple=e.length===1&&!this.isScoped&&n===0,this.stringModeValue=this.string},Handlebars.AST.PartialNameNode=function(e){this.type="PARTIAL_NAME",this.name=e},Handlebars.AST.DataNode=function(e){this.type="DATA",this.id=e},Handlebars.AST.StringNode=function(e){this.type="STRING",this.string=e,this.stringModeValue=e},Handlebars.AST.IntegerNode=function(e){this.type="INTEGER",this.integer=e,this.stringModeValue=Number(e)},Handlebars.AST.BooleanNode=function(e){this.type="BOOLEAN",this.bool=e,this.stringModeValue=e==="true"},Handlebars.AST.CommentNode=function(e){this.type="comment",this.comment=e}}();var errorProps=["description","fileName","lineNumber","message","name","number","stack"];Handlebars.Exception=function(e){var t=Error.prototype.constructor.apply(this,arguments);for(var n=0;n<errorProps.length;n++)this[errorProps[n]]=t[errorProps[n]]},Handlebars.Exception.prototype=new Error,Handlebars.SafeString=function(e){this.string=e},Handlebars.SafeString.prototype.toString=function(){return this.string.toString()},function(){var e={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},t=/[&<>"'`]/g,n=/[&<>"'`]/,r=function(t){return e[t]||"&amp;"};Handlebars.Utils={escapeExpression:function(e){return e instanceof Handlebars.SafeString?e.toString():e==null||e===!1?"":n.test(e)?e.replace(t,r):e},isEmpty:function(e){return!e&&e!==0?!0:Object.prototype.toString.call(e)==="[object Array]"&&e.length===0?!0:!1}}}(),Handlebars.Compiler=function(){},Handlebars.JavaScriptCompiler=function(){},function(e,t){e.prototype={compiler:e,disassemble:function(){var e=this.opcodes,t,n=[],r,i;for(var s=0,o=e.length;s<o;s++){t=e[s];if(t.opcode==="DECLARE")n.push("DECLARE "+t.name+"="+t.value);else{r=[];for(var u=0;u<t.args.length;u++)i=t.args[u],typeof i=="string"&&(i='"'+i.replace("\n","\\n")+'"'),r.push(i);n.push(t.opcode+" "+r.join(" "))}}return n.join("\n")},equals:function(e){var t=this.opcodes.length;if(e.opcodes.length!==t)return!1;for(var n=0;n<t;n++){var r=this.opcodes[n],i=e.opcodes[n];if(r.opcode!==i.opcode||r.args.length!==i.args.length)return!1;for(var s=0;s<r.args.length;s++)if(r.args[s]!==i.args[s])return!1}return!0},guid:0,compile:function(e,t){this.children=[],this.depths={list:[]},this.options=t;var n=this.options.knownHelpers;this.options.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,"if":!0,unless:!0,"with":!0,log:!0};if(n)for(var r in n)this.options.knownHelpers[r]=n[r];return this.program(e)},accept:function(e){return this[e.type](e)},program:function(e){var t=e.statements,n;this.opcodes=[];for(var r=0,i=t.length;r<i;r++)n=t[r],this[n.type](n);return this.isSimple=i===1,this.depths.list=this.depths.list.sort(function(e,t){return e-t}),this},compileProgram:function(e){var t=(new this.compiler).compile(e,this.options),n=this.guid++,r;this.usePartial=this.usePartial||t.usePartial,this.children[n]=t;for(var i=0,s=t.depths.list.length;i<s;i++){r=t.depths.list[i];if(r<2)continue;this.addDepth(r-1)}return n},block:function(e){var t=e.mustache,n=e.program,r=e.inverse;n&&(n=this.compileProgram(n)),r&&(r=this.compileProgram(r));var i=this.classifyMustache(t);i==="helper"?this.helperMustache(t,n,r):i==="simple"?(this.simpleMustache(t),this.opcode("pushProgram",n),this.opcode("pushProgram",r),this.opcode("emptyHash"),this.opcode("blockValue")):(this.ambiguousMustache(t,n,r),this.opcode("pushProgram",n),this.opcode("pushProgram",r),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},hash:function(e){var t=e.pairs,n,r;this.opcode("pushHash");for(var i=0,s=t.length;i<s;i++)n=t[i],r=n[1],this.options.stringParams?this.opcode("pushStringParam",r.stringModeValue,r.type):this.accept(r),this.opcode("assignToHash",n[0]);this.opcode("popHash")},partial:function(e){var t=e.partialName;this.usePartial=!0,e.context?this.ID(e.context):this.opcode("push","depth0"),this.opcode("invokePartial",t.name),this.opcode("append")},content:function(e){this.opcode("appendContent",e.string)},mustache:function(e){var t=this.options,n=this.classifyMustache(e);n==="simple"?this.simpleMustache(e):n==="helper"?this.helperMustache(e):this.ambiguousMustache(e),e.escaped&&!t.noEscape?this.opcode("appendEscaped"):this.opcode("append")},ambiguousMustache:function(e,t,n){var r=e.id,i=r.parts[0],s=t!=null||n!=null;this.opcode("getContext",r.depth),this.opcode("pushProgram",t),this.opcode("pushProgram",n),this.opcode("invokeAmbiguous",i,s)},simpleMustache:function(e){var t=e.id;t.type==="DATA"?this.DATA(t):t.parts.length?this.ID(t):(this.addDepth(t.depth),this.opcode("getContext",t.depth),this.opcode("pushContext")),this.opcode("resolvePossibleLambda")},helperMustache:function(e,t,n){var r=this.setupFullMustacheParams(e,t,n),i=e.id.parts[0];if(this.options.knownHelpers[i])this.opcode("invokeKnownHelper",r.length,i);else{if(this.knownHelpersOnly)throw new Error("You specified knownHelpersOnly, but used the unknown helper "+i);this.opcode("invokeHelper",r.length,i)}},ID:function(e){this.addDepth(e.depth),this.opcode("getContext",e.depth);var t=e.parts[0];t?this.opcode("lookupOnContext",e.parts[0]):this.opcode("pushContext");for(var n=1,r=e.parts.length;n<r;n++)this.opcode("lookup",e.parts[n])},DATA:function(e){this.options.data=!0,this.opcode("lookupData",e.id)},STRING:function(e){this.opcode("pushString",e.string)},INTEGER:function(e){this.opcode("pushLiteral",e.integer)},BOOLEAN:function(e){this.opcode("pushLiteral",e.bool)},comment:function(){},opcode:function(e){this.opcodes.push({opcode:e,args:[].slice.call(arguments,1)})},declare:function(e,t){this.opcodes.push({opcode:"DECLARE",name:e,value:t})},addDepth:function(e){if(isNaN(e))throw new Error("EWOT");if(e===0)return;this.depths[e]||(this.depths[e]=!0,this.depths.list.push(e))},classifyMustache:function(e){var t=e.isHelper,n=e.eligibleHelper,r=this.options;if(n&&!t){var i=e.id.parts[0];r.knownHelpers[i]?t=!0:r.knownHelpersOnly&&(n=!1)}return t?"helper":n?"ambiguous":"simple"},pushParams:function(e){var t=e.length,n;while(t--)n=e[t],this.options.stringParams?(n.depth&&this.addDepth(n.depth),this.opcode("getContext",n.depth||0),this.opcode("pushStringParam",n.stringModeValue,n.type)):this[n.type](n)},setupMustacheParams:function(e){var t=e.params;return this.pushParams(t),e.hash?this.hash(e.hash):this.opcode("emptyHash"),t},setupFullMustacheParams:function(e,t,n){var r=e.params;return this.pushParams(r),this.opcode("pushProgram",t),this.opcode("pushProgram",n),e.hash?this.hash(e.hash):this.opcode("emptyHash"),r}};var n=function(e){this.value=e};t.prototype={nameLookup:function(e,n){return/^[0-9]+$/.test(n)?e+"["+n+"]":t.isValidJavaScriptVariableName(n)?e+"."+n:e+"['"+n+"']"},appendToBuffer:function(e){return this.environment.isSimple?"return "+e+";":{appendToBuffer:!0,content:e,toString:function(){return"buffer += "+e+";"}}},initializeBuffer:function(){return this.quotedString("")},namespace:"Handlebars",compile:function(e,t,n,r){this.environment=e,this.options=t||{},Handlebars.log(Handlebars.logger.DEBUG,this.environment.disassemble()+"\n\n"),this.name=this.environment.name,this.isChild=!!n,this.context=n||{programs:[],environments:[],aliases:{}},this.preamble(),this.stackSlot=0,this.stackVars=[],this.registers={list:[]},this.compileStack=[],this.inlineStack=[],this.compileChildren(e,t);var i=e.opcodes,s;this.i=0;for(o=i.length;this.i<o;this.i++)s=i[this.i],s.opcode==="DECLARE"?this[s.name]=s.value:this[s.opcode].apply(this,s.args);return this.createFunctionContext(r)},nextOpcode:function(){var e=this.environment.opcodes;return e[this.i+1]},eat:function(){this.i=this.i+1},preamble:function(){var e=[];if(!this.isChild){var t=this.namespace,n="helpers = helpers || "+t+".helpers;";this.environment.usePartial&&(n=n+" partials = partials || "+t+".partials;"),this.options.data&&(n+=" data = data || {};"),e.push(n)}else e.push("");this.environment.isSimple?e.push(""):e.push(", buffer = "+this.initializeBuffer()),this.lastContext=0,this.source=e},createFunctionContext:function(e){var t=this.stackVars.concat(this.registers.list);t.length>0&&(this.source[1]=this.source[1]+", "+t.join(", "));if(!this.isChild)for(var n in this.context.aliases)this.source[1]=this.source[1]+", "+n+"="+this.context.aliases[n];this.source[1]&&(this.source[1]="var "+this.source[1].substring(2)+";"),this.isChild||(this.source[1]+="\n"+this.context.programs.join("\n")+"\n"),this.environment.isSimple||this.source.push("return buffer;");var r=this.isChild?["depth0","data"]:["Handlebars","depth0","helpers","partials","data"];for(var i=0,s=this.environment.depths.list.length;i<s;i++)r.push("depth"+this.environment.depths.list[i]);var o=this.mergeSource();if(!this.isChild){var u=Handlebars.COMPILER_REVISION,a=Handlebars.REVISION_CHANGES[u];o="this.compilerInfo = ["+u+",'"+a+"'];\n"+o}if(e)return r.push(o),Function.apply(this,r);var f="function "+(this.name||"")+"("+r.join(",")+") {\n  "+o+"}";return Handlebars.log(Handlebars.logger.DEBUG,f+"\n\n"),f},mergeSource:function(){var e="",t;for(var n=0,r=this.source.length;n<r;n++){var i=this.source[n];i.appendToBuffer?t?t=t+"\n    + "+i.content:t=i.content:(t&&(e+="buffer += "+t+";\n  ",t=undefined),e+=i+"\n  ")}return e},blockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var e=["depth0"];this.setupParams(0,e),this.replaceStack(function(t){return e.splice(1,0,t),"blockHelperMissing.call("+e.join(", ")+")"})},ambiguousBlockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var e=["depth0"];this.setupParams(0,e);var t=this.topStack();e.splice(1,0,t),e[e.length-1]="options",this.source.push("if (!"+this.lastHelper+") { "+t+" = blockHelperMissing.call("+e.join(", ")+"); }")},appendContent:function(e){this.source.push(this.appendToBuffer(this.quotedString(e)))},append:function(){this.flushInline();var e=this.popStack();this.source.push("if("+e+" || "+e+" === 0) { "+this.appendToBuffer(e)+" }"),this.environment.isSimple&&this.source.push("else { "+this.appendToBuffer("''")+" }")},appendEscaped:function(){this.context.aliases.escapeExpression="this.escapeExpression",this.source.push(this.appendToBuffer("escapeExpression("+this.popStack()+")"))},getContext:function(e){this.lastContext!==e&&(this.lastContext=e)},lookupOnContext:function(e){this.push(this.nameLookup("depth"+this.lastContext,e,"context"))},pushContext:function(){this.pushStackLiteral("depth"+this.lastContext)},resolvePossibleLambda:function(){this.context.aliases.functionType='"function"',this.replaceStack(function(e){return"typeof "+e+" === functionType ? "+e+".apply(depth0) : "+e})},lookup:function(e){this.replaceStack(function(t){return t+" == null || "+t+" === false ? "+t+" : "+this.nameLookup(t,e,"context")})},lookupData:function(e){this.push(this.nameLookup("data",e,"data"))},pushStringParam:function(e,t){this.pushStackLiteral("depth"+this.lastContext),this.pushString(t),typeof e=="string"?this.pushString(e):this.pushStackLiteral(e)},emptyHash:function(){this.pushStackLiteral("{}"),this.options.stringParams&&this.register("hashTypes","{}")},pushHash:function(){this.hash={values:[],types:[]}},popHash:function(){var e=this.hash;this.hash=undefined,this.options.stringParams&&this.register("hashTypes","{"+e.types.join(",")+"}"),this.push("{\n    "+e.values.join(",\n    ")+"\n  }")},pushString:function(e){this.pushStackLiteral(this.quotedString(e))},push:function(e){return this.inlineStack.push(e),e},pushLiteral:function(e){this.pushStackLiteral(e)},pushProgram:function(e){e!=null?this.pushStackLiteral(this.programExpression(e)):this.pushStackLiteral(null)},invokeHelper:function(e,t){this.context.aliases.helperMissing="helpers.helperMissing";var n=this.lastHelper=this.setupHelper(e,t,!0);this.push(n.name),this.replaceStack(function(e){return e+" ? "+e+".call("+n.callParams+") "+": helperMissing.call("+n.helperMissingParams+")"})},invokeKnownHelper:function(e,t){var n=this.setupHelper(e,t);this.push(n.name+".call("+n.callParams+")")},invokeAmbiguous:function(e,t){this.context.aliases.functionType='"function"',this.pushStackLiteral("{}");var n=this.setupHelper(0,e,t),r=this.lastHelper=this.nameLookup("helpers",e,"helper"),i=this.nameLookup("depth"+this.lastContext,e,"context"),s=this.nextStack();this.source.push("if ("+s+" = "+r+") { "+s+" = "+s+".call("+n.callParams+"); }"),this.source.push("else { "+s+" = "+i+"; "+s+" = typeof "+s+" === functionType ? "+s+".apply(depth0) : "+s+"; }")},invokePartial:function(e){var t=[this.nameLookup("partials",e,"partial"),"'"+e+"'",this.popStack(),"helpers","partials"];this.options.data&&t.push("data"),this.context.aliases.self="this",this.push("self.invokePartial("+t.join(", ")+")")},assignToHash:function(e){var t=this.popStack(),n;this.options.stringParams&&(n=this.popStack(),this.popStack());var r=this.hash;n&&r.types.push("'"+e+"': "+n),r.values.push("'"+e+"': ("+t+")")},compiler:t,compileChildren:function(e,t){var n=e.children,r,i;for(var s=0,o=n.length;s<o;s++){r=n[s],i=new this.compiler;var u=this.matchExistingProgram(r);u==null?(this.context.programs.push(""),u=this.context.programs.length,r.index=u,r.name="program"+u,this.context.programs[u]=i.compile(r,t,this.context),this.context.environments[u]=r):(r.index=u,r.name="program"+u)}},matchExistingProgram:function(e){for(var t=0,n=this.context.environments.length;t<n;t++){var r=this.context.environments[t];if(r&&r.equals(e))return t
}},programExpression:function(e){this.context.aliases.self="this";if(e==null)return"self.noop";var t=this.environment.children[e],n=t.depths.list,r,i=[t.index,t.name,"data"];for(var s=0,o=n.length;s<o;s++)r=n[s],r===1?i.push("depth0"):i.push("depth"+(r-1));return n.length===0?"self.program("+i.join(", ")+")":(i.shift(),"self.programWithDepth("+i.join(", ")+")")},register:function(e,t){this.useRegister(e),this.source.push(e+" = "+t+";")},useRegister:function(e){this.registers[e]||(this.registers[e]=!0,this.registers.list.push(e))},pushStackLiteral:function(e){return this.push(new n(e))},pushStack:function(e){this.flushInline();var t=this.incrStack();return e&&this.source.push(t+" = "+e+";"),this.compileStack.push(t),t},replaceStack:function(e){var t="",r=this.isInline(),i;if(r){var s=this.popStack(!0);if(s instanceof n)i=s.value;else{var o=this.stackSlot?this.topStackName():this.incrStack();t="("+this.push(o)+" = "+s+"),",i=this.topStack()}}else i=this.topStack();var u=e.call(this,i);return r?((this.inlineStack.length||this.compileStack.length)&&this.popStack(),this.push("("+t+u+")")):(/^stack/.test(i)||(i=this.nextStack()),this.source.push(i+" = ("+t+u+");")),i},nextStack:function(){return this.pushStack()},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var e=this.inlineStack;if(e.length){this.inlineStack=[];for(var t=0,r=e.length;t<r;t++){var i=e[t];i instanceof n?this.compileStack.push(i):this.pushStack(i)}}},isInline:function(){return this.inlineStack.length},popStack:function(e){var t=this.isInline(),r=(t?this.inlineStack:this.compileStack).pop();return!e&&r instanceof n?r.value:(t||this.stackSlot--,r)},topStack:function(e){var t=this.isInline()?this.inlineStack:this.compileStack,r=t[t.length-1];return!e&&r instanceof n?r.value:r},quotedString:function(e){return'"'+e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r")+'"'},setupHelper:function(e,t,n){var r=[];this.setupParams(e,r,n);var i=this.nameLookup("helpers",t,"helper");return{params:r,name:i,callParams:["depth0"].concat(r).join(", "),helperMissingParams:n&&["depth0",this.quotedString(t)].concat(r).join(", ")}},setupParams:function(e,t,n){var r=[],i=[],s=[],o,u,a;r.push("hash:"+this.popStack()),u=this.popStack(),a=this.popStack();if(a||u)a||(this.context.aliases.self="this",a="self.noop"),u||(this.context.aliases.self="this",u="self.noop"),r.push("inverse:"+u),r.push("fn:"+a);for(var f=0;f<e;f++)o=this.popStack(),t.push(o),this.options.stringParams&&(s.push(this.popStack()),i.push(this.popStack()));return this.options.stringParams&&(r.push("contexts:["+i.join(",")+"]"),r.push("types:["+s.join(",")+"]"),r.push("hashTypes:hashTypes")),this.options.data&&r.push("data:data"),r="{"+r.join(",")+"}",n?(this.register("options",r),t.push("options")):t.push(r),t.join(", ")}};var r="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),i=t.RESERVED_WORDS={};for(var s=0,o=r.length;s<o;s++)i[r[s]]=!0;t.isValidJavaScriptVariableName=function(e){return!t.RESERVED_WORDS[e]&&/^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(e)?!0:!1}}(Handlebars.Compiler,Handlebars.JavaScriptCompiler),Handlebars.precompile=function(e,t){if(!e||typeof e!="string"&&e.constructor!==Handlebars.AST.ProgramNode)throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+e);t=t||{},"data"in t||(t.data=!0);var n=Handlebars.parse(e),r=(new Handlebars.Compiler).compile(n,t);return(new Handlebars.JavaScriptCompiler).compile(r,t)},Handlebars.compile=function(e,t){function r(){var n=Handlebars.parse(e),r=(new Handlebars.Compiler).compile(n,t),i=(new Handlebars.JavaScriptCompiler).compile(r,t,undefined,!0);return Handlebars.template(i)}if(!e||typeof e!="string"&&e.constructor!==Handlebars.AST.ProgramNode)throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+e);t=t||{},"data"in t||(t.data=!0);var n;return function(e,t){return n||(n=r()),n.call(this,e,t)}},Handlebars.VM={template:function(e){var t={escapeExpression:Handlebars.Utils.escapeExpression,invokePartial:Handlebars.VM.invokePartial,programs:[],program:function(e,t,n){var r=this.programs[e];return n?Handlebars.VM.program(t,n):r?r:(r=this.programs[e]=Handlebars.VM.program(t),r)},programWithDepth:Handlebars.VM.programWithDepth,noop:Handlebars.VM.noop,compilerInfo:null};return function(n,r){r=r||{};var i=e.call(t,Handlebars,n,r.helpers,r.partials,r.data),s=t.compilerInfo||[],o=s[0]||1,u=Handlebars.COMPILER_REVISION;if(o!==u){if(o<u){var a=Handlebars.REVISION_CHANGES[u],f=Handlebars.REVISION_CHANGES[o];throw"Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+a+") or downgrade your runtime to an older version ("+f+")."}throw"Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+s[1]+")."}return i}},programWithDepth:function(e,t,n){var r=Array.prototype.slice.call(arguments,2);return function(n,i){return i=i||{},e.apply(this,[n,i.data||t].concat(r))}},program:function(e,t){return function(n,r){return r=r||{},e(n,r.data||t)}},noop:function(){return""},invokePartial:function(e,t,n,r,i,s){var o={helpers:r,partials:i,data:s};if(e===undefined)throw new Handlebars.Exception("The partial "+t+" could not be found");if(e instanceof Function)return e(n,o);if(!Handlebars.compile)throw new Handlebars.Exception("The partial "+t+" could not be compiled when running in runtime-only mode");return i[t]=Handlebars.compile(e,{data:s!==undefined}),i[t](n,o)}},Handlebars.template=Handlebars.VM.template;
});
require.register("kelonye-ember-data/index.js", function(exports, require, module){
// ==========================================================================
// Project:   Ember Data
// Copyright: ©2011-2012 Tilde Inc. and contributors.
//            Portions ©2011 Living Social Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================



// Last commit: 75b805c (2013-04-19 14:45:33 -0700)


(function(){var e,t;(function(){var r={},n={};e=function(e,t,n){r[e]={deps:t,callback:n}},t=function(e){if(n[e])return n[e];n[e]={};for(var i,a=r[e],o=a.deps,s=a.callback,c=[],d=0,u=o.length;u>d;d++)"exports"===o[d]?c.push(i={}):c.push(t(o[d]));var h=s.apply(this,c);return n[e]=i||h}})(),function(){e("json-normalizer/hash-utils",["json-normalizer/string-utils","exports"],function(e,t){"use strict";function r(e,t,r){var n={};for(var i in e)t.call(r,n,i,e[i]);return n}var n=e.camelize,i=e.decamelize,a=function(e){return r(e,function(e,t,r){e[n(t)]=r})},o=function(e){return r(e,function(e,t,r){e[i(t)]=r})};t.map=r,t.camelizeKeys=a,t.decamelizeKeys=o}),e("json-normalizer/processor",["json-normalizer/hash-utils","exports"],function(e,t){"use strict";function r(e){this.json=e}var n=e.camelizeKeys;r.prototype={constructor:r,camelizeKeys:function(){return this.json=n(this.json),this}},t.Processor=r}),e("json-normalizer/string-utils",["exports"],function(e){"use strict";var t=/(\-|_|\.|\s)+(.)?/g,r=function(e){return e.replace(t,function(e,t,r){return r?r.toUpperCase():""}).replace(/^([A-Z])/,function(e){return e.toLowerCase()})},n=/([a-z])([A-Z])/g,i=function(e){return e.replace(n,"$1_$2").toLowerCase()};e.camelize=r,e.decamelize=i}),e("json-normalizer",["json-normalizer/string-utils","json-normalizer/hash-utils","json-normalizer/processor","exports"],function(e,t,r,n){"use strict";var i=e.camelize,a=e.decamelize,o=t.map,s=t.camelizeKeys,c=t.decamelizeKeys,d=r.Processor,u=o;n.camelize=i,n.decamelize=a,n.mapKeys=u,n.camelizeKeys=s,n.decamelizeKeys=c,n.Processor=d})}(),function(){window.DS=Ember.Namespace.create({CURRENT_API_REVISION:12})}(),function(){Ember.Date=Ember.Date||{};var e=Date.parse,t=[1,4,5,6,7,10,11];Ember.Date.parse=function(r){var n,i,a=0;if(i=/^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(r)){for(var o,s=0;o=t[s];++s)i[o]=+i[o]||0;i[2]=(+i[2]||1)-1,i[3]=+i[3]||1,"Z"!==i[8]&&void 0!==i[9]&&(a=60*i[10]+i[11],"+"===i[9]&&(a=0-a)),n=Date.UTC(i[1],i[2],i[3],i[4],i[5]+a,i[6],i[7])}else n=e?e(r):0/0;return n},(Ember.EXTEND_PROTOTYPES===!0||Ember.EXTEND_PROTOTYPES.Date)&&(Date.parse=Ember.Date.parse)}(),function(){var e=Ember.DeferredMixin,t=Ember.Evented,r=Ember.run,n=Ember.get,i=Ember.Mixin.create(t,e,{init:function(){this._super.apply(this,arguments),this.one("didLoad",function(){r(this,"resolve",this)}),n(this,"isLoaded")&&this.trigger("didLoad")}});DS.LoadPromise=i}(),function(){var e=Ember.get;Ember.set;var t=DS.LoadPromise;DS.RecordArray=Ember.ArrayProxy.extend(Ember.Evented,t,{type:null,content:null,isLoaded:!1,isUpdating:!1,store:null,objectAtContent:function(t){var r=e(this,"content"),n=r.objectAt(t),i=e(this,"store");return n?i.recordForReference(n):void 0},materializedObjectAt:function(t){var r=e(this,"content").objectAt(t);if(r)return e(this,"store").recordIsMaterialized(r)?this.objectAt(t):void 0},update:function(){if(!e(this,"isUpdating")){var t=e(this,"store"),r=e(this,"type");t.fetchAll(r,this)}},addReference:function(t){e(this,"content").addObject(t)},removeReference:function(t){e(this,"content").removeObject(t)}})}(),function(){var e=Ember.get;Ember.set;var t=Ember.run.once,r=Ember.EnumerableUtils.forEach;DS.RecordArrayManager=Ember.Object.extend({init:function(){this.filteredRecordArrays=Ember.MapWithDefault.create({defaultValue:function(){return[]}}),this.changedReferences=[]},referenceDidChange:function(e){this.changedReferences.push(e),t(this,this.updateRecordArrays)},recordArraysForReference:function(e){return e.recordArrays=e.recordArrays||Ember.OrderedSet.create(),e.recordArrays},updateRecordArrays:function(){r(this.changedReferences,function(t){var r,n=t.type,i=this.filteredRecordArrays.get(n);i.forEach(function(i){r=e(i,"filterFunction"),this.updateRecordArray(i,r,n,t)},this);var a=t.loadingRecordArrays;if(a){for(var o=0,s=a.length;s>o;o++)a[o].loadedRecord();t.loadingRecordArrays=[]}},this)},updateRecordArray:function(e,t,r,n){var i,a;t?(a=this.store.recordForReference(n),i=t(a)):i=!0;var o=this.recordArraysForReference(n);i?(o.add(e),e.addReference(n)):i||(o.remove(e),e.removeReference(n))},remove:function(t){var r=e(t,"reference"),n=r.recordArrays||[];n.forEach(function(e){e.removeReference(r)})},updateFilter:function(t,r,n){for(var i,a,o,s,c=this.store.typeMapFor(r),d=c.references,u=0,h=d.length;h>u;u++)i=d[u],o=!1,a=i.data,"object"==typeof a&&((s=i.record)?e(s,"isDeleted")||(o=!0):o=!0,o&&this.updateRecordArray(t,n,r,i))},createManyArray:function(e,t){var r=DS.ManyArray.create({type:e,content:t,store:this.store});return t.forEach(function(e){var t=this.recordArraysForReference(e);t.add(r)},this),r},registerFilteredRecordArray:function(e,t,r){var n=this.filteredRecordArrays.get(t);n.push(e),this.updateFilter(e,t,r)},registerWaitingRecordArray:function(e,t){var r=t.loadingRecordArrays||[];r.push(e),t.loadingRecordArrays=r}})}(),function(){var e=Ember.get;DS.FilteredRecordArray=DS.RecordArray.extend({filterFunction:null,isLoaded:!0,replace:function(){var t=e(this,"type").toString();throw new Error("The result of a client-side filter (on "+t+") is immutable.")},updateFilter:Ember.observer(function(){var t=e(this,"manager");t.updateFilter(this,e(this,"type"),e(this,"filterFunction"))},"filterFunction")})}(),function(){var e=Ember.get,t=Ember.set;DS.AdapterPopulatedRecordArray=DS.RecordArray.extend({query:null,replace:function(){var t=e(this,"type").toString();throw new Error("The result of a server query (on "+t+") is immutable.")},load:function(e){this.beginPropertyChanges(),t(this,"content",Ember.A(e)),t(this,"isLoaded",!0),this.endPropertyChanges();var r=this;Ember.run.once(function(){r.trigger("didLoad")})}})}(),function(){var e=Ember.get,t=Ember.set;DS.ManyArray=DS.RecordArray.extend({init:function(){this._super.apply(this,arguments),this._changesToSync=Ember.OrderedSet.create()},owner:null,isPolymorphic:!1,isLoaded:!1,loadingRecordsCount:function(e){this.loadingRecordsCount=e},loadedRecord:function(){this.loadingRecordsCount--,0===this.loadingRecordsCount&&(t(this,"isLoaded",!0),this.trigger("didLoad"))},fetch:function(){var t=e(this,"content"),r=e(this,"store"),n=e(this,"owner");r.fetchUnloadedReferences(t,n)},replaceContent:function(t,r,n){n=n.map(function(t){return e(t,"reference")},this),this._super(t,r,n)},arrangedContentDidChange:function(){this.fetch()},arrayContentWillChange:function(t,r){var n=e(this,"owner"),i=e(this,"name");if(!n._suspendedRelationships)for(var a=t;t+r>a;a++){var o=e(this,"content").objectAt(a),s=DS.RelationshipChange.createChange(n.get("reference"),o,e(this,"store"),{parentType:n.constructor,changeType:"remove",kind:"hasMany",key:i});this._changesToSync.add(s)}return this._super.apply(this,arguments)},arrayContentDidChange:function(t,r,n){this._super.apply(this,arguments);var i=e(this,"owner"),a=e(this,"name"),o=e(this,"store");if(!i._suspendedRelationships){for(var s=t;t+n>s;s++){var c=e(this,"content").objectAt(s),d=DS.RelationshipChange.createChange(i.get("reference"),c,o,{parentType:i.constructor,changeType:"add",kind:"hasMany",key:a});d.hasManyName=a,this._changesToSync.add(d)}this._changesToSync.forEach(function(e){e.sync()}),DS.OneToManyChange.ensureSameTransaction(this._changesToSync,o),this._changesToSync.clear()}},createRecord:function(t,r){var n,i=e(this,"owner"),a=e(i,"store"),o=e(this,"type");return r=r||e(i,"transaction"),n=a.createRecord.call(a,o,t,r),this.pushObject(n),n}})}(),function(){var e=Ember.get,t=Ember.set,r=Ember.EnumerableUtils.forEach;DS.Transaction=Ember.Object.extend({init:function(){t(this,"records",Ember.OrderedSet.create()),t(this,"relationships",Ember.OrderedSet.create())},createRecord:function(t,r){var n=e(this,"store");return n.createRecord(t,r,this)},isEqualOrDefault:function(t){return this===t||t===e(this,"store.defaultTransaction")?!0:void 0},isDefault:Ember.computed(function(){return this===e(this,"store.defaultTransaction")}),add:function(e){this.adoptRecord(e)},relationshipBecameDirty:function(t){e(this,"relationships").add(t)},relationshipBecameClean:function(t){e(this,"relationships").remove(t)},commit:function(){var r=e(this,"store"),n=e(r,"_adapter"),i=e(r,"defaultTransaction");this===i&&t(r,"defaultTransaction",r.transaction()),this.removeCleanRecords();var a=e(this,"relationships"),o=this._commitDetails();o.created.isEmpty()&&o.updated.isEmpty()&&o.deleted.isEmpty()&&o.relationships.isEmpty()||n.commit(r,o),a.forEach(function(e){e.destroy()})},_commitDetails:function(){var t=e(this,"relationships"),r={created:Ember.OrderedSet.create(),updated:Ember.OrderedSet.create(),deleted:Ember.OrderedSet.create(),relationships:t},n=e(this,"records");return n.forEach(function(t){e(t,"isDirty")&&(t.send("willCommit"),r[e(t,"dirtyType")].add(t))}),r},rollback:function(){e(this,"store");var t=Ember.OrderedSet.create(),r=e(this,"relationships");r.forEach(function(e){t.add(e.firstRecordReference),t.add(e.secondRecordReference),e.destroy()}),r.clear();var n=e(this,"records");n.forEach(function(e){e.get("isDirty")&&e.send("rollback")}),this.removeCleanRecords(),t.forEach(function(e){if(e&&e.record){var t=e.record;t.suspendRelationshipObservers(function(){t.reloadHasManys()})}},this)},remove:function(t){var r=e(this,"store.defaultTransaction");r.adoptRecord(t)},removeCleanRecords:function(){var t=e(this,"records");t.forEach(function(e){e.get("isDirty")||this.remove(e)},this)},adoptRecord:function(r){var n=e(r,"transaction");n&&n.removeRecord(r),e(this,"records").add(r),t(r,"transaction",this)},removeRecord:function(t){e(this,"records").remove(t)}}),DS.Transaction.reopenClass({ensureSameTransaction:function(t){var n=Ember.A();r(t,function(t){t&&n.pushObject(e(t,"transaction"))});var i=n.reduce(function(t,r){return e(r,"isDefault")||null!==t?t:r},null);return i?r(t,function(e){e&&i.add(e)}):i=n.objectAt(0),i}})}(),function(){Ember.get;var e=function(e){return e},t=function(e){return e},r=function(e,t){return t};DS._Mappable=Ember.Mixin.create({createInstanceMapFor:function(e){var t=Ember.metaPath(this,["DS.Mappable"],!0);if(t.values=t.values||{},t.values[e])return t.values[e];for(var r=t.values[e]=new Ember.Map,n=this.constructor;n&&n!==DS.Store;)this._copyMap(e,n,r),n=n.superclass;return t.values[e]=r,r},_copyMap:function(n,i,a){function o(n,o){var s=(i.transformMapKey||t)(n,o),c=(i.transformMapValue||r)(n,o),d=a.get(s),u=c;d&&(u=(this.constructor.resolveMapConflict||e)(d,u)),a.set(s,u)}var s=Ember.metaPath(i,["DS.Mappable"],!0),c=s[n];c&&c.forEach(o,this)}}),DS._Mappable.generateMapFunctionFor=function(e,t){return function(r,n){var i=Ember.metaPath(this,["DS.Mappable"],!0),a=i[e]||Ember.MapWithDefault.create({defaultValue:function(){return{}}});t.call(this,r,n,a),i[e]=a}}}(),function(){var e=Ember.get,t=Ember.set,r=Ember.run.once,n=Ember.isNone,i=Ember.EnumerableUtils.forEach,a=Ember.EnumerableUtils.map,o="unloaded",s="loading",c={materialized:!0},d={created:!0},u=function(e){return null==e?null:e+""};DS.Store=Ember.Object.extend(DS._Mappable,{init:function(){var r=e(this,"revision");if(r!==DS.CURRENT_API_REVISION&&!Ember.ENV.TESTING)throw new Error("Error: The Ember Data library has had breaking API changes since the last time you updated the library. Please review the list of breaking changes at https://github.com/emberjs/data/blob/master/BREAKING_CHANGES.md, then update your store's `revision` property to "+DS.CURRENT_API_REVISION);(!e(DS,"defaultStore")||e(this,"isDefaultStore"))&&t(DS,"defaultStore",this),this.typeMaps={},this.recordArrayManager=DS.RecordArrayManager.create({store:this}),this.relationshipChanges={},t(this,"currentTransaction",this.transaction()),t(this,"defaultTransaction",this.transaction())},transaction:function(){return DS.Transaction.create({store:this})},materializeData:function(t){var r=e(t,"reference"),n=r.data,i=this.adapterForType(t.constructor);r.data=c,t.setupData(),n!==d&&i.materialize(t,n,r.prematerialized)},adapter:Ember.computed(function(){return"DS.RESTAdapter"}).property(),serialize:function(e,t){return this.adapterForType(e.constructor).serialize(e,t)},_adapter:Ember.computed(function(){var t=e(this,"adapter");return"string"==typeof t&&(t=e(this,t,!1)||e(Ember.lookup,t)),DS.Adapter.detect(t)&&(t=t.create()),t}).property("adapter"),clientIdCounter:1,createRecord:function(r,i,a){i=i||{};var o=r._create({store:this});a=a||e(this,"defaultTransaction"),a.adoptRecord(o);var s=i.id;if(n(s)){var c=this.adapterForType(r);c&&c.generateIdForRecord&&(s=u(c.generateIdForRecord(this,o)),i.id=s)}s=u(s);var h=this.createReference(r,s);return h.data=d,t(o,"reference",h),h.record=o,o.loadedData(),o.setupData(),o.setProperties(i),Ember.run(o,"resolve",o),o},deleteRecord:function(e){e.deleteRecord()},unloadRecord:function(e){e.unloadRecord()},find:function(e,t){return void 0===t?this.findAll(e):"object"===Ember.typeOf(t)?this.findQuery(e,t):this.findById(e,u(t))},findById:function(e,t){var r;if(this.hasReferenceForId(e,t)&&(r=this.referenceForId(e,t),r.data!==o))return this.recordForReference(r);r||(r=this.createReference(e,t)),r.data=s;var n=this.materializeRecord(r);if(r.data===s){var i=this.adapterForType(e);i.find(this,e,t)}return n},reloadRecord:function(t){var r=t.constructor,n=this.adapterForType(r),i=e(t,"id");n.find(this,r,i)},recordForReference:function(e){var t=e.record;return t||(t=this.materializeRecord(e)),t},unloadedReferences:function(e){for(var t=[],r=0,n=e.length;n>r;r++){var i=e[r];i.data===o&&(t.push(i),i.data=s)}return t},fetchUnloadedReferences:function(e,t){var r=this.unloadedReferences(e);this.fetchMany(r,t)},fetchMany:function(e,t){if(e.length){var r=Ember.MapWithDefault.create({defaultValue:function(){return Ember.A()}});i(e,function(e){r.get(e.type).push(e)}),i(r,function(e){var n=r.get(e),i=a(n,function(e){return e.id}),o=this.adapterForType(e);o.findMany(this,e,i,t)},this)}},hasReferenceForId:function(e,t){return t=u(t),!!this.typeMapFor(e).idToReference[t]},referenceForId:function(e,t){t=u(t);var r=this.typeMapFor(e).idToReference[t];return r||(r=this.createReference(e,t),r.data=o),r},findMany:function(e,t,r,n){if(!Ember.isArray(t)){var i=this.adapterForType(e);return i&&i.findHasMany&&i.findHasMany(this,r,n,t),this.recordArrayManager.createManyArray(e,Ember.A())}var o,s,c,d=a(t,function(t){return"object"!=typeof t&&null!==t?this.referenceForId(e,t):t},this),u=this.unloadedReferences(d),h=this.recordArrayManager.createManyArray(e,Ember.A(d));if(this.loadingRecordArrays,h.loadingRecordsCount(u.length),u.length){for(s=0,c=u.length;c>s;s++)o=u[s],this.recordArrayManager.registerWaitingRecordArray(h,o);this.fetchMany(u,r)}else h.set("isLoaded",!0),Ember.run.once(function(){h.trigger("didLoad")});return h},findQuery:function(e,t){var r=DS.AdapterPopulatedRecordArray.create({type:e,query:t,content:Ember.A([]),store:this}),n=this.adapterForType(e);return n.findQuery(this,e,t,r),r},findAll:function(e){return this.fetchAll(e,this.all(e))},fetchAll:function(e,r){var n=this.adapterForType(e),i=this.typeMapFor(e).metadata.since;return t(r,"isUpdating",!0),n.findAll(this,e,i),r},metaForType:function(e,r,n){var i=this.typeMapFor(e).metadata;t(i,r,n)},didUpdateAll:function(e){var r=this.typeMapFor(e).findAllCache;t(r,"isUpdating",!1)},all:function(e){var t=this.typeMapFor(e),r=t.findAllCache;if(r)return r;var n=DS.RecordArray.create({type:e,content:Ember.A([]),store:this,isLoaded:!0});return this.recordArrayManager.registerFilteredRecordArray(n,e),t.findAllCache=n,n},filter:function(e,t,r){3===arguments.length?this.findQuery(e,t):2===arguments.length&&(r=t);var n=DS.FilteredRecordArray.create({type:e,content:Ember.A([]),store:this,manager:this.recordArrayManager,filterFunction:r});return this.recordArrayManager.registerFilteredRecordArray(n,e,r),n},recordIsLoaded:function(e,t){return this.hasReferenceForId(e,t)?"object"==typeof this.referenceForId(e,t).data:!1},dataWasUpdated:function(t,r,n){e(n,"isDeleted")||"object"==typeof r.data&&this.recordArrayManager.referenceDidChange(r)},scheduleSave:function(t){e(this,"currentTransaction").add(t),r(this,"flushSavedRecords")},flushSavedRecords:function(){e(this,"currentTransaction").commit(),t(this,"currentTransaction",this.transaction())},save:function(){r(this,"commit")},commit:function(){e(this,"defaultTransaction").commit()},didSaveRecord:function(e,t){e.adapterDidCommit(),t?(this.updateId(e,t),this.updateRecordData(e,t)):this.didUpdateAttributes(e)},didSaveRecords:function(e,t){var r=0;e.forEach(function(e){this.didSaveRecord(e,t&&t[r++])},this)},recordWasInvalid:function(e,t){e.adapterDidInvalidate(t)},recordWasError:function(e){e.adapterDidError()},didUpdateAttribute:function(e,t,r){e.adapterDidUpdateAttribute(t,r)},didUpdateAttributes:function(e){e.eachAttribute(function(t){this.didUpdateAttribute(e,t)},this)},didUpdateRelationship:function(t,r){var n=e(t,"reference").clientId,i=this.relationshipChangeFor(n,r);i&&i.adapterDidUpdate()},didUpdateRelationships:function(t){var r=this.relationshipChangesFor(e(t,"reference"));for(var n in r)r.hasOwnProperty(n)&&r[n].adapterDidUpdate()},didReceiveId:function(t,r){var n=this.typeMapFor(t.constructor),i=e(t,"clientId");e(t,"id"),n.idToCid[r]=i,this.clientIdToId[i]=r},updateRecordData:function(t,r){e(t,"reference").data=r,t.didChangeData()},updateId:function(t,r){var n=t.constructor,i=this.typeMapFor(n),a=e(t,"reference"),o=(e(t,"id"),this.preprocessData(n,r));i.idToReference[o]=a,a.id=o},preprocessData:function(e,t){return this.adapterForType(e).extractId(e,t)},typeMapFor:function(t){var r,n=e(this,"typeMaps"),i=Ember.guidFor(t);return(r=n[i])?r:(r={idToReference:{},references:[],metadata:{}},n[i]=r,r)},load:function(e,t,n){var i;("number"==typeof t||"string"==typeof t)&&(i=t,t=n,n=null),n&&n.id?i=n.id:void 0===i&&(i=this.preprocessData(e,t)),i=u(i);var a=this.referenceForId(e,i);return a.record&&r(a.record,"loadedData"),a.data=t,a.prematerialized=n,this.recordArrayManager.referenceDidChange(a),a},loadMany:function(e,t,r){return void 0===r&&(r=t,t=a(r,function(t){return this.preprocessData(e,t)},this)),a(t,function(t,n){return this.load(e,t,r[n])},this)},loadHasMany:function(e,r,n){var i=e.get(r+".type"),o=a(n,function(e){return{id:e,type:i}});e.materializeHasMany(r,o),e.hasManyDidChange(r);var s=e.cacheFor(r);s&&(t(s,"isLoaded",!0),s.trigger("didLoad"))},createReference:function(e,t){var r=this.typeMapFor(e),n=r.idToReference,i={id:t,clientId:this.clientIdCounter++,type:e};return t&&(n[t]=i),r.references.push(i),i},materializeRecord:function(t){var r=t.type._create({id:t.id,store:this,reference:t});return t.record=r,e(this,"defaultTransaction").adoptRecord(r),r.loadingData(),"object"==typeof t.data&&r.loadedData(),r},dematerializeRecord:function(t){var r=e(t,"reference"),n=r.type,i=r.id,a=this.typeMapFor(n);t.updateRecordArrays(),i&&delete a.idToReference[i];var o=a.references.indexOf(r);a.references.splice(o,1)},willDestroy:function(){e(DS,"defaultStore")===this&&t(DS,"defaultStore",null)},addRelationshipChangeFor:function(e,t,r,n,i){var a=e.clientId,o=r?r.clientId:r,s=t+n,c=this.relationshipChanges;a in c||(c[a]={}),o in c[a]||(c[a][o]={}),s in c[a][o]||(c[a][o][s]={}),c[a][o][s][i.changeType]=i},removeRelationshipChangeFor:function(e,t,r,n,i){var a=e.clientId,o=r?r.clientId:r,s=this.relationshipChanges,c=t+n;a in s&&o in s[a]&&c in s[a][o]&&delete s[a][o][c][i]},relationshipChangeFor:function(e,t,r,n,i){var a=this.relationshipChanges,o=t+n;return e in a&&r in a[e]?i?a[e][r][o][i]:a[e][r][o].add||a[e][r][o].remove:void 0},relationshipChangePairsFor:function(e){var t=[];if(!e)return t;var r=this.relationshipChanges[e.clientId];for(var n in r)if(r.hasOwnProperty(n))for(var i in r[n])r[n].hasOwnProperty(i)&&t.push(r[n][i]);return t},relationshipChangesFor:function(e){var t=[];if(!e)return t;var r=this.relationshipChangePairsFor(e);return i(r,function(e){var r=e.add,n=e.remove;r&&t.push(r),n&&t.push(n)}),t},adapterForType:function(e){this._adaptersMap=this.createInstanceMapFor("adapters");var t=this._adaptersMap.get(e);return t?t:this.get("_adapter")},recordAttributeDidChange:function(e,t,r,n){var i=e.record,a=new Ember.OrderedSet,o=this.adapterForType(i.constructor);o.dirtyRecordsForAttributeChange&&o.dirtyRecordsForAttributeChange(a,i,t,r,n),a.forEach(function(e){e.adapterDidDirty()})},recordBelongsToDidChange:function(e,t,r){var n=this.adapterForType(t.constructor);n.dirtyRecordsForBelongsToChange&&n.dirtyRecordsForBelongsToChange(e,t,r)},recordHasManyDidChange:function(e,t,r){var n=this.adapterForType(t.constructor);n.dirtyRecordsForHasManyChange&&n.dirtyRecordsForHasManyChange(e,t,r)}}),DS.Store.reopenClass({registerAdapter:DS._Mappable.generateMapFunctionFor("adapters",function(e,t,r){r.set(e,t)}),transformMapKey:function(t){if("string"==typeof t){var r;return r=e(Ember.lookup,t)}return t},transformMapValue:function(e,t){return Ember.Object.detect(t)?t.create():t}})}(),function(){var e=Ember.get,t=Ember.set,r=Ember.run.once,n=Ember.ArrayPolyfills.map,i=Ember.computed(function(t){var r=e(this,"parentState");return r?e(r,t):void 0}).property(),a=function(e){for(var t in e)if(e.hasOwnProperty(t)&&e[t])return!0;return!1},o=function(t){var r=e(t,"record");r.materializeData()},s=function(t,r){r.oldValue=e(e(t,"record"),r.name);var n=DS.AttributeChange.createChange(r);e(t,"record")._changesToSync[r.name]=n},c=function(t,r){var n=e(t,"record")._changesToSync[r.name];n.value=e(e(t,"record"),r.name),n.sync()};DS.State=Ember.State.extend({isLoading:i,isLoaded:i,isReloading:i,isDirty:i,isSaving:i,isDeleted:i,isError:i,isNew:i,isValid:i,dirtyType:i});var d=DS.State.extend({initialState:"uncommitted",isDirty:!0,uncommitted:DS.State.extend({willSetProperty:s,didSetProperty:c,becomeDirty:Ember.K,willCommit:function(e){e.transitionTo("inFlight")},becameClean:function(t){var r=e(t,"record");r.withTransaction(function(e){e.remove(r)}),t.transitionTo("loaded.materializing")},becameInvalid:function(e){e.transitionTo("invalid")},rollback:function(t){e(t,"record").rollback()}}),inFlight:DS.State.extend({isSaving:!0,enter:function(t){var r=e(t,"record");r.becameInFlight()},didCommit:function(t){var r=e(this,"dirtyType"),n=e(t,"record");n.withTransaction(function(e){e.remove(n)}),t.transitionTo("saved"),t.send("invokeLifecycleCallbacks",r)},becameInvalid:function(r,n){var i=e(r,"record");t(i,"errors",n),r.transitionTo("invalid"),r.send("invokeLifecycleCallbacks")},becameError:function(e){e.transitionTo("error"),e.send("invokeLifecycleCallbacks")}}),invalid:DS.State.extend({isValid:!1,exit:function(t){var r=e(t,"record");r.withTransaction(function(e){e.remove(r)})},deleteRecord:function(t){t.transitionTo("deleted"),e(t,"record").clearRelationships()},willSetProperty:s,didSetProperty:function(r,n){var i=e(r,"record"),o=e(i,"errors"),s=n.name;t(o,s,null),a(o)||r.send("becameValid"),c(r,n)},becomeDirty:Ember.K,rollback:function(e){e.send("becameValid"),e.send("rollback")},becameValid:function(e){e.transitionTo("uncommitted")},invokeLifecycleCallbacks:function(t){var r=e(t,"record");r.trigger("becameInvalid",r)}})}),u=d.create({dirtyType:"created",isNew:!0}),h=d.create({dirtyType:"updated"});u.states.uncommitted.reopen({deleteRecord:function(t){var r=e(t,"record");r.clearRelationships(),t.transitionTo("deleted.saved")}}),u.states.uncommitted.reopen({rollback:function(e){this._super(e),e.transitionTo("deleted.saved")}}),h.states.uncommitted.reopen({deleteRecord:function(t){var r=e(t,"record");t.transitionTo("deleted"),r.clearRelationships()}});var l={rootState:Ember.State.create({isLoading:!1,isLoaded:!1,isReloading:!1,isDirty:!1,isSaving:!1,isDeleted:!1,isError:!1,isNew:!1,isValid:!0,empty:DS.State.create({loadingData:function(e){e.transitionTo("loading")},loadedData:function(e){e.transitionTo("loaded.created")}}),loading:DS.State.create({isLoading:!0,loadedData:o,materializingData:function(e){e.transitionTo("loaded.materializing.firstTime")}}),loaded:DS.State.create({initialState:"saved",isLoaded:!0,materializing:DS.State.create({willSetProperty:Ember.K,didSetProperty:Ember.K,didChangeData:o,finishedMaterializing:function(e){e.transitionTo("loaded.saved")},firstTime:DS.State.create({isLoaded:!1,exit:function(t){var n=e(t,"record");r(function(){n.trigger("didLoad")})}})}),reloading:DS.State.create({isReloading:!0,enter:function(t){var r=e(t,"record"),n=e(r,"store");n.reloadRecord(r)},exit:function(t){var n=e(t,"record");r(n,"trigger","didReload")},loadedData:o,materializingData:function(e){e.transitionTo("loaded.materializing")}}),saved:DS.State.create({willSetProperty:s,didSetProperty:c,didChangeData:o,loadedData:o,reloadRecord:function(e){e.transitionTo("loaded.reloading")},materializingData:function(e){e.transitionTo("loaded.materializing")},becomeDirty:function(e){e.transitionTo("updated")},deleteRecord:function(t){t.transitionTo("deleted"),e(t,"record").clearRelationships()},unloadRecord:function(t){var r=e(t,"record");r.clearRelationships(),t.transitionTo("deleted.saved")},invokeLifecycleCallbacks:function(t,r){var n=e(t,"record");"created"===r?n.trigger("didCreate",n):n.trigger("didUpdate",n),n.trigger("didCommit",n)}}),created:u,updated:h}),deleted:DS.State.create({initialState:"uncommitted",dirtyType:"deleted",isDeleted:!0,isLoaded:!0,isDirty:!0,setup:function(t){var r=e(t,"record"),n=e(r,"store");n.recordArrayManager.remove(r)},uncommitted:DS.State.create({willCommit:function(e){e.transitionTo("inFlight")},rollback:function(t){e(t,"record").rollback()},becomeDirty:Ember.K,becameClean:function(t){var r=e(t,"record");r.withTransaction(function(e){e.remove(r)}),t.transitionTo("loaded.materializing")}}),inFlight:DS.State.create({isSaving:!0,enter:function(t){var r=e(t,"record");r.becameInFlight()},didCommit:function(t){var r=e(t,"record");r.withTransaction(function(e){e.remove(r)}),t.transitionTo("saved"),t.send("invokeLifecycleCallbacks")}}),saved:DS.State.create({isDirty:!1,setup:function(t){var r=e(t,"record"),n=e(r,"store");n.dematerializeRecord(r)},invokeLifecycleCallbacks:function(t){var r=e(t,"record");r.trigger("didDelete",r),r.trigger("didCommit",r)}})}),error:DS.State.create({isError:!0,invokeLifecycleCallbacks:function(t){var r=e(t,"record");r.trigger("becameError",r)}})})};DS.StateManager=Ember.StateManager.extend({record:null,initialState:"rootState",states:l,unhandledEvent:function(t,r){var i,a=t.get("record"),o=[].slice.call(arguments,2);throw i="Attempted to handle event `"+r+"` ",i+="on "+a.toString()+" while in state ",i+=e(t,"currentState.path")+". Called with ",i+=n.call(o,function(e){return Ember.inspect(e)}).join(", "),new Ember.Error(i)}})}(),function(){var e=DS.LoadPromise,t=Ember.get,r=Ember.set,n=Ember.EnumerableUtils.map,i=Ember.computed(function(e){return t(t(this,"stateManager.currentState"),e)}).property("stateManager.currentState").readOnly();DS.Model=Ember.Object.extend(Ember.Evented,e,{isLoading:i,isLoaded:i,isReloading:i,isDirty:i,isSaving:i,isDeleted:i,isError:i,isNew:i,isValid:i,dirtyType:i,clientId:null,id:null,transaction:null,stateManager:null,errors:null,serialize:function(e){var r=t(this,"store");return r.serialize(this,e)},toJSON:function(e){var t=DS.JSONSerializer.create();return t.serialize(this,e)},didLoad:Ember.K,didReload:Ember.K,didUpdate:Ember.K,didCreate:Ember.K,didDelete:Ember.K,becameInvalid:Ember.K,becameError:Ember.K,data:Ember.computed(function(){return this._data||this.materializeData(),this._data}).property(),materializeData:function(){this.send("materializingData"),t(this,"store").materializeData(this),this.suspendRelationshipObservers(function(){this.notifyPropertyChange("data")})},_data:null,init:function(){this._super();var e=DS.StateManager.create({record:this});r(this,"stateManager",e),this._setup(),e.goToState("empty")},_setup:function(){this._relationshipChanges={},this._changesToSync={}},send:function(e,r){return t(this,"stateManager").send(e,r)},withTransaction:function(e){var r=t(this,"transaction");r&&e(r)},loadingData:function(){this.send("loadingData")},loadedData:function(){this.send("loadedData")},didChangeData:function(){this.send("didChangeData")},reload:function(){this.send("reloadRecord")},deleteRecord:function(){this.send("deleteRecord")},unloadRecord:function(){this.send("unloadRecord")},clearRelationships:function(){this.eachRelationship(function(e,t){"belongsTo"===t.kind?r(this,e,null):"hasMany"===t.kind&&this.clearHasMany(t)},this)},updateRecordArrays:function(){var e=t(this,"store");e&&e.dataWasUpdated(this.constructor,t(this,"reference"),this)},adapterDidCommit:function(){var e=t(this,"data").attributes;t(this.constructor,"attributes").forEach(function(r){e[r]=t(this,r)},this),this.send("didCommit"),this.updateRecordArraysLater()},adapterDidDirty:function(){this.send("becomeDirty"),this.updateRecordArraysLater()},dataDidChange:Ember.observer(function(){this.reloadHasManys(),this.send("finishedMaterializing")},"data"),reloadHasManys:function(){var e=t(this.constructor,"relationshipsByName");this.updateRecordArraysLater(),e.forEach(function(e,t){"hasMany"===t.kind&&this.hasManyDidChange(t.key)},this)},hasManyDidChange:function(e){var i=this.cacheFor(e);if(i){var a=t(this.constructor,"relationshipsByName").get(e).type,o=t(this,"store"),s=this._data.hasMany[e]||[],c=n(s,function(e){return"object"==typeof e?e.clientId?e:o.referenceForId(e.type,e.id):o.referenceForId(a,e)});r(i,"content",Ember.A(c))}},updateRecordArraysLater:function(){Ember.run.once(this,this.updateRecordArrays)},setupData:function(){this._data={attributes:{},belongsTo:{},hasMany:{},id:null}},materializeId:function(e){r(this,"id",e)},materializeAttributes:function(e){this._data.attributes=e},materializeAttribute:function(e,t){this._data.attributes[e]=t},materializeHasMany:function(e,t){var r=typeof t;if(t&&"string"!==r&&t.length>1&&Ember.assert("materializeHasMany expects tuples, references or opaque token, not "+t[0],t[0].hasOwnProperty("id")&&t[0].type),"string"===r)this._data.hasMany[e]=t;else{var n=t;t&&Ember.isArray(t)&&(n=this._convertTuplesToReferences(t)),this._data.hasMany[e]=n}},materializeBelongsTo:function(e,t){t&&Ember.assert("materializeBelongsTo expects a tuple or a reference, not a "+t,!t||t.hasOwnProperty("id")&&t.hasOwnProperty("type")),this._data.belongsTo[e]=t},_convertTuplesToReferences:function(e){return n(e,function(e){return this._convertTupleToReference(e)},this)},_convertTupleToReference:function(e){var r=t(this,"store");return e.clientId?e:r.referenceForId(e.type,e.id)},rollback:function(){this._setup(),this.send("becameClean"),this.suspendRelationshipObservers(function(){this.notifyPropertyChange("data")})},toStringExtension:function(){return t(this,"id")},suspendRelationshipObservers:function(e,r){var n=t(this.constructor,"relationshipNames").belongsTo,i=this;try{this._suspendedRelationships=!0,Ember._suspendObservers(i,n,null,"belongsToDidChange",function(){Ember._suspendBeforeObservers(i,n,null,"belongsToWillChange",function(){e.call(r||i)})})}finally{this._suspendedRelationships=!1}},becameInFlight:function(){},save:function(){this.get("store").scheduleSave(this);var e=new Ember.RSVP.Promise;return this.one("didCommit",this,function(){e.resolve(this)}),e},adapterDidUpdateAttribute:function(e,r){void 0!==r?(t(this,"data.attributes")[e]=r,this.notifyPropertyChange(e)):(r=t(this,e),t(this,"data.attributes")[e]=r),this.updateRecordArraysLater()},adapterDidInvalidate:function(e){this.send("becameInvalid",e)},adapterDidError:function(){this.send("becameError")},trigger:function(e){Ember.tryInvoke(this,e,[].slice.call(arguments,1)),this._super.apply(this,arguments)}});var a=function(e){return function(){var r=t(DS,"defaultStore"),n=[].slice.call(arguments);return n.unshift(this),r[e].apply(r,n)}};DS.Model.reopenClass({isLoaded:a("recordIsLoaded"),find:a("find"),all:a("all"),query:a("findQuery"),filter:a("filter"),_create:DS.Model.create,create:function(){throw new Ember.Error("You should not call `create` on a model. Instead, call `createRecord` with the attributes you would like to set.")},createRecord:a("createRecord")})}(),function(){function e(e,r,n){var i=t(e,"data").attributes,a=i[n];return void 0===a&&(a="function"==typeof r.defaultValue?r.defaultValue():r.defaultValue),a}var t=Ember.get;DS.Model.reopenClass({attributes:Ember.computed(function(){var e=Ember.Map.create();return this.eachComputedProperty(function(t,r){r.isAttribute&&(r.name=t,e.set(t,r))}),e})});var r=DS.AttributeChange=function(e){this.reference=e.reference,this.store=e.store,this.name=e.name,this.oldValue=e.oldValue};r.createChange=function(e){return new r(e)},r.prototype={sync:function(){this.store.recordAttributeDidChange(this.reference,this.name,this.value,this.oldValue),this.destroy()},destroy:function(){delete this.store.recordForReference(this.reference)._changesToSync[this.name]}},DS.Model.reopen({eachAttribute:function(e,r){t(this.constructor,"attributes").forEach(function(t,n){e.call(r,t,n)
},r)},attributeWillChange:Ember.beforeObserver(function(e,r){var n=t(e,"reference"),i=t(e,"store");e.send("willSetProperty",{reference:n,store:i,name:r})}),attributeDidChange:Ember.observer(function(e,t){e.send("didSetProperty",{name:t})})}),DS.attr=function(t,r){r=r||{};var n={type:t,isAttribute:!0,options:r};return Ember.computed(function(t,n){return arguments.length>1||(n=e(this,r,t)),n}).property("data").meta(n)}}(),function(){var e=Ember.get,t=(Ember.set,Ember.isNone);DS.belongsTo=function(r,n){n=n||{};var i={type:r,isRelationship:!0,options:n,kind:"belongsTo"};return Ember.computed(function(n,i){if("string"==typeof r&&(r=e(this,r,!1)||e(Ember.lookup,r)),2===arguments.length)return void 0===i?null:i;var a,o=e(this,"data").belongsTo,s=e(this,"store");return a=o[n],t(a)?null:a.clientId?s.recordForReference(a):s.findById(a.type,a.id)}).property("data").meta(i)},DS.Model.reopen({belongsToWillChange:Ember.beforeObserver(function(t,r){if(e(t,"isLoaded")){var n=e(t,r),i=e(t,"reference"),a=e(t,"store");if(n){var o=DS.RelationshipChange.createChange(i,e(n,"reference"),a,{key:r,kind:"belongsTo",changeType:"remove"});o.sync(),this._changesToSync[r]=o}}}),belongsToDidChange:Ember.immediateObserver(function(t,r){if(e(t,"isLoaded")){var n=e(t,r);if(n){var i=e(t,"reference"),a=e(t,"store"),o=DS.RelationshipChange.createChange(i,e(n,"reference"),a,{key:r,kind:"belongsTo",changeType:"add"});o.sync(),this._changesToSync[r]&&DS.OneToManyChange.ensureSameTransaction([o,this._changesToSync[r]],a)}}delete this._changesToSync[r]})})}(),function(){function e(e,i){var a=(t(e,"store"),t(e,"data").hasMany),o=a[i.key];if(o){var s=e.constructor.inverseFor(i.key).name;n.call(o,function(t){var n;(n=t.record)&&e.suspendRelationshipObservers(function(){r(n,s,null)})})}}var t=Ember.get,r=Ember.set,n=Ember.ArrayPolyfills.forEach,i=function(e,n){n=n||{};var i={type:e,isRelationship:!0,options:n,kind:"hasMany"};return Ember.computed(function(a){var o,s,c=t(this,"data").hasMany,d=t(this,"store");return"string"==typeof e&&(e=t(this,e,!1)||t(Ember.lookup,e)),o=c[a],s=d.findMany(e,o,this,i),r(s,"owner",this),r(s,"name",a),r(s,"isPolymorphic",n.polymorphic),s}).property().meta(i)};DS.hasMany=function(e,t){return i(e,t)},DS.Model.reopen({clearHasMany:function(t){var r=this.cacheFor(t.name);r?r.clear():e(this,t)}})}(),function(){var e=Ember.get;Ember.set,DS.Model.reopen({didDefineProperty:function(e,t,r){if(r instanceof Ember.Descriptor){var n=r.meta();n.isRelationship&&"belongsTo"===n.kind&&(Ember.addObserver(e,t,null,"belongsToDidChange"),Ember.addBeforeObserver(e,t,null,"belongsToWillChange")),n.isAttribute&&(Ember.addObserver(e,t,null,"attributeDidChange"),Ember.addBeforeObserver(e,t,null,"attributeWillChange")),n.parentType=e.constructor}}}),DS.Model.reopenClass({typeForRelationship:function(t){var r=e(this,"relationshipsByName").get(t);return r&&r.type},inverseFor:function(t){function r(t,n,i){i=i||[];var a=e(n,"relationships");if(a){var o=a.get(t);return o&&i.push.apply(i,a.get(t)),t.superclass&&r(t.superclass,n,i),i}}var n=this.typeForRelationship(t);if(!n)return null;var i,a,o=this.metaForProperty(t).options;if(o.inverse)i=o.inverse,a=Ember.get(n,"relationshipsByName").get(i).kind;else{var s=r(this,n);if(0===s.length)return null;i=s[0].name,a=s[0].kind}return{type:n,name:i,kind:a}},relationships:Ember.computed(function(){var e=new Ember.MapWithDefault({defaultValue:function(){return[]}});return this.eachComputedProperty(function(t,r){if(r.isRelationship){"string"==typeof r.type&&(r.type=Ember.get(Ember.lookup,r.type));var n=e.get(r.type);n.push({name:t,kind:r.kind})}}),e}),relationshipNames:Ember.computed(function(){var e={hasMany:[],belongsTo:[]};return this.eachComputedProperty(function(t,r){r.isRelationship&&e[r.kind].push(t)}),e}),relatedTypes:Ember.computed(function(){var t,r=Ember.A([]);return this.eachComputedProperty(function(n,i){i.isRelationship&&(t=i.type,"string"==typeof t&&(t=e(this,t,!1)||e(Ember.lookup,t)),r.contains(t)||r.push(t))}),r}),relationshipsByName:Ember.computed(function(){var t,r=Ember.Map.create();return this.eachComputedProperty(function(n,i){i.isRelationship&&(i.key=n,t=i.type,"string"==typeof t&&(t=e(this,t,!1)||e(Ember.lookup,t),i.type=t),r.set(n,i))}),r}),fields:Ember.computed(function(){var e=Ember.Map.create();return this.eachComputedProperty(function(t,r){r.isRelationship?e.set(t,r.kind):r.isAttribute&&e.set(t,"attribute")}),e}),eachRelationship:function(t,r){e(this,"relationshipsByName").forEach(function(e,n){t.call(r,e,n)})},eachRelatedType:function(t,r){e(this,"relatedTypes").forEach(function(e){t.call(r,e)})}}),DS.Model.reopen({eachRelationship:function(e,t){this.constructor.eachRelationship(e,t)}})}(),function(){var e=Ember.get,t=Ember.set,r=Ember.EnumerableUtils.forEach;DS.RelationshipChange=function(e){this.parentReference=e.parentReference,this.childReference=e.childReference,this.firstRecordReference=e.firstRecordReference,this.firstRecordKind=e.firstRecordKind,this.firstRecordName=e.firstRecordName,this.secondRecordReference=e.secondRecordReference,this.secondRecordKind=e.secondRecordKind,this.secondRecordName=e.secondRecordName,this.store=e.store,this.committed={},this.changeType=e.changeType},DS.RelationshipChangeAdd=function(e){DS.RelationshipChange.call(this,e)},DS.RelationshipChangeRemove=function(e){DS.RelationshipChange.call(this,e)},DS.RelationshipChange.create=function(e){return new DS.RelationshipChange(e)},DS.RelationshipChangeAdd.create=function(e){return new DS.RelationshipChangeAdd(e)},DS.RelationshipChangeRemove.create=function(e){return new DS.RelationshipChangeRemove(e)},DS.OneToManyChange={},DS.OneToNoneChange={},DS.ManyToNoneChange={},DS.OneToOneChange={},DS.ManyToManyChange={},DS.RelationshipChange._createChange=function(e){return"add"===e.changeType?DS.RelationshipChangeAdd.create(e):"remove"===e.changeType?DS.RelationshipChangeRemove.create(e):void 0},DS.RelationshipChange.determineRelationshipType=function(e,t){var r,n,i=t.key,a=t.kind,o=e.inverseFor(i);return o&&(r=o.name,n=o.kind),o?"belongsTo"===n?"belongsTo"===a?"oneToOne":"manyToOne":"belongsTo"===a?"oneToMany":"manyToMany":"belongsTo"===a?"oneToNone":"manyToNone"},DS.RelationshipChange.createChange=function(e,t,r,n){var i,a=e.type;return i=DS.RelationshipChange.determineRelationshipType(a,n),"oneToMany"===i?DS.OneToManyChange.createChange(e,t,r,n):"manyToOne"===i?DS.OneToManyChange.createChange(t,e,r,n):"oneToNone"===i?DS.OneToNoneChange.createChange(e,t,r,n):"manyToNone"===i?DS.ManyToNoneChange.createChange(e,t,r,n):"oneToOne"===i?DS.OneToOneChange.createChange(e,t,r,n):"manyToMany"===i?DS.ManyToManyChange.createChange(e,t,r,n):void 0},DS.OneToNoneChange.createChange=function(e,t,r,n){var i=n.key,a=DS.RelationshipChange._createChange({parentReference:t,childReference:e,firstRecordReference:e,store:r,changeType:n.changeType,firstRecordName:i,firstRecordKind:"belongsTo"});return r.addRelationshipChangeFor(e,i,t,null,a),a},DS.ManyToNoneChange.createChange=function(e,t,r,n){var i=n.key,a=DS.RelationshipChange._createChange({parentReference:e,childReference:t,secondRecordReference:e,store:r,changeType:n.changeType,secondRecordName:n.key,secondRecordKind:"hasMany"});return r.addRelationshipChangeFor(e,i,t,null,a),a},DS.ManyToManyChange.createChange=function(e,t,r,n){var i=n.key,a=DS.RelationshipChange._createChange({parentReference:t,childReference:e,firstRecordReference:e,secondRecordReference:t,firstRecordKind:"hasMany",secondRecordKind:"hasMany",store:r,changeType:n.changeType,firstRecordName:i});return r.addRelationshipChangeFor(e,i,t,null,a),a},DS.OneToOneChange.createChange=function(e,t,r,n){var i;n.parentType?i=n.parentType.inverseFor(n.key).name:n.key&&(i=n.key);var a=DS.RelationshipChange._createChange({parentReference:t,childReference:e,firstRecordReference:e,secondRecordReference:t,firstRecordKind:"belongsTo",secondRecordKind:"belongsTo",store:r,changeType:n.changeType,firstRecordName:i});return r.addRelationshipChangeFor(e,i,t,null,a),a},DS.OneToOneChange.maintainInvariant=function(t,r,n,i){if("add"===t.changeType&&r.recordIsMaterialized(n)){var a=r.recordForReference(n),o=e(a,i);if(o){var s=DS.OneToOneChange.createChange(n,o.get("reference"),r,{parentType:t.parentType,hasManyName:t.hasManyName,changeType:"remove",key:t.key});r.addRelationshipChangeFor(n,i,t.parentReference,null,s),s.sync()}}},DS.OneToManyChange.createChange=function(e,t,r,n){var i;n.parentType?(i=n.parentType.inverseFor(n.key).name,DS.OneToManyChange.maintainInvariant(n,r,e,i)):n.key&&(i=n.key);var a=DS.RelationshipChange._createChange({parentReference:t,childReference:e,firstRecordReference:e,secondRecordReference:t,firstRecordKind:"belongsTo",secondRecordKind:"hasMany",store:r,changeType:n.changeType,firstRecordName:i});return r.addRelationshipChangeFor(e,i,t,null,a),a},DS.OneToManyChange.maintainInvariant=function(t,r,n,i){var a=n.record;if("add"===t.changeType&&a){var o=e(a,i);if(o){var s=DS.OneToManyChange.createChange(n,o.get("reference"),r,{parentType:t.parentType,hasManyName:t.hasManyName,changeType:"remove",key:t.key});r.addRelationshipChangeFor(n,i,t.parentReference,null,s),s.sync()}}},DS.OneToManyChange.ensureSameTransaction=function(e){var t=Ember.A();r(e,function(e){t.addObject(e.getSecondRecord()),t.addObject(e.getFirstRecord())});var n=DS.Transaction.ensureSameTransaction(t);r(e,function(e){e.transaction=n})},DS.RelationshipChange.prototype={getSecondRecordName:function(){var e,t=this.secondRecordName;if(!t){if(e=this.secondRecordReference,!e)return;var r=this.firstRecordReference.type,n=r.inverseFor(this.firstRecordName);this.secondRecordName=n.name}return this.secondRecordName},getFirstRecordName:function(){var e=this.firstRecordName;return e},destroy:function(){var e,t=this.childReference,r=this.getFirstRecordName(),n=this.getSecondRecordName(),i=this.store;i.removeRelationshipChangeFor(t,r,this.parentReference,n,this.changeType),(e=this.transaction)&&e.relationshipBecameClean(this)},getByReference:function(e){return this.store,e?e.record?e.record:void 0:e},getSecondRecord:function(){return this.getByReference(this.secondRecordReference)},getFirstRecord:function(){return this.getByReference(this.firstRecordReference)},ensureSameTransaction:function(){var e=this.getFirstRecord(),t=this.getSecondRecord(),r=DS.Transaction.ensureSameTransaction([e,t]);return this.transaction=r,r},callChangeEvents:function(){var t=this.getFirstRecord(),r=this.getSecondRecord(),n=new Ember.OrderedSet;r&&e(r,"isLoaded")&&this.store.recordHasManyDidChange(n,r,this),t&&this.store.recordBelongsToDidChange(n,t,this),n.forEach(function(e){e.adapterDidDirty()})},coalesce:function(){var e=this.store.relationshipChangePairsFor(this.firstRecordReference);r(e,function(e){var t=e.add,r=e.remove;t&&r&&(t.destroy(),r.destroy())})}},DS.RelationshipChangeAdd.prototype=Ember.create(DS.RelationshipChange.create({})),DS.RelationshipChangeRemove.prototype=Ember.create(DS.RelationshipChange.create({})),DS.RelationshipChangeAdd.prototype.changeType="add",DS.RelationshipChangeAdd.prototype.sync=function(){var r=this.getSecondRecordName(),n=this.getFirstRecordName(),i=this.getFirstRecord(),a=this.getSecondRecord(),o=this.ensureSameTransaction();o.relationshipBecameDirty(this),this.callChangeEvents(),a&&i&&("belongsTo"===this.secondRecordKind?a.suspendRelationshipObservers(function(){t(a,r,i)}):"hasMany"===this.secondRecordKind&&a.suspendRelationshipObservers(function(){e(a,r).addObject(i)})),i&&a&&e(i,n)!==a&&("belongsTo"===this.firstRecordKind?i.suspendRelationshipObservers(function(){t(i,n,a)}):"hasMany"===this.firstRecordKind&&i.suspendRelationshipObservers(function(){e(i,n).addObject(a)})),this.coalesce()},DS.RelationshipChangeRemove.prototype.changeType="remove",DS.RelationshipChangeRemove.prototype.sync=function(){var r=this.getSecondRecordName(),n=this.getFirstRecordName(),i=this.getFirstRecord(),a=this.getSecondRecord(),o=this.ensureSameTransaction(i,a,r,n);o.relationshipBecameDirty(this),this.callChangeEvents(),a&&i&&("belongsTo"===this.secondRecordKind?a.suspendRelationshipObservers(function(){t(a,r,null)}):"hasMany"===this.secondRecordKind&&a.suspendRelationshipObservers(function(){e(a,r).removeObject(i)})),i&&e(i,n)&&("belongsTo"===this.firstRecordKind?i.suspendRelationshipObservers(function(){t(i,n,null)}):"hasMany"===this.firstRecordKind&&i.suspendRelationshipObservers(function(){e(i,n).removeObject(a)})),this.coalesce()}}(),function(){var e=Ember.set;Ember.onLoad("Ember.Application",function(t){t.registerInjection?(t.registerInjection({name:"store",before:"controllers",injection:function(t,r,n){r&&"Store"===n&&e(r,"store",t[n].create())}}),t.registerInjection({name:"giveStoreToControllers",after:["store","controllers"],injection:function(e,t,r){if(t&&/^[A-Z].*Controller$/.test(r)){var n=r.charAt(0).toLowerCase()+r.substr(1),i=t.get("store"),a=t.get(n);if(!a)return;a.set("store",i)}}})):t.initializer&&(t.initializer({name:"store",initialize:function(e,t){t.register("store:main",t.Store),e.lookup("store:main")}}),t.initializer({name:"injectStore",initialize:function(e,t){t.inject("controller","store","store:main"),t.inject("route","store","store:main")}}))})}(),function(){function e(e){return function(){throw new Ember.Error("Your serializer "+this.toString()+" does not implement the required method "+e)}}var t=Ember.get,r=(Ember.set,Ember.ArrayPolyfills.map),n=Ember.isNone;DS.Serializer=Ember.Object.extend({init:function(){this.mappings=Ember.Map.create(),this.aliases=Ember.Map.create(),this.configurations=Ember.Map.create(),this.globalConfigurations={}},extract:e("extract"),extractMany:e("extractMany"),extractId:e("extractId"),extractAttribute:e("extractAttribute"),extractHasMany:e("extractHasMany"),extractBelongsTo:e("extractBelongsTo"),extractRecordRepresentation:function(e,t,r,i){var a,o={};return a=i?e.sideload(t,r):e.load(t,r),this.eachEmbeddedHasMany(t,function(t,i){var s=r[this.keyFor(i)];n(s)||this.extractEmbeddedHasMany(e,i,s,a,o)},this),this.eachEmbeddedBelongsTo(t,function(t,i){var s=r[this.keyFor(i)];n(s)||this.extractEmbeddedBelongsTo(e,i,s,a,o)},this),e.prematerialize(a,o),a},extractEmbeddedHasMany:function(e,t,n,i,a){var o=r.call(n,function(r){if(r){var n=this.extractEmbeddedType(t,r),a=this.extractRecordRepresentation(e,n,r,!0),o=this.embeddedType(i.type,t.key);return"always"===o&&(a.parent=i),a}},this);a[t.key]=o},extractEmbeddedBelongsTo:function(e,t,r,n,i){var a=this.extractEmbeddedType(t,r),o=this.extractRecordRepresentation(e,a,r,!0);i[t.key]=o;var s=this.embeddedType(n.type,t.key);"always"===s&&(o.parent=n)},extractEmbeddedType:function(e){return e.type},serialize:function(e,r){r=r||{};var n,i=this.createSerializedForm();return r.includeId&&(n=t(e,"id"))&&this._addId(i,e.constructor,n),r.includeType&&this.addType(i,e.constructor),this.addAttributes(i,e),this.addRelationships(i,e),i},serializeValue:function(e,t){var r=this.transforms?this.transforms[t]:null;return r.serialize(e)},serializeId:function(e){return isNaN(e)?e:+e},addAttributes:function(e,t){t.eachAttribute(function(r,n){this._addAttribute(e,t,r,n.type)},this)},addAttribute:e("addAttribute"),addId:e("addId"),addType:Ember.K,createSerializedForm:function(){return{}},addRelationships:function(e,t){t.eachRelationship(function(r,n){"belongsTo"===n.kind?this._addBelongsTo(e,t,r,n):"hasMany"===n.kind&&this._addHasMany(e,t,r,n)},this)},addBelongsTo:e("addBelongsTo"),addHasMany:e("addHasMany"),keyForAttributeName:function(e,t){return t},primaryKey:function(){return"id"},keyForBelongsTo:function(e,t){return this.keyForAttributeName(e,t)},keyForHasMany:function(e,t){return this.keyForAttributeName(e,t)},materialize:function(e,r,n){var i;Ember.isNone(t(e,"id"))&&(i=n&&n.hasOwnProperty("id")?n.id:this.extractId(e.constructor,r),e.materializeId(i)),this.materializeAttributes(e,r,n),this.materializeRelationships(e,r,n)},deserializeValue:function(e,t){var r=this.transforms?this.transforms[t]:null;return r.deserialize(e)},materializeAttributes:function(e,t,r){e.eachAttribute(function(n,i){r&&r.hasOwnProperty(n)?e.materializeAttribute(n,r[n]):this.materializeAttribute(e,t,n,i.type)},this)},materializeAttribute:function(e,t,r,n){var i=this.extractAttribute(e.constructor,t,r);i=this.deserializeValue(i,n),e.materializeAttribute(r,i)},materializeRelationships:function(e,t,r){e.eachRelationship(function(n,i){if("hasMany"===i.kind)if(r&&r.hasOwnProperty(n)){var a=this._convertPrematerializedHasMany(i.type,r[n]);e.materializeHasMany(n,a)}else this.materializeHasMany(n,e,t,i,r);else if("belongsTo"===i.kind)if(r&&r.hasOwnProperty(n)){var o=this._convertTuple(i.type,r[n]);e.materializeBelongsTo(n,o)}else this.materializeBelongsTo(n,e,t,i,r)},this)},materializeHasMany:function(e,t,r,n){var i=t.constructor,a=this._keyForHasMany(i,n.key),o=this.extractHasMany(i,r,a),s=o;o&&Ember.isArray(o)&&(s=this._convertTuples(n.type,o)),t.materializeHasMany(e,s)},materializeBelongsTo:function(e,t,r,i){var a,o=t.constructor,s=this._keyForBelongsTo(o,i.key),c=null;a=i.options&&i.options.polymorphic?this.extractBelongsToPolymorphic(o,r,s):this.extractBelongsTo(o,r,s),n(a)||(c=this._convertTuple(i.type,a)),t.materializeBelongsTo(e,c)},_extractEmbeddedRelationship:function(e,t,r,n){var i=this["_keyFor"+n](e,r);return this.embeddedType(e,r)?this["extractEmbedded"+n](e,t,i):void 0},_extractEmbeddedBelongsTo:function(e,t,r){return this._extractEmbeddedRelationship(e,t,r,"BelongsTo")},_extractEmbeddedHasMany:function(e,t,r){return this._extractEmbeddedRelationship(e,t,r,"HasMany")},_convertPrematerializedHasMany:function(e,t){var r;return r="string"==typeof t?t:this._convertTuples(e,t)},_convertTuples:function(e,t){return r.call(t,function(t){return this._convertTuple(e,t)},this)},_convertTuple:function(e,t){var r;return"object"==typeof t?DS.Model.detect(t.type)?t:(r=this.typeFromAlias(t.type),{id:t.id,type:r}):{id:t,type:e}},_primaryKey:function(e){var t=this.configurationForType(e),r=t&&t.primaryKey;return r?r:this.primaryKey(e)},_addAttribute:function(e,r,n,i){var a=this._keyForAttributeName(r.constructor,n),o=t(r,n);this.addAttribute(e,a,this.serializeValue(o,i))},_addId:function(e,t,r){var n=this._primaryKey(t);this.addId(e,n,this.serializeId(r))},_keyForAttributeName:function(e,t){return this._keyFromMappingOrHook("keyForAttributeName",e,t)},_keyForBelongsTo:function(e,t){return this._keyFromMappingOrHook("keyForBelongsTo",e,t)},keyFor:function(e){var t=e.parentType,r=e.key;switch(e.kind){case"belongsTo":return this._keyForBelongsTo(t,r);case"hasMany":return this._keyForHasMany(t,r)}},_keyForHasMany:function(e,t){return this._keyFromMappingOrHook("keyForHasMany",e,t)},_addBelongsTo:function(e,t,r,n){var i=this._keyForBelongsTo(t.constructor,r);this.addBelongsTo(e,t,i,n)},_addHasMany:function(e,t,r,n){var i=this._keyForHasMany(t.constructor,r);this.addHasMany(e,t,i,n)},_keyFromMappingOrHook:function(e,t,r){var n=this.mappingOption(t,r,"key");return n?n:this[e](t,r)},registerTransform:function(e,t){this.transforms[e]=t},registerEnumTransform:function(e,t){var r={deserialize:function(e){return Ember.A(t).objectAt(e)},serialize:function(e){return Ember.EnumerableUtils.indexOf(t,e)},values:t};this.registerTransform(e,r)},map:function(e,t){this.mappings.set(e,t)},configure:function(e,t){if(e&&!t)return Ember.merge(this.globalConfigurations,e),void 0;var r,n;t.alias&&(n=t.alias,this.aliases.set(n,e),delete t.alias),r=Ember.create(this.globalConfigurations),Ember.merge(r,t),this.configurations.set(e,r)},typeFromAlias:function(e){return this._completeAliases(),this.aliases.get(e)},mappingForType:function(e){return this._reifyMappings(),this.mappings.get(e)||{}},configurationForType:function(e){return this._reifyConfigurations(),this.configurations.get(e)||this.globalConfigurations},_completeAliases:function(){this._pluralizeAliases(),this._reifyAliases()},_pluralizeAliases:function(){if(!this._didPluralizeAliases){var e,t=this.aliases,r=this.aliases.sideloadMapping,n=this;t.forEach(function(r,i){e=n.pluralize(r),t.set(e,i)}),r&&(r.forEach(function(e,r){t.set(e,r)}),delete this.aliases.sideloadMapping),this._didPluralizeAliases=!0}},_reifyAliases:function(){if(!this._didReifyAliases){var e,t=this.aliases,r=Ember.Map.create();t.forEach(function(t,n){"string"==typeof n?(e=Ember.get(Ember.lookup,n),r.set(t,e)):r.set(t,n)}),this.aliases=r,this._didReifyAliases=!0}},_reifyMappings:function(){if(!this._didReifyMappings){var e=this.mappings,t=Ember.Map.create();e.forEach(function(e,r){if("string"==typeof e){var n=Ember.get(Ember.lookup,e);t.set(n,r)}else t.set(e,r)}),this.mappings=t,this._didReifyMappings=!0}},_reifyConfigurations:function(){if(!this._didReifyConfigurations){var e=this.configurations,t=Ember.Map.create();e.forEach(function(e,r){if("string"==typeof e&&"plurals"!==e){var n=Ember.get(Ember.lookup,e);t.set(n,r)}else t.set(e,r)}),this.configurations=t,this._didReifyConfigurations=!0}},mappingOption:function(e,t,r){var n=this.mappingForType(e)[t];return n&&n[r]},configOption:function(e,t){var r=this.configurationForType(e);return r[t]},embeddedType:function(e,t){return this.mappingOption(e,t,"embedded")},eachEmbeddedRecord:function(e,t,r){this.eachEmbeddedBelongsToRecord(e,t,r),this.eachEmbeddedHasManyRecord(e,t,r)},eachEmbeddedBelongsToRecord:function(e,r,n){this.eachEmbeddedBelongsTo(e.constructor,function(i,a,o){var s=t(e,i);s&&r.call(n,s,o)})},eachEmbeddedHasManyRecord:function(e,r,n){this.eachEmbeddedHasMany(e.constructor,function(i,a,o){for(var s=t(e,i),c=0,d=t(s,"length");d>c;c++)r.call(n,s.objectAt(c),o)})},eachEmbeddedHasMany:function(e,t,r){this.eachEmbeddedRelationship(e,"hasMany",t,r)},eachEmbeddedBelongsTo:function(e,t,r){this.eachEmbeddedRelationship(e,"belongsTo",t,r)},eachEmbeddedRelationship:function(e,t,r,n){e.eachRelationship(function(i,a){var o=this.embeddedType(e,i);o&&a.kind===t&&r.call(n,i,a,o)},this)},pluralize:function(e){var t=this.configurations.get("plurals");return t&&t[e]||e+"s"},singularize:function(e){var t=this.configurations.get("plurals");if(t)for(var r in t)if(t[r]===e)return r;return e.lastIndexOf("s")===e.length-1?e.substring(0,e.length-1):e}})}(),function(){var e=Ember.isNone,t=Ember.isEmpty;DS.JSONTransforms={string:{deserialize:function(t){return e(t)?null:String(t)},serialize:function(t){return e(t)?null:String(t)}},number:{deserialize:function(e){return t(e)?null:Number(e)},serialize:function(e){return t(e)?null:Number(e)}},"boolean":{deserialize:function(e){var t=typeof e;return"boolean"===t?e:"string"===t?null!==e.match(/^true$|^t$|^1$/i):"number"===t?1===e:!1},serialize:function(e){return Boolean(e)}},date:{deserialize:function(e){var t=typeof e;return"string"===t?new Date(Ember.Date.parse(e)):"number"===t?new Date(e):null===e||void 0===e?e:null},serialize:function(e){if(e instanceof Date){var t=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],r=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],n=function(e){return 10>e?"0"+e:""+e},i=e.getUTCFullYear(),a=e.getUTCMonth(),o=e.getUTCDate(),s=e.getUTCDay(),c=e.getUTCHours(),d=e.getUTCMinutes(),u=e.getUTCSeconds(),h=t[s],l=n(o),f=r[a];return h+", "+l+" "+f+" "+i+" "+n(c)+":"+n(d)+":"+n(u)+" GMT"}return null}}}}(),function(){var e=Ember.get;Ember.set,DS.JSONSerializer=DS.Serializer.extend({init:function(){this._super(),e(this,"transforms")||this.set("transforms",DS.JSONTransforms),this.sideloadMapping=Ember.Map.create(),this.metadataMapping=Ember.Map.create(),this.configure({meta:"meta",since:"since"})},configure:function(t,r){var n;if(t&&!r){for(n in t)this.metadataMapping.set(e(t,n),n);return this._super(t)}var i,a=r.sideloadAs;a&&(i=this.aliases.sideloadMapping||Ember.Map.create(),i.set(a,t),this.aliases.sideloadMapping=i,delete r.sideloadAs),this._super.apply(this,arguments)},addId:function(e,t,r){e[t]=r},addAttribute:function(e,t,r){e[t]=r},extractAttribute:function(e,t,r){var n=this._keyForAttributeName(e,r);return t[n]},extractId:function(e,t){var r=this._primaryKey(e);return t.hasOwnProperty(r)?t[r]+"":null},extractHasMany:function(e,t,r){return t[r]},extractBelongsTo:function(e,t,r){return t[r]},extractBelongsToPolymorphic:function(e,t,r){var n,i=this.keyForPolymorphicId(r),a=t[i];return a?(n=this.keyForPolymorphicType(r),{id:a,type:t[n]}):null},addBelongsTo:function(t,r,n,i){var a,o,s,c=r.constructor,d=i.key,u=null,h=i.options&&i.options.polymorphic;this.embeddedType(c,d)?((a=e(r,d))&&(u=this.serialize(a,{includeId:!0,includeType:h})),t[n]=u):(o=e(r,i.key),s=e(o,"id"),i.options&&i.options.polymorphic&&!Ember.isNone(s)?this.addBelongsToPolymorphic(t,n,s,o.constructor):t[n]=void 0===s?null:this.serializeId(s))},addBelongsToPolymorphic:function(e,t,r,n){var i=this.keyForPolymorphicId(t),a=this.keyForPolymorphicType(t);e[i]=r,e[a]=this.rootForType(n)},addHasMany:function(t,r,n,i){var a,o,s=r.constructor,c=i.key,d=[],u=i.options&&i.options.polymorphic;o=this.embeddedType(s,c),"always"===o&&(a=e(r,c),a.forEach(function(e){d.push(this.serialize(e,{includeId:!0,includeType:u}))},this),t[n]=d)},addType:function(e,t){var r=this.keyForEmbeddedType();e[r]=this.rootForType(t)},extract:function(e,t,r,n){var i=this.rootForType(r);this.sideload(e,r,t,i),this.extractMeta(e,r,t),t[i]&&(n&&e.updateId(n,t[i]),this.extractRecordRepresentation(e,r,t[i]))},extractMany:function(e,t,r,n){var i=this.rootForType(r);if(i=this.pluralize(i),this.sideload(e,r,t,i),this.extractMeta(e,r,t),t[i]){var a=t[i],o=[];n&&(n=n.toArray());for(var s=0;a.length>s;s++){n&&e.updateId(n[s],a[s]);var c=this.extractRecordRepresentation(e,r,a[s]);o.push(c)}e.populateArray(o)}},extractMeta:function(e,t,r){var n,i=this.configOption(t,"meta"),a=r;i&&r[i]&&(a=r[i]),this.metadataMapping.forEach(function(r,i){(n=a[r])&&e.metaForType(t,i,n)})},extractEmbeddedType:function(e,t){var r=e.type;if(e.options&&e.options.polymorphic){var n=this.keyFor(e),i=this.keyForEmbeddedType(n);r=this.typeFromAlias(t[i]),delete t[i]}return r},sideload:function(e,t,r,n){var i;this.configureSideloadMappingForType(t);for(var a in r)r.hasOwnProperty(a)&&a!==n&&!this.metadataMapping.get(a)&&(i=this.typeFromAlias(a),this.loadValue(e,i,r[a]))},configureSideloadMappingForType:function(e,t){t||(t=Ember.A([])),t.pushObject(e),e.eachRelatedType(function(e){if(!t.contains(e)){var r=this.defaultSideloadRootForType(e);this.aliases.set(r,e),this.configureSideloadMappingForType(e,t)}},this)},loadValue:function(e,t,r){if(r instanceof Array)for(var n=0;r.length>n;n++)e.sideload(t,r[n]);else e.sideload(t,r)},keyForPolymorphicId:Ember.K,keyForPolymorphicType:Ember.K,keyForEmbeddedType:function(){return"type"},rootForType:function(e){var t=e.toString(),r=t.split("."),n=r[r.length-1];return n.replace(/([A-Z])/g,"_$1").toLowerCase().slice(1)},defaultSideloadRootForType:function(e){return this.pluralize(this.rootForType(e))}})}(),function(){function e(e){return{load:function(t,r,n){return e.load(t,r,n)},loadMany:function(t,r){return e.loadMany(t,r)},updateId:function(t,r){return e.updateId(t,r)},populateArray:Ember.K,sideload:function(t,r){return e.load(t,r)},sideloadMany:function(t,r){return e.loadMany(t,r)},prematerialize:function(e,t){e.prematerialized=t},metaForType:function(t,r,n){e.metaForType(t,r,n)}}}var t=Ember.get,r=Ember.set,n=Ember.merge;DS.loaderFor=e,DS.Adapter=Ember.Object.extend(DS._Mappable,{init:function(){var e=t(this,"serializer");Ember.Object.detect(e)&&(e=e.create(),r(this,"serializer",e)),this._attributesMap=this.createInstanceMapFor("attributes"),this._configurationsMap=this.createInstanceMapFor("configurations"),this._outstandingOperations=new Ember.MapWithDefault({defaultValue:function(){return 0}}),this._dependencies=new Ember.MapWithDefault({defaultValue:function(){return new Ember.OrderedSet}}),this.registerSerializerTransforms(this.constructor,e,{}),this.registerSerializerMappings(e)},load:function(r,n,i){var a=e(r);t(this,"serializer").extractRecordRepresentation(a,n,i)},didCreateRecord:function(e,r,n,i){if(e.didSaveRecord(n),i){var a=DS.loaderFor(e);a.load=function(t,r,i){return e.updateId(n,r),e.load(t,r,i)},t(this,"serializer").extract(a,i,r)}},didCreateRecords:function(e,r,n,i){if(n.forEach(function(t){e.didSaveRecord(t)},this),i){var a=DS.loaderFor(e);t(this,"serializer").extractMany(a,i,r,n)}},didSaveRecord:function(e,r,n,i){e.didSaveRecord(n);var a=t(this,"serializer");if(a.eachEmbeddedRecord(n,function(t,r){"load"!==r&&this.didSaveRecord(e,t.constructor,t)},this),i){var o=DS.loaderFor(e);a.extract(o,i,r)}},didUpdateRecord:function(){this.didSaveRecord.apply(this,arguments)},didDeleteRecord:function(){this.didSaveRecord.apply(this,arguments)},didSaveRecords:function(e,r,n,i){if(n.forEach(function(t){e.didSaveRecord(t)},this),i){var a=DS.loaderFor(e);t(this,"serializer").extractMany(a,i,r)}},didUpdateRecords:function(){this.didSaveRecords.apply(this,arguments)},didDeleteRecords:function(){this.didSaveRecords.apply(this,arguments)},didFindRecord:function(e,r,n,i){var a=DS.loaderFor(e);a.load=function(t,r,n){return n=n||{},n.id=i,e.load(t,r,n)},t(this,"serializer").extract(a,n,r)},didFindAll:function(e,r,n){var i=DS.loaderFor(e),a=t(this,"serializer");e.didUpdateAll(r),a.extractMany(i,n,r)},didFindQuery:function(e,r,n,i){var a=DS.loaderFor(e);a.populateArray=function(e){i.load(e)},t(this,"serializer").extractMany(a,n,r)},didFindMany:function(e,r,n){var i=DS.loaderFor(e);t(this,"serializer").extractMany(i,n,r)},didError:function(e,t,r){e.recordWasError(r)},dirtyRecordsForAttributeChange:function(e,t,r,n,i){n!==i&&this.dirtyRecordsForRecordChange(e,t)},dirtyRecordsForRecordChange:function(e,t){e.add(t)},dirtyRecordsForBelongsToChange:function(e,t){this.dirtyRecordsForRecordChange(e,t)},dirtyRecordsForHasManyChange:function(e,t){this.dirtyRecordsForRecordChange(e,t)},registerSerializerTransforms:function(e,t,r){var n,i,a=e._registeredTransforms,o=e._registeredEnumTransforms;for(i in a)!a.hasOwnProperty(i)||i in r||(r[i]=!0,t.registerTransform(i,a[i]));for(i in o)!o.hasOwnProperty(i)||i in r||(r[i]=!0,t.registerEnumTransform(i,o[i]));(n=e.superclass)&&this.registerSerializerTransforms(n,t,r)},registerSerializerMappings:function(e){var t=this._attributesMap,r=this._configurationsMap;t.forEach(e.map,e),r.forEach(e.configure,e)},find:null,serializer:DS.JSONSerializer,registerTransform:function(e,r){t(this,"serializer").registerTransform(e,r)},registerEnumTransform:function(e,r){t(this,"serializer").registerEnumTransform(e,r)},generateIdForRecord:null,materialize:function(e,r,n){t(this,"serializer").materialize(e,r,n)},serialize:function(e,r){return t(this,"serializer").serialize(e,r)},extractId:function(e,r){return t(this,"serializer").extractId(e,r)},groupByType:function(e){var t=Ember.MapWithDefault.create({defaultValue:function(){return Ember.OrderedSet.create()}});return e.forEach(function(e){t.get(e.constructor).add(e)}),t},commit:function(e,t){this.save(e,t)},save:function(e,t){function r(e){var t=Ember.OrderedSet.create();return e.forEach(function(e){n.shouldSave(e)&&t.add(e)}),t}var n=this;this.groupByType(t.created).forEach(function(t,n){this.createRecords(e,t,r(n))},this),this.groupByType(t.updated).forEach(function(t,n){this.updateRecords(e,t,r(n))},this),this.groupByType(t.deleted).forEach(function(t,n){this.deleteRecords(e,t,r(n))},this)},shouldSave:Ember.K,createRecords:function(e,t,r){r.forEach(function(r){this.createRecord(e,t,r)},this)},updateRecords:function(e,t,r){r.forEach(function(r){this.updateRecord(e,t,r)},this)},deleteRecords:function(e,t,r){r.forEach(function(r){this.deleteRecord(e,t,r)},this)},findMany:function(e,t,r){r.forEach(function(r){this.find(e,t,r)},this)}}),DS.Adapter.reopenClass({registerTransform:function(e,t){var r=this._registeredTransforms||{};r[e]=t,this._registeredTransforms=r},registerEnumTransform:function(e,t){var r=this._registeredEnumTransforms||{};r[e]=t,this._registeredEnumTransforms=r},map:DS._Mappable.generateMapFunctionFor("attributes",function(e,t,r){var i=r.get(e);n(i,t)}),configure:DS._Mappable.generateMapFunctionFor("configurations",function(e,t,r){var i=r.get(e),a=t&&t.mappings;a&&(this.map(e,a),delete t.mappings),n(i,t)}),resolveMapConflict:function(e,t){return n(t,e),t}})}(),function(){var e=Ember.get;Ember.set,DS.FixtureSerializer=DS.Serializer.extend({deserializeValue:function(e){return e},serializeValue:function(e){return e},addId:function(e,t,r){e[t]=r},addAttribute:function(e,t,r){e[t]=r},addBelongsTo:function(t,r,n,i){var a=e(r,i.key+".id");Ember.isNone(a)||(t[n]=a)},addHasMany:function(t,r,n,i){var a=e(r,i.key).map(function(e){return e.get("id")});t[i.key]=a},extract:function(e,t,r,n){n&&e.updateId(n,t),this.extractRecordRepresentation(e,r,t)},extractMany:function(e,t,r,n){var i=t,a=[];n&&(n=n.toArray());for(var o=0;i.length>o;o++){n&&e.updateId(n[o],i[o]);var s=this.extractRecordRepresentation(e,r,i[o]);a.push(s)}e.populateArray(a)},extractId:function(e,t){var r=this._primaryKey(e);
return t.hasOwnProperty(r)?t[r]+"":null},extractAttribute:function(e,t,r){var n=this._keyForAttributeName(e,r);return t[n]},extractHasMany:function(e,t,r){return t[r]},extractBelongsTo:function(e,t,r){return t[r]},extractBelongsToPolymorphic:function(e,t,r){var n,i=this.keyForPolymorphicId(r),a=t[i];return a?(n=this.keyForPolymorphicType(r),{id:a,type:t[n]}):null},keyForPolymorphicId:function(e){return e},keyForPolymorphicType:function(e){return e+"_type"}})}(),function(){var e=Ember.get,t=Ember.String.fmt,r=Ember.get(window,"JSON.stringify")||function(e){return e.toString()};DS.FixtureAdapter=DS.Adapter.extend({simulateRemoteResponse:!0,latency:50,serializer:DS.FixtureSerializer,fixturesForType:function(e){if(e.FIXTURES){var n=Ember.A(e.FIXTURES);return n.map(function(e){if(!e.id)throw new Error(t("the id property must be defined for fixture %@",[r(e)]));return e.id=e.id+"",e})}return null},queryFixtures:function(){},updateFixtures:function(e,t){e.FIXTURES||(e.FIXTURES=[]);var r=e.FIXTURES;this.deleteLoadedFixture(e,t),r.push(t)},mockJSON:function(e,t){return this.serialize(t,{includeId:!0})},generateIdForRecord:function(e,t){return Ember.guidFor(t)},find:function(e,t,r){var n,i=this.fixturesForType(t);i&&(n=Ember.A(i).findProperty("id",r)),n&&this.simulateRemoteCall(function(){this.didFindRecord(e,t,n,r)},this)},findMany:function(e,t,r){var n=this.fixturesForType(t);n&&(n=n.filter(function(e){return-1!==r.indexOf(e.id)})),n&&this.simulateRemoteCall(function(){this.didFindMany(e,t,n)},this)},findAll:function(e,t){var r=this.fixturesForType(t);this.simulateRemoteCall(function(){this.didFindAll(e,t,r)},this)},findQuery:function(e,t,r,n){var i=this.fixturesForType(t);i=this.queryFixtures(i,r,t),i&&this.simulateRemoteCall(function(){this.didFindQuery(e,t,i,n)},this)},createRecord:function(e,t,r){var n=this.mockJSON(t,r);this.updateFixtures(t,n),this.simulateRemoteCall(function(){this.didCreateRecord(e,t,r,n)},this)},updateRecord:function(e,t,r){var n=this.mockJSON(t,r);this.updateFixtures(t,n),this.simulateRemoteCall(function(){this.didUpdateRecord(e,t,r,n)},this)},deleteRecord:function(e,t,r){var n=this.mockJSON(t,r);this.deleteLoadedFixture(t,n),this.simulateRemoteCall(function(){this.didDeleteRecord(e,t,r)},this)},deleteLoadedFixture:function(e,t){var r=this.findExistingFixture(e,t);if(r){var n=e.FIXTURES.indexOf(r);return e.FIXTURES.splice(n,1),!0}},findExistingFixture:function(e,t){var r=this.fixturesForType(e),n=this.extractId(e,t);return this.findFixtureById(r,n)},findFixtureById:function(t,r){return Ember.A(t).find(function(t){return""+e(t,"id")==""+r?!0:!1})},simulateRemoteCall:function(t,r){e(this,"simulateRemoteResponse")?Ember.run.later(r,t,e(this,"latency")):Ember.run.once(r,t)}})}(),function(){var e=Ember.get;DS.RESTSerializer=DS.JSONSerializer.extend({keyForAttributeName:function(e,t){return Ember.String.decamelize(t)},keyForBelongsTo:function(e,t){var r=this.keyForAttributeName(e,t);return this.embeddedType(e,t)?r:r+"_id"},keyForHasMany:function(e,t){var r=this.keyForAttributeName(e,t);return this.embeddedType(e,t)?r:this.singularize(r)+"_ids"},keyForPolymorphicId:function(e){return e},keyForPolymorphicType:function(e){return e.replace(/_id$/,"_type")},extractValidationErrors:function(t,r){var n={};return e(t,"attributes").forEach(function(e){var i=this._keyForAttributeName(t,e);r.errors.hasOwnProperty(i)&&(n[e]=r.errors[i])},this),n}})}(),function(){var e=Ember.get;Ember.set,DS.RESTAdapter=DS.Adapter.extend({namespace:null,bulkCommit:!1,since:"since",serializer:DS.RESTSerializer,init:function(){this._super.apply(this,arguments)},shouldSave:function(t){var r=e(t,"reference");return!r.parent},dirtyRecordsForRecordChange:function(e,t){this._dirtyTree(e,t)},dirtyRecordsForHasManyChange:function(t,r,n){var i=e(this,"serializer").embeddedType(r.constructor,n.secondRecordName);"always"===i&&(n.childReference.parent=n.parentReference,this._dirtyTree(t,r))},_dirtyTree:function(t,r){t.add(r),e(this,"serializer").eachEmbeddedRecord(r,function(e,r){"always"===r&&(t.has(e)||this._dirtyTree(t,e))},this);var n=r.get("reference");if(n.parent){var i=e(r,"store"),a=i.recordForReference(n.parent);this._dirtyTree(t,a)}},createRecord:function(e,t,r){var n=this.rootForType(t),i={};i[n]=this.serialize(r,{includeId:!0}),this.ajax(this.buildURL(n),"POST",{data:i,success:function(n){Ember.run(this,function(){this.didCreateRecord(e,t,r,n)})},error:function(n){this.didError(e,t,r,n)}})},createRecords:function(t,r,n){if(e(this,"bulkCommit")===!1)return this._super(t,r,n);var i=this.rootForType(r),a=this.pluralize(i),o={};o[a]=[],n.forEach(function(e){o[a].push(this.serialize(e,{includeId:!0}))},this),this.ajax(this.buildURL(i),"POST",{data:o,success:function(e){Ember.run(this,function(){this.didCreateRecords(t,r,n,e)})}})},updateRecord:function(t,r,n){var i=e(n,"id"),a=this.rootForType(r),o={};o[a]=this.serialize(n),this.ajax(this.buildURL(a,i),"PUT",{data:o,success:function(e){Ember.run(this,function(){this.didUpdateRecord(t,r,n,e)})},error:function(e){this.didError(t,r,n,e)}})},updateRecords:function(t,r,n){if(e(this,"bulkCommit")===!1)return this._super(t,r,n);var i=this.rootForType(r),a=this.pluralize(i),o={};o[a]=[],n.forEach(function(e){o[a].push(this.serialize(e,{includeId:!0}))},this),this.ajax(this.buildURL(i,"bulk"),"PUT",{data:o,success:function(e){Ember.run(this,function(){this.didUpdateRecords(t,r,n,e)})}})},deleteRecord:function(t,r,n){var i=e(n,"id"),a=this.rootForType(r);this.ajax(this.buildURL(a,i),"DELETE",{success:function(e){Ember.run(this,function(){this.didDeleteRecord(t,r,n,e)})},error:function(e){this.didError(t,r,n,e)}})},deleteRecords:function(t,r,n){if(e(this,"bulkCommit")===!1)return this._super(t,r,n);var i=this.rootForType(r),a=this.pluralize(i),o=e(this,"serializer"),s={};s[a]=[],n.forEach(function(t){s[a].push(o.serializeId(e(t,"id")))}),this.ajax(this.buildURL(i,"bulk"),"DELETE",{data:s,success:function(e){Ember.run(this,function(){this.didDeleteRecords(t,r,n,e)})}})},find:function(e,t,r){var n=this.rootForType(t);this.ajax(this.buildURL(n,r),"GET",{success:function(n){Ember.run(this,function(){this.didFindRecord(e,t,n,r)})}})},findAll:function(e,t,r){var n=this.rootForType(t);this.ajax(this.buildURL(n),"GET",{data:this.sinceQuery(r),success:function(r){Ember.run(this,function(){this.didFindAll(e,t,r)})}})},findQuery:function(e,t,r,n){var i=this.rootForType(t);this.ajax(this.buildURL(i),"GET",{data:r,success:function(r){Ember.run(this,function(){this.didFindQuery(e,t,r,n)})}})},findMany:function(e,t,r){var n=this.rootForType(t);r=this.serializeIds(r),this.ajax(this.buildURL(n),"GET",{data:{ids:r},success:function(r){Ember.run(this,function(){this.didFindMany(e,t,r)})}})},serializeIds:function(t){var r=e(this,"serializer");return Ember.EnumerableUtils.map(t,function(e){return r.serializeId(e)})},didError:function(t,r,n,i){if(422===i.status){var a=JSON.parse(i.responseText),o=e(this,"serializer"),s=o.extractValidationErrors(r,a);t.recordWasInvalid(n,s)}else this._super.apply(this,arguments)},ajax:function(e,t,r){r.url=e,r.type=t,r.dataType="json",r.contentType="application/json; charset=utf-8",r.context=this,r.data&&"GET"!==t&&(r.data=JSON.stringify(r.data)),jQuery.ajax(r)},url:"",rootForType:function(t){var r=e(this,"serializer");return r.rootForType(t)},pluralize:function(t){var r=e(this,"serializer");return r.pluralize(t)},buildURL:function(e,t){var r=[this.url];return Ember.isNone(this.namespace)||r.push(this.namespace),r.push(this.pluralize(e)),void 0!==t&&r.push(t),r.join("/")},sinceQuery:function(t){var r={};return r[e(this,"since")]=t,t?r:null}})}(),function(){DS.ArrayLoader=function(e,t,r){return function(n){var i;i=n instanceof DS.ArrayProcessor?n.array:n;var a=i.map(function(r){return e.load(t,r)});r.load(a)}}}(),function(){DS.HasManyLoader=function(e,t,r){return function(n){var i;i=n instanceof DS.ArrayProcessor?n.array:n;var a=i.map(function(e){return e.id});e.loadMany(r.type,i),e.loadHasMany(t,r.key,a)}}}(),function(){DS.ObjectLoader=function(e,t){return function(r){var n;n=r instanceof DS.DataProcessor?r.json:r,e.load(t,n)}}}(),function(){function e(e){this.array=e}var r=t("json-normalizer"),n=r.camelizeKeys;e.prototype={constructor:e,camelizeKeys:function(){for(var e=this.array,t=0,r=e.length;r>t;t++)e[t]=n(e[t]);return this},munge:function(e,t){for(var r=this.array,n=0,i=r.length;i>n;n++)e.call(t,r[n]);return this}},DS.ArrayProcessor=e}(),function(){function e(){n.apply(this,arguments)}var r=t("json-normalizer"),n=r.Processor;e.prototype=Ember.create(n.prototype),Ember.merge(e.prototype,{munge:function(e,t){return e.call(t,this.json),this},applyTransforms:Ember.K}),DS.DataProcessor=e}(),function(){function e(e,t){return function(r){e.didSaveRecord(t,r)}}var t=Ember.String.capitalize,r={};DS.registerTransforms=function(e,t){r[e]=t},DS.clearTransforms=function(){r={}},DS.clearTransforms(),DS.process=function(e){return"array"===Ember.typeOf(e)?new DS.ArrayProcessor(e):new DS.DataProcessor(e)};var n=DS.Serializer.extend({extractId:function(e,t){return t.id+""},extractAttribute:function(e,t,r){return t[r]},extractHasMany:function(e,t,r){return t[r]},extractBelongsTo:function(e,t,r){return t[r]},deserializeValue:function(e){return e},serializeValue:function(e){return e}});DS.BasicAdapter=DS.Adapter.extend({serializer:n,find:function(e,t,r){var n=t.sync;n.find(r,DS.ObjectLoader(e,t))},findQuery:function(e,t,r,n){var i=t.sync;i.query(r,DS.ArrayLoader(e,t,n))},findHasMany:function(e,r,n,i){var a=t(n.key),o=r.constructor.sync,s=DS.HasManyLoader(e,r,n),c={relationship:n.key,data:i};o["find"+a]?o["find"+a](r,c,s):o.findHasMany&&o.findHasMany(r,c,s)},createRecord:function(t,r,n){var i=r.sync;i.createRecord(n,e(t,n))},updateRecord:function(t,r,n){var i=r.sync;i.updateRecord(n,e(t,n))},deleteRecord:function(t,r,n){var i=r.sync;i.deleteRecord(n,e(t,n))}})}()})(),"undefined"==typeof location||"localhost"!==location.hostname&&"127.0.0.1"!==location.hostname||console.warn("You are running a production build of Ember on localhost and won't receive detailed error messages. If you want full error messages please use the non-minified build provided on the Ember website.");
});
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("email-saver/public/js/index.js", function(exports, require, module){
exports = module.exports;

require Ember = require('ember');
});
require.alias("kelonye-ember/index.js", "email-saver/deps/ember/index.js");
require.alias("kelonye-ember/lib/ember.js", "email-saver/deps/ember/lib/ember.js");
require.alias("kelonye-ember/lib/handlebars.js", "email-saver/deps/ember/lib/handlebars.js");
require.alias("kelonye-ember/index.js", "ember/index.js");
require.alias("component-jquery/index.js", "kelonye-ember/deps/jquery/index.js");

require.alias("kelonye-ember-data/index.js", "email-saver/deps/ember-data/index.js");
require.alias("kelonye-ember-data/index.js", "ember-data/index.js");
require.alias("kelonye-ember/index.js", "kelonye-ember-data/deps/ember/index.js");
require.alias("kelonye-ember/lib/ember.js", "kelonye-ember-data/deps/ember/lib/ember.js");
require.alias("kelonye-ember/lib/handlebars.js", "kelonye-ember-data/deps/ember/lib/handlebars.js");
require.alias("component-jquery/index.js", "kelonye-ember/deps/jquery/index.js");

require.alias("component-indexof/index.js", "email-saver/deps/indexof/index.js");
require.alias("component-indexof/index.js", "indexof/index.js");

