import onChange from 'on-change'
import { string } from 'yup'
import { renderFeedback, renderFeeds, renderPosts } from './renderers.js'
import i18next from 'i18next'
import resources from './locales/index.js'
import axios from 'axios'
import parse from './parser.js'
import buildPath from './path.js'

const isValid = (urls) => string().url('invalid').notOneOf(urls, 'existing')

const updateFeed = (state, value) => {
  const cb = () => {
    Promise.all(value.map(url => axios.get(buildPath(url))))
      .then((data) => {
        const newPosts = _.differenceBy(state.posts, data, 'link')
        if (newPosts.length !== 0) { state.posts = [...newPosts, ...state.posts] }
        setTimeout(cb, 5000)
      })
  }
  setTimeout(cb, 5000)
}

export default (initialState = {}) => {
  const defaultLanguage = 'ru';
  const state = {
    lng: defaultLanguage,
    status: null,
    urlInput: '',
    watchedUrls: [],
    feeds: [],
    posts: [],
    errors: {}
  };
  const i18Instance = i18next.createInstance()
  i18Instance.init({
    lng: state.lng,
    debug: false,
    resources,
    })
    .then((t) => {
      const form = document.querySelector('form')
      const inputEl = document.getElementById('url-input')
      const feedbackEl = document.querySelector('.text-danger')
      const feedsEl = document.querySelector('.feeds')
      const postsEl = document.querySelector('.posts')
      const watchedState = onChange(state, (path, value) => {
        if (path.match(/^status/)) {
          renderFeedback(feedbackEl, value, inputEl, i18Instance)
        }
        if (path.match(/^watchedUrls/)) {
          const lastUrl = value[value.length - 1];
          console.log(value)
          axios.get(buildPath(lastUrl))
            .then((response) =>parse(response.data.contents))
            .catch((e) => {
              console.log(`PARSER ERROR app.js :43 ${e}`)
              watchedState.status = 'invalid'
            })
            .then((parsedData) => {
              const { title, description, posts } = parsedData
              watchedState.feeds = [...watchedState.feeds, { title, description }]
              watchedState.posts = [...posts, ...watchedState.posts]
              updateFeed(watchedState, value)
            })
          // 
        }
        if (path.match(/^feeds/)) {
          renderFeeds(feedsEl, value, i18Instance)
        }
        if (path.match(/^posts/)) {
          renderPosts(postsEl, value, i18Instance)
        }
      })
      inputEl.addEventListener('input', (e) => {
        watchedState.urlInput = e.target.value
      })
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        isValid(watchedState.watchedUrls)
          .validate(watchedState.urlInput, { abortEarly: true })
          .then((isValid) => {
            watchedState.watchedUrls = [...watchedState.watchedUrls, watchedState.urlInput]
            watchedState.status = 'successful'
            inputEl.value = ''
            inputEl.focus()
          })
          .catch((e) => {
            console.log(e.errors[0])
            watchedState.status = e.errors[0]
          })
      })
    })

}
