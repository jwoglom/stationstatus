<?php
$jsontxt = file_get_contents("../data/between.txt");
$d = json_decode($jsontxt);

function find($from, $to) {
    global $d;
    $obj = $d->$from->$to;
    if($obj != null) return $obj;
    
}

echo json_encode(find($_GET['from'], $_GET['to']));