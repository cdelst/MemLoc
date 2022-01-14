package server

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"time"
)

// This is the main brain of the location filtering and storing.  It loops through the location payload
// filtering along the way so that we don't get a huge amount of useless points.  The values are changeable,
// but they work by setting timeouts after specific updates.  So if someone hasn't moved more than 25 meters, we don't
// want another update for 10 minutes, as we'd just be logging identical info.  It just saves space in DB.
func FilterAndWriteLocationData(payload LocationPayload) {
	entries := make([]LocationEntry, 1000)
	var workingTime time.Time
	var count int

	lastPoint := GetLastPoint()
	workingTime = lastPoint.Timestamp

	for _, location := range payload.Locations {
		gapDuration, _ := time.ParseDuration("10s")
		properties := location.Properties
		motions := properties.Motion

		parsedTime, err := time.Parse(time.RFC3339, properties.Timestamp)
		if err != nil {
			panic(err)
		}

		if lastPoint.Timestamp.After(parsedTime) {
			continue
		}

		if (doesContain(motions, "stationary") && len(motions) == 1) || properties.Speed <= 1 {
			gapDuration, err = time.ParseDuration("1m")
			if err != nil {
				panic(err)
			}
		}

		// If it's been 5 minutes we still want data occasionally even if it's bad accuracy
		if properties.HorizontalAccuracy > 25 {
			gapDuration, err = time.ParseDuration("5m")
			if err != nil {
				panic(err)
			}
		}

		metersApart := distance(
			lastPoint.Latitude,
			lastPoint.Longitude,
			location.Geometry.Coordinates[Latitude],
			location.Geometry.Coordinates[Longitude],
		)
		if metersApart < 25 {
			gapDuration, err = time.ParseDuration("10m")
			if err != nil {
				panic(err)
			}
		}

		timeDiff := parsedTime.Sub(workingTime)
		if gapDuration < timeDiff {
			count++
			entries = append(entries, location)
			workingTime = parsedTime
			lastPoint = convertLocationEntryToRecord(location)
			WriteLocationEntry(location)
		}
	}

	GlobalCache.invalidateCache()
	fmt.Printf("Added %d new entries to Influx\n", count)
}

func doesContain(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func ParseLocationPayload(payloadReadCloser io.ReadCloser) (LocationPayload, error) {
	bytes, _ := ioutil.ReadAll(payloadReadCloser)

	var locationPayload LocationPayload
	err := json.Unmarshal(bytes, &locationPayload)
	if err != nil {
		return LocationPayload{}, err
	}

	return locationPayload, nil
}

func convertLocationEntryToRecord(location LocationEntry) LocationRecord {
	parsedTime, err := time.Parse(time.RFC3339, location.Properties.Timestamp)
	if err != nil {
		panic(err)
	}

	return LocationRecord{
		Timestamp:          parsedTime,
		Latitude:           location.Geometry.Coordinates[Latitude],
		Longitude:          location.Geometry.Coordinates[Longitude],
		Altitude:           location.Properties.Altitude,
		Speed:              location.Properties.Speed,
		HorizontalAccuracy: location.Properties.HorizontalAccuracy,
		VerticalAccuracy:   location.Properties.VerticalAccuracy,
		Motion:             motionToString(location.Properties.Motion),
		DeviceId:           location.Properties.DeviceID,
		BatteryState:       location.Properties.BatteryState == "charging",
		BatteryLevel:       location.Properties.BatteryLevel,
	}
}

// Converts a maybe non-standard string to a one-word result, or empty " "
func motionToString(motion []string) string {
	result := ""
	for i := 0; i < len(motion); i++ {
		if i != 0 {
			result += ","
		}
		result += motion[i]
	}

	if len(result) == 0 {
		result += " "
	}

	return result
}

// Distance function returns the distance (in meters) between two points of
//     a given longitude and latitude relatively accurately (using a spherical
//     approximation of the Earth) through the Haversin Distance Formula for
//     great arc distance on a sphere with accuracy for small distances
//
// point coordinates are supplied in degrees and converted into rad. in the func
//
// distance returned is METERS!!!!!!
// http://en.wikipedia.org/wiki/Haversine_formula
func distance(lat1, lon1, lat2, lon2 float64) float64 {
	// convert to radians
	// must cast radius as float to multiply later
	var la1, lo1, la2, lo2, r float64
	la1 = lat1 * math.Pi / 180
	lo1 = lon1 * math.Pi / 180
	la2 = lat2 * math.Pi / 180
	lo2 = lon2 * math.Pi / 180

	r = 6378100 // Earth radius in METERS

	// calculate
	h := hsin(la2-la1) + math.Cos(la1)*math.Cos(la2)*hsin(lo2-lo1)

	return 2 * r * math.Asin(math.Sqrt(h))
}

// haversin(θ) function
func hsin(theta float64) float64 {
	return math.Pow(math.Sin(theta/2), 2)
}
