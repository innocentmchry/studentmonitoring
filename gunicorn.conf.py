import os
import multiprocessing

if 'WEBSITE_HOSTNAME' in os.environ:
    bind = "0.0.0.0"
    workers = min(2 * multiprocessing.cpu_count() + 1, 12)
    timeout = 600
else:
    print("local development server")
    # bind = "172.16.37.91:8000"
    # bind = "172.16.22.222:8000"
    bind = "127.0.0.1:8000"
    workers = 8
    certfile = './ssl/cert.pem'
    keyfile = './ssl/key.pem'