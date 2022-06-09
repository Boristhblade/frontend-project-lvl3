function ParseError(message) {
  this.errors = ['noValidRss'];
  this.message = message || 'noValidRss';
  this.stack = (new Error()).stack;
}
ParseError.prototype = Object.create(Error.prototype);
ParseError.prototype.constructor = ParseError;

export default (data) => {
  try {
    const parser = new DOMParser();
    const htmlData = parser.parseFromString(data, 'application/xml');
    const title = htmlData.querySelector('title').textContent;
    const description = htmlData.querySelector('description').textContent;
    const items = Array.from(htmlData.querySelectorAll('item'));
    const posts = items.map((item) => {
      const text = item.querySelector('title').textContent;
      const link = item.querySelector('link').nextSibling.textContent;
      const content = item.querySelector('description').textContent;
      return {
        text,
        link,
        content,
      };
    });
    return { title, description, posts };
  } catch (e) {
    throw new ParseError();
  }
};
