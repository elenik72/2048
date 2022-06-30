import './style.css'
import Keyboard from './keyboard'
import Logger from './logger'
import Settings from './settings'

const SIZE_WIDTH = 4
const SIZE_HEIGHT = 4
const MOVE_TIME_MS = 250

const logger = Logger.make(console)
const settings = Settings.make({ width: SIZE_WIDTH, height: SIZE_HEIGHT, delay: MOVE_TIME_MS })

function wait (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

function create () {
  wait(settings.delay).then(() => {
    game.clearChildNode()
    game.render()
  })
}

class Game {
  #controls = {
    w: () => this.moving('up'),
    s: () => this.moving('down'),
    d: () => this.moving('right'),
    a: () => this.moving('left')
  }

  constructor() {
    this.keyboard = Keyboard.make({ logger, controls: this.#controls })
    this.container = document.getElementById('playfield')
    this.field = Array.from(Array(settings.height), () =>
      new Array(settings.width).fill({
        number: 0,
        position: {
          top: 0,
          left: 0
        },
        isChange: false
      })
    )
    this.copyField = [...this.field]

    this.y = Math.floor(Math.random() * 4)
    this.x = Math.floor(Math.random() * 4)

    this.eatFlag = false
    this.count = 0

    this.random()
    this.render()
  }

  checkRand(y, x) {
    if (this.field[y][x].number > 0) return true
    else false
  }

  random() {
    do {
      this.y = Math.floor(Math.random() * 4)
      this.x = Math.floor(Math.random() * 4)
    } while (this.checkRand(this.y, this.x))

    this.field[this.y][this.x] = {
      number: Math.floor(Math.random() + 1 * 2),
      position: {
        top: this.y * 100,
        left: this.x * 100
      },
      isChange: false
    }
  }

  clear(i, j) {
    this.field[i][j] = {
      number: 0,
      position: {
        top: 0,
        left: 0
      },
      isChange: false
    }
  }

  clearChildNode() {
    for (let i = this.container.childNodes.length - 1; i >= 0; i--) {
      if (
        this.container.childNodes[i].classList &&
        this.container.childNodes[i].classList[0] === 'thing'
      ) {
        this.container.removeChild(this.container.childNodes[i])
      }
    }
  }

  randomView() {
    if (this.eatFlag) this.random()
    this.eatFlag = false
  }

  moving(direct) {
    let startY, startX, endX, endY, state, condition, modX, modY, mod
    switch (direct) {
      case 'up':
        startY = 0
        endY = settings.height
        startX = 0
        endX = settings.width
        state = 'vector >= 0'
        condition = 0
        modY = -1
        modX = -1
        mod = -1
        break
      case 'down':
        startY = settings.height - 1
        endY = 0
        startX = settings.width - 1
        endX = 0
        state = 'vector < SIZE_HEIGHT'
        condition = settings.height - 1
        modY = 1
        modX = 1
        mod = 1
        break
      case 'right':
        startY = settings.height - 1
        endY = 0
        startX = settings.height - 1
        endX = 0
        state = 'vector < SIZE_WIDTH'
        condition = SIZE_WIDTH - 1
        modX = 1
        modY = -1
        mod = 1
        break
      case 'left':
        startY = 0
        endY = settings.width
        startX = settings.height - 1
        endX = 0
        state = 'vector >= 0'
        condition = 0
        modX = 1
        modY = 1
        mod = -1
        break
    }
    for (let i = startY; mod < 0 ? i < endY : i >= endY; i += -1 * mod) {
      for (let j = startX; modX < 0 ? j < endX : j >= endX; j += -1 * modX) {
        let handlerDirect = direct === 'up' || direct === 'down' ? true : false

        let ii = handlerDirect ? i : j
        let jj = handlerDirect ? j : i

        if (this.field[ii][jj].number > 0 && this.field[ii][jj].number < 2048) {
          let number = this.field[ii][jj].number
          let top = this.field[ii][jj].position.top
          let left = this.field[ii][jj].position.left

          let getElement = document.getElementById(`${ii}${jj}`).style

          this.clear(ii, jj)

          let vector = i

          for (vector; state; vector += mod) {
            let dx = handlerDirect ? j : vector + 1 * mod //следующий
            let dy = handlerDirect ? vector + 1 * mod : j //следующий

            let dX = handlerDirect ? j : vector //текущий
            let dY = handlerDirect ? vector : j //текущий

            //условие остановки и принятие решения
            if (
              (vector !== condition && this.field[dy][dx].number > 0) ||
              vector === condition
            ) {
              let coord = top
              let coordL = left

              this.field[dY][dX] = {
                ...this.field[dY][dX],
                number,
                position: {
                  top: handlerDirect ? dY * 100 : top,
                  left: handlerDirect ? left : dX * 100
                }
              }
              coord = this.field[dY][dX].position.top
              coordL = this.field[dY][dX].position.left

              if (top !== coord || coordL !== left) this.eatFlag = true

              handlerDirect
                ? (getElement.top =
                    vector !== condition &&
                    this.field[dY][dX].isChange === false &&
                    this.field[dy][dx].isChange === false &&
                    this.field[dY][dX].number === this.field[dy][dx].number
                      ? `${dY * 100 + 100 * modY}px`
                      : `${dY * 100}px`)
                : (getElement.left =
                    vector !== condition &&
                    this.field[dY][dX].isChange === false &&
                    this.field[dy][dx].isChange === false &&
                    this.field[dY][dX].number === this.field[dy][dx].number
                      ? `${dX * 100 + 100 * mod}px`
                      : `${dX * 100}px`)

              if (
                vector !== condition &&
                this.field[dY][dX].number === this.field[dy][dx].number &&
                this.field[dY][dX].isChange === false &&
                this.field[dy][dx].isChange === false
              ) {
                this.clear(dY, dX)
                this.field[dy][dx] = {
                  ...this.field[dy][dy],
                  number: number * 2,
                  position: {
                    top: handlerDirect ? dY * 100 + 100 * modY : top,
                    left: handlerDirect ? left : dX * 100 + 100 * mod
                  },
                  isChange: true
                }
                if (this.field[dy][dx].number >= 2048) {
                  location.href = 'https://youtu.be/dQw4w9WgXcQ?t=85'

                  document.getElementById('end-box').style.display = 'block'
                }
                if (top === coord || left === coordL) this.eatFlag = true
              }
              break
            }
          }
        }
      }
      create()
    }

    for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
        this.field[i][j] = {
          ...this.field[i][j],
          isChange: false
        }
      }
    }

    this.randomView()
  }

  render() {
    for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
        if (this.field[i][j].number > 0) {
          let id = i === 0 ? '0' + `${j}` : i * 10 + j
          this.container.insertAdjacentHTML(
            'afterBegin',
            `<div class="thing t${this.field[i][j].number}" id=${id} style="top: ${this.field[i][j].position.top}px; left: ${this.field[i][j].position.left}px;"></div>`
          )
        }
      }
    }
  }
}

const game = new Game()
