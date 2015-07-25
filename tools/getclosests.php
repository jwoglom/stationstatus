<?php
error_reporting(0);
header("Content-type: text/json");
echo file_get_contents("http://api.wmata.com/rail.svc/json/jStationEntrances?lat=".$_GET['lat']."&lon=".$_GET['lon']."&radius=0&api_key=".trim(file_get_contents("./apikey.txt")));
?>
