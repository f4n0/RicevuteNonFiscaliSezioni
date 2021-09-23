var $table = $('#receiptsTbl')
var $form = $('#receiptsForm')
var index = 0;
$(function() {
    $table.bootstrapTable();

    let OldSignature = localStorage.getItem("Signature");
    if (OldSignature) {
        signaturePad.fromDataURL(OldSignature);
    }

    $("#datepicker").datepicker({
        dateFormat: 'dd/mm/yy'
    }).datepicker("setDate", new Date());

    $form.on("submit", (event) => {
        event.preventDefault();
        var data = getFormData($form);
        var LastNo = parseInt(data.LastNo);
        if (isNaN(LastNo)) LastNo = 0;

        if ((index == 0) || (index < parseInt(data.LastNo)))
            index = LastNo;
        data.No = BuildNos();
        $table.bootstrapTable('insertRow', {
            index: index,
            row: data
        });
        index++;
        return false;
    })

    $("#printReceipts").on("click", () => {
        addSignatureToTemplate();
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
            var useWidth = elem.scrollWidth;
            var useHeight = elem.scrollHeight;
            var options = {
                width: useWidth,
                height: useHeight
            }
            domtoimage.toPng(elem, options).then(function(dataUrl) {
                // $("#Links").append("<a download='" + elem.getAttribute("data-id") + "' href='" + dataUrl + "'>" + elem.getAttribute("data-id") + "</a><br>");
                downloadURI(dataUrl, elem.getAttribute("data-id"));
                elem.remove();
            })
        });


        // var ele = $("#Links a");
        // ele.each(elem => ele[elem].click())

    });

    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }

    $("#CopyExcel").click(function() {
        let tmpElement = $('<textarea style="opacity:0;"></textarea>');
        var data = $table.bootstrapTable('getData');
        for (var element in data) {
            tmpElement.append(data[element]["No"] + '\t');
            tmpElement.append(data[element]["Date"] + '\t');
            tmpElement.append(data[element]["Reason"] + '\t');
            tmpElement.append(data[element]["Total"] + '\t\n');
        }
        tmpElement.appendTo($('body')).focus().select();
        document.execCommand("copy");
        tmpElement.remove();
    });

    $('input[name="Total"]').on('input', function() {
        let tot = $('input[name="Total"]').val();
        $('input[name="Price"]').val(sgart.convNumLett(tot, false, false));

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

// start signature

var canvas = document.querySelector("canvas");

var signaturePad = new SignaturePad(canvas);

function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}

window.onresize = resizeCanvas;
resizeCanvas();

function addSignatureToTemplate() {
    if (signaturePad.isEmpty()) {
        return alert("Please provide a signature first.");
    }

    var data = signaturePad.toDataURL('image/png');
    console.log(data);
    document.getElementById("ReceiptSignature").src = data;
}

function ClearSignaturePad() {
    signaturePad.clear();
    localStorage.removeItem("Signature");
}

function SaveSignature() {
    if (signaturePad.isEmpty()) {
        return alert("Please provide a signature first.");
    }

    var data = signaturePad.toDataURL('image/png');
    localStorage.setItem("Signature", data);
}

function ImportSignature() {
    ClearSignaturePad()
    $("#ImportExistingSignature").click();
}

$("#ImportExistingSignature").on("change", function() {
    var reader = new FileReader();
    reader.onload = imageIsLoaded;
    reader.readAsDataURL($("#ImportExistingSignature")[0].files[0]);

})

function imageIsLoaded(e) {
    signaturePad.fromDataURL(e.target.result);
}