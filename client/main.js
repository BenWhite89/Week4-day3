$(function() {
    const destination = `http://localhost:3000/api/chirps`;
    const destUsers = 'http://localhost:3000/api/users';
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

    function Chirp (user, message) {
        this.user = user;
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

    var users = function() {
        $.get(destUsers, function(data) {
            data.forEach(function(e) {
                $(`#users`).append($(`<option></option>`)
                    .attr("value", e.id)
                    .text(e.user));
            })
        })
    }

    users();

    var createChirp = function(id, user, message, timestamp) {
        $(`#feed`).append(`<li id="${id}" class="chirp"></li>`);
        $(`#${id}`).append(`<div class="user">${user}</div>`);
        $(`#${id}`).append(`<span class="delete" id="class${id}">x</span>`);
        $(`#class${id}`).click(function(e) {
                let op = new Object();
                op.index = this.parentElement.id;

                let deleteChirp = $.ajax({
                    method: 'DELETE',
                    url: destination,
                    data: op,
                    async: true
                })

                this.parentElement.remove();
            });
        $(`#${id}`).append(`<div class="msg">${message}</div>`);
        $(`#${id}`).append(`<span class="update" id="update${id}">Update</span>`);
        $(`#update${id}`).click(function(e) {
                $(`.modal`).css('display', 'block');
                $(`.update-form`).attr('id',`form${id}`);
            });
        $(`#${id}`).append(`<span class="ts">${dateDiff(timestamp)}</span>`);
    }

    var refresh = function() {
         $.get(destination,function(data) {
            data.reverse().forEach(function(e) {
                let id = e.id;
                let user = e.user;
                let message = e.message;
                let timestamp = e.timestamp

                createChirp(id, user, message, timestamp);

                // $(`#feed`).append(`<li id="${e.id}" class="chirp"></li>`);
                // $(`#${e.id}`).append(`<div class="user">${e.user}</div>`);
                // $(`#${e.id}`).append(`<span class="delete" id="class${e.id}">x</span>`);
                // $(`#class${e.id}`).click(function(e) {
                //         let op = new Object();
                //         op.index = this.parentElement.id;

                //         let deleteChirp = $.ajax({
                //             method: 'DELETE',
                //             url: destination,
                //             data: op,
                //             async: true
                //         })

                //         this.parentElement.remove();
                //     });
                // $(`#${e.id}`).append(`<div class="msg">${e.message}</div>`);
                // $(`#${e.id}`).append(`<span class="update" id="update${e.id}">Update</span>`);
                // $(`#update${e.id}`).click(function(e) {
                //         $(`.modal`).css('display', 'block');
                //         $(`.update-form`).attr('id',`form${id}`);
                //     });
                // $(`#${e.id}`).append(`<span class="ts">${dateDiff(e.timestamp)}</span>`);
            });
        })
    }

    refresh();

    $('.field1 input').keyup(function() {
        if ($(this).val().length == 0)  {
            $('.submit1 input').attr('disabled', 'disabled');
        } else {
            $('.submit1 input').removeAttr('disabled');
        }
    });

    $('.field2 input').keyup(function() {
        if ($('#user-text').val().length != 0 && $('#email-text').val().length != 0)  {
            $('.submit2 input').removeAttr('disabled');
        } else {
            $('.submit2 input').attr('disabled', 'disabled');
        }
    });

    $('.update-text').keyup(function() {
        if($(this).val().length == 0) {
            $('.update-submit').attr('disabled', 'disabled');
        } else {
            $('.update-submit').removeAttr('disabled');
        }
    });

    $(`#chirp-submit`).click(function(e) {
        e.preventDefault();

        let usr = $(`#users`).find(":selected").attr('value');
        let msg = $(`#chirp-text`).val();
        let chirp = new Chirp(usr,msg);
        let chirpJSON = JSON.stringify(chirp);

        let postChirp = $.ajax({
                method: 'POST',
                url: destination,
                contentType: "application/json",
                data: chirpJSON,
                async: true,
                success: function() {
                    $('#feed').empty();
                    refresh();
                }
            });
        $('.submit1 input').attr('disabled', 'disabled');
        $(`#chirp-text`).val("");
    })

    $(`#user-submit`).click(function(e) {
        e.preventDefault();

        let usr = $(`#user-text`).val();
        let eml = $(`#email-text`).val();
        let usrObj = {user: usr, email: eml};
        let usrJSON = JSON.stringify(usrObj);

        let addUser = $.ajax({
            method: 'POST',
            url: destUsers,
            contentType: "application/json",
            data: usrJSON,
            success: function() {
                $(`#users`).empty();
                users();
            }
        })

        $('.submit2 input').attr('disabled', 'disabled');
        $('#user-text').val('');
        $('#email-text').val('');

    })

    $(`.update-submit`).click(function(e) {
        e.preventDefault();

        let id = $(`.update-form`).attr('id').substr(4);
        let text = $(`.update-text`).val();

        if (text != null) {
            let op = new Object();
            op.index = id;
            op.message = text;

            let updateChirp = $.ajax({
                method: 'PATCH',
                url: destination,
                data: op
            })
        };

        $(`#${id} .msg`).text(text);
        $(`.update-text`).text('');
        $(`.modal`).css('display', 'none');
    });

    $(`.update-cancel`).click(function(e) {
        e.preventDefault();

        $(`.update-text`).val('');
        $(`.update-submit`).attr('disabled','disabled');
        $(`.modal`).css('display', 'none');
    })
});