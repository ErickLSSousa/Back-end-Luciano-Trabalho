const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const sendNoContent = (res) => {
  res.writeHead(204);
  res.end();
};

module.exports = {
  sendJson,
  sendNoContent
};
