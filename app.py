def getliveTemp(latitude, longitude):
    """
    Get live temperature for a given latitude and longitude.
    """
    import requests

    # Define the API endpoint and parameters    
    api_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current_weather": True,
    }
    # Make the API request
    response = requests.get(api_url, params=params)
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()
        # Extract the current temperature
        current_temp = data["current_weather"]["temperature"]
        return {"temperature": current_temp}
    else:
        # Handle errors
        return {"error": "Failed to retrieve data from API"}
