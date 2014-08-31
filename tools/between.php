<?php
$jsontxt = file_get_contents("../data/between.txt");
$d = json_decode($jsontxt)->StationToStationInfos;

function find($from, $to) {
    global $d;
    for($i=0; $i<sizeof($d); $i++) {
        if($d[$i]->SourceStation == $from && $d[$i]->DestinationStation == $to) {
            return $d[$i];
        }
    }
}

echo json_encode(find($_GET['from'], $_GET['to']));