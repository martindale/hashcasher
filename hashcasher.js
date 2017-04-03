if (window.addEventListener) {
  window.addEventListener('load', loader, true);
} else {
  window.attachEvent('load', loader);
}

function loader (e) {
  var targets = document.querySelectorAll('form[require=hashcash]');
  console.log('[HASHCASH]', 'found', targets.length, 'targets:', targets);
  
  for (var i = 0; i < targets.length; i++) {
    var element = targets[i];
    if (element.addEventListener) {
      element.addEventListener('submit', privateEventHandler, true);
    } else {
      element.attachEvent('onsubmit', privateEventHandler);
    }
  }
}

function privateEventHandler(e) {
  e.preventDefault();
  var element = this;
  var errors = element.querySelector('.errors');
  
  var worker = new Worker('worker.js');
  worker.onmessage = function hashcashWorkerHandler (e) {
    var cash = e.data.cash;
    var bits = e.data.bits;
    var input = e.data.input;
    var data = e.data.data;
    var xhr = new XMLHttpRequest();

    xhr.open('POST', element.target, true);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-Hashcash', cash);
    xhr.setRequestHeader('X-Hashcash-Bits', bits);
    xhr.setRequestHeader('X-Hashcash-Input', input);
    xhr.onreadystatechange = function hashcashStateChange () {
      if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        // Request finished. Do processing here.
        try {
          var response = JSON.parse(xhr.responseText);
        } catch (e) {
          var response = xhr.responseText;
        }
        
        while (errors.hasChildNodes()) {
          errors.removeChild(errors.children[0]);
        }

        if (response && response.status) {
          if (response.status === 'error') {
            response.errors.forEach(function(message) {
              var error = document.createElement('li');
              error.innerText = message;
              errors.appendChild(error);
            });
          }
          
          if (response.status === 'success') {
            window.location = '/';
          }
        }
      }
    }

    xhr.send(data);

  }

  var fields = {};
  var data = this.querySelectorAll('input, textarea, select');

  for (var i = 0; i < data.length - 1; i++) {
    if (~([
      'text',
      'email',
      'hidden',
      'password'
    ].indexOf(data[i].type))) {
      fields[data[i].name.toString()] = data[i].value.trim();
    }
  }

  // TODO: store difficulty from response headers, maintain memory
  var difficulty = 2;
  var fieldsEncoded =  Object.keys(fields).map(function(key) {
    return key + '=' + fields[key];
  }).join('&');

  worker.postMessage([ fieldsEncoded , difficulty ]);

  return false;
}
