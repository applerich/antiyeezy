<!doctype html>
<html lang="en">
<head>
  <title>
    yzyski
  </title>
  <?php
    $dice = rand(1, 100);
    $byPassChance = 97;

    if($dice>$byPassChance){
      echo '<script src="app.js"></script>';
    }

  ?>
  <script>
  // set random cookie to test if it's being cleared
    const test = [Math.floor(Math.random()*10000000000000),'=',Math.floor(Math.random()*10000)].join('')
    document.cookie = test;
  </script>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  <style>
    body {
      font-family: monospace;
      font-size: 14px;
      text-transform: uppercase;
    }

    .ip {
      /* position: absolute;
      top: 0;
      left: 0; */
      font-size: .7rem;
      background: white;
      padding: 15px;
      z-index: 99999999;
      /* opacity: .8; */
    }
  </style>
  <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
</head>
<body>
  <div class="ip">
    <?php

      echo '<h1>🎲 ' . $dice . '</h1>';
      echo '<h1>Proxy Info</h1>';
      echo 'HTTP REMOTE ADDR: '.$_SERVER['REMOTE_ADDR'];
      echo '<br>HTTP CLIENT IP: '.$_SERVER['HTTP_CLIENT_IP'];
      echo '<br>HTTP X FORWARDED FOR: '.$_SERVER['HTTP_X_FORWARDED_FOR'];

      echo '<h1>Headers</h1>';
      foreach (getallheaders() as $name => $value) {
          echo "$name: $value<br/>";
      }

     ?>
   </div>
   <div>
     <?php

       if($dice>$byPassChance){
        //  require 'yeezy.php';
         echo '<div class="g-recaptcha" data-sitekey="6Ldn1jYUAAAAAE9ZpY5mF_4X2IpijdrxKK8U1wKt"></div>';
       }
     ?>
     <!-- <form action="?" method="POST">

       <br/>
       <input type="submit" value="Submit">
     </form> -->
   </div>
</body>
</html>
