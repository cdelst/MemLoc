package server

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/pkg/errors"

	"github.com/influxdata/influxdb-client-go/v2"
)

func WriteLocationEntry(entry LocationEntry) {
	if entry.Type != "Feature" {
		return
	}
	parsedTimestamp, err := time.Parse(time.RFC3339, entry.Properties.Timestamp)
	if err != nil {
		panic(err)
	}

	// create point using fluent style
	p := influxdb2.NewPointWithMeasurement("location").
		AddField("lat", entry.Geometry.Coordinates[Latitude]).
		AddField("long", entry.Geometry.Coordinates[Longitude]).
		AddField("alt", entry.Properties.Altitude).
		AddField("spd", entry.Properties.Speed).
		AddField("hacc", entry.Properties.HorizontalAccuracy).
		AddField("vacc", entry.Properties.VerticalAccuracy).
		AddField("motion", motionToString(entry.Properties.Motion)).
		AddField("id", entry.Properties.DeviceID).
		AddField("bat_state", entry.Properties.BatteryState == "charging").
		AddField("bat_level", entry.Properties.BatteryLevel).
		SetTime(parsedTimestamp)

	// write point asynchronously
	InfluxWrite.WritePoint(p)
	InfluxWrite.Flush()
}

// This has to be called before using the clients
func InitInfluxClients() error {
	apiToken := os.Getenv("INFLUX_API_TOKEN")
	if apiToken == "" {
		fmt.Printf("Influx Token Not Set.")
		return errors.New("$INFLUX_API_TOKEN not set.  Cannot init influx client")
	}

	InfluxClient = influxdb2.NewClient("https://us-west-2-1.aws.cloud2.influxdata.com", apiToken)
	InfluxWrite = InfluxClient.WriteAPI("casedelst@gmail.com", "location")
	InfluxQuery = InfluxClient.QueryAPI("casedelst@gmail.com")
	return nil
}

// Pretty self explanatory
func getLastPoint() LocationRecord {
	query := `from(bucket:"location")|> range(start: -30d) |> last()`

	// get QueryTableResult
	result, err := InfluxQuery.Query(context.Background(), query)
	if err != nil {
		panic(err)
	}

	var record LocationRecord

	// Iterate over query response, filling struct
	for result.Next() {
		switch result.Record().Field() {
		case "lat":
			record.Latitude = result.Record().Value().(float64)
			record.Timestamp = result.Record().Time()
		case "long":
			record.Longitude = result.Record().Value().(float64)
		case "alt":
			record.Altitude = int(result.Record().Value().(int64))
		case "spd":
			record.Speed = int(result.Record().Value().(int64))
		case "hacc":
			record.HorizontalAccuracy = int(result.Record().Value().(int64))
		case "vacc":
			record.VerticalAccuracy = int(result.Record().Value().(int64))
		case "motion":
			record.Motion = result.Record().Value().(string)
		case "id":
			record.DeviceId = result.Record().Value().(string)
		case "bat_state":
			record.BatteryState = result.Record().Value().(bool)
		case "bat_level":
			record.BatteryLevel = result.Record().Value().(float64)
		default:
			fmt.Printf("Entered default case, Field: %s", result.Record().Field())
		}
	}
	// check for an error
	if result.Err() != nil {
		panic(err)
	}

	fmt.Printf("Parsed struct: %+v\n", record)
	return record
}

// TODO still, parse the records and return an array of coordinates for use with this:
// https://deck.gl/docs/api-reference/aggregation-layers/cpu-grid-layer
func getCoordinateListFromRange(start string) CoordinateList {
	// Query gets data formatted like in a map, can use ValueByKey to select them:
	/*
		map[_measurement:location _start:2021-10-09 06:13:16.934519278 +0000 UTC _stop:2021-11-08 06:13:16.934519278 +0000 UTC
		_time:2021-10-24 01:18:04 +0000 UTC alt:66 bat_level:0.6499999761581421 bat_state:false
		hacc:11 id:CD6s lat:36.97199261359573 long:-122.05449562737229 motion:  result:_result
		spd:-1 table:0 vacc:22]
	*/
	query := fmt.Sprintf(`from(bucket:"location")
		|> range(start: %s) 
		|> filter(
			fn: (r) => r._field == "long" or r._field == "lat"
		)
		|> pivot(
			rowKey:["_time"],
    		columnKey: ["_field"],
    		valueColumn: "_value"
		)
	`, start)

	// get QueryTableResult
	result, err := InfluxQuery.Query(context.Background(), query)
	if err != nil {
		panic(err)
	}

	var coords [][]float64
	for {
		if result.Next() {
			record := result.Record()
			coords = append(coords, []float64{record.ValueByKey("long").(float64), record.ValueByKey("lat").(float64)})
		} else {
			break
		}
	}

	coordList := CoordinateList{Coordinates: coords}
	return coordList
}
