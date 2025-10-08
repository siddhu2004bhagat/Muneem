import requests

BASE = "http://localhost:8000/api/v1/ai"


def test_ai_health():
    assert requests.get(BASE + "/health").status_code == 200


def test_ai_train():
    assert requests.post(BASE + "/train").status_code == 200


def test_ai_predict():
    assert requests.post(BASE + "/predict", json={"description": "sale invoice", "amount": 100}).status_code == 200


def test_ai_anomaly():
    assert requests.get(BASE + "/anomaly").status_code == 200
