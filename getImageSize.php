<?php
  $url = $argv[1];
  echo json_encode(getImageSize($url));
?>
