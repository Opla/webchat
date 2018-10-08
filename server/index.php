<!--
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
-->
<?php
include './config.php';
include './template.php';

function fetch($url, $data = null)
{
    $parts = parse_url($url);
    // check https
    $scheme = "tcp";
    $port = $parts['port'];
    $host = $parts['host'];

    if ($parts['scheme'] === "https") {
        $scheme = "tls";
        if (!$port) {
	        $port = 443;
	    }
    } else {
        if (!$port) {
	        $port = 80;
	    }	    
    }
    $fp = stream_socket_client($scheme.'://'.$host.':'.$port, $errno, $errstr, 30);
    if (!$fp) {
        error_log('fetch error : '.$errstr.' : '.$errno);
        return array(
          'status' => 'error', 
          'error' => "$errstr ($errno)"
        );
    }
    if ($data) {
        $body = json_encode($data);
        $len = strlen($body);
        $method = 'POST';
    } else {
        $method = 'GET';
        $len = 0;
    }
    $query = isset($parts['query']) ? $parts['query'] : '';
    $out = $method." ".$parts['path']."?".$query." HTTP/1.1\r\n";
    $out.= "Host: ".$parts['host']."\r\n";
    $out.= "Content-Type: application/json\r\n";
    $out.= "Content-Length: ".$len."\r\n";
    $out.= "client_id: ".CLIENT_ID."\r\n";
    $out.= "client_secret: ".CLIENT_SECRET."\r\n";
    $out.= "Connection: Close\r\n\r\n";
    if ($data) {
        //error_log($body);
        $out.= $body;
    }
    fwrite($fp, $out);
    $result = ''; 
    while(!feof($fp)) {
        // receive the results of the request
        // TODO chuncked body
        $result .= fgets($fp, 128);
    }
    fclose($fp);
    $result = explode("\r\n\r\n", $result, 2);
 
    $header = isset($result[0]) ? $result[0] : '';
    $content = isset($result[1]) ? $result[1] : '';
    return array(
      'status' => 'ok',
      'header' => $header,
      'body' => $content
    );
}

function init()
{
    if (isset($_GET["b"])) {
        $name = $_GET["b"];
    } else {
        $name = "xxx"; // TODO handle error
    }
    if (isset($_GET["d"])) {
        $display = $_GET["d"];
    } else {
        $display = "";
    }

    if (DIRECT_TOKEN === true) {
        echo '<script>opla = { 
            config: { 
              token: "'.$name.'",
              url: "'.API_URL.'",
              baseUrl: "'.BASE_URL.'",
              language: "fr" 
            }};
            (function(o,p,l,a,i){a=p.createElement(l),i=p.getElementsByTagName(l)[0];a.async=1;a.src=o;i.parentNode.insertBefore(a,i)})(opla.config.baseUrl+"/js/app.js",document,"script");
            </script>';
        return;
    }
    $url = API_URL."/params/".$name."/botParams";
    $response = fetch($url);
    $params = json_decode($response['body'], true);
    $app = $params['application'];
    $policies = $app['policies'];
    // TODO get App
    // TODO call getBot
    $parts = parse_url($url);
    $secure = "false";
    if (SECURE_SERVER) {
        $secure = "true";
    }

    echo '<script>opla = { 
        config: { 
            botId: "'.$params['botId'].'", 
            appId: "'.$app['id'].'", 
            appSecret: "'.$app['secret'].'", 
            host: "'.$parts['host'].'", port: "'.$parts['port'].'",
            anonymous_secret: "'.$policies['anonymous_secret'].'",
            secure: '.$secure.',
            display: "'.$display.'",
        }};
        (function(o,p,l,a,i){a=p.createElement(l),i=p.getElementsByTagName(l)[0];a.async=1;a.src=o;i.parentNode.insertBefore(a,i)})("/js/app.js",document,"script");
        </script>';
}

function getTitle()
{
  // TODO set title
  echo 'Opla.ai';
}

function configureBot()
{
  // WIP set configuration
  init();
}



