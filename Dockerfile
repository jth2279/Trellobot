FROM node:boron

# Create app directory
RUN mkdir -p /usr/trellobot

EXPOSE 8080
EXPOSE 80


# Install masterbot
COPY Trellobot /usr/trellobot/Trellobot

WORKDIR /usr/trellobot/Trellobot

CMD ["node", "main"]
