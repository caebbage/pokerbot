var ipc = require('electron').ipcRenderer;
window.$ = window.jQuery = require('jquery');



var pages = {
  // main page
  'main': function() {
    $('#btn').on('click', () => {ipc.send('setRegion');});

    ipc.on('img', (e, img) => {
      $('.content').append("img src='" + img + "' />")
    });
  },
  // region selection window
  'setRegion': function() {
    var x1, y1, x2, y2;
    var area;
    $('body').append("<div id='select'></div>");
    $('#select').append("<div class='tray'><button id='yes'></button><button id='retry'></button><button id='no'></button></div>");
    $('.tray').css('display','none');
    let rect = $('#select');
    var confirming = false;


    $('body').on('mousedown', e => {
      if (!confirming) {
        x1 = e.pageX; x2 = e.pageX;
        y1 = e.pageY; y2 = e.pageY;
        rect.css('left', x1 + 'px').css('top', y1 + 'px').css('width','').css('height','');

        $('body').on('mousemove', e => {
          x2 = e.pageX; y2 = e.pageY;
          area = findRect(x1, y1, x2, y2);
          rect.css('left', area.x + 'px').css('top', area.y + 'px')
          .css('width', area.width + 'px').css('height', area.height + 'px');
        });
      };
    }).on('mouseup', () => {
      if (!confirming) {
        $('body').unbind('mousemove');
        confirming = true;
        $('.tray').css('display','');

        let win = {'x': $(window).width(), 'y': $(window).height()};

        $('.tray').css(
          (((y2 + 40) < win.y) ? 'bottom' :
          ((y1 - 40) > 0) ? 'top' :
          ((x1 - 40) > 0) ? 'left' :'right')
          , "-35px");

          if ($('.tray').attr('style').includes('left') || $('.tray').attr('style').includes('right')) {
            $('.tray').addClass('vertical');
          }
        };
      });

      $('#retry').on('click', () => {
        $('.tray').attr('style', 'display:none;').removeClass('vertical');
        confirming = false;

        $('#select').attr('style','');
      });

      $('#yes').on('click', () => {
        ipc.send('regionSet', area);
      });

      $('#no').on('click', () => {
        ipc.send('return');
      });
    }
  };


  function findRect(x1, y1, x2, y2) {
    return {
      'x': (x1 <= x2) ? x1 : x2,
      'y': (y1 <= y2) ? y1 : y2,
      'width': Math.max(x1, x2) - Math.min(x1, x2),
      'height': Math.max(y1, y2) - Math.min(y1, y2)
    };
  }
