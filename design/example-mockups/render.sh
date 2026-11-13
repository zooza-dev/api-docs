#!/usr/bin/env bash
# Renders design-variant mockups to static/img/examples/ with headless Chrome.
# Usage: design/example-mockups/render.sh [name ...]   (no args = all)
# Each entry: <html file>:<theme>:<height>:<output png>
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ENTRIES=(
  "profile-a:movers:830:profile-dashboard-movers"
  "profile-b:nord:770:profile-account-nord"
  "profile-c:splash:800:profile-mobile-splash"
  "contact-a:movers:890:contact-split-movers"
  "contact-b:nord:700:contact-footer-nord"
  "contact-c:splash:1010:contact-location-splash"
  "checkout-a:movers:790:checkout-pricing-movers"
  "checkout-b:nord:940:checkout-embedded-nord"
  "checkout-c:splash:800:checkout-thankyou-splash"
  "calendar-a:movers:760:calendar-week-movers"
  "calendar-b:nord:900:calendar-month-nord"
  "calendar-c:splash:710:calendar-list-splash"
  "map-a:movers:900:map-stacked-movers"
  "map-b:nord:820:map-split-nord"
  "map-c:splash:800:map-mobile-splash"
)
for e in "${ENTRIES[@]}"; do
  IFS=: read -r file theme height out <<< "$e"
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $file " ]]; then continue; fi
  [ -f "design/example-mockups/$file.html" ] || continue
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1280,"$height" --screenshot="static/img/examples/$out.png" \
    "file://$PWD/design/example-mockups/$file.html?theme=$theme" 2>/dev/null
  echo "rendered $out.png"
done
