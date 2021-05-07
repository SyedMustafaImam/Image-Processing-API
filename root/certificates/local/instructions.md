### Generating the key

* Run this command from command-line:


```shell script
openssl req -x509 -days 730 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```

For windows environments you may need to escape the first `/` character, as demonstrated below:

```shell script
openssl req -x509 -days 730 -newkey rsa:2048 -nodes -sha256 -subj '//CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```

Take both files (cert and key) and put them on root/certificates/local folder

### Chrome insecure warning

On some systems, Chromium browsers may throw an exception and not let you go further with this self-signed certificate.

You can enable this by pasting the following command on your browser URL bar:

```html
chrome://flags/#allow-insecure-localhost
```