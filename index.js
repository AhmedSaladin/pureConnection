const TCP = require("./tcp");
const url = require("url");
const HTTP = require("./http");

class Ping {
  constructor(options) {
    this.name = options.name;
    this.url = options.url;
    this.protocol = options.protocol;
    this.path = null || options.path;
    this.port = null || options.port;
    this.webhook = null || options.webhook;
    this.timeout = options.timeout || 5000; //seconds
    this.interval = 10 || options.interval; // minutes
    this.threshold = 1 || options.threshold;
    this.authentication = null || options.authentication;
    this.httpHeaders = null || options.httpHeaders;
    this.assert = null || options.assert;
    this.tags = null || options.tags;
    this.ignoreSSL = options.ignoreSSL || false;
  }
  options() {
    return {
      hostname: url.parse(this.url).hostname || this.url,
      protocol: url.parse(this.url).protocol || `${this.protocol}:`,
      path: this.path,
      port: this.port || 443,
      timeout: this.timeout,
      auth: this.authentication
        ? `${this.authentication.name}:${this.authentication.password}`
        : this.authentication,
      headers: this.httpHeaders,
      assert: this.assert,
      ignoreSSL: this.ignoreSSL,
    };
  }

  async startMonitoring() {
    if (this.protocol == "tcp") return await this.tcp();
    return await this.http();
  }

  async tcp() {
    const options = this.options();
    return await TCP(options);
  }
  async http() {
    const options = this.options();
    return await HTTP(options);
  }
}
