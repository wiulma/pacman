import DomUtils from "../../utils/Dom"
import template from "./Game.html?raw"

import "./Game.css"

import "../grid/Grid"
import "../score/Score"
import "../virtualpad/VirtualPad"
import "../gameover/GameOver"
import "../gamewin/GameWin"
import "../gamewinbirth/GameWinBirth"

import { DEFAULT_CLAIM } from "./Claim"

function isBirthday() {
  return false
}

function getClaimContent() {
  return DEFAULT_CLAIM
}

customElements.define(
  "app-game",
  class extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      this.append(...DomUtils.htmlToHTMLCollection(template))

      this.querySelector("#claim-content").innerText = getClaimContent()

      setTimeout(() => this.showClaim(), 1000)

      this.querySelector("#btnStartGame").addEventListener("click", () =>
        document.dispatchEvent(new CustomEvent("startgame"))
      )

      this.querySelector("#btnClaimStartGame").addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("startgame"))
        document.querySelector("#claimContainer").classList.add("hidden")
        document.querySelector("#game-container").classList.remove("hidden")
      })

      document.addEventListener("gameover", (evt) => {
        this.querySelector("app-gameover").show(evt.detail)
        document.getElementById("pacman_death").play()
      })

      document.addEventListener("gamewin", (evt) => {
        this.querySelector(isBirthday() ? "app-gamewinbirth" : "app-gamewin").show(evt.detail)
        setTimeout(() => document.getElementById("pacman_win").play(), 200)
      })
    }

    showClaim() {
      const claim = this.querySelector("#claimContainer")
      const claimShow = claim.animate([{ opacity: 0 }, { opacity: 1 }])
      claimShow.onfinish = (event) => claim.classList.remove("hidden")
    }
  }
)
