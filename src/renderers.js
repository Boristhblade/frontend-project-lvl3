import _ from 'lodash'

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
  const postsEl = document.querySelector('.posts')
  const feedsEl = document.querySelector('.feeds')
  console.log(state)
  const feedsInner = `
    <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">${i18.t('texts.rssFeed.feeds')}</h2>
        </div>
      <ul class="list-group border-0 rounded-0">
        ${state.map(({ title, description }) => {
          return `
            <li class="list-group-item border-0 border-end-0">
              <h3 class="h6 m-0">${title}</h3>
              <p class="m-0 small text-black-50">${description}</p>
            </li>
          `          
        }).join('')}
      </ul>
    </div>
  `
  const postsInner = `
    <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">${i18.t('texts.rssFeed.posts')}</h2>
        </div>
      <ul class="list-group border-0 rounded-0">
        ${state.map(elem => elem.posts.map(({ text, link }) => {
          return `
          <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
            <a href="${link}" class="fw-bold" data-id="${_.uniqueId()}" target="_blank" rel="noopener noreferrer">${text}</a>
            <button type="buttoarget="#modal">${i18.t('texts.rssFeed.watch')}</button>
          </li>
          `
          }).join('')
        ).join('')}
      <ul>
    </div>
  `
  feedsEl.innerHTML = feedsInner
  postsEl.innerHTML = postsInner
}
/* <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds"
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

/* <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Посты</h2>
      </div>
    <ul class="list-group border-0 rounded-0">
      <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a href="http://example.com/test/1654271460" class="fw-bold" data-id="118" target="_blank" rel="noopener noreferrer">Lorem ipsum 2022-06-03T15:51:00Z</a>
        <button type="buttoarget="#modal">Просмотр</button>
      </li> */
export { renderFeedback, renderRss }
