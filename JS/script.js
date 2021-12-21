var $table = $('#receiptsTbl')
var $form = $('#receiptsForm')
var index = 0;
var signaturePad, canvas;
$(function() {
    $table.bootstrapTable();

    canvas = document.querySelector("canvas");
    signaturePad = new SignaturePad(canvas);

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
        var holders = data.Holder.split("\r\n");
        var tempNos = BuildNos(data.LastNo)
        var dataArr = [];
        for(var single in holders)
        {
           /* var builded = data;
            builded.Holder = holders[single];
            builded.No = tempNos;*/
            
           var builded = {
                "LastNo": tempNos,
                "Date": data.Date,
                "Holder": holders[single],
                "Reason": data.Reason,
                "Price": data.Price,
                "Total": data.Total,
                "No": tempNos
            };
            console.log(builded);
            dataArr.push(builded);
            tempNos = IncreaseNos(tempNos);
        }
        console.log(dataArr)
        $table.bootstrapTable('append', dataArr);
        
        document.getElementsByName("LastNo")[0].value = tempNos;
        
        return false;
    })

    $("#printReceipts").on("click", () => {
        var ret = addSignatureToTemplate();
        if (ret) {
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
                    downloadURI(dataUrl, elem.getAttribute("data-id"));
                    elem.remove();
                })
            });
        }

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

function BuildNos(value) {
    if(value == "") value = "0";

    var intvalue = parseInt((/([0-9]){1,}/g.exec(value))[0]) ;
    var paddedVal = pad(intvalue,5);
    var newVal = value.replace(/([0-9]){1,}/, paddedVal);
    return newVal;
}

function IncreaseNos(value) {
    var intvalue = parseInt((/([0-9]){1,}/g.exec(value))[0]) + 1;
    var paddedVal = pad(intvalue,5);
    var newVal = value.replace(/([0-9]){1,}/, paddedVal);
    return newVal;
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



function addSignatureToTemplate() {
    if (signaturePad.isEmpty()) {
        alert("Please provide a signature first.");
        return false;
    }

    var data = signaturePad.toDataURL('image/png');
    document.getElementById("ReceiptSignature").src = data;
    return true;
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
    $("#ImportExistingSignature").val("")
    ClearSignaturePad()
    $("#ImportExistingSignature").click();
}

$("#ImportExistingSignature").on("change", function() {
    var reader = new FileReader();
    reader.onload = imageIsLoaded;
    reader.readAsDataURL($("#ImportExistingSignature")[0].files[0]);

})

function imageIsLoaded(e) {
    if (e.target.result.length > 0)
        signaturePad.fromDataURL(e.target.result, { ratio: 1 });
}