'use strict'

/*
  TODO:
  - fix connection of selection and cursor, off by one, at end, etc.
  - change layout to be absolute, we do the math
  - improve highlight of current
  - change sizing to be number of rows
  - add arrows ( home, pageup, move1, each dir )
  - add swipe
  - add menus for sizing
  - switch from rows/cols to xmax and ymax, cursorX, cursorY
  - maybe allow non-square images
  - vs == view 
  - refactor into  createThumbview, so there can be more than one
  - enter == click


  PLAN:

  user keys, clicks =>  change cursorX, cursorY, selection

  on draw, we figure out offset so that that the current selection 
  is at cursorX & cursorY, since those are things the user chose.

  IN GM:
  - upper panel interactions change selection, and slides

*/

const domdriver = require('arraydom-driver')

function create () {
  
  const vs = domdriver.watchable({
    thumbsize: 100,
    rows: 5,
    cols: 5,
    // offset: 0
    pageOffset: 0,
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


  function setSize () {
    const el = document.getElementById('thumbs')  //  DOMDRIVER USAGE ERROR
    if (el) {
      const w = el.clientWidth
      const cols = Math.floor(w/(vs.thumbsize + 4))
      if (cols != vs.cols) {
        vs.cols = cols
        console.log('resize', w, cols)
      }
    }

    // const h = document.getElementById('thumbs').clientHeight
    const h = 300
    const rows = Math.floor(h/(vs.thumbsize + 4))
    if (rows != vs.rows) {
      vs.rows = rows
      console.log('resize', h, rows)
    }

    
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

  window.onresize = () => {
    console.log('resized')
    setSize()
  }
  setSize()

  function thumbview (slides, config) {
    // include 'vs' in among the objects domdriver will be watching
    return [thumbview2, vs, slides, config]
  }

  let updateSelection = () => {}

  function thumbview2 (vs, slides, config) {
    console.log('incoming offset', vs.pageOffset)

    setSize()
    
    updateSelection = () => {
      let offset = vs.pageOffset
      if (offset < 0) offset += slides.length
      const item = slides[ offset + vs.row * vs.cols + vs.col ]
      config.selected = item
    }
    
    const out = ['div', { id:'x1', width: '100%' }]
    const pix = ['p', {}]
    // const limit = vs.rows * vs.cols
    let offset = vs.pageOffset
    // negative offset, counting from the end, is good if slides are
    // being inserted while we're watching, and we want to stay at the
    // end, instead of staying at a fixed offset from the begining.
    if (offset < 0) offset += slides.length
    if (offset < 0) {
      console.log('TOO FAR BACK')
      vs.pageOffset = 1 - slides.length    
    }
    if (offset >= slides.length) {
      console.log('TOO FAR FORWARD')
      vs.pageOffset = slides.length - 1
    }
    offset = vs.pageOffset
    if (offset < 0) offset += slides.length

    for (let row = 0; row < vs.rows; row++) {
      for (let col = 0; col < vs.cols; col++) {
        const item = slides[ offset + row * vs.cols + col ]
        const me = (row === vs.row && col === vs.col)

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
          pix.push(['img',
                    {
                      height: vs.thumbsize,
                      width: vs.thumbsize,
                      $border: me ? '2px solid blue' : '2px solid gray',
                      src: 'http://www.codeodor.com/images/Empty_set.png'
                    }])
        } else {
          if (item.photoKey) {
            pix.push(['img', {
              id: 'img_' + item.photoKey,
              height: vs.thumbsize,
              width: vs.thumbsize,
              onclick: onclick,
              $border: me ? '2px solid blue' : '2px solid gray',
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
    out.push(vs.pageOffset)
    return out
  }

  function move (n) {
    if (vs.offset >= 0) {
      vs.offset += n
      if (vs.offset < 0) vs.offset = 0
      const itemsPerPage = vs.rows * vs.cols
      if (vs.offset > (gm.slides.length - itemsPerPage)) {
        vs.offset = gm.slides.length - itemsPerPage
      }
    } else {
      vs.offset += n
      // ...
    }
  }


  // http://stackoverflow.com/questions/6226859/how-can-i-track-arrow-keys-in-chrome-and-ie
  // "keypress events are only supposed to fire for keys that insert characters."

  document.onkeydown = (ev) => {
    const k = ev.key
    if (k === 'ArrowLeft') {
      if (vs.col === 0) {
        if (vs.row === 0) {
          vs.pageOffset--
        } else {
          vs.row--
          vs.col = vs.cols - 1
        }
      } else {
        vs.col--
      }
    }

    if (k === 'ArrowRight') {
      if (vs.col < vs.cols - 1) {
        vs.col++
      } else {
        if (vs.row < vs.rows - 1) {
          vs.row++
          vs.col = 0
        } else {
          vs.pageOffset++
        }
      }
    }

    if (k === 'ArrowUp') {
      if (vs.row === 0) {
        vs.pageOffset -= vs.cols
      } else {
        vs.row--
      }
    }

    if (k === 'ArrowDown') {
      if (vs.row < vs.rows - 1) {
        vs.row++
      } else {
        vs.pageOffset += vs.cols
      }
    }

    if (k === 'PageUp') {
      vs.pageOffset -= (vs.rows * vs.cols)
    }

    if (k === 'PageDown') {
      vs.pageOffset += (vs.rows * vs.cols)
    }

    if (k === 'Home') {
      vs.pageOffset = 0
      vs.col = 0
      vs.row = 0
    }
    if (k === 'End') {
      vs.pageOffset = 0 - (vs.rows * vs.cols)
      vs.col = vs.cols - 1
      vs.row = vs.rows - 1
      // which might be past end, if there aren't enough items
    }

    if (k === '1') { vs.thumbsize = 12; setSize() }
    if (k === '2') { vs.thumbsize = 25; setSize() }
    if (k === '3') { vs.thumbsize = 50; setSize() }
    if (k === '4') { vs.thumbsize = 75; setSize() }
    if (k === '5') { vs.thumbsize = 100; setSize() }
    if (k === '6') { vs.thumbsize = 125; setSize() }
    if (k === '7') { vs.thumbsize = 150; setSize() }
    if (k === '8') { vs.thumbsize = 200; setSize() }
    // if (k === '9') { vs.thumbsize = 400; setSize() }
    
    console.log('keydown', k)

    updateSelection()
  }

  return thumbview
}

module.exports.create = create

