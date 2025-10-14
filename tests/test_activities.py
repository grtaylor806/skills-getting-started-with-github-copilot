from fastapi.testclient import TestClient
import pytest

from src.app import app, activities


@pytest.fixture(autouse=True)
def client():
    # Make a copy of activities to restore after each test
    backup = {k: {**v, "participants": list(v["participants"])} for k, v in activities.items()}
    client = TestClient(app)
    yield client
    # restore
    activities.clear()
    activities.update(backup)


def test_get_activities(client):
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unregister(client):
    activity = "Chess Club"
    email = "teststudent@mergington.edu"

    # ensure not present
    assert email not in activities[activity]["participants"]

    # sign up
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert resp.status_code == 200
    assert email in activities[activity]["participants"]

    # unregister
    resp = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    assert resp.status_code == 200
    assert email not in activities[activity]["participants"]


def test_unregister_nonexistent(client):
    activity = "Chess Club"
    email = "notregistered@mergington.edu"

    assert email not in activities[activity]["participants"]
    resp = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    assert resp.status_code == 404
