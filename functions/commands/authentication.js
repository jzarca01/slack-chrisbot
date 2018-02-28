const fs = require('fs');
const readline = require('readline');
const googleAuth = require('google-auth-library');

const config = require('./config.json');

class Authentication {
  constructor() {
    this.clientSecret = config.clientSecret;
    this.clientId = config.clientId;
    this.redirectUrl = config.redirectUrl;

    this.oauth2Client = new new googleAuth().OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUrl,
    );
  }

  authenticate() {
    return new Promise((resolve) => {
      this.oauth2Client.credentials = {
        'access_token': config.accessToken,
        'refresh_token': config.refreshToken,
        'token_type': 'Bearer',
        'expiry_date': 1500998643457,
      };
      resolve(this.oauth2Client);
    });
  }
}

module.exports = (callback) => new Authentication();
