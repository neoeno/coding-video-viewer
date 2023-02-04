# Coding video viewer

Sometimes you have a video of someone coding and you'd like to watch it with
a bit more structure. Perhaps they're test-driving and you'd like to know when
the red and green steps are. Or some other things.

This is an experimental project where I try to see what can be extracted from
such videos. The long-term dream would be to totally reconstruct the codebase
from a video. Theoretically it's possible, however it may be a fair chunk of
work.

## Getting running

Clone. Then:

```shell
; npm install
; node go.js path/to/video.mp4 path/to/output.json
```

That will process videos.

To run a basic server:

```shell
cd docs
./serve.sh
```

You can then fiddle with the code in `docs/` to wire up the video and output.
