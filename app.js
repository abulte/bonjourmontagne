document.addEventListener('DOMContentLoaded', init)

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

function showMountain (mountain) {
  document.querySelector('.image').src = 'pictures/' + mountain.picture
  document.querySelector('.description').innerHTML = mountain.description
  if (mountain.copyright) {
    var hasLink = !!mountain.copyright_link
    var el = document.createElement( hasLink ? 'a' : 'span')
    if (hasLink) {
      el.href = mountain.copyright_link
      el.target = '_blank'
    }
    el.innerHTML = mountain.copyright
    document.querySelector('.copyright').appendChild(el)
  }
  document.querySelector('.description').innerHTML = mountain.description
}

function init () {
  fetchMountains().then(function (mountains) {
    stopLoading()
    if (mountains.data.length > 0) {
      showMountain(mountains.data[0])
    }
  })
}
