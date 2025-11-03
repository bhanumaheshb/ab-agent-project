(function() {
  const scriptTag = document.currentScript;
  const experimentId = scriptTag.getAttribute('data-exp-id');

  if (!experimentId) {
    console.error('A/B Agent: Experiment ID (data-exp-id) is missing.');
    return;
  }

  // ✅ Replace with your actual backend URL on Render
  const API_BASE_URL = 'https://backend-service-0d12.onrender.com';

  // 1️⃣ Fetch variation decision
  fetch(`${API_BASE_URL}/api/experiments/${experimentId}/decision`)
    .then(async response => {
      if (!response.ok) {
        const errText = await response.text();
        console.error('A/B Agent: Server Error ->', errText);
        return;
      }
      return response.json();
    })
    .then(data => {
      if (data && data.decision) {
        // Store this decision for tracking later
        window.ABAgent._setDecision(data.decision);

        // Trigger the website's callback (user-defined)
        if (typeof window.onABAgentDecision === 'function') {
          window.onABAgentDecision(data.decision);
        }
      } else {
        console.warn('A/B Agent: No decision returned from backend.');
      }
    })
    .catch(err => {
      console.error('A/B Agent: Error fetching decision ->', err);
    });

  // 2️⃣ Define global A/B Agent object
  window.ABAgent = {
    _decision: null,
    _setDecision(decision) {
      this._decision = decision;
    },

    // Called when user converts (e.g. button click)
    track() {
      if (!this._decision) {
        console.warn('A/B Agent: No decision recorded yet.');
        return;
      }

      fetch(`${API_BASE_URL}/api/experiments/${experimentId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variationName: this._decision })
      })
        .then(r => r.json())
        .then(d => console.log('A/B Agent: Feedback recorded ✅', d))
        .catch(e => console.error('A/B Agent: Error sending feedback ❌', e));
    }
  };

})();
