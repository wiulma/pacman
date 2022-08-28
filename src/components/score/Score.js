import DomUtils from "../../utils/Dom"
import template from "./Score.html?raw"

import "./Score.css"

customElements.define(
  "app-score",
  class extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      const n = DomUtils.htmlToElement(template)
      this.appendChild(n)
      this.scoreNode = this.querySelector("#score")
      document.addEventListener("updatescore", (evt) => {
        this.scoreNode.innerHTML = evt.detail
      })
    }
  }
)
