import onChange from 'on-change';

const renderFeedback = (state, i18, elements) => {
  if (state === 'sending') {
    elements.submitBtn.disabled = true;
  } else if (state === 'successful') {
    elements.feedbackEl.textContent = i18.t('texts.statusMessage.successful');
    elements.feedbackEl.classList.remove('text-danger');
    elements.feedbackEl.classList.add('text-success');
    elements.inputEl.classList.remove('is-invalid');
    elements.submitBtn.disabled = false;
    elements.inputEl.value = '';
    elements.inputEl.focus();
  } else {
    elements.feedbackEl.textContent = i18.t(`texts.statusMessage.${state}`);
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
      </ul>
    </div>
  `;
  elements.feedsContainer.innerHTML = feedsInner;
  const listEl = elements.feedsContainer.querySelector('.list-group');
  state.forEach(({ title, description }) => {
    const listItemEl = document.createElement('li');
    listItemEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const headerEl = document.createElement('h3');
    headerEl.classList.add('h6', 'm-0');
    headerEl.textContent = title;
    const textEl = document.createElement('p');
    textEl.classList.add('m-0', 'small', 'text-black-50');
    textEl.textContent = description;
    listItemEl.appendChild(headerEl);
    listItemEl.appendChild(textEl);
    listEl.appendChild(listItemEl);
  });
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
      btn.addEventListener('click', handler(id, state));
    });
};

const renderModal = (state, elements, closeModalHandler) => {
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
      btn.addEventListener('click', closeModalHandler(state));
    });
};

const renderClosedModal = (elements) => {
  const backDrop = document.querySelector('.modal-backdrop');
  elements.modalContainer.classList.remove('show');
  elements.modalContainer.setAttribute('style', 'display:none');
  backDrop.remove();
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
  closeModalHandler,
  elements,
) => {
  const watchedState = onChange(state, (path, value) => {
    if (path.match(/^status/)) {
      renderFeedback(value, i18Instance, elements);
    }
    if (path.match(/^feeds/)) {
      renderFeeds(value, i18Instance, elements);
    }
    if (path.match(/^posts/)) {
      renderPosts(value, i18Instance, openModalHandler, watchedState, elements);
    }
    if (path.match(/^activePostId/)) {
      if (value) {
        renderModal(watchedState, elements, closeModalHandler);
      } else {
        renderClosedModal(elements);
      }
    }
    if (path.match(/^viewedIds/)) {
      renderViewed(value, elements);
    }
  });
  return watchedState;
};

export default makeWatchedState;
