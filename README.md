# Minbase

Minbase is an unopinionated minimal base on which to build opinionated [Secure Scuttlebutt](http://scuttlebot.io) clients. 

Minbase is a fork of [Patchbay@6.1.3](https://github.com/ssbc/patchbay/commit/e3a918ef0b3864578f624ca14e12fe1cf0079b3a), which was originally written by Dominic Tarr. In the beginning I wanted to find out just how minimal Patchbay could be, with the idea that 'minbay' would get merged into Master as a depject configuration, however that never happened so now it's a fork as Patchbay@7 and Minbase are now barely resemble each other. Minbase shares a lot of the original Patchbay@6 code, with minimal modifications. 

## Minbase clients

+ [Minbay](http://gitmx.com/%25UTn%2FAoIVVF%2F4yKI7PKIWrHeWb1q7sTMCWVyYY1XTiCk%3D.sha256)
+ [Micropub](http://gitmx.com/%25LwAM2X9dd%2Fy%2FilB%2FYQ93X3zu8Ket1BDEqmZf0EaVrv0%3D.sha256)

## Installation

Clone minbase off Github or git-ssb

This works best with [yarn](http://yarnpkg.com), until Flume hits master.

``` 
git clone ssb://%+tyUthD1L689osLUj8LNLV4smRKpO7Wu07DB+LMd7TQ=.sha256 minbase # git clone git@github.com:evbogue/minbase.git
cd minbase
yarn 
yarn start
```

You'll see a lite client invite, click that and it'll connect in your browser. Move your key into the client if you want to use your identity from `.ssb/secret` by clicking on the 'lock' icon in the minbase lite client.

![minbase.png](minbase.png)

## License

MIT





