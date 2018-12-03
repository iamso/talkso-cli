# talkso-cli

CLI to process **talkso** HTML presentations.

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

### Example

Create an example HTML file, showing all the possible options:

```bash
talkso -e
# or
talkso --example
# or
talkso example
```

### Serve

Run the following command to start the server:

```bash
talkso -s
# or
talkso --serve
# or
talkso serve
```

The serve command starts an express server. The port can be specified with the following commands:

```bash
PORT=7000 talkso -s
# or
talkso -s -p 7000
# or
talkso -s --port 7000
```

If no port is specified, the default port 8000 is used.

### Build

Run the following command from the HTML files directory:

```bash
talkso
```

The build command copys the necessary css- and js-files to the directory and creates a PDF with screenshots for each HTML file.

#### Create a Zip

Run the following command to create a Zip file during the build:

```bash
talkso -z
# or
talkso --zip
# or
talkso zip
```

#### Create a deployable directory

Run the following command to create a deployable directory during the build:

```bash
talkso -d
# or
talkso --deploy
# or
talkso deploy
```

### Other Commands

#### Update

Run the following command to update the css- and js-files from the repo:

```bash
talkso -u
# or
talkso --update
# or
talkso update
```

#### Version

Run the following command to check the version of the CLI:

```bash
talkso -v
# or
talkso --version
# or
talkso version
```

#### Help

Run the following command to see the help:

```bash
talkso -h
# or
talkso --help
# or
talkso help
```


## License

Copyright (c) 2018 Steve Ottoz

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
