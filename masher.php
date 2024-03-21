<?php
  $params=[];
  if (isset($argc)) {
    for ($i = 0; $i < $argc; $i++) {
      if($i) $params[] = $argv[$i];
    }
  }

  $dict = "/home/cantelope/words_common.txt";
  $words = file($dict);
  $defaultLength = 7;

  function NewWord($wordLength){
    global $words;
    $ct=0;
    do{
      $word = $words[rand()/getrandmax()*sizeof($words)|0];
      $ct++;
    }while(
      (strpos($word, '-')!==false ||
      strpos($word, '.')!==false ||
      strpos($word, ' ')!==false ||
      strpos($word, '$')!==false ||
      strpos($word, '%')!==false ||
      strpos($word, '|')!==false ||
      strpos($word, '(')!==false ||
      strpos($word, ')')!==false ||
      strpos($word, '{')!==false ||
      strpos($word, '\'')!==false ||
      strpos($word, '"')!==false ||
      strlen($word)-2 != $wordLength) && $ct<10000);
    return str_replace("\r", '', str_replace("\n", '', $word));
  }

  function scramble($word){
    $word = str_replace("\r", '', str_replace("\n", '', $word));
    $ar = str_split($word);
    for($i=99;$i--;){
      $p1 = rand()/getrandmax()*strlen($word);
      $p2 = rand()/getrandmax()*strlen($word);
      $t=$ar[$p1];
      $ar[$p1]=$ar[$p2];
      $ar[$p2]=$t;
    }
    $word = implode('', $ar);
    return $word;
  }

  if(sizeof($params)){
    switch($params[0]){
      case 'newmash':
        $wordLength = isset($params[1])&&$params[1]>1?$params[1]:$defaultLength;
        $newWord = NewWord($wordLength);
        echo $newWord . "\n";
        echo scramble($newWord) . "\n";
      break;
    }
  }
?>
