FROM tiangolo/uvicorn-gunicorn:python3.10

ARG spotify_client_id

ARG spotify_client_secret

ARG spotify_redirect_uri

ENV SPOTIPY_CLIENT_ID=$spotify_client_id

ENV SPOTIPY_CLIENT_SECRET=$spotify_client_secret

ENV SPOTIPY_REDIRECT_URI=$spotify_redirect_uri

ENV MODE=production

ENV ACCESS_LOG=${ACCESS_LOG:-/proc/1/fd/1}

ENV ERROR_LOG=${ERROR_LOG:-/proc/1/fd/2}

RUN env

RUN python --version

RUN which python

WORKDIR /app-root

COPY ./ /app-root

RUN pip install --upgrade pip

RUN pip --version

RUN pip install --no-cache-dir -e .

RUN which gunicorn

RUN ls -la /app-root

ENTRYPOINT /usr/local/bin/gunicorn -b 0.0.0.0:80 -w 4 -k uvicorn.workers.UvicornWorker spotyt.main:app --chdir .