function onGoogleLogin(response) {
    const responsePayload = xover.cryptography.decodeJwt(response.credential);
    let username = document.querySelector('.form-signin #username');
    username = (xover.session.debug && username && !username.disabled && username.value || responsePayload.email);
    xover.session.user_login = username;
    xover.session.id_token = response.credential;
    xover.session.login(xover.session.user_login, response.credential).then(() => {
        if (xo.site.seed == '#login') { window.location = '#' } else { xover.stores.seed.render() }
    }).catch((e) => {
        xover.session.id_token = undefined;
        return Promise.reject(e);
    })
}
xover.listener.on('beforeRender::#login', function () {
    if (xo.session.status != 'authorizing') {
        [...document.querySelectorAll(`script[src*="accounts.google.com"]`)].remove()
    }
})
xover.listener.on('logout', function () {
    delete xover.session.id_token
})