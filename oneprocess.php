<?php
   $s = explode("\n", shell_exec('ps -ef | grep "node index.js"'));
   array_pop($s);
   $ar = [];
   if(sizeof($s)<2){
     echo "no duplicate processes found\n";
     die();
   }
   for($i=0; $i < sizeof($s); ++$i){
      if(strpos($s[$i], 'SCREEN') === false && strpos($s[$i], 'grep') === false){
        echo $s[$i] . "\n";
        $ar[]=@intVal(@explode(' ', @str_replace('  ', ' ', $s[$i]))[1]);
      }
   }
   @asort($ar, SORT_NUMERIC);
   if(isset($ar) && sizeof($ar) > 0) echo shell_exec('kill ' . $ar[sizeof($ar)-1]);
?>
