export default (data) => {
  const parser = new DOMParser;
  const htmlData = parser.parseFromString(data, 'application/xml')
  const errors = parser.querySelector('parsererror')
  console.log(htmlData)
  console.log(`ERRORS: ${errors}`)
  // if (errors) { throw new Error(errors) }
  const title = htmlData.querySelector('title').textContent
  const description = htmlData.querySelector('description').textContent
  const items = Array.from(htmlData.querySelectorAll('item'))
  const posts = items.map(item => {
    const text = item.querySelector('title').textContent
    const link = item.querySelector('link').nextSibling.textContent
    return {
      text,
      link,
    }
  })
  console.log(posts)
  return { title, description, posts }
}
