import DomUtils from "../../utils/Dom"
import template from "./Game.html?raw"

import "./Game.css"

import "../grid/Grid"
import "../score/Score"
import "../virtualpad/VirtualPad"
import "../gameover/GameOver"
import "../gamewin/GameWin"

import { CUSTOM_CLAIM, DEFAULT_CLAIM } from "./Claim"

const BIRTH = "20200909"

function getClaimContent() {
  const today = new Date()
  let claim = DEFAULT_CLAIM
  if (today.getMonth() === parseInt(BIRTH.substring(4, 6)) - 1 && today.getDate() === parseInt(BIRTH.substring(6, 8))) {
    claim = CUSTOM_CLAIM + DEFAULT_CLAIM.charAt(0).toLocaleLowerCase() + DEFAULT_CLAIM.substring(1)
  }
  return claim
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
      })

      document.addEventListener("gamewin", (evt) => {
        this.querySelector("app-gamewin").show(evt.detail)
      })
    }

    showClaim() {
      const claim = this.querySelector("#claimContainer")
      const claimShow = claim.animate([{ opacity: 0 }, { opacity: 1 }])
      claimShow.onfinish = (event) => claim.classList.remove("hidden")
    }
  }
)
