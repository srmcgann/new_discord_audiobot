<?php
  require('./db.php');
  $maxSeconds = 600;
  $params = [];
  if (isset($argc)) {
    for ($i = 0; $i < $argc; $i++) {
      if($i) $params[] = $argv[$i];
    }
  }
  $id = mysqli_real_escape_string($link, $params[0]);
  $playlist = str_replace('#', '', $params[1]);
  if(!$id || strlen($id) < 8 || strlen($id) > 15) die();
  $cmd = "youtube-dl -x --get-title --no-color https://youtu.be/$id";
  $filename = str_replace('"','', str_replace('@', '', str_replace('/', '', (str_replace('%', '', str_replace('#', '', str_replace("'",'', str_replace("\n", '', shell_exec($cmd)))))))));
  if($filename){
    $cmd = "youtube-dl -x --get-description --no-color https://youtu.be/$id";
    $description = (str_replace("\n", '', shell_exec($cmd)));
    $cmd = "youtube-dl -x --get-thumbnail --no-color https://youtu.be/$id";
    $thumbnail = (str_replace("\n", '', shell_exec($cmd)));
    $cmd = "youtube-dl -x --get-duration --no-color --audio-format mp3 https://youtu.be/$id";
    $duration = explode(':', (str_replace("\n", '', shell_exec($cmd))));
    switch(sizeof($duration)){
      case 0: die(); break;
      case 1: $hours=0; $minutes=0; $seconds=$duration[0]; break;
      case 2: $hours=0; $minutes=$duration[0]; $seconds=$duration[1]; break;
      case 3: $hours=$duration[0]; $minutes=$duration[1]; $seconds=$duration[2]; break;
    }
    $totalSeconds = $hours*3600+$minutes*60+$seconds;
    if($totalSeconds <= $maxSeconds){
      @mkdir("/tower/$playlist-tracks/");
      $escname = escapeshellarg("/tower/$playlist-tracks/$filename.mp3");
      //$tempname = escapeshellarg("./normalized/$filename.mkv");
      $cmd = "youtube-dl -x --write-thumbnail --audio-format mp3 -o $escname https://youtu.be/$id";
      shell_exec($cmd);
      //$cmd = "ffmpeg-normalize -f -t -5 $escname 2>&1";
      //shell_exec($cmd);
      //$cmd = "ffmpeg -y -loglevel quiet -i $tempname $escname";
      //shell_exec($cmd);
      //$cmd = "rm $tempname";
      //shell_exec($cmd);
      echo json_encode([true, "$filename.mp3", $filename, $description, $hours, $minutes, $seconds, $thumbnail, $cmd]);
      die();
    }
  }else{
    echo [false];
    die();
  }
  echo ['false'];
?>

