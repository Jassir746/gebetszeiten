
<?php
  file_put_contents(__DIR__ . "/test_debug_output.log", "Test OK\n", FILE_APPEND);
  echo "Hello from test_debug.php";
?>
