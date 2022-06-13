import { string } from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import makeWatchedState from './renderers.js';
import resources from './locales/index.js';
import parse from './parser.js';
import buildPath from './path.js';

const makeYupSchema = (urls) => string().url('invalid').notOneOf(urls, 'existing');

const updateFeed = (state) => {
  const cb = () => {
    Promise.all(state.watchedUrls.map((url) => axios.get(buildPath(url))))
      .then((responseArr) => {
        const postsAll = responseArr.reduce((acc, item) => {
          const { posts } = parse(item.data.contents);
          return [...acc, ...posts];
        }, []);
        const newPosts = _
          .differenceBy(postsAll, Array.from(state.posts), 'text')
          .map((post) => ({ ...post, id: _.uniqueId() }));
        if (newPosts.length !== 0) { state.posts = [...newPosts, ...state.posts]; }
      })
      .catch((e) => console.log(e))
      .finally(() => setTimeout(cb, 5000));
  };
  setTimeout(cb, 5000);
};

export default () => {
  const defaultLanguage = 'ru';
  const state = {
    lng: defaultLanguage,
    status: null,
    activePostId: null,
    watchedUrls: [],
    feeds: [],
    posts: [],
    viewedIds: [],
  };

  const elements = {
    feedbackEl: document.querySelector('.feedback'),
    inputEl: document.getElementById('url-input'),
    submitBtn: document.getElementById('submit'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalContainer: document.getElementById('modal'),
    modalTitleEl: document.querySelector('.modal-title'),
    modalBodyEl: document.querySelector('.modal-body'),
    modalLinkEl: document.querySelector('.full-article'),
  };

  const i18Instance = i18next.createInstance();
  i18Instance.init({
    lng: state.lng,
    debug: false,
    resources,
  })
    .then(() => {
      const form = document.querySelector('form');
      const watchedState = makeWatchedState(
        state,
        i18Instance,
        (id) => () => {
          watchedState.activePostId = id;
          console.log(state);
          if (!state.viewedIds.includes(id)) {
            watchedState.viewedIds = [...watchedState.viewedIds, id];
          }
        },
        elements,
      );
      updateFeed(watchedState, watchedState.urls);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.status = 'sending';
        const formData = new FormData(e.target);
        makeYupSchema(watchedState.watchedUrls)
          .validate(formData.get('url'), { abortEarly: true })
          .then((url) => axios.get(buildPath(url)))
          .then((response) => {
            const parsedData = parse(response.data.contents);
            const { title, description, posts } = parsedData;
            const postsWithIds = posts.map((post) => ({
              id: _.uniqueId(),
              ...post,
            }));
            watchedState.feeds = [...watchedState.feeds, { title, description }];
            watchedState.posts = [...postsWithIds, ...watchedState.posts];
            watchedState.watchedUrls = [...watchedState.watchedUrls, formData.get('url')];
            watchedState.status = 'successful';
          })
          .catch((err) => {
            if (err.name === 'AxiosError') {
              watchedState.status = 'networkError';
            } else {
              const [error] = err.errors;
              watchedState.status = error;
            }
          });
      });
    });
};
