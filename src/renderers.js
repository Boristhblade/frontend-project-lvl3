const renderFeedback = (elem, state, input, i18) => {
  if (state === 'invalid') {
    elem.textContent = i18.t('texts.statusMessage.invalid');
    elem.classList.remove('text-success');
    elem.classList.add('text-danger');
    input.classList.add('is-invalid');
  } else if (state === 'existing') {
    elem.textContent = i18.t('texts.statusMessage.existing');
    elem.classList.remove('text-success');
    elem.classList.add('text-danger');
    input.classList.add('is-invalid');
  } else if (state === 'successful') {
    elem.textContent = i18.t('texts.statusMessage.successful');
    elem.classList.remove('text-danger');
    elem.classList.add('text-success');
    input.classList.remove('is-invalid');
  } else {
    elem.textContent = '';
    input.classList.remove('is-invalid');
  }
};

const renderFeeds = (container, state, i18) => {
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
  container.innerHTML = feedsInner;
};

const renderPosts = (container, state, i18, handler) => {
  const postsInner = `
  <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${i18.t('texts.rssFeed.posts')}</h2>
      </div>
    <ul class="list-group border-0 rounded-0">
      ${state.map(({ text, link, id }) => `
        <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
          <a href="${link}" class="fw-bold" data-id="${id}" target="_blank" rel="noopener noreferrer">${text}</a>
          <button type="buttoarget="#modal">${i18.t('texts.rssFeed.watch')}</button>
        </li>
        `).join('')}
    <ul>
  </div>
  `;
  container.innerHTML = postsInner;
  container.querySelectorAll('button')
    .forEach((btn) => {
      const id = btn.previousElementSibling.getAttribute('data-id');
      btn.addEventListener('click', handler(state, id));
    });
};

const renderModal = (container, state, i18) => {
  console.log(container);
  const { text, link, content } = state.posts.find((i) => i.id === state.activePostId);
  const titleEl = container.querySelector('.modal-title');
  titleEl.textContent = text;
  const bodyEl = container.querySelector('modal-body');
  bodyEl.textContent = content;
  const linkEl = document.querySelector('.btn-primary');
  linkEl.setAttribute('href', link);
  container.classList.add('show');
  // const modalInner = `
  // <div class="modal-dialog" role="document">
  //   <div class="modal-content">
  //     <div class="modal-header">
  //       <h5 class="modal-title">${text}</h5>
  //       <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close"></button>
  //     </div>
  //     <div class="modal-body text-break">${content}</div>
  //     <div class="modal-footer">
  //     <a class="btn btn-primary full-article" href="${link}" role="button" target="_blank" rel="noopener noreferrer">${i18.t('texts.modal.read')}</a>
  //     <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18.t('texts.modal.close')}</button>
  //     </div>
  //   </div>
  // </div>
  // `;
  container
    .querySelectorAll('[data-bs-dismiss="modal"]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        container.classList.remove('show');
      });
    });
};

export {
  renderFeedback, renderFeeds, renderPosts, renderModal,
};
