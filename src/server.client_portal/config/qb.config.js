import request from 'request';
import { QB_CLIENT_ID, QB_CLIENT_SECRET, QB_REDIRECT_URI } from '../options';

const authConfig = {
  clientId: QB_CLIENT_ID,
  clientSecret: QB_CLIENT_SECRET,
  redirectUri: QB_REDIRECT_URI,
  scopes: 'com.intuit.quickbooks.accounting',
};

let uri = 'https://developer.api.intuit.com/.well-known/openid_sandbox_configuration/';

if (process.env.NODE_ENV === 'production') {
  uri = 'https://developer.api.intuit.com/.well-known/openid_configuration';
}

function getConfigParams(callback) {
  request({
    uri,
    headers: { Accept: 'application/json' },
  }, (error, response) => {
    if (error) {
      callback('cannot connect to qb');

      return;
    }

    const json = JSON.parse(response.body);

    callback(null, Object.assign({}, authConfig, {
      authorizationUri: json.authorization_endpoint,
      accessTokenUri: json.token_endpoint,
    }));
  });
}


export default getConfigParams;
