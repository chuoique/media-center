# media-center

[WIP] Media center web app for raspberry pi with seamless [trakt.tv](http://trakt.tv/) scrobbling

## Install

```
$ npm install -g media-center
```

## Usage

```
$ cp example.ecosystem.json ecosystem.json # replace /home/user/media to yours
$ pm2 start ecosystem.json
```

## Development

### Setup raspberry

By [instruction](docs/raspberry-setup.md)

### Setup deploy to raspberry script

```
$ cp example.deploy.sh deploy.sh # replace user@ip to yours
$ chmod +x deploy.sh
```

## License

MIT © [ewnd9](http://ewnd9.com)
