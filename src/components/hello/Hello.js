import DomUtils from "../../utils/Dom"
import template from "./Hello.html?raw"

customElements.define(
  "app-helloworld",
  class extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      const n = DomUtils.htmlToElement(template)
      this.appendChild(n)
    }
  }
)
