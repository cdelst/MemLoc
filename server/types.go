package server

import (
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"time"
)

var (
	InfluxClient influxdb2.Client
	InfluxWrite  api.WriteAPI
	InfluxQuery  api.QueryAPI
	GlobalCache Cache
)

// Location stuff
const (
	Longitude  int = 0
	Latitude     = 1
)

type LocationPayload struct {
	Locations []LocationEntry `json:"locations"`
}

type LocationEntry struct {
	Type     string `json:"type"`
	Geometry struct {
		Type        string    `json:"type"`
		Coordinates []float64 `json:"coordinates"`
	} `json:"geometry"`
	Properties struct {
		Timestamp          string   `json:"timestamp"`
		Altitude           int      `json:"altitude"`
		Speed              int      `json:"speed"`
		HorizontalAccuracy int      `json:"horizontal_accuracy"`
		VerticalAccuracy   int      `json:"vertical_accuracy"`
		Motion             []string `json:"motion"`
		Pauses             bool     `json:"pauses"`
		Activity           string   `json:"activity"`
		DesiredAccuracy    int      `json:"desired_accuracy"`
		Deferred           int      `json:"deferred"`
		SignificantChange  int      `json:"significant_change"`
		LocationsInPayload int      `json:"locations_in_payload"`
		DeviceID           string   `json:"device_id"`
		Wifi               string   `json:"wifi"`
		BatteryState       string   `json:"battery_state"`
		BatteryLevel       float64  `json:"battery_level"`
	} `json:"properties"`
}

// For linestrings
type GeoJSONEntry struct {
	Type string `json:"type"`
	Geometry struct {
		Type string `json:"type"`
		Coordinates []float64 `json:"coordinates"`
	} `json:"geometry"`
	Properties struct{
		Timestamp          string   `json:"timestamp"`
		Altitude           int      `json:"altitude"`
		Speed              int      `json:"speed"`
		Motion             []string `json:"motion"`
		BatteryLevel       float64  `json:"battery_level"`
	}
}

type CoordinateList struct {
	Coordinates [][]float64 `json:"coordinates,omitempty"`
}

type LocationRecord struct {
	Timestamp          time.Time `json:"timestamp"`
	Latitude           float64   `json:"latitude"`
	Longitude          float64   `json:"longitude"`
	Altitude           int       `json:"altitude"`
	Speed              int       `json:"speed"`
	HorizontalAccuracy int       `json:"horizontal_accuracy"`
	VerticalAccuracy   int       `json:"vertical_accuracy"`
	Motion             string    `json:"motion"`
	DeviceId           string    `json:"device_id"`
	BatteryState       bool      `json:"battery_state"`
	BatteryLevel       float64   `json:"battery_level"`
}

// Cache Stuff
type Cache struct {
	CoordsListCache map[string]CoordsListCacheItem
	LastPoint LastPointCacheItem
}

type CoordsListCacheItem struct {
	UpToDate bool
	Coordinates CoordinateList
}

type LastPointCacheItem struct {
	UpToDate bool
	LastPoint LocationRecord
}
