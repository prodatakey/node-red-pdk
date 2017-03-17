var pdkConfigNodeIntervalId = null;

function cancelPollTimer() {
  if (pdkConfigNodeIntervalId) {
    clearTimeout(pdkConfigNodeIntervalId);
    pdkConfigNodeIntervalId = null;
  }
}

RED.nodes.registerType('pdk-credentials', {
  category: 'config',
  exportable: false,
  oneditsave: cancelPollTimer,
  oneditcancel: cancelPollTimer,
  
  defaults: {
    user_email: { value : '' },
    user_info: { value: { } },
  },

  credentials: {
    user_email: { type: 'text' },
    user_info: { type: 'text' },
    id_token: { type: 'password' },
  },

  label: function() {
    return this.user_email;
  },

  oneditprepare: function() {
    const self = this;

    function showPdkAuthStart() {
      var pathname = document.location.pathname;
      if (pathname.slice(-1) != '/') {
          pathname += '/';
      }

      const callback = encodeURIComponent(
        `${location.protocol}//${location.hostname}:${location.port}${pathname}pdk-credentials/auth/callback`
      );

      $('#node-config-dialog-ok').button('disable');
      $('#node-config-creds-row').html(
        `<div style="text-align: center; margin-top: 20px;">
          <a class="btn" id="node-config-creds-start"
            href="pdk-credentials/${self.id}/auth?callback=${callback}" target="_blank"
          >${self._('pdk.label.clickhere')}</a>
        </div>`
      );
      $('#node-config-creds-start').click(function() {
          pdkConfigNodeIntervalId = setInterval(pollPdkCredentials, 2000);
      });
    }

    function updatePdkUserEmail(email, info) {
      $('#node-config-input-user_email').val(email);
      $('#node-config-input-user_info').val(info);
      $('#node-config-creds-row').html(
        `<label><i class="fa fa-user"></i>
          ${self._('pdk.label.pdklogin')}
        </label>
        <span class="input-xlarge uneditable-input">${email}</span>`
      );
    }

    function pollPdkCredentials() {
      $.getJSON(`credentials/pdk-credentials/${self.id}`, function(data) {
        if (data.user_email) {
          cancelPollTimer();
          updatePdkUserEmail(data.user_email, data.user_info);
          $('#node-config-dialog-ok').button('enable');
        }
      })
    }

    if (!this.user_email || this.user_email === '') {
      showPdkAuthStart();
    } else {
      if (this.credentials.user_email && this.credentials.user_info) {
        updatePdkUserEmail(this.credentials.user_email, this.credentials.user_info);
      } else {
        showPdkAuthStart();
      }
    }
  },
});
