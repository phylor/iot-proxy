# IoT-Proxy

This is an internet of things proxy. It's purpose is to collect multiple HTTP sources at one place. It supports HTTP/HTTPS and authentication mechanisms.

The proxy allows you to have all your IoT sources reachable at one central domain. It also solves CORS problems and mixed HTTP/HTTPS problems.

## Features

- Proxy HTTP requests

## Configuration

Basic server settings can be configured in `conf/server.json`. Configuration of the different IoT-sources is done in the JSON configuration file called `conf/services.json`.

### Basic Server Setup

Currently only either HTTP or HTTPS is supported (not simultaneously). The server can be strengthened with SSL client certificates.

    {
      "listen": {
        "http": true,
        "https": false,
      },
      "authentication": {
        "ssl": {
          "server_key": "certs/server.key",
          "server_certificate": "certs/server.cer",
          "ca_certificate": "certs/ca.cer"
        }
      }
    }

### Service Setup

If `disable_cache` is set to `true`, the current time is added to the URL so that the requests are not cached.

    [
      {
        "endpoint": {
          "url": "/weather",
          "disable_cache": false
        },
        "source": {
          "url": "http://weather.com/NewYork.json",
        }
      },
      {
        "endpoint": {
          "url": "/webcam",
          "disable_cache": true
        },
        "source": {
          "url": "https://iot1.example.com/image.jpg"
        }
      }
    ]

## Running it

    npm install
    node index.js

## Implementation Details

The HTTP server is implemented using `node.js`.
