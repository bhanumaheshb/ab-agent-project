(function() {
    // This runs immediately
    const scriptTag = document.currentScript;
    const experimentId = scriptTag.getAttribute('data-exp-id');

    if (!experimentId) {
        console.error('A/B Agent: Experiment ID (data-exp-id) is missing.');
        return;
    }

    // --- NEW CODE ---
    const API_BASE_URL = 'https://backend-service-ddt2.onrender.com';

    // 1. Get the decision from the backend
    fetch(`${API_BASE_URL}/api/experiments/${experimentId}/decision`)
        .then(response => response.json())
        .then(data => {
            if (data.decision) {
                // We got a decision! (e.g., "blue-button")
                // Now, we call a function on the customer's website
                if (window.onABAgentDecision) {
                    window.onABAgentDecision(data.decision);
                }
            }
        })
        .catch(err => {
            console.error('A/B Agent: Error fetching decision.', err);
        });

    // 2. Create a global 'track' function for Maria to call
    window.ABAgent = {
        track: function() {
            // This function sends the "success" feedback
            const decision = scriptTag.getAttribute('data-decision-made');
            if (!decision) {
                console.warn('A/B Agent: No decision to track.');
                return;
            }

            fetch(`${API_BASE_URL}/api/experiments/${experimentId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variationName: decision })
            })
            .then(response => response.json())
            .then(data => {
                console.log('A/B Agent: Feedback recorded.');
            })
            .catch(err => {
                console.error('A/B Agent: Error recording feedback.', err);
            });
        },
        
        // Internal function to store the decision
        _setDecision: function(decision) {
             scriptTag.setAttribute('data-decision-made', decision);
        }
    };
    
    // We override the 'onABAgentDecision' function to also store the decision
    const originalCallback = window.onABAgentDecision || function() {};
    window.onABAgentDecision = function(decision) {
        window.ABAgent._setDecision(decision); // Store it
        originalCallback(decision); // Call Maria's function
    }

})();