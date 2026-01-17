FROM ubuntu:latest
LABEL authors="rochm"

ENTRYPOINT ["top", "-b"]