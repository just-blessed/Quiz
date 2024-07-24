// (function () {
//     const choice = {
//         quizzes: [],
//         init () {
//             checkUserData();
//
//             const xhr = new XMLHttpRequest();
//             xhr.open('GET', 'https://testologia.ru/get-quizzes', false);
//             xhr.send();
//
//             if (xhr.status === 200 && xhr.responseText) {
//                 try {
//                   this.quizzes = JSON.parse(xhr.responseText);
//                 } catch (e) {
//                     location.href = 'index.html';
//                 }
//                 this.processQuizzes();
//             } else  {
//                 location.href = 'index.html';
//             }
//         },
//         processQuizzes() {
//             console.log(this.quizzes) //Почему ничего не получаем с сервера ?
//         }
//     }
//
//     choice.init();
// })


(function () {
    const choice = {
        quizzes: [],
        init() {
            checkUserData();

            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.ru/get-quizzes', true); // true для асинхронного запроса
            xhr.onload = function () {
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        choice.quizzes = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = 'index.html';
                    }
                    choice.processQuizzes();
                } else {
                    location.href = 'index.html';
                }
            };
            xhr.send();
        },
        processQuizzes() {
            //Создаем элементы в js чтобы убрать с html все данные
            const choiceOptionsElement = document.getElementById('choice-options')
            if (this.quizzes && this.quizzes.length > 0) {
                this.quizzes.forEach(quiz => {
                    const that = this;
                    const choiceOptionElement = document.createElement('div');
                    choiceOptionElement.className = 'choice-option';
                    //Добавляем айди прямо в верстку
                    choiceOptionElement.setAttribute('data-id', quiz.id)
                    //При клике мы должны достать данные по id чтобы нас перебросило на стр теста
                    choiceOptionElement.onclick = function () {
                        that.chooseQuiz(this);
                    }

                    const choiceOptionTextElement = document.createElement('div');
                    choiceOptionTextElement.className = 'choice-option-text';
                    choiceOptionTextElement.innerText = quiz.name;

                    const choiceOptionArrowElement = document.createElement('div');
                    choiceOptionArrowElement.className = 'choice-option-arrow';

                    const choiceOptionImageElement = document.createElement('img');
                    choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                    choiceOptionImageElement.setAttribute('alt', 'Стрелка');
                    //Делаем вложенность элементов
                    choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                    choiceOptionElement.appendChild(choiceOptionTextElement);
                    choiceOptionElement.appendChild(choiceOptionArrowElement);
                    //Финальная вложенность
                    choiceOptionsElement.appendChild(choiceOptionElement);

                });
            }
        },
        chooseQuiz(element) {
            const dataId = element.getAttribute('data-id');
            if (dataId) {
                location.href = 'test.html' + location.search + '&id=' + dataId;
            }
        }
    };

    choice.init();
})();