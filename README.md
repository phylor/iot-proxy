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

The IoT proxy can listen on HTTP or HTTPS (or both simultaneously). In the case of HTTPS, it is strengthened with SSL client certificates.

    {
      "listen": {
        "http": { "enabled": true },
        "https": { "enabled": false }
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

Services are defined in `conf/services.json` as a JSON array. Each service consists of an `endpoint` defining how to access the IoT source on the proxy, and a `source` defining the source itself.

Example of a service:

    {
      "endpoint": {
        "url": "/weather"
      },
      "source": {
        "url": "http://weather.com/NewYork.json",
      }
    }

Remember to put all services in an array (`[ ... ]`) in `conf/services.json`.

#### Options for IoT Sources

- `disable_cache`, `true` or `false` (default `false`). If set to `true` the current time is added to the source URL so that requests are not cached.
- `method`, `GET` or `POST`. The HTTP method to use when calling the source. Note that this overwrites the proxied HTTP method. The IoT proxy is proxying the HTTP method, i.e. if you call the proxy using `POST`, the source will be called using `POST`. However, if this option is set, the specified method is used in any case.
- `authentication`, object named either `basic` or `digest` having attributes `username` and `password`. Either basic or digest authentication is supported. See example below.

    [
      {
        "endpoint": {
          "url": "/weather"
        },
        "source": {
          "url": "http://weather.com/NewYork.json",
        }
      },
      {
        "endpoint": {
          "url": "/webcam"
        },
        "source": {
          "url": "https://iot1.example.com/image.jpg",
          "disable_cache": true
        }
      },
      {
        "endpoint": {
          "url": "/digest_auth_request"
        },
        "source": {
          "url": "http://localhost:4000/testapis/auth/digest",
          "authentication": {
            "digest": {
              "username": "testuser",
              "password": "testpassword"
            }
          }
        }
      }
    ]

## Running it

    npm install
    node index.js

### Run it in a Docker container

Checkout the repository and run the following to build the docker image:

    docker build -t iot-proxy .

You have to mount the `conf` directory to the docker container. Make sure to place a `server.json` and a `services.json` inside it.

    docker run --rm --name iot-proxy -v /home/micky/iot-proxy/conf:/opt/iot-proxy/conf -p 2000:8000 iot-proxy

## Development

The HTTP server is implemented using `node.js`.

Required setup:

    npm install -g mocha

Run tests:

    mocha
