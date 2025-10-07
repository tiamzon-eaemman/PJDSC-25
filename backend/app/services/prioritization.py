from typing import List, Dict, Any
import numpy as np


def score_household(hh: Dict[str, Any]) -> float:
    base = 1.0
    elderly = hh.get("numElderly", 0)
    children = hh.get("numChildren", 0)
    pwd = hh.get("numPWD", 0)
    preg = hh.get("numPregnant", 0)
    distance = float(hh.get("distanceToShelterKm", 1.0))
    hazard = float(hh.get("hazardSeverity", 1.0))

    # Weighted risk model (tunable): higher is more urgent
    score = (
        2.5 * elderly
        + 2.0 * pwd
        + 1.5 * preg
        + 1.0 * children
        + 1.25 * hazard
        + 0.5 * max(0.0, distance)
        + base
    )
    return float(score)


def prioritize_households(households: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    scores = np.array([score_household(h) for h in households])
    order = np.argsort(-scores)
    ranked = []
    for idx in order:
        h = dict(households[idx])
        h["priorityScore"] = float(scores[idx])
        ranked.append(h)
    return ranked

