import onChange from 'on-change'
import { string } from 'yup'
import { renderFeedback, renderRss } from './renderers.js'

const isValid = (urls) => string().url('invalid').notOneOf(urls, 'existing')

export default () => {
  const state = {
    status: null,
    urlInput: '',
    watchedUrls: [],
    errors: {}
  }

  const form = document.querySelector('form')
  const inputEl = document.getElementById('url-input')
  const feedbackEl = document.querySelector('.text-danger')
  const feedContainer = document.querySelector('.container-xxl')
  const watchedState = onChange(state, (path, value) => {
    if (path.match(/^status/)) {
      renderFeedback(feedbackEl, value, inputEl)
    }
    if (path.match(/^watchedUrls/)) {
      renderRss(feedContainer, value)
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
        console.log(e)
        watchedState.status = e.errors[0]
        // console.log(e)
        // console.log(e.errors)
      })
  })
}
