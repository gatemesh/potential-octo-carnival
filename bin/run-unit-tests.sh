#!/usr/bin/env bash
# Run all C++ unit tests using PlatformIO native_test environment
set -e
pio test -e native_test
