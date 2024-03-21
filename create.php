<?php
  require('db.php');
  $data = json_decode(file_get_contents('php://input'));
  $playlist = str_replace('#','',mysqli_real_escape_string($link, $data->{'playlist'}));
  if(!$playlist) die();
  $ar = glob($playlist, GLOB_ONLYDIR);
  $ret='true';
  if(!sizeof($ar)){
    $playlist = './' . $playlist;
    $playlist = escapeshellarg($playlist);
    $output = shell_exec("mkdir $playlist");
    $output .= shell_exec("ln -sr .base/*.png $playlist");
    $output .= shell_exec("ln -sr .base/*.mp4 $playlist");
    $output .= shell_exec("ln -sr .base/*.php $playlist");
    $output .= shell_exec("mkdir /tower/$playlist-tracks");
    $output .= shell_exec("mkdir $playlist/t");
    $output .= shell_exec("ln -sr ./.base/t/.* $playlist/t");
    $output .= shell_exec("ln -sr ./.base/t/* $playlist/t");
    $output .= shell_exec("ln -sr /tower/$playlist-tracks $playlist/tracks");
    $output .= shell_exec("ln -sr ./.base/tracks/*.mp3 $playlist/tracks");
    $ret = [true, $output, $playlist];
  } else {
    $ret='false';
  }
  echo json_encode([$ret]);
?>

