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
  var maxIndex = allMountains[0].id
  var showPrevious = currentIndex > 1
  var showNext = currentIndex < maxIndex
  document.querySelector('.previous').style.visibility = showPrevious ? 'visible' : 'hidden'
  document.querySelector('.next').style.visibility = showNext ? 'visible' : 'hidden'
}

function next (e) {
  e.preventDefault()
  goTo(currentIndex + 1)
}

function previous (e) {
  e.preventDefault()
  goTo(currentIndex - 1)
}

function showMountain (mountain) {
  currentIndex = mountain.id
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

function handleHashChange (newHash, oldHash) {
  var mountain = newHash === '' ? allMountains[0] : findById(newHash)
  showMountain(mountain)
}

function initHasher () {
  hasher.changed.add(handleHashChange)
  hasher.initialized.add(handleHashChange)
  hasher.init()
}

function findById (id) {
  return allMountains.find(function (m) {
    return String(m.id) === String(id)
  })
}

function goTo (idx) {
  if (idx === 'last') {
    idx = allMountains[0].id
  }
  hasher.setHash(idx)
}

function init () {
  moment.locale('fr')
  fetchMountains().then(function (mountains) {
    stopLoading()
    allMountains = filterByDate(mountains.data)
    // init navigation only when our data is ready to be used
    initHasher()
  })
}
