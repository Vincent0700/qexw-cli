const MSG_TYPE = {
  INFO: Symbol(),
  WARN: Symbol(),
  ERROR: Symbol()
};

function log(msg, type = MSG_TYPE.INFO) {
  let typeStr = '';
  if (type === MSG_TYPE.INFO) {
    typeStr = '[QEXW]'.brightGreen;
  } else if (type === MSG_TYPE.WARN) {
    typeStr = '[QEXW][WARN]'.brightYellow;
  } else if (type === MSG_TYPE.ERROR) {
    typeStr = '[QEXW][ERROR]'.brightRed;
  }
  console.log(`${typeStr} ${msg}`);
}

log.TYPE = MSG_TYPE;

module.exports = log;
