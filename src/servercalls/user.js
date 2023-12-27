import {config} from '../config/index';

export const getUserReviewedStatus = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.getReviewStepsUrl}/${userId}`, {
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
        console.log('Error in getReviewSteps', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in fetching GetReviewedSteps', err);
  }
};

export const updateStepReviewStatus = async (payload, token, userId) => {
  console.log(payload, token, userId);
  const response = {
    status: '',
    data: '',
  };
  try {
    let _r = await fetch(`${config.api.getReviewStepsUrl}/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
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
        console.log('Error in UpdateReviewStatus', err);
      });

    response.data = _r;
  } catch (err) {
    console.log('Error in Updating review status', err);
  }
  return response;
};

export const getNotificationByUserId = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.root}/users/${userId}/notifications`, {
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
        console.log('Error in getNotfications', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in FetchProfile', err);
  }
};

export const markedAsViewNotification = async (params, notiId, token) => {
  console.log(`${config.root}/notifications/${notiId}`, 'url to set View');
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.root}/notifications/${notiId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
        console.log('Error in setNotficationsAsView', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in setNotficationsAsView', err);
  }
};

export const getDetailsAction = async (token, id, endpoint2) => {
  console.log(`${config.api.applications}/${id}${endpoint2}`, 'request params');
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.applications}/${id}${endpoint2}`, {
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
        console.log('Error in Login Fetch', err);
        s;
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Login', err);
  }
};

export const delProgram = async (token, id, programId) => {
  console.log(
    `${
      config.api.applications
    }/${id}/${'job-training-search-logs'}/${programId}`,
    'request params',
  );
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(
      `${
        config.api.applications
      }/${id}${'/job-training-search-logs'}/${programId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        console.log('Error in Login Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Login', err);
  }
};
export const updateProgram = async (params, token, programId) => {
  console.log(
    `${config.root}/${'job-training-search-logs'}/${programId}`,
    'request params',
  );
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(
      `${config.root}${'/job-training-search-logs'}/${programId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
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
        console.log('Error in Login Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Login', err);
  }
};
