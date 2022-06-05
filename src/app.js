import onChange from 'on-change';
import { string } from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import { renderFeedback, renderFeeds, renderPosts } from './renderers.js';
import resources from './locales/index.js';

import parse from './parser.js';
import buildPath from './path.js';

const isValid = (urls) => string().url('invalid').notOneOf(urls, 'existing');

const updateFeed = (state) => {
  console.log('UPDATE FEED');
  const cb = () => {
    Promise.all(state.watchedUrls.map((url) => axios.get(buildPath(url))))
      .then((responseArr) => {
        console.log(responseArr);
        const postsAll = responseArr.reduce((acc, item) => {
          const { posts } = parse(item.data.contents);
          console.log('POSTS :::::::::::');
          console.log(posts);
          return [...acc, ...posts];
        }, []);
        // ;
        const newPosts = _.differenceBy(state.posts, postsAll, 'link');
        if (newPosts.length !== 0) { state.posts = [...newPosts, ...state.posts]; }
        setTimeout(cb, 5000);
      })
      .catch((e) => {
        console.log(e);
        setTimeout(cb, 5000);
      });
  };
  setTimeout(cb, 5000);
};

export default () => {
  const defaultLanguage = 'ru';
  const state = {
    lng: defaultLanguage,
    status: null,
    urlInput: '',
    watchedUrls: [],
    feeds: [],
    posts: [],
    errors: {},
  };
  const i18Instance = i18next.createInstance();
  i18Instance.init({
    lng: state.lng,
    debug: false,
    resources,
  })
    .then((t) => {
      const form = document.querySelector('form');
      const inputEl = document.getElementById('url-input');
      const feedbackEl = document.querySelector('.text-danger');
      const feedsEl = document.querySelector('.feeds');
      const postsEl = document.querySelector('.posts');
      const watchedState = onChange(state, (path, value) => {
        if (path.match(/^status/)) {
          renderFeedback(feedbackEl, value, inputEl, i18Instance);
        }
        if (path.match(/^feeds/)) {
          renderFeeds(feedsEl, value, i18Instance);
        }
        if (path.match(/^posts/)) {
          renderPosts(postsEl, value, i18Instance);
        }
      });
      updateFeed(watchedState, watchedState.urls);
      inputEl.addEventListener('input', (e) => {
        watchedState.urlInput = e.target.value;
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        isValid(watchedState.watchedUrls)
          .validate(watchedState.urlInput, { abortEarly: true })
          .then((isValid) => {
            watchedState.watchedUrls = [...watchedState.watchedUrls, watchedState.urlInput];
            watchedState.status = 'successful';
            inputEl.value = '';
            inputEl.focus();
            return watchedState.urlInput;
          })
          .catch(({ errors }) => {
            console.log(errors[0]);
            const [error] = errors;
            watchedState.status = error;
          })
          .then((url) => axios.get(buildPath(url)))
          .then((response) => parse(response.data.contents))
          .catch((e) => {
            console.log(`PARSER ERROR app.js :60 ${e}`);
            watchedState.status = 'invalid';
          })
          .then((parsedData) => {
            const { title, description, posts } = parsedData;
            watchedState.feeds = [...watchedState.feeds, { title, description }];
            watchedState.posts = [...posts, ...watchedState.posts];
          });
      });
    });
};
