// const cookieTimer = Math.floor(Math.random() * 10000);
// const dice = Math.floor(Math.random() * 100);
// const bypassChance = 50;
//
// console.log(`You rolled a ${dice}`);

function setCookie() {
  document.cookie =
    'gceeqs=exp=1485210572~acl=%2f*~hmac=98a845d461218eb8e1f863140caad25e34e3d2ee5a68eb8d9f5eb7f29ac3e049';
  console.log('set hmac cookie');
}

function listCookies() {
  console.log('cookies: ');
  var theCookies = document.cookie.split(';');
  var aString = '';
  for (var i = 1; i <= theCookies.length; i++) {
    aString += i + ' ' + theCookies[i - 1] + '\n';
  }

  console.log(aString);
}

setCookie();
listCookies();

// setTimeout(setCookie, 10000);
