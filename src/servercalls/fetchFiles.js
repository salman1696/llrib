import {config} from '../config';

export const getPresignedUrl = async (payload, token) => {
  console.log(token, 'token');
  console.log(payload, 'payload');
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.presignedUrl}`, {
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
        console.log('Error in Presigned URL FETCH ', err);
      });

    response.data = _r;

    console.log('Presigned URL Response', response);

    return response;
  } catch (err) {
    console.log('Error in Presigned URL', err);
  }
};
export const getPresignedUrlToGetDocuments = async (payload, token) => {
  console.log(token, 'token');
  console.log(payload, 'payload');
  try {
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.getPresignedUrl}`, {
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
        console.log('Error in Presigned URL FETCH ', err);
      });

    response.data = _r;

    console.log('Presigned URL Response', response);

    return response;
  } catch (err) {
    console.log('Error in Presigned URL', err);
  }
};

export const getDocumentFromPresignedUrl = async url => {
  try {
    let response = {
      status: '',
      data: '',
    };
    console.log(url);
    let _r = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'image/jpeg',
      },
    })
      .then(res => {
        response.status = res.status;
        return res;
      })
      .catch(err => {
        console.log('Error in Upload Document Presigned URL FETCH ', err);
      });

    console.log('Upload Document in Presigned URL Response', response);

    return response;
  } catch (err) {
    console.log('Error in Upload Document using Presigned URL', err);
  }
};
