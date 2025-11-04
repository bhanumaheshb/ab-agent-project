// public/agent.js (copy & replace)
(function () {
  const scriptTag = document.currentScript;
  const experimentId = scriptTag && scriptTag.getAttribute && scriptTag.getAttribute('data-exp-id');

  if (!experimentId) {
    console.error('A/B Agent: Experiment ID (data-exp-id) is missing.');
    return;
  }

  const API_BASE_URL = 'https://backend-service-0d12.onrender.com';

  const debugLog = (...args) => {
    try { console.log.apply(console, ['A/B Agent:'].concat(args)); } catch (e) {}
  };

  const makeDebugOverlay = (text) => {
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

      async track(extra = {}) {
        if (!this._decision) {
          console.warn('A/B Agent: No decision recorded yet. Call track() after a decision is present.');
          return;
        }
        const payload = Object.assign({ variationName: this._decision }, extra);
        try {
          debugLog('Sending feedback', payload);
          const res = await fetch(`${API_BASE_URL}/api/experiments/${experimentId}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const text = await res.text();
            console.error('A/B Agent: Feedback failed ->', res.status, text);
            return;
          }
          const body = await res.json();
          debugLog('A/B Agent: Feedback recorded ✅', body);
          makeDebugOverlay('Feedback recorded');
        } catch (e) {
          console.error('A/B Agent: Error sending feedback ❌', e);
        }
      },

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

  // --- Fetch decision ---
  (async function fetchDecision() {
    try {
      debugLog('Fetching decision for experiment', experimentId);
      const res = await fetch(`${API_BASE_URL}/api/experiments/${experimentId}/decision`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('A/B Agent: Server Error ->', res.status, txt);
        makeDebugOverlay('Decision fetch failed: ' + res.status);
        return;
      }

      const data = await res.json();
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
