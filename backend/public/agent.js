// public/agent.js (copy & replace)
(function () {
  // Grab current script tag (supports inline <script> and external script file)
  const scriptTag = document.currentScript || (function () {
    // fallback: last script element on the page
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const experimentId = scriptTag && scriptTag.getAttribute && scriptTag.getAttribute('data-exp-id');

  if (!experimentId) {
    console.error('A/B Agent: Experiment ID (data-exp-id) is missing.');
    return;
  }

  // API base: prefer explicit data-api-base, otherwise use the origin that served this script
  const apiBaseFromAttr = scriptTag && scriptTag.getAttribute && scriptTag.getAttribute('data-api-base');
  let API_BASE_URL;
  try {
    if (apiBaseFromAttr) {
      API_BASE_URL = apiBaseFromAttr.replace(/\/+$/, ''); // trim trailing slash
    } else if (scriptTag && scriptTag.src) {
      API_BASE_URL = (new URL(scriptTag.src)).origin;
    } else {
      // fallback to current page origin
      API_BASE_URL = window.location.origin;
    }
  } catch (e) {
    API_BASE_URL = window.location.origin;
  }

  const DEBUG = (scriptTag && scriptTag.getAttribute && scriptTag.getAttribute('data-debug')) === '1';

  const debugLog = (...args) => {
    if (!DEBUG) return;
    try { console.log.apply(console, ['A/B Agent:'].concat(args)); } catch (e) {}
  };

  const makeDebugOverlay = (text) => {
    if (!DEBUG) return;
    try {
      let el = document.getElementById('__ab_agent_debug');
      if (!el) {
        el = document.createElement('div');
        el.id = '__ab_agent_debug';
        el.style.position = 'fixed';
        el.style.right = '8px';
        el.style.bottom = '8px';
        el.style.zIndex = 999999;
        el.style.padding = '6px 10px';
        el.style.background = 'rgba(0,0,0,0.7)';
        el.style.color = '#fff';
        el.style.fontSize = '12px';
        el.style.borderRadius = '6px';
        document.body && document.body.appendChild(el);
      }
      el.textContent = text;
    } catch (e) { /* ignore DOM errors */ }
  };

  // --- Define window.ABAgent immediately so pages can call `.track()` right away ---
  (function defineGlobal() {
    let decisionValue = null;

    function flushIfCallbackExists() {
      if (typeof window.onABAgentDecision === 'function' && decisionValue !== null) {
        try {
          debugLog('Invoking onABAgentDecision with ->', decisionValue);
          window.onABAgentDecision(decisionValue);
        } catch (e) {
          console.error('A/B Agent: Error invoking onABAgentDecision', e);
        }
      }
    }

    // Poll briefly for onABAgentDecision if it's registered after agent load
    let watchCount = 0;
    const watchInterval = setInterval(() => {
      watchCount += 1;
      if (typeof window.onABAgentDecision === 'function') {
        debugLog('Detected window.onABAgentDecision defined later; flushing.');
        flushIfCallbackExists();
        clearInterval(watchInterval);
      } else if (watchCount > 20) { // ~5s
        clearInterval(watchInterval);
      }
    }, 250);

    window.ABAgent = {
      _decision: null,

      _setDecision(decision) {
        this._decision = decision;
        decisionValue = decision;
        debugLog('_setDecision:', decision);
        makeDebugOverlay('Decision: ' + decision);
        flushIfCallbackExists();
      },

      getDecision() {
        return this._decision;
      },

      /**
       * Send feedback (conversion). `extra` can include additional metadata (userId, value, etc.)
       * Example: window.ABAgent.track({ value: 199, userId: 'abc' })
       */
      async track(extra = {}) {
        if (!this._decision) {
          console.warn('A/B Agent: No decision recorded yet. Call track() after a decision is present.');
          return;
        }
        const payload = Object.assign({ variationName: this._decision }, extra);

        const url = `${API_BASE_URL}/api/experiments/${encodeURIComponent(experimentId)}/feedback`;

        try {
          debugLog('Sending feedback', url, payload);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
            // credentials: 'omit' by default; change to 'include' if you use cookies
          });

          if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.error('A/B Agent: Feedback failed ->', res.status, text);
            makeDebugOverlay('Feedback failed');
            return;
          }

          const body = await res.json().catch(() => ({}));
          debugLog('A/B Agent: Feedback recorded ✅', body);
          makeDebugOverlay('Feedback recorded');
        } catch (e) {
          console.error('A/B Agent: Error sending feedback ❌', e);
          makeDebugOverlay('Feedback error');
        }
      },

      /**
       * ready(timeoutMs)
       * resolves with decision string or rejects on timeout
       */
      ready(timeoutMs = 5000) {
        const self = this;
        return new Promise((resolve, reject) => {
          if (self._decision) return resolve(self._decision);
          const start = Date.now();
          const id = setInterval(() => {
            if (self._decision) {
              clearInterval(id);
              return resolve(self._decision);
            }
            if (Date.now() - start > timeoutMs) {
              clearInterval(id);
              return reject(new Error('ABAgent: ready() timed out'));
            }
          }, 100);
        });
      }
    };
  })();

  // --- Fetch decision from backend ---
  (async function fetchDecision() {
    const decisionUrl = `${API_BASE_URL}/api/experiments/${encodeURIComponent(experimentId)}/decision`;

    try {
      debugLog('Fetching decision for experiment', experimentId, 'from', API_BASE_URL);
      makeDebugOverlay('Fetching decision...');

      const res = await fetch(decisionUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // credentials: 'omit' by default
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('A/B Agent: Server Error ->', res.status, txt);
        makeDebugOverlay('Decision fetch failed: ' + res.status);
        // set fallback decision to null (client will handle)
        return;
      }

      const data = await res.json().catch(() => null);
      if (data && data.decision) {
        try {
          window.ABAgent._setDecision(data.decision);
        } catch (e) {
          console.error('A/B Agent: Error setting decision', e);
        }
      } else {
        console.warn('A/B Agent: No decision returned from backend.', data);
        makeDebugOverlay('No decision returned');
      }
    } catch (err) {
      console.error('A/B Agent: Error fetching decision ->', err);
      makeDebugOverlay('Decision fetch error');
    }
  })();

})();
