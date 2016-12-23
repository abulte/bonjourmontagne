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
    var copyright = document.querySelector('.copyright')
    copyright.innerHTML = ''
    copyright.appendChild(el)
  }
  document.querySelector('.description').innerHTML = mountain.description
  image.alt = mountain.description
  document.querySelector('.date').innerHTML = moment(mountain.date).format('LL')
}

function getTomorrow () {
  var now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
}

function filterByDate (mountains) {
  if (document.location.hostname === "localhost") return mountains
  var limit = getTomorrow()
  return mountains.filter(function (m) {
    return new Date(m.date) < limit
  })
}

function init () {
  moment.locale('fr')
  fetchMountains().then(function (mountains) {
    stopLoading()
    allMountains = filterByDate(mountains.data)
    if (allMountains.length > 0) {
      showMountain(0)
    }
  })
}
