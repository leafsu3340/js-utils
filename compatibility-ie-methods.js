;
(function (window, document) {
  /*
   * JSON ES5 extend
   */
  // if (!window.JSON) {
  //   window.JSON = {
  //     parse: function (jsonStr) {
  //       if(!jsonStr){
  //         return eval('({})');
  //       }
  //       return eval('(' + jsonStr + ')');
  //     },
  //     stringify: function (jsonObj) {
  //       var result = '',
  //         curVal;
  //       if (jsonObj === null) {
  //         return String(jsonObj);
  //       }
  //       switch (typeof jsonObj) {
  //         case 'number':
  //         case 'boolean':
  //           return String(jsonObj);
  //         case 'string':
  //           return '"' + jsonObj + '"';
  //         case 'undefined':
  //         case 'function':
  //           return undefined;
  //       }

  //       switch (Object.prototype.toString.call(jsonObj)) {
  //         case '[object Array]':
  //           result += '[';
  //           for (var i = 0, len = jsonObj.length; i < len; i++) {
  //             curVal = JSON.stringify(jsonObj[i]);
  //             result += (curVal === undefined ? null : curVal) + ",";
  //           }
  //           if (result !== '[') {
  //             result = result.slice(0, -1);
  //           }
  //           result += ']';
  //           return result;
  //         case '[object Date]':
  //           return '"' + (jsonObj.toJSON ? jsonObj.toJSON() : jsonObj.toString()) + '"';
  //         case '[object RegExp]':
  //           return "{}";
  //         case '[object Object]':
  //           result += '{';
  //           for (i in jsonObj) {
  //             if (jsonObj.hasOwnProperty(i)) {
  //               curVal = JSON.stringify(jsonObj[i]);
  //               if (curVal !== undefined) {
  //                 result += '"' + i + '":' + curVal + ',';
  //               }
  //             }
  //           }
  //           if (result !== '{') {
  //             result = result.slice(0, -1);
  //           }
  //           result += '}';
  //           return result;

  //         case '[object String]':
  //           return '"' + jsonObj.toString() + '"';
  //         case '[object Number]':
  //         case '[object Boolean]':
  //           return jsonObj.toString();
  //       }
  //     }
  //   };
  // }

  /*
   * Object ES5 extend
   */
  if (!Object.create) {
    Object.create = function (o) {
      if (arguments.length > 1) {
        throw new Error('Object.create implementation only accepts the first parameter.');
      }

      function F() {}
      F.prototype = o;
      return new F();
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      if (o !== Object(o)) {
        throw new TypeError('Object.keys called on a non-object');
      }
      var k = [],
        p;
      for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o, p)) {
          k.push(p);
        }
      }
      return k;
    };
  }

  /*
   * Date ES5 extend
   */
  if (!Date.now) {
    Date.now = function now() {
      return (new Date).valueOf();
    };
  }


  /*
   * Function ES5 extend
   */
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ?
            this :
            oThis || window,
            aArgs.concat(Array.prototype.slice.call(arguments)));
        };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  /*
   * String ES5 extend
   */
  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  /*
   * Array ES5 extend
   */
  if (!Array.isArray) {
    Array.isArray = function (vArg) {
      return Object.prototype.toString.call(vArg) === "[object Array]";
    };
  }

  if (typeof Array.prototype.forEach != "function") {
    Array.prototype.forEach = function (fn, scope) {
      var i, len;
      for (i = 0, len = this.length; i < len; ++i) {
        if (i in this) {
          fn.call(scope, this[i], i, this);
        }
      }
    };
  }

  if (typeof Array.prototype.map != "function") {
    Array.prototype.map = function (fn, context) {
      var arr = [];
      if (typeof fn === "function") {
        for (var k = 0, length = this.length; k < length; k++) {
          arr.push(fn.call(context, this[k], k, this));
        }
      }
      return arr;
    };
  }

  if (typeof Array.prototype.filter != "function") {
    Array.prototype.filter = function (fn, context) {
      var arr = [];
      if (typeof fn === "function") {
        for (var k = 0, length = this.length; k < length; k++) {
          fn.call(context, this[k], k, this) && arr.push(this[k]);
        }
      }
      return arr;
    };
  }

  if (typeof Array.prototype.some != "function") {
    Array.prototype.some = function (fn, context) {
      var passed = false;
      if (typeof fn === "function") {
        for (var k = 0, length = this.length; k < length; k++) {
          if (passed === true) break;
          passed = !!fn.call(context, this[k], k, this);
        }
      }
      return passed;
    };
  }

  if (typeof Array.prototype.every != "function") {
    Array.prototype.every = function (fn, context) {
      var passed = true;
      if (typeof fn === "function") {
        for (var k = 0, length = this.length; k < length; k++) {
          if (passed === false) break;
          passed = !!fn.call(context, this[k], k, this);
        }
      }
      return passed;
    };
  }

  if (typeof Array.prototype.indexOf != "function") {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      var index = -1;
      fromIndex = fromIndex * 1 || 0;

      for (var k = 0, length = this.length; k < length; k++) {
        if (k >= fromIndex && this[k] === searchElement) {
          index = k;
          break;
        }
      }
      return index;
    };
  }

  if (typeof Array.prototype.lastIndexOf != "function") {
    Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
      var index = -1,
        length = this.length;
      fromIndex = fromIndex * 1 || length - 1;

      for (var k = length - 1; k > -1; k -= 1) {
        if (k <= fromIndex && this[k] === searchElement) {
          index = k;
          break;
        }
      }
      return index;
    };
  }

  if (typeof Array.prototype.reduce != "function") {
    Array.prototype.reduce = function (callback, initialValue) {
      var previous = initialValue,
        k = 0,
        length = this.length;
      if (typeof initialValue === "undefined") {
        previous = this[0];
        k = 1;
      }

      if (typeof callback === "function") {
        for (k; k < length; k++) {
          this.hasOwnProperty(k) && (previous = callback(previous, this[k], k, this));
        }
      }
      return previous;
    };
  }

  if (typeof Array.prototype.reduceRight != "function") {
    Array.prototype.reduceRight = function (callback, initialValue) {
      var length = this.length,
        k = length - 1,
        previous = initialValue;
      if (typeof initialValue === "undefined") {
        previous = this[length - 1];
        k--;
      }
      if (typeof callback === "function") {
        for (k; k > -1; k -= 1) {
          this.hasOwnProperty(k) && (previous = callback(previous, this[k], k, this));
        }
      }
      return previous;
    };
  }
}(typeof window !== "undefined" ? window : this, document));