#!/bin/bash
cd /var/www/html/cantelope.org/discord_audiobot/
php oneprocess.php
screen -d -m sudo -u cantelope node index.js

