<?php
error_reporting(0);
header("Content-type: text/json");
$data = array();
$t = json_decode(file_get_contents("timing.txt"));
$data["timing"] = $t->Trains;
$i = json_decode(file_get_contents("incidents.txt"));
$data["incidents"] = $i->Incidents;
$o = json_decode(file_get_contents("outages.txt"));
$data["outages"] = $o->ElevatorIncidents;
$data["timestamp"] = array(
    "timing" => $t->timestamp,
    "incidents" => $i->timestamp,
    "outages" => $o->timestamp,
    "dynamic" => time()
);
echo json_encode($data);
?>
