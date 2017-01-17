'use strict'

/*
  TODO:
  - add arrows ( home, pageup, move1, each dir )
  - add swipe
  - add menus for sizing
  - maybe allow non-square images
  - vs == view 
  - enter == click


*/

const domdriver = require('arraydom-driver')

function create () {

  let slides
  let config

  const vs = domdriver.watchable({
    thumbsize: 25,
    rows: 3,
    cols: 5,
    row: 0,
    col: 0
    
  })

  /*
    setInterval( () => {
    const w = document.getElementById('x1').clientWidth
    //console.log('width', w)
    const cols = Math.floor(w/(vs.thumbsize + 4))
    if (cols != vs.cols)  vs.cols = cols
    //console.log('cols', vs.cols)
    }, 50)
  */


  // how to do this with secure domdriver?
  //
  //   maybe our object gets _width, _height?
  //   or onresize of the element?

  function setSize () {
    // const el = document.getElementById('thumbs')  //  DOMDRIVER USAGE ERROR
    //if (el) {
      // const w = el.clientWidth
      const w = (config && config.thumbWidth) || 120
      const cols = Math.floor((w-10)/(vs.thumbsize))
      if (cols != vs.cols) {
        vs.cols = cols
        console.log('resize', w, cols)
      }

      const h = (config && config.thumbHeight) || 120
    // vs.thumbsize = Math.floor((h-80)/vs.rows)-6
    vs.thumbsize = Math.floor((h-35)/vs.rows)-0
      console.log('thumbsize = ', vs.thumbsize, ' h = ', h)
  //}
  }

  /*
    function loop () {
    window.requestAnimationFrame(() => {
    setSize()
    loop()
    })
    }
    loop()
  */

  /*
  window.addEventListener('resize', () => {
    // console.log('resized')
    setSize()
  })
  setSize()
*/

  function thumbview (slidesArg, configArg) {
    // make these available to semi-global event handlers
    // (maybe set that up when we're first called, instead)
    slides = slidesArg
    config = configArg
    // include 'vs' in among the objects domdriver will be watching
    return [thumbview2, vs]
  }

  //  let updateSelection = () => {}

  function thumbview2 () {
    //console.log('incoming offset', vs.pageOffset)

    setSize()

    /*
    updateSelection = () => {
      let offset = vs.pageOffset
      if (offset < 0) offset += slides.length
      const item = slides[ offset + vs.row * vs.cols + vs.col ]
      config.selected = item
    }
    */

    const out = ['div', {
      $position: 'absolute',
      $top: '' + config.thumbTop + 'px'
    }]
    const pix = ['div', {
      $position: 'absolute'
    }]

    let offset = pageOffset()

    for (let row = 0; row < vs.rows; row++) {
      for (let col = 0; col < vs.cols; col++) {
        const item = slides[ offset + row * vs.cols + col ]
        // const me = (row === vs.row && col === vs.col)
        const me = (config.selected === item)

        // Call config.onclick(item) if item is clicked on.  So we need
        // a different onclick function for each item, bound to that
        // item.  This is a bit weird, but maybe the simplest way to do
        // it:
        const onclick = ((i) => {
          return () => {
            config.selected = i
            console.log('clicked', i)
            if (config.onclick) config.onclick(i)
          }
        })(item)
        
        if (!item) {
          // console.log('no slide at', offset, row, col)
          /*
          pix.push(['img',
                    {
                      height: vs.thumbsize,
                      width: vs.thumbsize,
                      $border: me ? '2px solid blue' : '2px solid gray',
                      src: 'http://www.codeodor.com/images/Empty_set.png'
                    }])
          */
        } else {
          const border = me ? 4 : 0
          if (item.photoKey) {
            pix.push(['img', {
              //id: 'img_' + item.photoKey,
              $position: 'absolute',
              $top: '' + (row * vs.thumbsize - border) + 'px',
              $left: '' + (col * vs.thumbsize - border) + 'px',
              height: vs.thumbsize,
              width: vs.thumbsize,
              onclick: onclick,
              $zIndex: me ? 2 : 1,
              $border: me ? '4px solid blue' : '',
              // onclick has to wait
              src: config.url(item, vs.thumbsize)
            }])
          } else {
            pix.push(item.altKey)
          }
        }
      }
      pix.push(['br'])
    }
    out.push(pix)
    {
      const i = indexOfSelected()
      const count = slides.length
      const pageSize = vs.rows * vs.cols
      const pageNum = Math.floor(indexOfSelected() / pageSize)
      const pages = Math.floor(count / pageSize) + 1
      out.push(['p', {
        $position: 'absolute',
        $top: '' + (vs.rows * vs.thumbsize - 8) + 'px',
        $width: '500px',
        $fontSize: '12px'
      },
      `image ${i+1} of ${count}, page ${pageNum+1} of ${pages}`])
    }
    return out
  }



  // http://stackoverflow.com/questions/6226859/how-can-i-track-arrow-keys-in-chrome-and-ie
  // "keypress events are only supposed to fire for keys that insert characters."

  document.onkeydown = (ev) => {
    const k = ev.key
    const old = indexOfSelected()
    let i = old

    // perhaps these should also move the cursor, in an exactly predictable
    // way, in case the data is changing under us...?
    
    if (k === 'ArrowLeft') i--
    if (k === 'ArrowRight') i++
    if (k === 'ArrowUp') i -= vs.cols
    if (k === 'ArrowDown') i += vs.cols
    if (k === 'PageUp') i -= (vs.rows * vs.cols)
    if (k === 'PageDown') i  += (vs.rows * vs.cols)
    if (k === 'Home') i = 0
    if (k === 'End') i = slides.length - 1

    if (i !== old) {
      const item = slides[i]
      if (item) {
        config.selected = item
        //vs.col = i % vs.cols
        //vs.row = (i - vs.col) % vs.rows
      }
    }

    /* 
    if (k === '1') { vs.thumbsize = 12; setSize() }
    if (k === '2') { vs.thumbsize = 25; setSize() }
    if (k === '3') { vs.thumbsize = 50; setSize() }
    if (k === '4') { vs.thumbsize = 75; setSize() }
    if (k === '5') { vs.thumbsize = 100; setSize() }
    if (k === '6') { vs.thumbsize = 125; setSize() }
    if (k === '7') { vs.thumbsize = 150; setSize() }
    if (k === '8') { vs.thumbsize = 200; setSize() }
    // if (k === '9') { vs.thumbsize = 400; setSize() }
    */
    const kn = parseInt(k)
    if ('' + kn === k && kn > 0) {
      vs.rows = kn
      setSize()
    }
    
    // console.log('keydown', k)
  }

  let selectedAt = 0
  function indexOfSelected () {
    if (slides.length === 0) {
      console.log('ERROR, slides array is empty')
    }
    if (slides[selectedAt] !== config.selected) {
      selectedAt = slides.indexOf(config.selected)
      if (selectedAt === -1) {
        config.selected = slides[0]
      }
    }
    return selectedAt
  }
  
  // Where should the page start, for the selected item to be under the cursor?
  function pageOffset () {
    // const offset = indexOfSelected() - (vs.row * vs.cols + vs.col)
    let i = indexOfSelected()
    const pageSize = vs.rows * vs.cols
    const pageNum = Math.floor(indexOfSelected() / pageSize)
    const offset = pageNum * pageSize
    return offset
  }

  /* For testing that UI is stable even under changing slides.

     That is, the keyboard controls still move the current image around as expected, regardless of things being deleted....

  setInterval( () => {
    slides.splice(5, 1)
    config.touch = slides.length
  }, 1)
  */
  
  return thumbview
}

module.exports.create = create
