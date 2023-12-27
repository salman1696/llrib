import {config} from '../config/index';

/**
 *
 * @param {string} username
 * @param {string} password
 * @param {boolean} rememberme
 * @returns
 */
export const login = async (username, password, rememberme) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        // rememberMe: rememberme
      }),
    })
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in Login Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Login', err);
  }
};

/**
 * Account Registration
 * @param {string} email
 * @param {string} firstname
 * @param {string} lastname
 * @param {string} password
 * @param {string} treatyNumber
 * @returns
 */
export const register = async (
  email,
  firstname,
  lastname,
  phone,
  password,
  healthCardNumber,
) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    var payload = {
      email: email,
      firstName: firstname,
      lastName: lastname,
      password: password,
      phone: phone,
      healthCardNumber: healthCardNumber,
    };

    console.log('**REGISTER PAYLOAD**', payload);

    let _r = await fetch(`${config.api.register}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in Register Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Register', err);
  }
};

/**
 *
 * @param {string} email
 * @param {string} code
 * @returns
 */
export const activateAccount = async (email, code) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.accountActivation}?key=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in Activation Fetch', err);
      });

    response.data = _r;

    console.log('**Register Response**', response);

    return response;
  } catch (err) {
    console.log('Error in Activation', err);
  }
};

export const forgotVerifyingOtp = async params => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.accountActivationKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in Activation Fetch', err);
      });

    response.data = _r;

    console.log('**Register Response**', response);

    return response;
  } catch (err) {
    console.log('Error in Activation', err);
  }
};
export const forgotPassword = async params => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.forgotpassword}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in forgot password call', err);
      });

    response.data = _r;

    console.log('**ForgotPassword Response**', response);

    return response;
  } catch (err) {
    console.log('Error in Activation', err);
  }
};
export const ResetPassword = async params => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.resetpassword}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in forgot password call', err);
      });

    response.data = _r;

    console.log('**ForgotPassword Response**', response);

    return response;
  } catch (err) {
    console.log('Error in Activation', err);
  }
};

export const ChangePassword = async (userId, payload, accessToken) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(
      `${config.api.changepassword}/${userId}/change-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    )
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in forgot password call', err);
      });

    response.data = _r;

    console.log('**ForgotPassword Response**', response);

    return response;
  } catch (err) {
    console.log('Error in Activation', err);
  }
};
