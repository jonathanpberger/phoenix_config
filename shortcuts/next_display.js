//////////////////////////// Adapted from https://gist.github.com/danshan/a2039396cfa19ec2379a19feacf05dc0

var mousePositions = {}; // mouse position for window
var activeWindowsTimes = {}; // last active time for window

function setMousePositionCenterForWindow(window) {
    var pos = {
      x: window.topLeft().x + window.frame().width / 2,
      y: window.topLeft().y + window.frame().height / 2
    }
  
    // Phoenix.log(String.format('move mouse to pos for {0} x: {1}, y: {2}', window.app().name(), pos.x, pos.y));
    Mouse.move(pos);
    heartbeatWindow(window);
  }

function heartbeatWindow(window) {
    activeWindowsTimes[window.app().pid] = new Date().getTime() / 1000;
  }

function restoreMousePositionForWindow(window) {
    var pos = mousePositions[window.hash()];
    var rect = window.frame();
    if (!mousePositions[window.hash()]) {
      setMousePositionCenterForWindow(window);
      return;
    }
    if (pos.x < rect.x || pos.x > (rect.x + rect.width) || pos.y < rect.y || pos.y > (rect.y + rect.height)) {
      setMousePositionCenterForWindow(window);
      return;
    }
    Phoenix.log(String.format('move mouse to pos for {0} x: {1}, y: {2}', window.app().name(), pos.x, pos.y));
    Mouse.move(pos);
    heartbeatWindow(window);
  }

function moveToScreen(window, screen) {
    if (!window) return;
    if (!screen) return;
  
    var frame = window.frame();
    var oldScreenRect = window.screen().flippedVisibleFrame();
    var newScreenRect = screen.flippedVisibleFrame();
    var xRatio = newScreenRect.width / oldScreenRect.width;
    var yRatio = newScreenRect.height / oldScreenRect.height;
  
    var mid_pos_x = frame.x + Math.round(0.5 * frame.width);
    var mid_pos_y = frame.y + Math.round(0.5 * frame.height);
  
    window.setFrame({
      x: (mid_pos_x - oldScreenRect.x) * xRatio + newScreenRect.x - 0.5 * frame.width,
      y: (mid_pos_y - oldScreenRect.y) * yRatio + newScreenRect.y - 0.5 * frame.height,
      width: frame.width,
      height: frame.height
    });
  };

function getCurrentWindow() {
    var window = Window.focused();
    if (!window) {
      window = App.focused().mainWindow();
    }
    if (!window) return;
    return window;
  }

function moveToNextScreen() {
    var window = getCurrentWindow();
    if (!window) return;
  
    if (window.screen() === window.screen().next()) return;
    moveToScreen(window, window.screen().next());
    restoreMousePositionForWindow(window);
    window.focus();
  }

// Move current window to next screen
Key.on('n', HYPER, function () { moveToNextScreen(); });