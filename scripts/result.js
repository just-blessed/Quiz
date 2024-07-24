(function () {
    const result = {
        init() {
            const url = new URL(location.href);
            document.getElementById('result-score').innerText = url.searchParams.get('score') +
                '/' + url.searchParams.get('total');
        }
    }
    result.init();
})();