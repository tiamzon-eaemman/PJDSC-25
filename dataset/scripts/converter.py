import geopandas as gpd 

# init dirs
FLOOD_SHP_DIR = "../flood_data/Laguna_Flood_5year.shp"
LANDSLIDE_SHP_DIR = "../landslide_data/Laguna_LandslideHazards.shp"

# Load 
flood_gdf = gpd.read_file(FLOOD_SHP_DIR)
landslide_gdf = gpd.read_file(LANDSLIDE_SHP_DIR)

# Convert to GeoJSON
flood_gdf.to_file("../processed_data/Laguna_Flood_5year.geojson", driver="GeoJSON")
landslide_gdf.to_file("../processed_data/Laguna_LandslideHazards.geojson", driver="GeoJSON")

