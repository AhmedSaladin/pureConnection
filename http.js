const http = require("http");
const https = require("https");
const NS_PER_SEC = 1e9;

function nanoToMilliseconds(nanoseconds) {
  return Math.floor(nanoseconds / 1e6);
}

/**
 *
 * @param  options
 * @external options
 * @see https://nodejs.org/dist/latest-v17.x/docs/api/http.html#httprequestoptions-callback
 * @returns {Promise<data|Error>}
 *
 * @typedef data
 * @property {string} hostname
 * @property {number} statusCode
 * @property {number} responseTime - time in milliseconds
 */
module.exports = (options) => {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime();
    const req =
      options.protocol === "https:"
        ? https.request(options, handleResponse)
        : http.request(options, handleResponse);

    function handleResponse(response) {
      let diff = process.hrtime(startTime);
      let responseTime = nanoToMilliseconds(diff[0] * NS_PER_SEC + diff[1]);

      let data = {
        hostname: options.hostname,
        responseTime: responseTime,
        statusCode: response.statusCode,
      };

      resolve(data);
    }

    req.on("error", (err) => {
      if (options.timeout) {
        return;
      }

      let diff = process.hrtime(startTime);
      let responseTime = nanoToMilliseconds(diff[0] * NS_PER_SEC + diff[1]);

      let data = {
        hostname: options.hostname,
        responseTime: responseTime,
      };

      reject(err, data, {
        statusCode: 500,
      });
    });

    req.on("timeout", () => {
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

    // if user has specified request timeout, manually destroy
    if (options.timeout) {
      req.setTimeout(options.timeout, function () {
        req.abort ? req.abort() : req.destroy();
      });
    }

    req.end();
  });
};
