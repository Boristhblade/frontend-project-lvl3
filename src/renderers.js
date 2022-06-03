const renderFeedback = (elem, state, input, i18) => {
  if (state === 'invalid') {
    // console.log(i18)
    elem.textContent = i18.t('texts.statusMessage.invalid')
    elem.classList.remove('text-success')
    elem.classList.add('text-danger')
    input.classList.add('is-invalid')
  } else if (state === 'existing') {
    elem.textContent = i18.t('texts.statusMessage.existing')
    elem.classList.remove('text-success')
    elem.classList.add('text-danger')
    input.classList.add('is-invalid')
  } else if (state === 'successful') {
    elem.textContent = i18.t('texts.statusMessage.successful')
    elem.classList.remove('text-danger')
    elem.classList.add('text-success')
    input.classList.remove('is-invalid')
  } else {
    elem.textContent = ''
    input.classList.remove('is-invalid')
  }
}

const renderRss = (container, state, i18) => {
  state.forEach(element => {
    const newElement = document.createElement('div')
    newElement.classList.add('row')
    const elemHeader = document.createElement('div')
    elemHeader.classList.add(...'col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds'.split(' '))
    elemHeader.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">${state}</h2>
        </div>
      </div>
    `
    newElement.appendChild(elemHeader)
    container.appendChild(newElement)
  })
}
/* <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds">
  <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Фиды</h2>
      </div>
    <ul class="list-group border-0 rounded-0">
      <li class="list-group-item border-0 border-end-0">
        <h3 class="h6 m-0">Новые уроки на Хекслете</h3>
        <p class="m-0 small text-black-50">Практические уроки по программированию</p>
      </li>
    </ul>
  </div>
</div> */
export { renderFeedback, renderRss }
