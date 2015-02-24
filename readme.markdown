# Amok(1)

## Synopsis
```
  amok [options] <script>
```

## Description
Amok is a command line tool for rapid prototyping and development of applications
written in JavaScript targeting the browser, code without having to reload the client.

```
  export BROWSER="google-chrome --remote-debugging-port=9222"
  export BUNDLER="watchify"
  
  amok myapp.js
```

## Options
```
  -h, --host
    Specify the http hostname
    
  -p, --port
    Specify the http port


    Any extra arguments will be passed along with the invocation to BUNDLER,
```

## Environment Variables
```
  BROWSER
    When set to a executable, will be opened after the server has been spun up.
    
  BUNDLER
    When set to an executable, will be used to bundle scripts.
```
