import DomUtils from "../../utils/Dom"

import template from "./GameOver.html?raw"

import "./GameOver.css"

customElements.define(
  "app-gameover",
  class extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      const n = DomUtils.htmlToElement(template)
      this.appendChild(n)
      this.querySelector("#btnRestartGame").addEventListener("click", () => {
        document.querySelector("#game-container").classList.remove("hidden")
        document.getElementById("gameOverDialog").close()
        document.dispatchEvent(new CustomEvent("startgame"))
      })
    }

    show(data) {
      console.log("dialog gameover data", data)
      document.querySelector("#game-container").classList.add("hidden")
      document.getElementById("gameOverDialog").showModal()
    }
  }
)
