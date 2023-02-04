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
; node interpret.js path/to/video.mp4 path/to/output.json
```

That will process videos.

To run a basic server:

```shell
cd docs
./serve.sh
```

## Try your own video

Put your video at `docs/data/snippet.mp4`. Then run:

```
; npm install
; node interpret.js docs/data/snippet.mp4 docs/data/snippet.json
```

Then fire up the server as above and see how it works.

Note that this is only tuned into RSpec test runs at the moment.

You're likely to encounter some problems. The video I've used uses the font IBM
Plex Mono which is quite friendly for OCR. If you use the default Mac VS Code
font (Menlo) you will probably encounter some problems. I have made some good
progress training a version of the Tesseract OCR program to handle Menlo, and
I'm happy to share that work later on. [This video is a good starting
point.](https://www.youtube.com/watch?v=KE4xEzFGSU8)
