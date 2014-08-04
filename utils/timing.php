<?php

// Start and end points of each line

$key = trim(file_get_contents("data/apikey.txt"));
$get = file_get_contents("http://api.wmata.com/StationPrediction.svc/json/GetPrediction/All?api_key=".$key);
$data = json_decode($get);
$data->timestamp = time();
file_put_contents("data/timing.txt", json_encode($data));
