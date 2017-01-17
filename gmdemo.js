'use strict'

const gm = require('greatmirror-data')
const thumbview = require('thumbview')
const domdriver = require('arraydom-driver')

// gm.slides = gm.slides.splice(0,152)
gm.slides = gm.slides.filter(x => !x.isHidden && (x.parent === undefined || !x.parent.isHidden))
console.log(gm.slides.length)

function cmp (a, b) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

// WATCHABLE IS ONLY BY ONE domdriver
const config = domdriver.watchable({
  url: url,
  // onclick: onclick,
  selected: null,
  hide: true,
  height: 260,
  thumbs: true
})

const slides = []
gather(gm.root, slides)    // rerun if config.hide changes?

function gather (coll, into) {
  if (!coll) return
  if (config.hide && coll.isHidden) return
  // console.log(coll)
  if (coll.children) {
    coll.children.sort((a,b) => cmp(a.sortkey, b.sortkey))
    if (coll.isHidden) {
    }
    for (let child of coll.children) {
      gather(child, into)
    }
    for (let child of coll.items) {
      gather(child, into)
    }
  } else {
    if (coll.photoKey) {
      into.push(coll)
    }
  }
}

if (window.location.hash) {
  let key = window.location.hash
  key = key.slice(2)
  console.log('matching', key)
  const chosen = slides.filter(x => x.altKey === key)[0]
  if (chosen) {
    config.selected = chosen
  }
}

let mainX
let mainY
let imgY
resize()

// domdriver.create only uses second arg, not whole tail
domdriver.create('main',
                 ['div',
                  [mainview, config],
                  [thumbview.create(), slides, config]
                 ]
                )

function mainview (config) {
  resize()
  // should use actual image size from data
  const out = ['div', {
    // $width: Math.min(mainX, imgY) + 'px',
    // $overflow: 'hidden'
  } ]
  const item = config.selected
  if (item) {
    const img = ['img', {
      height: imgY,
      src: url(item, imgY)
    }]
    out.push(img)
    out.push(['p', {
      $position: 'absolute',
      $top: imgY + 'px',
      $background: 'white',
      $opacity: 0.9,
      $left: '1em',
      $right: '1em',
      $zIndex: 3 }, item.caption || '',
              ['span', { $marginLeft: '2em', $fontSize: '60%', $color: 'gray' },
               item.lastModified]])

    const titles = []
    let p = item
    while (p) {
      if (p.title) {
        titles.unshift(p.title)
      } else {
        titles.unshift(p.indexInCollection)
      }
      titles.unshift(' : ')
      p = p.parent
    }
    titles.splice(0, 1)
    document.title = titles.join('')
    window.location.hash = 'a' + item.altKey
    titles.splice(0, 2)
    out.push(['p', { $position: 'absolute',
                     $left: '20px',
                     $top: 0,
                     $fontWeight: 'bold',
                     $fontSize: '30px',
                     $color: 'white',
                     $textShadow: '1px 1px 5px black'
                   }, ...titles ])

    console.log(item)
  }
  return out
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
  // return `./thumbs/scaled-${scale}-_media_sandro_h4_great-mirror_backup-images_masters_${name}.jpg`
  return `./scaled/${group}/scale-${scale}-${name}.jpg`
}

window.addEventListener('resize', resize)

function resize () {
  const width = window.innerWidth
  mainX = width
  config.thumbWidth = width
  
  const height = window.innerHeight
  let thumbs = height * 0.18
  if (thumbs > 300) thumbs = 250
  if (!config.thumbs) thumbs = 0
  thumbs = Math.floor(thumbs)
  mainY = height - thumbs
  config.thumbHeight = thumbs
  config.thumbTop = mainY + 1
  imgY = Math.floor(mainY * 0.87)
  console.log('gmdemo.resize', width, height, mainY, imgY, config.thumbHeight)
}
