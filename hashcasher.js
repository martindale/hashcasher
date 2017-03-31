if (window.addEventListener) {
  window.addEventListener('load', loader.bind(window), true);
} else {
  window.attachEvent('load', loader.bind(window));
}

function loader (e) {
  var targets = document.querySelectorAll('form[require=hashcash]');
  console.log('[HASHCASH]', 'found', targets.length, 'targets:', targets);
  
  for (var i = 0; i < targets.length; i++) {
    var element = targets[i];
    var target = element.target;
    
    function privateEventHandler(e) {
      e.preventDefault();
      console.log('hello submit handler');

      var worker = new Worker('worker.js');
      worker.onmessage = function hashcashWorkerHandler (e) {
        console.log('work result:', e.data);
        var cash = e.data;
        var xhr = new XMLHttpRequest();
        
        xhr.open('POST', target, true);

        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Hashcash', cash);
        xhr.onreadystatechange = function hashcashStateChange () {
          if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            // Request finished. Do processing here.
          }
        }

        xhr.send(dataCollectEncoded);

      }
      
      var dataCollect = [];
      var data = element.querySelectorAll('input');
      for (var i = 0; i < data.length - 1; i++) {
        if (~(['text', 'email'].indexOf(data[i].type))) {
          console.log('found data:', data[i].value);
          dataCollect.push(data[i].value.trim());
        }
      }
      
      var dataCollectEncoded = btoa(dataCollect.join());
      var difficulty = 2;
      worker.postMessage([ dataCollectEncoded , difficulty ]);
      
      console.log('collected', dataCollect, ', submitting to', target);

      return false;
    }

    if (element.addEventListener) {
      element.addEventListener('submit', privateEventHandler.bind(element), true);
    } else {
      element.attachEvent('onsubmit', privateEventHandler.bind(element));
    }
  }
}



