api = "https://www.cusense.net:8082/api/v1/sensorData/realtime/all"


function CreateGeoJson(station) {
    var geojson = {};
    geojson['type'] = 'FeatureCollection';
    geojson['features'] = [];


    for (var key in station) {
        if (station.hasOwnProperty(key)) {
            const lat = station[key].info.lat;
            const lon = station[key].info.lon;
            const station_name = station[key].info.name;
            const time = station[key].data[0].time;
            const pm25 = station[key].data[0].pm25;
            const pm10 = station[key].data[0].pm10;
            const humid = station[key].data[0].humid;
            const temp = station[key].data[0].temp;
            const sensorColor = getSensorColor(station[key].data[0].pm25);
            // console.log("ชื่อ: " + station_name + " พิกัด (" + lat + "," + lon + ")" + " เวลา: " + time + " pm2.5 :" + pm25 + " pm10 :" + pm10);
            var newFeature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(lon),
                        parseFloat(lat)
                    ]
                },
                "properties": {
                    "ชื่อสถานี": station_name,
                    "เวลา": time,
                    "pm2.5": pm25,
                    "pm10": pm10,
                    "ความชื้น": humid,
                    "อุณหภูมิ": temp,
                    "sensorColor": sensorColor
                }
            }
            geojson['features'].push(newFeature);

        }
    }
    return geojson;
}


function createCircleMarker(feature, latlng) {
    const markerHtmlStyles = `
    background-color: ${getColor(feature.properties.sensorColor)};
    color: #fff;
    text-align: center;
    border-radius: 30px;
    border-width: 3px;
    opacity: .95;
    `

    var myIcon = L.divIcon({
        iconSize: L.point(25, 25),
        className: '',
        html: `<div style="${markerHtmlStyles}">${(feature.properties["pm2.5"]).toString()}</div>`


    });


    let options = {
        icon: myIcon
    }

    return new L.marker(latlng, options).addTo(mymap)

}



function onEachFeature(feature, layer) {



    if (feature.properties && (feature.properties["pm2.5"]).toString()) {

        layer.bindPopup('<pre>' + JSON.stringify(feature.properties, null, ' ').replace(/[\{\}"]/g, '') + '</pre>');


    }

}

// (feature.properties.pm25).toString()



function getPM() {

    const pm = axios({
        method: 'get',
        url: api,
        headers: { 'Access-Control-Allow-Origin': '*', 'X-Gravitee-Api-Key': '785cd5f8-b7b8-4fc6-b500-bd69255fb47d' }
    }).then(function(respone) {
        let station = respone.data;
        geojson = CreateGeoJson(station)
        console.log(geojson);
        L.geoJSON(geojson, {
            pointToLayer: createCircleMarker,
            onEachFeature: onEachFeature
        }).addTo(mymap);


    })
}
getPM()