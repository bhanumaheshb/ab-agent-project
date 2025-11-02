from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List
import numpy as np

# --- Pydantic Models (Defines our data structure) ---
# This defines what a "Variation" looks like
class Variation(BaseModel):
    name: str
    trials: int = Field(..., ge=0)      # ge=0 means "greater than or equal to 0"
    successes: int = Field(..., ge=0)

# This defines the incoming data our API will expect
class ExperimentData(BaseModel):
    variations: List[Variation]

# --- Create the FastAPI Application ---
app = FastAPI()

# --- API Endpoints ---

@app.get("/")
def read_root():
    """A simple 'health check' endpoint to see if the server is running."""
    return {"status": "ML Service is running"}


@app.post("/decision")
def get_decision(data: ExperimentData):
    """
    Takes experiment data and uses Thompson Sampling
    to return the best variation to show next.
    """
    best_variation_name = None
    max_sample = -1

    for var in data.variations:
        # --- This is the Thompson Sampling "magic" ---
        # We use a Beta distribution: Beta(successes + 1, failures + 1)
        # Adding 1 (a "prior") prevents division-by-zero on new experiments.
        
        failures = var.trials - var.successes
        
        # Data sanity check to ensure failures are not negative
        if failures < 0:
            failures = 0 
            
        sample = np.random.beta(var.successes + 1, failures + 1)
        
        # Check if this variation's sample is the highest so far
        if sample > max_sample:
            max_sample = sample
            best_variation_name = var.name
            
    # As a failsafe, default to the first variation if anything goes wrong
    if best_variation_name is None:
        best_variation_name = data.variations[0].name

    return {"decision": best_variation_name}