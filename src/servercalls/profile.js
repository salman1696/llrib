import {config} from '../config/index';
import axios from 'axios';

export const updateProfile = async (userId, payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    console.log(payload);
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



export const showSensitiveInfo =  (payload, token) => {
 return new Promise(async (resolve, reject) => {
    try {
      const {userId, fieldName, password } = payload;
       const {data} = await axios.post(`${config.api.userProfile}/${userId}/${fieldName}`,
          {
            password
          },
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        resolve(data);
    } catch (err) {
     reject( err.response?.data ? err.response.data.detail : err.message);
    }
  })
};


export const fetchUserProfile = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    console.log('TOKEN', token);
    let _r = await fetch(`${config.api.userProfile}/${userId}`, {
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

// ADDRESS
export const createAddress = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.addresses}`, {
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
        console.log('Address response++', res);
        return res;
      })
      .catch(err => {
        console.log('Error in Create Address', err);
      });

    response.data = _r;

    console.log('Address Response create', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const fetchUserAddress = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/addresses`, {
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

export const updateAddress = async (addressId, payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.addresses}/${addressId}`, {
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
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

// Documents
export const getDocumentsByUserId = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/documents`, {
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

export const getDocumentsById = async (docId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.documents}/${docId}`, {
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

// EDUCATION
export const createEducation = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.educations}`, {
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
        console.log('Error in Create Address', err);
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const fetchUserEducation = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/educations`, {
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

export const updateEducation = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    console.log('UpdateEducation**', payload);
    let _r = await fetch(`${config.api.educations}/${payload.id}`, {
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
        console.log('Error in Update Education', err);
      });

    response.data = _r;

    console.log('Update Education Response', response);

    return response;
  } catch (err) {
    console.log('Error in UpdateEducation', err);
  }
};

// EMPLOYMENT
export const createEmployment = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.employments}`, {
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
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Create Employment Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const fetchUserEmployment = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/employments`, {
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

export const updateEmployment = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.employments}/${payload.id}`, {
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
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

// BANK ACCOUNTS
export const createBankAccount = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.bankAccounts}`, {
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
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const fetchUserBankAccount = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/bank-accounts`, {
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

export const updateBankAccount = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.bankAccounts}/${payload.id}`, {
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
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

// ASSETS
export const createAssets = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.assets}`, {
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
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const fetchUserAssets = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/assets`, {
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

export const updateAssets = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.assets}/${payload.id}`, {
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
        console.log('Error in Create Address', err);
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

// SPOUSES
export const createSpouse = async (payload, token, userId) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.getUserProfile}${userId}/spouses`, {
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
        console.log('Error in Create Address', err);
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const removeSpouse = async (payload, token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {id, isInvitedSpouse } = payload;
       const {data} = await axios.put(`${config.api.userProfile}/${id}/spouses`,
          payload,
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        resolve(data);
    } catch (err) {
     reject( err.response?.data ? err.response.data.detail : err.message);
    }
  })
};


export const fetcUserSpouse = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}`, {
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
        s;
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in FetchProfile', err);
  }
};

export const updateSpouse = async (userId, payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.spouses}/${userId}`, {
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
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

// DEPENDENT
export const createDependent = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.dependents}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(res => {
        console.log(res, 'success');
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const fetchUserDependent = async (userId, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.userProfile}/${userId}/dependents`, {
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

export const updateDependent = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.dependents}/${payload.id}`, {
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
        console.log('Error in Create Address', err);
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};
export const deleteCardItem = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    console.log(
      `${config.api.getUserProfile}${payload.userId}/${payload.type}/${payload.itemId}`,
      'loogggg',
    );
    let _r = await fetch(
      `${config.api.getUserProfile}${payload.userId}/${payload.type}/${payload.itemId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then(res => {
        response.status = res.status;
        return res;
      })
      .catch(err => {
        console.log('Error in Delete Call', err);
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const postDetailsAction = async (token, id, endpoint2, payload) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.getUserProfile}${id}${endpoint2}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(res => {
        console.log(res, 'success');
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in Create Address', err);
        s;
      });

    response.data = _r;

    console.log('Address Response', response);

    return response;
  } catch (err) {
    console.log('Error in CreateAddress', err);
  }
};

export const getDocumentsByUserIdUser = async (endPoint2, userId, token) => {
  console.log(
    'userId',
    userId,
    'token',
    token,
    'url=>',
    `${config.root}/${endPoint2}/${userId}/documents`,
  );
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.root}/${endPoint2}/${userId}/documents`, {
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

export const removeDocumentsByDocId = async (userId, token, docId) => {
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(
      `${config.api.userProfile}/${userId}/documents/${docId}`,
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
        console.log('Error in remove documents', err);
      });

    response.data = _r;
    return response;
  } catch (err) {
    console.log('Error in remove documents', err);
  }
};
