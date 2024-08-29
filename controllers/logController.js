const { readLogs, deleteLogs } = require("../utils/logger/logService");
const { serverErrorResponse, successResponse } = require("../utils/services");


const getLogs = async (req, res) => {
  try {
    const files = await readLogs();
    const fileLinks = files.map((file) => {
      const fileUrl = `/logs/${file}`;
      return `<a href="${fileUrl}">${file}</a>`;
    });
    const html = `<h1>Log Files</h1>${fileLinks.join("<br>")}`;
    // res.send(html);
    return successResponse({ res, data: html })
  } catch (error) {
    return serverErrorResponse(res, error);
  }
};

const deleteAllLogs = async (req, res) => {
  try {
    const message = await deleteLogs();
    return successResponse({ res, message })
  } catch (error) {
    return serverErrorResponse(res, error);
  }
};

module.exports = {
  getLogs,
  deleteAllLogs
};
