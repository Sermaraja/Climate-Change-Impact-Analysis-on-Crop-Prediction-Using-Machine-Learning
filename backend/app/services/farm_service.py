import json
from typing import Optional, Dict, Any
from shapely.geometry import shape, mapping
from geoalchemy2.shape import to_shape
from geoalchemy2.elements import WKBElement, WKTElement
from app.models.farm import Farm
from app.schemas.farm import FarmResponse


def geojson_to_geometry(boundary_geojson: Optional[Dict[str, Any]], is_sqlite: bool = False):
    if not boundary_geojson:
        return None
    try:
        geom_shape = shape(boundary_geojson)
        if is_sqlite:
            return f"SRID=4326;{geom_shape.wkt}"
        return WKTElement(geom_shape.wkt, srid=4326)
    except Exception as e:
        print(f"Error converting GeoJSON: {e}")
        return None


def geometry_to_geojson(geometry_obj: Any) -> Optional[Dict[str, Any]]:
    if not geometry_obj:
        return None
    try:
        if isinstance(geometry_obj, (WKBElement, WKTElement)):
            try:
                shp = to_shape(geometry_obj)
                return mapping(shp)
            except Exception:
                raw_data = getattr(geometry_obj, 'data', str(geometry_obj))
                if isinstance(raw_data, bytes):
                    raw_data = raw_data.decode('utf-8', errors='ignore')
                wkt_clean = str(raw_data).split(";")[-1] if ";" in str(raw_data) else str(raw_data)
                from shapely.wkt import loads as wkt_loads
                shp = wkt_loads(wkt_clean)
                return mapping(shp)

        if isinstance(geometry_obj, bytes):
            geometry_obj = geometry_obj.decode('utf-8', errors='ignore')
            
        if isinstance(geometry_obj, str):
            wkt_clean = geometry_obj.split(";")[-1] if ";" in geometry_obj else geometry_obj
            if "POLYGON" in wkt_clean.upper() or "POINT" in wkt_clean.upper():
                from shapely.wkt import loads as wkt_loads
                shp = wkt_loads(wkt_clean)
                return mapping(shp)
    except Exception as e:
        print(f"Error parsing geometry_to_geojson: {e}")
    return None


def farm_to_response(farm: Farm) -> FarmResponse:
    boundary_json = geometry_to_geojson(farm.boundary)
    acres = farm.area_acres or 0.0
    hectares = round(acres * 0.404686, 2)

    return FarmResponse(
        id=farm.id,
        user_id=farm.user_id,
        farm_name=farm.farm_name,
        latitude=farm.latitude,
        longitude=farm.longitude,
        boundary_geojson=boundary_json,
        area_acres=acres,
        area_hectares=hectares,
        state=farm.state,
        district=farm.district,
        village=farm.village,
        drainage_class=farm.drainage_class,
        created_at=farm.created_at,
        updated_at=farm.updated_at,
    )
