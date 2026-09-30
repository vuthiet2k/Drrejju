let isRunning = false

export const debounce1 = (callback, delay) => {
    let timer
    return function () {
        if (isRunning) return
        else {
          clearTimeout(timer)
            isRunning = true
            timer = setTimeout(() => {
                isRunning = false
                callback();
            }, delay)
        }
    }
}


export const  debounce = function (cb, interval, immediate) {
    var timeout;
  
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) cb.apply(context, args);
      };          
  
      var callNow = immediate && !timeout;
  
      clearTimeout(timeout);
      timeout = setTimeout(later, interval);
  
      if (callNow) cb.apply(context, args);
    };
  };