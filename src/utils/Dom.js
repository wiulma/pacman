export default {
  htmlToHTMLCollection(html) {
    const tmpl = document.createElement("template")
    tmpl.innerHTML = html
    return tmpl.content.children
  },

  htmlToElement(html) {
    const tmpl = document.createElement("template")
    tmpl.innerHTML = html
    return tmpl.content.firstChild
  },
}
