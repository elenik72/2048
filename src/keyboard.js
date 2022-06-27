class Keyboard {
  #mapControlDefault = Object.freeze({})

  static make(params) {
    return new Keyboard(params)
  }

  constructor({ logger, controls = this.#mapControlDefault }) {
    this.logger = logger
    this.controls = controls

    document.addEventListener('keydown', (e) => this.#run(e))
  }

  #run(event) {
    event.preventDefault()
    const key = event.key

    try {
      if (this.controls.hasOwnProperty(key)) {
        this.logger.info('Pressed: ' + key)
        this.controls[key]()

        return
      }

      throw new Error('No action for this key.')
    } catch (e) {
      this.logger.danger(e.message)
    }
  }
}

export default Keyboard
