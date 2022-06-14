import onChange from 'on-change';

const renderFeedback = (state, i18, elements) => {
  if (state === 'sending') {
    elements.submitBtn.disabled = true;
  } else if (state === 'invalid') {
    elements.feedbackEl.textContent = i18.t('texts.statusMessage.invalid');
    elements.feedbackEl.classList.remove('text-success');
    elements.feedbackEl.classList.add('text-danger');
    elements.inputEl.classList.add('is-invalid');
    elements.submitBtn.disabled = false;
  } else if (state === 'existing') {
    elements.feedbackEl.textContent = i18.t('texts.statusMessage.existing');
    elements.feedbackEl.classList.remove('text-success');
    elements.feedbackEl.classList.add('text-danger');
    elements.inputEl.classList.add('is-invalid');
    elements.submitBtn.disabled = false;
  } else if (state === 'successful') {
    elements.feedbackEl.textContent = i18.t('texts.statusMessage.successful');
    elements.feedbackEl.classList.remove('text-danger');
    elements.feedbackEl.classList.add('text-success');
    elements.inputEl.classList.remove('is-invalid');
    elements.submitBtn.disabled = false;
    elements.inputEl.value = '';
    elements.inputEl.focus();
  } else if (state === 'noValidRss') {
    elements.feedbackEl.textContent = i18.t('texts.statusMessage.noValidRss');
    elements.feedbackEl.classList.add('text-danger');
    elements.feedbackEl.classList.remove('text-success');
    elements.inputEl.classList.add('is-invalid');
    elements.submitBtn.disabled = false;
  } else if (state === 'networkError') {
    elements.feedbackEl.textContent = i18.t('texts.statusMessage.networkError');
    elements.feedbackEl.classList.add('text-danger');
    elements.feedbackEl.classList.remove('text-success');
    elements.inputEl.classList.add('is-invalid');
    elements.submitBtn.disabled = false;
  }
};

const renderFeeds = (state, i18, elements) => {
  const feedsInner = `
    <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">${i18.t('texts.rssFeed.feeds')}</h2>
        </div>
      <ul class="list-group border-0 rounded-0">
        ${state.map(({ title, description }) => `
            <li class="list-group-item border-0 border-end-0">
              <h3 class="h6 m-0">${title}</h3>
              <p class="m-0 small text-black-50">${description}</p>
            </li>
          `).join('')}
      </ul>
    </div>
  `;
  elements.feedsContainer.innerHTML = feedsInner;
};

const renderPosts = (posts, i18, handler, state, elements) => {
  const postsInner = `
  <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${i18.t('texts.rssFeed.posts')}</h2>
      </div>
    <ul class="list-group border-0 rounded-0">
      ${posts.map(({ text, link, id }) => `
        <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
          <a href="${link}" class="${state.viewedIds.includes(id) ? 'fw-normal link-secondary' : 'fw-bold'}" data-id="${id}" target="_blank" rel="noopener noreferrer">${text}</a>
          <button type="button" class="btn btn-outline-primary btn-sm" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modal">${i18.t('texts.rssFeed.watch')}</button>
        </li>
        `).join('')}
    <ul>
  </div>
  `;
  elements.postsContainer.innerHTML = postsInner;
  elements.postsContainer.querySelectorAll('button')
    .forEach((btn) => {
      const id = btn.previousElementSibling.getAttribute('data-id');
      btn.addEventListener('click', handler(id));
    });
};

const renderModal = (state, elements) => {
  const { text, link, content } = state.posts.find((i) => i.id === state.activePostId);
  elements.modalTitleEl.textContent = text;
  elements.modalBodyEl.textContent = content;
  elements.modalLinkEl.setAttribute('href', link);
  elements.modalContainer.classList.add('show');
  elements.modalContainer.setAttribute('style', 'display:block');
  const backDrop = document.createElement('div');
  backDrop.classList.add('modal-backdrop', 'fade', 'show');
  elements.modalContainer.after(backDrop);
  elements.modalContainer
    .querySelectorAll('[data-bs-dismiss="modal"]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activePostId = null;
        elements.modalContainer.classList.remove('show');
        elements.modalContainer.setAttribute('style', 'display:none');
        backDrop.remove();
      });
    });
};

const renderViewed = (state, elements) => {
  state.forEach((id) => {
    const elem = elements.postsContainer.querySelector(`a[data-id="${id}"]`);
    elem.classList.remove('fw-bold');
    elem.classList.add('fw-normal', 'link-secondary');
  });
};

const makeWatchedState = (
  state,
  i18Instance,
  openModalHandler,
  elements,
) => onChange(state, (path, value) => {
  if (path.match(/^status/)) {
    renderFeedback(value, i18Instance, elements);
  }
  if (path.match(/^feeds/)) {
    renderFeeds(value, i18Instance, elements);
  }
  if (path.match(/^posts/)) {
    renderPosts(value, i18Instance, openModalHandler, state, elements);
  }
  if (path.match(/^activePostId/)) {
    if (value) {
      renderModal(state, elements);
    }
  }
  if (path.match(/^viewedIds/)) {
    renderViewed(value, elements);
  }
});

export default makeWatchedState;
