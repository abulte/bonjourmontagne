document.addEventListener('DOMContentLoaded', init)

var currentIndex
var allMountains = []

function fetchMountains () {
  return fetch('mountains.json')
    .then(function(response) {
      return response.json()
    }).catch(function(ex) {
      console.log('parsing failed', ex)
    })
}

function stopLoading () {
  document.querySelector('.loading').style.display = 'none'
}

function computePagination () {
  var showPrevious = currentIndex < allMountains.length - 1
  var showNext = currentIndex > 0
  document.querySelector('.previous').style.visibility = showPrevious ? 'visible' : 'hidden'
  document.querySelector('.next').style.visibility = showNext ? 'visible' : 'hidden'
}

function next () {
  showMountain(currentIndex - 1)
}

function previous () {
  showMountain(currentIndex + 1)
}

function showMountain (idx) {
  var mountain = allMountains[idx]
  currentIndex = idx
  computePagination()
  var image = document.querySelector('.image');
  image.src = 'pictures/' + mountain.picture
  document.querySelector('.description').innerHTML = mountain.description
  if (mountain.copyright) {
    var hasLink = !!mountain.copyright_link
    var el = document.createElement( hasLink ? 'a' : 'span')
    if (hasLink) {
      el.href = mountain.copyright_link
      el.target = '_blank'
    }
    el.innerHTML = mountain.copyright
    document.querySelector('.copyright').innerHTML = ''
    document.querySelector('.copyright').appendChild(el)
  }
  document.querySelector('.description').innerHTML = mountain.description
  image.alt = mountain.description
}

function init () {
  fetchMountains().then(function (mountains) {
    stopLoading()
    allMountains = mountains.data
    if (mountains.data.length > 0) {
      showMountain(0)
    }
  })
}
