(function () {
    const test = {
        progressBarElement: null,
        passButtonElement: null,
        nextButtonElement: null,
        prevButtonElement: null,
        quiz: null,
        questionElement: null,
        options: null,
        currentQuestionIndex: 1,
        userResult: [],
        init() {
            checkUserData();
            const url = new URL(location.href);
            const testId = url.searchParams.get('id');

            if (testId) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://testologia.ru/get-quiz?id=' + testId, false)
                xhr.send();
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = 'index.html';
                    }
                    this.startQuiz();
                } else {
                    location.href = 'index.html';
                }

            } else {
                location.href = 'index.html'
            }
        },
        startQuiz() {
            this.progressBarElement = document.getElementById('progress-bar');
            this.questionElement = document.getElementById('title');
            this.optionsElement = document.getElementById('options');
            this.nextButtonElement = document.getElementById('next');
            this.nextButtonElement.onclick = this.move.bind(this, 'next');
            this.passButtonElement = document.getElementById('pass');
            this.passButtonElement.onclick = this.move.bind(this, 'pass');
            this.prevButtonElement = document.getElementById('prev');
            this.prevButtonElement.onclick = this.move.bind(this, 'prev');
            document.getElementById('pre-title').innerText = this.quiz.name;

            this.prepareProgressBar();
            this.showQuestion();

            const timerElement = document.getElementById('timer')
            let seconds = 59;
            const interval = setInterval(function () {
                seconds--;
                timerElement.innerText = seconds;

                if (seconds === 0) {
                    clearInterval(interval);
                    //this тут работать не будет по этому мы делаем замыкание биндим т.е передаем вместе с функцией контекст(Ибо для таймера браузер изменяет this на window)
                    this.complete();
                }
            }.bind(this), 1000)
        },
        //Динамический прогресс бар
        prepareProgressBar() {
            //Проходимся по нашим вопросам

            for (let i = 0; i < this.quiz.questions.length; i++) {
                const itemElement = document.createElement('div');
                itemElement.className = 'test-progress-bar-item ' + (i === 0 ? 'active' : '');

                const itemCircleElement = document.createElement('div');
                itemCircleElement.className = 'test-progress-bar-item-circle';

                const itemTextElement = document.createElement('div');
                itemTextElement.className = 'test-progress-bar-item-text';
                itemTextElement.innerText = 'Вопрос ' + (i + 1);

                itemElement.appendChild(itemCircleElement);
                itemElement.appendChild(itemTextElement);

                this.progressBarElement.appendChild(itemElement);

            }
        },
        //Вывод вопросов
        showQuestion() {
            // -1 задается так как у нас задан индекс 1 а в массиве исчесления начинаются с 0 индекса
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

            this.questionElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ':</span> ' + activeQuestion.question;

            this.optionsElement.innerHTML = '';
            const that = this;
            const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
            activeQuestion.answers.forEach(answer => {
                const optionElement = document.createElement('div');
                optionElement.className = 'test-question-option';

                const inputId = 'answer-' + answer.id

                const inputElement = document.createElement('input');
                inputElement.className = 'option-answer';
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', 'answer');
                inputElement.setAttribute('value', answer.id);

                if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                    inputElement.setAttribute('checked', 'check');
                }

                inputElement.onchange = function () {
                    that.chooseAnswer();
                }

                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;


                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);

                this.optionsElement.appendChild(optionElement);

            });

            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled');
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled');
            }
            if (this.currentQuestionIndex === this.quiz.questions.lengths) {
                this.nextButtonElement.innerText = 'Завершить';
            } else {
                this.nextButtonElement.innerText = 'Далее';
            }
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        },
        chooseAnswer() {
            this.nextButtonElement.removeAttribute('disabled')
        },
        move(action) {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            //Превращаем коллекцию в массив
            const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {
                return element.checked;
            });

            let chosenAnswerId = null;
            if (chosenAnswer && chosenAnswer.value) {
                chosenAnswerId = Number(chosenAnswer.value);
            }
            //чтобы не было многозначительных записей при каждом пролистывании вперед или назад, мы проверяем перед тем как пушить userResult это все для того чтобы не дублировать результат.
            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id
            });
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId
                })
            }

            if (action === 'next' || action === 'pass') {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            if (this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();
                return;
            }

            //Проходимся по всем элементам чтобы прогресс бар двигался за вопросом
            Array.from(this.progressBarElement.children).forEach((item, index) => {
                const currentItemIndex = index + 1

                item.classList.remove('complete')
                item.classList.remove('active')

                if (currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }
            })

            this.showQuestion();
        },
        complete() {
            const url = new URL(location.href);
            const id = url.searchParams.get('id');
            const name = url.searchParams.get('name');
            const lastName = url.searchParams.get('lastName');
            const email = url.searchParams.get('email');

            // запрос на сервер
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://testologia.ru/pass-quiz?id=' + id, false);
            //для того чтобы отправить на сервер JSON
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify({
                name: name,
                lastName: lastName,
                email: email,
                results: this.userResult
            }));

            if (xhr.status === 200 && xhr.responseText) {
                let result = null;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
               if (result) {
                   location.href = 'result.html?score=' + result.score + '&total=' + result.total;
               }
            } else {
                location.href = 'index.html';
            }
        }
    }
    test.init();
})();