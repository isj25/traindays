/* ==========================================
   Station search widgets.
   Sends the chosen route to the redBus train list.

   Two layouts share this file:
   - station pages: fixed source via data-src-code, one destination field
   - pages/trains-search.html: source and destination fields

   Requires js/stations-data.js (window.RBD_STATIONS).
   ========================================== */

(function () {
    var MAX_SUGGESTIONS = 8;
    var SEARCH_URL = 'https://www.redbus.in/railways/search';

    // Our station list still carries a few pre-rename codes/names. Keys are the
    // codes in the dataset: OUTGOING is what redBus expects in the URL, TERMS
    // are extra strings people are likely to type for that station.
    var OUTGOING_CODE = { CSTM: 'CSMT' };
    var EXTRA_TERMS = { CSTM: 'csmt chhatrapati shivaji maharaj terminus mumbai' };

    var widgets = document.querySelectorAll('[data-station-search]');
    if (!widgets.length) return;

    var stations = (window.RBD_STATIONS || []).map(function (row) {
        var code = row[0];
        var name = row[1];
        var city = row[2] || row[1];
        return {
            code: code,
            outgoingCode: OUTGOING_CODE[code] || code,
            name: name,
            city: city,
            label: name + ' - ' + code,
            lcCode: code.toLowerCase(),
            lcName: name.toLowerCase(),
            lcCity: city.toLowerCase(),
            terms: EXTRA_TERMS[code] || ''
        };
    });

    function rank(station, q) {
        if (station.lcCode === q) return 0;
        if (station.lcCode.indexOf(q) === 0) return 1;
        if (station.lcName.indexOf(q) === 0) return 2;
        if (station.lcName.indexOf(q) !== -1) return 3;
        if (station.lcCity.indexOf(q) !== -1) return 4;
        if (station.terms && station.terms.indexOf(q) !== -1) return 5;
        return -1;
    }

    function search(q, excludedCode) {
        var scored = [];
        for (var i = 0; i < stations.length; i++) {
            var station = stations[i];
            if (station.code === excludedCode) continue;
            var score = rank(station, q);
            if (score !== -1) scored.push({ score: score, station: station });
        }
        scored.sort(function (a, b) {
            return a.score - b.score || a.station.name.length - b.station.name.length;
        });
        return scored.slice(0, MAX_SUGGESTIONS).map(function (item) {
            return item.station;
        });
    }

    function byCode(code) {
        if (!code) return null;
        var wanted = String(code).toLowerCase();
        for (var i = 0; i < stations.length; i++) {
            if (stations[i].lcCode === wanted || stations[i].outgoingCode.toLowerCase() === wanted) {
                return stations[i];
            }
        }
        return null;
    }

    /**
     * Type-ahead over the station list. `excluded` returns the code that must
     * not be offered, so a route cannot start and end at the same station.
     */
    function Autocomplete(input, list, excluded) {
        var chosen = null;
        var matches = [];
        var activeIndex = -1;

        function close() {
            list.hidden = true;
            list.innerHTML = '';
            input.setAttribute('aria-expanded', 'false');
            activeIndex = -1;
            matches = [];
        }

        function highlight() {
            for (var i = 0; i < list.children.length; i++) {
                var isActive = i === activeIndex;
                list.children[i].classList.toggle('is-active', isActive);
                list.children[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
            }
        }

        function pick(station) {
            chosen = station;
            input.value = station.label;
            close();
        }

        function render(found) {
            matches = found;
            if (!found.length) {
                close();
                return;
            }

            list.innerHTML = '';
            found.forEach(function (station, index) {
                var option = document.createElement('li');
                option.className = 'dest-suggestion';
                option.setAttribute('role', 'option');
                option.setAttribute('aria-selected', 'false');
                option.textContent = station.label;
                if (station.city !== station.name) {
                    var city = document.createElement('span');
                    city.className = 'dest-suggestion-city';
                    city.textContent = station.city;
                    option.appendChild(city);
                }
                option.addEventListener('mousedown', function (event) {
                    event.preventDefault();
                    pick(station);
                });
                option.addEventListener('mouseenter', function () {
                    activeIndex = index;
                    highlight();
                });
                list.appendChild(option);
            });

            list.hidden = false;
            input.setAttribute('aria-expanded', 'true');
            activeIndex = -1;
        }

        input.addEventListener('input', function () {
            chosen = null;
            var q = input.value.trim().toLowerCase();
            if (q.length < 2) {
                close();
                return;
            }
            render(search(q, excluded()));
        });

        input.addEventListener('keydown', function (event) {
            if (list.hidden || !matches.length) return;

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                activeIndex = (activeIndex + 1) % matches.length;
                highlight();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                activeIndex = activeIndex <= 0 ? matches.length - 1 : activeIndex - 1;
                highlight();
            } else if (event.key === 'Enter' && activeIndex > -1) {
                event.preventDefault();
                pick(matches[activeIndex]);
            } else if (event.key === 'Escape') {
                close();
            }
        });

        input.addEventListener('blur', function () {
            window.setTimeout(close, 120);
        });

        return {
            input: input,
            close: close,
            set: pick,
            clear: function () {
                chosen = null;
                input.value = '';
            },
            code: function () {
                return chosen ? chosen.code : null;
            },
            resolve: function () {
                if (chosen && input.value.trim() === chosen.label) return chosen;

                var typed = input.value.trim().toLowerCase();
                if (!typed) return null;

                for (var i = 0; i < stations.length; i++) {
                    var station = stations[i];
                    if (station.code === excluded()) continue;
                    if (typed === station.lcCode || typed === station.lcName ||
                        typed === station.label.toLowerCase() ||
                        typed === station.outgoingCode.toLowerCase()) {
                        return station;
                    }
                }

                var found = search(typed, excluded());
                return found.length === 1 ? found[0] : null;
            }
        };
    }

    function setup(widget) {
        var form = widget.querySelector('.train-search-form');
        var error = widget.querySelector('.dest-error');
        var fixedSourceCode = widget.getAttribute('data-src-code');

        var sourceInput = widget.querySelector('[data-role="source"]');
        var destInput = widget.querySelector('[data-role="destination"]');
        if (!form || !destInput) return;

        var source = null;
        var destination = Autocomplete(
            destInput,
            widget.querySelector('[data-role="destination-suggestions"]'),
            function () {
                return source ? source.code() : fixedSourceCode;
            }
        );

        if (sourceInput) {
            source = Autocomplete(
                sourceInput,
                widget.querySelector('[data-role="source-suggestions"]'),
                function () {
                    return destination.code();
                }
            );
        }

        function showError(message, field) {
            error.hidden = false;
            error.textContent = message;
            if (field) field.focus();
        }

        function hideError() {
            error.hidden = true;
            error.textContent = '';
        }

        var swap = widget.querySelector('[data-role="swap"]');
        if (swap && source) {
            swap.addEventListener('click', function () {
                var from = source.resolve();
                var to = destination.resolve();
                var fromText = source.input.value;
                var toText = destination.input.value;

                source.clear();
                destination.clear();
                if (to) source.set(to); else source.input.value = toText;
                if (from) destination.set(from); else destination.input.value = fromText;
                hideError();
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            destination.close();
            if (source) source.close();

            if (!stations.length) {
                showError('Station list is still loading. Please try again in a moment.');
                return;
            }

            var from = source ? source.resolve() : byCode(fixedSourceCode);
            if (!from) {
                showError('Pick a source station from the suggestions.', source && source.input);
                return;
            }

            var to = destination.resolve();
            if (!to) {
                showError('Pick a destination station from the suggestions.', destination.input);
                return;
            }

            if (from.code === to.code) {
                showError('Source and destination cannot be the same station.', destination.input);
                return;
            }

            hideError();
            window.open(
                SEARCH_URL + '?src=' + encodeURIComponent(from.outgoingCode) +
                '&dst=' + encodeURIComponent(to.outgoingCode),
                '_blank',
                'noopener'
            );
        });

        // Allow deep links such as trains-search.html?src=KT&dst=MAO
        var params = new URLSearchParams(window.location.search);
        if (source) {
            var presetSource = byCode(params.get('src'));
            if (presetSource) source.set(presetSource);
        }
        var presetDest = byCode(params.get('dst'));
        if (presetDest && presetDest.code !== fixedSourceCode) destination.set(presetDest);
    }

    Array.prototype.forEach.call(widgets, setup);
})();
