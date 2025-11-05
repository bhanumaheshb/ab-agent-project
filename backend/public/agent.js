// backend/public/agent.js
(function () {
  'use strict';

  // Locate the <script> tag that loaded this agent
  let scriptTag = document.currentScript;
  if (!scriptTag) {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; --i) {
      const s = scripts[i];
      if (s && s.src && /agent(\.min)?\.js(\?.*)?$/.test(s.src)) {
        scriptTag = s;
        break;
      }
    }
  }

  // Extract experiment ID and backend base URL
  const experimentId = scriptTag && scriptTag.getAttribute('data-exp-id');
  const API_BASE =
    (scriptTag && scriptTag.getAttribute('data-api-base')) ||
    'https://backend-service-0d12.onrender.com';

  if (!experimentId) {
    console.error('A/B Agent: Experiment ID (data-exp-id) is missing.');
    return;
  }

  // Simple safe loggers
  const log = (...args) => console.log('A/B Agent:', ...args);
  const errlog = (...args) => console.error('A/B Agent:', ...args);

  // Global object definition
  window.ABAgent = {
    _decision: null,

    _setDecision(decision) {
      this._decision = decision;
      try {
        if (scriptTag && scriptTag.setAttribute)
          scriptTag.setAttribute('data-decision-made', decision);
      } catch (e) {}
      log('Decision set:', decision);
      if (typeof window.onABAgentDecision === 'function') {
        try {
          window.onABAgentDecision(decision);
        } catch (e) {
          errlog('Error in onABAgentDecision callback:', e);
        }
      }
    },

    getDecision() {
      return this._decision;
    },

    track(extraData) {
      if (!this._decision) {
        console.warn('A/B Agent: No decision available to track.');
        return;
      }

      const url = `${API_BASE}/api/experiments/${experimentId}/feedback`;
      const payload = { variationName: this._decision, ...extraData };

      // Try sendBeacon first
      try {
        if (navigator && typeof navigator.sendBeacon === 'function') {
          const blob = new Blob([JSON.stringify(payload)], {
            type: 'application/json'
          });
          const beaconOk = navigator.sendBeacon(url, blob);
          if (beaconOk) {
            log('Feedback sent via sendBeacon ✅', payload);
            return;
          }
        }
      } catch (e) {
        errlog('sendBeacon failed, falling back to fetch:', e);
      }

      // Fallback to fetch
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors',
        cache: 'no-store'
      })
        .then(r => {
          if (!r.ok)
            throw new Error('Feedback failed: ' + r.status + ' ' + r.statusText);
          return r.json().catch(() => ({}));
        })
        .then(json => log('Feedback recorded ✅', json))
        .catch(e => errlog('Error sending feedback:', e));
    }
  };

  // Fetch variation decision from backend
  const fetchDecision = async () => {
    const url = `${API_BASE}/api/experiments/${experimentId}/decision?cb=${Date.now()}`;
    log('Fetching decision from', url);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        mode: 'cors',
        cache: 'no-store'
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Decision fetch failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      if (data && data.decision) {
        window.ABAgent._setDecision(data.decision);
        log('Decision received:', data.decision);
      } else {
        log('No decision returned from backend:', data);
      }
    } catch (err) {
      errlog('Error fetching decision:', err);
    }
  };

  // Immediately fetch decision on load
  fetchDecision();

  // Patch onABAgentDecision to store decision automatically
  const originalCallback = window.onABAgentDecision || function () {};
  window.onABAgentDecision = function (decision) {
    window.ABAgent._setDecision(decision);
    originalCallback(decision);
  };
})();
