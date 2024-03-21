<?php
  require ('db2.php');

  function fixedDate($rawDate){
    return date("m/d/Y",strtotime($rawDate));
  }

  function decToAlpha($val){
    $alphabet="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $ret="";
    while($val){
      $r=floor($val/62);
      $frac=$val/62-$r;
      $ind=(int)round($frac*62);
      $ret=$alphabet[$ind].$ret;
      $val=$r;
    }
    return $ret==""?"0":$ret;
  }

  function alphaToDec($val){
    $pow=0;
    $res=0;
    while($val!=""){
      $cur=$val[strlen($val)-1];
      $val=substr($val,0,strlen($val)-1);
      $mul=ord($cur)<58?$cur:ord($cur)-(ord($cur)>96?87:29);
      $res+=$mul*pow(62,$pow);
      $pow++;
    }
    return $res;
  }
  $params=[];
  if (isset($argc)) {
    for ($i = 0; $i < $argc; $i++) {
      if($i) $params[] = mysqli_real_escape_string($link, $argv[$i]);
    }
  }

  $tokens = '';
  forEach($params as $param){
    $tokens .= " trackName LIKE \"%$param%\" OR author LIKE \"%$param%\" OR";
  }
  $tokens = substr($tokens, 0, strlen($tokens)-3);
  $sql = "SELECT * FROM audiocloudTracks WHERE private = 0 AND ({$tokens}) ORDER BY plays DESC";
  $res = mysqli_query($link, $sql);
  $ct=0;
  $maxCt = 5;
  for($i=0; $i<mysqli_num_rows($res);++$i){
    $row = mysqli_fetch_assoc($res);
    if($ct<$maxCt){
      $ct++;
      $slug = decToAlpha($row['id']);
      $rawDate = $row['date'];
      $date = fixedDate($rawDate);
      $shortySlug = shell_exec("curl -s https://shorty.dweet.net/shorty.php?$audioTrackURL$slug");
      echo "$shortyURL$shortySlug  <-  [\"{$row['trackName']}\" by {$row['author']}, plays: {$row['plays']}, added: $date]\n";
    }
  }
  if(!$ct) echo "no tracks found... :(\n";
?>
