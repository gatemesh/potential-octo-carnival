// Small compatibility header that's force-included by PlatformIO for Arduino-based builds.
// It includes <Arduino.h> when available so third-party headers see Arduino core symbols
// (Serial, LSBFIRST, etc.) without requiring individual files to add the include.
#ifndef ARDUINO_COMPAT_H
#define ARDUINO_COMPAT_H

// Include Arduino.h first to get all standard definitions
#if defined(__has_include)
#  if __has_include(<Arduino.h>)
#    include <Arduino.h>
#  endif
#else
// Fallback: try to include Arduino.h; if not available the build will show the error.
#  include <Arduino.h>
#endif

#endif // ARDUINO_COMPAT_H
