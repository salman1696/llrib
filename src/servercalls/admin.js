import {config} from '../config/index';

export const getUsersAction = async token => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.admin}/users?role=ROLE_USER`, {
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

export const getApplicationsAction = async token => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.admin}/applications`, {
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
        console.log('Error in Application Fetch', err);
        s;
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Application', err);
  }
};

export const getDetailsAction = async (token, id, endpoint, endpoint2) => {
  try {
    let response = {
      status: '',
      data: '',
    };

    console.log(`${config.api.admin}/${endpoint}/${id}${endpoint2}`);
    let _r = await fetch(`${config.api.admin}/${endpoint}/${id}${endpoint2}`, {
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
export const geAdminDetailsAction = async (token, id, endpoint) => {
  try {
    let response = {
      status: '',
      data: '',
    };

    console.log(`${config.api.admin}/${endpoint}`);
    let _r = await fetch(`${config.api.admin}/${endpoint}`, {
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

/**
 *
 * @param {string} id
 * @param {boolean} profileStatus
 * @param {string} reason
 * @returns
 */
export const setUserStatusAction = async (
  token,
  id,
  profileStatus,
  reason,
  endpoint,
) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.admin}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        isUserLocked: profileStatus,
        userLockedReason: reason,
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
        s;
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Login', err);
  }
};
export const setUserApplicationStatusAction = async (token, id, payload) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.admin}/application/${id}`, {
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
        console.log('Error in Login Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Login', err);
  }
};
/**
 *
 * @param {string} comment
 * @param {string} commentedOn
 * @param {string} type
 * @param {object} commentFor
 * @param {object} commentBy
 * @param {object} applicationFor
 * @returns
 */
export const createCommnet = async (
  token,
  comment,
  commentedOn,
  type,
  commentFor,
  commentBy,
  applicationFor,
) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.admin}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body:
        applicationFor !== ''
          ? JSON.stringify({
              comment: comment,
              commentedOn: commentedOn,
              type: type,
              commentFor: commentFor,
              commentBy: commentBy,
              applicationFor: applicationFor,
            })
          : JSON.stringify({
              comment: comment,
              commentedOn: commentedOn,
              type: type,
              commentFor: commentFor,
              commentBy: commentBy,
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
        s;
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in Login', err);
  }
};

export const updateAdminProfile = async (userId, payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    console.log(payload);
    let _r = await fetch(`${config.api.admin}/user-profiles/${userId}`, {
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
        console.log(res);
        return res;
      })
      .catch(err => {
        console.log('Error in updateProfile Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in updateProfile', err);
  }
};
export const getDocumentsByUserIdAdmin = async (userId, token) => {
  console.log(
    'userId',
    userId,
    'token',
    token,
    'url=>',
    `${config.api.userProfileAdmin}/${userId}/documents`,
  );
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfileAdmin}/${userId}/documents`, {
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
        console.log('Error in Fetch Profile Fetch', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in FetchProfile', err);
  }
};
