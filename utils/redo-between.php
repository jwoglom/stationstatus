<?php
$jsontxt = file_get_contents("../data/between.txt");
$d = json_decode($jsontxt)->StationToStationInfos;
$n = array();
function redo() {
    global $d, $n;
    for($i=0; $i<sizeof($d); $i++) {
        $f = $d[$i]->SourceStation;
        $t = $d[$i]->DestinationStation;
        if(array_key_exists($f, $n) == false) {
            $n[$f] = array();
        }
        $n[$f][$t] = $d[$i];
    }
}

redo();
echo json_encode($n);
?>