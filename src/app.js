import onChange from 'on-change'
import { string } from 'yup'
import { renderFeedback, renderRss } from './renderers.js'
import i18next from 'i18next'
import resources from './locales/index.js'

const isValid = (urls) => string().url('invalid').notOneOf(urls, 'existing')

export default (initialState = {}) => {
  const defaultLanguage = 'ru';
  const state = {
    lng: defaultLanguage,
    status: null,
    urlInput: '',
    watchedUrls: [],
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
          renderRss(feedContainer, value, i18Instance.t('texts'))
        }
      })
      inputEl.addEventListener('input', (e) => {
        watchedState.urlInput = e.target.value
        // console.log(watchedState.urlInput)
        // schema.isValid(watchedState.urlInput)
        //   .then((e) => console.log(e))
        //   .catch((err) => console.log(`ERROR :::: ${err}`))
      })
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        isValid(watchedState.watchedUrls).validate(watchedState.urlInput, { abortEarly: true })
          .then((isValid) => {
            watchedState.watchedUrls = [...watchedState.watchedUrls, watchedState.urlInput]
            watchedState.status = 'successful'
            inputEl.value = ''
            inputEl.focus()
          })
          .catch((e) => {
            // console.log(e)
            watchedState.status = e.errors[0]
            // console.log(e)
            // console.log(e.errors)
          })
      })
    })

}
