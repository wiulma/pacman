import DomUtils from "../../utils/Dom"
import template from "./Game.html?raw"

import "./Game.css"

import "../grid/Grid"
import "../score/Score"

customElements.define(
  "app-game",
  class extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      this.append(...DomUtils.htmlToHTMLCollection(template))
      this.querySelector("#btnStartGame").addEventListener("click", () =>
        document.dispatchEvent(new CustomEvent("startgame"))
      )
    }
  }
)
