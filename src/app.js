import "./style.css";

/*
              Пример игры: http://gabrielecirulli.github.io/2048/ только в нем ходы делаются с помощью клавиатуры
              Правила игры.
              В каждом раунде появляется плитка номинала «2» (с вероятностью 90 %) или «4» (с вероятностью 10 %).
              В начале игры на поле находится 1 клетка.
              Чтобы сделать ход, игрок должен зажать левую кнопку мыши и переместить курсор в одном из четырех направлений.
              Все клетку с числами при этом сдивгаются в этом направлении до упора.
              Если при этом две плитки одного номинала «налетают» одна на другую, то они слипаются в одну,
              номинал которой равен сумме соединившихся плиток.
              После каждого хода на свободной секции поля появляется новая плитка номиналом «2» или «4».
              Если при нажатии кнопки местоположение плиток или их номинал не изменится, то ход не совершается.
              Тоесть новую плитку в этом случае добавлять не нужно.
              За каждое соединение игровые очки увеличиваются на номинал получившейся плитки.
              Игра заканчивается поражением, если после очередного хода невозможно совершить действие.
              */

/*
              Как-то так. Писал без документация и гуглений, чтобы показать чисто свой уровень. 
              Костыль на расчет 9/10 выпадов 2 и 1/10 выпада 4-ки не стал прописывать.
              Если будут вопросы, пишите, рад ответить. Надеюсь, дошли до конца.
              */
const SIZE_WIDTH = 4;
const SIZE_HEIGHT = 4;

let down = {
  x: 0,
  y: 0,
};
let move = Object.assign({}, down);

const moveUp = (e) => {
  move = {
    ...move,
    x: e.screenX,
    y: e.screenY,
  };
};

