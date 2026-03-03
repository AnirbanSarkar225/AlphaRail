import requests
from typing import Dict, Any, Tuple, Optional
RAPIDAPI_KEY = "cbc7295847mshd40547ea0e3880ep1a739djsn3037bcf84a15" 
RAPIDAPI_HOST = "indian-railways-pnr-running-status.p.rapidapi.com" 
BASE_URL = f"https://{RAPIDAPI_HOST}"
api_session = requests.Session()
api_session.headers.update({
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST
})
def get_train_schedule(train_no: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    """
    Fetches live train schedule from a working API.

    Args:
        train_no: The train number to look up.

    Returns:
        A tuple containing (schedule_data, error_message).
    """
    # This API takes the train number as part of the URL path itself.
    endpoint_url = f"{BASE_URL}/schedule/train/{train_no}"

    try:
        res = api_session.get(endpoint_url, timeout=15)
        res.raise_for_status()
        data = res.json()

        if data.get("status") == "success" and data.get("data"):
            # This API uses a slightly different response structure.
            schedule = [
                {
                    "station": stop.get("station_name", "Unknown"),
                    "code": stop.get("station_code", ""),
                    "arrival": stop.get("arrival_time", "N/A"),
                    "departure": stop.get("departure_time", "N/A"),
                }
                for stop in data["data"].get("route", [])
            ]
            
            return {"train_no": train_no, "schedule": schedule}, None
        
        return None, f"API did not return schedule data. Message: {data.get('message', 'Unknown')}"

    except requests.exceptions.HTTPError as http_err:
        return None, f"HTTP error occurred: {http_err} - {res.text}"
    except requests.exceptions.RequestException as req_err:
        return None, f"A request error occurred: {req_err}"
    except Exception as e:
        return None, f"An unexpected error occurred: {e}"