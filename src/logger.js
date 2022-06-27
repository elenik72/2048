class Logger {
  static make(params) {
    return new Logger(params)
  }

  constructor(stdout) {
    this.logger = stdout
  }

  write(msg) {
    this.logger.log(msg)
  }

  danger(msg) {
    this.logger.error(msg)
  }

  info(msg) {
    this.logger.info(msg)
  }
}

export default Logger
