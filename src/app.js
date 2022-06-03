import onChange from 'on-change'
import { string } from 'yup'
import { renderFeedback, renderRss } from './renderers.js'
import i18next from 'i18next'
import resources from './locales/index.js'
import axios from 'axios'
import parse from './parser.js'

const isValid = (urls) => string().url('invalid').notOneOf(urls, 'existing')

export default (initialState = {}) => {
  const defaultLanguage = 'ru';
  const state = {
    lng: defaultLanguage,
    status: null,
    urlInput: '',
    watchedUrls: [],
    feeds: [],
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
      const feedContainer = document.querySelector('.container-xxl')
      const watchedState = onChange(state, (path, value) => {
        if (path.match(/^status/)) {
          renderFeedback(feedbackEl, value, inputEl, i18Instance)
        }
        if (path.match(/^watchedUrls/)) {
          const lastUrl = value[value.length - 1];
          console.log(value)
          axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(lastUrl)}`)
            .then((response) =>parse(response.data.contents))
            .catch((e) => watchedState.status = 'invalid')
            .then((parsedData) => watchedState.feeds = [...watchedState.feeds, parsedData])
          // 
        }
        if (path.match(/^feeds/)) {
          console.log(value);
          renderRss(feedContainer, value, i18Instance)
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
