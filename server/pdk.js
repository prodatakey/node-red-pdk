import { getOidClient } from 'pdk-client/authenticator';
import makesession from 'pdk-client/session';
import { makesession as makePanelSession } from 'pdk-client/panelApi';
import { getPanel } from 'pdk-client/authApi';
import when from 'when';

module.exports = when.lift(async function(RED) {
  RED.log.debug('Init pdk node')

  // Create the pdk-credential type
  function PdkCredentials(config) {
    RED.nodes.createNode(this, config);
    this.user_email = config.user_email;
    this.user_info = JSON.parse(config.user_info);
  }
  RED.nodes.registerType('pdk-credentials', PdkCredentials, {
    credentials: {
      user_email: { type: 'text' },
      user_info: { type: 'text' },
      id_token: { type: 'password' },
    }
  });

  async function PdkInNode(config) {
    RED.nodes.createNode(this, config);

    // Get credentials from the cred node
    this.crednode = RED.nodes.getNode(config.creds);
    const creds = this.crednode.credentials;

    // Create auth api session
    const authsession = makesession(creds.id_token);

    // Get target panel
    const panel = await getPanel(authsession, '10702AG');

    // Create panel api session
    const panelsession = await makePanelSession(authsession, panel);

    // Connect event stream
    const stream = await panelsession.connectStream();
    stream.on('door.input.relay.on', (msg) => this.send({ payload: msg }));
    stream.on('door.input.relay.off', (msg) => this.send({ payload: msg }));
  }
  RED.nodes.registerType('pdk in', PdkInNode);

  // Create the authorization endpoints
  const client = await getOidClient('585b09335ea2ea00014f22d1', 'wjeqJHRWiCsEDQDhV6iha6uP0RJkvtXN');

  RED.httpAdmin.get('/pdk-credentials/:id/auth', RED.auth.needsPermission('pdk.read'), function(req, res) {
    // Pass the node id and the callback URL as state
    const state =  encodeURIComponent(JSON.stringify({ id: req.params.id, callback: req.query.callback }));
    const callback = client.authorizationUrl({ redirect_uri: req.query.callback, state, scope: 'openid' });
    res.redirect(callback);
  });

  RED.httpAdmin.get('/pdk-credentials/auth/callback', RED.auth.needsPermission('pdk.read'), function(req, res) {
    RED.log.debug('Got pdk auth callback');

    // Pull the state out of the response
    const params = client.callbackParams(req);
    const state = JSON.parse(decodeURIComponent(params.state));

    // Backchannel the code for token exchange
    client.authorizationCallback(state.callback, params, { state: params.state })
      .then(async function(token) {
        const user_info = await client.userinfo(token.id_token);

        RED.log.debug(`Got creds for ${user_info.email}`);

        RED.nodes.addCredentials(state.id, {
          user_email: user_info.email,
          user_info: JSON.stringify(user_info),
          id_token: token.id_token,
        });

        res.send(RED._('pdk.errors.authorized'));
      })
      .catch(err => {
        RED.log.error(err);
        res.send(RED._('pdk.errors.oauthbroke'));
      });
  });

  RED.log.debug('Registered pdk auth handlers')
});
