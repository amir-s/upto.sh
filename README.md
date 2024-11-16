# upto.sh

This repo is the server application for super simple file sharing through http via CLI. This is currently running on [upto.sh](https://upto.sh).

## Usage

Upload file from your CLI and get a QR code + a url

```bash
$ curl --upload-file ./hello.txt upto.sh

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ████▄▀▄██ ▄▄▄▄▄ █
█ █   █ ██  ▄▀  █▄█ █   █ █
█ █▄▄▄█ █ ▄▀██▀████ █▄▄▄█ █
█▄▄▄▄▄▄▄█ █▄▀ █▄▀▄█▄▄▄▄▄▄▄█
█  ▄█▀ ▄█  ▄▀▄█  █   ▄▀█  █
█▀▀▄ ▄ ▄▄▄▀█ ▀█▀ ▀█▄▄▄ ▄█▄█
█▄▀█▄  ▄▄█ █▀ ▄▀▀▄█ ▀███▀ █
█▄▄▀▀▀ ▄▀▀█▀▄ █▀▄▄▀▀▀▄▄▄█▄█
█▄▄█▄█▄▄█▀▀▀▀ ▀▄█ ▄▄▄ █▀▄▀█
█ ▄▄▄▄▄ █▀▄▄▄ █▀▀ █▄█ ▄█▀ █
█ █   █ ██▄▄▀ ▀█  ▄▄   ▀▀██
█ █▄▄▄█ █  ▄▄▀▄▄   ▀▀ ██▄▄█
█▄▄▄▄▄▄▄█▄█▄▄▄███▄▄███▄██▄█


http://upto.sh/2bTz7W/hello.txt
```

Files can also be expired after a certain amount of time. The default is 10 minutes. For example, to expire a file after 10 days:

```bash
$ curl --upload-file ./hello.txt upto.sh/10d
```

The format for the expiration time is explained [here](https://www.npmjs.com/package/parse-duration).

## Installation

You can build the image and run it locally.
You'll need a S3 compatible storage to store the files, and a directory to store the sqlite database.

```bash
$ docker build -t upto .

$ docker run -p 3000:3000 \                          # Map port 3000 of the host to port 3000 of the container
  -e PORT=3000 \                                     # Set the PORT to 3000, default is 3000
  -e S3_ENDPOINT="https://gateway.storjshare.io" \   # The S3 endpoint
  -e S3_REGION="us1" \                               # The S3 region
  -e S3_ACCESS_KEY_ID="abcd" \                       # The S3 access key ID
  -e S3_SECRET_ACCESS_KEY="efgh" \                   # The S3 secret access key
  -e DATABASE_URL="/data/db.db" \                    # The path to the SQLite database
  -e FORCE_HTTPS="true" \                            # Force HTTPS (purely for the UI)
  -v $(pwd)/data:/data \                             # Mount data directory for the SQLite database
  upto                                               # The Docker image to run
```

Environment variables can also be loaded from a `.env` file automatically.

## Development

Create a `.env` file and use Deno to run the server locally.

```bash
$ cat > .env
PORT="3000"
S3_ENDPOINT="https://gateway.storjshare.io"
S3_REGION="us1"
S3_ACCESS_KEY_ID="abcd"
S3_SECRET="efgh"
DATABASE_URL="./data/db.db"
```

```bash
$ deno task dev
```

## License

MIT
