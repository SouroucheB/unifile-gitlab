const request = require('request');

const request = require('request');

const Tools = require('unifile-common-tools');

const SERVICE_HOST = 'gitlab.com';
const APP_PERMISSION = 'scope=repo,delete_repo,user';

const { UnifileError } = require('./error.js');

class GitlabConnector {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.serviceHost = config.serviceHost || SERVICE_HOST;
    this.oauthCallbackUrl = `https://${this.serviceHost}/login/oauth`;
    this.redirectUri = config.redirectUri || null;

    this.infos = Tools.mergeInfos(config.infos, {
			name: NAME,
			displayName: 'GitLab',
			icon: '../assets/gitlab.png',
			description: 'Edit files from your GitLab repository.'
		});
  }

  getAuthorizeURL(session) {
		// Generate a random string for the state
		session.state = (+new Date() * Math.random()).toString(36).replace('.', '');
		return Promise.resolve(this.oauthCallbackUrl
			+ '/authorize?' + APP_PERMISSION
			+ '&client_id=' + this.clientId
			+ '&state=' + session.state
			+ (this.redirectUri ? '&redirect_uri=' + this.redirectUri : ''));
	}

  getInfos(session) {
		return Object.assign({
			isLoggedIn: !!(session && ('token' in session) || ('basic' in session)),
			isOAuth: true,
			username: (session && session.account) ? session.account.display_name : undefined
		}, this.infos);
  }
  
  login(session, loginInfos) {
    if (loginInfos.state !== session.state) {
      return Promise.reject(new UnifileError(UnifileError.EACCES, 'Invalid request (cross-site request)'));
    }

    return new Promise((resolve, reject) => {
      request({
        url: this.oauthCallbackUrl + '/access_token',
        method: 'POST',
        body: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: loginInfos.code,
          state: session.state
        },
        json: true
      }, function(err, response, body) {
        if(err) {
          reject(new UnifileError(UnifileError.EINVAL, 'Error while calling GitHub API. ' + err));
        } else if(response.statusCode >= 400 || 'error' in body) {
          reject(new UnifileError(UnifileError.EACCES, 'Unable to get access token. Please check your credentials.'));
        } else {
          resolve(body.access_token);
        }
      });
    })
    .then((token) => {
      return this.setAccessToken(session, `token ${token}`);
    });
  }

  readdir() {
    console.log(this.clientId);
  }

  ls() {
    console.log(this.clientId);
  }
}

module.exports = GitlabConnector;