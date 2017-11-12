(function() {
  var switchBtnn = document.querySelector( 'button.slider-switch' ),
  toggleBtnn = function() {
    console.log("ran");
    if( slideshow.isFullscreen ) {
      classie.add( switchBtnn, 'view-maxi' );
    }
    else {
      classie.remove( switchBtnn, 'view-maxi' );
    }
  }
  // so hacky. so works
  setTimeout(function(){
    slideshow = new DragSlideshow( document.getElementById( 'slideshow' ), {
      // toggle between fullscreen and minimized slideshow
      onToggle : toggleBtnn
    })
  }, 500);
  toggleSlideshow = function() {
    slideshow.toggle();
    toggleBtnn();
  }
}());
