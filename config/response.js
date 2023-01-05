// default response by http code, maybe can be customed on controller
// custom format response, maybe can be customed on controller

const response = {
  200: {
    meta: {
      code: '200',
      type: 'success',
      message: 'the request succeeded',
    },
    data: '',
  },
  201: {
    meta: {
      code: '201',
      type: 'success',
      message: 'resource created',
    },
    data: '',
  },
  202: {
    meta: {
      code: '202',
      type: 'success',
      message: 'resource accepted, but in progress',
    },
    data: '',
  },
  400: {
    meta: {
      code: '400',
      type: 'bad_request',
      message: 'bad request',
    },
    data: '',
  },
  401: {
    meta: {
      code: '401',
      type: 'unauthenticated',
      message: 'unauthenticated',
    },
    data: '',
  },
  404: {
    meta: {
      code: '404',
      type: 'not_found',
      message: 'resource not found',
    },
    data: '',
  },
  422: {
    meta: {
      code: '422',
      type: 'unprocessable_entity',
      message: 'bad input',
    },
    data: '',
  },
  500: {
    meta: {
      code: '500',
      type: 'error',
      message: 'error',
    },
    data: '',
  },
  email_unique: {
    meta: {
      code: '400',
      type: 'email_unique',
      message: 'email must be unique',
    },
    data: '',
  },
  wrong_password: {
    meta: {
      code: '400',
      type: 'wrong_password',
      message: 'wrong password',
    },
    data: '',
  },
  status_not_valid: {
    meta: {
      code: '400',
      type: 'status_not_valid',
      message: 'status not valid',
    },
    data: '',
  },
};

module.exports = response;