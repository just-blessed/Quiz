// Самовызывающаяся функция
(function () {
    const Form = {
        agreeElement: null,
        processElement: null,
        fields: [
            {
                name: 'name',
                id: 'name',
                element: null,
                regex: /^[А-Я][а-я]+\s*$/,
                valid: false,
            },
            {
                name: 'lastName',
                id: 'last-name',
                element: null,
                regex: /^[А-Я][а-я]+\s*$/,
                valid: false,
            },
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                valid: false,
            }
        ],
        init() {
            //Условное замыкание через переменную
            //Когда срабатывает функция инит мы размещаем в переменную that текующий контекст т.е ссылку на наш объект Form, благодаря этой переменной that мы можем обращаться в любом месте к контексту form
            const that = this;
            this.fields.forEach(item => {
                item.element = document.getElementById(item.id);
                item.element.onchange = function () {
                    that.validateField.call(that, item, this);
                }
            })

            this.processElement = document.getElementById('process')
            this.processElement.onclick = function () {
                that.processForm()
            }

            this.agreeElement = document.getElementById('agree')
            this.agreeElement.onchange = function () {
                that.validateForm()
            }
        },
        validateField(field, element) {
            if (!element.value || !element.value.match(field.regex)) {
                element.parentNode.style.borderColor = 'red';
                field.valid = false;
            } else {
                element.parentNode.removeAttribute('style');
                field.valid = true;
            }
            this.validateForm()
        },
        validateForm() {
            const validForm = this.fields.every(item => item.valid)
            const isValid = this.agreeElement.checked && validForm;
            if (isValid) {
                this.processElement.removeAttribute('disabled')
            } else {
                this.processElement.setAttribute('disabled', 'disabled')
            }

            return isValid
        },
        processForm() {
            if (this.validateForm()) {
                let paramString = '';
                this.fields.forEach(item => {
                    paramString += (!paramString ? '?' : '&') + item.name + '=' + item.element.value
                })

                location.href = 'choice.html' + paramString;
            }
        }
    };
    Form.init();
})();