function render() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}
async function create() {
  await render();
  game.clearChildNode();
  game.render();
}
class UI {
  constructor() {
    this.container = document.getElementById("playfield");
    this.field = Array.from(Array(SIZE_HEIGHT), () =>
      new Array(SIZE_WIDTH).fill({
        number: 0,
        position: {
          top: 0,
          left: 0,
        },
        isChange: false,
      })
    );
    this.copyField = [...this.field];

    this.y = Math.floor(Math.random() * 4);
    this.x = Math.floor(Math.random() * 4);

    this.eatFlag = false;
    this.count = 0;

    this.random();
    this.render();
  }
  checkRand(y, x) {
    if (this.field[y][x].number > 0) return true;
    else false;
  }
  random() {
    do {
      this.y = Math.floor(Math.random() * 4);
      this.x = Math.floor(Math.random() * 4);
    } while (this.checkRand(this.y, this.x));

    this.field[this.y][this.x] = {
      number: Math.floor(Math.random() + 1 * 2),
      position: {
        top: this.y * 100,
        left: this.x * 100,
      },
      isChange: false,
    };
  }
  clear(i, j) {
    this.field[i][j] = {
      number: 0,
      position: {
        top: 0,
        left: 0,
      },
      isChange: false,
    };
  }
  clearChildNode() {
    for (let i = this.container.childNodes.length - 1; i >= 0; i--) {
      if (
        this.container.childNodes[i].classList &&
        this.container.childNodes[i].classList[0] === "thing"
      ) {
        this.container.removeChild(this.container.childNodes[i]);
      }
    }
  }
  randomView() {
    if (this.eatFlag) this.random();
    this.eatFlag = false;
  }
  moving(direct) {
    let startY, startX, endX, endY, state, condition, modX, modY, mod;
    switch (direct) {
      case "up":
        startY = 0;
        endY = SIZE_HEIGHT;
        startX = 0;
        endX = SIZE_WIDTH;
        state = "vector >= 0";
        condition = 0;
        modY = -1;
        modX = -1;
        mod = -1;
        break;
      case "down":
        startY = SIZE_HEIGHT - 1;
        endY = 0;
        startX = SIZE_WIDTH - 1;
        endX = 0;
        state = "vector < SIZE_HEIGHT";
        condition = SIZE_HEIGHT - 1;
        modY = 1;
        modX = 1;
        mod = 1;
        break;
      case "right":
        startY = SIZE_HEIGHT - 1;
        endY = 0;
        startX = SIZE_HEIGHT - 1;
        endX = 0;
        state = "vector < SIZE_WIDTH";
        condition = SIZE_WIDTH - 1;
        modX = 1;
        modY = -1;
        mod = 1;
        break;
      case "left":
        startY = 0;
        endY = SIZE_WIDTH;
        startX = SIZE_HEIGHT - 1;
        endX = 0;
        state = "vector >= 0";
        condition = 0;
        modX = 1;
        modY = 1;
        mod = -1;
        break;
    }
    for (let i = startY; mod < 0 ? i < endY : i >= endY; i += -1 * mod) {
      for (let j = startX; modX < 0 ? j < endX : j >= endX; j += -1 * modX) {
        let handlerDirect = direct === "up" || direct === "down" ? true : false;

        let ii = handlerDirect ? i : j;
        let jj = handlerDirect ? j : i;

        if (this.field[ii][jj].number > 0 && this.field[ii][jj].number < 2048) {
          let number = this.field[ii][jj].number;
          let top = this.field[ii][jj].position.top;
          let left = this.field[ii][jj].position.left;

          let getElement = document.getElementById(`${ii}${jj}`).style;

          this.clear(ii, jj);

          let vector = i;

          for (vector; state; vector += mod) {
            let dx = handlerDirect ? j : vector + 1 * mod; //следующий
            let dy = handlerDirect ? vector + 1 * mod : j; //следующий

            let dX = handlerDirect ? j : vector; //текущий
            let dY = handlerDirect ? vector : j; //текущий

            //условие остановки и принятие решения
            if (
              (vector !== condition && this.field[dy][dx].number > 0) ||
              vector === condition
            ) {
              let coord = top;
              let coordL = left;

              this.field[dY][dX] = {
                ...this.field[dY][dX],
                number,
                position: {
                  top: handlerDirect ? dY * 100 : top,
                  left: handlerDirect ? left : dX * 100,
                },
              };
              coord = this.field[dY][dX].position.top;
              coordL = this.field[dY][dX].position.left;

              if (top !== coord || coordL !== left) this.eatFlag = true;

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
                      : `${dX * 100}px`);

              if (
                vector !== condition &&
                this.field[dY][dX].number === this.field[dy][dx].number &&
                this.field[dY][dX].isChange === false &&
                this.field[dy][dx].isChange === false
              ) {
                this.clear(dY, dX);
                this.field[dy][dx] = {
                  ...this.field[dy][dy],
                  number: number * 2,
                  position: {
                    top: handlerDirect ? dY * 100 + 100 * modY : top,
                    left: handlerDirect ? left : dX * 100 + 100 * mod,
                  },
                  isChange: true,
                };
                if (this.field[dy][dx].number >= 2048) {
                  location.href = "https://youtu.be/dQw4w9WgXcQ?t=85";

                  document.getElementById("end-box").style.display = "block";
                }
                if (top === coord || left === coordL) this.eatFlag = true;
              }
              break;
            }
          }
        }
      }
      create();
    }
    for (let i = 0; i < SIZE_HEIGHT; i++) {
      for (let j = 0; j < SIZE_WIDTH; j++) {
        this.field[i][j] = {
          ...this.field[i][j],
          isChange: false,
        };
      }
    }
  }
  direction() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "w":
          this.moving("up");
          break;
        case "s":
          this.moving("down");
          break;
        case "d":
          this.moving("right");
          break;
        case "a":
          this.moving("left");
          break;
      }
      this.randomView();
    });
  }
  render() {
    for (let i = 0; i < SIZE_HEIGHT; i++) {
      for (let j = 0; j < SIZE_WIDTH; j++) {
        if (this.field[i][j].number > 0) {
          let id = i === 0 ? "0" + `${j}` : i * 10 + j;
          this.container.insertAdjacentHTML(
            "afterBegin",
            `<div class="thing t${this.field[i][j].number}" id=${id} style="top: ${this.field[i][j].position.top}px; left: ${this.field[i][j].position.left}px;"></div>`
          );
        }
      }
    }
  }
}
const game = new UI();
game.direction();

window.addEventListener("mousedown", (e) => {
  down = {
    ...down,
    x: e.screenX,
    y: e.screenY,
  };

  window.addEventListener("mousemove", moveUp);
  setTimeout(() => {
    removeEventListener("mousemove", moveUp);
    if (move.y < down.y && move.x < down.x + 30 && move.x > down.x - 30) {
      game.moving("up");
    } else if (
      move.y > down.y &&
      move.x < down.x + 30 &&
      move.x > down.x - 30
    ) {
      game.moving("down");
    } else if (
      move.x > down.x &&
      move.y < down.y + 30 &&
      move.y > down.y - 30
    ) {
      game.moving("right");
    } else if (
      move.x < down.x &&
      move.y < down.y + 30 &&
      move.y > down.y - 30
    ) {
      game.moving("left");
    }
    game.randomView();
  }, 200);
});
