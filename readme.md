# talkso-cli

CLI to create **talkso** presentations from markdown files.

[Read more about talkso](https://github.com/iamso/talkso).

## Install

```bash
npm i -g talkso-cli
```

## Requirements

Your system must meet the following requirements:

- Node >= 7.6.0
- ImageMagick CLI

## Usage

Create a markdown file, see the [example](example.md) for help.

### Watch

Run the following command from the markdown files directory:

```bash
talkso -w
# or
talkso --watch
```

The watch command copys the necessary css- and js-files to the directory and creates the html file(s);

### Build

Run the following command from the markdown files directory:

```bash
talkso
```

The build command copys the necessary css- and js-files to the directory and creates the html file(s);

## License

Copyright (c) 2017 Steve Ottoz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
