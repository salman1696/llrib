import {config} from '../config';

export const fetchUserApllications = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const getApplicationByIdAction = async (token, id) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.root}/applications/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
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
        console.log('Error in Application by id Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Application by id', err);
  }
};

export const createApplication = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('Application creation response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const submitElCrossCheck = async (payload, appId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${appId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const submitPreEmploymentInfo = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.preEmployment}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const submitExemptIncomeInfo = async (payload, token, applicationId) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const submitOtherSupportForm = async (payload, token, applicationId) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const submitResidencyForm = async (payload, token, applicationId) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const submitTrainingForm = async (
  payload,
  url,
  method,
  token,
  applicationId,
) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    const _url = method == 'POST' ? `${url}` : `${url}/${applicationId}`;
    let _r = await fetch(_url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const submitUnEmploymentForm = async (payload, token, applicationId) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const finalConsent = async (payload, token, userId) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in ApplicationEl-Cross Check ', err);
        s;
      });

    response.data = _r;

    console.log('ApplicationEl-Cross Check Response', response);

    return response;
  } catch (err) {
    console.log('Error in ApplicationEl-Cross-Check', err);
  }
};

export const skipAStep = async (payload, userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in skip step ', err);
        s;
      });

    response.data = _r;

    console.log('Skip Step Response', response);

    return response;
  } catch (err) {
    console.log('Error in Skip-Step', err);
  }
};

export const skipApplicationSkep = async (payload, userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in skip step ', err);
        s;
      });

    response.data = _r;

    console.log('Skip Step Response', response);

    return response;
  } catch (err) {
    console.log('Error in Skip-Step', err);
  }
};
