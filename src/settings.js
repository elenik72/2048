class Settings {
  static make(params) {
    return new Settings(params)
  }

  constructor({ width, height }) {
    this.width = width
    this.height = height
  }
}

export default Settings
