import DomUtils from "../../utils/Dom"

import template from "./GameWin.html?raw"

import "./GameWin.css"

customElements.define(
  "app-gamewin",
  class extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      const n = DomUtils.htmlToElement(template)
      this.appendChild(n)
      this.querySelector("#btnRestartGame").addEventListener("click", () => {
        document.querySelector("#game-container").classList.remove("hidden")
        document.getElementById("gameWinDialog").close()
        document.dispatchEvent(new CustomEvent("startgame"))
      })
    }

    show(data) {
      document.querySelector("#game-container").classList.add("hidden")
      document.getElementById("gameWinDialog").showModal()
    }
  }
)
