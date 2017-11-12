window.onload = function(){
  intro();
};
// wait for google to load Oswald font, then run
function intro(){
  // make width and height of canvas equal to width and height of window to prep for the rest
  let canvasEl = document.getElementById('a');
  canvasEl.width = screen.width;
  canvasEl.height = screen.height;

  // make instance of canvas
  var canvas = new fabric.Canvas('a');

  // format fill color and add
  var ctx = canvas.contextTop;

  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo((canvasEl.width / 2), (canvasEl.height / 2));
  ctx.arc((canvasEl.width / 2), (canvasEl.height / 2), 10000, 0, Math.PI * 2, false);
  ctx.fill();

  // add image on top of canvas go give non-jagged font
  // create image element
  var thumbImg = document.createElement('img');
  // give image
  thumbImg.src = '/assets/images/alessa.png';
  thumbImg.onload = function() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(thumbImg, 0, -110, canvas.width, (canvas.height * 0.7));
  };

  // enable drawing
  canvas.isDrawingMode = true;
  // ink paint brush from fabricbrush. modded to be transparent and remove lines
  canvas.freeDrawingBrush = new fabric.InkBrushMod(canvas, {
    width: 200,
    opacity: 0.1,
    _inkAmount: 2
  });

  // set paint brush to simple variable
  var painter = canvas.freeDrawingBrush;
  /* auto-draw solution from http://stackoverflow.com/questions/23939588/how-to-animate-drawing-lines-on-canvas */
  (function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        },
        timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
    }());

    // variable to hold how many frames have elapsed in the animation
    var t = 1;

    // define the path to plot
    var vertices = [];
    // generate vertices
    // get canvas width and height
    var w = screen.width;
    var h = screen.height;
    // get difference between width and height
    var lengthDiff = w - h;
    // set iterator for loop to build vertices
    var n = 1;
    // instatiate original direction
    var dir = "x";
    // add first two vertices
    vertices.push({x: 30, y: 3});
    vertices.push({x: 3, y: 30});
    // add vertices until the page has been traversed by the brush
    while(vertices[n].x <= (w - 200) || vertices[n].y <= (h - 200)){
      // set new x and y
      // find out which axis to place the next vertices on
      if(dir === "x"){
        // has limit been reached?
        if(vertices[n-1].x >= (w - 70)){
          // move along y axis
          vertices.push({x: (w - Math.floor(Math.random() * 30)), y: (vertices[n-1].y + 50 + Math.floor(Math.random() * 10))});
        } else {
          // last point was on y axis, so next point will be on x axis
          vertices.push({x: (vertices[n-1].x + 50 + Math.floor(Math.random() * 50)), y: (Math.floor(Math.random() * 30))});
        }
        // change direction
        dir = "y";
      } else {
        // has limit been reached?
        if(vertices[n-1].y >= (h - 70)){
          // move along x axis
          vertices.push({x: (vertices[n-1].x + 50 + Math.floor(Math.random() * 10)), y: (h - Math.floor(Math.random() * 30))});
        } else {
          // last point was on x axis, so next point will be on y axis
          vertices.push({x: (Math.floor(Math.random() * 30)), y: (vertices[n-1].y + 50 + Math.floor(Math.random() * 50))});
        }
        // change direction
        dir = "x";
      }
      // increment the iterator
      n ++;
    }

    // set some style
    ctx.lineWidth = 10;
    ctx.strokeStyle = "white";
    // calculate incremental points along the path
    var points = calcWaypoints(vertices);

    // After calculating waypoints, move skip button and fade in name before running paint animation
    document.getElementById('canvasBlocker').className = "intro-fade";
    setTimeout(function(){
      // extend the line from start to finish with animation
      animate(points);
    }, 2600);

    // calc waypoints traveling along vertices
    function calcWaypoints(vertices) {
      // declare waypoints
      var waypoints = [];
      // loop verticies using
      for (var i = 1; i < vertices.length; i++) {
        // first point
        var pt0 = vertices[i - 1];
        // next point
        var pt1 = vertices[i];
        // run
        var dx = pt1.x - pt0.x;
        // rise
        var dy = pt1.y - pt0.y;
        // use pythagrian to calculate distance. distance will determine strokes per line
        var pyth = Math.sqrt((dx * dx) + (dy * dy));
        // calculate iterations based on distance tranvelled
        let iters = Math.ceil(pyth / 80);
        // randomize units per Stroke
        //var unitsPerSroke = Math.floor(Math.random() * 20)
        // break each line into parts to push into animation
        for (var j = 0; j < iters; j++) {
          var x = pt0.x + dx * j / iters;
          var y = pt0.y + dy * j / iters;
          waypoints.push({
            x: x,
            y: y
          });
        }
      }
      return (waypoints);
    }

    function animate() {
      if (t < points.length - 1) {
          requestAnimationFrame(animate);
      } else {
        // exit intro
        exitIntro();
      }
      // draw a line segment from the last waypoint
      // to the current waypoint
      ctx.beginPath();
      // add noise to start and jump brush
      if(( points.length % (Math.floor(Math.random() * 12)) ) === 0){
        painter.paintStart({x: points[t - 1].x, y:points[t - 1].y});
      }
      painter.painting({x: points[t].x, y: points[t].y});
      // increment "t" to get the next waypoint
      t++;
    }

    function exitIntro() {
      // remove the canvas
      setTimeout(function(){
        // fade out canvas
        document.getElementsByClassName('canvas-container')[0].className += " intro-fade";
        // remove the canvas and blocker
        setTimeout(function(){
          document.getElementsByClassName('canvas-container')[0].style.display = "none";
          document.getElementById('canvasBlocker').style.display = "none";
        }, 1100);
      }, 800);
    }
}
