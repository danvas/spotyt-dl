FROM tiangolo/uvicorn-gunicorn:python3.10

ARG spotify_client_id

ARG spotify_redirect_uri

# TODO: HTML / endpoint for users to set this
ENV GOOG_COOKIE=WVNDPTBlMjRULUNyQ19zOyBWSVNJVE9SX0lORk8xX0xJVkU9a0REYXFFZ19YOG87IHdpZGU9MTsgREVWSUNFX0lORk89Q2h4T2VrVTBUbnBaZWs1cVVUSk5lbEY0VFZSQk0wOVVaekJOWnowOUVNaTYvcDBHR01pNi9wMEc7IFBSRUY9dHo9QW1lcmljYS5WYW5jb3V2ZXImZjQ9NDAwMDAwMDsgSFNJRD1BejdrbFdBNVpxREhudGtsczsgU1NJRD1BQ0dqZjhSZEZJMkF2dUszWDsgQVBJU0lEPWd5TkhMMDNyVVN1T255U1EvQUw4QjNPcC1BVE1ZcFVPYmQ7IFNBUElTSUQ9UUNiaG16VmtXVEVocGlXNS9BMEgtQ25IRUFTaXlwUk5MajsgX19TZWN1cmUtMVBBUElTSUQ9UUNiaG16VmtXVEVocGlXNS9BMEgtQ25IRUFTaXlwUk5MajsgX19TZWN1cmUtM1BBUElTSUQ9UUNiaG16VmtXVEVocGlXNS9BMEgtQ25IRUFTaXlwUk5MajsgX2djbF9hdT0xLjEuNzg4MjY1MTkzLjE2NzQyNjM0NTI7IFNJRD1Ud2hBcVd0YXNPc1FoN09pZE1hU255ZERpRHNOY3FOMWlSSkI0TnBnR0RxeW1YLWNWdktMcE43NUFXUm9BdFJrU0diS3p3LjsgX19TZWN1cmUtMVBTSUQ9VHdoQXFXdGFzT3NRaDdPaWRNYVNueWREaURzTmNxTjFpUkpCNE5wZ0dEcXltWC1jSXVzSTFmYmxHNHcxenVkb2ZuU2JjQS47IF9fU2VjdXJlLTNQU0lEPVR3aEFxV3Rhc09zUWg3T2lkTWFTbnlkRGlEc05jcU4xaVJKQjROcGdHRHF5bVgtY3pqSl9VUXNQTl9aejJEUVppc1RQcXcuOyBMT0dJTl9JTkZPPUFGbW1GMnN3UkFJZ0JhM3k3VmpyVW8tcVBFRk5tNjdEUkZZdmxOUkhxc1FPdGJVSmhWaXhyQ1lDSUdON05SRlZjS0NuWFZzdGo1VXhibVlxNnhWbDF1RGZzRGdpZFFuVkFPLS06UVVRM01qTm1kM1ZvY1hCMGFHODFiMGRXZWxadE9UVkdiM05mYlY5a1FrOUJabXhIZDFwSmNXUXlTeTE0ZDI1R1F6RTJkSFZvVVRWSGRGUTBXa3BFYjJOalRUaFlaRVpMVWxNMk1GcDBhbGh2ZERWTlEzWnFNRWRIWkdwMVMySlZlWFJoWkRnelpHbEpNSGRUZUVKeVIwaGhjMWxmUm5kQk9FbzJlbFYwYTBSVWNsQXhMV2gzTlRjd2MwWjBVV000VTFWTlpWZzNRbVJyZVcxMU1XTnFNbkIzOyBTSURDQz1BRnZJQm4tREFWSE5lMjhvd3JzTkRvY21KbHo0OUdkMVdLZWh6QXU1Y05teFB5SVc1eWU2WkZKUXhxYi1YZEVzOWI2b0FlYU9wUTsgX19TZWN1cmUtMVBTSURDQz1BRnZJQm4tTzllLUFzb2hocVJUTXd2d28zTHRqc1lva3JCTVlwdGthNjA5NnliZmlQX1JqZG5xQm9uSFI3MUF0X1ZydlhGaGtUUTsgX19TZWN1cmUtM1BTSURDQz1BRnZJQm4tRE1KZ3JVcG80UkptQUdCM1VPVU9CUlhRRlpZVTZRNW94ZEpyNXNBVlZ4bUlzeWtJZFo1U29xU0MyUTI5ZE43ZGw3RnlFCg==

ENV SPOTIFY_CLIENT_ID=$spotify_client_id

ENV SPOTIFY_REDIRECT_URI=$spotify_redirect_uri

ENV PORT=$port

ENV MODE=production

ENV ACCESS_LOG=${ACCESS_LOG:-/proc/1/fd/1}

ENV ERROR_LOG=${ERROR_LOG:-/proc/1/fd/2}

RUN python --version

RUN which python

WORKDIR /app-root

COPY ./ /app-root

# Generate youtube auth headers json file for youtube-dl
RUN chmod +x scripts/generateAuthHeadersJson.sh
RUN scripts/generateAuthHeadersJson.sh $GOOG_COOKIE
RUN ls -al headers_auth.json

RUN pip install --root-user-action=ignore --upgrade pip

RUN pip --version

RUN pip install --root-user-action=ignore --no-cache-dir -e .

RUN which gunicorn

RUN ls -la /app-root

# Patch this issue in build: https://github.com/yt-dlp/yt-dlp/issues/6247#issuecomment-1433096554
RUN echo "######## Patching youtube_dl ########"
RUN echo "Replacing regex in /usr/local/lib/python3.10/site-packages/youtube_dl/extractor/youtube.py..."
RUN sed -i 's/channel|user)\//channel\/|user\/|(?=@))/g' /usr/local/lib/python3.10/site-packages/youtube_dl/extractor/youtube.py
RUN sed -i 's/) if owner_profile_url else None/, default=None)/g' /usr/local/lib/python3.10/site-packages/youtube_dl/extractor/youtube.py
RUN grep "'uploader_id': self._search" /usr/local/lib/python3.10/site-packages/youtube_dl/extractor/youtube.py
RUN echo "######## patching DONE ##############"

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 --worker-class uvicorn.workers.UvicornWorker spotyt.main:app