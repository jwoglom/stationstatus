<?php
$d = array();
rename("../data/blob.txt", "../data/blob.txt.".time());
$base = "http://127.0.0.1/metro/";
// Stations and Lines
$key = trim(file_get_contents("../data/apikey.txt"));
if(isset($argv, $argv[1]) && $argv[1] == "all") {
    $d["lines"] = json_decode(file_get_contents($base."query.php?path=Rail.svc/json/jLines&api_key=".$key."&format=json"))->Lines;
    $d["stations"] = json_decode(file_get_contents($base."query.php?path=Rail.svc/json/jStations&api_key=".$key."&format=json"))->Stations;
    $between = file_get_contents($base."query.php?path=Rail.svc/json/jSrcStationToDstStationInfo&api_key=".$key."&format=json");
    file_put_contents("../data/between.txt", $between);
    // Note: run redo-between.php to change format.
} else {
    $d["lines"] = json_decode(file_get_contents("../data/lines.txt"))->Lines;
    $d["stations"] = json_decode(file_get_contents("../data/stations.txt"))->Stations;
}

// Coordinates
// Run util_getcoords.php to regenerate
$d["coords"] = json_decode(file_get_contents("../data/coords.txt"));

// Paths

// Start and end points of each line
$ids = array("K08","D13","A15","B11","J03","G05","C15","E06","F11","E10","N06","G05");

for($i=0; $i<sizeof($ids); $i++) {
    $d["path-".$ids[$i]."-".$ids[$i+1]] = json_decode(file_get_contents($base."query.php?path=Rail.svc/json/jPath&api_key=".$key."&format=json&FromStationCode=".$ids[$i]."&ToStationCode=".$ids[$i+1]))->Path;
    $i++;
}

echo json_encode($d);
file_put_contents("../data/blob.txt", json_encode($d));
