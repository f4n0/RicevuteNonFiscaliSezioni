var $table = $('#RicevuteTbl')
var $form = $('#RicevuteForm')
var index = 0;
$(function() {
    $table.bootstrapTable();
    $("#datepicker").datepicker({
        dateFormat: 'dd/mm/yy'
    });

    $form.on("submit", (event) => {
        event.preventDefault();
        var data = getFormData($form);
        console.log(data);
        data.nr = BuildNos(data.data);
        $table.bootstrapTable('insertRow', {
            index: index,
            row: data
        });
        index++;
        return false;
    })

    $("#printRicevute").on("click", () => {
        var data = $table.bootstrapTable('getData');
        $("#Links").empty();
        var template = $("#template").clone().removeAttr("style").html();
        var $content = $("#all");

        for (var element in data) {
            var edited = template
            Object.keys(data[element]).forEach(val => {
                edited = edited.replaceAll("{{" + val + "}}", data[element][val]);
            })
            $content.append(edited)
        };
        var res = document.getElementById('all').getElementsByClassName('Content')
        Array.prototype.forEach.call(res, function(elem) {
            html2canvas(elem).then(function(canvas) {
                $("#Links").append("<a download='" + elem.getAttribute("data-id") + "' href='" + canvas.toDataURL() + "'>" + elem.getAttribute("data-id") + "</a><br>");
                elem.remove();
            });
        });

    });
    $("#DownloadAll").on("click", () => {
        var ele = $("#Links a");
        ele.each(elem => ele[elem].click())
    });

    $("#CopyExcel").click(function() {
        let tmpElement = $('<textarea style="opacity:0;"></textarea>');
        var data = $table.bootstrapTable('getData');
        for (var element in data) {
            tmpElement.append(data[element]["nr"] + '\t');
            tmpElement.append(data[element]["data"] + '\t');
            tmpElement.append(data[element]["causale"] + '\t');
            tmpElement.append(data[element]["totale"] + '\t\n\r');
        }

        tmpElement.appendTo($('body')).focus().select();
        document.execCommand("copy");
        tmpElement.remove();
    });


})

function BuildNos(data) {
    var splitted = data.split("/");
    return splitted[2] + "-" + splitted[1] + "-" + splitted[0] + "-" + pad(index, 4)
}

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i) {
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}