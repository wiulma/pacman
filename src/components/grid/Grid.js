import DomUitls from "../../utils/Dom"
import template from "./Grid.html?raw"
import { BOARD_SIZE, LAYOUT } from "./GridLayout"
import { Ghost } from "./Ghost"

import "./Grid.css"
import { EATEN_DOT, EATEN_GHOST, EATEN_PELLET } from "../score/ScorePoints"
import { GHOST_SCARED_TIMEOUT } from "../game/GameSettings"

customElements.define(
  "app-grid",
  class extends HTMLElement {
    squares = []
    pacmanPosition = -1
    score = 0
    directions = [1, -1, BOARD_SIZE, -BOARD_SIZE]
    powerPelletCells = []

    constructor() {
      super()
    }

    connectedCallback() {
      const n = DomUitls.htmlToElement(template)
      this.appendChild(n)
      this.addEvents()
    }

    resetGame() {
      this.squares = []
      this.pacmanPosition = -1
      this.score = 0
      this.powerPelletCells = []
      this.pacmanPosition = 490
    }

    createBoard() {
      const container = this.querySelector(".grid")
      container.innerHTML = ""
      const frag = document.createDocumentFragment()
      for (let i = 0, l = LAYOUT.length; i < l; i++) {
        const elm = document.createElement("div")
        const elmValue = LAYOUT[i]
        elm.classList.add("cell")
        if (elmValue === 0) {
          elm.classList.add("pac-dot")
        } else if (elmValue === 1) {
          elm.classList.add("wall")
        } else if (elmValue === 2) {
          elm.classList.add("ghost-lair")
        } else if (elmValue === 3) {
          elm.classList.add("power-pellet")
          this.powerPelletCells.push(i)
        }
        frag.appendChild(elm)
        this.squares.push(elm)
      }
      container.appendChild(frag)
    }

    addEvents() {
      document.addEventListener("keyup", this.onkeyUp.bind(this))
      document.addEventListener("startgame", this.startGame.bind(this))
    }

    onkeyUp(evt) {
      if (this.pacmanPosition < 0 || ![38, 40, 37, 39].includes(evt.keyCode)) return false
      this.squares[this.pacmanPosition].classList.remove("pacman")
      switch (evt.keyCode) {
        case 38: // arrow up
          this.moveUp()
          break

        case 40: // arrow down
          this.moveDown()
          break

        case 37: // arrow left
          this.moveLeft()
          break

        case 39: // arrow right
          this.moveRight()
          break
      }
      this.squares[this.pacmanPosition].classList.add("pacman")
      this.pacDotEaten()
      this.powerPelletEaten()
      this.pacGhostEaten()
      this.pacGameOver()
    }

    startGame() {
      this.resetGame()
      this.createBoard()
      this.squares[this.pacmanPosition].classList.add("pacman")
      this.setupGhosts()
    }

    moveLeft() {
      if (this.pacmanPosition % BOARD_SIZE > 0 && this.canMove(this.pacmanPosition - 1)) {
        this.pacmanPosition -= 1
      }
    }
    moveRight() {
      if (
        this.pacmanPosition % BOARD_SIZE !== BOARD_SIZE - 1 &&
        this.canMove(this.pacmanPosition + 1)
      ) {
        this.pacmanPosition += 1
      }
    }
    moveUp() {
      if (this.pacmanPosition - BOARD_SIZE >= 0 && this.canMove(this.pacmanPosition - BOARD_SIZE)) {
        this.pacmanPosition -= BOARD_SIZE
      }
    }
    moveDown() {
      if (
        this.pacmanPosition + BOARD_SIZE < LAYOUT.length &&
        this.canMove(this.pacmanPosition + BOARD_SIZE)
      ) {
        this.pacmanPosition += BOARD_SIZE
      }
    }

    canMove(nextIndex) {
      const cl = this.squares[nextIndex].classList
      return !cl.contains("ghost-lier") && !cl.contains("wall")
    }

    // pacman movement
    pacDotEaten() {
      if (this.squares[this.pacmanPosition].classList.contains("pac-dot")) {
        this.score += EATEN_DOT
        this.updateScore()
        this.squares[this.pacmanPosition].classList.remove("pac-dot")
      }
    }

    pacGhostEaten() {
      this.ghosts.forEach((g) => {
        if (!!g.isScared) {
          if (this.squares[g.currentIndex].classList.contains("pacman")) {
            this.squares[g.currentIndex].classList.remove("ghost", g.className, "scared-ghost")
            g.currentIndex = g.startIndex
            this.squares[g.currentIndex].classList.add("ghost", g.className)
            this.score += EATEN_GHOST
          }
        }
      })
    }

    pacGameOver() {
      const pacmanSquareClass = this.squares[this.pacmanPosition].classList
      if (pacmanSquareClass.contains("pacman") && pacmanSquareClass.contains("ghost")) {
        const ghost = this.ghosts.some((g) => g.currentIndex === this.pacmanPosition)
        if (ghost) {
          this.raiseGameOver()
        }
      }
    }

    stopEvents() {
      this.ghosts.forEach((g) => clearInterval(g.timerId))
      document.removeEventListener("keyup", this.onkeyUp)
    }

    raiseGameOver() {
      this.stopEvents()
      setTimeout(() => alert(`Game over!! Your score is ${this.score}`, 500))
    }

    raiseWin() {
      this.stopEvents()
      setTimeout(() => alert(`YOU WIN!! Your score is ${this.score}`, 500))
    }

    powerPelletEaten() {
      if (this.squares[this.pacmanPosition].classList.contains("power-pellet")) {
        this.score += EATEN_PELLET

        this.ghosts.forEach((g) => {
          g.isScared = true
          this.squares[g.currentIndex].classList.add("ghost-scared")
          setTimeout(() => {
            g.isScared = false
            this.squares[g.currentIndex].classList.remove("ghost-scared")
          }, GHOST_SCARED_TIMEOUT)
        })
        this.squares[this.pacmanPosition].classList.remove("power-pellet")
        this.powerPelletCells = this.powerPelletCells.filter((v) => v !== this.pacmanPosition)
        this.checkForWin()
      }
    }
    checkForWin() {
      if (this.powerPelletCells.length === 0) {
        this.raiseWin()
      }
    }

    // score
    updateScore() {
      const evt = new CustomEvent("updatescore", { detail: this.score })
      document.dispatchEvent(evt)
    }

    // ghosts functions

    setupGhosts() {
      this.createGhosts()
      this.startGhosts()
    }

    createGhosts() {
      this.ghosts = [
        new Ghost("blinky", 348, 250),
        new Ghost("pinky", 376, 400),
        new Ghost("inky", 351, 300),
        new Ghost("clyde", 379, 500),
      ]
    }

    startGhosts() {
      this.ghosts.forEach((g) => this.moveGhost(g))
    }

    moveGhost(g) {
      let moveStep = this.directions[Math.floor(Math.random() * this.directions.length)]
      g.timerId = setInterval(() => {
        if (this.canGhostMove(g.currentIndex + moveStep)) {
          this.squares[g.currentIndex].classList.remove("ghost", g.className, "scared-ghost")
          g.currentIndex = g.currentIndex + moveStep
          this.squares[g.currentIndex].classList.add("ghost", g.className)
          if (!!g.isScared) {
            this.squares[g.currentIndex].classList.add("scared-ghost")
          }
        } else moveStep = this.directions[Math.floor(Math.random() * this.directions.length)]

        window.requestAnimationFrame(() => {
          if (this.squares[g.currentIndex].classList.contains("pacman")) {
            this.raiseGameOver()
          }
        })
      }, g.speed)
    }

    canGhostMove(idx) {
      const cl = this.squares[idx].classList
      return !cl.contains("wall") && !cl.contains("ghost")
    }
  }
)
