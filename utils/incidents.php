<?php

$key = trim(file_get_contents("../data/apikey.txt"));
$get = file_get_contents("http://api.wmata.com/Incidents.svc/json/Incidents?api_key=".$key);
$data = json_decode($get);
$data->timestamp = time();
file_put_contents("../data/incidents.txt", json_encode($data));
