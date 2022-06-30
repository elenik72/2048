class Settings {
  static make(params) {
    return new Settings(params)
  }

  constructor({ width, height, delay }) {
    this.width = width
    this.height = height
    this.delay = delay
  }
}

export default Settings
