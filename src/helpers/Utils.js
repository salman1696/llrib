import StyleConfig from '../StyleConfig';

export const isPostalCodeValid = code => {
  let response = false;
  const ca = new RegExp(
    // /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    /^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])\ {0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d)$/g,
  );
  if (ca.test(code)) {
    response = true;
  }
  return response;
};

export const isEmailValid = email => {
  let response = false;
  const emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  ); //-->  \w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+
  if (emailRegex.test(email)) {
    console.log("Valid email");
    response = true;
  }
  console.log("Invalid email");
  return response;
};

export const getPathFromUrl = (url, type = 'application') => {
  let path = '';

  // https://zisaf-crm-dev-docs.s3.ca-central-1.amazonaws.com/applications/2551/3551/ON_RESERVE_RESIDENCE/UTILITY_BILL/test.png?Content-Type=image%2Fpng&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA4OJFBTPBFHLTAT7N%2F20211128%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Date=20211128T191728Z
  const split = String(url).split('?');
  const splitURl = split[0].toString().trim();
  const index = splitURl.indexOf(type);
  if (index > -1) {
    path = splitURl.substr(index);
  }
  return path;
};

export const getFileName = path => {
  let filename = '';
  const pathArr = String(path).split('/');
  filename = pathArr[pathArr.length - 1];
  return filename;
};

export const getFileExtension = filename => {
  let extension = '';
  const pathArr = String(filename).split('.');
  extension = pathArr[pathArr.length - 1];
  return extension;
};

export const normalizePostCode = postcode => {
  return String(postcode).trim().replaceAll(/\s/g, '');
};

export const truncateString = (str, num) => {
  return str.length > num ? str.slice(0, num) + '...' : str;
};

const SCROLL_VALUE = 105;
export const scrollDown = (scrollRef, multiplier) => {
  if (scrollRef) {
    scrollRef?.current?.scrollTo({
      y: SCROLL_VALUE * multiplier,
      animated: true,
    });
  }
};

export const getGradientColors = () => {
  return [
    StyleConfig.colors.gradientColorOne,
    StyleConfig.colors.gradientColorTwo,
  ];
};

export const isValidName = myval => {
  let response = false;
  var validCharactersRegex = new RegExp(
    /^[ a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'`'\-]+$/,
  );

  if (validCharactersRegex.test(myval.trim())) {
    response = true;
  }
  return response;
};

export const isValidPassword = password => {
  let response = false;
  var validPasswordRegex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/);

  if (validPasswordRegex.test(password.trim())) {
    console.log('valid');
    response = true;
  } else {
    console.log('Invalid');
  }
  return response;
};
