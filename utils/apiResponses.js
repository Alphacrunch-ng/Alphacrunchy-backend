exports.serverErrorResponse = async (res, error) => {
    return res.status(500).json({
      success: false,
      message: "An error occured, we are working on it",
      error: error.message,
      data: error.data
    });
  };
  exports.successResponse = async ({res, data, message }) => {
    return res.status(200).json({
      success: true,
      message: message,
      data: data
    });
  };

  exports.cachedResponse = async ({res, data, message }) => {
    return res.status(304).json({
      success: true,
      message: message,
      data: data
    });
  };

  exports.createdSuccessFullyResponse = async ({res, data, message }) => {
    return res.status(201).json({
      success: true,
      message: message,
      data: data
    });
  };
  exports.badRequestResponse = async ({res, message}) => {
    return res.status(400).json({
      success: false,
      message
    });
  };
  
  exports.unauthorizedErrorResponse  = async ({res, message}) => {
    return res.status(401).json({
      success: false,
      message
    })
  }
  exports.notFoundErrorResponse  = async ({res, message}) => {
    return res.status(401).json({
      success: false,
      message
    })
  }