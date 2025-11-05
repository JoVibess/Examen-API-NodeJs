const fs = require('fs');
const path = require('path');

const LOGS_DIR = process.env.LOGS_DIR || "./logs";

async function logger(req, res, next) {
  res.on("finish", () => {
    const now = new Date();
    const logDate = now.toISOString().split('T')[0];
    const logFile = path.join(LOGS_DIR, `${logDate}.log`);

    const logEntry = [
      now.toISOString(),
      req.ip,
      req.method,
      req.originalUrl,
      res.statusCode
    ].join(" | ") + "\n";

    fs.mkdir(path.dirname(logFile), { recursive: true }, (dirErr) => {
      if (dirErr) {
        console.error("Couldn't create log directory", dirErr);
      } else {
        fs.appendFile(logFile, logEntry, (fileErr) => {
          if (fileErr) {
            console.error("Couldn't write in log file", fileErr);
          }
        });
      }
    });
  });

  next();
}

module.exports = logger;
