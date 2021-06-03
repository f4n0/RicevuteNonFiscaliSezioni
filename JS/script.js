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
        var ultimoNr = parseInt(data.UltimoNr);
        if (isNaN(ultimoNr)) ultimoNr = 0;

        if ((index == 0) || (index < parseInt(data.UltimoNr)))
            index = ultimoNr + 1;
        console.log(data);
        data.nr = BuildNos();
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
            console.log(elem);
            var useWidth = elem.scrollWidth;
            var useHeight = elem.scrollHeight;
            domtoimage.toPng(elem).then(function (dataUrl) {
                $("#Links").append("<a download='" + elem.getAttribute("data-id") + "' href='" + dataUrl + "'>" + elem.getAttribute("data-id") + "</a><br>");
                elem.remove();
            })
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
            tmpElement.append(data[element]["totale"] + '\t\n');
        }
        tmpElement.appendTo($('body')).focus().select();
        document.execCommand("copy");
        tmpElement.remove();
    });


})

function BuildNos() {
    return pad(index, 5)
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
