# NZ Airports

## Overview
NZ Airports is a web application that allows users to filter local airports by _group rating_ – a specification for runways and aeroplanes that indicates whether a particular model of plane can safely operate on a given runway – and then 'browse' suitable airports to discover airports having favourable weather conditions.

## Usage
The app can be downloaded and run locally, or via [GitHub Pages](https://mistertjb.github.io/NZ-Airports/).


The typical pattern for using the application is as follows:

1. Open the off-canvas menu to the left of the screen
2. Use the slider to filter by minimum group rating (e.g. an aeroplane having a group rating of 5 is capable of operating from runways with a group rating of 5 or more)
3. Select an airport from the list, or close the off-canvas menu and select an airport from the map
4. Selecting an airport renders an infobox containing basic information about the airport and weather information

![Starting the application](screenshots/initialised_state.png)
_Initial state_

![Choosing a group rating](screenshots/group_rating_imposed.png)
_Filtered by the most restrictive group rating_

![Infobox with weather](screenshots/infobox_rendered.png)
_The infobox shows basic airport and forecast information_
## Attribution

Forecast information is sourced from wunderground.com