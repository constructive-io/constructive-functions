FROM alpine:3.19

RUN apk add --no-cache bash

WORKDIR /app

COPY functions/simple-bash/src/index.sh .
RUN chmod +x index.sh

ENTRYPOINT ["./index.sh"]
