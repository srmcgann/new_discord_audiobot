<?php
  require('db.php');
  if(!isset($_GET['nick']) && !isset($argc)) die();
  if (isset($argc)) {
    for ($i = 0; $i < $argc; $i++) {
      if($i) $params[] = $argv[$i];
    }
    $nick = $params[0];
  } else {
    $nick = mysqli_real_escape_string($link, $_GET['nick']);
    $auth = $_GET['auth'];
    if($auth != 'audiobot57253') die();
  }
  if(!$nick) die();
  $sql = "SELECT * FROM users WHERE nick = \"$nick\"";
  $res = mysqli_query($link, $sql);
  if(!mysqli_num_rows($res)){
    $sql = "INSERT INTO users (nick) VALUES(\"$nick\")";
    mysqli_query($link, $sql);
  }
  $sql = "UPDATE users SET score = score + 1 WHERE nick = \"$nick\"";
  mysqli_query($link, $sql);
  $sql = "SELECT score FROM users WHERE nick = \"$nick\"";
  $res = mysqli_query($link, $sql);
  $score = mysqli_fetch_assoc($res)['score'];
  echo $score;
?>
