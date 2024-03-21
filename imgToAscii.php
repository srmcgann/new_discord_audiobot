<?php
  require('db.php');
  $ipfsURL='https://ipfs.dweet.net/ipfs/';
  $ipfs_dir = explode("\n",shell_exec('which ipfs'))[0];;
  $data = json_decode(file_get_contents('php://input'));
  $baseAsciiGenerator='https://imgToAscii.dweet.net/';
  $img = mysqli_real_escape_string($link, $data->{'img'});
  $delay = intval(mysqli_real_escape_string($link, $data->{'delay'}));
  $width = intval(mysqli_real_escape_string($link, $data->{'width'}));
  $height = intval(mysqli_real_escape_string($link, $data->{'height'}));
  $out='/tower/ascii_scratchfolder/'.md5($img.(rand())).'.png';
  if($img){
    if($delay < 0 || $delay > 30000) $delay = 0;
    $url = "$baseAsciiGenerator$img";
    $webshotOutput = exec($webshotCommand = "webshot $url $delay $width $height $out  2>&1");
    $output = shell_exec($command = "sudo -u cantelope $ipfs_dir add $out -q 2>&1");
    $t = 2;
    $ipfs_hash=($s=explode("\n", $output))[sizeof($s)-$t];
    unlink($out);
    echo json_encode([true, $ipfsURL . $ipfs_hash]);
  } else {
    echo json_encode([false, $img]);
  }
?>
