# IoT-Proxy

This is an internet of things proxy. It's purpose is to collect multiple HTTP sources at one place. It supports HTTP/HTTPS and authentication mechanisms.

The proxy allows you to have all your IoT sources reachable at one central domain. It also solves CORS problems and mixed HTTP/HTTPS problems.

## Features

- Proxy HTTP requests
- Proxy HTTPS requests
- Proxying supports SSL client certificates, basic and digest authentication
- Rewrite relative HTML/CSS/JS URLs to absolute URLs

## Configuration

Basic server settings can be configured in `server.json`. Configuration of the different IOT-sources is done in the JSON configuration file called `services.json`.

### Basic Server Setup

    {
      "listen": {
        "http": true,
        "https": true,
      },
      "authentication": {
        "ssl": {
        },
        "basic": {},
        "digest": {}
      }
    }

### Service Setup

    [
      {
        "endpoint": "/weather",
        "source": {
          "url": "http://weather.com/NewYork.json",
          "method": "POST",
          "data": {
            "longitude": 10.3,
            "latitude": 4.3
          }
        }
      },
      {
        "endpoint": "/webcam",
        "source": {
          "url": "https://iot1.example.com/image.jpg",
          "method": "GET"
        }
        "ssl": {
          "client_certificate": "certs/webcam.cer",
          "client_key": "certs/webcam.key",
          "ca_certificate": "certs/ca.cer"
        }
      }
    ]

## Running it

    npm install
    node index.js

## Supported Authentication Mechanisms

- SSL client certificates
- Basic authentication
- Digest authentication

## Implementation Details

The HTTP server is implemented using `node.js`.
