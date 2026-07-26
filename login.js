function getAccessToken(token) {
  if (!token) return null;

  let match = token.match(/^(Basic|Bearer)\s+(.+)$/i);
  if (!match) return token;

  let scheme = match[1].toLowerCase();
  let value = match[2];

  if (scheme === 'basic') {
    let decoded = atob(value);
    let idx = decoded.indexOf(':');

    return idx >= 0 ? decoded.substring(idx + 1) : decoded;
  }

  return value;
}
/* microsoft sign-in */
const msalConfig = {
  auth: {
    clientId: (window.document.querySelector(`meta[name="microsoft-signin-client_id"]`) || window.document.createElement("p")).getAttribute("content"),
    redirectUri: location.origin
  }
};
login_function = () => {
  const msalInstance = new msal.PublicClientApplication(msalConfig);
  msalInstance.loginPopup({ scopes: ["User.Read"] }).then(response => {
    onMicrosoftLogin(response)
    console.log('User logged in:', response);
  }).catch(error => {
    // Handle login error
    console.error('Login error:', error);
  });
}

onMicrosoftLogin = function (response) {
  if (response.accessToken && xo.session.id_token != response.accessToken) {
    let username = document.querySelector('.form-signin #username');
    username = (xo.session.debug && username && !username.disabled && username.value || response.account.username);
    xo.session.user_login = username;
    xo.session.id_token = response.accessToken;
    xo.session.login(xo.session.user_login, response.accessToken).then(() => {
      document.forms[0].submit()
    }).catch(() => {
      xo.session.id_token = undefined;
    })
  }
}

/* google sign-in */
onGoogleLogin = function (response) {
  const responsePayload = xo.cryptography.decodeJwt(response.credential);
  let username = document.querySelector('.form-signin #username');
  username = (xo.session.debug && username && !username.disabled && username.value || responsePayload.email);
  xo.session.user_login = username;
  xo.session.id_token = response.credential;
  xo.session.login(xo.session.user_login, response.credential).then(() => {
    if (xo.site.seed == '#login') { window.location = '#' } else { xo.stores.seed.render() }
  }).catch((e) => {
    xo.session.id_token = undefined;
    [...document.querySelectorAll(`script[src*="accounts.google.com"]`)].remove()
    return Promise.reject(e);
  })
}
xo.listener.on('beforeRender::#login', function () {
  if (xo.session.status != 'authorizing') {
    [...document.querySelectorAll(`script[src*="accounts.google.com"]`)].remove()
  }
})
xo.listener.on('logout', async function () {
  let id_token = getAccessToken(xo.session.id_token);
  try {
    // Google: revoca el token si está disponible
    if (window.google?.accounts?.oauth2 && id_token) {
      google.accounts.oauth2.revoke(id_token, () => { });
    }

    // Microsoft: limpia sesión MSAL
    if (window.msal) {
      const msalInstance = new msal.PublicClientApplication(msalConfig);
      const account = msalInstance.getAllAccounts()[0];

      if (account) {
        await msalInstance.logoutPopup({
          account,
          postLogoutRedirectUri: location.origin
        });
      }
    }
  } catch (e) {
    console.warn('Logout provider error:', e);
  } finally {
    delete xo.session.id_token;
    delete xo.session.user_login;

    if (xo.site?.seed === '#login') {
      window.location = '#login';
    } else {
      window.location.reload();
    }
  }
});