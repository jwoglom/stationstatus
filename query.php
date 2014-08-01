<?php
if($_GET['path'] == "Rail.svc/json/jLines") {
    echo file_get_contents("lines.txt");
} else if($_GET['path'] == "Rail.svc/json/jStations") {
    echo file_get_contents("stations.txt");
} else {
    echo file_get_contents("http://api.wmata.com/".$_GET['path']."?".http_build_query($_GET));
}
?>