function ajax({
  method,
  path,
  data,
  headers,
  onSuccess,
  onFailure,
  onComplete,
  isFormData,
}) {
  const request = new XMLHttpRequest();

  let handlerPath;

  if (method === 'GET' && typeof data === 'object') {
    Object.keys(data).forEach((key) => {
      if (!handlerPath) {
        handlerPath = `${path}?${key}=${window.encodeURIComponent(data[key])}`;
      } else {
        handlerPath = `${handlerPath}&${key}=${window.encodeURIComponent(data[key])}`;
      }
    });
  }

  request.open(method, handlerPath || path, true);

  request.setRequestHeader(
    'X-Requested-With', 'xhr',
  );

  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      if (request.status === 302) {
        window.location.href = '/sign-in';

        return;
      }
      // Ajax request success
      let responseData;

      try {
        responseData = JSON.parse(request.responseText);
      } catch (e) {
        responseData = request.responseText;
      }

      if (typeof onSuccess === 'function') {
        onSuccess(responseData);
      }
    } else if (typeof onFailure === 'function') {
      if (request.status === 401 && window.location.pathname === '/sign-in') {
        onFailure(request.responseText);
      } else if (request.status === 401) {
        window.location.href = '/sign-in';
      } else {
        // Ajax request failure
        let responseData;

        try {
          responseData = JSON.parse(request.responseText);
        } catch (e) {
          responseData = request.responseText;
        }

        onFailure(responseData);
      }
    }

    if (typeof onComplete === 'function') {
      onComplete(request.responseText);
    }
  };

  request.onerror = () => {
    if (typeof onFailure === 'function') {
      onFailure(504, 'ERR_CONNECTION_REFUSED');
    }

    if (typeof onComplete === 'function') {
      onComplete(504, 'ERR_CONNECTION_REFUSED');
    }
  };

  // If headers are present, set the headers.
  if (headers) {
    if (Array.isArray(headers)) {
      headers.forEach((header) => {
        request.setRequestHeader(header.key, header.value);
      });
    }
  }

  if (data && !isFormData) {
    let str = '';

    request.setRequestHeader(
      'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8',
    );

    const entries = Object.entries(data);

    entries.forEach(([key, value], index) => {
      if (entries.length === index) {
        str += `${key}=${window.encodeURIComponent(value)}`;
      } else {
        str += `${key}=${window.encodeURIComponent(value)}&`;
      }
    });

    request.send(str);
  } else if (data && isFormData && data instanceof FormData) {
    request.send(data);
  } else if (data && isFormData) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key.slice(-2) === '[]') {
        const arr = [];

        value.forEach((item) => {
          if (item instanceof File) {
            formData.append(key, item);
          } else {
            arr.push(item.name);
          }
        });

        if (arr.length > 0) {
          formData.append(key, JSON.stringify(arr));
        }
      } else {
        formData.append(key, value);
      }
    });

    request.send(formData);
  } else {
    request.send();
  }

  return request;
}

export default ajax;
