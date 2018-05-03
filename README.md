# VAMSO ERP



Errors and solutions
--------------------
if getting error like jpeg is required during the installation of pillow:

    $ sudo apt-get install libtiff5-dev libjpeg8-dev zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev tcl8.5-dev tk8.5-dev python-tk python-dev libffi-dev

if getting error like git repositories directory not found means that www-data user which is for the apache is not able to access the `/home/git/repositories/`. You can give permission like this:

    $root@vps:/home/git/libreERP-main# sudo find /home/git/repositories/ -type f -exec chmod 777 {} \;
    $root@vps:/home/git/libreERP-main# sudo find /home/git/repositories/ -type d -exec chmod 777 {} \;


Setup mySQL DB
------------------

    $ mysql -uadmin -p`cat /etc/psa/.psa.shadow`


    mysql>CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
    mysql>GRANT ALL PRIVILEGES ON * . * TO 'newuser'@'localhost';
    mysql>FLUSH PRIVILEGES;


    $ apt-get install libmysqlclient-dev
    $ pip install MySQL-python


  dont forget to apply all the migrations files after this.


Schedular commands
--------------------
python manage.py celerybeat --verbosity=2 --loglevel=DEBUG
celery worker -A vamso -l DEBUG

and start the django server as usual
