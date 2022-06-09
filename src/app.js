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
        const newPosts = _.differenceBy(postsAll, Array.from(state.posts), 'text');
        if (newPosts.length !== 0) { state.posts = [...newPosts, ...state.posts]; }
      })
      .catch((e) => console.log(e))
      .finally(() => setTimeout(cb, 5000));
  };
  setTimeout(cb, 5000);
};

// const openModalHandler = (state, id) => () => {
//   state.activePostId = id;
//   console.log(state);
//   if (!state.viewedIds.includes(id)) {
//     state.viewedIds = [...state.viewedIds, id];
//   }
// };

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
  const i18Instance = i18next.createInstance();
  i18Instance.init({
    lng: state.lng,
    debug: false,
    resources,
  })
    .then(() => {
      const form = document.querySelector('form');
      const inputEl = document.getElementById('url-input');
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
      );
      updateFeed(watchedState, watchedState.urls);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
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
            inputEl.value = '';
            inputEl.focus();
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
