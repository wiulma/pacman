import DomUtils from "../../utils/Dom"
import template from "./VirtualPad.html?raw"

import "./VirtualPad.css"

customElements.define(
  "app-virtual-pad",
  class extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      if (DomUtils.needMobileLayout()) {
        const n = DomUtils.htmlToElement(template)
        this.appendChild(n)
        this.addEvents()
      }
    }

    addEvents() {
      document.getElementById("virtualBtnLeft").addEventListener("click", () => this.raiseKeyUp("ArrowLeft"))
      document.getElementById("virtualBtnRight").addEventListener("click", () => this.raiseKeyUp("ArrowRight"))
      document.getElementById("virtualBtnUp").addEventListener("click", () => this.raiseKeyUp("ArrowUp"))
      document.getElementById("virtualBtnDown").addEventListener("click", () => this.raiseKeyUp("ArrowDown"))
    }

    raiseKeyUp(code) {
      const evt = new KeyboardEvent("keyup", { code })
      document.dispatchEvent(evt)
    }
  }
)
