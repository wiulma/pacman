import DomUitls from "../../utils/Dom"
import template from "./Grid.html?raw"
import { GRID_CONFIG } from "./GridLayout"
import { Ghost } from "./Ghost"

import "./Grid.css"
import { EATEN_DOT, EATEN_GHOST, EATEN_PELLET } from "../score/ScorePoints"
import { GHOST_SCARED_TIMEOUT } from "../game/GameSettings"

const BOARD_CONFIG = DomUitls.needMobileLayout() ? GRID_CONFIG.MOBILE : GRID_CONFIG.DESKTOP

const PACMAN_CLASSES = ["left", "right", "up", "down"]

customElements.define(
  "app-grid",
  class extends HTMLElement {
    squares = []
    pacmanPosition = -1
    score = 0
    directions = [1, -1, BOARD_CONFIG.BOARD_WIDTH, -BOARD_CONFIG.BOARD_WIDTH]
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
      this.score = 0
      this.powerPelletCells = []
      this.pacmanPosition = 490
    }

    createBoard() {
      const container = this.querySelector(".grid")
      container.innerHTML = ""
      const frag = document.createDocumentFragment()
      for (let i = 0, l = BOARD_CONFIG.LAYOUT.length; i < l; i++) {
        const elm = document.createElement("div")
        const elmValue = BOARD_CONFIG.LAYOUT[i]
        elm.classList.add("cell")
        if (elmValue === 0) {
          elm.classList.add("dot")
          const dot = document.createElement("div")
          dot.classList.add("pac-dot")
          elm.append(dot)
        } else if (elmValue === 1) {
          elm.classList.add("wall")
        } else if (elmValue === 2) {
          elm.classList.add("ghost-lair")
        } else if (elmValue === 3) {
          elm.classList.add("power-pellet")
          this.powerPelletCells.push(i)
        }
        if (elmValue === 0 || elmValue === 2 || elmValue === 3 || elmValue === 4) {
          elm.classList.add("cell-border", ...this.getWallBorder(BOARD_CONFIG, i))
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
      if (this.pacmanPosition < 0 || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evt.code))
        return false
      this.squares[this.pacmanPosition].classList.remove("characters", "pacman", [...PACMAN_CLASSES])
      switch (evt.code) {
        case "ArrowUp": // arrow up
          this.moveUp()
          break

        case "ArrowDown": // arrow down
          this.moveDown()
          break

        case "ArrowLeft": // arrow left
          this.moveLeft()
          break

        case "ArrowRight": // arrow right
          this.moveRight()
          break
      }
      this.squares[this.pacmanPosition].classList.add(
        "characters",
        "pacman",
        evt.code.replace("Arrow", "").toLowerCase()
      )
      this.pacDotEaten()
      this.powerPelletEaten()
      this.pacGhostEaten()
      this.pacGameOver()
    }

    startGame() {
      document.getElementById("pacman_beginning").play()
      this.resetGame()
      this.createBoard()
      this.squares[this.pacmanPosition].innerHTML = ""
      this.squares[this.pacmanPosition].classList.add("characters", "pacman", "left")
      this.setupGhosts()
    }

    moveLeft() {
      if (this.pacmanPosition % BOARD_CONFIG.BOARD_WIDTH > 0 && this.canMove(this.pacmanPosition - 1)) {
        this.pacmanPosition -= 1
      }
    }

    moveRight() {
      if (
        this.pacmanPosition % BOARD_CONFIG.BOARD_WIDTH !== BOARD_CONFIG.BOARD_WIDTH - 1 &&
        this.canMove(this.pacmanPosition + 1)
      ) {
        this.pacmanPosition += 1
      }
    }

    moveUp() {
      if (
        this.pacmanPosition - BOARD_CONFIG.BOARD_WIDTH >= 0 &&
        this.canMove(this.pacmanPosition - BOARD_CONFIG.BOARD_WIDTH)
      ) {
        this.pacmanPosition -= BOARD_CONFIG.BOARD_WIDTH
      }
    }
    moveDown() {
      if (
        this.pacmanPosition + BOARD_CONFIG.BOARD_WIDTH < BOARD_CONFIG.LAYOUT.length &&
        this.canMove(this.pacmanPosition + BOARD_CONFIG.BOARD_WIDTH)
      ) {
        this.pacmanPosition += BOARD_CONFIG.BOARD_WIDTH
      }
    }

    canMove(nextIndex) {
      const cl = this.squares[nextIndex].classList
      return !cl.contains("ghost-lier") && !cl.contains("wall")
    }

    // pacman movement
    pacDotEaten() {
      if (this.squares[this.pacmanPosition].classList.contains("dot")) {
        this.squares[this.pacmanPosition].innerHTML = ""
        this.score += EATEN_DOT
        this.updateScore()
        this.squares[this.pacmanPosition].classList.remove("dot")
        document.getElementById("pacman_chomp").play()
      }
    }

    pacGhostEaten() {
      this.ghosts.forEach((g) => {
        if (!!g.isScared) {
          if (this.squares[g.currentIndex].classList.contains("pacman")) {
            debugger
            this.squares[g.currentIndex].classList.remove("ghost", g.className, "scared-ghost")
            g.currentIndex = g.startIndex
            this.squares[g.currentIndex].classList.add("ghost", "characters", g.className)
            this.score += EATEN_GHOST
            document.getElementById("pacman_eatghost").play()
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
      document.dispatchEvent(new CustomEvent("gameover", { detail: this.score }))
    }

    raiseWin() {
      this.stopEvents()
      document.dispatchEvent(new CustomEvent("gamewin", { detail: this.score }))
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
        document.getElementById("pacman_eatfruit").play()
        this.checkForWin()
      }
    }

    checkForWin() {
      if (this.powerPelletCells.length === 0) {
        this.raiseWin()
      }
    }

    getWallBorder(gameConfig, idx) {
      const wallVal = 1
      const boardWidth = gameConfig.BOARD_WIDTH
      const board = gameConfig.LAYOUT
      const cellTopIdx = idx - boardWidth > 0 ? idx - boardWidth : null
      const cellRightIdx = idx % boardWidth !== boardWidth - 1 ? idx + 1 : null
      const cellLeftIdx = idx % boardWidth > 0 ? idx - 1 : null
      const cellBottomIdx = idx + boardWidth < board.length ? idx + boardWidth : null

      const config = {
        top: cellTopIdx && board[cellTopIdx] === wallVal,
        right: cellRightIdx && board[cellRightIdx] === wallVal,
        left: cellLeftIdx && board[cellLeftIdx] === wallVal,
        bottom: cellBottomIdx && board[cellBottomIdx] === wallVal,
      }

      return Object.entries(config).reduce((acc, [k, val]) => {
        if (val) {
          acc.push(k + "-border")
        }
        return acc
      }, [])
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
      const startPosition = BOARD_CONFIG.GHOSTS_START
      this.ghosts = [
        new Ghost("blinky", startPosition[0], 250),
        new Ghost("pinky", startPosition[1], 400),
        new Ghost("inky", startPosition[2], 300),
        new Ghost("clyde", startPosition[3], 500),
      ]
      this.ghosts.forEach((g) => this.squares[g.currentIndex].classList.add("ghost", "characters", g.className))
    }

    startGhosts() {
      this.ghosts.forEach((g) => this.moveGhost(g))
    }

    moveGhost(g) {
      let moveStep = this.directions[Math.floor(Math.random() * this.directions.length)]
      g.timerId = setInterval(() => {
        if (this.canGhostMove(g.currentIndex + moveStep)) {
          this.squares[g.currentIndex].classList.remove("ghost", "characters", g.className, "scared-ghost")
          g.currentIndex = g.currentIndex + moveStep
          this.squares[g.currentIndex].classList.add("ghost", "characters", g.className)
          if (!!g.isScared) {
            this.squares[g.currentIndex].classList.add("characters", "scared-ghost")
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
