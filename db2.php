<?php
  $db_user="user";
  $db_pass=explode("\n", file_get_contents('/home/cantelope/plorgpw'))[0];
  $db_host="localhost";
  $db="videodemos";
  $audioTrackURL = 'https://audiocloud.whitehot.ninja/track/';
  $shortyURL = 'https://shorty.dweet.net/';
  $send = false;
  $link = mysqli_connect($db_host, $db_user, $db_pass, $db);
?>
