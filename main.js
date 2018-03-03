(function main() {
    var MIN_QUERY_LENGTH = 3;
    var DEBOUNCE_TIME = 1000;
    var CRASH_MSG = 'Произошёл сбой, попробуйте обновить страницу';

    var input;
    var query;
    var service;
    var debouncedQuery;
    var predictions = null;

    function renderResults() {
        if (!predictions || resultsElement.innerHTML) {
            return;
        }

        var h2 = document.createElement('h2');
        h2.appendChild(document.createTextNode('Результаты поиска:'));
        resultsElement.appendChild(h2);

        var ul = document.createElement('ul');
        resultsElement.appendChild(ul);

        predictions.forEach(function(prediction) {
            var li = document.createElement('li');
            li.addEventListener('click', handlePredictionClick)
            li.appendChild(document.createTextNode(prediction.description));
            ul.appendChild(li);
        });
    }

    function clearResults() {
        resultsElement.innerHTML = '';
    }

    function handleInput(e) {
        query = e.target.value;

        if (debouncedQuery) {
            clearTimeout(debouncedQuery);
        }

        if (query.length < MIN_QUERY_LENGTH && !resultsElement.innerHTML) {
            return;
        }

        if (query.length < MIN_QUERY_LENGTH && resultsElement.innerHTML) {
            debouncedQuery = setTimeout(clearResults, DEBOUNCE_TIME);
            return;
        }

        debouncedQuery = setTimeout(getQueryPredictions, DEBOUNCE_TIME);
    }

    function getQueryPredictions() {
        service.getQueryPredictions({ input: query }, handleServiceResponse);
    }

    function handlePredictionClick(e) {
        input.value = e.target.innerText;
        clearResults();
    }

    function handleServiceResponse(data, status) {
        clearResults();

        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            var errorMsg = status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS ?
                'Ничего не найдено' :
                'Ошибка: ' + status;

            var span = document.createElement('span');
            span.appendChild(document.createTextNode(errorMsg));
            resultsElement.appendChild(span);
            predictions = null;
            return;
        }

        predictions = data;
        renderResults();
    };

    function initAutocomplete() {
        input = document.getElementById('input');
        resultsElement = document.getElementById('results');

        if (!input || !resultsElement || !window.google) {
            alert(CRASH_MSG);
            return;
        }

        service = new google.maps.places.AutocompleteService();
        if (!service) {
            alert(CRASH_MSG);
            return;
        }

        input.addEventListener('keyup', handleInput);
        input.addEventListener('focus', renderResults);
    }

    document.addEventListener('DOMContentLoaded', initAutocomplete);
})();
