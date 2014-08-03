<?php
$data = array();
$t = json_decode(file_get_contents("timing.txt"));
$data["timing"] = $t->Trains;
$i = json_decode(file_get_contents("incidents.txt"));
$data["incidents"] = $i->Incidents;
$data["timestamp"] = array(
    "timing" => $t->timestamp,
    "incidents" => $i->timestamp,
    "dynamic" => time()
);
echo json_encode($data);
?>