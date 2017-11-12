(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Drip class
 * @class fabric.Drip
 * @extends fabric.Object
 */
(function(fabric) {

  fabric.DripMod = fabric.util.createClass(fabric.Object, {
    rate: 0,
    color: null,
    amount: 10,
    life: 10,
    _point: null,
    _lastPoint: null,
    _strokeId: 0,
    _interval: 20,

    initialize: function(ctx, pointer, amount, color, _strokeId) {
      this.ctx = ctx;
      this._point = pointer;
      this._strokeId = _strokeId;
      this.amount = fabric.util.getRandom(amount, amount * 0.5);
      this.color = color;
      this.life = this.amount * 1.5;
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "destination-out";

      this._render();
    },

    _update: function(brush) {
      this._lastPoint = fabric.util.object.clone(this._point);
      this._point.addEquals({
        x: this.life * this.rate,
        y: fabric.util.getRandom(this.life * this.amount / 30)
      });

      this.life -= 0.05;

      if (fabric.util.getRandom() < 0.03) {
        this.rate += fabric.util.getRandom(0.03, - 0.03);
      } else if (fabric.util.getRandom() < 0.05) {
        this.rate *= 0.01;
      }
    },

    _draw: function() {
      this.ctx.save();
      this.line(this.ctx, this._lastPoint, this._point, this.color, this.amount * 0.8 + this.life * 0.2);
      this.ctx.restore();
    },

    _render: function() {
      var context = this;

      setTimeout(draw, this._interval);

      function draw() {
        context._update();
        context._draw();
        if(context.life > 0) {
          setTimeout(draw, context._interval);
        }
      }
    },

    line: function(ctx, point1, point2, color, lineWidth) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);

      ctx.stroke();
    }
  });

})(fabric);

},{}],2:[function(require,module,exports){
/**
* InkBrush class
* @class fabric.InkBrush
* @extends fabric.BaseBrush
*/
(function(fabric){

  fabric.InkBrushMod = fabric.util.createClass(fabric.BaseBrush, {

    color: null,
    opacity: 0.1,
    width: 40,

    _baseWidth: 20,
    _dripCount: 0,
    _drips: [80],
    _inkAmount: 2,
    _lastPoint: null,
    _point: null,
    _range: 10,
    _strokeCount: 0,
    _strokeId: null,
    _strokeNum: 40,
    _strokes: null,

    initialize: function(canvas, opt) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;

      this._point = new fabric.Point();
    },

    changeColor: function(color){
      this.color = color;
    },

    changeOpacity: function(value){
      this.opacity = value;
      this.canvas.contextTop.globalAlpha = value;
    },

    _render: function(pointer){
      var subtractPoint, distance, point, i, len, strokes, stroke;
      this._strokeCount++;
      if (this._strokeCount % 120 === 0 && this._dripCount < 10) {
        this._dripCount++;
      }

      point = this.setPointer(pointer);
      subtractPoint = point.subtract(this._lastPoint);
      distance = point.distanceFrom(this._lastPoint);
      strokes = this._strokes;

      // dont run if there is no stroke
      if(!strokes){
        return false;
      }
      for (i = 0, len = strokes.length; i < len; i++) {
        stroke = strokes[i];
        stroke.update(point, subtractPoint, distance);
        stroke.draw();
      }

      if (distance > 1) {
        this.drawSplash(point, this._inkAmount);
      } else if (distance < 3 && fabric.util.getRandom() < 0.085 && this._dripCount) {
        this._drips.push(new fabric.DripMod(this.canvas.contextTop, point, fabric.util.getRandom(this.size * 0.25, this.size * 0.1), this.color, this._strokeId));
        this._dripCount--;
      }
    },

    paintStart: function(pointer){
      this._resetTip(pointer);
      this._strokeId = +new Date();
      this._dripCount = fabric.util.getRandom(6, 3) | 0;
    },

    painting: function(pointer){
      this._render(pointer);
    },

    paintEnd: function(){
      this._strokeCount = 0;
      this._dripCount = 0;
      this._strokeId = null;
    },

    drawSplash: function(pointer, maxSize) {
      var c, r, i, point,
          ctx = this.canvas.contextTop,
          num = fabric.util.getRandom(12),
          range = maxSize * 10,
          color = this.color;
          ctx.globalCompositeOperation = "destination-out";

      ctx.save();
      for (i = 0; i < num; i++) {
        r = fabric.util.getRandom(range, 1);
        c = fabric.util.getRandom(Math.PI * 2);
        point = new fabric.Point(pointer.x + r * Math.sin(c), pointer.y + r * Math.cos(c));

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, fabric.util.getRandom(maxSize) / 2, 0, Math.PI * 2, false);
        ctx.fill();
      }
      ctx.restore();
    },

    setPointer: function(pointer) {
      var point = new fabric.Point(pointer.x, pointer.y);

      this._lastPoint = fabric.util.object.clone(this._point);
      this._point = point;

      return point;
    },

    _resetTip: function(pointer){
      var strokes, point, len, i;

      point = this.setPointer(pointer);
      strokes = this._strokes = [];
      this.size = this.width / 5 + this._baseWidth;
      this._strokeNum = this.size;
      this._range = this.size / 2;

      for (i = 0, len = this._strokeNum; i < len; i++) {
        strokes[i] = new fabric.StrokeMod(this.canvas.contextTop, point, this._range, this.color, this.width, this._inkAmount);
      }
    }
  });

})(fabric);

},{}],3:[function(require,module,exports){
/**
 * Stroke class
 * @class fabric.Stroke
 * @extends fabric.Object
 */
(function(fabric) {

  fabric.StrokeMod = fabric.util.createClass(fabric.Object,{
    color: null,
    inkAmount: null,
    lineWidth: null,
    _point: null,
    _lastPoint: null,
    _currentLineWidth: null,

    initialize: function(ctx, pointer, range, color, lineWidth, inkAmount){

      var rx = fabric.util.getRandom(range),
      c = fabric.util.getRandom(Math.PI * 2),
      c0 = fabric.util.getRandom(Math.PI * 2),
      x0 = rx * Math.sin(c0),
      y0 = rx / 2 * Math.cos(c0),
      cos = Math.cos(c),
      sin = Math.sin(c);

      this.ctx = ctx;
      this.color = color;
      this._point = new fabric.Point(pointer.x + x0 * cos - y0 * sin, pointer.y + x0 * sin + y0 * cos);
      this.lineWidth = lineWidth;
      this.inkAmount = inkAmount;
      this._currentLineWidth = lineWidth;
      ctx.globalCompositeOperation = "destination-out";

      ctx.lineCap = "round";
    },

    update: function(pointer, subtractPoint, distance) {
      this._lastPoint = fabric.util.object.clone(this._point);
      this._point = this._point.addEquals({ x: subtractPoint.x, y: subtractPoint.y });

      var n = this.inkAmount / (distance + 1);
      var per = (n > 0.3 ? 0.2 : n < 0 ? 0 : n);
      this._currentLineWidth = this.lineWidth * per;
    },

    draw: function(){
      var ctx = this.ctx;
      ctx.globalCompositeOperation = "destination-out";
      ctx.save();
      this.line(ctx, this._lastPoint, this._point, this.color, this._currentLineWidth);
      ctx.restore();
    },

    line: function(ctx, point1, point2, color, lineWidth) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);

      ctx.stroke();
    }
  });

})(fabric);

},{}],4:[function(require,module,exports){
(function(fabric) {

  fabric.Point.prototype.angleBetween = function(that){
    return Math.atan2( this.x - that.x, this.y - that.y);
  };

  fabric.Point.prototype.normalize = function(thickness) {
    if (null === thickness || undefined === thickness) {
      thickness = 1;
    }

    var length = this.distanceFrom({ x: 0, y: 0 });

    if (length > 0) {
      this.x = this.x / length * thickness;
      this.y = this.y / length * thickness;
    }

    return this;
  };

})(fabric);
},{}],5:[function(require,module,exports){
(function(fabric){

  fabric.util.getRandom = function(max, min){
    min = min ? min : 0;
    return Math.random() * ((max ? max : 1) - min) + min;
  };

  fabric.util.clamp = function (n, max, min) {
    if (typeof min !== 'number') min = 0;
    return n > max ? max : n < min ? min : n;
  };

})(fabric);
},{}]},{},[1,2,3,4,5]);
