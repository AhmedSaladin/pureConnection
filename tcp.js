const { Socket } = require("net");
const NS_PER_SEC = 1e9;

function nanoToMilliseconds(nanoseconds) {
  return Math.floor(nanoseconds / 1e6);
}
/**
 * @param  options{{port:number,hostname:string}}
 * @returns {Promise<data|Error>}
 *
 * @typedef data
 * @property {string} hostname
 * @property {number} port
 * @property {number} responseTime - time in milliseconds
 */
module.exports = (options) => {
  return new Promise((resolve, reject) => {
    let socket = new Socket();
    let startTime = process.hrtime();

    socket.connect(options.port, options.hostname, () => {
      let diff = process.hrtime(startTime);
      let responseTime = nanoToMilliseconds(diff[0] * NS_PER_SEC + diff[1]);

      let data = {
        hostname: options.hostname,
        port: options.port,
        responseTime: responseTime,
      };

      resolve(data);
    });

    socket.on("error", (error) => {
      reject(error);
    });

    socket.on("timeout", () => {
      let diff = process.hrtime(startTime);
      let responseTime = nanoToMilliseconds(diff[0] * NS_PER_SEC + diff[1]);

      let data = {
        hostname: options.hostname,
        responseTime: responseTime,
        timeout: true,
      };

      reject(new Error("Request timeout"), data, {
        statusCode: 408,
      });
    });

    if (options.timeout) {
      socket.setTimeout(options.timeout, function () {
        socket.end() ? socket.end() : socket.destroy();
      });
    }
    socket.end();
  });
};
