# app-tutorial

Hello, world!

This project is a tutorial to develop app-server of Channel Corp. App Store.

Thank you for visiting. 😁

| Index                         |                                                       |
| ----------------------------- | ----------------------------------------------------- |
| [Prerequisite](#prerequisite) | -                                                     |
| [Build](#build)               |                                                       |
| [APIs](#apis)                 | # [functions](#functions)                             |
|                               | # [wam(static)](#wam)                                 |

## Prerequisite

- [typescript](https://www.typescriptlang.org)
- [yarn](https://yarnpkg.com/) v4; Check [here](wam) for wam.

## Build

```sh
# app-tutorial-ts/wam
$ npm run build # it builds wam
```


## Run

### Configuration

Before running the program, make sure to check the [configuration](server/app-config.json) file.

You must prepare the metadata of the app by registering one to Channel App Store.

```json
{
    "appId": "your app id",
    "appSecret": "your app secret",
    "signingKey": "your signing key",
    "appstoreURL": "https://app-store-api.exp.channel.io/general/v1/native/functions",
    "port": 3000
}
```

### Run the program

```sh
# app-tutorial-ts/server
$ npm start
```

## APIs

### functions

| METHOD | PATH         |
| ------ | ------------ |
| PUT    | `/functions` |

This api is to request general functions defined in the project.

You must register it as a functionUrl of the app.

Note that `context` in the function request is automatically full by the Channel App Store.

#### Request

1. tutorial (to prepare wam arguments before opening the wam)

```json
{
    "method": "tutorial",
    "context": {
        "channel": {
            "id": "channel id which calls the wam"
        }
    }
}
```

2. sendAsBot

`sendAsBot` is a function to write message as a bot.

You can set the name of the bot with [configuration](config) files.

```json
{
    "method": "sendAsBot",
    "params": {
        "input": {
            "groupId": "group id to write a message"
        }
    },
    "context": {
        "channel": {
            "id": "channel id which calls the wam"
        }
    }
}
```

#### Response

_**Success**_

```
200 OK
```

1. tutorial

```json
{
    "result": {
        "type": "wam",
        "attributes": {
            "appId": "app id",
            "name": "tutorial",
            "wamArgs": {
                "managerId": "4761",
                "message": "This is a test message sent by a manager."
            }
        }
    }
}
```

2. sendAsBot

```json
{
  "result": {
        "type": "string",
        "attributes": {}
  }
}
```

_**Failure**_

```
200 OK
```

```json
{
    "error": {
        "type": "",
        "message": "the reason of the failure"
    }
}
```

Note that both the success and the failure return `200 OK` for each request.

### wam

| METHOD | PATH                     |
| ------ | ------------------------ |
| -      | `/resource/wam/tutorial` |

This endpoint serves a static page of the wam.

You must register it(`/resource/wam`) as a wamUrl of the app.

#### Response

```
The wam written in HTML.
```