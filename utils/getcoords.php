<?php
// Get coordinates for a station
function mapinfo($n) {
    return json_decode(file_get_contents("http://maps.google.com/maps/api/geocode/json?address=".urlencode($n)));
}
$names_str=<<<EOF
{"A03":"Dupont Circle","A02":"Farragut North","A01":"Metro Center","D08":"Stadium Armory","A07":"Tenleytown","A06":"Van Ness UDC","A05":"Cleveland Park","A04":"Woodley Park Zoo","C10":"National Arpt","E10":"Greenbelt","C12":"Braddock Road","B08":"Silver Spring","B09":"Forest Glen","D09":"Minnesota Avenue","D06":"Eastern Market","D07":"Potomac Avenue","D04":"Federal Center SW","D05":"Capitol South","D02":"Smithsonian","D03":"L'Enfant Plaza","B01":"Gallery Place","B02":"Judiciary Square","B03":"Union Station","B04":"Rhode Island Avenue","B05":"Brookland","B06":"Fort Totten","B07":"Takoma","D12":"Landover","C13":"King Street","K02":"Clarendon","D10":"Deanwood","E09":"College Park","C15":"Huntington","K04":"Ballston","G05":"Largo Town Center","G04":"Morgan Blvd","K01":"Court House","G01":"Benning Road","F11":"Branch Avenue","G03":"Addison Road","G02":"Capitol Heights","K07":"Dunn Loring","K06":"W Falls Church","D11":"Cheverly","K08":"Vienna","A13":"Twinbrook","A12":"White Flint","A11":"Grosvenor","A10":"Medical Center","A15":"Shady Grove","A14":"Rockville","N04":"Spring Hill","N06":"Wiehle-Reston East","N01":"McLean","N02":"Tysons Corner","N03":"Greensboro","B35":"New York Avenue","E02":"Shaw","C09":"Crystal City","C08":"Pentagon City","E08":"Prince Georges Plaza","E07":"West Hyattsville","E06":"Fort Totten","E05":"Georgia Avenue","E04":"Columbia Heights","E03":"U Street","C01":"Metro Center","E01":"Mt Vernon Sq","C03":"Farragut West","C02":"McPherson Square","C05":"Rosslyn","D01":"Federal Triangle","C07":"Pentagon","C06":"Arlington Cemetery","C04":"Foggy Bottom","K03":"Virginia Square","J03":"Franconia-Springf'ld","D13":"New Carrollton","B11":"Glenmont","K05":"E Falls Church","F08":"Southern Ave","F09":"Naylor Road","C14":"Eisenhower Avenue","F04":"Waterfront","F05":"Navy Yard","F06":"Anacostia","F07":"Congress Height","J02":"Van Dorn St","F01":"Gallery Place","F02":"Archives","F03":"L'Enfant Plaza","B10":"Wheaton","F10":"Suitland","A09":"Bethesda","A08":"Friendship Heights"}
EOF;
$names = json_decode($names_str);
print_r($names);
$allmapdata = array();
$allcoords = array();
foreach($names as $code=>$name) {
    echo "\n".$code."=>".$name.": ";
    $map = mapinfo($name." metro station Washington, DC");
    $res = $map->results[0];
    $allmapdata[$code] = $res;
    if(isset($res->geometry->location)) {
        $cds = $res->geometry->location;
        $coords = $cds->lat.",".$cds->lng;
        $allcoords[$code] = $coords;
        echo $coords;
    }
    else echo "ERROR";
    sleep(2);
}

echo json_encode($allcoords);
echo "\n";
echo json_encode($allmapdata);

file_put_contents("../data/coords.txt", json_encode($allcoords));
file_put_contents("../data/mapdata.txt", json_encode($allmapdata));
?>
