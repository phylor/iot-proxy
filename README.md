# IoT-Proxy

This is an Internet of Things (IoT) proxy. It's purpose is to collect multiple HTTP sources at one place. It supports HTTP/HTTPS and authentication mechanisms.

The proxy lets you reach all IoT sources at one central domain and endpoint. It solves CORS and mixed HTTP/HTTPS problems when trying to access different IoT sources from a single application (e.g. from a dashboard).

## Example

Assume you have three IoT sources:

- Camera image accessible at http://192.168.0.13/image.jpeg
- Temperature sensor accessible at http://192.168.0.7/temperature.json
- Weather information accessible at http://api.openweathermap.org/data/2.5/weather?q=London,uk

With the IoT proxy you could map those sources to the following arbitrary URLs:

- /camera
- /temperature
- /weather

Calling a mapped URL has the same effect as calling the source URL above. Basic or digest authentication of the sources can be configured in the proxy. They are not proxied, i.e. the proxy can be secured with a single authentication scheme, even if the sources use different authentication schemes or no authentication at all.

## Features

- Choose URL endpoints for every connected IoT source
- Supports HTTP sources without authentication, or with basic/digest authentication
- Secure the proxy with authentication based on client certificates

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

## Development

The HTTP server is implemented using `node.js`.

Required setup:

    npm install -g mocha

Run tests:

  mocha
