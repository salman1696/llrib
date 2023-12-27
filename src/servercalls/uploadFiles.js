import fs from 'react-native-fs';
import {Buffer} from 'buffer';
import {config} from '../config';

// ADDRESS
export const uploadFile = async (payload, token) => {
  try {
    console.log('**PAYLOAD**', payload);
    let response = {
      status: '',
      data: '',
    };
    let _r = await fetch(`${config.api.uploadFile}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    })
      .then(res => {
        response.status = res.status;
        return res.json();
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log('Error in Document upload ', err);
      });

    response.data = _r;

    console.log('Document upload Response', response);

    return response;
  } catch (err) {
    console.log('Error in Document upload catch', err);
  }
};

export const getPresignedUrl = async (payload, token) => {
  try {
    let response = {
      status: '',
      data: '',
    };

    let _r = await fetch(config.api.presignedUrl, {
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

export const getDocPresignedUrl = async (payload, token) => {
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

export const uploadDocumentOnPresignedUrl = async (url, payload, extension) => {
  try {
    console.log('-----------payload--------------> ', payload);
    const base64 = await fs.readFile(payload, 'base64');
    const buffer = Buffer.from(base64, 'base64');
    console.log('-----> ', extension);
    let response = {
      status: '',
      data: '',
    };

    console.log(url);
    let _r = await fetch(`${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': extension === 'pdf' ? 'application/pdf' : 'image%2jpeg',
      },
      body: buffer,
    })
      .then(res => {
        response.status = res.status;
        return res;
      })
      .catch(err => {
        console.log('Error in Upload Document Presigned URL FETCH', err);
      });

    console.log('Upload Document in Presigned URL Response', response);

    return response;
  } catch (err) {
    console.log('Error in Upload Document using Presigned URL', err);
  }
};

export const fetchS3Image = async url => {
  try {
    let response = {
      status: '',
      data: '',
    };
    console.log(url);
    let _r = await fetch(`${url}`, {
      method: 'GET',
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
