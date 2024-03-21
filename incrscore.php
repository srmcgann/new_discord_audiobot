<?php
  require('mashdb.php');
  $params=[];
  if (isset($argc)) {
    for ($i = 0; $i < $argc; $i++) {
      if($i) $params[] = $argv[$i];
    }
  }
  if(!isset($params[0])) die();
  $chatter = strtoupper(mysqli_real_escape_string($link, $params[0]));
  if(!$chatter) die();
  $sql = 'SELECT * FROM mashers WHERE chatter = "'.$chatter.'"';
  $res = mysqli_query($link, $sql);
  if(mysqli_num_rows($res)){
    $row = mysqli_fetch_assoc($res);
    $score = $row['score']+1;
    $sql = 'UPDATE mashers SET score = score + 1 WHERE chatter = "'.$chatter.'"';
    mysqli_query($link, $sql);
  }else{
    $sql = 'INSERT INTO mashers (chatter, score) VALUES("'.$chatter.'", 0);';
    mysqli_query($link, $sql);
    $score = 0;
  }

  echo $score+1;
?>
