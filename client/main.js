$(function() {
    const destination = `http://localhost:3000/api/chirps`;
    let body = '';

    function doubleDigits(input) {
        if (input.length > 1 || input > 9) {
            return input;
        } else {
            return `0${input}`;
        }
    };

    function tripleDigits(input) {
        if (input.length > 2 || input > 99) {
            return input;
        } else {
            return `0${input}`;
        }
    }

    function Chirp (message, timestamp) {
        this.user = 'Ben';
        this.message = message;
    }

    function parseISOString(s) {
        var b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
      }

    function isSingular(num, str) {
        if (num === 1) {
            return `${num} ${str}`
        } else {
            return `${num} ${str}s`
        }
    }

    function dateDiff (date) {
        let current = new Date();
        let prior = parseISOString(date);
        let diff = current-prior;
        let sec = 1000;
        let min = 60 * sec;
        let hr = 60 * min;
        let day = 24 * hr;
        let mth = 30 * day;
        let yr = (12 * mth) + (5.25 * day)

        if (diff < min) {
            return 'Just now'
        } else if (diff < hr) {
            return `${isSingular(Math.floor(diff/min), 'minute')} ago`
        }   else if (diff < day) {
            return `${isSingular(Math.floor(diff/hr), 'hour')} ago`
        } else if (diff < mth) {
            return `${isSingular(Math.floor(diff/day), 'day')} ago`
        } else if (diff < yr) {
            return `${isSingular(Math.floor(diff/mth), 'month')} ago`
        } else {
            return `${isSingular(Math.floor(diff/yr), 'year')} ago`
        }
    }

    var refresh = function() {
         $.get(destination,function(data) {
            data.reverse().forEach(function(e) {
                $(`#feed`).append(`<li id="${e.id}" class="chirp"></li>`);
                $(`#${e.id}`).append(`<div class="user">${e.user}</div>`);
                $(`#${e.id}`).append(`<span class="delete">x</span>`)
                    .click(function(e) {
                        let op = new Object();
                            op.index = this.id;

                        let deleteChirp = $.ajax({
                            method: 'DELETE',
                            url: destination,
                            data: op,
                            async: true
                        })

                        this.remove();
                    });;
                $(`#${e.id}`).append(`<div class="msg">${e.message}</div>`);
                $(`#${e.id}`).append(`<div class="ts">${dateDiff(e.timestamp)}</div>`);
            });
        })
    }

    refresh();

    $('.field input').keyup(function() {
        if ($(this).val().length == 0)  {
            $('.submit input').attr('disabled', 'disabled');
        } else {
            $('.submit input').removeAttr('disabled');
        }
    });

    $(`#chirp-submit`).click(function(e) {
        e.preventDefault();


        let   chirp = new Chirp($(`#chirp-text`).val());
        let   chirpJSON = JSON.stringify(chirp);

        let postChirp = $.ajax({
                method: 'POST',
                url: destination,
                contentType: "application/json",
                data: chirpJSON,
                async: true,
                complete: function() {
                    $('#feed').empty();
                    refresh();
                }
            })

        $('.submit input').attr('disabled', 'disabled');
        $(`#chirp-text`).val("");
    })
});