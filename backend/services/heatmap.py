# importations
import pandas as pd
import folium
from folium.plugins import HeatMap

def data_preprocessing(data):
    df = pd.DataFrame([{"scaleId": item["scaleId"], "event": item["event"], "latitude": item["latitude"], "longitude": item["longitude"]} for item in data])
    df["rounded_lat"] = df["latitude"].round(6)
    df["rounded_long"] = df["longitude"].round(6)

    df_grouped = (
        df.groupby(["scaleId", "rounded_lat", "rounded_long"], as_index=False)
        .agg(
            Frequency=("event","size"),
            scanned_freq=("event",lambda x:(x=="scanned").sum()),
            login_freq=("event",lambda x:(x=="login").sum())
        )
    )

    latitudes = df_grouped["rounded_lat"].to_list()
    longitudes = df_grouped["rounded_long"].to_list()
    coordinates = [[latitudes[index], longitudes[index]] for index in range(len(latitudes))]

    return (coordinates)

def generate_heatmap(dataframe):
    
    # creating a world map
    world_map = folium.Map(location=[0, 0], zoom_start=2)

    # supplying the necessary data for the heatmap and adding the heatmap to the world map
    # Arguments: latitude, longitude, intensity
    heatmap_data = dataframe[["rounded_lat", "rounded_long", "Frequency"]].values.tolist()
    HeatMap(heatmap_data).add_to(world_map)

    # adding a title to the map
    title_html = """
    <div style="position: fixed; 
                top: 10px; left: 50%; transform: translate(-50%, 0); 
                z-index: 1000; font-size: 20px; font-weight: bold;">
        <p>Heatmap of VOC User Locations</p>
    </div>
    """
    world_map.get_root().html.add_child(folium.Element(title_html))
    heatmap_html_data = world_map._repr_html_()

    return heatmap_html_data
