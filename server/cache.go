package server

import "fmt"

func InitCache() {
	GlobalCache = Cache{
		CoordsListCache: make(map[string]CoordsListCacheItem),
	}
}

func GetLastPoint() LocationRecord {
	if GlobalCache.LastPoint.UpToDate{
		fmt.Printf("\nUsing Cached Last Point.\n")
		return GlobalCache.LastPoint.LastPoint
	} else {
		result := getLastPoint()
		GlobalCache.LastPoint = LastPointCacheItem{
			UpToDate:  true,
			LastPoint: result,
		}

		return result
	}
}

func GetCoordsFrom(start string) CoordinateList {
	item, ok := GlobalCache.CoordsListCache[start]
	if ok && item.UpToDate{
		fmt.Printf("\nUsing Cached Coordinate List.\n")
		return item.Coordinates
	} else {
		result := getCoordinateListFromRange(start)


		GlobalCache.CoordsListCache[start] = CoordsListCacheItem{
			UpToDate: true,
			Coordinates: result,
		}

		return result
	}
}

func (cache *Cache) invalidateCache() {
	for k, _ := range cache.CoordsListCache {
		cache.CoordsListCache[k] = CoordsListCacheItem{
			UpToDate:    false,
			Coordinates: CoordinateList{},
		}
	}

	cache.LastPoint.UpToDate = false
}
