FROM python:3.10.9-alpine3.17

ARG spotify_client_id

ARG spotify_client_secret

ARG spotify_redirect_uri

ENV VIRTUAL_ENV=/opt/.venv

ENV SPOTIPY_CLIENT_ID=$spotify_client_id

ENV SPOTIPY_CLIENT_SECRET=$spotify_client_secret

ENV SPOTIPY_REDIRECT_URI=$spotify_redirect_uri

ENV MODE=production

RUN python -m venv $VIRTUAL_ENV

ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN env

RUN python --version

RUN which python

WORKDIR /app-root

COPY ./ /app-root

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -e .

RUN ls -la /app-root

CMD ["python", "-m", "spotyt.main"]