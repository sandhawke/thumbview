'use strict'

const gm = require('greatmirror-data')
const thumbview = require('thumbview')
const domdriver = require('arraydom-driver')

// gm.slides = gm.slides.splice(0,152)
console.log(gm.slides.length)

// WATCHABLE IS ONLY BY ONE domdriver
const config = domdriver.watchable({
  url: url,
  // onclick: onclick,
  selected: null
})

// domdriver.create only uses second arg, not whole tail
domdriver.create('main',
                 ['div',
                   [mainview, config],
                   ['div', {id: 'thumbs'},
                    [thumbview, gm.slides, config]
                   ]
                 ]
                )

function mainview (config) {
  const out = ['div', {}]
  const item = config.selected
  if (item) {
    const img = ['img', {
      height: 800,
      src: url(item, 800)
    }]
    out.push(img)
    out.push(['p', item.caption, item.lastModified])
  }
  return out
}
  
function onclick (item) {
  cursor.item = item
}

function url (item, scale) {
  const name = ('000000' + item.photoKey).slice(-6)
  const group = name.slice(1,3)
  if (scale <= 100) {
    scale = 100
  } else if (scale <= 200) {
    scale = 200
  } else if (scale <= 400) {
    scale = 400
  } else if (scale <= 800) {
    scale = 800
  } else {
    scale = 1600
  }
  return `./scaled/${group}/scale-${scale}-${name}.jpg`
}
